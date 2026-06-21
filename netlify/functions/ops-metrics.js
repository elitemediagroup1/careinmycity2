/**
 * ops-metrics.js  (Operations Dashboard - Phase 1, data API)
 *
 * Read-only JSON endpoint that powers the internal Operations Dashboard.
 * - NEVER calls Google or any external API.
 * - Reads best-effort counters recorded by places-nearby via ops-metrics-store.
 * - Computes derived KPIs (hit rate, calls saved, cost estimates, projections).
 * - Reflects Local Authority Engine / rollout config from env (safe defaults).
 *
 * ACCESS NOTE (read SECURITY in the PR): this endpoint is gated by a shared
 * token in the OPS_DASHBOARD_TOKEN env var. This is a soft gate suitable for an
 * internal tool; the recommended hardening is Netlify password protection or the
 * existing admin auth in front of /admin/*. No secrets are ever returned.
 */

const store = require("./lib/ops-metrics-store");

// --- Tunables / estimates (request-count based, no billing API yet) ---
var GOOGLE_CALLS_PER_LOOKUP = 2;          // 1 geocode + 1 text search per miss
var COST_PER_1K_TEXTSEARCH = 32;          // USD, Places Text Search (est.)
var COST_PER_1K_GEOCODE = 5;              // USD, Geocoding (est.)
var MONTHLY_BUDGET = Number(process.env.GOOGLE_MONTHLY_BUDGET || 200);

function json(statusCode, payload) {
  return {
    statusCode: statusCode,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
    body: JSON.stringify(payload)
  };
}

function authorized(event) {
  var expected = process.env.OPS_DASHBOARD_TOKEN || "";
  if (!expected) return { ok: false, reason: "no_token_configured" };
  var q = (event.queryStringParameters || {});
  var hdr = (event.headers || {});
  var supplied = q.token || hdr["x-ops-token"] || hdr["X-Ops-Token"] || "";
  if (supplied && supplied === expected) return { ok: true };
  return { ok: false, reason: "unauthorized" };
}

function round(n, d) {
  var f = Math.pow(10, d || 0);
  return Math.round((n || 0) * f) / f;
}

function costFor(lookups) {
  // lookups = number of (geocode + text search) pairs
  var text = (lookups * COST_PER_1K_TEXTSEARCH) / 1000;
  var geo = (lookups * COST_PER_1K_GEOCODE) / 1000;
  return round(text + geo, 2);
}

function buildPlaces(snap) {
  var today = snap.today, month = snap.month;
  var todayReq = (today.hits || 0) + (today.misses || 0);
  var monthReq = (month.hits || 0) + (month.misses || 0);
  var hitRate = monthReq ? (month.hits / monthReq) : 0;
  var avgLatency = month.latencyCount ? (month.latencyMs / month.latencyCount) : 0;
  // A "miss" is a real Google lookup; a "hit" saved one.
  var callsMade = (month.misses || 0) * GOOGLE_CALLS_PER_LOOKUP;
  var callsSaved = (month.hits || 0) * GOOGLE_CALLS_PER_LOOKUP;
  return {
    requestsToday: todayReq,
    requestsThisMonth: monthReq,
    cacheHits: month.hits || 0,
    cacheMisses: month.misses || 0,
    cacheHitRatePct: round(hitRate * 100, 1),
    avgResponseMs: round(avgLatency, 0),
    googleCallsSaved: callsSaved,
    estimatedCacheSavingsUsd: costFor(callsSaved)
  };
}

function buildCacheHealth(snap) {
  return {
    currentTtlHours: 24,
    staleWhileRevalidateHours: 6,
    cacheVersion: "v1",
    oldestEntry: snap.oldestKey,
    newestEntry: snap.newestKey,
    daysWithData: snap.daysWithData,
    status: snap.available ? "active" : "store_unavailable"
  };
}

function buildLae() {
  var pilotOnly = String(process.env.LAE_PILOT_ONLY || "true").toLowerCase() !== "false";
  var pilot = [
    "/state/new-york/staten-island/home-care/",
    "/state/new-jersey/newark/assisted-living/",
    "/state/florida/tampa/home-care/",
    "/state/new-jersey/toms-river/memory-care/"
  ];
  var states = ["new-york", "new-jersey", "florida"];
  var services = ["home-care", "assisted-living", "memory-care"];
  return {
    pilotPagesEnabled: pilot.length,
    pilotPages: pilot,
    statesEnabled: states,
    servicesEnabled: services,
    rolloutStage: pilotOnly ? "pilot" : (process.env.LAE_STAGE || "stage-a"),
    pilotOnly: pilotOnly,
    pagesUsingLae: pilotOnly ? pilot.length : Number(process.env.LAE_PAGE_COUNT || pilot.length)
  };
}

function buildGoogleApi(snap) {
  var m = snap.meta || {};
  return {
    places: { status: snap.available ? "ok" : "unknown" },
    geocoding: { status: snap.available ? "ok" : "unknown" },
    lastSuccess: m.lastSuccessTs || null,
    lastFailure: m.lastFailureTs || null,
    recentErrorCount: m.recentErrors || 0,
    avgLatencyMs: round(snap.month.latencyCount ? snap.month.latencyMs / snap.month.latencyCount : 0, 0)
  };
}

function buildCost(places) {
  var dailyCalls = places.requestsToday ? (places.cacheMisses ? 0 : 0) : 0;
  // Estimate today's real Google calls from today's misses is not in snapshot
  // detail; project from month misses instead.
  var monthMisses = places.cacheMisses;
  var projectedMonthlyCalls = monthMisses * GOOGLE_CALLS_PER_LOOKUP;
  var projectedMonthlyCost = costFor(monthMisses);
  return {
    googleCallsToday: places.requestsToday && places.cacheMisses === 0 ? 0 : null,
    projectedMonthlyCalls: projectedMonthlyCalls,
    projectedMonthlyCostUsd: projectedMonthlyCost,
    estimatedCostSavedByCacheUsd: places.estimatedCacheSavingsUsd,
    budgetUsd: MONTHLY_BUDGET,
    budgetRemainingUsd: round(MONTHLY_BUDGET - projectedMonthlyCost, 2)
  };
}

function buildAlerts(places, googleApi, cacheHealth) {
  var alerts = [];
  if (places.requestsThisMonth >= 50 && places.cacheHitRatePct < 50) {
    alerts.push({ level: "warn", code: "low_cache_hit_rate", msg: "Cache hit rate below 50%." });
  }
  if ((googleApi.recentErrorCount || 0) >= 5) {
    alerts.push({ level: "error", code: "high_error_rate", msg: "Recent Google error count is elevated." });
  }
  if (googleApi.lastFailure && (!googleApi.lastSuccess || googleApi.lastFailure > googleApi.lastSuccess)) {
    alerts.push({ level: "error", code: "google_failure", msg: "Most recent Google call failed." });
  }
  if ((places.avgResponseMs || 0) > 2500) {
    alerts.push({ level: "warn", code: "slow_response", msg: "Average response time is high." });
  }
  if (cacheHealth.status === "store_unavailable") {
    alerts.push({ level: "info", code: "metrics_store_unavailable", msg: "Metrics store not initialized yet (no data recorded)." });
  }
  if (!alerts.length) alerts.push({ level: "ok", code: "all_clear", msg: "No issues detected." });
  return alerts;
}

exports.handler = async function (event) {
  var auth = authorized(event);
  if (!auth.ok) {
    return json(auth.reason === "no_token_configured" ? 503 : 401, {
      ok: false, reason: auth.reason
    });
  }
  var snap;
  try {
    snap = await store.readSnapshot(31);
  } catch (e) {
    snap = { available: false, today: { hits:0,misses:0,errors:0,latencyMs:0,latencyCount:0,byType:{} },
      month: { hits:0,misses:0,errors:0,latencyMs:0,latencyCount:0,byType:{} },
      meta: {}, oldestKey: null, newestKey: null, daysWithData: 0 };
  }
  var places = buildPlaces(snap);
  var cacheHealth = buildCacheHealth(snap);
  var lae = buildLae();
  var googleApi = buildGoogleApi(snap);
  var cost = buildCost(places);
  var alerts = buildAlerts(places, googleApi, cacheHealth);

  return json(200, {
    ok: true,
    generatedAt: new Date().toISOString(),
    storeAvailable: snap.available,
    places: places,
    cacheHealth: cacheHealth,
    localAuthorityEngine: lae,
    googleApi: googleApi,
    rollout: {
      currentStage: lae.rolloutStage,
      stages: ["pilot", "stage-a", "stage-b", "full"],
      statesEnabled: lae.statesEnabled,
      servicesEnabled: lae.servicesEnabled,
      pagesEnabled: lae.pagesUsingLae
    },
    cost: cost,
    alerts: alerts,
    // Phase 2+ widgets are surfaced as "pending" so the UI can show placeholders
    pending: ["carl", "homepageSearch", "searchConsole", "bingWebmaster", "indexNow",
      "adsense", "ga4", "coreWebVitals", "revenue", "affiliate"]
  });
};

/**
 * ops-metrics.js (EMG Platform Command Center - Phase 2, data API)
 *
 * Read-only JSON endpoint that powers the internal EMG Platform Command Center
 * (evolved from the CareInMyCity Operations Dashboard, Phase 1).
 * - NEVER calls Google or any external API.
 * - Reads best-effort counters recorded by places-nearby via ops-metrics-store.
 * - Computes derived KPIs (hit rate, calls saved, cost estimates, projections).
 * - Reflects Local Authority Engine / rollout config from env (safe defaults).
 * - Phase 2 adds platform-level blocks: executive overview, per-property
 *   portfolio, content health, AI (Carl) health, search/SEO and revenue
 *   placeholders, infrastructure status, and a roadmap. Properties other than
 *   CareInMyCity are architected but clearly marked "coming_soon" (no fabricated
 *   numbers).
 *
 * ACCESS NOTE (read SECURITY in the PR): this endpoint is gated by a shared
 * token in the OPS_DASHBOARD_TOKEN env var. This is a soft gate suitable for an
 * internal tool; the recommended hardening is Netlify password protection or the
 * existing admin auth in front of /admin/*. No secrets are ever returned.
 */

const store = require("./lib/ops-metrics-store");

// --- Tunables / estimates (request-count based, no billing API yet) ---
var GOOGLE_CALLS_PER_LOOKUP = 2; // 1 geocode + 1 text search per miss
var COST_PER_1K_TEXTSEARCH = 32; // USD, Places Text Search (est.)
var COST_PER_1K_GEOCODE = 5; // USD, Geocoding (est.)
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
    googleCallsMade: callsMade,
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

// --- Phase 2: platform-level blocks (no fabricated numbers) -----------------

// "coming_soon" placeholder value used everywhere a real integration is pending.
var SOON = null;

function buildExecutive(properties, places, cacheHealth, googleApi, cost) {
  // Aggregate across all registered properties. Only CareInMyCity is live now.
  var live = properties.filter(function (p) { return p.status === "live"; });
  var totalPages = 0;
  live.forEach(function (p) { totalPages += (p.totalPages || 0); });
  var apiOk = googleApi.places.status === "ok" || googleApi.places.status === "unknown";
  var health = "healthy";
  if ((googleApi.recentErrorCount || 0) >= 5) health = "warning";
  if (googleApi.lastFailure && (!googleApi.lastSuccess || googleApi.lastFailure > googleApi.lastSuccess)) health = "warning";
  return {
    activeProperties: live.length,
    registeredProperties: properties.length,
    totalPages: totalPages,
    totalAiConversations: SOON,            // Carl conversation counter is Phase 2+ (no fabricated value)
    googleApiRequests: places.googleCallsMade,
    cacheHitRatePct: places.cacheHitRatePct,
    estimatedInfrastructureCostUsd: cost.projectedMonthlyCostUsd,
    platformHealth: health
  };
}

function buildCareInMyCity(places, cacheHealth, lae, cost) {
  return {
    usersToday: SOON,
    usersThisMonth: SOON,
    providerSearches: places.requestsThisMonth, // proxy: each lookup is a provider search
    carlConversations: SOON,
    homepageSearches: SOON,
    nearMeSearches: SOON,
    googleCalls: places.googleCallsMade,
    cacheHits: places.cacheHits,
    cacheMisses: places.cacheMisses,
    cacheHitRatePct: places.cacheHitRatePct,
    estimatedMonthlyGoogleCostUsd: cost.projectedMonthlyCostUsd,
    estimatedSavingsFromCacheUsd: places.estimatedCacheSavingsUsd,
    laePagesEnabled: lae.pagesUsingLae,
    rolloutStage: lae.rolloutStage,
    indexedPages: SOON,        // Search Console integration pending
    adsenseStatus: SOON,       // AdSense integration pending
    revenue: SOON              // revenue integration pending
  };
}

function buildContentHealth(lae) {
  // Structural counts come from config/LAE; review + word-count are future-ready.
  return {
    totalPages: SOON,           // full sitemap count is a future integration
    states: (lae.statesEnabled || []).length,
    cities: SOON,
    services: (lae.servicesEnabled || []).length,
    pagesUsingLae: lae.pagesUsingLae,
    pagesWithoutLae: SOON,
    pagesReviewed: SOON,
    pagesAwaitingReview: SOON,
    averageWordCount: SOON,
    lastContentUpdate: SOON
  };
}

function buildAiHealth() {
  // Carl telemetry is not yet wired into the metrics store. All future-ready.
  return {
    carl: {
      messagesToday: SOON,
      messagesThisMonth: SOON,
      averageResponseMs: SOON,
      fallbackResponses: SOON,
      providerSearches: SOON,
      providerReusePct: SOON,
      claudeErrors: SOON,
      conversationSuccessPct: SOON,
      averageSessionLength: SOON,
      status: "coming_soon"
    }
  };
}

function buildSearchSeo() {
  return {
    status: "coming_soon",
    note: "Integration Coming Soon",
    metrics: {
      googleSearchConsole: SOON,
      bingWebmasterTools: SOON,
      indexNow: SOON,
      sitemapUrls: SOON,
      indexedUrls: SOON,
      coverageIssues: SOON,
      coreWebVitals: SOON,
      organicClicks: SOON,
      organicImpressions: SOON,
      averagePosition: SOON,
      ctrPct: SOON
    }
  };
}

function buildRevenue() {
  return {
    status: "coming_soon",
    note: "Integration Coming Soon",
    metrics: {
      adsenseRevenue: SOON,
      affiliateRevenue: SOON,
      rpm: SOON,
      revenuePerVisitor: SOON,
      affiliateClicks: SOON,
      conversions: SOON,
      averageEarningsPerVisit: SOON
    }
  };
}

// EMG property registry. Core architecture is property-agnostic: each property
// is a record; only those with status "live" surface real metrics. Adding a new
// EMG property = pushing a new record here (or registering at runtime client
// side via window.EMGDashboard.register).
function buildPortfolio(cimcSummary) {
  return [
    {
      key: "careinmycity",
      name: "CareInMyCity",
      domain: "careinmycity.com",
      status: "live",
      label: "Live",
      summary: cimcSummary
    },
    { key: "petsinmycity", name: "PetsInMyCity", domain: "petsinmycity.com",
      status: "coming_soon", label: "Platform Ready", summary: null },
    { key: "consumersupporthelp", name: "ConsumerSupportHelp", domain: "consumersupporthelp.com",
      status: "coming_soon", label: "Awaiting Integration", summary: null },
    { key: "recruitai", name: "RecruitAI", domain: "recruitai",
      status: "coming_soon", label: "Awaiting Integration", summary: null },
    { key: "future", name: "Future Brands", domain: null,
      status: "coming_soon", label: "Platform Ready", summary: null }
  ];
}

function buildInfrastructure(snap, googleApi) {
  function ind(ok, warn) { return warn ? "warning" : (ok ? "healthy" : "offline"); }
  var storeOk = !!snap.available;
  var googleWarn = (googleApi.recentErrorCount || 0) >= 5 ||
    (googleApi.lastFailure && (!googleApi.lastSuccess || googleApi.lastFailure > googleApi.lastSuccess));
  return {
    netlify: { status: "healthy" },          // serving this response implies up
    functions: { status: "healthy" },
    googleApis: { status: ind(true, googleWarn) },
    claudeApi: { status: "coming_soon" },    // Carl health telemetry pending
    cache: { status: storeOk ? "healthy" : "warning" },
    indexNow: { status: "coming_soon" }
  };
}

function buildRoadmap() {
  // ✅ done, ⏳ in progress / planned. Reflects current platform state.
  return [
    { item: "Foundation", state: "done" },
    { item: "Carl V2", state: "done" },
    { item: "Google Integration", state: "done" },
    { item: "LAE Pilot", state: "done" },
    { item: "Cache", state: "done" },
    { item: "Stage A Rollout", state: "planned" },
    { item: "County Resources", state: "planned" },
    { item: "State Rollout", state: "planned" },
    { item: "National Rollout", state: "planned" },
    { item: "AdSense Approval", state: "planned" }
  ];
}

function buildAlerts(places, googleApi, cacheHealth, cost) {
  var alerts = [];
  if (cost.projectedMonthlyCostUsd > MONTHLY_BUDGET) {
    alerts.push({ level: "warn", code: "high_google_spend", msg: "Projected Google spend exceeds the monthly budget." });
  }
  if (places.requestsThisMonth >= 50 && places.cacheHitRatePct < 50) {
    alerts.push({ level: "warn", code: "low_cache_hit_rate", msg: "Cache hit rate below 50%." });
  }
  if ((googleApi.recentErrorCount || 0) >= 5) {
    alerts.push({ level: "error", code: "google_api_errors", msg: "Recent Google error count is elevated." });
  }
  if (googleApi.lastFailure && (!googleApi.lastSuccess || googleApi.lastFailure > googleApi.lastSuccess)) {
    alerts.push({ level: "error", code: "google_failure", msg: "Most recent Google call failed." });
  }
  if ((places.avgResponseMs || 0) > 2500) {
    alerts.push({ level: "warn", code: "high_latency", msg: "Average response time is high." });
  }
  if (cacheHealth.status === "store_unavailable") {
    alerts.push({ level: "info", code: "metrics_store_unavailable", msg: "Metrics store not initialized yet (no data recorded)." });
  }
  // Future-ready alert classes (inactive until their integrations land):
  // claude_failures, provider_search_failures, search_failures,
  // adsense_issues, search_console_issues.
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

  var careInMyCity = buildCareInMyCity(places, cacheHealth, lae, cost);
  var contentHealth = buildContentHealth(lae);
  var aiHealth = buildAiHealth();
  var searchSeo = buildSearchSeo();
  var revenue = buildRevenue();
  var infrastructure = buildInfrastructure(snap, googleApi);
  var roadmap = buildRoadmap();

  // Per-property summary surfaced inside the portfolio (CareInMyCity only, live).
  var cimcSummary = {
    totalPages: lae.pagesUsingLae,
    googleCalls: places.googleCallsMade,
    cacheHitRatePct: places.cacheHitRatePct,
    estimatedMonthlyCostUsd: cost.projectedMonthlyCostUsd,
    rolloutStage: lae.rolloutStage
  };
  var portfolio = buildPortfolio(cimcSummary);
  var executive = buildExecutive(portfolio, places, cacheHealth, googleApi, cost);
  var alerts = buildAlerts(places, googleApi, cacheHealth, cost);

  return json(200, {
    ok: true,
    schema: "emg-command-center/v2",
    generatedAt: new Date().toISOString(),
    storeAvailable: snap.available,

    // --- Phase 2: platform-level ---
    executive: executive,
    portfolio: portfolio,
    careInMyCity: careInMyCity,
    contentHealth: contentHealth,
    aiHealth: aiHealth,
    searchSeo: searchSeo,
    revenue: revenue,
    infrastructure: infrastructure,
    roadmap: roadmap,

    // --- Phase 1: preserved verbatim (CareInMyCity ops) ---
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
    pending: ["carl", "homepageSearch", "searchConsole", "bingWebmaster", "indexNow",
      "adsense", "ga4", "coreWebVitals", "revenue", "affiliate"]
  });
};

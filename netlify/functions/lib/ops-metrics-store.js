/**
 * ops-metrics-store.js  (Operations Dashboard - Phase 1)
 *
 * Lightweight, best-effort counter store for internal ops metrics.
 * Backed by Netlify Blobs when available; otherwise it silently no-ops.
 *
 * DESIGN GUARANTEES
 *  - NEVER throws into a caller. Every public method is wrapped in try/catch.
 *  - NEVER blocks a user request: recordEvent() is fire-and-forget; callers
 *    do not await it on the response path.
 *  - NEVER calls Google or any external API.
 *  - If @netlify/blobs is not present in the runtime, recording is skipped
 *    and reads return an empty/zeroed snapshot. The platform keeps working.
 *
 * Storage layout (one JSON blob per UTC day + a rolling "meta" blob):
 *   key  metrics:v1:places:YYYY-MM-DD  -> { hits, misses, errors, latencyMs,
 *                                           latencyCount, byType:{...} }
 *   key  metrics:v1:places:meta        -> { lastSuccessTs, lastFailureTs,
 *                                           recentErrors, version }
 */

const STORE_NAME = "ops-metrics";
const KEY_PREFIX = "metrics:v1:places:";
const META_KEY = KEY_PREFIX + "meta";

// Resolve the Netlify Blobs store, or null if unavailable. Never throws.
async function getStore() {
  try {
    // Dynamically required so a missing module cannot break the bundle.
    // eslint-disable-next-line global-require
    var blobs = require("@netlify/blobs");
    if (!blobs || typeof blobs.getStore !== "function") return null;
    return blobs.getStore(STORE_NAME);
  } catch (e) {
    return null;
  }
}

function todayKey(d) {
  var dt = d || new Date();
  return KEY_PREFIX + dt.toISOString().slice(0, 10);
}

function emptyDay() {
  return { hits: 0, misses: 0, errors: 0, latencyMs: 0, latencyCount: 0, byType: {} };
}

async function readJson(store, key, fallback) {
  try {
    var v = await store.get(key, { type: "json" });
    return v || fallback;
  } catch (e) {
    return fallback;
  }
}

/**
 * Record a single places-nearby event. Fire-and-forget.
 * @param {Object} ev
 *   ev.cache    "hit" | "miss" | null
 *   ev.ok       boolean (lookup returned results)
 *   ev.error    boolean (hard failure)
 *   ev.latency  number (ms, origin compute time)
 *   ev.type     string (care-type slug)
 */
async function recordEvent(ev) {
  try {
    var store = await getStore();
    if (!store) return false;
    ev = ev || {};
    var key = todayKey();
    var day = await readJson(store, key, emptyDay());
    if (ev.cache === "hit") day.hits++;
    else if (ev.cache === "miss") day.misses++;
    if (ev.error) day.errors++;
    if (typeof ev.latency === "number" && ev.latency >= 0) {
      day.latencyMs += ev.latency;
      day.latencyCount++;
    }
    if (ev.type) {
      day.byType[ev.type] = (day.byType[ev.type] || 0) + 1;
    }
    await store.setJSON(key, day);

    var meta = await readJson(store, META_KEY, {
      lastSuccessTs: null, lastFailureTs: null, recentErrors: 0, version: "v1"
    });
    var nowTs = new Date().toISOString();
    if (ev.error) {
      meta.lastFailureTs = nowTs;
      meta.recentErrors = Math.min((meta.recentErrors || 0) + 1, 999);
    } else if (ev.ok) {
      meta.lastSuccessTs = nowTs;
      // gentle decay of the recent-error counter on success
      meta.recentErrors = Math.max((meta.recentErrors || 0) - 1, 0);
    }
    await store.setJSON(META_KEY, meta);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Read a snapshot for the dashboard. Aggregates the last N days (default 31).
 * Returns a fully-formed, zeroed object even when the store is unavailable.
 */
async function readSnapshot(days) {
  var n = days || 31;
  var out = {
    available: false,
    today: emptyDay(),
    month: emptyDay(),
    meta: { lastSuccessTs: null, lastFailureTs: null, recentErrors: 0, version: "v1" },
    oldestKey: null,
    newestKey: null,
    daysWithData: 0
  };
  try {
    var store = await getStore();
    if (!store) return out;
    out.available = true;
    var now = new Date();
    out.today = await readJson(store, todayKey(now), emptyDay());
    var monthAgg = emptyDay();
    var seen = [];
    for (var i = 0; i < n; i++) {
      var d = new Date(now.getTime() - i * 86400000);
      var key = todayKey(d);
      var day = await readJson(store, key, null);
      if (day) {
        seen.push(key);
        monthAgg.hits += day.hits || 0;
        monthAgg.misses += day.misses || 0;
        monthAgg.errors += day.errors || 0;
        monthAgg.latencyMs += day.latencyMs || 0;
        monthAgg.latencyCount += day.latencyCount || 0;
        Object.keys(day.byType || {}).forEach(function (t) {
          monthAgg.byType[t] = (monthAgg.byType[t] || 0) + day.byType[t];
        });
      }
    }
    seen.sort();
    out.month = monthAgg;
    out.daysWithData = seen.length;
    out.oldestKey = seen.length ? seen[0] : null;
    out.newestKey = seen.length ? seen[seen.length - 1] : null;
    out.meta = await readJson(store, META_KEY, out.meta);
    return out;
  } catch (e) {
    return out;
  }
}

module.exports = { recordEvent: recordEvent, readSnapshot: readSnapshot };

/**
 * Netlify Function - places-nearby
 *
 * Server-side LOCAL BUSINESS search for CareInMyCity. Keeps the Google API
 * key out of the browser. Given a free-text location (ZIP / city / 'city, ST')
 * and a care type, it geocodes the location, then runs a Google Places Text
 * Search biased to those coordinates and returns nearby businesses.
 *
 * Request (GET or POST):
 *   GET  /.netlify/functions/places-nearby?q=08050&type=home-care
 *   POST { "q": "08050", "type": "home-care" }
 *
 * Response (JSON), always 200 unless a hard server error:
 *   {
 *     ok: true,
 *     query: "08050",
 *     type: "home-care",
 *     center: { lat, lng, formatted },
 *     results: [ { name, address, lat, lng, rating, userRatingsTotal,
 *                  openNow, placeId, mapsUrl, types } ]
 *   }
 *   On no key / no match: { ok:false, query, type, results: [], reason }
 *
 * CACHING (Phase 2.5):
 *   Successful, non-empty lookups are made cacheable at the Netlify CDN edge
 *   via Netlify-CDN-Cache-Control (s-maxage=86400, stale-while-revalidate).
 *   The response BODY is unchanged. Only headers are added. Error / empty /
 *   no-key responses stay no-store so transient failures are never cached.
 *   Caching is keyed by the request query string (Netlify CDN default); a
 *   normalized debug key (places:v1:{state}:{city}:{service}) is surfaced in
 *   the X-Cache-Key header for observability only.
 *
 * Env (same keys as places-lookup):
 *   GOOGLE_PLACES_API_KEY     (preferred for this function)
 *   GOOGLE_GEOCODING_API_KEY  (fallback)
 *
 * NOTE: The configured key must have BOTH the Geocoding API and the
 * Places API enabled in Google Cloud for live results to return.
 */

const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const TEXTSEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json";

// Operations Dashboard (Phase 1): best-effort, fire-and-forget metrics.
// Wrapped so a missing module or any error can never affect the lookup.
var __opsMetrics = null;
try { __opsMetrics = require("./lib/ops-metrics-store"); } catch (e) { __opsMetrics = null; }
function __recordOps(ev) {
  try { if (__opsMetrics && __opsMetrics.recordEvent) { Promise.resolve(__opsMetrics.recordEvent(ev)).catch(function(){}); } } catch (e) {}
}

// Edge cache config (Phase 2.5). 24h served TTL + 6h stale-while-revalidate.
const CACHE_MAX_AGE = 86400;   // 24 hours, in seconds
const CACHE_SWR = 21600;       // 6 hours stale-while-revalidate window

// Map a CareInMyCity care-type slug to a Google Places search phrase.
const TYPE_QUERIES = {
  "senior-care": "senior care",
  "home-care": "home care agency",
  "home-health": "home health care agency",
  "memory-care": "memory care facility",
  "respite-care": "respite care",
  "assisted-living": "assisted living facility",
  "special-needs-support": "special needs support services",
  "autism-support": "autism support services",
  "final-expense-support": "final expense insurance agency",
  "final-expense": "final expense insurance agency",
  "life-insurance": "life insurance agency",
  "ssdi-attorney": "social security disability attorney",
  "elder-law": "elder law attorney",
  "elder-law-attorney": "elder law attorney",
  "estate-planning": "estate planning attorney",
  "senior-resources": "senior resources center",
  "caregiver-support": "caregiver support services",
  "not-sure": "senior care"
};

// Reverse lookup: Google search phrase -> care-type slug, for deriving a
// normalized debug cache key when only a free-text "q" is supplied.
const PHRASE_TO_SLUG = (function () {
  var m = {};
  Object.keys(TYPE_QUERIES).forEach(function (slug) {
    var phrase = TYPE_QUERIES[slug];
    if (m[phrase] == null) m[phrase] = slug;
  });
  return m;
})();

// jsonResponse(statusCode, payload[, extraHeaders])
// By default responses are no-store. Pass extraHeaders to override / add
// (e.g. CDN cache directives on the success path). Body is never modified here.
function jsonResponse(statusCode, payload, extraHeaders) {
  var headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  };
  if (extraHeaders) {
    Object.keys(extraHeaders).forEach(function (k) { headers[k] = extraHeaders[k]; });
  }
  return {
    statusCode: statusCode,
    headers: headers,
    body: JSON.stringify(payload)
  };
}

// Cacheable success response: same body as jsonResponse, but with CDN edge
// cache headers + lightweight debug metadata. No secrets are exposed.
function cachedResponse(payload, cacheKey) {
  return jsonResponse(200, payload, {
    // Browser revalidates; the CDN edge holds it for CACHE_MAX_AGE.
    "Cache-Control": "public, max-age=0, must-revalidate",
    "Netlify-CDN-Cache-Control":
      "public, s-maxage=" + CACHE_MAX_AGE + ", stale-while-revalidate=" + CACHE_SWR,
    "X-Cache-Key": cacheKey,
    "X-Cache-Status": "MISS-ORIGIN",
    "X-Cache-Timestamp": new Date().toISOString()
  });
}

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Resolve the care-type slug for the debug key from type or matched phrase.
function serviceSlug(type, phrase) {
  var key = String(type || "").toLowerCase().trim();
  if (TYPE_QUERIES[key]) return key;
  if (phrase && PHRASE_TO_SLUG[phrase]) return PHRASE_TO_SLUG[phrase];
  return "general";
}

// Build a normalized observability key: places:v1:loc:{city}:{service}.
// Best-effort: derives the city portion from the q text (e.g.
// "home care near Tampa" -> "tampa") and the service from the type slug.
// Used for the X-Cache-Key debug header only; the real CDN cache is keyed by
// the full request query string.
function buildCacheKey(query, type, phrase) {
  var service = serviceSlug(type, phrase);
  var q = String(query || "");
  // Prefer the text after "near"; otherwise use the whole query (ZIP / city).
  var nearIdx = q.toLowerCase().lastIndexOf(" near ");
  var loc = nearIdx >= 0 ? q.slice(nearIdx + 6) : q;
  // Drop a known leading service phrase if the city portion still has one.
  loc = loc.replace(/\b(home care|assisted living|memory care|senior care|agency|facility)\b/gi, "");
  var citySlug = slugify(loc) || slugify(q) || "unknown";
  return "places:v1:loc:" + citySlug + ":" + service;
}

// Obvious crawler / bot detection so indexing does not burn Google quota.
function isBot(event) {
  var h = (event && event.headers) || {};
  var ua = String(h["user-agent"] || h["User-Agent"] || "").toLowerCase();
  if (!ua) return false;
  return /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora|pinterest|vkshare|whatsapp|telegram|headless|lighthouse|google-inspectiontool|gptbot|ccbot|claudebot|bytespider|petalbot|semrush|ahrefs|mj12|dotbot/.test(ua);
}

function getParam(event, name) {
  var v = "";
  if (event.queryStringParameters && event.queryStringParameters[name]) {
    v = event.queryStringParameters[name];
  } else if (event.body) {
    try { v = (JSON.parse(event.body) || {})[name] || ""; } catch (e) { v = ""; }
  }
  return String(v || "").trim().slice(0, 120);
}

function careQuery(type) {
  var key = String(type || "").toLowerCase().trim();
  return TYPE_QUERIES[key] || TYPE_QUERIES["not-sure"];
}

// Geocode a free-text location to coordinates (US-biased).
async function geocode(query, apiKey) {
  var url =
    GEOCODE_URL +
    "?address=" + encodeURIComponent(query) +
    "&components=country:US" +
    "&key=" + encodeURIComponent(apiKey);
  var resp = await fetch(url);
  if (!resp.ok) return null;
  var data = await resp.json();
  if (!data || data.status !== "OK" || !data.results || !data.results.length) {
    return null;
  }
  var r = data.results[0];
  var loc = r.geometry && r.geometry.location;
  if (!loc) return null;
  return { lat: loc.lat, lng: loc.lng, formatted: r.formatted_address || query };
}

// Google Places Text Search, location-biased to the geocoded center.
async function textSearch(phrase, center, apiKey) {
  var url =
    TEXTSEARCH_URL +
    "?query=" + encodeURIComponent(phrase) +
    "&location=" + encodeURIComponent(center.lat + "," + center.lng) +
    "&radius=40000" +
    "&key=" + encodeURIComponent(apiKey);
  var resp = await fetch(url);
  if (!resp.ok) return [];
  var data = await resp.json();
  if (!data || (data.status !== "OK" && data.status !== "ZERO_RESULTS")) return [];
  var list = data.results || [];
  return list.slice(0, 12).map(function (place) {
    var loc = (place.geometry && place.geometry.location) || {};
    return {
      name: place.name || "",
      address: place.formatted_address || place.vicinity || "",
      lat: loc.lat != null ? loc.lat : null,
      lng: loc.lng != null ? loc.lng : null,
      rating: place.rating != null ? place.rating : null,
      userRatingsTotal: place.user_ratings_total != null ? place.user_ratings_total : null,
      openNow: place.opening_hours && typeof place.opening_hours.open_now === "boolean"
        ? place.opening_hours.open_now : null,
      placeId: place.place_id || "",
      mapsUrl: place.place_id
        ? "https://www.google.com/maps/place/?q=place_id:" + encodeURIComponent(place.place_id)
        : "",
      types: place.types || []
    };
  });
}

exports.handler = async function (event) {
  var __t0 = Date.now();
  var query = getParam(event, "q");
  var type = getParam(event, "type");
  if (!query) {
    return jsonResponse(200, { ok: false, query: "", type: type, results: [], reason: "empty_query" });
  }

  // Do not spend Google quota on obvious crawlers/bots. Normal users unaffected.
  if (isBot(event)) {
    return jsonResponse(200, { ok: false, query: query, type: type, results: [], reason: "bot_skipped" });
  }

  var placesKey = process.env.GOOGLE_PLACES_API_KEY || "";
  var geoKey = process.env.GOOGLE_GEOCODING_API_KEY || "";
  var apiKey = placesKey || geoKey;
  if (!apiKey) {
    return jsonResponse(200, { ok: false, query: query, type: type, results: [], reason: "no_api_key" });
  }

  try {
    var center = await geocode(query, apiKey);
    if (!center) {
      return jsonResponse(200, { ok: false, query: query, type: type, results: [], reason: "no_geocode" });
    }
    var phrase = careQuery(type);
    var results = await textSearch(phrase, center, apiKey);
    var payload = {
      ok: results.length > 0,
      query: query,
      type: type,
      phrase: phrase,
      center: center,
      results: results,
      reason: results.length ? "" : "no_results"
    };
    // Only cache successful, non-empty results. Empty results stay no-store so
    // a transient ZERO_RESULTS is never pinned for 24h.
    if (results.length > 0) {
      __recordOps({ cache: "miss", ok: true, error: false, latency: Date.now() - __t0, type: type });
      return cachedResponse(payload, buildCacheKey(query, type, phrase));
    }
    __recordOps({ cache: "miss", ok: false, error: false, latency: Date.now() - __t0, type: type });
    return jsonResponse(200, payload);
  } catch (err) {
    __recordOps({ cache: "miss", ok: false, error: true, latency: Date.now() - __t0, type: type });
    return jsonResponse(200, { ok: false, query: query, type: type, results: [], reason: "lookup_error" });
  }
};

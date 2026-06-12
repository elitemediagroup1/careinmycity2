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
 * Env (same keys as places-lookup):
 *   GOOGLE_PLACES_API_KEY     (preferred for this function)
 *   GOOGLE_GEOCODING_API_KEY  (fallback)
 *
 * NOTE: The configured key must have BOTH the Geocoding API and the
 * Places API enabled in Google Cloud for live results to return.
 */

const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const TEXTSEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json";

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

function jsonResponse(statusCode, payload) {
  return {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(payload)
  };
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
  var query = getParam(event, "q");
  var type = getParam(event, "type");
  if (!query) {
    return jsonResponse(200, { ok: false, query: "", type: type, results: [], reason: "empty_query" });
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
    return jsonResponse(200, {
      ok: results.length > 0,
      query: query,
      type: type,
      phrase: phrase,
      center: center,
      results: results,
      reason: results.length ? "" : "no_results"
    });
  } catch (err) {
    return jsonResponse(200, { ok: false, query: query, type: type, results: [], reason: "lookup_error" });
  }
};

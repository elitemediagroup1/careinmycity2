// redeploy trigger: pick up GOOGLE_PLACES_API_KEY runtime scope (no functional change)
/**
 * Netlify Function - places-lookup
 *
 * Server-side location resolution for CareInMyCity. Keeps Google API keys
 * out of the browser. Resolves a free-text location query (ZIP, city,
 * "city, state", or county) into a normalized location object.
 *
 * Request (GET or POST):
 *   GET  /.netlify/functions/places-lookup?q=33606
 *   POST { "q": "Tampa, FL" }
 *
 * Response (JSON), always 200 unless a hard server error:
 *   {
 *     ok: true,
 *     query: "33606",
 *     resolved: {
 *       zip, city, state, stateCode, county, formatted, lat, lng, source
 *     }
 *   }
 *   On no match / no key: { ok: false, query, resolved: null, reason }
 *
 * Env:
 *   GOOGLE_GEOCODING_API_KEY   (preferred for ZIP/city resolution)
 *   GOOGLE_PLACES_API_KEY      (fallback; also powers it alone if it is the only key)
 */

const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";

const STATE_NAMES = {
  AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",
  CT:"Connecticut",DE:"Delaware",FL:"Florida",GA:"Georgia",HI:"Hawaii",ID:"Idaho",
  IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",
  ME:"Maine",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",
  MS:"Mississippi",MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",
  NH:"New Hampshire",NJ:"New Jersey",NM:"New Mexico",NY:"New York",
  NC:"North Carolina",ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",OR:"Oregon",
  PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",SD:"South Dakota",
  TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",VA:"Virginia",WA:"Washington",
  WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming",DC:"District of Columbia"
};
const NAME_TO_CODE = Object.keys(STATE_NAMES).reduce(function (acc, code) {
  acc[STATE_NAMES[code].toLowerCase()] = code;
  return acc;
}, {});

function jsonResponse(statusCode, payload) {
  return {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(payload)
  };
}

function getQuery(event) {
  var q = "";
  if (event.queryStringParameters && event.queryStringParameters.q) {
    q = event.queryStringParameters.q;
  } else if (event.body) {
    try { q = (JSON.parse(event.body) || {}).q || ""; } catch (e) { q = ""; }
  }
  return String(q || "").trim().slice(0, 120);
}

function pickComponent(components, type, useShort) {
  for (var i = 0; i < components.length; i++) {
    if (components[i].types && components[i].types.indexOf(type) !== -1) {
      return useShort ? components[i].short_name : components[i].long_name;
    }
  }
  return "";
}

function normalizeFromGeocode(result, source) {
  var c = result.address_components || [];
  var stateCode = pickComponent(c, "administrative_area_level_1", true);
  var stateName = pickComponent(c, "administrative_area_level_1", false);
  var zip = pickComponent(c, "postal_code", false);
  var city =
    pickComponent(c, "locality", false) ||
    pickComponent(c, "postal_town", false) ||
    pickComponent(c, "sublocality", false) ||
    pickComponent(c, "administrative_area_level_3", false);
  var county = pickComponent(c, "administrative_area_level_2", false);
  var loc = (result.geometry && result.geometry.location) || {};

  var parts = [];
  if (city) parts.push(city);
  if (stateCode) parts.push(stateCode);
  var formatted = parts.join(", ") + (zip ? " " + zip : "");

  return {
    zip: zip || "",
    city: city || "",
    state: stateName || (STATE_NAMES[stateCode] || ""),
    stateCode: stateCode || (NAME_TO_CODE[(stateName || "").toLowerCase()] || ""),
    county: county || "",
    formatted: formatted.trim() || (result.formatted_address || ""),
    lat: typeof loc.lat === "number" ? loc.lat : null,
    lng: typeof loc.lng === "number" ? loc.lng : null,
    source: source
  };
}

async function geocode(query, apiKey, source) {
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
  return normalizeFromGeocode(data.results[0], source);
}

function offlineFallback(query) {
  var zipMatch = query.match(/\b(\d{5})\b/);
  var tokens = query.replace(/,/g, " ").trim().split(/\s+/);
  var last = (tokens[tokens.length - 1] || "").toUpperCase();
  var stateCode = STATE_NAMES[last] ? last : (NAME_TO_CODE[query.toLowerCase().trim()] || "");
  if (!zipMatch && !stateCode) return null;
  return {
    zip: zipMatch ? zipMatch[1] : "",
    city: "",
    state: stateCode ? STATE_NAMES[stateCode] : "",
    stateCode: stateCode || "",
    county: "",
    formatted: query,
    lat: null,
    lng: null,
    source: "fallback"
  };
}


// Reverse geocode browser coordinates (lat,lng) into a resolved city/state,
// used by the sitewide "Search Near Me" feature. Uses the same server-side
// Google Geocoding key; coordinates never expose any API key to the client.
async function reverseGeocode(lat, lng, apiKey, source) {
  const url =
    'https://maps.googleapis.com/maps/api/geocode/json?latlng=' +
    encodeURIComponent(lat + ',' + lng) +
    '&key=' + encodeURIComponent(apiKey);
  const resp = await fetch(url);
  const data = await resp.json();
  if (data.status !== 'OK' || !data.results || !data.results.length) {
    return null;
  }
  return normalizeFromGeocode(data.results[0], source);
}

exports.handler = async function (event) {
  // Sitewide "Search Near Me": if the client sends browser coordinates,
  // reverse-geocode them server-side and return the resolved place.
  const __qs = (event && event.queryStringParameters) || {};
  const __lat = __qs.lat;
  const __lng = __qs.lng;
  if (__lat && __lng) {
    const __key = process.env.GOOGLE_GEOCODING_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
    if (!__key) {
      return jsonResponse(200, { ok: false, query: '', resolved: null, reason: 'no_api_key' });
    }
    try {
      const __resolved = await reverseGeocode(__lat, __lng, __key, 'reverse');
      if (__resolved) {
        return jsonResponse(200, { ok: true, query: __lat + ',' + __lng, resolved: __resolved });
      }
      return jsonResponse(200, { ok: false, query: __lat + ',' + __lng, resolved: null, reason: 'not_found' });
    } catch (e) {
      return jsonResponse(200, { ok: false, query: __lat + ',' + __lng, resolved: null, reason: 'reverse_error' });
    }
  }

  var query = getQuery(event);
  if (!query) {
    return jsonResponse(200, { ok: false, query: "", resolved: null, reason: "empty_query" });
  }

  var geoKey = process.env.GOOGLE_GEOCODING_API_KEY || "";
  var placesKey = process.env.GOOGLE_PLACES_API_KEY || "";
  var apiKey = geoKey || placesKey;
  var source = geoKey ? "geocoding" : (placesKey ? "places" : "");

  if (!apiKey) {
    var fb0 = offlineFallback(query);
    return jsonResponse(200, {
      ok: !!fb0, query: query, resolved: fb0, reason: fb0 ? "offline_fallback_no_key" : "no_api_key"
    });
  }

  try {
    var resolved = await geocode(query, apiKey, source);
    if (resolved) {
      return jsonResponse(200, { ok: true, query: query, resolved: resolved });
    }
    var fb = offlineFallback(query);
    return jsonResponse(200, {
      ok: !!fb, query: query, resolved: fb, reason: fb ? "offline_fallback_no_match" : "no_match"
    });
  } catch (err) {
    var fb2 = offlineFallback(query);
    return jsonResponse(200, {
      ok: !!fb2, query: query, resolved: fb2, reason: "lookup_error"
    });
  }
};


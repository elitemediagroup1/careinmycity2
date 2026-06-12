/**
 * CareLocation - shared client-side location helper for CareInMyCity.
 *
 * Resolves ZIP / city / "city, state" / county into a normalized location via
 * the server-side /places-lookup function. Caches the last resolution for the
 * session so Carl and the search UI do not repeatedly ask "where are you?".
 *
 * Exposes window.CareLocation:
 *   .resolve(query) -> Promise<resolvedOrNull>
 *   .getCurrent()   -> resolvedOrNull
 *   .setCurrent(r)  -> void
 *   .clear()        -> void
 *   .describe()     -> short human string e.g. "Tampa, FL" (or "")
 *   .looksLikeZip(s)
 *
 * Safe by design: never throws to the caller; resolve() returns null on
 * failure so existing fallback paths keep working.
 */
(function () {
  var STORAGE_KEY = "cimc_care_location";
  var current = null;

  function endpoint() {
    // Netlify functions live at a fixed absolute path regardless of page depth.
    return "/.netlify/functions/places-lookup";
  }

  function looksLikeZip(s) {
    return /^\s*\d{5}(-\d{4})?\s*$/.test(String(s || ""));
  }

  function loadStored() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) current = JSON.parse(raw);
    } catch (e) { current = null; }
  }

  function persist() {
    try {
      if (current) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (e) { /* storage disabled; in-memory still works */ }
  }

  function setCurrent(resolved) {
    if (resolved && (resolved.zip || resolved.city || resolved.stateCode)) {
      current = resolved;
      persist();
    }
  }

  function getCurrent() { return current; }

  function clear() {
    current = null;
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }

  function describe() {
    if (!current) return "";
    if (current.city && current.stateCode) return current.city + ", " + current.stateCode;
    if (current.city && current.state) return current.city + ", " + current.state;
    if (current.zip && current.stateCode) return current.stateCode + " " + current.zip;
    if (current.state) return current.state;
    if (current.zip) return current.zip;
    return current.formatted || "";
  }

  function resolve(query) {
    var q = String(query || "").trim();
    if (!q) return Promise.resolve(null);

    return fetch(endpoint() + "?q=" + encodeURIComponent(q), {
      method: "GET",
      headers: { "Accept": "application/json" }
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (data && data.resolved) {
          setCurrent(data.resolved);
          return data.resolved;
        }
        return null;
      })
      .catch(function () { return null; });
  }

  loadStored();

  window.CareLocation = {
    resolve: resolve,
    getCurrent: getCurrent,
    setCurrent: setCurrent,
    clear: clear,
    describe: describe,
    looksLikeZip: looksLikeZip
  };
})();

/**
 * CareLocation - shared client-side location helper for CareInMyCity.
 *
 * Resolves ZIP / city / "city, state" / county into a normalized location via
 * the server-side /places-lookup function, then ROUTES the visitor to the best
 * existing CareInMyCity page (city page > state page > /search/ fallback).
 *
 * Never dead-ends and never throws to the caller. If Google lookup is
 * unavailable, the original /search/ behavior is preserved.
 *
 * Exposes window.CareLocation:
 *   .resolve(query)        -> Promise<resolvedOrNull>
 *   .getCurrent()          -> resolvedOrNull
 *   .setCurrent(resolved)
 *   .clear()
 *   .describe()            -> human label
 *   .looksLikeZip(s)       -> boolean
 *   .slugify(s)            -> url slug
 *   .enrich(resolved)      -> resolved + {stateSlug, citySlug}
 *   .routeFor(resolved, params) -> best existing URL (string) or null
 *   .goToBest(query, params, fallbackUrl) -> Promise (navigates)
 *   .ROUTE_INDEX           -> { stateSlug: [citySlug, ...] }
 */
(function () {
  var STORAGE_KEY = 'cimc_care_location';
  var current = null;

  // ---- Route index: which state/city pages actually exist in the repo. ----
  // Auto-generated from the published page tree. stateSlug -> [citySlug,...].
  var ROUTE_INDEX = {
    "alabama": ["auburn","birmingham","dothan","hoover","huntsville","mobile","montgomery","tuscaloosa"],
    "alaska": ["anchorage","fairbanks","juneau","kenai","ketchikan","kodiak","sitka","wasilla"],
    "arizona": ["chandler","glendale","mesa","peoria","phoenix","scottsdale","tempe","tucson"],
    "arkansas": ["bentonville","conway","fayetteville","fort-smith","jonesboro","little-rock","rogers","springdale"],
    "california": ["fresno","long-beach","los-angeles","oakland","sacramento","san-diego","san-francisco","san-jose"],
    "colorado": ["arvada","aurora","boulder","colorado-springs","denver","fort-collins","lakewood","thornton"],
    "connecticut": ["bridgeport","danbury","greenwich","hartford","new-haven","norwalk","stamford","waterbury"],
    "delaware": ["dover","lewes","middletown","milford","newark","seaford","smyrna","wilmington"],
    "florida": ["boca-raton","delray-beach","fort-lauderdale","jacksonville","miami","orlando","tampa","west-palm-beach"],
    "georgia": ["athens","atlanta","augusta","columbus","macon","roswell","sandy-springs","savannah"],
    "hawaii": ["colorado","hilo","honolulu","kahului","kailua","kaneohe","kapolei","maryland","massachusetts","missouri","pearl-city","south-carolina","tennessee","virginia","waipahu","washington"],
    "idaho": ["boise","caldwell","coeur-d-alene","idaho-falls","meridian","nampa","pocatello","twin-falls"],
    "illinois": ["aurora","chicago","elgin","joliet","naperville","peoria","rockford","springfield"],
    "indiana": ["bloomington","carmel","evansville","fishers","fort-wayne","hammond","indianapolis","south-bend"],
    "iowa": ["ames","cedar-rapids","davenport","des-moines","iowa-city","sioux-city","waterloo","west-des-moines"],
    "kansas": ["kansas-city","lawrence","manhattan","olathe","overland-park","shawnee","topeka","wichita"],
    "kentucky": ["bowling-green","covington","florence","georgetown","lexington","louisville","owensboro","richmond"],
    "louisiana": ["baton-rouge","bossier-city","kenner","lafayette","lake-charles","monroe","new-orleans","shreveport"],
    "maine": ["auburn","augusta","bangor","biddeford","brunswick","lewiston","portland","south-portland"],
    "maryland": ["annapolis","baltimore","bethesda","columbia","frederick","gaithersburg","rockville","silver-spring"],
    "massachusetts": ["boston","cambridge","fall-river","lowell","newton","quincy","springfield","worcester"],
    "michigan": ["ann-arbor","dearborn","detroit","flint","grand-rapids","lansing","sterling-heights","warren"],
    "minnesota": ["bloomington","brooklyn-park","duluth","minneapolis","plymouth","rochester","saint-paul","woodbury"],
    "mississippi": ["biloxi","gulfport","hattiesburg","jackson","meridian","olive-branch","southaven","tupelo"],
    "missouri": ["columbia","independence","kansas-city","lee-s-summit","o-fallon","springfield","st-joseph","st-louis"],
    "montana": ["billings","bozeman","butte","great-falls","havre","helena","kalispell","missoula"],
    "nebraska": ["bellevue","fremont","grand-island","hastings","kearney","lincoln","norfolk","omaha"],
    "nevada": ["carson-city","elko","henderson","las-vegas","mesquite","north-las-vegas","reno","sparks"],
    "new-hampshire": ["concord","derry","dover","manchester","nashua","portsmouth","rochester","salem"],
    "new-jersey": ["edison","elizabeth","hoboken","jersey-city","newark","paterson","toms-river","trenton"],
    "new-mexico": ["albuquerque","clovis","farmington","hobbs","las-cruces","rio-rancho","roswell","santa-fe"],
    "new-york": ["bronx","brooklyn","buffalo","long-island","new-york-city","queens","staten-island","yonkers"],
    "north-carolina": ["cary","charlotte","durham","fayetteville","greensboro","raleigh","wilmington","winston-salem"],
    "north-dakota": ["bismarck","dickinson","fargo","grand-forks","mandan","minot","west-fargo","williston"],
    "ohio": ["akron","canton","cincinnati","cleveland","columbus","dayton","parma","toledo"],
    "oklahoma": ["broken-arrow","edmond","lawton","midwest-city","moore","norman","oklahoma-city","tulsa"],
    "oregon": ["beaverton","bend","eugene","gresham","hillsboro","medford","portland","salem"],
    "pennsylvania": ["allentown","bethlehem","erie","lancaster","philadelphia","pittsburgh","reading","scranton"],
    "rhode-island": ["coventry","cranston","east-providence","newport","pawtucket","providence","warwick","woonsocket"],
    "south-carolina": ["charleston","columbia","greenville","mount-pleasant","myrtle-beach","rock-hill","spartanburg","summerville"],
    "south-dakota": ["aberdeen","brookings","mitchell","pierre","rapid-city","sioux-falls","watertown","yankton"],
    "tennessee": ["chattanooga","clarksville","franklin","johnson-city","knoxville","memphis","murfreesboro","nashville"],
    "texas": ["arlington","austin","corpus-christi","dallas","el-paso","fort-worth","houston","san-antonio"],
    "utah": ["ogden","orem","provo","salt-lake-city","sandy","st-george","west-jordan","west-valley-city"],
    "vermont": ["bennington","brattleboro","burlington","essex-junction","milton","montpelier","rutland","south-burlington"],
    "virginia": ["alexandria","arlington","chesapeake","newport-news","norfolk","richmond","roanoke","virginia-beach"],
    "washington": ["bellevue","everett","kent","renton","seattle","spokane","tacoma","vancouver"],
    "west-virginia": ["charleston","fairmont","huntington","martinsburg","morgantown","parkersburg","weirton","wheeling"],
    "wisconsin": ["appleton","eau-claire","green-bay","kenosha","madison","milwaukee","racine","waukesha"],
    "wyoming": ["casper","cheyenne","evanston","gillette","green-river","laramie","rock-springs","sheridan"]
  };

  var STATE_NAME_TO_SLUG = {
    'alabama':'alabama','alaska':'alaska','arizona':'arizona','arkansas':'arkansas',
    'california':'california','colorado':'colorado','connecticut':'connecticut',
    'delaware':'delaware','florida':'florida','georgia':'georgia','hawaii':'hawaii',
    'idaho':'idaho','illinois':'illinois','indiana':'indiana','iowa':'iowa',
    'kansas':'kansas','kentucky':'kentucky','louisiana':'louisiana','maine':'maine',
    'maryland':'maryland','massachusetts':'massachusetts','michigan':'michigan',
    'minnesota':'minnesota','mississippi':'mississippi','missouri':'missouri',
    'montana':'montana','nebraska':'nebraska','nevada':'nevada',
    'new hampshire':'new-hampshire','new jersey':'new-jersey','new mexico':'new-mexico',
    'new york':'new-york','north carolina':'north-carolina','north dakota':'north-dakota',
    'ohio':'ohio','oklahoma':'oklahoma','oregon':'oregon','pennsylvania':'pennsylvania',
    'rhode island':'rhode-island','south carolina':'south-carolina',
    'south dakota':'south-dakota','tennessee':'tennessee','texas':'texas','utah':'utah',
    'vermont':'vermont','virginia':'virginia','washington':'washington',
    'west virginia':'west-virginia','wisconsin':'wisconsin','wyoming':'wyoming'
  };

  var CODE_TO_SLUG = {
    AL:'alabama',AK:'alaska',AZ:'arizona',AR:'arkansas',CA:'california',CO:'colorado',
    CT:'connecticut',DE:'delaware',FL:'florida',GA:'georgia',HI:'hawaii',ID:'idaho',
    IL:'illinois',IN:'indiana',IA:'iowa',KS:'kansas',KY:'kentucky',LA:'louisiana',
    ME:'maine',MD:'maryland',MA:'massachusetts',MI:'michigan',MN:'minnesota',
    MS:'mississippi',MO:'missouri',MT:'montana',NE:'nebraska',NV:'nevada',
    NH:'new-hampshire',NJ:'new-jersey',NM:'new-mexico',NY:'new-york',
    NC:'north-carolina',ND:'north-dakota',OH:'ohio',OK:'oklahoma',OR:'oregon',
    PA:'pennsylvania',RI:'rhode-island',SC:'south-carolina',SD:'south-dakota',
    TN:'tennessee',TX:'texas',UT:'utah',VT:'vermont',VA:'virginia',WA:'washington',
    WV:'west-virginia',WI:'wisconsin',WY:'wyoming'
  };

  function endpoint() {
    return '/.netlify/functions/places-lookup';
  }

  function looksLikeZip(s) {
    return /^\s*\d{5}(-\d{4})?\s*$/.test(String(s || ''));
  }

  function slugify(value) {
    return String(value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Path prefix so this works from any page depth (home '', /search/ '../', etc.).
  function rootPrefix() {
    try {
      var path = window.location.pathname || '/';
      var segs = path.replace(/^\/+|\/+$/g, '').split('/');
      if (segs.length && /\.[a-z0-9]+$/i.test(segs[segs.length - 1])) segs.pop();
      var depth = segs.filter(Boolean).length;
      return depth > 0 ? new Array(depth + 1).join('../') : '';
    } catch (e) { return ''; }
  }

  function stateSlugFrom(resolved) {
    if (!resolved) return '';
    if (resolved.stateCode && CODE_TO_SLUG[resolved.stateCode.toUpperCase()]) {
      return CODE_TO_SLUG[resolved.stateCode.toUpperCase()];
    }
    var name = (resolved.state || '').toLowerCase().trim();
    if (STATE_NAME_TO_SLUG[name]) return STATE_NAME_TO_SLUG[name];
    return '';
  }

  function enrich(resolved) {
    if (!resolved) return resolved;
    resolved.stateSlug = stateSlugFrom(resolved);
    resolved.citySlug = resolved.city ? slugify(resolved.city) : '';
    return resolved;
  }

  // ---- Routing: pick the best EXISTING page for a resolved location. --------
  // Priority: exact city page > state page > /search/ fallback.
  function routeFor(resolved, params) {
    var prefix = rootPrefix();
    var qs = '';
    if (params) {
      var sp = (params instanceof URLSearchParams) ? params : new URLSearchParams(params);
      var s = sp.toString();
      if (s) qs = '?' + s;
    }
    if (!resolved) return null;
    enrich(resolved);
    var stateSlug = resolved.stateSlug;
    var citySlug = resolved.citySlug;
    if (stateSlug && citySlug && ROUTE_INDEX[stateSlug] &&
        ROUTE_INDEX[stateSlug].indexOf(citySlug) !== -1) {
      return prefix + stateSlug + '/' + citySlug + '/' + qs;
    }
    if (stateSlug && ROUTE_INDEX[stateSlug]) {
      return prefix + stateSlug + '/' + qs;
    }
    return null;
  }

  function searchFallbackUrl(resolved, params) {
    var prefix = rootPrefix();
    var sp = (params instanceof URLSearchParams) ? params
      : new URLSearchParams(params || {});
    if (resolved) {
      enrich(resolved);
      if (resolved.stateSlug && !sp.get('state')) sp.set('state', resolved.stateSlug);
      if (resolved.zip && !sp.get('zip')) sp.set('zip', resolved.zip);
      var loc = resolved.city ||
        (resolved.stateCode ? (resolved.zip || resolved.state) : resolved.zip) ||
        resolved.formatted || '';
      if (loc && !sp.get('location')) sp.set('location', loc);
    }
    var s = sp.toString();
    return prefix + 'search/' + (s ? '?' + s : '') + '#search-results';
  }

  function loadStored() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      current = raw ? JSON.parse(raw) : null;
    } catch (e) { current = null; }
  }

  function persist() {
    try {
      if (current) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (e) {}
  }

  function setCurrent(resolved) {
    if (resolved && (resolved.zip || resolved.city || resolved.stateCode)) {
      current = enrich(resolved);
      persist();
    }
  }

  function getCurrent() { return current; }

  function clear() {
    current = null;
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }

  function describe() {
    if (!current) return '';
    if (current.city && current.stateCode) return current.city + ', ' + current.stateCode;
    if (current.city && current.state) return current.city + ', ' + current.state;
    if (current.zip && current.stateCode) return current.stateCode + ' ' + current.zip;
    if (current.state) return current.state;
    if (current.zip) return current.zip;
    return current.formatted || '';
  }

  function resolve(query) {
    var q = String(query || '').trim();
    if (!q) return Promise.resolve(null);
        return fetch(endpoint() + "?q=" + encodeURIComponent(q) + "&_=" + Date.now(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
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

  // ---- Navigation: resolve a query then go to the best existing page. -------
  function goToBest(query, params, fallbackUrl) {
    var done = false;
    function go(url) {
      if (done) return;
      done = true;
      window.location.href = url;
    }
    var fb = fallbackUrl || searchFallbackUrl(null, params);
    var timer = setTimeout(function () { go(fb); }, 1200);
    return resolve(query).then(function (resolved) {
      clearTimeout(timer);
      if (done) return fb;
      var best = routeFor(resolved, params);
      if (best) { go(best); return best; }
      var sf = searchFallbackUrl(resolved, params);
      go(sf);
      return sf;
    }).catch(function () {
      clearTimeout(timer);
      go(fb);
      return fb;
    });
  }

  // ---- Form interception (additive; does NOT modify site.js). --------------
  // Capture-phase submit listeners run BEFORE site.js's own handlers. If we can
  // route, we stop the default submit and navigate to the best existing page.
  // Otherwise we do nothing and let site.js's existing handler run unchanged.
  function fieldValue(form, id, name) {
    var el = (id && document.getElementById(id)) ||
      (name && form.querySelector('[name="' + name + '"]'));
    return el ? String(el.value || '').trim() : '';
  }

  function interceptHomepageForm() {
    var form = document.getElementById('careFinderForm');
    if (!form) return;
    form.addEventListener('submit', function (event) {
      var zip = fieldValue(form, 'zip', 'zip');
      if (!zip) return;
      var careType = fieldValue(form, 'careType', 'careType');
      var timeline = fieldValue(form, 'timeline', 'timeline');
      var params = new URLSearchParams();
      if (careType) params.set('careType', careType);
      if (timeline) params.set('timeline', timeline);
      if (zip) params.set('zip', zip);
      params.set('source', 'google');
      event.preventDefault();
      event.stopImmediatePropagation();
      var fb = searchFallbackUrl(null, params);
      goToBest(zip, params, fb);
    }, true);
  }

  // ---- Human-readable label from a slug (e.g. 'new-jersey' -> 'New Jersey'). ----
function labelFromSlug(slug) {
    return String(slug || '')
      .split('-')
      .map(function (w) { return w ? w.charAt(0).toUpperCase() + w.slice(1) : w; })
      .join(' ');
  }

  // ---- Populate the State <select> from the live ROUTE_INDEX. ----
  // Every state that has a real page in the repo becomes an option; values are
  // slugs ('new-jersey'), labels are human readable ('New Jersey').
  function populateStateFilter(stateSel, selected) {
    if (!stateSel) return;
    var slugs = Object.keys(ROUTE_INDEX).sort();
    stateSel.innerHTML = '';
    var first = document.createElement('option');
    first.value = '';
    first.textContent = 'All states';
    stateSel.appendChild(first);
    for (var i = 0; i < slugs.length; i++) {
      var opt = document.createElement('option');
      opt.value = slugs[i];
      opt.textContent = labelFromSlug(slugs[i]);
      stateSel.appendChild(opt);
    }
    if (selected && ROUTE_INDEX[selected]) stateSel.value = selected;
  }

  // ---- Populate the City <select> with only the cities that exist under the ----
  // selected state. No state selected -> 'Select a state first'. State with no
  // city pages -> 'All cities' only.
  function populateCityFilter(citySel, stateSlug, selected) {
    if (!citySel) return;
    citySel.innerHTML = '';
    if (!stateSlug) {
      var ph = document.createElement('option');
      ph.value = '';
      ph.textContent = 'Select a state first';
      citySel.appendChild(ph);
      citySel.disabled = true;
      return;
    }
    citySel.disabled = false;
    var allOpt = document.createElement('option');
    allOpt.value = '';
    allOpt.textContent = 'All cities';
    citySel.appendChild(allOpt);
    var cities = ROUTE_INDEX[stateSlug] || [];
    for (var i = 0; i < cities.length; i++) {
      var opt = document.createElement('option');
      opt.value = cities[i];
      opt.textContent = labelFromSlug(cities[i]);
      citySel.appendChild(opt);
    }
    if (selected && cities.indexOf(selected) !== -1) citySel.value = selected;
  }

  // ---- Wire the /search/ filter dropdowns: state -> city dependency + routing.
  function interceptSearchForm() {
    var form = document.getElementById('resourceFilterForm');
    if (!form) return;

    var stateSel = document.getElementById('filterState');
    var citySel = document.getElementById('filterCity');
    var locInput = document.getElementById('filterLocation');

    // Seed selections from the URL so a shared link restores filter state.
    var urlParams = new URLSearchParams(window.location.search);
    var initState = urlParams.get('state') || '';
    var initCity = urlParams.get('city') || '';

    if (stateSel) populateStateFilter(stateSel, initState);
    if (citySel) populateCityFilter(citySel, stateSel ? stateSel.value : '', initCity);

    // On state change: clear current city and repopulate from existing pages.
    if (stateSel && citySel) {
      stateSel.addEventListener('change', function () {
        citySel.value = '';
        populateCityFilter(citySel, stateSel.value, '');
      });
    }

    form.addEventListener('submit', function (event) {
      var state = stateSel ? String(stateSel.value || '').trim() : fieldValue(form, 'filterState', 'state');
      var city = citySel ? String(citySel.value || '').trim() : '';
      var location = locInput ? String(locInput.value || '').trim() : fieldValue(form, 'filterLocation', 'location');
      var careType = fieldValue(form, 'filterCareType', 'careType');

      var prefix = rootPrefix();
      var qs = new URLSearchParams();
      if (careType) qs.set('careType', careType);
      var qss = qs.toString();
      qss = qss ? '?' + qss : '';

      // 1) State + city both chosen and the city page exists -> city page.
      if (state && city && ROUTE_INDEX[state] && ROUTE_INDEX[state].indexOf(city) !== -1) {
        event.preventDefault();
        event.stopImmediatePropagation();
        window.location.href = prefix + state + '/' + city + '/' + qss;
        return;
      }

      // 2) Free-text location typed -> resolve via Google to best existing page.
      if (location) {
        var params = new URLSearchParams();
        if (careType) params.set('careType', careType);
        if (state) params.set('state', state);
        params.set('location', location);
        params.set('source', 'google');
        event.preventDefault();
        event.stopImmediatePropagation();
        var fbParams = new URLSearchParams();
        if (careType) fbParams.set('careType', careType);
        if (state) fbParams.set('state', state);
        fbParams.set('location', location);
        var fb = searchFallbackUrl(null, fbParams);
        goToBest(location, params, fb);
        return;
      }

      // 3) State only (with a real page) -> state page.
      if (state && ROUTE_INDEX[state]) {
        event.preventDefault();
        event.stopImmediatePropagation();
        window.location.href = prefix + state + '/' + qss;
        return;
      }

      // 4) Nothing actionable -> let the existing /search/ handler run (fallback).
    }, true);
  }

  function wireForms() {
    try { interceptHomepageForm(); } catch (e) {}
    try { interceptSearchForm(); } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireForms);
  } else {
    wireForms();
  }

  loadStored();

  window.CareLocation = {
    resolve: resolve,
    getCurrent: getCurrent,
    setCurrent: setCurrent,
    clear: clear,
    describe: describe,
    looksLikeZip: looksLikeZip,
    slugify: slugify,
    enrich: enrich,
    routeFor: routeFor,
    searchFallbackUrl: searchFallbackUrl,
    goToBest: goToBest,
    ROUTE_INDEX: ROUTE_INDEX
  };
})();

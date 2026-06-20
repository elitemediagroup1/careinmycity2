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

  // ---- Inline homepage results: resolve ZIP via Google, render on-page. ----
  // Resources data path relative to the current page depth.
  function resourceDataPath() {
    return rootPrefix() + 'assets/data/resources.json';
  }

  var __resourceCache = null;
  function loadResourceData() {
    if (__resourceCache) return Promise.resolve(__resourceCache);
    return fetch(resourceDataPath(), { headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (data) { __resourceCache = Array.isArray(data) ? data : []; return __resourceCache; })
      .catch(function () { return []; });
  }

  function norm(v) {
    return String(v == null ? '' : v).trim().toLowerCase().replace(/\s+/g, '-');
  }

  // Filter by state (primary). City and careType are applied only when they
  // still leave matches, so the homepage never dead-ends on a resolved ZIP.
  function filterResources(all, stateSlug, citySlug, careType) {
    var byState = all.filter(function (r) { return norm(r.state) === stateSlug; });
    if (!byState.length) return [];
    var result = byState;
    if (citySlug) {
      var byCity = byState.filter(function (r) {
        var rc = norm(r.city);
        var near = (r.nearbyAreas || []).map(norm);
        return rc === citySlug || near.indexOf(citySlug) !== -1;
      });
      if (byCity.length) result = byCity;
    }
    if (careType) {
      var ct = norm(careType);
      var byCat = result.filter(function (r) { return norm(r.category) === ct; });
      if (byCat.length) result = byCat;
    }
    var featured = result.filter(function (r) { return r.featured; });
    var regular = result.filter(function (r) { return !r.featured; });
    return featured.concat(regular);
  }

  function titleCaseSlug(value) {
    return String(value || '').replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Resolve a resource URL to be correct from the homepage (root) context.
  function resourceUrl(resource) {
    var url = resource && resource.url;
    if (!url || url === '#') return '#';
    if (/^(https?:|\/|#)/.test(url)) return url;
    return rootPrefix() + url.replace(/^(\.\.\/)+/, '');
  }

  function buildCard(resource) {
    var card = document.createElement('article');
    card.className = 'resource-result-card' + (resource.featured ? ' featured' : '');
    var type = resource.type === 'guide' ? 'Guide' : 'Resource';
    var tags = (resource.tags || []).slice(0, 4)
      .map(function (t) { return '<span class="resource-tag">' + esc(t) + '</span>'; }).join('');
    var area = [resource.city ? titleCaseSlug(resource.city) : '', resource.state ? titleCaseSlug(resource.state) : '']
      .filter(Boolean).join(', ');
    var label = resource.ctaLabel || (resource.type === 'guide' ? 'View guide' : 'Compare option');
    var url = resourceUrl(resource);
    card.innerHTML =
      '<span class="resource-type">' + type + (resource.featured ? ' \u00b7 Featured' : '') + '</span>' +
      '<h3>' + esc(resource.name) + '</h3>' +
      '<p>' + esc(resource.description) + '</p>' +
      (area ? '<p><strong>Area:</strong> ' + esc(area) + '</p>' : '') +
      '<div class="resource-tags">' + tags + '</div>' +
      '<div class="resource-card-actions"><a href="' + esc(url) + '">' + esc(label) + '</a></div>';
    return card;
  }

  // Live local business card (Google Places result).
  function buildBusinessCard(biz) {
    var card = document.createElement('article');
    card.className = 'resource-result-card';
    var ratingLine = '';
    if (biz.rating != null) {
      var count = biz.userRatingsTotal != null ? (' (' + biz.userRatingsTotal + ')') : '';
      ratingLine = '<p><strong>Rating:</strong> ' + esc(String(biz.rating)) + ' \u2605' + esc(count) + '</p>';
    }
    var openLine = '';
    if (biz.openNow === true) openLine = '<span class="resource-tag">Open now</span>';
    var typeTags = (biz.types || []).filter(function (t) {
      return t && t !== 'point_of_interest' && t !== 'establishment';
    }).slice(0, 3).map(function (t) {
      return '<span class="resource-tag">' + esc(titleCaseSlug(t.replace(/_/g, '-'))) + '</span>';
    }).join('');
    var link = biz.mapsUrl || '#';
    card.innerHTML =
      '<span class="resource-type">Local business</span>' +
      '<h3>' + esc(biz.name) + '</h3>' +
      (biz.address ? '<p>' + esc(biz.address) + '</p>' : '') +
      ratingLine +
      '<div class="resource-tags">' + openLine + typeTags + '</div>' +
      '<div class="resource-card-actions"><a href="' + esc(link) + '" target="_blank" rel="noopener">View on Google Maps</a></div>';
    return card;
  }

  // Build the 'Browse the {State} guide' fallback link element.
  function stateGuideLink(stateSlug) {
    if (!stateSlug || !ROUTE_INDEX[stateSlug]) return null;
    var wrap = document.createElement('div');
    wrap.className = 'no-results-card';
    wrap.innerHTML = '<h3>Prefer a plain-English overview?</h3>' +
      '<p><a href="' + esc(rootPrefix() + stateSlug + '/') + '">Browse the ' +
      esc(titleCaseSlug(stateSlug)) + ' care guide</a> for questions to ask and next steps.</p>';
    return wrap;
  }

  // Render the static directory guide cards (used as a fallback when no live
  // local businesses are available).
  function renderGuideFallback(grid, meta, resolved, careType, locationLabel) {
    enrich(resolved);
    var stateSlug = resolved ? resolved.stateSlug : '';
    var citySlug = resolved ? resolved.citySlug : '';
    return loadResourceData().then(function (all) {
      var matches = stateSlug ? filterResources(all, stateSlug, citySlug, careType) : [];
      grid.innerHTML = '';
      if (meta) {
        meta.textContent = matches.length
          ? ('Showing ' + matches.length + ' care guide' + (matches.length === 1 ? '' : 's') + ' for ' + locationLabel + '.')
          : ('We could not match local resources for ' + locationLabel + ' yet.');
      }
      if (!matches.length) {
        var link = stateGuideLink(stateSlug);
        grid.innerHTML = '<div class="no-results-card"><h3>No matching resources yet.</h3>' +
          '<p>This directory is still growing. Try a different ZIP code or care type.</p></div>';
        if (link) grid.appendChild(link);
        return;
      }
      matches.forEach(function (r) { grid.appendChild(buildCard(r)); });
    });
  }

  // Render resolved-location results into the homepage results section.
  // Primary: LIVE local businesses from Google Places. Fallback: state guides.
  function renderHomeResults(resolved, careType) {
    var section = document.getElementById('home-search-results');
    var grid = document.querySelector('[data-home-resource-results]');
    var meta = document.querySelector('[data-home-resource-meta]');
    if (!section || !grid) return;
    enrich(resolved);
    var stateSlug = resolved ? resolved.stateSlug : '';
    var locationLabel = (resolved && resolved.city)
      ? (resolved.city + (resolved.stateCode ? ', ' + resolved.stateCode : ''))
      : (stateSlug ? titleCaseSlug(stateSlug) : 'your area');
    section.hidden = false;
    grid.innerHTML = '<div class="no-results-card"><h3>Finding local options...</h3></div>';
    if (meta) meta.textContent = '';

    var zip = resolved ? (resolved.zip || resolved.formatted || resolved.city || '') : '';
    return fetchNearbyBusinesses(zip, careType).then(function (businesses) {
      if (businesses && businesses.length) {
        grid.innerHTML = '';
        if (meta) {
          meta.textContent = businesses.length + ' local option' +
            (businesses.length === 1 ? '' : 's') + ' found near ' + locationLabel + '.';
        }
        businesses.forEach(function (b) { grid.appendChild(buildBusinessCard(b)); });
        var link = stateGuideLink(stateSlug);
        if (link) grid.appendChild(link);
        try { section.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
        return;
      }
      // No live businesses (no key, no match, or error) -> guide fallback.
      return renderGuideFallback(grid, meta, resolved, careType, locationLabel).then(function () {
        try { section.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
      });
    });
  }

  // Call the server-side places-nearby function for live local businesses.
  function fetchNearbyBusinesses(query, careType) {
    var q = String(query || '').trim();
    if (!q) return Promise.resolve([]);
    var url = rootPrefix() + '.netlify/functions/places-nearby' +
      '?q=' + encodeURIComponent(q) +
      '&type=' + encodeURIComponent(careType || '') +
      '&_=' + Date.now();
    return fetch(url, { headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) { return (data && Array.isArray(data.results)) ? data.results : []; })
      .catch(function () { return []; });
  }

  // Homepage care finder: resolve the ZIP via Google, then render results
  // INLINE on the homepage. No redirect.
  function interceptHomepageForm() {
    var form = document.getElementById('careFinderForm');
    if (!form) return;
    // Only take over when the homepage has an inline results target.
    if (!document.getElementById('home-search-results')) return;
    form.addEventListener('submit', function (event) {
      var zip = fieldValue(form, 'zip', 'zip');
      if (!zip) return;
      var careType = fieldValue(form, 'careType', 'careType');
      event.preventDefault();
      event.stopImmediatePropagation();
      var section = document.getElementById('home-search-results');
      var grid = document.querySelector('[data-home-resource-results]');
      if (section) section.hidden = false;
      if (grid) grid.innerHTML = '<div class="no-results-card"><h3>Finding local options...</h3></div>';
      try { if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
      resolve(zip).then(function (resolved) {
        if (!resolved) {
          var grid2 = document.querySelector('[data-home-resource-results]');
          var meta2 = document.querySelector('[data-home-resource-meta]');
          if (meta2) meta2.textContent = '';
          if (grid2) grid2.innerHTML = '<div class="no-results-card"><h3>We could not look up that ZIP.</h3>' +
            '<p>Please double-check the ZIP code and try again.</p></div>';
          return;
        }
        renderHomeResults(resolved, careType);
      });
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

  // ---- Render live local businesses inline on the /search/ page. ----
// Mirrors the homepage behavior: query places-nearby for the chosen
// location + care category, render LOCAL BUSINESS cards into the existing
// directory grid, with a state guide link / static fallback below.
function renderSearchResults(locationQuery, locationLabel, stateSlug, citySlug, careType) {
  var section = document.getElementById('search-results');
  var grid = document.querySelector('[data-resource-results]');
  var meta = document.querySelector('[data-resource-meta]');
  if (!grid) return Promise.resolve();
  grid.innerHTML = '<div class="no-results-card"><h3>Finding local options...</h3></div>';
  if (meta) meta.textContent = '';
  try { if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
  return fetchNearbyBusinesses(locationQuery, careType).then(function (businesses) {
    if (businesses && businesses.length) {
      grid.innerHTML = '';
      if (meta) {
        meta.textContent = businesses.length + ' local option' +
          (businesses.length === 1 ? '' : 's') + ' found near ' + locationLabel + '.';
      }
      businesses.forEach(function (b) { grid.appendChild(buildBusinessCard(b)); });
      var link = stateGuideLink(stateSlug);
      if (link) grid.appendChild(link);
      return;
    }
    var pseudo = { stateSlug: stateSlug, citySlug: citySlug };
    return renderGuideFallback(grid, meta, pseudo, careType, locationLabel);
  });
}

// ---- Wire the /search/ filter dropdowns: state -> city dependency + live results.
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

  // Only take over the submit when this page has an inline results grid.
  var hasGrid = !!document.querySelector('[data-resource-results]');

  form.addEventListener('submit', function (event) {
    var state = stateSel ? String(stateSel.value || '').trim() : fieldValue(form, 'filterState', 'state');
    var city = citySel ? String(citySel.value || '').trim() : '';
    var location = locInput ? String(locInput.value || '').trim() : fieldValue(form, 'filterLocation', 'location');
    var careType = fieldValue(form, 'filterCareType', 'careType');

    // Build the best location query + human label for the Google lookup.
    // Priority: typed ZIP/city/county > selected city > selected state.
    var locationQuery = '';
    var locationLabel = '';
    if (location) {
      locationQuery = location;
      locationLabel = location;
    } else if (state && city && ROUTE_INDEX[state] && ROUTE_INDEX[state].indexOf(city) !== -1) {
      locationQuery = labelFromSlug(city) + ', ' + labelFromSlug(state);
      locationLabel = labelFromSlug(city) + ', ' + labelFromSlug(state);
    } else if (state && ROUTE_INDEX[state]) {
      locationQuery = labelFromSlug(state);
      locationLabel = labelFromSlug(state);
    }

    // If we have an actionable location and an inline grid, render live
    // local businesses on THIS page instead of redirecting.
    if (locationQuery && hasGrid) {
      event.preventDefault();
      event.stopImmediatePropagation();
      renderSearchResults(locationQuery, locationLabel, state, city, careType);
      return;
    }

    // No actionable location -> let the existing /search/ handler run (fallback).
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


/* ------------------------------------------------------------------ *
 * Search Near Me (sitewide)                                           *
 *                                                                     *
 * Uses the browser's geolocation, then reverse-geocodes the coords    *
 * server-side via the places-lookup Netlify function (no Google key   *
 * in the browser). Resolves to a city/state and routes the visitor    *
 * to the best canonical /state/... page using the existing           *
 * CareLocation routing. Falls back to the /search/ page if anything   *
 * is unavailable. This block is fully independent of the main IIFE    *
 * above and only enhances behavior; it never breaks existing forms.   *
 * ------------------------------------------------------------------ */
(function () {
  'use strict';

  var BUTTON_SELECTOR = '[data-near-me], .search-near-me, #search-near-me, [data-action="near-me"]';

  function rootPrefix() {
    // Mirror depth handling so the function path resolves from any page depth.
    return '/.netlify/functions/places-lookup';
  }

  function setStatus(btn, text) {
    if (!btn) return;
    if (!btn.dataset.originalLabel) btn.dataset.originalLabel = btn.textContent;
    btn.textContent = text;
  }

  function restore(btn) {
    if (btn && btn.dataset.originalLabel) btn.textContent = btn.dataset.originalLabel;
  }

  function searchFallback() {
    // Always-available fallback: the dedicated search page.
    window.location.href = '/search/';
  }

  function routeFromResolved(resolved) {
    try {
      var CL = window.CareLocation;
      if (CL && typeof CL.goToBest === 'function' && resolved && resolved.city && resolved.stateCode) {
        CL.goToBest(resolved.city + ', ' + resolved.stateCode, null, '/search/');
        return;
      }
    } catch (e) {}
    searchFallback();
  }

  function handleNearMe(btn) {
    if (!('geolocation' in navigator)) {
      searchFallback();
      return;
    }
    setStatus(btn, 'Locating\u2026');
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        var lat = pos.coords.latitude;
        var lng = pos.coords.longitude;
        fetch(rootPrefix() + '?lat=' + encodeURIComponent(lat) + '&lng=' + encodeURIComponent(lng), { cache: 'no-store' })
          .then(function (r) { return r.json(); })
          .then(function (data) {
            restore(btn);
            if (data && data.ok && data.resolved) {
              routeFromResolved(data.resolved);
            } else {
              searchFallback();
            }
          })
          .catch(function () { restore(btn); searchFallback(); });
      },
      function () {
        // Permission denied or unavailable: graceful fallback.
        restore(btn);
        searchFallback();
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }

  function wireNearMe() {
    var buttons = document.querySelectorAll(BUTTON_SELECTOR);
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      if (btn.dataset.nearMeWired) continue;
      btn.dataset.nearMeWired = '1';
      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        handleNearMe(ev.currentTarget);
      });
    }
  }

  // Expose a programmatic hook so other code (e.g. Carl) can trigger it too.
  if (window.CareLocation) {
    window.CareLocation.searchNearMe = function () { handleNearMe(null); };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireNearMe);
  } else {
    wireNearMe();
  }
})();


/* ===== Canonical routing + orphaned form wiring (fix/google-search-carl-tool-use) ===== */
(function(){
  "use strict";
  var CL = window.CareLocation;
  if(!CL) return;

  // 1) Canonicalize routeFor output so it always emits /state/... paths.
  if(typeof CL.routeFor === "function" && !CL.__canonicalPatched){
    var _origRouteFor = CL.routeFor.bind(CL);
    CL.routeFor = function(){
      var out = _origRouteFor.apply(null, arguments);
      if(typeof out === "string"){ out = canonicalizePath(out); }
      return out;
    };
    CL.__canonicalPatched = true;
  }

  function canonicalizePath(p){
    if(!p) return p;
    var s = String(p).trim();
    // absolute external or anchors: leave alone
    if(/^https?:/i.test(s) || s.charAt(0) === "#") return s;
    // strip leading ./ and /
    s = s.replace(/^\.?\//, "");
    // already canonical
    if(/^state\//.test(s)) return "/" + s;
    if(/^\/state\//.test(s)) return s;
    // tools / search / other top-level known roots: keep as absolute
    if(/^(tools|search|about|services|my-care-folder|assets|state)\b/.test(s)) return "/" + s;
    // looks like stateSlug/citySlug/...  -> prefix with /state/
    if(/^[a-z0-9-]+\/[a-z0-9-]+/.test(s)) return "/state/" + s;
    return "/" + s;
  }
  CL.canonicalizePath = canonicalizePath;

  // Build a canonical city/service path from a resolved location object.
  CL.canonicalCityPath = function(resolved, serviceSlug){
    if(!resolved) return "/search/";
    var stateName = resolved.state || "";
    var citySlug = CL.slugify(resolved.city || "");
    var stateSlug = CL.slugify(stateName);
    if(!stateSlug || !citySlug) return "/search/";
    var path = "/state/" + stateSlug + "/" + citySlug + "/";
    if(serviceSlug){ path += serviceSlug + "/"; }
    return path;
  };

  // 2) Wire the homepage hero search form: .care-search-form[data-care-router]
  function wireCareRouterForm(form){
    if(!form || form.__careRouterWired) return;
    form.__careRouterWired = true;
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var selects = form.querySelectorAll("select");
      var serviceSel = selects[0];
      var zipInput = form.querySelector("input[type=text], input:not([type]), input[type=search]");
      var rawZip = zipInput ? (zipInput.value || "").trim() : "";
      // Derive service slug from selected option value (e.g. ".../home-care/index.html").
      var serviceSlug = "";
      var optVal = serviceSel ? (serviceSel.value || "") : "";
      if(/carl-care-quiz/.test(optVal)){
        // "Not sure yet" -> open Carl if available, else go to quiz page
        if(typeof window.openCarl === "function"){ window.openCarl(); return; }
        window.location.href = "/tools/carl-care-quiz/"; return;
      }
      var mServ = optVal.match(/\/([a-z-]+)\/index\.html$/);
      if(mServ && mServ[1] && mServ[1] !== "new-york-city"){ serviceSlug = mServ[1]; }
      // If a city/zip is present, resolve and route canonically.
      if(rawZip){
        var btn = form.querySelector("button, [type=submit]");
        var origLabel = btn ? btn.textContent : "";
        if(btn){ btn.disabled = true; btn.textContent = "Finding\u2026"; }
        Promise.resolve(CL.resolve(rawZip)).then(function(resolved){
          if(resolved && resolved.city && resolved.state){
            window.location.href = CL.canonicalCityPath(resolved, serviceSlug);
          } else {
            window.location.href = CL.searchFallbackUrl ? CL.canonicalizePath(CL.searchFallbackUrl(rawZip, serviceSlug)) : ("/search/?q=" + encodeURIComponent(rawZip));
          }
        }).catch(function(){
          window.location.href = "/search/?q=" + encodeURIComponent(rawZip);
        }).then(function(){ if(btn){ btn.disabled = false; btn.textContent = origLabel; } });
        return;
      }
      // No location entered: fall back to the search page (optionally with service filter).
      window.location.href = serviceSlug ? ("/search/?careType=" + encodeURIComponent(serviceSlug)) : "/search/";
    });
  }

  function initRouterForms(){
    var forms = document.querySelectorAll(".care-search-form[data-care-router]");
    for(var i=0;i<forms.length;i++){ wireCareRouterForm(forms[i]); }
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", initRouterForms);
  } else { initRouterForms(); }
})();
/* ===== end canonical routing + form wiring ===== */


/* ============================================================
   Homepage live provider search (PetsInMyCity-style)
   Renders provider cards inline beneath the hero instead of
   redirecting. Shares the loaded JSON with Carl. SEO /state/
   pages remain the canonical indexed content.
   ============================================================ */
(function(){
  'use strict';
  var CL = window.CareLocation;
  if(!CL) return;
  // Only enhance the homepage hero search form.
  function heroForm(){ return document.querySelector('.care-search-form[data-care-router]') || document.querySelector('.care-search-form'); }
  function isHomepage(){ var p = location.pathname.replace(/index\.html$/,''); return p==='/' || p===''; }

  // Map a care-type <option> value to a service slug + label + search phrase.
  var SERVICE_META = {
    'home-care': {label:'Home Care', phrase:'home care'},
    'memory-care': {label:'Memory Care', phrase:'memory care'},
    'respite-care': {label:'Respite Care', phrase:'respite care'},
    'assisted-living': {label:'Assisted Living', phrase:'assisted living'},
    'final-expense-support': {label:'Final Expense Support', phrase:'final expense insurance'},
    'ssdi': {label:'SSDI Attorney', phrase:'social security disability attorney'},
    'elder-law': {label:'Elder Law Attorney', phrase:'elder law attorney'}
  };
  function serviceFromOption(val){
    if(!val) return null;
    var m = String(val).match(/\/([a-z-]+)\/index\.htm/);
    if(m && SERVICE_META[m[1]]) return m[1];
    return null; // 'senior care' general, or quiz
  }
  // ---- Data layer -------------------------------------------------
  // Shared store so Carl can reuse the exact JSON already loaded.
  window.__careHomeProviders = window.__careHomeProviders || null;

  function fnFetch(path){
    return fetch(path, {headers:{'Accept':'application/json'}}).then(function(r){ return r.json(); });
  }
  function lookup(q){ return fnFetch('/.netlify/functions/places-lookup?q=' + encodeURIComponent(q)); }
  function nearbyByPhrase(phrase, locText){ return fnFetch('/.netlify/functions/places-nearby?q=' + encodeURIComponent(phrase + ' near ' + locText)); }
  function nearbyByCoords(phrase, lat, lng){ return fnFetch('/.netlify/functions/places-nearby?q=' + encodeURIComponent(phrase) + '&lat=' + lat + '&lng=' + lng); }

  // Resolve a free-text/zip query into a resolved location object.
  function resolveLocation(query){
    return lookup(query).then(function(d){ return (d && d.ok && d.resolved) ? d.resolved : null; });
  }

  // Run the discovery: returns {resolved, groups:[{slug,label,results}], center, locText}.
  // serviceSlug null => discover across the core care categories (grouped).
  function discover(query, serviceSlug){
    return resolveLocation(query).then(function(resolved){
      if(!resolved) return {error:'no_location'};
      var locText = [resolved.city, resolved.stateCode].filter(Boolean).join(' ');
      var slugs = serviceSlug ? [serviceSlug] : ['home-care','assisted-living','memory-care'];
      var jobs = slugs.map(function(slug){
        var meta = SERVICE_META[slug] || {label:slug, phrase:slug.replace(/-/g,' ')};
        return nearbyByPhrase(meta.phrase, locText).then(function(d){
          return {slug:slug, label:meta.label, results:(d && d.results) ? d.results : [], center:(d && d.center)||null, reason:(d&&d.reason)||null};
        }).catch(function(){ return {slug:slug, label:meta.label, results:[], error:true}; });
      });
      return Promise.all(jobs).then(function(groups){
        var center = null; groups.forEach(function(g){ if(!center && g.center) center=g.center; });
        var payload = {resolved:resolved, groups:groups, center:center, locText:locText, serviceSlug:serviceSlug||null, ts:Date.now()};
        window.__careHomeProviders = payload; // share with Carl
        try{ document.dispatchEvent(new CustomEvent('care:providers-loaded', {detail:payload})); }catch(e){}
        return payload;
      });
    });
  }
  // ---- Render layer ----------------------------------------------
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; }); }
  function stars(rating){
    var r = Math.round((Number(rating)||0)*2)/2, out='', i;
    for(i=1;i<=5;i++){ out += (r>=i) ? '\u2605' : (r>=i-0.5 ? '\u2605' : '\u2606'); }
    return out;
  }
  function cardHTML(p, canonHref){
    var ratingBits = '';
    if(typeof p.rating === 'number' && p.rating>0){
      ratingBits = '<div class="chp-rating"><span class="chp-stars" aria-hidden="true">' + stars(p.rating) + '</span> '
        + '<span class="chp-rating-num">' + esc(p.rating.toFixed(1)) + '</span>'
        + (p.userRatingsTotal ? ' <span class="chp-reviews">(' + esc(p.userRatingsTotal) + ' reviews)</span>' : '') + '</div>';
    }
    var openBits = '';
    if(p.openNow === true){ openBits = '<div class="chp-open chp-open-yes">\u25CF Open now</div>'; }
    else if(p.openNow === false){ openBits = '<div class="chp-open chp-open-no">\u25CF Closed</div>'; }
    var addr = p.address ? '<div class="chp-addr"><span class="chp-pin" aria-hidden="true">\uD83D\uDCCD</span> ' + esc(p.address) + '</div>' : '';
    var maps = p.mapsUrl ? '<a class="chp-maps" href="' + esc(p.mapsUrl) + '" target="_blank" rel="noopener noreferrer">View on Maps</a>' : '';
    var more = canonHref ? '<a class="chp-learn" href="' + esc(canonHref) + '">Local guide &amp; resources</a>' : '';
    return '<article class="care-home-provider">'
      + '<h4 class="chp-name">' + esc(p.name) + '</h4>'
      + addr + ratingBits + openBits
      + '<div class="chp-actions">' + maps + more + '</div>'
      + '</article>';
  }
  // Container injected right after the hero section (homepage only).
  function resultsContainer(){
    var c = document.getElementById('care-home-results');
    if(c) return c;
    c = document.createElement('section');
    c.id = 'care-home-results';
    c.className = 'care-home-results local-section';
    c.setAttribute('aria-live','polite');
    var hero = document.querySelector('.home-hero') || document.querySelector('.care-search-form');
    if(hero && hero.parentNode){
      var anchor = (hero.className||'').indexOf('home-hero')>=0 ? hero : (hero.closest('section')||hero);
      anchor.parentNode.insertBefore(c, anchor.nextSibling);
    } else { document.body.appendChild(c); }
    return c;
  }
  function setStatus(html){ var c = resultsContainer(); c.innerHTML = html; c.scrollIntoView({behavior:'smooth', block:'start'}); }

  function groupHTML(g, resolved){
    var canon = (CL.canonicalCityPath && resolved) ? CL.canonicalCityPath(resolved, g.slug) : null;
    if(!g.results || !g.results.length){
      return '<div class="care-home-group care-home-group-empty"><h3 class="chg-title">' + esc(g.label) + '</h3>'
        + '<p class="chg-empty">No live listings came back for this category here. Try a nearby city or broader search.</p></div>';
    }
    var cards = g.results.slice(0,8).map(function(p){ return cardHTML(p, canon); }).join('');
    var head = '<div class="chg-head"><h3 class="chg-title">' + esc(g.label) + '</h3>'
      + (canon ? '<a class="chg-all" href="' + esc(canon) + '">See full ' + esc(g.label) + ' guide \u2192</a>' : '') + '</div>';
    return '<div class="care-home-group">' + head + '<div class="care-home-grid">' + cards + '</div></div>';
  }

  function renderPayload(payload){
    if(!payload || payload.error==='no_location'){
      setStatus('<div class="care-home-results-inner"><p class="chr-msg">I could not pin down that location. Try a ZIP code (like 08050) or a city and state (like Newark NJ).</p></div>');
      return;
    }
    var r = payload.resolved;
    var place = [r.city, r.stateCode].filter(Boolean).join(', ');
    var total = payload.groups.reduce(function(n,g){ return n + (g.results?g.results.length:0); }, 0);
    var disclaimer = '<p class="chr-disclaimer">These are nearby provider listings found through live local search. CareInMyCity does not endorse, verify, or guarantee any provider \u2014 please confirm details directly with each provider.</p>';
    var headerHTML = '<div class="care-home-results-head"><h2 class="chr-title">Care Options Near ' + esc(place) + '</h2>'
      + '<p class="chr-sub">Showing top live results' + (payload.serviceSlug ? '' : ' across home care, assisted living, and memory care') + '</p></div>';
    var body = payload.groups.map(function(g){ return groupHTML(g, r); }).join('');
    setStatus('<div class="care-home-results-inner">' + headerHTML + body + disclaimer + '</div>');
  }
  // ---- Wiring -----------------------------------------------------
  function loadingState(label){ setStatus('<div class="care-home-results-inner"><p class="chr-loading">Finding ' + esc(label||'local care options') + '\u2026</p></div>'); }

  function runSearch(query, serviceSlug, label){
    loadingState(label);
    discover(query, serviceSlug).then(renderPayload).catch(function(){
      setStatus('<div class="care-home-results-inner"><p class="chr-msg">Live provider lookup had trouble just now. Please try again in a moment.</p></div>');
    });
  }

  function getFormState(form){
    var sel = form.querySelector('select');
    var zip = form.querySelector('input[type=text], input:not([type])');
    var slug = serviceFromOption(sel ? sel.value : '');
    var label = slug && SERVICE_META[slug] ? SERVICE_META[slug].label : 'local care options';
    var isQuiz = sel && /carl-care-quiz|tools\//.test(sel.value||'');
    return {zip:(zip?zip.value.trim():''), slug:slug, label:label, isQuiz:isQuiz};
  }

  function attach(){
    if(!isHomepage()) return;
    var form = heroForm();
    if(!form || form.__careHomeWired) return;
    form.__careHomeWired = true;
    // Capture-phase submit handler so it pre-empts the PR23 redirect handler.
    form.addEventListener('submit', function(e){
      var st = getFormState(form);
      if(st.isQuiz){ return; } // 'Not sure yet' keeps original behavior (Carl quiz)
      if(!st.zip){ setStatus('<div class="care-home-results-inner"><p class="chr-msg">Enter a ZIP code or city to see live local options.</p></div>'); e.preventDefault(); e.stopImmediatePropagation(); return; }
      e.preventDefault(); e.stopImmediatePropagation();
      runSearch(st.zip, st.slug, st.label);
    }, true);

    // Near Me: use geolocation, then resolve via coords, render inline.
    var nearBtn = form.querySelector('[data-near-me]');
    if(nearBtn && !nearBtn.__careHomeWired){
      nearBtn.__careHomeWired = true;
      nearBtn.addEventListener('click', function(e){
        e.preventDefault(); e.stopImmediatePropagation();
        if(!navigator.geolocation){ setStatus('<div class="care-home-results-inner"><p class="chr-msg">Location is not available in this browser. Enter a ZIP code instead.</p></div>'); return; }
        var st = getFormState(form);
        loadingState(st.label);
        navigator.geolocation.getCurrentPosition(function(pos){
          var lat = pos.coords.latitude, lng = pos.coords.longitude;
          lookup(lat + ',' + lng).then(function(d){
            var q = (d && d.resolved) ? ([d.resolved.city, d.resolved.stateCode].filter(Boolean).join(' ') || (lat+','+lng)) : (lat+','+lng);
            runSearch(q, st.slug, st.label);
          });
        }, function(){ setStatus('<div class="care-home-results-inner"><p class="chr-msg">No problem \u2014 location access was declined. Enter a ZIP code or city and we\u2019ll find local options.</p></div>'); }, {enableHighAccuracy:false, timeout:8000, maximumAge:300000});
      }, true);
    }
  }

  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', attach); }
  else { attach(); }
  // Re-attach if the form is injected late.
  setTimeout(attach, 1200);
})();

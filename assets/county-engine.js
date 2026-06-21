/**
 * CountyEngine - CareInMyCity County Intelligence Engine (Phase 1, pilot).
 *
 * Replaces generic national resource blurbs with VERIFIED county-level
 * government and nonprofit resources on city/service pages.
 *
 * Design goals:
 *  - Static + structured: loads one JSON file (assets/data/county-intelligence.json).
 *    No Google calls, no impact on the Places cache or homepage search.
 *  - Reusable loader: every page asks "what county am I in?" then retrieves the
 *    county intelligence object. No hardcoded per-page logic.
 *  - Pilot only: rendering is gated to an allowlist of pilot city/county pages.
 *  - EEAT: every section shows Source, Last Reviewed, official website, and a
 *    government / nonprofit designation. No affiliate or sponsored content.
 *  - Never fabricates: sections with no verified data are simply not rendered.
 *
 * Exposes window.CountyEngine: load, get, getForCurrentPage, detectCounty,
 * countyKeyFor, isPilotPage, summarizeForCarl, render.
 */
(function () {
  'use strict';

  var REVIEW_LABEL = 'Last reviewed';

  var CITY_TO_COUNTY = {
    'new-jersey/toms-river': 'new-jersey:ocean',
    'new-jersey/newark': 'new-jersey:essex',
    'florida/tampa': 'florida:hillsborough',
    'new-york/staten-island': 'new-york:richmond'
  };

  var PILOT_CITY_PAGES = {
    'new-jersey/toms-river': true,
    'new-jersey/newark': true,
    'florida/tampa': true,
    'new-york/staten-island': true
  };

  var SECTION_PLAN = [
    ['aaa', 'Area Agency on Aging'],
    ['officeOnAging', 'County Office on Aging'],
    ['ship', 'SHIP / Health Insurance Counseling'],
    ['elderHelpline', 'Elder Helpline'],
    ['mealsOnWheels', 'Meals on Wheels'],
    ['foodPrograms', 'Food & Nutrition Programs'],
    ['transportation', 'Transportation'],
    ['veterans', 'Veterans Affairs'],
    ['seniorCenters', 'Senior Centers'],
    ['caregiverSupport', 'Caregiver Support'],
    ['alzheimers', "Alzheimer's & Dementia Support"],
    ['medicaidOffice', 'Medicaid'],
    ['medicareResources', 'Medicare'],
    ['legalAid', 'Legal Aid'],
    ['healthDepartment', 'County Health Department'],
    ['emergencyPreparedness', 'Emergency Preparedness'],
    ['propertyTaxPrograms', 'Property Tax Relief'],
    ['prescriptionAssistance', 'Prescription Assistance'],
    ['socialServices', 'Social Services'],
    ['twoOneOne', '211 Community Help Line']
  ];

  function slug(s) {
    return String(s == null ? '' : s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c];
    });
  }
  function rootPrefix() {
    try {
      var path = window.location.pathname || '/';
      var segs = path.replace(/^\/+|\/+$/g, '').split('/');
      if (segs.length && /\.[a-z0-9]+$/i.test(segs[segs.length - 1])) segs.pop();
      var depth = segs.filter(Boolean).length;
      return depth > 0 ? new Array(depth + 1).join('../') : '';
    } catch (e) { return ''; }
  }
  function dataPath() { return rootPrefix() + 'assets/data/county-intelligence.json'; }

  function detectCounty() {
    var st = '', ci = '';
    var el = document.querySelector('[data-state][data-city]');
    if (el) { st = slug(el.getAttribute('data-state')); ci = slug(el.getAttribute('data-city')); }
    if (!st || !ci) {
      var parts = (window.location.pathname || '').replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
      if (parts[0] === 'state') parts.shift();
      if (parts.length >= 2) { st = st || slug(parts[0]); ci = ci || slug(parts[1]); }
    }
    if (st && ci) return { state: st, city: ci };
    return null;
  }
  function pageKey() {
    var d = detectCounty();
    return d ? (d.state + '/' + d.city) : '';
  }
  function countyKeyFor(state, city) {
    var k = slug(state) + '/' + slug(city);
    return CITY_TO_COUNTY[k] || null;
  }
  function isPilotPage() {
    return !!PILOT_CITY_PAGES[pageKey()];
  }

  var __cache = null;
  function load() {
    if (__cache) return Promise.resolve(__cache);
    return fetch(dataPath(), { headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { __cache = d || { counties: {} }; return __cache; })
      .catch(function () { __cache = { counties: {} }; return __cache; });
  }
  function get(countyKey) {
    if (!countyKey) return Promise.resolve(null);
    return load().then(function (d) {
      return (d && d.counties && d.counties[countyKey]) ? d.counties[countyKey] : null;
    });
  }
  function getForCurrentPage() {
    var d = detectCounty();
    if (!d) return Promise.resolve(null);
    return get(countyKeyFor(d.state, d.city));
  }

  function summarizeForCarl(c) {
    if (!c) return '';
    var bits = [];
    var lead = c.aaa || c.officeOnAging;
    if (lead) bits.push('In ' + c.county + ', ' + c.state + ', the ' + lead.name + (lead.phone ? ' (' + lead.phone + ')' : '') + ' can help with aging services and caregiver support.');
    if (c.ship) bits.push(c.ship.name + (c.ship.phone ? ' (' + c.ship.phone + ')' : '') + ' offers free health-insurance/Medicare counseling.');
    if (c.veterans) bits.push('Veterans can contact ' + c.veterans.name + (c.veterans.phone ? ' at ' + c.veterans.phone : '') + '.');
    bits.push('Always prefer these verified county resources over generic advice.');
    return bits.join(' ');
  }

  function designationPill(d) {
    var map = { government:'Government', federal:'Government (Federal)', state:'Government (State)', nonprofit:'Nonprofit' };
    var label = map[d] || 'Public resource';
    var cls = (d === 'nonprofit') ? 'cic-pill-np' : 'cic-pill-gov';
    return '<span class="cic-pill ' + cls + '">' + esc(label) + '</span>';
  }
  function resourceCard(item, fallbackLabel) {
    if (!item || !item.name) return '';
    var phone = item.phone ? '<a class="cic-phone" href="tel:' + esc(item.phone.replace(/[^0-9+]/g, '')) + '">' + esc(item.phone) + '</a>' : '';
    var site = item.website ? '<a class="cic-link" href="' + esc(item.website) + '" target="_blank" rel="noopener noreferrer">Official website \u2192</a>' : '';
    var note = item.note ? '<p class="cic-note">' + esc(item.note) + '</p>' : '';
    var addr = item.address ? '<p class="cic-addr">' + esc(item.address) + '</p>' : '';
    var src = item.source ? '<span class="cic-src">Source: ' + esc(item.source) + '</span>' : '';
    return '<article class="cic-card">' +
      '<div class="cic-card-head"><h3>' + esc(item.name || fallbackLabel) + '</h3>' + designationPill(item.designation) + '</div>' +
      addr + note +
      '<div class="cic-card-actions">' + phone + site + '</div>' +
      '<div class="cic-card-meta">' + src + '</div>' +
      '</article>';
  }
  function buildSectionHTML(c) {
    var cards = [];
    for (var i = 0; i < SECTION_PLAN.length; i++) {
      var field = SECTION_PLAN[i][0], label = SECTION_PLAN[i][1];
      var item = c[field];
      if (item && item.name) {
        var html = resourceCard(item, label);
        if (html) cards.push('<div class="cic-group" data-cic-field="' + esc(field) + '"><div class="cic-group-label">' + esc(label) + '</div>' + html + '</div>');
      }
    }
    if (!cards.length) return '';
    var sources = (c.sources || []).map(function (s) {
      return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' + esc(s.label) + '</a>';
    }).join(' \u00b7 ');
    var reviewed = c.lastReviewed ? ('<span class="cic-reviewed">' + REVIEW_LABEL + ': ' + esc(c.lastReviewed) + '</span>') : '';
    return '<section class="cic-section local-section" id="county-resource-center" aria-label="County Resource Center">' +
      '<div class="container cic-inner">' +
      '<div class="cic-head">' +
      '<div class="label">County Resource Center</div>' +
      '<h2>Verified resources in ' + esc(c.county) + ', ' + esc(c.stateCode || c.state) + '</h2>' +
      '<p class="cic-sub">Government and nonprofit programs for older adults and caregivers. ' + reviewed + '</p>' +
      '</div>' +
      '<div class="cic-grid">' + cards.join('') + '</div>' +
      (sources ? '<p class="cic-sources"><strong>Sources:</strong> ' + sources + '</p>' : '') +
      '<p class="cic-disclaimer">These are official government and nonprofit resources, not paid placements, endorsements, or professional advice. Always confirm details directly with each agency.</p>' +
      '</div></section>';
  }
  function ensureStyles() {
    if (document.getElementById('cic-style')) return;
    var css = ''
      + '#county-resource-center{padding:2.5rem 0;background:#f6faf9;}'
      + '#county-resource-center .cic-inner{max-width:1080px;margin:0 auto;padding:0 1rem;}'
      + '#county-resource-center .cic-head{margin-bottom:1.5rem;}'
      + '#county-resource-center .cic-head .label{display:inline-block;font-size:.78rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#1f8f87;margin-bottom:.4rem;}'
      + '#county-resource-center h2{font-size:clamp(1.4rem,3vw,2rem);margin:0 0 .4rem;color:#1d3a37;}'
      + '#county-resource-center .cic-sub{color:#5a6b6a;margin:0;font-size:.95rem;}'
      + '#county-resource-center .cic-reviewed{display:inline-block;margin-left:.4rem;color:#7a8786;font-size:.82rem;}'
      + '#county-resource-center .cic-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem;}'
      + '#county-resource-center .cic-group-label{font-size:.74rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#7a8786;margin:0 0 .4rem;}'
      + '#county-resource-center .cic-card{background:#fff;border:1px solid #e6efee;border-radius:14px;padding:1.05rem 1.1rem;box-shadow:0 1px 3px rgba(20,50,48,.05);display:flex;flex-direction:column;gap:.4rem;height:100%;}'
      + '#county-resource-center .cic-card-head{display:flex;justify-content:space-between;align-items:flex-start;gap:.6rem;}'
      + '#county-resource-center .cic-card-head h3{font-size:1rem;margin:0;color:#1d3a37;line-height:1.3;}'
      + '#county-resource-center .cic-pill{font-size:.66rem;font-weight:700;padding:2px 8px;border-radius:999px;white-space:nowrap;}'
      + '#county-resource-center .cic-pill-gov{background:#e7eefb;color:#1c5fbd;}'
      + '#county-resource-center .cic-pill-np{background:#e6f5ec;color:#16a052;}'
      + '#county-resource-center .cic-note{font-size:.86rem;color:#5a6b6a;margin:.1rem 0;line-height:1.45;}'
      + '#county-resource-center .cic-addr{font-size:.82rem;color:#7a8786;margin:.1rem 0;}'
      + '#county-resource-center .cic-card-actions{margin-top:auto;display:flex;flex-wrap:wrap;gap:.9rem;padding-top:.35rem;}'
      + '#county-resource-center .cic-phone,#county-resource-center .cic-link{font-size:.86rem;font-weight:600;text-decoration:none;}'
      + '#county-resource-center .cic-phone{color:#1f6f6b;}'
      + '#county-resource-center .cic-link{color:#1f8f87;}'
      + '#county-resource-center .cic-phone:hover,#county-resource-center .cic-link:hover{text-decoration:underline;}'
      + '#county-resource-center .cic-card-meta{font-size:.74rem;color:#9aa6a5;}'
      + '#county-resource-center .cic-sources{margin-top:1.5rem;font-size:.84rem;color:#5a6b6a;}'
      + '#county-resource-center .cic-sources a{color:#1f8f87;}'
      + '#county-resource-center .cic-disclaimer{margin-top:.75rem;font-size:.8rem;color:#7a8786;line-height:1.5;}'
      + '@media (max-width:640px){#county-resource-center .cic-grid{grid-template-columns:1fr;}}';
    var st = document.createElement('style');
    st.id = 'cic-style';
    st.textContent = css;
    document.head.appendChild(st);
  }
  function anchorPoint() {
    return document.getElementById('helpful-listings')
      || document.querySelector('.public-resource-listings-section')
      || document.querySelector('.provider-section')
      || document.querySelector('main');
  }
  function renderInto(c) {
    if (!c) return false;
    if (document.getElementById('county-resource-center')) return true;
    var html = buildSectionHTML(c);
    if (!html) return false;
    ensureStyles();
    var anchor = anchorPoint();
    if (!anchor) return false;
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    var node = tmp.firstChild;
    if (anchor.id === 'helpful-listings' || /public-resource-listings-section|provider-section/.test(anchor.className)) {
      anchor.parentNode.insertBefore(node, anchor.nextSibling);
    } else {
      anchor.appendChild(node);
    }
    try { document.dispatchEvent(new CustomEvent('county:loaded', { detail: { county: c } })); } catch (e) {}
    return true;
  }

  function init() {
    if (!isPilotPage()) return;
    getForCurrentPage().then(function (c) {
      if (c) {
        renderInto(c);
        try { var d = detectCounty(); window.__countyIntelligence = { key: countyKeyFor(d.state, d.city), county: c, summary: summarizeForCarl(c) }; } catch (e) {}
      }
    });
  }

  window.CountyEngine = {
    load: load,
    get: get,
    getForCurrentPage: getForCurrentPage,
    detectCounty: detectCounty,
    countyKeyFor: countyKeyFor,
    isPilotPage: isPilotPage,
    summarizeForCarl: summarizeForCarl,
    CITY_TO_COUNTY: CITY_TO_COUNTY,
    PILOT_CITY_PAGES: PILOT_CITY_PAGES,
    render: renderInto
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

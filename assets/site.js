window.CAREINMYCITY_RESOURCE_FALLBACK = [
  {
    "id": "guide-boca-home-care-questions",
    "type": "guide",
    "name": "Questions to Ask Before Choosing Home Care in Boca Raton",
    "category": "home-care",
    "state": "florida",
    "city": "boca-raton",
    "nearbyAreas": [
      "delray-beach",
      "deerfield-beach",
      "boynton-beach"
    ],
    "description": "A plain-English checklist for families comparing in-home care, companion support, caregiver relief, transportation help, and safety support.",
    "tags": [
      "questions to ask",
      "in-home support",
      "caregiver relief"
    ],
    "ctaLabel": "View guide",
    "url": "../../search/index.html?state=florida&location=boca-raton&careType=home-care",
    "verified": false,
    "featured": true
  },
  {
    "id": "guide-boca-memory-safety",
    "type": "guide",
    "name": "Memory and Safety Planning for Boca Raton Families",
    "category": "memory-care",
    "state": "florida",
    "city": "boca-raton",
    "nearbyAreas": [
      "delray-beach",
      "deerfield-beach",
      "west-palm-beach"
    ],
    "description": "Helpful starting points for families noticing wandering, confusion, medication safety issues, nighttime movement, or caregiver burnout.",
    "tags": [
      "memory care",
      "wandering",
      "home safety"
    ],
    "ctaLabel": "View guide",
    "url": "../../search/index.html?state=florida&location=boca-raton&careType=memory-care",
    "verified": false,
    "featured": true
  },
  {
    "id": "guide-boca-adult-children",
    "type": "guide",
    "name": "Adult Children Managing Care From Boca Raton or Out of State",
    "category": "caregiver-support",
    "state": "florida",
    "city": "boca-raton",
    "nearbyAreas": [
      "delray-beach",
      "deerfield-beach",
      "boynton-beach",
      "west-palm-beach"
    ],
    "description": "A guide for sons, daughters, and relatives balancing work, distance, family responsibilities, and the emotional weight of helping a parent.",
    "tags": [
      "family caregivers",
      "adult children",
      "planning"
    ],
    "ctaLabel": "View guide",
    "url": "../../search/index.html?state=florida&location=boca-raton&need=planning-ahead",
    "verified": false,
    "featured": true
  },
  {
    "id": "guide-florida-home-care",
    "type": "guide",
    "name": "How Florida Families Start a Home Care Search",
    "category": "home-care",
    "state": "florida",
    "city": "",
    "nearbyAreas": [],
    "description": "A statewide guide to understanding non-medical home care, companion care, caregiver relief, transportation help, and common questions.",
    "tags": [
      "Florida",
      "home care",
      "guide"
    ],
    "ctaLabel": "View guide",
    "url": "../search/index.html?state=florida&careType=home-care",
    "verified": false,
    "featured": true
  },
  {
    "id": "guide-florida-elder-law",
    "type": "guide",
    "name": "Florida Elder Law and Family Planning Starting Points",
    "category": "elder-law",
    "state": "florida",
    "city": "",
    "nearbyAreas": [],
    "description": "General planning questions for families thinking about elder law, estate planning, guardianship, benefits, and care responsibilities.",
    "tags": [
      "Florida",
      "elder law",
      "planning"
    ],
    "ctaLabel": "View guide",
    "url": "../search/index.html?state=florida&careType=elder-law",
    "verified": false,
    "featured": true
  }
];


const fadeEls = document.querySelectorAll('.fade-up');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const siblings = Array.from(entry.target.parentElement.querySelectorAll('.fade-up:not(.visible)'));
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('visible'), Math.max(idx, 0) * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  fadeEls.forEach(el => observer.observe(el));
} else {
  fadeEls.forEach(el => el.classList.add('visible'));
}

const careFinderForm = document.getElementById('careFinderForm');
if (careFinderForm) {
  careFinderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const careType = document.getElementById('careType')?.value || '';
    const zip = document.getElementById('zip')?.value.trim() || '';
    const timeline = document.getElementById('timeline')?.value || '';
    const params = new URLSearchParams({ careType, timeline });
    if (zip) params.set('zip', zip);
    window.location.href = `search/?${params.toString()}`;
  });
}

const directorySearchForm = document.getElementById('directorySearchForm');
if (directorySearchForm) {
  directorySearchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const q = document.getElementById('directorySearch')?.value.trim() || '';
    if (!q) return;
    window.location.href = `search/?q=${encodeURIComponent(q)}`;
  });
}

const floridaSearchForm = document.getElementById('floridaSearchForm');
if (floridaSearchForm) {
  floridaSearchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const careType = document.getElementById('careType')?.value || '';
    const cityOrZip = document.getElementById('cityOrZip')?.value.trim() || '';
    const params = new URLSearchParams({ state: 'florida', careType });
    if (cityOrZip) params.set('location', cityOrZip);
    window.location.href = `../search/?${params.toString()}`;
  });
}

const searchResults = document.getElementById('searchResults');
if (searchResults) {
  const params = new URLSearchParams(window.location.search);
  const careType = params.get('careType') || params.get('need') || 'care resources';
  const state = params.get('state') || '';
  const location = params.get('location') || params.get('zip') || params.get('q') || '';
  const cleanCare = careType.replace(/-/g, ' ');
  const cleanState = state ? state.replace(/-/g, ' ') : '';
  const headline = document.getElementById('searchHeadline');
  if (headline) {
    headline.textContent = `Search results for ${cleanCare}${location ? ' near ' + location : ''}${cleanState ? ' in ' + cleanState : ''}`;
  }
}


document.querySelectorAll('.mobile-menu-toggle').forEach((button) => {
  button.addEventListener('click', () => {
    const nav = button.closest('.nav');
    const links = nav ? nav.querySelector('.nav-links') : null;
    if (!links) return;

    const isOpen = links.classList.toggle('open');
    button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    button.textContent = isOpen ? 'Close' : 'Menu';
  });
});

document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', () => {
    const nav = link.closest('.nav');
    const links = nav ? nav.querySelector('.nav-links') : null;
    const button = nav ? nav.querySelector('.mobile-menu-toggle') : null;
    if (!links || !button) return;
    links.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
    button.textContent = 'Menu';
  });
});



function normalizeValue(value) {
  return (value || '').toString().trim().toLowerCase().replace(/\s+/g, '-');
}

function titleCaseSlug(value) {
  if (!value) return '';
  return value
    .toString()
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function resourceMatches(resource, filters) {
  const state = normalizeValue(filters.state);
  const city = normalizeValue(filters.location || filters.city);
  const category = normalizeValue(filters.careType || filters.category);
  const q = (filters.q || filters.need || '').toString().trim().toLowerCase();

  const resourceState = normalizeValue(resource.state);
  const resourceCity = normalizeValue(resource.city);
  const resourceCategory = normalizeValue(resource.category);
  const nearbyAreas = (resource.nearbyAreas || []).map(normalizeValue);
  const haystack = [
    resource.name,
    resource.description,
    resource.category,
    resource.state,
    resource.city,
    ...(resource.tags || []),
    ...(resource.nearbyAreas || [])
  ].join(' ').toLowerCase();

  if (state && resourceState !== state) return false;
  if (city && resourceCity && resourceCity !== city && !nearbyAreas.includes(city)) return false;
  if (city && !resourceCity && !nearbyAreas.includes(city) && resource.state) return false;
  if (category && resourceCategory !== category) return false;
  if (q && !haystack.includes(q.replace(/-/g, ' ')) && !haystack.includes(q)) return false;

  return true;
}

function resolveResourceUrl(resource) {
  if (!resource.url || resource.url === '#') return '#';

  const url = resource.url;

  if (url.startsWith('http') || url.startsWith('/') || url.startsWith('#')) return url;

  const path = window.location.pathname;

  if (path.includes('/florida/boca-raton/') && url.startsWith('../../')) return url;
  if (path.includes('/florida/') && url.startsWith('../')) return url;
  if (path.includes('/search/') && url.startsWith('../')) return url;
  if (path.includes('/services/') && url.startsWith('../../')) return url;

  return url.replace(/^\.\.\/\.\.\//, '../../').replace(/^\.\.\//, '../');
}

function buildResourceCard(resource) {
  const card = document.createElement('article');
  card.className = `resource-result-card${resource.featured ? ' featured' : ''}`;

  const type = resource.type === 'guide' ? 'Guide' : 'Resource';
  const tags = (resource.tags || []).slice(0, 4).map(tag => `<span class="resource-tag">${tag}</span>`).join('');
  const area = [resource.city ? titleCaseSlug(resource.city) : '', resource.state ? titleCaseSlug(resource.state) : ''].filter(Boolean).join(', ');
  const label = resource.ctaLabel || (resource.type === 'guide' ? 'View guide' : 'Compare option');
  const url = resolveResourceUrl(resource);

  card.innerHTML = `
    <span class="resource-type">${type}${resource.featured ? ' · Featured' : ''}</span>
    <h3>${resource.name}</h3>
    <p>${resource.description}</p>
    ${area ? `<p><strong>Area:</strong> ${area}</p>` : ''}
    <div class="resource-tags">${tags}</div>
    <div class="resource-card-actions">
      <a href="${url}">${label}</a>
      <button class="secondary-action" type="button">Save for later</button>
    </div>
  `;

  const saveButton = card.querySelector('button');
  saveButton.addEventListener('click', () => {
    saveButton.textContent = 'Saved';
    saveButton.disabled = true;
  });

  return card;
}

async function loadResources() {
  const containers = document.querySelectorAll('[data-resource-results]');
  if (!containers.length) return;

  let resources = [];
  try {
    const response = await fetch(getResourceDataPath());
    resources = await response.json();
  } catch (error) {
    resources = Array.isArray(window.CAREINMYCITY_RESOURCE_FALLBACK)
      ? window.CAREINMYCITY_RESOURCE_FALLBACK
      : [];
  }

  containers.forEach(container => {
    const params = new URLSearchParams(window.location.search);
    const datasetFilters = {
      state: container.dataset.state,
      location: container.dataset.location,
      careType: container.dataset.category
    };

    const filters = {
      state: params.get('state') || datasetFilters.state || '',
      location: params.get('location') || params.get('city') || datasetFilters.location || '',
      careType: params.get('careType') || params.get('category') || datasetFilters.careType || '',
      q: params.get('q') || '',
      need: params.get('need') || ''
    };

    const matches = resources.filter(resource => resourceMatches(resource, filters));
    const featured = matches.filter(resource => resource.featured);
    const regular = matches.filter(resource => !resource.featured);
    const ordered = [...featured, ...regular];

    const meta = container.closest('section')?.querySelector('[data-resource-meta]');
    if (meta) {
      const locationLabel = filters.location ? titleCaseSlug(filters.location) : (filters.state ? titleCaseSlug(filters.state) : 'all areas');
      const categoryLabel = filters.careType ? titleCaseSlug(filters.careType) : 'all care categories';
      meta.textContent = `${ordered.length} resource${ordered.length === 1 ? '' : 's'} found for ${categoryLabel} in ${locationLabel}.`;
    }

    container.innerHTML = '';

    if (!ordered.length) {
      container.innerHTML = `
        <div class="no-results-card">
          <h3>No matching resources yet.</h3>
          <p>This directory is still growing. Try widening your search by choosing a state only, removing the city, or selecting a broader care category.</p>
        </div>
      `;
      return;
    }

    ordered.forEach(resource => container.appendChild(buildResourceCard(resource)));
  });
}

function getResourceDataPath() {
  const path = window.location.pathname;
  if (path.includes('/services/')) return '../../assets/data/resources.json';
  if (path.includes('/states/') || path.includes('/search/') || path.includes('/about/')) return '../assets/data/resources.json';
  const states = window.CAREINMYCITY_STATES || [];
  const matchedState = states.find(s => path.includes('/' + s.slug + '/'));
  if (matchedState) {
    const parts = path.split('/').filter(Boolean);
    if (parts.length >= 3) return '../../../assets/data/resources.json';
    if (parts.length >= 2) return '../../assets/data/resources.json';
    return '../assets/data/resources.json';
  }
  return 'assets/data/resources.json';
}

document.addEventListener('DOMContentLoaded', loadResources);

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('resourceFilterForm');
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  ['state', 'location', 'careType'].forEach((name) => {
    const el = form.querySelector(`[name="${name}"]`);
    if (el && params.get(name)) el.value = params.get(name);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const next = new URLSearchParams();
    ['state', 'location', 'careType'].forEach((name) => {
      const value = form.querySelector(`[name="${name}"]`)?.value;
      if (value) next.set(name, value);
    });
    window.location.href = `index.html?${next.toString()}#search-results`;
  });
});


// Carl, your Care Companion — conversational widget (no quiz, no keyword routing).
// Talks to the /carl-care-quiz Netlify function with full conversation history so
// Carl behaves like a real care navigator that remembers context across turns.
function getCarlBasePath() {
  const path = window.location.pathname;
  if (path.includes('/florida/boca-raton/')) return '../../';
  if (path.includes('/florida/')) return '../';
  if (path.includes('/search/')) return '../';
  if (path.includes('/tools/')) return '../';
  if (path.includes('/about/')) return '../';
  if (path.includes('/services/')) return '../';
  if (path.includes('/states/')) return '../';
  const seg = path.split("/").filter(Boolean);
  if (seg.length >= 2) return '../../';
  if (seg.length === 1) return '../';
  return './';
}

// Endpoint for the conversational backend.
var CARL_ENDPOINT = '/.netlify/functions/carl-care-quiz';

// In-memory conversation history for the current visit.
var carlHistory = [];
var carlBusy = false;
var carlGreeted = false;

// Quietly record useful signals through whatever analytics the page already loads.
// Never blocks the conversation; never asks form-style questions.
function carlTrack(eventName, params) {
  try {
    if (typeof window.gtag === 'function') { window.gtag('event', eventName, params || {}); }
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push(Object.assign({ event: 'carl_' + eventName }, params || {}));
    }
  } catch (e) {}
}

// Detect lightweight lead signals from free text, only to log them (not to route).
function carlDetectSignals(text) {
  var t = (text || "").toLowerCase();
  var signals = {};
  if (/\bmom\b|mother|\bdad\b|father|parent/.test(t)) signals.care_for = 'parent';
  else if (/husband|wife|spouse|partner/.test(t)) signals.care_for = 'spouse';
  else if (/myself|\bi am\b|for me\b/.test(t)) signals.care_for = 'self';
  if (/memory|forget|dementia|alzheimer|confus/.test(t)) signals.concern = 'memory';
  else if (/fall|fell|balance|unsteady/.test(t)) signals.concern = 'falls';
  else if (/overwhelm|burnout|exhaust|caregiver/.test(t)) signals.concern = 'caregiver_stress';
  if (/afford|budget|cost|expensive|pay for|money/.test(t)) signals.budget_concern = true;
  if (/medicare|medicaid|insurance|benefit/.test(t)) signals.insurance_concern = true;
  if (/\bdog\b|\bcat\b|\bpet\b|companion animal/.test(t)) signals.pet = true;
  var zip = t.match(/\b\d{5}\b/); if (zip) signals.zip = zip[0];
  return signals;
}

// Render a message bubble. Carl messages may include a single inline link when he
// naturally points to local resources; we linkify a bare URL if present.
function addCarlMessage(text, type) {
  type = type || 'carl';
  var messages = document.getElementById('carlMessages');
  if (!messages) return null;
  var wrap = document.createElement('div');
  // Match existing CSS: .carl-message with a .user or .carl modifier.
  wrap.className = 'carl-message ' + (type === 'user' ? 'user' : 'carl');
  wrap.textContent = text;
  messages.appendChild(wrap);
  messages.scrollTop = messages.scrollHeight;
  return wrap;
}

function setCarlTyping(on) {
  var messages = document.getElementById('carlMessages');
  if (!messages) return;
  var existing = document.getElementById('carlTyping');
  if (on) {
    if (existing) return;
    var el = document.createElement('div');
    el.id = 'carlTyping';
    el.className = 'carl-message carl';
    el.textContent = 'Carl is typing\u2026';
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  } else if (existing) {
    existing.remove();
  }
}

// Local conversational fallback if the network/function is unavailable.
// Still warm and curious — never a canned routing template.
function carlLocalReply() {
  var turns = carlHistory.filter(function (m) { return m.role === "user"; }).length;
  var last = "";
  for (var i = carlHistory.length - 1; i >= 0; i--) { if (carlHistory[i].role === "user") { last = carlHistory[i].content.toLowerCase(); break; } }
  if (turns <= 1) {
    if (/forget|memory|confus/.test(last)) return "That can be really worrying to watch. How old is she, and what sorts of things has she been forgetting lately?";
    if (/fall|fell|balance/.test(last)) return "Falls are scary, and they are often what finally worries families. Has it happened more than once, and is he still getting around the house okay?";
    if (/overwhelm|exhaust|burnout|tired/.test(last)) return "Honestly, that is what so many caregivers tell me — you are carrying a lot. Who are you caring for, and what does a typical day look like right now?";
    if (/afford|cost|money|budget/.test(last)) return "Cost is one of the first things almost everyone runs into, so you are in good company. Tell me a bit about who needs care and what they are needing day to day.";
    return "Thanks for sharing that. So I can actually be helpful — are you looking into this for yourself or for someone you care about?";
  }
  return "Got it, that helps. Tell me a little more about how things are going day to day, and we can sort out a sensible next step together.";
}

// Send the running conversation to Carl and render his reply.
function sendCarlMessage(userText) {
  if (carlBusy) return;
  var text = (userText || "").trim();
  if (!text) return;

  addCarlMessage(text, 'user');
  carlHistory.push({ role: 'user', content: text });

  var signals = carlDetectSignals(text);
  carlTrack('message', { turn: carlHistory.length, signals: JSON.stringify(signals) });
  if (Object.keys(signals).length) { carlTrack("signal", signals); }

  carlBusy = true;
  setCarlTyping(true);

  var base = getCarlBasePath();
  var pageContext = document.title || window.location.pathname;

  fetch(CARL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: carlHistory.slice(-24), pageContext: pageContext })
  })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      setCarlTyping(false);
      carlBusy = false;
      var reply = data && data.reply ? data.reply : carlLocalReply();
      addCarlMessage(reply, 'carl');
      carlHistory.push({ role: 'assistant', content: reply });
    })
    .catch(function () {
      setCarlTyping(false);
      carlBusy = false;
      var reply = carlLocalReply();
      addCarlMessage(reply, 'carl');
      carlHistory.push({ role: 'assistant', content: reply });
    });
}

// Chips are conversation STARTERS, not categories. Clicking one sends a natural
// first-person message so Carl responds conversationally and asks a follow-up.
var CARL_CHIP_STARTERS = {
  'home-care': 'My parent wants to stay at home, and I am trying to figure out if that is still realistic.',
  'memory-care': 'I am noticing some memory changes and I am not sure what to do.',
  'caregiver-support': 'I am feeling pretty overwhelmed with caregiving right now.',
  'assisted-living': 'I am starting to wonder about assisted living options.',
  'elder-law': 'I have some questions about planning, benefits, or legal stuff.',
  'final-expense-support': 'I am trying to plan ahead and get organized for what is coming.',
  'medicare': 'I have some Medicare questions I am trying to sort out.'
};

function carlChipStarter(need) {
  return CARL_CHIP_STARTERS[need] || "I could use some help thinking through a care situation.";
}

function carlGreet() {
  if (carlGreeted) return;
  carlGreeted = true;
  var greeting = "Hi, I'm Carl. I help families think through care decisions, find the right resources, and figure out the next step. What's going on today?";
  var messages = document.getElementById('carlMessages');
  if (messages && !messages.querySelector(".carl-message")) {
    addCarlMessage(greeting, 'carl');
  }
}

function openCarl() {
  var panel = document.getElementById('carlPanel');
  var floating = document.querySelector('.carl-floating');
  if (floating) floating.classList.add("carl-open");
  if (panel) { panel.hidden = false; panel.classList.add('open'); }
  carlGreet();
  carlTrack('open', {});
  var input = document.getElementById('carlInput');
  if (input) { try { input.focus(); } catch (e) {} }
}

function closeCarl() {
  var panel = document.getElementById('carlPanel');
  var floating = document.querySelector('.carl-floating');
  if (floating) floating.classList.remove("carl-open");
  if (panel) { panel.classList.remove('open'); panel.hidden = true; }
}

function initializeCarl() {
  document.querySelectorAll('.carl-launcher, [data-open-carl]').forEach(function (button) {
    button.addEventListener('click', openCarl);
  });

  document.querySelectorAll('.carl-close, [data-close-carl]').forEach(function (button) {
    button.addEventListener('click', closeCarl);
  });

  // Chips start a conversation instead of routing to a category.
  document.querySelectorAll('[data-carl-need]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var need = chip.getAttribute('data-carl-need');
      carlTrack('chip', { need: need });
      sendCarlMessage(carlChipStarter(need));
    });
  });

  // Free-text input goes straight to Carl (no keyword classification).
  var form = document.getElementById('carlForm');
  var input = document.getElementById('carlInput');
  var sendBtn = document.getElementById('carlSend');

  function submitInput(e) {
    if (e) e.preventDefault();
    var value = input ? input.value.trim() : '';
    if (!value) return;
    if (input) input.value = '';
    sendCarlMessage(value);
  }

  if (form) form.addEventListener('submit', submitInput);
  if (sendBtn) sendBtn.addEventListener('click', submitInput);
  if (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { submitInput(e); }
    });
  }
}

document.addEventListener('DOMContentLoaded', initializeCarl);

/* Safe national coverage JS */
window.CAREINMYCITY_STATES = [{"name": "Alabama", "slug": "alabama", "abbr": "AL", "region": "South"}, {"name": "Alaska", "slug": "alaska", "abbr": "AK", "region": "West"}, {"name": "Arizona", "slug": "arizona", "abbr": "AZ", "region": "West"}, {"name": "Arkansas", "slug": "arkansas", "abbr": "AR", "region": "South"}, {"name": "California", "slug": "california", "abbr": "CA", "region": "West"}, {"name": "Colorado", "slug": "colorado", "abbr": "CO", "region": "West"}, {"name": "Connecticut", "slug": "connecticut", "abbr": "CT", "region": "Northeast"}, {"name": "Delaware", "slug": "delaware", "abbr": "DE", "region": "South"}, {"name": "Florida", "slug": "florida", "abbr": "FL", "region": "South"}, {"name": "Georgia", "slug": "georgia", "abbr": "GA", "region": "South"}, {"name": "Hawaii", "slug": "hawaii", "abbr": "HI", "region": "West"}, {"name": "Idaho", "slug": "idaho", "abbr": "ID", "region": "West"}, {"name": "Illinois", "slug": "illinois", "abbr": "IL", "region": "Midwest"}, {"name": "Indiana", "slug": "indiana", "abbr": "IN", "region": "Midwest"}, {"name": "Iowa", "slug": "iowa", "abbr": "IA", "region": "Midwest"}, {"name": "Kansas", "slug": "kansas", "abbr": "KS", "region": "Midwest"}, {"name": "Kentucky", "slug": "kentucky", "abbr": "KY", "region": "South"}, {"name": "Louisiana", "slug": "louisiana", "abbr": "LA", "region": "South"}, {"name": "Maine", "slug": "maine", "abbr": "ME", "region": "Northeast"}, {"name": "Maryland", "slug": "maryland", "abbr": "MD", "region": "South"}, {"name": "Massachusetts", "slug": "massachusetts", "abbr": "MA", "region": "Northeast"}, {"name": "Michigan", "slug": "michigan", "abbr": "MI", "region": "Midwest"}, {"name": "Minnesota", "slug": "minnesota", "abbr": "MN", "region": "Midwest"}, {"name": "Mississippi", "slug": "mississippi", "abbr": "MS", "region": "South"}, {"name": "Missouri", "slug": "missouri", "abbr": "MO", "region": "Midwest"}, {"name": "Montana", "slug": "montana", "abbr": "MT", "region": "West"}, {"name": "Nebraska", "slug": "nebraska", "abbr": "NE", "region": "Midwest"}, {"name": "Nevada", "slug": "nevada", "abbr": "NV", "region": "West"}, {"name": "New Hampshire", "slug": "new-hampshire", "abbr": "NH", "region": "Northeast"}, {"name": "New Jersey", "slug": "new-jersey", "abbr": "NJ", "region": "Northeast"}, {"name": "New Mexico", "slug": "new-mexico", "abbr": "NM", "region": "West"}, {"name": "New York", "slug": "new-york", "abbr": "NY", "region": "Northeast"}, {"name": "North Carolina", "slug": "north-carolina", "abbr": "NC", "region": "South"}, {"name": "North Dakota", "slug": "north-dakota", "abbr": "ND", "region": "Midwest"}, {"name": "Ohio", "slug": "ohio", "abbr": "OH", "region": "Midwest"}, {"name": "Oklahoma", "slug": "oklahoma", "abbr": "OK", "region": "South"}, {"name": "Oregon", "slug": "oregon", "abbr": "OR", "region": "West"}, {"name": "Pennsylvania", "slug": "pennsylvania", "abbr": "PA", "region": "Northeast"}, {"name": "Rhode Island", "slug": "rhode-island", "abbr": "RI", "region": "Northeast"}, {"name": "South Carolina", "slug": "south-carolina", "abbr": "SC", "region": "South"}, {"name": "South Dakota", "slug": "south-dakota", "abbr": "SD", "region": "Midwest"}, {"name": "Tennessee", "slug": "tennessee", "abbr": "TN", "region": "South"}, {"name": "Texas", "slug": "texas", "abbr": "TX", "region": "South"}, {"name": "Utah", "slug": "utah", "abbr": "UT", "region": "West"}, {"name": "Vermont", "slug": "vermont", "abbr": "VT", "region": "Northeast"}, {"name": "Virginia", "slug": "virginia", "abbr": "VA", "region": "South"}, {"name": "Washington", "slug": "washington", "abbr": "WA", "region": "West"}, {"name": "West Virginia", "slug": "west-virginia", "abbr": "WV", "region": "South"}, {"name": "Wisconsin", "slug": "wisconsin", "abbr": "WI", "region": "Midwest"}, {"name": "Wyoming", "slug": "wyoming", "abbr": "WY", "region": "West"}];
window.CAREINMYCITY_RESOURCE_FALLBACK = [{"id": "guide-boca-home-care-questions", "type": "guide", "name": "Questions to Ask Before Choosing Home Care in Boca Raton", "category": "home-care", "state": "florida", "city": "boca-raton", "nearbyAreas": ["delray-beach", "deerfield-beach", "boynton-beach"], "description": "A plain-English checklist for families comparing in-home care, companion support, caregiver relief, transportation help, and safety support.", "tags": ["questions to ask", "in-home support", "caregiver relief"], "ctaLabel": "View guide", "url": "../../search/index.html?state=florida&location=boca-raton&careType=home-care", "verified": false, "featured": true}, {"id": "guide-boca-memory-safety", "type": "guide", "name": "Memory and Safety Planning for Boca Raton Families", "category": "memory-care", "state": "florida", "city": "boca-raton", "nearbyAreas": ["delray-beach", "deerfield-beach", "west-palm-beach"], "description": "Helpful starting points for families noticing wandering, confusion, medication safety issues, nighttime movement, or caregiver burnout.", "tags": ["memory care", "wandering", "home safety"], "ctaLabel": "View guide", "url": "../../search/index.html?state=florida&location=boca-raton&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-boca-adult-children", "type": "guide", "name": "Adult Children Managing Care From Boca Raton or Out of State", "category": "caregiver-support", "state": "florida", "city": "boca-raton", "nearbyAreas": ["delray-beach", "deerfield-beach", "boynton-beach", "west-palm-beach"], "description": "A guide for sons, daughters, and relatives balancing work, distance, family responsibilities, and the emotional weight of helping a parent.", "tags": ["family caregivers", "adult children", "planning"], "ctaLabel": "View guide", "url": "../../search/index.html?state=florida&location=boca-raton&need=planning-ahead", "verified": false, "featured": true}, {"id": "guide-florida-home-care", "type": "guide", "name": "How Florida Families Start a Home Care Search", "category": "home-care", "state": "florida", "city": "", "nearbyAreas": [], "description": "A statewide guide to understanding non-medical home care, companion care, caregiver relief, transportation help, and common questions.", "tags": ["Florida", "home care", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=florida&careType=home-care", "verified": false, "featured": true}, {"id": "guide-florida-elder-law", "type": "guide", "name": "Florida Elder Law and Family Planning Starting Points", "category": "elder-law", "state": "florida", "city": "", "nearbyAreas": [], "description": "General planning questions for families thinking about elder law, estate planning, guardianship, benefits, and care responsibilities.", "tags": ["Florida", "elder law", "planning"], "ctaLabel": "View guide", "url": "../search/index.html?state=florida&careType=elder-law", "verified": false, "featured": true}, {"id": "guide-alabama-home-care", "type": "guide", "name": "Alabama Home Care Starting Points", "category": "home-care", "state": "alabama", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Alabama families exploring home care, care questions, and next steps.", "tags": ["Alabama", "Home Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=alabama&careType=home-care", "verified": false, "featured": true}, {"id": "guide-alabama-memory-care", "type": "guide", "name": "Alabama Memory Care Starting Points", "category": "memory-care", "state": "alabama", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Alabama families exploring memory care, care questions, and next steps.", "tags": ["Alabama", "Memory Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=alabama&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-alabama-assisted-living", "type": "guide", "name": "Alabama Assisted Living Starting Points", "category": "assisted-living", "state": "alabama", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Alabama families exploring assisted living, care questions, and next steps.", "tags": ["Alabama", "Assisted Living", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=alabama&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-alabama-respite-care", "type": "guide", "name": "Alabama Respite Care Starting Points", "category": "respite-care", "state": "alabama", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Alabama families exploring respite care, care questions, and next steps.", "tags": ["Alabama", "Respite Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=alabama&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-alabama-elder-law", "type": "guide", "name": "Alabama Elder Law & Benefits Starting Points", "category": "elder-law", "state": "alabama", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Alabama families exploring elder law & benefits, care questions, and next steps.", "tags": ["Alabama", "Elder Law & Benefits", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=alabama&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-alabama-final-expense-support", "type": "guide", "name": "Alabama Final Expense Support Starting Points", "category": "final-expense-support", "state": "alabama", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Alabama families exploring final expense support, care questions, and next steps.", "tags": ["Alabama", "Final Expense Support", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=alabama&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-alaska-home-care", "type": "guide", "name": "Alaska Home Care Starting Points", "category": "home-care", "state": "alaska", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Alaska families exploring home care, care questions, and next steps.", "tags": ["Alaska", "Home Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=alaska&careType=home-care", "verified": false, "featured": true}, {"id": "guide-alaska-memory-care", "type": "guide", "name": "Alaska Memory Care Starting Points", "category": "memory-care", "state": "alaska", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Alaska families exploring memory care, care questions, and next steps.", "tags": ["Alaska", "Memory Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=alaska&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-alaska-assisted-living", "type": "guide", "name": "Alaska Assisted Living Starting Points", "category": "assisted-living", "state": "alaska", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Alaska families exploring assisted living, care questions, and next steps.", "tags": ["Alaska", "Assisted Living", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=alaska&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-alaska-respite-care", "type": "guide", "name": "Alaska Respite Care Starting Points", "category": "respite-care", "state": "alaska", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Alaska families exploring respite care, care questions, and next steps.", "tags": ["Alaska", "Respite Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=alaska&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-alaska-elder-law", "type": "guide", "name": "Alaska Elder Law & Benefits Starting Points", "category": "elder-law", "state": "alaska", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Alaska families exploring elder law & benefits, care questions, and next steps.", "tags": ["Alaska", "Elder Law & Benefits", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=alaska&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-alaska-final-expense-support", "type": "guide", "name": "Alaska Final Expense Support Starting Points", "category": "final-expense-support", "state": "alaska", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Alaska families exploring final expense support, care questions, and next steps.", "tags": ["Alaska", "Final Expense Support", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=alaska&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-arizona-home-care", "type": "guide", "name": "Arizona Home Care Starting Points", "category": "home-care", "state": "arizona", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Arizona families exploring home care, care questions, and next steps.", "tags": ["Arizona", "Home Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=arizona&careType=home-care", "verified": false, "featured": true}, {"id": "guide-arizona-memory-care", "type": "guide", "name": "Arizona Memory Care Starting Points", "category": "memory-care", "state": "arizona", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Arizona families exploring memory care, care questions, and next steps.", "tags": ["Arizona", "Memory Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=arizona&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-arizona-assisted-living", "type": "guide", "name": "Arizona Assisted Living Starting Points", "category": "assisted-living", "state": "arizona", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Arizona families exploring assisted living, care questions, and next steps.", "tags": ["Arizona", "Assisted Living", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=arizona&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-arizona-respite-care", "type": "guide", "name": "Arizona Respite Care Starting Points", "category": "respite-care", "state": "arizona", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Arizona families exploring respite care, care questions, and next steps.", "tags": ["Arizona", "Respite Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=arizona&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-arizona-elder-law", "type": "guide", "name": "Arizona Elder Law & Benefits Starting Points", "category": "elder-law", "state": "arizona", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Arizona families exploring elder law & benefits, care questions, and next steps.", "tags": ["Arizona", "Elder Law & Benefits", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=arizona&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-arizona-final-expense-support", "type": "guide", "name": "Arizona Final Expense Support Starting Points", "category": "final-expense-support", "state": "arizona", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Arizona families exploring final expense support, care questions, and next steps.", "tags": ["Arizona", "Final Expense Support", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=arizona&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-arkansas-home-care", "type": "guide", "name": "Arkansas Home Care Starting Points", "category": "home-care", "state": "arkansas", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Arkansas families exploring home care, care questions, and next steps.", "tags": ["Arkansas", "Home Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=arkansas&careType=home-care", "verified": false, "featured": true}, {"id": "guide-arkansas-memory-care", "type": "guide", "name": "Arkansas Memory Care Starting Points", "category": "memory-care", "state": "arkansas", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Arkansas families exploring memory care, care questions, and next steps.", "tags": ["Arkansas", "Memory Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=arkansas&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-arkansas-assisted-living", "type": "guide", "name": "Arkansas Assisted Living Starting Points", "category": "assisted-living", "state": "arkansas", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Arkansas families exploring assisted living, care questions, and next steps.", "tags": ["Arkansas", "Assisted Living", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=arkansas&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-arkansas-respite-care", "type": "guide", "name": "Arkansas Respite Care Starting Points", "category": "respite-care", "state": "arkansas", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Arkansas families exploring respite care, care questions, and next steps.", "tags": ["Arkansas", "Respite Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=arkansas&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-arkansas-elder-law", "type": "guide", "name": "Arkansas Elder Law & Benefits Starting Points", "category": "elder-law", "state": "arkansas", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Arkansas families exploring elder law & benefits, care questions, and next steps.", "tags": ["Arkansas", "Elder Law & Benefits", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=arkansas&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-arkansas-final-expense-support", "type": "guide", "name": "Arkansas Final Expense Support Starting Points", "category": "final-expense-support", "state": "arkansas", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Arkansas families exploring final expense support, care questions, and next steps.", "tags": ["Arkansas", "Final Expense Support", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=arkansas&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-california-home-care", "type": "guide", "name": "California Home Care Starting Points", "category": "home-care", "state": "california", "city": "", "nearbyAreas": [], "description": "A plain-English guide for California families exploring home care, care questions, and next steps.", "tags": ["California", "Home Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=california&careType=home-care", "verified": false, "featured": true}, {"id": "guide-california-memory-care", "type": "guide", "name": "California Memory Care Starting Points", "category": "memory-care", "state": "california", "city": "", "nearbyAreas": [], "description": "A plain-English guide for California families exploring memory care, care questions, and next steps.", "tags": ["California", "Memory Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=california&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-california-assisted-living", "type": "guide", "name": "California Assisted Living Starting Points", "category": "assisted-living", "state": "california", "city": "", "nearbyAreas": [], "description": "A plain-English guide for California families exploring assisted living, care questions, and next steps.", "tags": ["California", "Assisted Living", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=california&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-california-respite-care", "type": "guide", "name": "California Respite Care Starting Points", "category": "respite-care", "state": "california", "city": "", "nearbyAreas": [], "description": "A plain-English guide for California families exploring respite care, care questions, and next steps.", "tags": ["California", "Respite Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=california&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-california-elder-law", "type": "guide", "name": "California Elder Law & Benefits Starting Points", "category": "elder-law", "state": "california", "city": "", "nearbyAreas": [], "description": "A plain-English guide for California families exploring elder law & benefits, care questions, and next steps.", "tags": ["California", "Elder Law & Benefits", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=california&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-california-final-expense-support", "type": "guide", "name": "California Final Expense Support Starting Points", "category": "final-expense-support", "state": "california", "city": "", "nearbyAreas": [], "description": "A plain-English guide for California families exploring final expense support, care questions, and next steps.", "tags": ["California", "Final Expense Support", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=california&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-colorado-home-care", "type": "guide", "name": "Colorado Home Care Starting Points", "category": "home-care", "state": "colorado", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Colorado families exploring home care, care questions, and next steps.", "tags": ["Colorado", "Home Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=colorado&careType=home-care", "verified": false, "featured": true}, {"id": "guide-colorado-memory-care", "type": "guide", "name": "Colorado Memory Care Starting Points", "category": "memory-care", "state": "colorado", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Colorado families exploring memory care, care questions, and next steps.", "tags": ["Colorado", "Memory Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=colorado&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-colorado-assisted-living", "type": "guide", "name": "Colorado Assisted Living Starting Points", "category": "assisted-living", "state": "colorado", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Colorado families exploring assisted living, care questions, and next steps.", "tags": ["Colorado", "Assisted Living", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=colorado&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-colorado-respite-care", "type": "guide", "name": "Colorado Respite Care Starting Points", "category": "respite-care", "state": "colorado", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Colorado families exploring respite care, care questions, and next steps.", "tags": ["Colorado", "Respite Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=colorado&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-colorado-elder-law", "type": "guide", "name": "Colorado Elder Law & Benefits Starting Points", "category": "elder-law", "state": "colorado", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Colorado families exploring elder law & benefits, care questions, and next steps.", "tags": ["Colorado", "Elder Law & Benefits", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=colorado&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-colorado-final-expense-support", "type": "guide", "name": "Colorado Final Expense Support Starting Points", "category": "final-expense-support", "state": "colorado", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Colorado families exploring final expense support, care questions, and next steps.", "tags": ["Colorado", "Final Expense Support", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=colorado&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-connecticut-home-care", "type": "guide", "name": "Connecticut Home Care Starting Points", "category": "home-care", "state": "connecticut", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Connecticut families exploring home care, care questions, and next steps.", "tags": ["Connecticut", "Home Care", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=connecticut&careType=home-care", "verified": false, "featured": true}, {"id": "guide-connecticut-memory-care", "type": "guide", "name": "Connecticut Memory Care Starting Points", "category": "memory-care", "state": "connecticut", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Connecticut families exploring memory care, care questions, and next steps.", "tags": ["Connecticut", "Memory Care", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=connecticut&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-connecticut-assisted-living", "type": "guide", "name": "Connecticut Assisted Living Starting Points", "category": "assisted-living", "state": "connecticut", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Connecticut families exploring assisted living, care questions, and next steps.", "tags": ["Connecticut", "Assisted Living", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=connecticut&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-connecticut-respite-care", "type": "guide", "name": "Connecticut Respite Care Starting Points", "category": "respite-care", "state": "connecticut", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Connecticut families exploring respite care, care questions, and next steps.", "tags": ["Connecticut", "Respite Care", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=connecticut&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-connecticut-elder-law", "type": "guide", "name": "Connecticut Elder Law & Benefits Starting Points", "category": "elder-law", "state": "connecticut", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Connecticut families exploring elder law & benefits, care questions, and next steps.", "tags": ["Connecticut", "Elder Law & Benefits", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=connecticut&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-connecticut-final-expense-support", "type": "guide", "name": "Connecticut Final Expense Support Starting Points", "category": "final-expense-support", "state": "connecticut", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Connecticut families exploring final expense support, care questions, and next steps.", "tags": ["Connecticut", "Final Expense Support", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=connecticut&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-delaware-home-care", "type": "guide", "name": "Delaware Home Care Starting Points", "category": "home-care", "state": "delaware", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Delaware families exploring home care, care questions, and next steps.", "tags": ["Delaware", "Home Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=delaware&careType=home-care", "verified": false, "featured": true}, {"id": "guide-delaware-memory-care", "type": "guide", "name": "Delaware Memory Care Starting Points", "category": "memory-care", "state": "delaware", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Delaware families exploring memory care, care questions, and next steps.", "tags": ["Delaware", "Memory Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=delaware&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-delaware-assisted-living", "type": "guide", "name": "Delaware Assisted Living Starting Points", "category": "assisted-living", "state": "delaware", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Delaware families exploring assisted living, care questions, and next steps.", "tags": ["Delaware", "Assisted Living", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=delaware&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-delaware-respite-care", "type": "guide", "name": "Delaware Respite Care Starting Points", "category": "respite-care", "state": "delaware", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Delaware families exploring respite care, care questions, and next steps.", "tags": ["Delaware", "Respite Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=delaware&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-delaware-elder-law", "type": "guide", "name": "Delaware Elder Law & Benefits Starting Points", "category": "elder-law", "state": "delaware", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Delaware families exploring elder law & benefits, care questions, and next steps.", "tags": ["Delaware", "Elder Law & Benefits", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=delaware&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-delaware-final-expense-support", "type": "guide", "name": "Delaware Final Expense Support Starting Points", "category": "final-expense-support", "state": "delaware", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Delaware families exploring final expense support, care questions, and next steps.", "tags": ["Delaware", "Final Expense Support", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=delaware&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-florida-memory-care", "type": "guide", "name": "Florida Memory Care Starting Points", "category": "memory-care", "state": "florida", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Florida families exploring memory care, care questions, and next steps.", "tags": ["Florida", "Memory Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=florida&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-florida-assisted-living", "type": "guide", "name": "Florida Assisted Living Starting Points", "category": "assisted-living", "state": "florida", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Florida families exploring assisted living, care questions, and next steps.", "tags": ["Florida", "Assisted Living", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=florida&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-florida-respite-care", "type": "guide", "name": "Florida Respite Care Starting Points", "category": "respite-care", "state": "florida", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Florida families exploring respite care, care questions, and next steps.", "tags": ["Florida", "Respite Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=florida&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-florida-final-expense-support", "type": "guide", "name": "Florida Final Expense Support Starting Points", "category": "final-expense-support", "state": "florida", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Florida families exploring final expense support, care questions, and next steps.", "tags": ["Florida", "Final Expense Support", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=florida&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-georgia-home-care", "type": "guide", "name": "Georgia Home Care Starting Points", "category": "home-care", "state": "georgia", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Georgia families exploring home care, care questions, and next steps.", "tags": ["Georgia", "Home Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=georgia&careType=home-care", "verified": false, "featured": true}, {"id": "guide-georgia-memory-care", "type": "guide", "name": "Georgia Memory Care Starting Points", "category": "memory-care", "state": "georgia", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Georgia families exploring memory care, care questions, and next steps.", "tags": ["Georgia", "Memory Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=georgia&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-georgia-assisted-living", "type": "guide", "name": "Georgia Assisted Living Starting Points", "category": "assisted-living", "state": "georgia", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Georgia families exploring assisted living, care questions, and next steps.", "tags": ["Georgia", "Assisted Living", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=georgia&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-georgia-respite-care", "type": "guide", "name": "Georgia Respite Care Starting Points", "category": "respite-care", "state": "georgia", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Georgia families exploring respite care, care questions, and next steps.", "tags": ["Georgia", "Respite Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=georgia&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-georgia-elder-law", "type": "guide", "name": "Georgia Elder Law & Benefits Starting Points", "category": "elder-law", "state": "georgia", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Georgia families exploring elder law & benefits, care questions, and next steps.", "tags": ["Georgia", "Elder Law & Benefits", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=georgia&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-georgia-final-expense-support", "type": "guide", "name": "Georgia Final Expense Support Starting Points", "category": "final-expense-support", "state": "georgia", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Georgia families exploring final expense support, care questions, and next steps.", "tags": ["Georgia", "Final Expense Support", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=georgia&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-hawaii-home-care", "type": "guide", "name": "Hawaii Home Care Starting Points", "category": "home-care", "state": "hawaii", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Hawaii families exploring home care, care questions, and next steps.", "tags": ["Hawaii", "Home Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=hawaii&careType=home-care", "verified": false, "featured": true}, {"id": "guide-hawaii-memory-care", "type": "guide", "name": "Hawaii Memory Care Starting Points", "category": "memory-care", "state": "hawaii", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Hawaii families exploring memory care, care questions, and next steps.", "tags": ["Hawaii", "Memory Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=hawaii&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-hawaii-assisted-living", "type": "guide", "name": "Hawaii Assisted Living Starting Points", "category": "assisted-living", "state": "hawaii", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Hawaii families exploring assisted living, care questions, and next steps.", "tags": ["Hawaii", "Assisted Living", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=hawaii&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-hawaii-respite-care", "type": "guide", "name": "Hawaii Respite Care Starting Points", "category": "respite-care", "state": "hawaii", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Hawaii families exploring respite care, care questions, and next steps.", "tags": ["Hawaii", "Respite Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=hawaii&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-hawaii-elder-law", "type": "guide", "name": "Hawaii Elder Law & Benefits Starting Points", "category": "elder-law", "state": "hawaii", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Hawaii families exploring elder law & benefits, care questions, and next steps.", "tags": ["Hawaii", "Elder Law & Benefits", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=hawaii&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-hawaii-final-expense-support", "type": "guide", "name": "Hawaii Final Expense Support Starting Points", "category": "final-expense-support", "state": "hawaii", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Hawaii families exploring final expense support, care questions, and next steps.", "tags": ["Hawaii", "Final Expense Support", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=hawaii&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-idaho-home-care", "type": "guide", "name": "Idaho Home Care Starting Points", "category": "home-care", "state": "idaho", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Idaho families exploring home care, care questions, and next steps.", "tags": ["Idaho", "Home Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=idaho&careType=home-care", "verified": false, "featured": true}, {"id": "guide-idaho-memory-care", "type": "guide", "name": "Idaho Memory Care Starting Points", "category": "memory-care", "state": "idaho", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Idaho families exploring memory care, care questions, and next steps.", "tags": ["Idaho", "Memory Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=idaho&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-idaho-assisted-living", "type": "guide", "name": "Idaho Assisted Living Starting Points", "category": "assisted-living", "state": "idaho", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Idaho families exploring assisted living, care questions, and next steps.", "tags": ["Idaho", "Assisted Living", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=idaho&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-idaho-respite-care", "type": "guide", "name": "Idaho Respite Care Starting Points", "category": "respite-care", "state": "idaho", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Idaho families exploring respite care, care questions, and next steps.", "tags": ["Idaho", "Respite Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=idaho&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-idaho-elder-law", "type": "guide", "name": "Idaho Elder Law & Benefits Starting Points", "category": "elder-law", "state": "idaho", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Idaho families exploring elder law & benefits, care questions, and next steps.", "tags": ["Idaho", "Elder Law & Benefits", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=idaho&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-idaho-final-expense-support", "type": "guide", "name": "Idaho Final Expense Support Starting Points", "category": "final-expense-support", "state": "idaho", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Idaho families exploring final expense support, care questions, and next steps.", "tags": ["Idaho", "Final Expense Support", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=idaho&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-illinois-home-care", "type": "guide", "name": "Illinois Home Care Starting Points", "category": "home-care", "state": "illinois", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Illinois families exploring home care, care questions, and next steps.", "tags": ["Illinois", "Home Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=illinois&careType=home-care", "verified": false, "featured": true}, {"id": "guide-illinois-memory-care", "type": "guide", "name": "Illinois Memory Care Starting Points", "category": "memory-care", "state": "illinois", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Illinois families exploring memory care, care questions, and next steps.", "tags": ["Illinois", "Memory Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=illinois&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-illinois-assisted-living", "type": "guide", "name": "Illinois Assisted Living Starting Points", "category": "assisted-living", "state": "illinois", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Illinois families exploring assisted living, care questions, and next steps.", "tags": ["Illinois", "Assisted Living", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=illinois&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-illinois-respite-care", "type": "guide", "name": "Illinois Respite Care Starting Points", "category": "respite-care", "state": "illinois", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Illinois families exploring respite care, care questions, and next steps.", "tags": ["Illinois", "Respite Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=illinois&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-illinois-elder-law", "type": "guide", "name": "Illinois Elder Law & Benefits Starting Points", "category": "elder-law", "state": "illinois", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Illinois families exploring elder law & benefits, care questions, and next steps.", "tags": ["Illinois", "Elder Law & Benefits", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=illinois&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-illinois-final-expense-support", "type": "guide", "name": "Illinois Final Expense Support Starting Points", "category": "final-expense-support", "state": "illinois", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Illinois families exploring final expense support, care questions, and next steps.", "tags": ["Illinois", "Final Expense Support", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=illinois&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-indiana-home-care", "type": "guide", "name": "Indiana Home Care Starting Points", "category": "home-care", "state": "indiana", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Indiana families exploring home care, care questions, and next steps.", "tags": ["Indiana", "Home Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=indiana&careType=home-care", "verified": false, "featured": true}, {"id": "guide-indiana-memory-care", "type": "guide", "name": "Indiana Memory Care Starting Points", "category": "memory-care", "state": "indiana", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Indiana families exploring memory care, care questions, and next steps.", "tags": ["Indiana", "Memory Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=indiana&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-indiana-assisted-living", "type": "guide", "name": "Indiana Assisted Living Starting Points", "category": "assisted-living", "state": "indiana", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Indiana families exploring assisted living, care questions, and next steps.", "tags": ["Indiana", "Assisted Living", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=indiana&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-indiana-respite-care", "type": "guide", "name": "Indiana Respite Care Starting Points", "category": "respite-care", "state": "indiana", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Indiana families exploring respite care, care questions, and next steps.", "tags": ["Indiana", "Respite Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=indiana&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-indiana-elder-law", "type": "guide", "name": "Indiana Elder Law & Benefits Starting Points", "category": "elder-law", "state": "indiana", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Indiana families exploring elder law & benefits, care questions, and next steps.", "tags": ["Indiana", "Elder Law & Benefits", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=indiana&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-indiana-final-expense-support", "type": "guide", "name": "Indiana Final Expense Support Starting Points", "category": "final-expense-support", "state": "indiana", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Indiana families exploring final expense support, care questions, and next steps.", "tags": ["Indiana", "Final Expense Support", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=indiana&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-iowa-home-care", "type": "guide", "name": "Iowa Home Care Starting Points", "category": "home-care", "state": "iowa", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Iowa families exploring home care, care questions, and next steps.", "tags": ["Iowa", "Home Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=iowa&careType=home-care", "verified": false, "featured": true}, {"id": "guide-iowa-memory-care", "type": "guide", "name": "Iowa Memory Care Starting Points", "category": "memory-care", "state": "iowa", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Iowa families exploring memory care, care questions, and next steps.", "tags": ["Iowa", "Memory Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=iowa&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-iowa-assisted-living", "type": "guide", "name": "Iowa Assisted Living Starting Points", "category": "assisted-living", "state": "iowa", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Iowa families exploring assisted living, care questions, and next steps.", "tags": ["Iowa", "Assisted Living", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=iowa&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-iowa-respite-care", "type": "guide", "name": "Iowa Respite Care Starting Points", "category": "respite-care", "state": "iowa", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Iowa families exploring respite care, care questions, and next steps.", "tags": ["Iowa", "Respite Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=iowa&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-iowa-elder-law", "type": "guide", "name": "Iowa Elder Law & Benefits Starting Points", "category": "elder-law", "state": "iowa", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Iowa families exploring elder law & benefits, care questions, and next steps.", "tags": ["Iowa", "Elder Law & Benefits", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=iowa&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-iowa-final-expense-support", "type": "guide", "name": "Iowa Final Expense Support Starting Points", "category": "final-expense-support", "state": "iowa", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Iowa families exploring final expense support, care questions, and next steps.", "tags": ["Iowa", "Final Expense Support", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=iowa&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-kansas-home-care", "type": "guide", "name": "Kansas Home Care Starting Points", "category": "home-care", "state": "kansas", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Kansas families exploring home care, care questions, and next steps.", "tags": ["Kansas", "Home Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=kansas&careType=home-care", "verified": false, "featured": true}, {"id": "guide-kansas-memory-care", "type": "guide", "name": "Kansas Memory Care Starting Points", "category": "memory-care", "state": "kansas", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Kansas families exploring memory care, care questions, and next steps.", "tags": ["Kansas", "Memory Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=kansas&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-kansas-assisted-living", "type": "guide", "name": "Kansas Assisted Living Starting Points", "category": "assisted-living", "state": "kansas", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Kansas families exploring assisted living, care questions, and next steps.", "tags": ["Kansas", "Assisted Living", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=kansas&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-kansas-respite-care", "type": "guide", "name": "Kansas Respite Care Starting Points", "category": "respite-care", "state": "kansas", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Kansas families exploring respite care, care questions, and next steps.", "tags": ["Kansas", "Respite Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=kansas&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-kansas-elder-law", "type": "guide", "name": "Kansas Elder Law & Benefits Starting Points", "category": "elder-law", "state": "kansas", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Kansas families exploring elder law & benefits, care questions, and next steps.", "tags": ["Kansas", "Elder Law & Benefits", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=kansas&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-kansas-final-expense-support", "type": "guide", "name": "Kansas Final Expense Support Starting Points", "category": "final-expense-support", "state": "kansas", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Kansas families exploring final expense support, care questions, and next steps.", "tags": ["Kansas", "Final Expense Support", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=kansas&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-kentucky-home-care", "type": "guide", "name": "Kentucky Home Care Starting Points", "category": "home-care", "state": "kentucky", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Kentucky families exploring home care, care questions, and next steps.", "tags": ["Kentucky", "Home Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=kentucky&careType=home-care", "verified": false, "featured": true}, {"id": "guide-kentucky-memory-care", "type": "guide", "name": "Kentucky Memory Care Starting Points", "category": "memory-care", "state": "kentucky", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Kentucky families exploring memory care, care questions, and next steps.", "tags": ["Kentucky", "Memory Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=kentucky&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-kentucky-assisted-living", "type": "guide", "name": "Kentucky Assisted Living Starting Points", "category": "assisted-living", "state": "kentucky", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Kentucky families exploring assisted living, care questions, and next steps.", "tags": ["Kentucky", "Assisted Living", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=kentucky&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-kentucky-respite-care", "type": "guide", "name": "Kentucky Respite Care Starting Points", "category": "respite-care", "state": "kentucky", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Kentucky families exploring respite care, care questions, and next steps.", "tags": ["Kentucky", "Respite Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=kentucky&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-kentucky-elder-law", "type": "guide", "name": "Kentucky Elder Law & Benefits Starting Points", "category": "elder-law", "state": "kentucky", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Kentucky families exploring elder law & benefits, care questions, and next steps.", "tags": ["Kentucky", "Elder Law & Benefits", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=kentucky&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-kentucky-final-expense-support", "type": "guide", "name": "Kentucky Final Expense Support Starting Points", "category": "final-expense-support", "state": "kentucky", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Kentucky families exploring final expense support, care questions, and next steps.", "tags": ["Kentucky", "Final Expense Support", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=kentucky&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-louisiana-home-care", "type": "guide", "name": "Louisiana Home Care Starting Points", "category": "home-care", "state": "louisiana", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Louisiana families exploring home care, care questions, and next steps.", "tags": ["Louisiana", "Home Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=louisiana&careType=home-care", "verified": false, "featured": true}, {"id": "guide-louisiana-memory-care", "type": "guide", "name": "Louisiana Memory Care Starting Points", "category": "memory-care", "state": "louisiana", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Louisiana families exploring memory care, care questions, and next steps.", "tags": ["Louisiana", "Memory Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=louisiana&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-louisiana-assisted-living", "type": "guide", "name": "Louisiana Assisted Living Starting Points", "category": "assisted-living", "state": "louisiana", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Louisiana families exploring assisted living, care questions, and next steps.", "tags": ["Louisiana", "Assisted Living", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=louisiana&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-louisiana-respite-care", "type": "guide", "name": "Louisiana Respite Care Starting Points", "category": "respite-care", "state": "louisiana", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Louisiana families exploring respite care, care questions, and next steps.", "tags": ["Louisiana", "Respite Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=louisiana&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-louisiana-elder-law", "type": "guide", "name": "Louisiana Elder Law & Benefits Starting Points", "category": "elder-law", "state": "louisiana", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Louisiana families exploring elder law & benefits, care questions, and next steps.", "tags": ["Louisiana", "Elder Law & Benefits", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=louisiana&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-louisiana-final-expense-support", "type": "guide", "name": "Louisiana Final Expense Support Starting Points", "category": "final-expense-support", "state": "louisiana", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Louisiana families exploring final expense support, care questions, and next steps.", "tags": ["Louisiana", "Final Expense Support", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=louisiana&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-maine-home-care", "type": "guide", "name": "Maine Home Care Starting Points", "category": "home-care", "state": "maine", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Maine families exploring home care, care questions, and next steps.", "tags": ["Maine", "Home Care", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=maine&careType=home-care", "verified": false, "featured": true}, {"id": "guide-maine-memory-care", "type": "guide", "name": "Maine Memory Care Starting Points", "category": "memory-care", "state": "maine", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Maine families exploring memory care, care questions, and next steps.", "tags": ["Maine", "Memory Care", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=maine&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-maine-assisted-living", "type": "guide", "name": "Maine Assisted Living Starting Points", "category": "assisted-living", "state": "maine", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Maine families exploring assisted living, care questions, and next steps.", "tags": ["Maine", "Assisted Living", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=maine&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-maine-respite-care", "type": "guide", "name": "Maine Respite Care Starting Points", "category": "respite-care", "state": "maine", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Maine families exploring respite care, care questions, and next steps.", "tags": ["Maine", "Respite Care", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=maine&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-maine-elder-law", "type": "guide", "name": "Maine Elder Law & Benefits Starting Points", "category": "elder-law", "state": "maine", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Maine families exploring elder law & benefits, care questions, and next steps.", "tags": ["Maine", "Elder Law & Benefits", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=maine&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-maine-final-expense-support", "type": "guide", "name": "Maine Final Expense Support Starting Points", "category": "final-expense-support", "state": "maine", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Maine families exploring final expense support, care questions, and next steps.", "tags": ["Maine", "Final Expense Support", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=maine&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-maryland-home-care", "type": "guide", "name": "Maryland Home Care Starting Points", "category": "home-care", "state": "maryland", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Maryland families exploring home care, care questions, and next steps.", "tags": ["Maryland", "Home Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=maryland&careType=home-care", "verified": false, "featured": true}, {"id": "guide-maryland-memory-care", "type": "guide", "name": "Maryland Memory Care Starting Points", "category": "memory-care", "state": "maryland", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Maryland families exploring memory care, care questions, and next steps.", "tags": ["Maryland", "Memory Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=maryland&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-maryland-assisted-living", "type": "guide", "name": "Maryland Assisted Living Starting Points", "category": "assisted-living", "state": "maryland", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Maryland families exploring assisted living, care questions, and next steps.", "tags": ["Maryland", "Assisted Living", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=maryland&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-maryland-respite-care", "type": "guide", "name": "Maryland Respite Care Starting Points", "category": "respite-care", "state": "maryland", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Maryland families exploring respite care, care questions, and next steps.", "tags": ["Maryland", "Respite Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=maryland&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-maryland-elder-law", "type": "guide", "name": "Maryland Elder Law & Benefits Starting Points", "category": "elder-law", "state": "maryland", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Maryland families exploring elder law & benefits, care questions, and next steps.", "tags": ["Maryland", "Elder Law & Benefits", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=maryland&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-maryland-final-expense-support", "type": "guide", "name": "Maryland Final Expense Support Starting Points", "category": "final-expense-support", "state": "maryland", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Maryland families exploring final expense support, care questions, and next steps.", "tags": ["Maryland", "Final Expense Support", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=maryland&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-massachusetts-home-care", "type": "guide", "name": "Massachusetts Home Care Starting Points", "category": "home-care", "state": "massachusetts", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Massachusetts families exploring home care, care questions, and next steps.", "tags": ["Massachusetts", "Home Care", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=massachusetts&careType=home-care", "verified": false, "featured": true}, {"id": "guide-massachusetts-memory-care", "type": "guide", "name": "Massachusetts Memory Care Starting Points", "category": "memory-care", "state": "massachusetts", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Massachusetts families exploring memory care, care questions, and next steps.", "tags": ["Massachusetts", "Memory Care", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=massachusetts&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-massachusetts-assisted-living", "type": "guide", "name": "Massachusetts Assisted Living Starting Points", "category": "assisted-living", "state": "massachusetts", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Massachusetts families exploring assisted living, care questions, and next steps.", "tags": ["Massachusetts", "Assisted Living", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=massachusetts&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-massachusetts-respite-care", "type": "guide", "name": "Massachusetts Respite Care Starting Points", "category": "respite-care", "state": "massachusetts", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Massachusetts families exploring respite care, care questions, and next steps.", "tags": ["Massachusetts", "Respite Care", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=massachusetts&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-massachusetts-elder-law", "type": "guide", "name": "Massachusetts Elder Law & Benefits Starting Points", "category": "elder-law", "state": "massachusetts", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Massachusetts families exploring elder law & benefits, care questions, and next steps.", "tags": ["Massachusetts", "Elder Law & Benefits", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=massachusetts&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-massachusetts-final-expense-support", "type": "guide", "name": "Massachusetts Final Expense Support Starting Points", "category": "final-expense-support", "state": "massachusetts", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Massachusetts families exploring final expense support, care questions, and next steps.", "tags": ["Massachusetts", "Final Expense Support", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=massachusetts&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-michigan-home-care", "type": "guide", "name": "Michigan Home Care Starting Points", "category": "home-care", "state": "michigan", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Michigan families exploring home care, care questions, and next steps.", "tags": ["Michigan", "Home Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=michigan&careType=home-care", "verified": false, "featured": true}, {"id": "guide-michigan-memory-care", "type": "guide", "name": "Michigan Memory Care Starting Points", "category": "memory-care", "state": "michigan", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Michigan families exploring memory care, care questions, and next steps.", "tags": ["Michigan", "Memory Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=michigan&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-michigan-assisted-living", "type": "guide", "name": "Michigan Assisted Living Starting Points", "category": "assisted-living", "state": "michigan", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Michigan families exploring assisted living, care questions, and next steps.", "tags": ["Michigan", "Assisted Living", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=michigan&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-michigan-respite-care", "type": "guide", "name": "Michigan Respite Care Starting Points", "category": "respite-care", "state": "michigan", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Michigan families exploring respite care, care questions, and next steps.", "tags": ["Michigan", "Respite Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=michigan&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-michigan-elder-law", "type": "guide", "name": "Michigan Elder Law & Benefits Starting Points", "category": "elder-law", "state": "michigan", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Michigan families exploring elder law & benefits, care questions, and next steps.", "tags": ["Michigan", "Elder Law & Benefits", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=michigan&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-michigan-final-expense-support", "type": "guide", "name": "Michigan Final Expense Support Starting Points", "category": "final-expense-support", "state": "michigan", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Michigan families exploring final expense support, care questions, and next steps.", "tags": ["Michigan", "Final Expense Support", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=michigan&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-minnesota-home-care", "type": "guide", "name": "Minnesota Home Care Starting Points", "category": "home-care", "state": "minnesota", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Minnesota families exploring home care, care questions, and next steps.", "tags": ["Minnesota", "Home Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=minnesota&careType=home-care", "verified": false, "featured": true}, {"id": "guide-minnesota-memory-care", "type": "guide", "name": "Minnesota Memory Care Starting Points", "category": "memory-care", "state": "minnesota", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Minnesota families exploring memory care, care questions, and next steps.", "tags": ["Minnesota", "Memory Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=minnesota&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-minnesota-assisted-living", "type": "guide", "name": "Minnesota Assisted Living Starting Points", "category": "assisted-living", "state": "minnesota", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Minnesota families exploring assisted living, care questions, and next steps.", "tags": ["Minnesota", "Assisted Living", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=minnesota&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-minnesota-respite-care", "type": "guide", "name": "Minnesota Respite Care Starting Points", "category": "respite-care", "state": "minnesota", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Minnesota families exploring respite care, care questions, and next steps.", "tags": ["Minnesota", "Respite Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=minnesota&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-minnesota-elder-law", "type": "guide", "name": "Minnesota Elder Law & Benefits Starting Points", "category": "elder-law", "state": "minnesota", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Minnesota families exploring elder law & benefits, care questions, and next steps.", "tags": ["Minnesota", "Elder Law & Benefits", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=minnesota&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-minnesota-final-expense-support", "type": "guide", "name": "Minnesota Final Expense Support Starting Points", "category": "final-expense-support", "state": "minnesota", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Minnesota families exploring final expense support, care questions, and next steps.", "tags": ["Minnesota", "Final Expense Support", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=minnesota&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-mississippi-home-care", "type": "guide", "name": "Mississippi Home Care Starting Points", "category": "home-care", "state": "mississippi", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Mississippi families exploring home care, care questions, and next steps.", "tags": ["Mississippi", "Home Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=mississippi&careType=home-care", "verified": false, "featured": true}, {"id": "guide-mississippi-memory-care", "type": "guide", "name": "Mississippi Memory Care Starting Points", "category": "memory-care", "state": "mississippi", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Mississippi families exploring memory care, care questions, and next steps.", "tags": ["Mississippi", "Memory Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=mississippi&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-mississippi-assisted-living", "type": "guide", "name": "Mississippi Assisted Living Starting Points", "category": "assisted-living", "state": "mississippi", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Mississippi families exploring assisted living, care questions, and next steps.", "tags": ["Mississippi", "Assisted Living", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=mississippi&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-mississippi-respite-care", "type": "guide", "name": "Mississippi Respite Care Starting Points", "category": "respite-care", "state": "mississippi", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Mississippi families exploring respite care, care questions, and next steps.", "tags": ["Mississippi", "Respite Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=mississippi&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-mississippi-elder-law", "type": "guide", "name": "Mississippi Elder Law & Benefits Starting Points", "category": "elder-law", "state": "mississippi", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Mississippi families exploring elder law & benefits, care questions, and next steps.", "tags": ["Mississippi", "Elder Law & Benefits", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=mississippi&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-mississippi-final-expense-support", "type": "guide", "name": "Mississippi Final Expense Support Starting Points", "category": "final-expense-support", "state": "mississippi", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Mississippi families exploring final expense support, care questions, and next steps.", "tags": ["Mississippi", "Final Expense Support", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=mississippi&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-missouri-home-care", "type": "guide", "name": "Missouri Home Care Starting Points", "category": "home-care", "state": "missouri", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Missouri families exploring home care, care questions, and next steps.", "tags": ["Missouri", "Home Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=missouri&careType=home-care", "verified": false, "featured": true}, {"id": "guide-missouri-memory-care", "type": "guide", "name": "Missouri Memory Care Starting Points", "category": "memory-care", "state": "missouri", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Missouri families exploring memory care, care questions, and next steps.", "tags": ["Missouri", "Memory Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=missouri&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-missouri-assisted-living", "type": "guide", "name": "Missouri Assisted Living Starting Points", "category": "assisted-living", "state": "missouri", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Missouri families exploring assisted living, care questions, and next steps.", "tags": ["Missouri", "Assisted Living", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=missouri&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-missouri-respite-care", "type": "guide", "name": "Missouri Respite Care Starting Points", "category": "respite-care", "state": "missouri", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Missouri families exploring respite care, care questions, and next steps.", "tags": ["Missouri", "Respite Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=missouri&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-missouri-elder-law", "type": "guide", "name": "Missouri Elder Law & Benefits Starting Points", "category": "elder-law", "state": "missouri", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Missouri families exploring elder law & benefits, care questions, and next steps.", "tags": ["Missouri", "Elder Law & Benefits", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=missouri&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-missouri-final-expense-support", "type": "guide", "name": "Missouri Final Expense Support Starting Points", "category": "final-expense-support", "state": "missouri", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Missouri families exploring final expense support, care questions, and next steps.", "tags": ["Missouri", "Final Expense Support", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=missouri&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-montana-home-care", "type": "guide", "name": "Montana Home Care Starting Points", "category": "home-care", "state": "montana", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Montana families exploring home care, care questions, and next steps.", "tags": ["Montana", "Home Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=montana&careType=home-care", "verified": false, "featured": true}, {"id": "guide-montana-memory-care", "type": "guide", "name": "Montana Memory Care Starting Points", "category": "memory-care", "state": "montana", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Montana families exploring memory care, care questions, and next steps.", "tags": ["Montana", "Memory Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=montana&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-montana-assisted-living", "type": "guide", "name": "Montana Assisted Living Starting Points", "category": "assisted-living", "state": "montana", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Montana families exploring assisted living, care questions, and next steps.", "tags": ["Montana", "Assisted Living", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=montana&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-montana-respite-care", "type": "guide", "name": "Montana Respite Care Starting Points", "category": "respite-care", "state": "montana", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Montana families exploring respite care, care questions, and next steps.", "tags": ["Montana", "Respite Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=montana&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-montana-elder-law", "type": "guide", "name": "Montana Elder Law & Benefits Starting Points", "category": "elder-law", "state": "montana", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Montana families exploring elder law & benefits, care questions, and next steps.", "tags": ["Montana", "Elder Law & Benefits", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=montana&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-montana-final-expense-support", "type": "guide", "name": "Montana Final Expense Support Starting Points", "category": "final-expense-support", "state": "montana", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Montana families exploring final expense support, care questions, and next steps.", "tags": ["Montana", "Final Expense Support", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=montana&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-nebraska-home-care", "type": "guide", "name": "Nebraska Home Care Starting Points", "category": "home-care", "state": "nebraska", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Nebraska families exploring home care, care questions, and next steps.", "tags": ["Nebraska", "Home Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=nebraska&careType=home-care", "verified": false, "featured": true}, {"id": "guide-nebraska-memory-care", "type": "guide", "name": "Nebraska Memory Care Starting Points", "category": "memory-care", "state": "nebraska", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Nebraska families exploring memory care, care questions, and next steps.", "tags": ["Nebraska", "Memory Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=nebraska&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-nebraska-assisted-living", "type": "guide", "name": "Nebraska Assisted Living Starting Points", "category": "assisted-living", "state": "nebraska", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Nebraska families exploring assisted living, care questions, and next steps.", "tags": ["Nebraska", "Assisted Living", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=nebraska&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-nebraska-respite-care", "type": "guide", "name": "Nebraska Respite Care Starting Points", "category": "respite-care", "state": "nebraska", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Nebraska families exploring respite care, care questions, and next steps.", "tags": ["Nebraska", "Respite Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=nebraska&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-nebraska-elder-law", "type": "guide", "name": "Nebraska Elder Law & Benefits Starting Points", "category": "elder-law", "state": "nebraska", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Nebraska families exploring elder law & benefits, care questions, and next steps.", "tags": ["Nebraska", "Elder Law & Benefits", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=nebraska&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-nebraska-final-expense-support", "type": "guide", "name": "Nebraska Final Expense Support Starting Points", "category": "final-expense-support", "state": "nebraska", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Nebraska families exploring final expense support, care questions, and next steps.", "tags": ["Nebraska", "Final Expense Support", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=nebraska&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-nevada-home-care", "type": "guide", "name": "Nevada Home Care Starting Points", "category": "home-care", "state": "nevada", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Nevada families exploring home care, care questions, and next steps.", "tags": ["Nevada", "Home Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=nevada&careType=home-care", "verified": false, "featured": true}, {"id": "guide-nevada-memory-care", "type": "guide", "name": "Nevada Memory Care Starting Points", "category": "memory-care", "state": "nevada", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Nevada families exploring memory care, care questions, and next steps.", "tags": ["Nevada", "Memory Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=nevada&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-nevada-assisted-living", "type": "guide", "name": "Nevada Assisted Living Starting Points", "category": "assisted-living", "state": "nevada", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Nevada families exploring assisted living, care questions, and next steps.", "tags": ["Nevada", "Assisted Living", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=nevada&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-nevada-respite-care", "type": "guide", "name": "Nevada Respite Care Starting Points", "category": "respite-care", "state": "nevada", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Nevada families exploring respite care, care questions, and next steps.", "tags": ["Nevada", "Respite Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=nevada&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-nevada-elder-law", "type": "guide", "name": "Nevada Elder Law & Benefits Starting Points", "category": "elder-law", "state": "nevada", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Nevada families exploring elder law & benefits, care questions, and next steps.", "tags": ["Nevada", "Elder Law & Benefits", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=nevada&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-nevada-final-expense-support", "type": "guide", "name": "Nevada Final Expense Support Starting Points", "category": "final-expense-support", "state": "nevada", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Nevada families exploring final expense support, care questions, and next steps.", "tags": ["Nevada", "Final Expense Support", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=nevada&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-new-hampshire-home-care", "type": "guide", "name": "New Hampshire Home Care Starting Points", "category": "home-care", "state": "new-hampshire", "city": "", "nearbyAreas": [], "description": "A plain-English guide for New Hampshire families exploring home care, care questions, and next steps.", "tags": ["New Hampshire", "Home Care", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=new-hampshire&careType=home-care", "verified": false, "featured": true}, {"id": "guide-new-hampshire-memory-care", "type": "guide", "name": "New Hampshire Memory Care Starting Points", "category": "memory-care", "state": "new-hampshire", "city": "", "nearbyAreas": [], "description": "A plain-English guide for New Hampshire families exploring memory care, care questions, and next steps.", "tags": ["New Hampshire", "Memory Care", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=new-hampshire&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-new-hampshire-assisted-living", "type": "guide", "name": "New Hampshire Assisted Living Starting Points", "category": "assisted-living", "state": "new-hampshire", "city": "", "nearbyAreas": [], "description": "A plain-English guide for New Hampshire families exploring assisted living, care questions, and next steps.", "tags": ["New Hampshire", "Assisted Living", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=new-hampshire&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-new-hampshire-respite-care", "type": "guide", "name": "New Hampshire Respite Care Starting Points", "category": "respite-care", "state": "new-hampshire", "city": "", "nearbyAreas": [], "description": "A plain-English guide for New Hampshire families exploring respite care, care questions, and next steps.", "tags": ["New Hampshire", "Respite Care", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=new-hampshire&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-new-hampshire-elder-law", "type": "guide", "name": "New Hampshire Elder Law & Benefits Starting Points", "category": "elder-law", "state": "new-hampshire", "city": "", "nearbyAreas": [], "description": "A plain-English guide for New Hampshire families exploring elder law & benefits, care questions, and next steps.", "tags": ["New Hampshire", "Elder Law & Benefits", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=new-hampshire&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-new-hampshire-final-expense-support", "type": "guide", "name": "New Hampshire Final Expense Support Starting Points", "category": "final-expense-support", "state": "new-hampshire", "city": "", "nearbyAreas": [], "description": "A plain-English guide for New Hampshire families exploring final expense support, care questions, and next steps.", "tags": ["New Hampshire", "Final Expense Support", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=new-hampshire&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-new-jersey-home-care", "type": "guide", "name": "New Jersey Home Care Starting Points", "category": "home-care", "state": "new-jersey", "city": "", "nearbyAreas": [], "description": "A plain-English guide for New Jersey families exploring home care, care questions, and next steps.", "tags": ["New Jersey", "Home Care", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=new-jersey&careType=home-care", "verified": false, "featured": true}, {"id": "guide-new-jersey-memory-care", "type": "guide", "name": "New Jersey Memory Care Starting Points", "category": "memory-care", "state": "new-jersey", "city": "", "nearbyAreas": [], "description": "A plain-English guide for New Jersey families exploring memory care, care questions, and next steps.", "tags": ["New Jersey", "Memory Care", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=new-jersey&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-new-jersey-assisted-living", "type": "guide", "name": "New Jersey Assisted Living Starting Points", "category": "assisted-living", "state": "new-jersey", "city": "", "nearbyAreas": [], "description": "A plain-English guide for New Jersey families exploring assisted living, care questions, and next steps.", "tags": ["New Jersey", "Assisted Living", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=new-jersey&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-new-jersey-respite-care", "type": "guide", "name": "New Jersey Respite Care Starting Points", "category": "respite-care", "state": "new-jersey", "city": "", "nearbyAreas": [], "description": "A plain-English guide for New Jersey families exploring respite care, care questions, and next steps.", "tags": ["New Jersey", "Respite Care", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=new-jersey&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-new-jersey-elder-law", "type": "guide", "name": "New Jersey Elder Law & Benefits Starting Points", "category": "elder-law", "state": "new-jersey", "city": "", "nearbyAreas": [], "description": "A plain-English guide for New Jersey families exploring elder law & benefits, care questions, and next steps.", "tags": ["New Jersey", "Elder Law & Benefits", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=new-jersey&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-new-jersey-final-expense-support", "type": "guide", "name": "New Jersey Final Expense Support Starting Points", "category": "final-expense-support", "state": "new-jersey", "city": "", "nearbyAreas": [], "description": "A plain-English guide for New Jersey families exploring final expense support, care questions, and next steps.", "tags": ["New Jersey", "Final Expense Support", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=new-jersey&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-new-mexico-home-care", "type": "guide", "name": "New Mexico Home Care Starting Points", "category": "home-care", "state": "new-mexico", "city": "", "nearbyAreas": [], "description": "A plain-English guide for New Mexico families exploring home care, care questions, and next steps.", "tags": ["New Mexico", "Home Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=new-mexico&careType=home-care", "verified": false, "featured": true}, {"id": "guide-new-mexico-memory-care", "type": "guide", "name": "New Mexico Memory Care Starting Points", "category": "memory-care", "state": "new-mexico", "city": "", "nearbyAreas": [], "description": "A plain-English guide for New Mexico families exploring memory care, care questions, and next steps.", "tags": ["New Mexico", "Memory Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=new-mexico&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-new-mexico-assisted-living", "type": "guide", "name": "New Mexico Assisted Living Starting Points", "category": "assisted-living", "state": "new-mexico", "city": "", "nearbyAreas": [], "description": "A plain-English guide for New Mexico families exploring assisted living, care questions, and next steps.", "tags": ["New Mexico", "Assisted Living", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=new-mexico&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-new-mexico-respite-care", "type": "guide", "name": "New Mexico Respite Care Starting Points", "category": "respite-care", "state": "new-mexico", "city": "", "nearbyAreas": [], "description": "A plain-English guide for New Mexico families exploring respite care, care questions, and next steps.", "tags": ["New Mexico", "Respite Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=new-mexico&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-new-mexico-elder-law", "type": "guide", "name": "New Mexico Elder Law & Benefits Starting Points", "category": "elder-law", "state": "new-mexico", "city": "", "nearbyAreas": [], "description": "A plain-English guide for New Mexico families exploring elder law & benefits, care questions, and next steps.", "tags": ["New Mexico", "Elder Law & Benefits", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=new-mexico&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-new-mexico-final-expense-support", "type": "guide", "name": "New Mexico Final Expense Support Starting Points", "category": "final-expense-support", "state": "new-mexico", "city": "", "nearbyAreas": [], "description": "A plain-English guide for New Mexico families exploring final expense support, care questions, and next steps.", "tags": ["New Mexico", "Final Expense Support", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=new-mexico&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-new-york-home-care", "type": "guide", "name": "New York Home Care Starting Points", "category": "home-care", "state": "new-york", "city": "", "nearbyAreas": [], "description": "A plain-English guide for New York families exploring home care, care questions, and next steps.", "tags": ["New York", "Home Care", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=new-york&careType=home-care", "verified": false, "featured": true}, {"id": "guide-new-york-memory-care", "type": "guide", "name": "New York Memory Care Starting Points", "category": "memory-care", "state": "new-york", "city": "", "nearbyAreas": [], "description": "A plain-English guide for New York families exploring memory care, care questions, and next steps.", "tags": ["New York", "Memory Care", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=new-york&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-new-york-assisted-living", "type": "guide", "name": "New York Assisted Living Starting Points", "category": "assisted-living", "state": "new-york", "city": "", "nearbyAreas": [], "description": "A plain-English guide for New York families exploring assisted living, care questions, and next steps.", "tags": ["New York", "Assisted Living", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=new-york&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-new-york-respite-care", "type": "guide", "name": "New York Respite Care Starting Points", "category": "respite-care", "state": "new-york", "city": "", "nearbyAreas": [], "description": "A plain-English guide for New York families exploring respite care, care questions, and next steps.", "tags": ["New York", "Respite Care", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=new-york&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-new-york-elder-law", "type": "guide", "name": "New York Elder Law & Benefits Starting Points", "category": "elder-law", "state": "new-york", "city": "", "nearbyAreas": [], "description": "A plain-English guide for New York families exploring elder law & benefits, care questions, and next steps.", "tags": ["New York", "Elder Law & Benefits", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=new-york&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-new-york-final-expense-support", "type": "guide", "name": "New York Final Expense Support Starting Points", "category": "final-expense-support", "state": "new-york", "city": "", "nearbyAreas": [], "description": "A plain-English guide for New York families exploring final expense support, care questions, and next steps.", "tags": ["New York", "Final Expense Support", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=new-york&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-north-carolina-home-care", "type": "guide", "name": "North Carolina Home Care Starting Points", "category": "home-care", "state": "north-carolina", "city": "", "nearbyAreas": [], "description": "A plain-English guide for North Carolina families exploring home care, care questions, and next steps.", "tags": ["North Carolina", "Home Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=north-carolina&careType=home-care", "verified": false, "featured": true}, {"id": "guide-north-carolina-memory-care", "type": "guide", "name": "North Carolina Memory Care Starting Points", "category": "memory-care", "state": "north-carolina", "city": "", "nearbyAreas": [], "description": "A plain-English guide for North Carolina families exploring memory care, care questions, and next steps.", "tags": ["North Carolina", "Memory Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=north-carolina&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-north-carolina-assisted-living", "type": "guide", "name": "North Carolina Assisted Living Starting Points", "category": "assisted-living", "state": "north-carolina", "city": "", "nearbyAreas": [], "description": "A plain-English guide for North Carolina families exploring assisted living, care questions, and next steps.", "tags": ["North Carolina", "Assisted Living", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=north-carolina&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-north-carolina-respite-care", "type": "guide", "name": "North Carolina Respite Care Starting Points", "category": "respite-care", "state": "north-carolina", "city": "", "nearbyAreas": [], "description": "A plain-English guide for North Carolina families exploring respite care, care questions, and next steps.", "tags": ["North Carolina", "Respite Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=north-carolina&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-north-carolina-elder-law", "type": "guide", "name": "North Carolina Elder Law & Benefits Starting Points", "category": "elder-law", "state": "north-carolina", "city": "", "nearbyAreas": [], "description": "A plain-English guide for North Carolina families exploring elder law & benefits, care questions, and next steps.", "tags": ["North Carolina", "Elder Law & Benefits", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=north-carolina&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-north-carolina-final-expense-support", "type": "guide", "name": "North Carolina Final Expense Support Starting Points", "category": "final-expense-support", "state": "north-carolina", "city": "", "nearbyAreas": [], "description": "A plain-English guide for North Carolina families exploring final expense support, care questions, and next steps.", "tags": ["North Carolina", "Final Expense Support", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=north-carolina&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-north-dakota-home-care", "type": "guide", "name": "North Dakota Home Care Starting Points", "category": "home-care", "state": "north-dakota", "city": "", "nearbyAreas": [], "description": "A plain-English guide for North Dakota families exploring home care, care questions, and next steps.", "tags": ["North Dakota", "Home Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=north-dakota&careType=home-care", "verified": false, "featured": true}, {"id": "guide-north-dakota-memory-care", "type": "guide", "name": "North Dakota Memory Care Starting Points", "category": "memory-care", "state": "north-dakota", "city": "", "nearbyAreas": [], "description": "A plain-English guide for North Dakota families exploring memory care, care questions, and next steps.", "tags": ["North Dakota", "Memory Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=north-dakota&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-north-dakota-assisted-living", "type": "guide", "name": "North Dakota Assisted Living Starting Points", "category": "assisted-living", "state": "north-dakota", "city": "", "nearbyAreas": [], "description": "A plain-English guide for North Dakota families exploring assisted living, care questions, and next steps.", "tags": ["North Dakota", "Assisted Living", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=north-dakota&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-north-dakota-respite-care", "type": "guide", "name": "North Dakota Respite Care Starting Points", "category": "respite-care", "state": "north-dakota", "city": "", "nearbyAreas": [], "description": "A plain-English guide for North Dakota families exploring respite care, care questions, and next steps.", "tags": ["North Dakota", "Respite Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=north-dakota&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-north-dakota-elder-law", "type": "guide", "name": "North Dakota Elder Law & Benefits Starting Points", "category": "elder-law", "state": "north-dakota", "city": "", "nearbyAreas": [], "description": "A plain-English guide for North Dakota families exploring elder law & benefits, care questions, and next steps.", "tags": ["North Dakota", "Elder Law & Benefits", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=north-dakota&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-north-dakota-final-expense-support", "type": "guide", "name": "North Dakota Final Expense Support Starting Points", "category": "final-expense-support", "state": "north-dakota", "city": "", "nearbyAreas": [], "description": "A plain-English guide for North Dakota families exploring final expense support, care questions, and next steps.", "tags": ["North Dakota", "Final Expense Support", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=north-dakota&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-ohio-home-care", "type": "guide", "name": "Ohio Home Care Starting Points", "category": "home-care", "state": "ohio", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Ohio families exploring home care, care questions, and next steps.", "tags": ["Ohio", "Home Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=ohio&careType=home-care", "verified": false, "featured": true}, {"id": "guide-ohio-memory-care", "type": "guide", "name": "Ohio Memory Care Starting Points", "category": "memory-care", "state": "ohio", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Ohio families exploring memory care, care questions, and next steps.", "tags": ["Ohio", "Memory Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=ohio&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-ohio-assisted-living", "type": "guide", "name": "Ohio Assisted Living Starting Points", "category": "assisted-living", "state": "ohio", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Ohio families exploring assisted living, care questions, and next steps.", "tags": ["Ohio", "Assisted Living", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=ohio&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-ohio-respite-care", "type": "guide", "name": "Ohio Respite Care Starting Points", "category": "respite-care", "state": "ohio", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Ohio families exploring respite care, care questions, and next steps.", "tags": ["Ohio", "Respite Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=ohio&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-ohio-elder-law", "type": "guide", "name": "Ohio Elder Law & Benefits Starting Points", "category": "elder-law", "state": "ohio", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Ohio families exploring elder law & benefits, care questions, and next steps.", "tags": ["Ohio", "Elder Law & Benefits", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=ohio&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-ohio-final-expense-support", "type": "guide", "name": "Ohio Final Expense Support Starting Points", "category": "final-expense-support", "state": "ohio", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Ohio families exploring final expense support, care questions, and next steps.", "tags": ["Ohio", "Final Expense Support", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=ohio&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-oklahoma-home-care", "type": "guide", "name": "Oklahoma Home Care Starting Points", "category": "home-care", "state": "oklahoma", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Oklahoma families exploring home care, care questions, and next steps.", "tags": ["Oklahoma", "Home Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=oklahoma&careType=home-care", "verified": false, "featured": true}, {"id": "guide-oklahoma-memory-care", "type": "guide", "name": "Oklahoma Memory Care Starting Points", "category": "memory-care", "state": "oklahoma", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Oklahoma families exploring memory care, care questions, and next steps.", "tags": ["Oklahoma", "Memory Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=oklahoma&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-oklahoma-assisted-living", "type": "guide", "name": "Oklahoma Assisted Living Starting Points", "category": "assisted-living", "state": "oklahoma", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Oklahoma families exploring assisted living, care questions, and next steps.", "tags": ["Oklahoma", "Assisted Living", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=oklahoma&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-oklahoma-respite-care", "type": "guide", "name": "Oklahoma Respite Care Starting Points", "category": "respite-care", "state": "oklahoma", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Oklahoma families exploring respite care, care questions, and next steps.", "tags": ["Oklahoma", "Respite Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=oklahoma&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-oklahoma-elder-law", "type": "guide", "name": "Oklahoma Elder Law & Benefits Starting Points", "category": "elder-law", "state": "oklahoma", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Oklahoma families exploring elder law & benefits, care questions, and next steps.", "tags": ["Oklahoma", "Elder Law & Benefits", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=oklahoma&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-oklahoma-final-expense-support", "type": "guide", "name": "Oklahoma Final Expense Support Starting Points", "category": "final-expense-support", "state": "oklahoma", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Oklahoma families exploring final expense support, care questions, and next steps.", "tags": ["Oklahoma", "Final Expense Support", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=oklahoma&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-oregon-home-care", "type": "guide", "name": "Oregon Home Care Starting Points", "category": "home-care", "state": "oregon", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Oregon families exploring home care, care questions, and next steps.", "tags": ["Oregon", "Home Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=oregon&careType=home-care", "verified": false, "featured": true}, {"id": "guide-oregon-memory-care", "type": "guide", "name": "Oregon Memory Care Starting Points", "category": "memory-care", "state": "oregon", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Oregon families exploring memory care, care questions, and next steps.", "tags": ["Oregon", "Memory Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=oregon&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-oregon-assisted-living", "type": "guide", "name": "Oregon Assisted Living Starting Points", "category": "assisted-living", "state": "oregon", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Oregon families exploring assisted living, care questions, and next steps.", "tags": ["Oregon", "Assisted Living", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=oregon&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-oregon-respite-care", "type": "guide", "name": "Oregon Respite Care Starting Points", "category": "respite-care", "state": "oregon", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Oregon families exploring respite care, care questions, and next steps.", "tags": ["Oregon", "Respite Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=oregon&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-oregon-elder-law", "type": "guide", "name": "Oregon Elder Law & Benefits Starting Points", "category": "elder-law", "state": "oregon", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Oregon families exploring elder law & benefits, care questions, and next steps.", "tags": ["Oregon", "Elder Law & Benefits", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=oregon&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-oregon-final-expense-support", "type": "guide", "name": "Oregon Final Expense Support Starting Points", "category": "final-expense-support", "state": "oregon", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Oregon families exploring final expense support, care questions, and next steps.", "tags": ["Oregon", "Final Expense Support", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=oregon&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-pennsylvania-home-care", "type": "guide", "name": "Pennsylvania Home Care Starting Points", "category": "home-care", "state": "pennsylvania", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Pennsylvania families exploring home care, care questions, and next steps.", "tags": ["Pennsylvania", "Home Care", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=pennsylvania&careType=home-care", "verified": false, "featured": true}, {"id": "guide-pennsylvania-memory-care", "type": "guide", "name": "Pennsylvania Memory Care Starting Points", "category": "memory-care", "state": "pennsylvania", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Pennsylvania families exploring memory care, care questions, and next steps.", "tags": ["Pennsylvania", "Memory Care", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=pennsylvania&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-pennsylvania-assisted-living", "type": "guide", "name": "Pennsylvania Assisted Living Starting Points", "category": "assisted-living", "state": "pennsylvania", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Pennsylvania families exploring assisted living, care questions, and next steps.", "tags": ["Pennsylvania", "Assisted Living", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=pennsylvania&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-pennsylvania-respite-care", "type": "guide", "name": "Pennsylvania Respite Care Starting Points", "category": "respite-care", "state": "pennsylvania", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Pennsylvania families exploring respite care, care questions, and next steps.", "tags": ["Pennsylvania", "Respite Care", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=pennsylvania&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-pennsylvania-elder-law", "type": "guide", "name": "Pennsylvania Elder Law & Benefits Starting Points", "category": "elder-law", "state": "pennsylvania", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Pennsylvania families exploring elder law & benefits, care questions, and next steps.", "tags": ["Pennsylvania", "Elder Law & Benefits", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=pennsylvania&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-pennsylvania-final-expense-support", "type": "guide", "name": "Pennsylvania Final Expense Support Starting Points", "category": "final-expense-support", "state": "pennsylvania", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Pennsylvania families exploring final expense support, care questions, and next steps.", "tags": ["Pennsylvania", "Final Expense Support", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=pennsylvania&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-rhode-island-home-care", "type": "guide", "name": "Rhode Island Home Care Starting Points", "category": "home-care", "state": "rhode-island", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Rhode Island families exploring home care, care questions, and next steps.", "tags": ["Rhode Island", "Home Care", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=rhode-island&careType=home-care", "verified": false, "featured": true}, {"id": "guide-rhode-island-memory-care", "type": "guide", "name": "Rhode Island Memory Care Starting Points", "category": "memory-care", "state": "rhode-island", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Rhode Island families exploring memory care, care questions, and next steps.", "tags": ["Rhode Island", "Memory Care", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=rhode-island&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-rhode-island-assisted-living", "type": "guide", "name": "Rhode Island Assisted Living Starting Points", "category": "assisted-living", "state": "rhode-island", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Rhode Island families exploring assisted living, care questions, and next steps.", "tags": ["Rhode Island", "Assisted Living", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=rhode-island&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-rhode-island-respite-care", "type": "guide", "name": "Rhode Island Respite Care Starting Points", "category": "respite-care", "state": "rhode-island", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Rhode Island families exploring respite care, care questions, and next steps.", "tags": ["Rhode Island", "Respite Care", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=rhode-island&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-rhode-island-elder-law", "type": "guide", "name": "Rhode Island Elder Law & Benefits Starting Points", "category": "elder-law", "state": "rhode-island", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Rhode Island families exploring elder law & benefits, care questions, and next steps.", "tags": ["Rhode Island", "Elder Law & Benefits", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=rhode-island&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-rhode-island-final-expense-support", "type": "guide", "name": "Rhode Island Final Expense Support Starting Points", "category": "final-expense-support", "state": "rhode-island", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Rhode Island families exploring final expense support, care questions, and next steps.", "tags": ["Rhode Island", "Final Expense Support", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=rhode-island&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-south-carolina-home-care", "type": "guide", "name": "South Carolina Home Care Starting Points", "category": "home-care", "state": "south-carolina", "city": "", "nearbyAreas": [], "description": "A plain-English guide for South Carolina families exploring home care, care questions, and next steps.", "tags": ["South Carolina", "Home Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=south-carolina&careType=home-care", "verified": false, "featured": true}, {"id": "guide-south-carolina-memory-care", "type": "guide", "name": "South Carolina Memory Care Starting Points", "category": "memory-care", "state": "south-carolina", "city": "", "nearbyAreas": [], "description": "A plain-English guide for South Carolina families exploring memory care, care questions, and next steps.", "tags": ["South Carolina", "Memory Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=south-carolina&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-south-carolina-assisted-living", "type": "guide", "name": "South Carolina Assisted Living Starting Points", "category": "assisted-living", "state": "south-carolina", "city": "", "nearbyAreas": [], "description": "A plain-English guide for South Carolina families exploring assisted living, care questions, and next steps.", "tags": ["South Carolina", "Assisted Living", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=south-carolina&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-south-carolina-respite-care", "type": "guide", "name": "South Carolina Respite Care Starting Points", "category": "respite-care", "state": "south-carolina", "city": "", "nearbyAreas": [], "description": "A plain-English guide for South Carolina families exploring respite care, care questions, and next steps.", "tags": ["South Carolina", "Respite Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=south-carolina&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-south-carolina-elder-law", "type": "guide", "name": "South Carolina Elder Law & Benefits Starting Points", "category": "elder-law", "state": "south-carolina", "city": "", "nearbyAreas": [], "description": "A plain-English guide for South Carolina families exploring elder law & benefits, care questions, and next steps.", "tags": ["South Carolina", "Elder Law & Benefits", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=south-carolina&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-south-carolina-final-expense-support", "type": "guide", "name": "South Carolina Final Expense Support Starting Points", "category": "final-expense-support", "state": "south-carolina", "city": "", "nearbyAreas": [], "description": "A plain-English guide for South Carolina families exploring final expense support, care questions, and next steps.", "tags": ["South Carolina", "Final Expense Support", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=south-carolina&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-south-dakota-home-care", "type": "guide", "name": "South Dakota Home Care Starting Points", "category": "home-care", "state": "south-dakota", "city": "", "nearbyAreas": [], "description": "A plain-English guide for South Dakota families exploring home care, care questions, and next steps.", "tags": ["South Dakota", "Home Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=south-dakota&careType=home-care", "verified": false, "featured": true}, {"id": "guide-south-dakota-memory-care", "type": "guide", "name": "South Dakota Memory Care Starting Points", "category": "memory-care", "state": "south-dakota", "city": "", "nearbyAreas": [], "description": "A plain-English guide for South Dakota families exploring memory care, care questions, and next steps.", "tags": ["South Dakota", "Memory Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=south-dakota&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-south-dakota-assisted-living", "type": "guide", "name": "South Dakota Assisted Living Starting Points", "category": "assisted-living", "state": "south-dakota", "city": "", "nearbyAreas": [], "description": "A plain-English guide for South Dakota families exploring assisted living, care questions, and next steps.", "tags": ["South Dakota", "Assisted Living", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=south-dakota&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-south-dakota-respite-care", "type": "guide", "name": "South Dakota Respite Care Starting Points", "category": "respite-care", "state": "south-dakota", "city": "", "nearbyAreas": [], "description": "A plain-English guide for South Dakota families exploring respite care, care questions, and next steps.", "tags": ["South Dakota", "Respite Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=south-dakota&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-south-dakota-elder-law", "type": "guide", "name": "South Dakota Elder Law & Benefits Starting Points", "category": "elder-law", "state": "south-dakota", "city": "", "nearbyAreas": [], "description": "A plain-English guide for South Dakota families exploring elder law & benefits, care questions, and next steps.", "tags": ["South Dakota", "Elder Law & Benefits", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=south-dakota&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-south-dakota-final-expense-support", "type": "guide", "name": "South Dakota Final Expense Support Starting Points", "category": "final-expense-support", "state": "south-dakota", "city": "", "nearbyAreas": [], "description": "A plain-English guide for South Dakota families exploring final expense support, care questions, and next steps.", "tags": ["South Dakota", "Final Expense Support", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=south-dakota&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-tennessee-home-care", "type": "guide", "name": "Tennessee Home Care Starting Points", "category": "home-care", "state": "tennessee", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Tennessee families exploring home care, care questions, and next steps.", "tags": ["Tennessee", "Home Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=tennessee&careType=home-care", "verified": false, "featured": true}, {"id": "guide-tennessee-memory-care", "type": "guide", "name": "Tennessee Memory Care Starting Points", "category": "memory-care", "state": "tennessee", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Tennessee families exploring memory care, care questions, and next steps.", "tags": ["Tennessee", "Memory Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=tennessee&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-tennessee-assisted-living", "type": "guide", "name": "Tennessee Assisted Living Starting Points", "category": "assisted-living", "state": "tennessee", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Tennessee families exploring assisted living, care questions, and next steps.", "tags": ["Tennessee", "Assisted Living", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=tennessee&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-tennessee-respite-care", "type": "guide", "name": "Tennessee Respite Care Starting Points", "category": "respite-care", "state": "tennessee", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Tennessee families exploring respite care, care questions, and next steps.", "tags": ["Tennessee", "Respite Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=tennessee&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-tennessee-elder-law", "type": "guide", "name": "Tennessee Elder Law & Benefits Starting Points", "category": "elder-law", "state": "tennessee", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Tennessee families exploring elder law & benefits, care questions, and next steps.", "tags": ["Tennessee", "Elder Law & Benefits", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=tennessee&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-tennessee-final-expense-support", "type": "guide", "name": "Tennessee Final Expense Support Starting Points", "category": "final-expense-support", "state": "tennessee", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Tennessee families exploring final expense support, care questions, and next steps.", "tags": ["Tennessee", "Final Expense Support", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=tennessee&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-texas-home-care", "type": "guide", "name": "Texas Home Care Starting Points", "category": "home-care", "state": "texas", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Texas families exploring home care, care questions, and next steps.", "tags": ["Texas", "Home Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=texas&careType=home-care", "verified": false, "featured": true}, {"id": "guide-texas-memory-care", "type": "guide", "name": "Texas Memory Care Starting Points", "category": "memory-care", "state": "texas", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Texas families exploring memory care, care questions, and next steps.", "tags": ["Texas", "Memory Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=texas&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-texas-assisted-living", "type": "guide", "name": "Texas Assisted Living Starting Points", "category": "assisted-living", "state": "texas", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Texas families exploring assisted living, care questions, and next steps.", "tags": ["Texas", "Assisted Living", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=texas&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-texas-respite-care", "type": "guide", "name": "Texas Respite Care Starting Points", "category": "respite-care", "state": "texas", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Texas families exploring respite care, care questions, and next steps.", "tags": ["Texas", "Respite Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=texas&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-texas-elder-law", "type": "guide", "name": "Texas Elder Law & Benefits Starting Points", "category": "elder-law", "state": "texas", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Texas families exploring elder law & benefits, care questions, and next steps.", "tags": ["Texas", "Elder Law & Benefits", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=texas&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-texas-final-expense-support", "type": "guide", "name": "Texas Final Expense Support Starting Points", "category": "final-expense-support", "state": "texas", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Texas families exploring final expense support, care questions, and next steps.", "tags": ["Texas", "Final Expense Support", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=texas&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-utah-home-care", "type": "guide", "name": "Utah Home Care Starting Points", "category": "home-care", "state": "utah", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Utah families exploring home care, care questions, and next steps.", "tags": ["Utah", "Home Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=utah&careType=home-care", "verified": false, "featured": true}, {"id": "guide-utah-memory-care", "type": "guide", "name": "Utah Memory Care Starting Points", "category": "memory-care", "state": "utah", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Utah families exploring memory care, care questions, and next steps.", "tags": ["Utah", "Memory Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=utah&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-utah-assisted-living", "type": "guide", "name": "Utah Assisted Living Starting Points", "category": "assisted-living", "state": "utah", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Utah families exploring assisted living, care questions, and next steps.", "tags": ["Utah", "Assisted Living", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=utah&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-utah-respite-care", "type": "guide", "name": "Utah Respite Care Starting Points", "category": "respite-care", "state": "utah", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Utah families exploring respite care, care questions, and next steps.", "tags": ["Utah", "Respite Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=utah&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-utah-elder-law", "type": "guide", "name": "Utah Elder Law & Benefits Starting Points", "category": "elder-law", "state": "utah", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Utah families exploring elder law & benefits, care questions, and next steps.", "tags": ["Utah", "Elder Law & Benefits", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=utah&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-utah-final-expense-support", "type": "guide", "name": "Utah Final Expense Support Starting Points", "category": "final-expense-support", "state": "utah", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Utah families exploring final expense support, care questions, and next steps.", "tags": ["Utah", "Final Expense Support", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=utah&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-vermont-home-care", "type": "guide", "name": "Vermont Home Care Starting Points", "category": "home-care", "state": "vermont", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Vermont families exploring home care, care questions, and next steps.", "tags": ["Vermont", "Home Care", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=vermont&careType=home-care", "verified": false, "featured": true}, {"id": "guide-vermont-memory-care", "type": "guide", "name": "Vermont Memory Care Starting Points", "category": "memory-care", "state": "vermont", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Vermont families exploring memory care, care questions, and next steps.", "tags": ["Vermont", "Memory Care", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=vermont&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-vermont-assisted-living", "type": "guide", "name": "Vermont Assisted Living Starting Points", "category": "assisted-living", "state": "vermont", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Vermont families exploring assisted living, care questions, and next steps.", "tags": ["Vermont", "Assisted Living", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=vermont&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-vermont-respite-care", "type": "guide", "name": "Vermont Respite Care Starting Points", "category": "respite-care", "state": "vermont", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Vermont families exploring respite care, care questions, and next steps.", "tags": ["Vermont", "Respite Care", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=vermont&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-vermont-elder-law", "type": "guide", "name": "Vermont Elder Law & Benefits Starting Points", "category": "elder-law", "state": "vermont", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Vermont families exploring elder law & benefits, care questions, and next steps.", "tags": ["Vermont", "Elder Law & Benefits", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=vermont&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-vermont-final-expense-support", "type": "guide", "name": "Vermont Final Expense Support Starting Points", "category": "final-expense-support", "state": "vermont", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Vermont families exploring final expense support, care questions, and next steps.", "tags": ["Vermont", "Final Expense Support", "Northeast", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=vermont&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-virginia-home-care", "type": "guide", "name": "Virginia Home Care Starting Points", "category": "home-care", "state": "virginia", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Virginia families exploring home care, care questions, and next steps.", "tags": ["Virginia", "Home Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=virginia&careType=home-care", "verified": false, "featured": true}, {"id": "guide-virginia-memory-care", "type": "guide", "name": "Virginia Memory Care Starting Points", "category": "memory-care", "state": "virginia", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Virginia families exploring memory care, care questions, and next steps.", "tags": ["Virginia", "Memory Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=virginia&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-virginia-assisted-living", "type": "guide", "name": "Virginia Assisted Living Starting Points", "category": "assisted-living", "state": "virginia", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Virginia families exploring assisted living, care questions, and next steps.", "tags": ["Virginia", "Assisted Living", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=virginia&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-virginia-respite-care", "type": "guide", "name": "Virginia Respite Care Starting Points", "category": "respite-care", "state": "virginia", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Virginia families exploring respite care, care questions, and next steps.", "tags": ["Virginia", "Respite Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=virginia&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-virginia-elder-law", "type": "guide", "name": "Virginia Elder Law & Benefits Starting Points", "category": "elder-law", "state": "virginia", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Virginia families exploring elder law & benefits, care questions, and next steps.", "tags": ["Virginia", "Elder Law & Benefits", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=virginia&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-virginia-final-expense-support", "type": "guide", "name": "Virginia Final Expense Support Starting Points", "category": "final-expense-support", "state": "virginia", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Virginia families exploring final expense support, care questions, and next steps.", "tags": ["Virginia", "Final Expense Support", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=virginia&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-washington-home-care", "type": "guide", "name": "Washington Home Care Starting Points", "category": "home-care", "state": "washington", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Washington families exploring home care, care questions, and next steps.", "tags": ["Washington", "Home Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=washington&careType=home-care", "verified": false, "featured": true}, {"id": "guide-washington-memory-care", "type": "guide", "name": "Washington Memory Care Starting Points", "category": "memory-care", "state": "washington", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Washington families exploring memory care, care questions, and next steps.", "tags": ["Washington", "Memory Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=washington&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-washington-assisted-living", "type": "guide", "name": "Washington Assisted Living Starting Points", "category": "assisted-living", "state": "washington", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Washington families exploring assisted living, care questions, and next steps.", "tags": ["Washington", "Assisted Living", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=washington&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-washington-respite-care", "type": "guide", "name": "Washington Respite Care Starting Points", "category": "respite-care", "state": "washington", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Washington families exploring respite care, care questions, and next steps.", "tags": ["Washington", "Respite Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=washington&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-washington-elder-law", "type": "guide", "name": "Washington Elder Law & Benefits Starting Points", "category": "elder-law", "state": "washington", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Washington families exploring elder law & benefits, care questions, and next steps.", "tags": ["Washington", "Elder Law & Benefits", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=washington&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-washington-final-expense-support", "type": "guide", "name": "Washington Final Expense Support Starting Points", "category": "final-expense-support", "state": "washington", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Washington families exploring final expense support, care questions, and next steps.", "tags": ["Washington", "Final Expense Support", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=washington&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-west-virginia-home-care", "type": "guide", "name": "West Virginia Home Care Starting Points", "category": "home-care", "state": "west-virginia", "city": "", "nearbyAreas": [], "description": "A plain-English guide for West Virginia families exploring home care, care questions, and next steps.", "tags": ["West Virginia", "Home Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=west-virginia&careType=home-care", "verified": false, "featured": true}, {"id": "guide-west-virginia-memory-care", "type": "guide", "name": "West Virginia Memory Care Starting Points", "category": "memory-care", "state": "west-virginia", "city": "", "nearbyAreas": [], "description": "A plain-English guide for West Virginia families exploring memory care, care questions, and next steps.", "tags": ["West Virginia", "Memory Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=west-virginia&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-west-virginia-assisted-living", "type": "guide", "name": "West Virginia Assisted Living Starting Points", "category": "assisted-living", "state": "west-virginia", "city": "", "nearbyAreas": [], "description": "A plain-English guide for West Virginia families exploring assisted living, care questions, and next steps.", "tags": ["West Virginia", "Assisted Living", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=west-virginia&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-west-virginia-respite-care", "type": "guide", "name": "West Virginia Respite Care Starting Points", "category": "respite-care", "state": "west-virginia", "city": "", "nearbyAreas": [], "description": "A plain-English guide for West Virginia families exploring respite care, care questions, and next steps.", "tags": ["West Virginia", "Respite Care", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=west-virginia&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-west-virginia-elder-law", "type": "guide", "name": "West Virginia Elder Law & Benefits Starting Points", "category": "elder-law", "state": "west-virginia", "city": "", "nearbyAreas": [], "description": "A plain-English guide for West Virginia families exploring elder law & benefits, care questions, and next steps.", "tags": ["West Virginia", "Elder Law & Benefits", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=west-virginia&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-west-virginia-final-expense-support", "type": "guide", "name": "West Virginia Final Expense Support Starting Points", "category": "final-expense-support", "state": "west-virginia", "city": "", "nearbyAreas": [], "description": "A plain-English guide for West Virginia families exploring final expense support, care questions, and next steps.", "tags": ["West Virginia", "Final Expense Support", "South", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=west-virginia&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-wisconsin-home-care", "type": "guide", "name": "Wisconsin Home Care Starting Points", "category": "home-care", "state": "wisconsin", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Wisconsin families exploring home care, care questions, and next steps.", "tags": ["Wisconsin", "Home Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=wisconsin&careType=home-care", "verified": false, "featured": true}, {"id": "guide-wisconsin-memory-care", "type": "guide", "name": "Wisconsin Memory Care Starting Points", "category": "memory-care", "state": "wisconsin", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Wisconsin families exploring memory care, care questions, and next steps.", "tags": ["Wisconsin", "Memory Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=wisconsin&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-wisconsin-assisted-living", "type": "guide", "name": "Wisconsin Assisted Living Starting Points", "category": "assisted-living", "state": "wisconsin", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Wisconsin families exploring assisted living, care questions, and next steps.", "tags": ["Wisconsin", "Assisted Living", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=wisconsin&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-wisconsin-respite-care", "type": "guide", "name": "Wisconsin Respite Care Starting Points", "category": "respite-care", "state": "wisconsin", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Wisconsin families exploring respite care, care questions, and next steps.", "tags": ["Wisconsin", "Respite Care", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=wisconsin&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-wisconsin-elder-law", "type": "guide", "name": "Wisconsin Elder Law & Benefits Starting Points", "category": "elder-law", "state": "wisconsin", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Wisconsin families exploring elder law & benefits, care questions, and next steps.", "tags": ["Wisconsin", "Elder Law & Benefits", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=wisconsin&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-wisconsin-final-expense-support", "type": "guide", "name": "Wisconsin Final Expense Support Starting Points", "category": "final-expense-support", "state": "wisconsin", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Wisconsin families exploring final expense support, care questions, and next steps.", "tags": ["Wisconsin", "Final Expense Support", "Midwest", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=wisconsin&careType=final-expense-support", "verified": false, "featured": false}, {"id": "guide-wyoming-home-care", "type": "guide", "name": "Wyoming Home Care Starting Points", "category": "home-care", "state": "wyoming", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Wyoming families exploring home care, care questions, and next steps.", "tags": ["Wyoming", "Home Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=wyoming&careType=home-care", "verified": false, "featured": true}, {"id": "guide-wyoming-memory-care", "type": "guide", "name": "Wyoming Memory Care Starting Points", "category": "memory-care", "state": "wyoming", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Wyoming families exploring memory care, care questions, and next steps.", "tags": ["Wyoming", "Memory Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=wyoming&careType=memory-care", "verified": false, "featured": true}, {"id": "guide-wyoming-assisted-living", "type": "guide", "name": "Wyoming Assisted Living Starting Points", "category": "assisted-living", "state": "wyoming", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Wyoming families exploring assisted living, care questions, and next steps.", "tags": ["Wyoming", "Assisted Living", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=wyoming&careType=assisted-living", "verified": false, "featured": false}, {"id": "guide-wyoming-respite-care", "type": "guide", "name": "Wyoming Respite Care Starting Points", "category": "respite-care", "state": "wyoming", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Wyoming families exploring respite care, care questions, and next steps.", "tags": ["Wyoming", "Respite Care", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=wyoming&careType=respite-care", "verified": false, "featured": false}, {"id": "guide-wyoming-elder-law", "type": "guide", "name": "Wyoming Elder Law & Benefits Starting Points", "category": "elder-law", "state": "wyoming", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Wyoming families exploring elder law & benefits, care questions, and next steps.", "tags": ["Wyoming", "Elder Law & Benefits", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=wyoming&careType=elder-law", "verified": false, "featured": false}, {"id": "guide-wyoming-final-expense-support", "type": "guide", "name": "Wyoming Final Expense Support Starting Points", "category": "final-expense-support", "state": "wyoming", "city": "", "nearbyAreas": [], "description": "A plain-English guide for Wyoming families exploring final expense support, care questions, and next steps.", "tags": ["Wyoming", "Final Expense Support", "West", "guide"], "ctaLabel": "View guide", "url": "../search/index.html?state=wyoming&careType=final-expense-support", "verified": false, "featured": false}];

function cimSafeSlug(value) {
  return (value || '').toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function cimPrefix() {
  const path = window.location.pathname;
  if (path.includes('/florida/boca-raton/')) return '../../';
  if (path.includes('/services/')) return '../../';
  if (path.includes('/states/') || path.includes('/search/') || path.includes('/about/')) return '../';
  const found = (window.CAREINMYCITY_STATES || []).some(s => path.includes('/' + s.slug + '/'));
  return found ? '../' : '';
}

function cimPopulateStatesMenusSafe() {
  const menus = document.querySelectorAll('[data-states-menu]');
  const prefix = cimPrefix();
  const regions = ['Northeast','South','Midwest','West'];
  menus.forEach(menu => {
    let html = `<div class="dropdown-label">All States</div><a href="${prefix}states/index.html"><strong>View All States</strong><span>National coverage index</span></a>`;
    regions.forEach(region => {
      html += `<div class="dropdown-label">${region}</div>`;
      (window.CAREINMYCITY_STATES || []).filter(s => s.region === region).forEach(state => {
        html += `<a href="${prefix}${state.slug}/index.html"><strong>${state.name}</strong><span>${state.region} care resources</span></a>`;
      });
    });
    menu.innerHTML = html;
  });
}


function cimInitStateFormsSafe() {
  document.querySelectorAll('.stateSearchForm').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const params = new URLSearchParams();
      const state = form.dataset.state;
      const care = form.querySelector('[name="careType"]')?.value || '';
      const loc = form.querySelector('[name="cityOrZip"]')?.value || '';
      if (state) params.set('state', state);
      if (care) params.set('careType', care);
      if (loc) params.set('location', cimSafeSlug(loc));
      window.location.href = `${cimPrefix()}search/index.html?${params.toString()}`;
    });
  });
}

function cimInitMapSafe() {
  const map = document.querySelector('[data-coverage-map]');
  if (!map) return;
  document.querySelectorAll('[data-map-filter]').forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.mapFilter;
      document.querySelectorAll('[data-map-filter]').forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      map.querySelectorAll('.map-state').forEach(state => {
        const match = filter === 'all' || state.dataset.region === filter;
        state.classList.toggle('dimmed', !match);
      });
    });
  });
}




function cimInitDropdownsUnified() {
  document.querySelectorAll('.dropdown-toggle').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const dropdown = button.closest('.nav-dropdown');
      if (!dropdown) return;
      const willOpen = !dropdown.classList.contains('open');
      document.querySelectorAll('.nav-dropdown.open').forEach((item) => {
        item.classList.remove('open');
        const toggle = item.querySelector('.dropdown-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      });
      dropdown.classList.toggle('open', willOpen);
      button.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.nav-dropdown.open').forEach((item) => {
      item.classList.remove('open');
      const toggle = item.querySelector('.dropdown-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof cimPopulateStatesMenusSafe === 'function') cimPopulateStatesMenusSafe();
  if (typeof cimInitDropdownsUnified === 'function') cimInitDropdownsUnified();
  if (typeof cimInitStateFormsSafe === 'function') cimInitStateFormsSafe();
  if (typeof cimInitMapSafe === 'function') cimInitMapSafe();
});

/* City page search forms */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.citySearchForm').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const params = new URLSearchParams();
      const state = form.dataset.state || '';
      const city = form.dataset.city || '';
      const care = form.querySelector('[name="careType"]')?.value || '';
      if (state) params.set('state', state);
      if (city) params.set('location', city);
      if (care) params.set('careType', care);
      window.location.href = `../../search/index.html?${params.toString()}`;
    });
  });
});


/* Final dropdown/city patch */
window.CAREINMYCITY_STATES = [{"name": "Alabama", "slug": "alabama", "abbr": "AL", "region": "South"}, {"name": "Alaska", "slug": "alaska", "abbr": "AK", "region": "West"}, {"name": "Arizona", "slug": "arizona", "abbr": "AZ", "region": "West"}, {"name": "Arkansas", "slug": "arkansas", "abbr": "AR", "region": "South"}, {"name": "California", "slug": "california", "abbr": "CA", "region": "West"}, {"name": "Colorado", "slug": "colorado", "abbr": "CO", "region": "West"}, {"name": "Connecticut", "slug": "connecticut", "abbr": "CT", "region": "Northeast"}, {"name": "Delaware", "slug": "delaware", "abbr": "DE", "region": "South"}, {"name": "Florida", "slug": "florida", "abbr": "FL", "region": "South"}, {"name": "Georgia", "slug": "georgia", "abbr": "GA", "region": "South"}, {"name": "Hawaii", "slug": "hawaii", "abbr": "HI", "region": "West"}, {"name": "Idaho", "slug": "idaho", "abbr": "ID", "region": "West"}, {"name": "Illinois", "slug": "illinois", "abbr": "IL", "region": "Midwest"}, {"name": "Indiana", "slug": "indiana", "abbr": "IN", "region": "Midwest"}, {"name": "Iowa", "slug": "iowa", "abbr": "IA", "region": "Midwest"}, {"name": "Kansas", "slug": "kansas", "abbr": "KS", "region": "Midwest"}, {"name": "Kentucky", "slug": "kentucky", "abbr": "KY", "region": "South"}, {"name": "Louisiana", "slug": "louisiana", "abbr": "LA", "region": "South"}, {"name": "Maine", "slug": "maine", "abbr": "ME", "region": "Northeast"}, {"name": "Maryland", "slug": "maryland", "abbr": "MD", "region": "South"}, {"name": "Massachusetts", "slug": "massachusetts", "abbr": "MA", "region": "Northeast"}, {"name": "Michigan", "slug": "michigan", "abbr": "MI", "region": "Midwest"}, {"name": "Minnesota", "slug": "minnesota", "abbr": "MN", "region": "Midwest"}, {"name": "Mississippi", "slug": "mississippi", "abbr": "MS", "region": "South"}, {"name": "Missouri", "slug": "missouri", "abbr": "MO", "region": "Midwest"}, {"name": "Montana", "slug": "montana", "abbr": "MT", "region": "West"}, {"name": "Nebraska", "slug": "nebraska", "abbr": "NE", "region": "Midwest"}, {"name": "Nevada", "slug": "nevada", "abbr": "NV", "region": "West"}, {"name": "New Hampshire", "slug": "new-hampshire", "abbr": "NH", "region": "Northeast"}, {"name": "New Jersey", "slug": "new-jersey", "abbr": "NJ", "region": "Northeast"}, {"name": "New Mexico", "slug": "new-mexico", "abbr": "NM", "region": "West"}, {"name": "New York", "slug": "new-york", "abbr": "NY", "region": "Northeast"}, {"name": "North Carolina", "slug": "north-carolina", "abbr": "NC", "region": "South"}, {"name": "North Dakota", "slug": "north-dakota", "abbr": "ND", "region": "Midwest"}, {"name": "Ohio", "slug": "ohio", "abbr": "OH", "region": "Midwest"}, {"name": "Oklahoma", "slug": "oklahoma", "abbr": "OK", "region": "South"}, {"name": "Oregon", "slug": "oregon", "abbr": "OR", "region": "West"}, {"name": "Pennsylvania", "slug": "pennsylvania", "abbr": "PA", "region": "Northeast"}, {"name": "Rhode Island", "slug": "rhode-island", "abbr": "RI", "region": "Northeast"}, {"name": "South Carolina", "slug": "south-carolina", "abbr": "SC", "region": "South"}, {"name": "South Dakota", "slug": "south-dakota", "abbr": "SD", "region": "Midwest"}, {"name": "Tennessee", "slug": "tennessee", "abbr": "TN", "region": "South"}, {"name": "Texas", "slug": "texas", "abbr": "TX", "region": "South"}, {"name": "Utah", "slug": "utah", "abbr": "UT", "region": "West"}, {"name": "Vermont", "slug": "vermont", "abbr": "VT", "region": "Northeast"}, {"name": "Virginia", "slug": "virginia", "abbr": "VA", "region": "South"}, {"name": "Washington", "slug": "washington", "abbr": "WA", "region": "West"}, {"name": "West Virginia", "slug": "west-virginia", "abbr": "WV", "region": "South"}, {"name": "Wisconsin", "slug": "wisconsin", "abbr": "WI", "region": "Midwest"}, {"name": "Wyoming", "slug": "wyoming", "abbr": "WY", "region": "West"}];

function cimPatchPrefix() {
  const path = window.location.pathname;
  if (path.includes('/florida/boca-raton/')) return '../../';
  if (path.includes('/services/')) return '../../';
  if (path.includes('/states/') || path.includes('/search/') || path.includes('/about/')) return '../';
  const states = window.CAREINMYCITY_STATES || [];
  const matchedState = states.find(s => path.includes('/' + s.slug + '/'));
  if (matchedState) {
    const parts = path.split('/').filter(Boolean);
    return parts.length >= 2 ? '../../' : '../';
  }
  return '';
}

function cimPopulateStatesMenusPatch() {
  const menus = document.querySelectorAll('[data-states-menu]');
  const prefix = cimPatchPrefix();
  const regions = ['Northeast', 'South', 'Midwest', 'West'];
  menus.forEach(menu => {
    let output = `<div class="dropdown-label">All States</div><a href="${prefix}states/index.html"><strong>View All States</strong><span>National coverage index</span></a>`;
    regions.forEach(region => {
      output += `<div class="dropdown-label">${region}</div>`;
      (window.CAREINMYCITY_STATES || [])
        .filter(state => state.region === region)
        .forEach(state => {
          output += `<a href="${prefix}${state.slug}/index.html"><strong>${state.name}</strong><span>${state.region} care resources</span></a>`;
        });
    });
    menu.innerHTML = output;
  });
}

function cimDropdownPatch() {
  document.querySelectorAll('.dropdown-toggle').forEach(button => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      const dropdown = button.closest('.nav-dropdown');
      if (!dropdown) return false;
      const shouldOpen = !dropdown.classList.contains('open');
      document.querySelectorAll('.nav-dropdown.open').forEach(item => {
        item.classList.remove('open');
        const toggle = item.querySelector('.dropdown-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      });
      dropdown.classList.toggle('open', shouldOpen);
      button.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
      return false;
    };
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.nav-dropdown.open').forEach(item => {
      item.classList.remove('open');
      const toggle = item.querySelector('.dropdown-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  cimPopulateStatesMenusPatch();
  cimDropdownPatch();
});


/* FINAL NAV + SEARCH STABILITY PATCH */
window.CAREINMYCITY_STATES = [{"name": "Alabama", "slug": "alabama", "abbr": "AL", "region": "South"}, {"name": "Alaska", "slug": "alaska", "abbr": "AK", "region": "West"}, {"name": "Arizona", "slug": "arizona", "abbr": "AZ", "region": "West"}, {"name": "Arkansas", "slug": "arkansas", "abbr": "AR", "region": "South"}, {"name": "California", "slug": "california", "abbr": "CA", "region": "West"}, {"name": "Colorado", "slug": "colorado", "abbr": "CO", "region": "West"}, {"name": "Connecticut", "slug": "connecticut", "abbr": "CT", "region": "Northeast"}, {"name": "Delaware", "slug": "delaware", "abbr": "DE", "region": "South"}, {"name": "Florida", "slug": "florida", "abbr": "FL", "region": "South"}, {"name": "Georgia", "slug": "georgia", "abbr": "GA", "region": "South"}, {"name": "Hawaii", "slug": "hawaii", "abbr": "HI", "region": "West"}, {"name": "Idaho", "slug": "idaho", "abbr": "ID", "region": "West"}, {"name": "Illinois", "slug": "illinois", "abbr": "IL", "region": "Midwest"}, {"name": "Indiana", "slug": "indiana", "abbr": "IN", "region": "Midwest"}, {"name": "Iowa", "slug": "iowa", "abbr": "IA", "region": "Midwest"}, {"name": "Kansas", "slug": "kansas", "abbr": "KS", "region": "Midwest"}, {"name": "Kentucky", "slug": "kentucky", "abbr": "KY", "region": "South"}, {"name": "Louisiana", "slug": "louisiana", "abbr": "LA", "region": "South"}, {"name": "Maine", "slug": "maine", "abbr": "ME", "region": "Northeast"}, {"name": "Maryland", "slug": "maryland", "abbr": "MD", "region": "South"}, {"name": "Massachusetts", "slug": "massachusetts", "abbr": "MA", "region": "Northeast"}, {"name": "Michigan", "slug": "michigan", "abbr": "MI", "region": "Midwest"}, {"name": "Minnesota", "slug": "minnesota", "abbr": "MN", "region": "Midwest"}, {"name": "Mississippi", "slug": "mississippi", "abbr": "MS", "region": "South"}, {"name": "Missouri", "slug": "missouri", "abbr": "MO", "region": "Midwest"}, {"name": "Montana", "slug": "montana", "abbr": "MT", "region": "West"}, {"name": "Nebraska", "slug": "nebraska", "abbr": "NE", "region": "Midwest"}, {"name": "Nevada", "slug": "nevada", "abbr": "NV", "region": "West"}, {"name": "New Hampshire", "slug": "new-hampshire", "abbr": "NH", "region": "Northeast"}, {"name": "New Jersey", "slug": "new-jersey", "abbr": "NJ", "region": "Northeast"}, {"name": "New Mexico", "slug": "new-mexico", "abbr": "NM", "region": "West"}, {"name": "New York", "slug": "new-york", "abbr": "NY", "region": "Northeast"}, {"name": "North Carolina", "slug": "north-carolina", "abbr": "NC", "region": "South"}, {"name": "North Dakota", "slug": "north-dakota", "abbr": "ND", "region": "Midwest"}, {"name": "Ohio", "slug": "ohio", "abbr": "OH", "region": "Midwest"}, {"name": "Oklahoma", "slug": "oklahoma", "abbr": "OK", "region": "South"}, {"name": "Oregon", "slug": "oregon", "abbr": "OR", "region": "West"}, {"name": "Pennsylvania", "slug": "pennsylvania", "abbr": "PA", "region": "Northeast"}, {"name": "Rhode Island", "slug": "rhode-island", "abbr": "RI", "region": "Northeast"}, {"name": "South Carolina", "slug": "south-carolina", "abbr": "SC", "region": "South"}, {"name": "South Dakota", "slug": "south-dakota", "abbr": "SD", "region": "Midwest"}, {"name": "Tennessee", "slug": "tennessee", "abbr": "TN", "region": "South"}, {"name": "Texas", "slug": "texas", "abbr": "TX", "region": "South"}, {"name": "Utah", "slug": "utah", "abbr": "UT", "region": "West"}, {"name": "Vermont", "slug": "vermont", "abbr": "VT", "region": "Northeast"}, {"name": "Virginia", "slug": "virginia", "abbr": "VA", "region": "South"}, {"name": "Washington", "slug": "washington", "abbr": "WA", "region": "West"}, {"name": "West Virginia", "slug": "west-virginia", "abbr": "WV", "region": "South"}, {"name": "Wisconsin", "slug": "wisconsin", "abbr": "WI", "region": "Midwest"}, {"name": "Wyoming", "slug": "wyoming", "abbr": "WY", "region": "West"}];

function cimFinalPrefix() {
  const path = window.location.pathname;
  if (path.includes('/florida/boca-raton/')) return '../../';
  if (path.includes('/services/')) return '../../';
  if (path.includes('/states/') || path.includes('/search/') || path.includes('/about/')) return '../';
  const states = window.CAREINMYCITY_STATES || [];
  const matched = states.find(s => path.includes('/' + s.slug + '/'));
  if (matched) {
    const parts = path.split('/').filter(Boolean);
    return parts.length >= 2 ? '../../' : '../';
  }
  return '';
}

function cimFinalSlug(value) {
  return (value || '').toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function cimFinalPopulateStatesMenu() {
  const prefix = cimFinalPrefix();
  const regions = ['Northeast', 'South', 'Midwest', 'West'];
  document.querySelectorAll('[data-states-menu]').forEach(menu => {
    let output = `<div class="dropdown-label">All States</div><a href="${prefix}states/index.html"><strong>View All States</strong><span>National coverage index</span></a>`;
    regions.forEach(region => {
      output += `<div class="dropdown-label">${region}</div>`;
      (window.CAREINMYCITY_STATES || [])
        .filter(state => state.region === region)
        .forEach(state => {
          output += `<a href="${prefix}${state.slug}/index.html"><strong>${state.name}</strong><span>${state.region} care resources</span></a>`;
        });
    });
    menu.innerHTML = output;
  });
}

function cimFinalCloseMenus() {
  document.querySelectorAll('.nav-dropdown.open').forEach(dropdown => {
    dropdown.classList.remove('open');
    const toggle = dropdown.querySelector('.dropdown-toggle');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  });
}

function cimFinalInitNav() {
  cimFinalPopulateStatesMenu();

  document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      const dropdown = this.closest('.nav-dropdown');
      if (!dropdown) return false;

      const shouldOpen = !dropdown.classList.contains('open');
      cimFinalCloseMenus();

      if (shouldOpen) {
        dropdown.classList.add('open');
        this.setAttribute('aria-expanded', 'true');
      }

      return false;
    }, true);
  });

  document.querySelectorAll('.dropdown-menu').forEach(menu => {
    menu.addEventListener('click', function(event) {
      event.stopPropagation();
    }, true);
  });

  document.addEventListener('click', function() {
    cimFinalCloseMenus();
  }, true);

  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      navLinks.classList.toggle('mobile-open');
      const isOpen = navLinks.classList.contains('mobile-open');
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      return false;
    }, true);
  }
}

function cimFinalInitSearchForms() {
  document.querySelectorAll('.stateSearchForm').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const params = new URLSearchParams();
      const state = form.dataset.state || '';
      const care = form.querySelector('[name="careType"]')?.value || '';
      const loc = form.querySelector('[name="cityOrZip"]')?.value || '';
      if (state) params.set('state', state);
      if (care) params.set('careType', care);
      if (loc) params.set('location', cimFinalSlug(loc));
      window.location.href = `${cimFinalPrefix()}search/index.html?${params.toString()}`;
    }, true);
  });

  document.querySelectorAll('.citySearchForm').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const params = new URLSearchParams();
      const state = form.dataset.state || '';
      const city = form.dataset.city || '';
      const care = form.querySelector('[name="careType"]')?.value || '';
      if (state) params.set('state', state);
      if (city) params.set('location', city);
      if (care) params.set('careType', care);
      window.location.href = `${cimFinalPrefix()}search/index.html?${params.toString()}`;
    }, true);
  });

  document.querySelectorAll('.map-search').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const input = form.querySelector('input');
      const q = input ? input.value.trim() : '';
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      window.location.href = `${cimFinalPrefix()}search/index.html?${params.toString()}`;
    }, true);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  cimFinalInitNav();
  cimFinalInitSearchForms();
});


/* Monetization layer: prototype lead capture */
function cimCareLeadPayload(form) {
  const payload = {
    name: form.querySelector('[name="name"]')?.value || '',
    phone: form.querySelector('[name="phone"]')?.value || '',
    email: form.querySelector('[name="email"]')?.value || '',
    timeline: form.querySelector('[name="timeline"]')?.value || '',
    notes: form.querySelector('[name="notes"]')?.value || '',
    state: form.dataset.state || '',
    city: form.dataset.city || '',
    careType: form.dataset.careType || '',
    sourcePage: window.location.pathname,
    createdAt: new Date().toISOString()
  };
  return payload;
}

function cimInitLeadCaptureForms() {
  document.querySelectorAll('[data-lead-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const payload = cimCareLeadPayload(form);
      const existing = JSON.parse(localStorage.getItem('careinmycity_leads') || '[]');
      existing.push(payload);
      localStorage.setItem('careinmycity_leads', JSON.stringify(existing));
      console.log('CareInMyCity lead payload', payload);
      const success = form.querySelector('.lead-capture-success');
      if (success) success.hidden = false;
    });
  });
}

document.addEventListener('DOMContentLoaded', cimInitLeadCaptureForms);


/* Owned listing DID helper.
   Matt can either replace REPLACE_WITH_FINAL_EXPENSE_DID in HTML directly
   or update /assets/data/owned_listings_config.json and wire this to fetch it in production. */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-final-expense-did]').forEach((link) => {
    if (link.getAttribute('href') === 'tel:REPLACE_WITH_FINAL_EXPENSE_DID') {
      link.classList.add('needs-did');
      link.setAttribute('title', 'Add final expense DID before launch');
    }
  });
});


/* Search fallback resource renderer.
   Prevents "0 resources found" dead-ends by showing owned/public category resources
   when provider listings are not available yet. */
const CIM_SEARCH_FALLBACK_RESOURCES = {

  "ssdi": {
    label: "SSDI Help",
    guide: "../services/ssdi/index.html",
    owned: {
      name: "Consumer Support Help",
      type: "Family support starting point",
      url: "tel:REPLACE_WITH_SSDI_DID",
      description: "Consumer Support Help can help families organize an SSDI support request before comparing next steps. This is not a government agency, law firm, or benefits advice service."
    },
    resources: [
      {name: "Social Security Disability Benefits", type: "Official federal information", url: "https://www.ssa.gov/benefits/disability/", description: "Official Social Security information about disability benefits."},
      {name: "BenefitsCheckUp", type: "Benefits education tool", url: "https://benefitscheckup.org/", description: "A benefits screening tool from the National Council on Aging."},
      {name: "Legal Services Corporation", type: "Legal aid locator", url: "https://www.lsc.gov/about-lsc/what-legal-aid/get-legal-help", description: "A national starting point for finding civil legal aid organizations."}
    ]
  },

  "home-care": {
    label: "Home Care",
    guide: "../services/home-care/index.html",
    resources: [
      {name: "Eldercare Locator", type: "Federal / public resource", url: "https://eldercare.acl.gov/", description: "A public starting point for local aging services, caregiver support, and Area Agencies on Aging."},
      {name: "Medicare Care Compare", type: "Federal / comparison tool", url: "https://www.medicare.gov/care-compare/", description: "A Medicare tool that can help families compare certain Medicare-certified providers and care settings."},
      {name: "211", type: "Community resource line", url: "https://www.211.org/", description: "A national referral network for local health, human services, transportation, housing, food, and caregiver resources."}
    ]
  },
  "memory-care": {
    label: "Memory Care",
    guide: "../services/memory-care/index.html",
    resources: [
      {name: "Alzheimer’s Association 24/7 Helpline", type: "Nonprofit support resource", url: "https://www.alz.org/help-support/resources/helpline", description: "A 24/7 helpline and education resource for families navigating Alzheimer’s disease, dementia, safety, and caregiver stress."},
      {name: "Eldercare Locator", type: "Federal / public resource", url: "https://eldercare.acl.gov/", description: "A public starting point for local aging services, respite resources, and caregiver support."},
      {name: "Medicare Care Compare", type: "Federal / comparison tool", url: "https://www.medicare.gov/care-compare/", description: "A Medicare tool for comparing certain Medicare-certified providers and care settings."}
    ]
  },
  "assisted-living": {
    label: "Assisted Living",
    guide: "../services/assisted-living/index.html",
    resources: [
      {name: "Eldercare Locator", type: "Federal / public resource", url: "https://eldercare.acl.gov/", description: "A public resource that can point families toward local aging services and state or community programs."},
      {name: "Medicare Care Compare", type: "Federal / comparison tool", url: "https://www.medicare.gov/care-compare/", description: "A Medicare comparison tool for certain care providers and settings. Families should confirm what type of setting is being compared."},
      {name: "LongTermCare.gov", type: "Federal education resource", url: "https://acl.gov/ltc", description: "A federal education resource about long-term care planning and support options."}
    ]
  },
  "respite-care": {
    label: "Respite Care",
    guide: "../services/respite-care/index.html",
    resources: [
      {name: "ARCH National Respite Network", type: "Respite care locator resource", url: "https://archrespite.org/respitelocator", description: "A respite locator and education resource for family caregivers looking for short-term relief and backup support."},
      {name: "Eldercare Locator", type: "Federal / public resource", url: "https://eldercare.acl.gov/", description: "A public starting point for local caregiver supports, respite programs, and aging services."},
      {name: "211", type: "Community resource line", url: "https://www.211.org/", description: "A national referral network that may help families find local community resources."}
    ]
  },
  "elder-law": {
    label: "Elder Law & Benefits",
    guide: "../services/elder-law/index.html",
    resources: [
      {name: "Legal Services Corporation", type: "Legal aid locator", url: "https://www.lsc.gov/about-lsc/what-legal-aid/get-legal-help", description: "A national starting point for finding civil legal aid organizations. CareInMyCity does not provide legal advice."},
      {name: "BenefitsCheckUp", type: "Benefits education tool", url: "https://benefitscheckup.org/", description: "A benefits screening tool from the National Council on Aging that can help older adults explore programs they may want to review."},
      {name: "Social Security Disability Benefits", type: "Federal benefits information", url: "https://www.ssa.gov/benefits/disability/", description: "Official Social Security information about disability benefits. Families should speak with qualified professionals for case-specific guidance."}
    ]
  },
  "final-expense-support": {
    label: "Final Expense Support",
    guide: "../services/final-expense/index.html",
    owned: {
      name: "Consumer Support Help",
      type: "Featured support option",
      url: "tel:REPLACE_WITH_FINAL_EXPENSE_DID",
      description: "Consumer Support Help can help families organize a final expense support request and connect with an appropriate next step. This is not a government resource, insurance carrier, or professional advice service."
    },
    resources: [
      {name: "FTC Funeral Rule", type: "Federal consumer education", url: "https://consumer.ftc.gov/articles/ftc-funeral-rule", description: "A Federal Trade Commission consumer resource explaining rights and pricing information related to funeral arrangements."},
      {name: "Funeral Consumers Alliance", type: "Consumer education nonprofit", url: "https://funerals.org/", description: "A consumer education resource about funeral planning, costs, and questions families may want to ask."},
      {name: "BenefitsCheckUp", type: "Benefits education tool", url: "https://benefitscheckup.org/", description: "A benefits screening tool that can help older adults and families explore possible programs and supports."}
    ]
  }
};

function cimNormalizeCareType(value) {
  const raw = (value || "").toString().trim().toLowerCase();
  const slug = raw.replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const map = {
    "final-expense": "final-expense-support",
    "final-expense-insurance": "final-expense-support",
    "final-expense-support": "final-expense-support",
    "elder-law-benefits": "elder-law",
    "elder-law-and-benefits": "elder-law",
    "ssdi": "ssdi",
    "social-security-disability": "ssdi",
    "social-security-disability-insurance": "ssdi",
    "disability-benefits": "ssdi",
    "home-care": "home-care",
    "memory-care": "memory-care",
    "assisted-living": "assisted-living",
    "respite-care": "respite-care"
  };
  return map[slug] || slug || "home-care";
}

function cimSearchParam(name) {
  return new URLSearchParams(window.location.search).get(name) || "";
}

function cimEscape(str) {
  return (str || "").toString().replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

function cimRenderSearchFallback() {
  if (!window.location.pathname.includes("/search")) return;

  const careType = cimNormalizeCareType(cimSearchParam("careType") || cimSearchParam("category") || cimSearchParam("service"));
  const city = cimSearchParam("location") || cimSearchParam("city") || "";
  const state = cimSearchParam("state") || "";
  const fallback = CIM_SEARCH_FALLBACK_RESOURCES[careType] || CIM_SEARCH_FALLBACK_RESOURCES["home-care"];
  const target = document.getElementById("searchFallbackResults") || document.getElementById("searchResults");
  if (!target) return;

  // If existing renderer already produced real cards, do not duplicate. If it produced a no-results card, keep our fallback after it.
  const existingCards = document.querySelectorAll(".resource-card, .provider-card, .public-resource-card, .owned-resource-card");
  const onlyNoResult = document.body.textContent.includes("No matching resources yet") || document.body.textContent.includes("0 resources found");

  if (existingCards.length > 0 && !onlyNoResult) return;

  const place = city ? ` for ${cimEscape(fallback.label)} in ${cimEscape(city.replace(/-/g, " "))}` : ` for ${cimEscape(fallback.label)}`;
  let html = `
    <section class="search-fallback-section">
      <div class="search-fallback-header">
        <div class="label">Helpful starting points</div>
        <h2>Here are starting points${place}.</h2>
        <p>Local provider listings are still being built. In the meantime, these starting points can help your family understand the category, prepare better questions, and avoid a dead-end search.</p>
      </div>
      <div class="search-fallback-actions">
        <a class="btn-secondary" href="${fallback.guide}">Read the ${cimEscape(fallback.label)} guide</a>
      </div>
  `;

  if (fallback.owned) {
    html += `
      <article class="owned-resource-card search-owned-card">
        <div class="owned-resource-badge">${cimEscape(fallback.owned.type)}</div>
        <h3>${cimEscape(fallback.owned.name)}</h3>
        <p>${cimEscape(fallback.owned.description)}</p>
        <div class="owned-resource-actions">
          <a href="${fallback.owned.url}" class="btn-primary" data-final-expense-did>Call Consumer Support Help</a>
          <a href="../services/final-expense/index.html" class="btn-secondary">Read the guide</a>
        </div>
        <p class="owned-resource-disclaimer">Availability and routing may vary. CareInMyCity and Consumer Support Help do not provide medical, legal, financial, or insurance advice.</p>
      </article>
    `;
  }

  html += `<div class="public-resource-grid search-public-resource-grid">`;
  fallback.resources.forEach((item) => {
    html += `
      <article class="public-resource-card">
        <div class="public-resource-type">${cimEscape(item.type)}</div>
        <h3>${cimEscape(item.name)}</h3>
        <p>${cimEscape(item.description)}</p>
        <a href="${cimEscape(item.url)}" target="_blank" rel="noopener noreferrer" class="inline-link">Open resource →</a>
      </article>
    `;
  });
  html += `</div><p class="public-resource-disclaimer">These are public or educational starting points, not endorsements, guarantees, or professional advice.</p></section>`;

  target.hidden = false;
  target.innerHTML = html;
}

// Delay slightly so older search renderers finish first.
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(cimRenderSearchFallback, 150);
});


function cimHideSearchDeadEnds() {
  if (!window.location.pathname.includes("/search")) return;
  const fallback = document.getElementById("searchFallbackResults");
  if (!fallback || fallback.hidden || !fallback.innerHTML.trim()) return;
  document.querySelectorAll(".empty-state, .no-results, .no-resource-card").forEach((el) => {
    el.style.display = "none";
  });
  const bodyText = document.body.textContent || "";
  document.querySelectorAll("article, .card, .resource-empty").forEach((el) => {
    const t = el.textContent || "";
    if (t.includes("No matching resources yet") || t.includes("0 resources found")) {
      el.style.display = "none";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(cimHideSearchDeadEnds, 350);
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-ssdi-did]').forEach((link) => {
    if (link.getAttribute('href') === 'tel:REPLACE_WITH_SSDI_DID') {
      link.classList.add('needs-did');
      link.setAttribute('title', 'Add SSDI DID before launch');
    }
  });
});


/* SSDI attorney/search alias fix.
   This final-pass renderer catches labels like "Ssdi Attorneys" and shows SSDI fallback results. */
(function () {
  const SSDI_ALIASES = new Set([
    "ssdi",
    "ssdi-help",
    "ssdi-attorney",
    "ssdi-attorneys",
    "social-security-disability",
    "social-security-disability-help",
    "social-security-disability-attorney",
    "social-security-disability-attorneys",
    "social-security-disability-insurance",
    "social-security-disability-insurance-attorney",
    "social-security-disability-insurance-attorneys",
    "disability-benefits",
    "disability-benefits-help",
    "disability-attorney",
    "disability-attorneys"
  ]);

  function slugifyCare(value) {
    return (value || "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/\+/g, " ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function getAnyParam(names) {
    const params = new URLSearchParams(window.location.search);
    for (const name of names) {
      const val = params.get(name);
      if (val) return val;
    }
    return "";
  }

  function escapeHtml(str) {
    return (str || "").toString().replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    }[m]));
  }

  function isSsdiSearch() {
    const raw = getAnyParam(["careType", "category", "service", "resource", "type", "q", "query"]);
    const slug = slugifyCare(raw);
    if (SSDI_ALIASES.has(slug)) return true;
    return slug.includes("ssdi") || slug.includes("social-security-disability") || slug.includes("disability-attorney");
  }

  function renderSsdiFallback() {
    if (!window.location.pathname.includes("/search")) return;
    if (!isSsdiSearch()) return;

    const cityRaw = getAnyParam(["location", "city"]);
    const stateRaw = getAnyParam(["state"]);
    const city = cityRaw ? cityRaw.replace(/-/g, " ") : "";
    const place = city ? ` in ${escapeHtml(city.replace(/\b\w/g, (c) => c.toUpperCase()))}` : "";

    let target = document.getElementById("searchFallbackResults") || document.getElementById("searchResults");
    if (!target) {
      target = document.createElement("div");
      target.id = "searchFallbackResults";
      const main = document.querySelector("main") || document.body;
      main.appendChild(target);
    }

    // Hide the old zero-result UI.
    document.querySelectorAll("article, .card, .empty-state, .no-results, .resource-empty").forEach((el) => {
      const t = (el.textContent || "").toLowerCase();
      if (t.includes("no matching resources") || t.includes("0 resources found") || t.includes("directory is still growing")) {
        el.style.display = "none";
      }
    });

    // Update count line if present.
    document.querySelectorAll("p, strong, div").forEach((el) => {
      const t = el.textContent || "";
      if (t.includes("0 resources found") && t.includes("Ssdi")) {
        el.textContent = `Helpful SSDI starting points${place}.`;
      }
    });

    target.hidden = false;
    target.innerHTML = `
      <section class="search-fallback-section ssdi-search-fallback">
        <div class="search-fallback-header">
          <div class="label">Helpful SSDI starting points</div>
          <h2>Here are SSDI support starting points${place}.</h2>
          <p>Local SSDI listings are still being built. In the meantime, these starting points can help your family understand the category, prepare better questions, and avoid a dead-end search.</p>
        </div>

        <div class="search-fallback-actions">
          <a class="btn-secondary" href="../services/ssdi/index.html">Read the SSDI Help guide</a>
        </div>

        <article class="owned-resource-card search-owned-card friendly-owned-resource-card" data-owned-listing="consumer-support-help" data-category="ssdi">
          <div class="owned-resource-badge">Family support starting point</div>
          <h3>Want help organizing an SSDI question?</h3>
          <p>Consumer Support Help can help your family organize an SSDI support request before comparing next steps. This is not a government agency, law firm, or benefits advice service.</p>
          <div class="owned-resource-actions">
            <a href="tel:REPLACE_WITH_SSDI_DID" class="btn-primary" data-ssdi-did>Call Consumer Support Help</a>
            <a href="../services/ssdi/index.html" class="btn-secondary">Read the SSDI guide</a>
          </div>
          <p class="owned-resource-disclaimer">Availability and routing may vary. CareInMyCity and Consumer Support Help do not provide medical, legal, financial, insurance, or benefits advice.</p>
        </article>

        <div class="public-resource-grid search-public-resource-grid">
          <article class="public-resource-card">
            <div class="public-resource-type">Official federal information</div>
            <h3>Social Security Disability Benefits</h3>
            <p>Official Social Security information about disability benefits, including how the program works and where families can learn more.</p>
            <a href="https://www.ssa.gov/benefits/disability/" target="_blank" rel="noopener noreferrer" class="inline-link">Open resource →</a>
          </article>
          <article class="public-resource-card">
            <div class="public-resource-type">Benefits education tool</div>
            <h3>BenefitsCheckUp</h3>
            <p>A benefits screening tool from the National Council on Aging that can help older adults and families explore programs they may want to review.</p>
            <a href="https://benefitscheckup.org/" target="_blank" rel="noopener noreferrer" class="inline-link">Open resource →</a>
          </article>
          <article class="public-resource-card">
            <div class="public-resource-type">Legal aid locator</div>
            <h3>Legal Services Corporation</h3>
            <p>A national starting point for finding civil legal aid organizations. CareInMyCity does not provide legal advice.</p>
            <a href="https://www.lsc.gov/about-lsc/what-legal-aid/get-legal-help" target="_blank" rel="noopener noreferrer" class="inline-link">Open resource →</a>
          </article>
        </div>

        <p class="public-resource-disclaimer">These are support and education starting points, not endorsements, guarantees, or professional advice.</p>
      </section>
    `;
  }

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(renderSsdiFallback, 75);
    setTimeout(renderSsdiFallback, 300);
    setTimeout(renderSsdiFallback, 700);
  });
})();


/* CareInMyCity — inject site-wide Tools nav link */
(function(){
  function addToolsNavLink(){
    var nav = document.querySelector('.nav-links');
    if(!nav) return;
    if(nav.querySelector('a[data-tools-link]')) return;
    var link = document.createElement('a');
    link.href = '/tools/';
    link.textContent = 'Tools';
    link.setAttribute('data-tools-link','');
    if(location.pathname.indexOf('/tools') === 0){ link.classList.add('active'); }
    var about = nav.querySelector('a[href="/about/"]');
    if(about && about.nextSibling){ nav.insertBefore(link, about.nextSibling); }
    else if(about){ nav.appendChild(link); }
    else { nav.appendChild(link); }
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', addToolsNavLink);
  } else { addToolsNavLink(); }
})();


/* === Final Expense DID activation (CareInMyCity) ===
   Replaces the REPLACE_WITH_FINAL_EXPENSE_DID placeholder at runtime with the
   live Consumer Support Help number so every final-expense CTA is click-to-call.
   Real DID: 18336915024  Display: 1-833-691-5024 */
(function () {
  var CIM_FE_DID = "18336915024";
  var CIM_FE_DID_HREF = "tel:" + CIM_FE_DID;
  var CIM_FE_DID_DISPLAY = "1-833-691-5024";
  function cimActivateFinalExpenseDid(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var links = scope.querySelectorAll("[data-final-expense-did]");
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var href = link.getAttribute("href") || "";
      if (href.indexOf("REPLACE_WITH_FINAL_EXPENSE_DID") !== -1 || href === "" || href === "#") {
        link.setAttribute("href", CIM_FE_DID_HREF);
      }
      link.classList.remove("needs-did");
      if ((link.getAttribute("title") || "").indexOf("DID before launch") !== -1) {
        link.removeAttribute("title");
      }
      if (!link.getAttribute("aria-label")) {
        link.setAttribute("aria-label", "Call Consumer Support Help at " + CIM_FE_DID_DISPLAY);
      }
      if (!link.getAttribute("data-did-display-applied")) {
        var txt = (link.textContent || "").trim();
        if (txt && txt.indexOf(CIM_FE_DID_DISPLAY) === -1 && txt.indexOf("5024") === -1) {
          link.textContent = txt + " \u2014 " + CIM_FE_DID_DISPLAY;
        }
        link.setAttribute("data-did-display-applied", "1");
      }
    }
  }
  function cimRun() { cimActivateFinalExpenseDid(document); }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", cimRun);
  } else {
    cimRun();
  }
  try {
    var obs = new MutationObserver(function (mutations) {
      for (var m = 0; m < mutations.length; m++) {
        if (mutations[m].addedNodes && mutations[m].addedNodes.length) {
          cimActivateFinalExpenseDid(document);
          break;
        }
      }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
})();


/* Carl chat: accessibility enhancements (Escape to close + aria-expanded sync) */
(function(){
  function carlPanelEl(){ return document.getElementById('carlPanel'); }
  function carlLaunchers(){ return Array.prototype.slice.call(document.querySelectorAll('.carl-launcher, [data-open-carl]')); }
  function syncAria(){
    var panel = carlPanelEl();
    if(!panel) return;
    var open = panel.classList.contains('open');
    carlLaunchers().forEach(function(b){
      if(!b.hasAttribute('aria-controls')) b.setAttribute('aria-controls','carlPanel');
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  function closeCarlPanel(){
    var panel = carlPanelEl();
    if(!panel || !panel.classList.contains('open')) return false;
    if(typeof window.closeCarl === 'function'){ try{ window.closeCarl(); }catch(e){ panel.classList.remove('open'); } }
    else { panel.classList.remove('open'); }
    syncAria();
    var l = document.querySelector('.carl-launcher'); if(l && l.focus){ try{ l.focus(); }catch(e){} }
    return true;
  }
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' || e.key === 'Esc'){ closeCarlPanel(); }
  });
  function init(){
    var panel = carlPanelEl();
    if(!panel) return;
    syncAria();
    try{
      var obs = new MutationObserver(syncAria);
      obs.observe(panel, { attributes:true, attributeFilter:['class'] });
    }catch(e){}
  }
  if(document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', init); }
  else { init(); }
})();

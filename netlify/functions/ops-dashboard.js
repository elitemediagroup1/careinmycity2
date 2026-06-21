/**
 * ops-dashboard.js (EMG Platform Command Center - Phase 2, view)
 *
 * Renders the internal EMG Platform Command Center HTML (evolved from the
 * CareInMyCity Operations Dashboard, Phase 1). Served behind a token gate via
 * OPS_DASHBOARD_TOKEN. Always sends X-Robots-Tag: noindex, nofollow.
 *
 * - The dashboard NEVER calls Google. It fetches /admin/metrics (ops-metrics)
 *   client-side and renders KPI cards.
 * - Matches CareInMyCity design language (blue->teal gradient, green accent).
 * - No external scripts, no animations, responsive grid.
 * - Phase 2 adds platform-level sections (Executive Overview, EMG Portfolio,
 *   CareInMyCity detail, Content Health, AI Health, Search & SEO, Revenue,
 *   Infrastructure, Roadmap) plus a property registry (window.EMGDashboard)
 *   so future EMG properties can plug in without core changes. Sections with no
 *   live integration render a clear \"Coming Soon\" state (no fabricated data).
 *
 * SECURITY: token gate is a soft internal gate. Recommended hardening is
 * Netlify password protection or existing admin auth in front of /admin/*.
 */

function html(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "Referrer-Policy": "no-referrer"
    },
    body: body
  };
}

function authorized(event) {
  var expected = process.env.OPS_DASHBOARD_TOKEN || "";
  if (!expected) return { ok: false, reason: "no_token_configured" };
  var q = (event.queryStringParameters || {});
  var supplied = q.token || "";
  return supplied && supplied === expected ? { ok: true, token: supplied } : { ok: false, reason: "unauthorized" };
}

function gatePage(msg) {
  return "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\">" +
    "<meta name=\"robots\" content=\"noindex, nofollow\">" +
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">" +
    "<title>Restricted &middot; EMG Command Center</title>" +
    "<style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;" +
    "background:#0f1b2d;color:#e6eef8;display:grid;place-items:center;height:100vh;margin:0}" +
    ".box{max-width:380px;text-align:center;padding:2rem}h1{font-size:1.1rem;color:#7fb2ff}" +
    "p{color:#9fb3cc;font-size:.9rem;line-height:1.5}</style></head><body><div class=\"box\">" +
    "<h1>EMG Platform Command Center</h1><p>" + msg + "</p></div></body></html>";
}

exports.handler = async function (event) {
  var auth = authorized(event);
  if (!auth.ok) {
    if (auth.reason === "no_token_configured") {
      return html(503, gatePage("Dashboard not configured. Set OPS_DASHBOARD_TOKEN in the site environment to enable."));
    }
    return html(401, gatePage("Access restricted. This internal tool requires a valid access token."));
  }
  var token = auth.token;

  var page = "<!doctype html><html lang=\"en\"><head>" +
    "<meta charset=\"utf-8\">" +
    "<meta name=\"robots\" content=\"noindex, nofollow\">" +
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">" +
    "<title>EMG Platform Command Center</title>" +
    "<style>" + STYLES + "</style></head><body>" +
    "<header class=\"ops-top\"><div class=\"wrap\"><div class=\"brand\">EMG <span>Platform Command Center</span></div>" +
    "<div class=\"sub\">Internal monitoring &middot; Phase 2 &middot; <span id=\"genAt\">loading\u2026</span></div></div></header>" +
    "<main class=\"wrap\" id=\"app\"><p class=\"loading\">Loading metrics\u2026</p></main>" +
    "<footer class=\"wrap foot\">EMG Platform Command Center &middot; not public &middot; \u00A9 2026 Elite Media Group. All Rights Reserved.</footer>" +
    "<script>" + CLIENT.replace("__TOKEN__", encodeURIComponent(token)) + "</script>" +
    "</body></html>";

  return html(200, page);
};

// ---------------------------------------------------------------------------
// Inline styles (CareInMyCity design language; no external assets/animations)
// ---------------------------------------------------------------------------
var STYLES =
  ":root{--blue:#1268d8;--teal:#03778e;--green:#16a052;--ink:#17324d;--muted:#5b7088;--bg:#f4f7fb;--card:#fff;--line:#e3eaf3;--warn:#b9770a;--err:#c0392b}" +
  "*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.45}" +
  ".wrap{max-width:1180px;margin:0 auto;padding:0 20px}" +
  ".ops-top{background:linear-gradient(90deg,var(--blue),var(--teal));color:#fff;padding:22px 0}" +
  ".brand{font-size:1.35rem;font-weight:700}.brand span{font-weight:400;opacity:.9}" +
  ".sub{font-size:.82rem;opacity:.9;margin-top:2px}" +
  "main{padding:26px 20px 8px}h2.section{font-size:1.02rem;margin:26px 0 12px;color:var(--ink);border-left:4px solid var(--green);padding-left:10px}" +
  ".grid{display:grid;gap:14px;grid-template-columns:repeat(3,1fr)}" +
  ".grid-4{grid-template-columns:repeat(4,1fr)}" +
  ".card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px 18px}" +
  ".kpi .label{font-size:.74rem;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}" +
  ".kpi .val{font-size:1.7rem;font-weight:700;margin-top:6px;color:var(--ink)}" +
  ".kpi .hint{font-size:.74rem;color:var(--muted);margin-top:4px}" +
  ".row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px dashed var(--line);font-size:.9rem}" +
  ".row:last-child{border-bottom:0}.row .k{color:var(--muted)}.row .v{font-weight:600}" +
  ".pill{display:inline-block;font-size:.72rem;font-weight:600;padding:2px 8px;border-radius:999px}" +
  ".pill.ok{background:#e6f5ec;color:var(--green)}.pill.warn{background:#fcf1dd;color:var(--warn)}" +
  ".pill.err{background:#fbe6e3;color:var(--err)}.pill.info{background:#e7eefb;color:var(--blue)}" +
  ".pill.live{background:#e6f5ec;color:var(--green)}.pill.soon{background:#eef1f5;color:var(--muted)}" +
  ".pill.healthy{background:#e6f5ec;color:var(--green)}.pill.warning{background:#fcf1dd;color:var(--warn)}" +
  ".pill.offline{background:#fbe6e3;color:var(--err)}.pill.coming_soon{background:#eef1f5;color:var(--muted)}" +
  ".alert{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-radius:10px;margin-bottom:8px;font-size:.88rem;border:1px solid var(--line)}" +
  ".alert.ok{background:#f0faf3}.alert.warn{background:#fdf6e8}.alert.error{background:#fcedea}.alert.info{background:#eef3fc}" +
  ".pending{opacity:.6}.pending .val{font-size:1rem;color:var(--muted)}" +
  ".soonbox{border:1px dashed var(--line);background:#fafcff}" +
  ".prop{display:flex;flex-direction:column;gap:6px}.prop .pname{font-weight:700;font-size:1rem}" +
  ".prop .pdom{font-size:.76rem;color:var(--muted)}" +
  ".road{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px dashed var(--line);font-size:.9rem}" +
  ".road:last-child{border-bottom:0}" +
  ".soonlabel{font-size:.74rem;color:var(--muted);margin:-6px 0 10px;padding-left:10px}" +
  ".foot{color:var(--muted);font-size:.78rem;padding:18px 20px 34px}" +
  ".loading{color:var(--muted)}" +
  "@media(max-width:900px){.grid,.grid-4{grid-template-columns:repeat(2,1fr)}}" +
  "@media(max-width:560px){.grid,.grid-4{grid-template-columns:1fr}}";

// ---------------------------------------------------------------------------
// Client script: fetch /admin/metrics and render. No Google, no 3rd-party JS.
// Exposes window.EMGDashboard so future EMG properties can register renderers.
// ---------------------------------------------------------------------------
var CLIENT = String.raw`
(function(){
  var TOKEN = "__TOKEN__";
  var app = document.getElementById("app");

  // --- EMG property registry (platform-agnostic) ---------------------------
  // Future EMG properties can register a renderer without changing core code:
  //   window.EMGDashboard.register({ key, name, render(summary, helpers) })
  // The core simply renders the portfolio + any registered live renderers.
  window.EMGDashboard = window.EMGDashboard || (function(){
    var registry = {};
    return {
      register: function(def){ if(def && def.key){ registry[def.key] = def; } return this; },
      get: function(key){ return registry[key] || null; },
      keys: function(){ return Object.keys(registry); }
    };
  })();

  function esc(s){ return String(s==null?"":s).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c];}); }
  function soon(v){ return (v==null)?'<span class="pill soon">Coming Soon</span>':esc(v); }
  function kpi(label,val,hint){ return '<div class="card kpi"><div class="label">'+esc(label)+'</div><div class="val">'+esc(val)+'</div>'+(hint?'<div class="hint">'+esc(hint)+'</div>':'')+'</div>'; }
  function kpiHtml(label,htmlVal,hint){ return '<div class="card kpi"><div class="label">'+esc(label)+'</div><div class="val" style="font-size:1rem;margin-top:8px">'+(htmlVal||'')+'</div>'+(hint?'<div class="hint">'+esc(hint)+'</div>':'')+'</div>'; }
  function kpiSoon(label){ return '<div class="card kpi pending soonbox"><div class="label">'+esc(label)+'</div><div class="val">Coming Soon</div></div>'; }
  function rows(pairs){ return '<div class="card">'+pairs.map(function(p){return '<div class="row"><span class="k">'+esc(p[0])+'</span><span class="v">'+(p[1]==null?'<span class="pill soon">Coming Soon</span>':esc(p[1]))+'</span></div>';}).join('')+'</div>'; }
  function section(t,sub){ return '<h2 class="section">'+esc(t)+'</h2>'+(sub?'<div class="soonlabel">'+esc(sub)+'</div>':''); }
  function grid(cards,cls){ return '<div class="grid '+(cls||'')+'">'+cards.join('')+'</div>'; }
  function fmt(n){ return (n==null)?'\u2013':(typeof n==='number'?n.toLocaleString():n); }
  function usd(n){ return (n==null)?'\u2013':'$'+Number(n).toFixed(2); }
  function pct(n){ return (n==null)?'\u2013':(n+'%'); }
  function statusPill(s){ var cls=s||'coming_soon'; var label=({healthy:'Healthy',warning:'Warning',offline:'Offline',coming_soon:'Coming Soon',ok:'OK',unknown:'Unknown'})[s]||s; return '<span class="pill '+esc(cls)+'">'+esc(label)+'</span>'; }

  fetch('/admin/metrics?token='+TOKEN,{headers:{'X-Ops-Token':decodeURIComponent(TOKEN)}})
  .then(function(r){ return r.json(); })
  .then(function(d){
    if(!d || !d.ok){ app.innerHTML='<p class="loading">Unable to load metrics ('+esc(d&&d.reason||'error')+').</p>'; return; }
    document.getElementById('genAt').textContent = new Date(d.generatedAt).toLocaleString();
    var ex=d.executive,pf=d.portfolio||[],ci=d.careInMyCity,ch=d.contentHealth,ai=d.aiHealth||{},ss=d.searchSeo||{},rv=d.revenue||{},inf=d.infrastructure||{},rm=d.roadmap||[];
    var p=d.places,c=d.cacheHealth,l=d.localAuthorityEngine,g=d.googleApi,co=d.cost,ro=d.rollout;
    var out=[];

    // ===== Executive Overview =====
    out.push(section('Executive Overview'));
    out.push(grid([
      kpi('Active Properties',fmt(ex.activeProperties),'of '+fmt(ex.registeredProperties)+' registered'),
      kpi('Total Pages',fmt(ex.totalPages)),
      (ex.totalAiConversations==null?kpiSoon('Total AI Conversations'):kpi('Total AI Conversations',fmt(ex.totalAiConversations))),
      kpi('Google API Requests',fmt(ex.googleApiRequests)),
      kpi('Cache Hit Rate',pct(ex.cacheHitRatePct)),
      kpi('Est. Infra Cost',usd(ex.estimatedInfrastructureCostUsd),'projected / mo'),
      kpiHtml('Platform Health',statusPill(ex.platformHealth))
    ],'grid-4'));

    // ===== EMG Portfolio =====
    out.push(section('EMG Portfolio'));
    out.push(grid(pf.map(function(pr){
      var live = pr.status==='live';
      var body='<div class="card prop"><div class="pname">'+esc(pr.name)+' '+( live?'<span class="pill live">'+esc(pr.label)+'</span>':'<span class="pill soon">'+esc(pr.label)+'</span>')+'</div>';
      body+='<div class="pdom">'+esc(pr.domain||'\u2013')+'</div>';
      if(live && pr.summary){
        var s=pr.summary;
        body+='<div class="row"><span class="k">Pages</span><span class="v">'+fmt(s.totalPages)+'</span></div>';
        body+='<div class="row"><span class="k">Google Calls</span><span class="v">'+fmt(s.googleCalls)+'</span></div>';
        body+='<div class="row"><span class="k">Cache Hit Rate</span><span class="v">'+pct(s.cacheHitRatePct)+'</span></div>';
        body+='<div class="row"><span class="k">Est. Monthly Cost</span><span class="v">'+usd(s.estimatedMonthlyCostUsd)+'</span></div>';
        body+='<div class="row"><span class="k">Rollout</span><span class="v">'+esc(s.rolloutStage)+'</span></div>';
      } else {
        body+='<div class="hint" style="color:var(--muted);font-size:.82rem;margin-top:6px">'+esc(pr.label)+'</div>';
      }
      // Allow a registered renderer to enrich a live property card.
      var reg = window.EMGDashboard.get(pr.key);
      if(live && reg && typeof reg.render==='function'){ try{ body += reg.render(pr.summary,{esc:esc,fmt:fmt,usd:usd,pct:pct}); }catch(e){} }
      return body+'</div>';
    }),'grid-4'));

    // ===== CareInMyCity (dedicated) =====
    out.push(section('CareInMyCity'));
    out.push(rows([
      ['Users Today',ci.usersToday],
      ['Users This Month',ci.usersThisMonth],
      ['Provider Searches',fmt(ci.providerSearches)],
      ['Carl Conversations',ci.carlConversations],
      ['Homepage Searches',ci.homepageSearches],
      ['Near Me Searches',ci.nearMeSearches],
      ['Google Calls',fmt(ci.googleCalls)],
      ['Cache Hits',fmt(ci.cacheHits)],
      ['Cache Misses',fmt(ci.cacheMisses)],
      ['Cache Hit %',pct(ci.cacheHitRatePct)],
      ['Est. Monthly Google Cost',usd(ci.estimatedMonthlyGoogleCostUsd)],
      ['Est. Savings From Cache',usd(ci.estimatedSavingsFromCacheUsd)],
      ['LAE Pages Enabled',fmt(ci.laePagesEnabled)],
      ['Rollout Stage',ci.rolloutStage],
      ['Indexed Pages',ci.indexedPages],
      ['AdSense Status',ci.adsenseStatus],
      ['Revenue',ci.revenue]
    ]));

    // ===== Content Health =====
    out.push(section('Content Health'));
    out.push(rows([
      ['Total Pages',ch.totalPages],
      ['States',fmt(ch.states)],
      ['Cities',ch.cities],
      ['Services',fmt(ch.services)],
      ['Pages Using LAE',fmt(ch.pagesUsingLae)],
      ['Pages Without LAE',ch.pagesWithoutLae],
      ['Pages Reviewed',ch.pagesReviewed],
      ['Pages Awaiting Review',ch.pagesAwaitingReview],
      ['Average Word Count',ch.averageWordCount],
      ['Last Content Update',ch.lastContentUpdate]
    ]));

    // ===== AI Health (Carl) =====
    out.push(section('AI Health \u2014 Carl', ai.carl && ai.carl.status==='coming_soon' ? 'Integration Coming Soon' : ''));
    var carl=ai.carl||{};
    out.push(rows([
      ['Messages Today',carl.messagesToday],
      ['Messages This Month',carl.messagesThisMonth],
      ['Average Response Time',carl.averageResponseMs==null?null:fmt(carl.averageResponseMs)+' ms'],
      ['Fallback Responses',carl.fallbackResponses],
      ['Provider Searches',carl.providerSearches],
      ['Provider Reuse %',carl.providerReusePct==null?null:pct(carl.providerReusePct)],
      ['Claude Errors',carl.claudeErrors],
      ['Conversation Success %',carl.conversationSuccessPct==null?null:pct(carl.conversationSuccessPct)],
      ['Average Session Length',carl.averageSessionLength]
    ]));

    // ===== Search & SEO (placeholders) =====
    out.push(section('Search & SEO', 'Integration Coming Soon'));
    out.push(grid([
      'Google Search Console','Bing Webmaster Tools','IndexNow','Sitemap URLs','Indexed URLs','Coverage Issues','Core Web Vitals','Organic Clicks','Organic Impressions','Average Position','CTR'
    ].map(kpiSoon),'grid-4'));

    // ===== Revenue (placeholders) =====
    out.push(section('Revenue', 'Integration Coming Soon'));
    out.push(grid([
      'AdSense Revenue','Affiliate Revenue','RPM','Revenue Per Visitor','Affiliate Clicks','Conversions','Avg Earnings Per Visit'
    ].map(kpiSoon),'grid-4'));

    // ===== Infrastructure =====
    out.push(section('Infrastructure'));
    out.push(grid([
      ['Netlify',inf.netlify],['Functions',inf.functions],['Google APIs',inf.googleApis],
      ['Claude API',inf.claudeApi],['Cache',inf.cache],['IndexNow',inf.indexNow]
    ].map(function(pair){ var st=(pair[1]&&pair[1].status)||'coming_soon'; return '<div class="card kpi"><div class="label">'+esc(pair[0])+'</div><div class="val" style="font-size:1rem;margin-top:8px">'+statusPill(st)+'</div></div>'; }),'grid-4'));

    // ===== Google Places Overview (preserved Phase 1) =====
    out.push(section('Google Places Overview'));
    out.push(grid([
      kpi('Requests Today',fmt(p.requestsToday)),
      kpi('Requests This Month',fmt(p.requestsThisMonth)),
      kpi('Cache Hits',fmt(p.cacheHits)),
      kpi('Cache Misses',fmt(p.cacheMisses)),
      kpi('Cache Hit Rate',p.cacheHitRatePct+'%'),
      kpi('Avg Response',fmt(p.avgResponseMs)+' ms'),
      kpi('Google Calls Saved',fmt(p.googleCallsSaved)),
      kpi('Est. Cache Savings',usd(p.estimatedCacheSavingsUsd))
    ],'grid-4'));

    out.push(section('Cache Health'));
    out.push(rows([
      ['Current TTL',c.currentTtlHours+'h (+'+c.staleWhileRevalidateHours+'h SWR)'],
      ['Cache Version',c.cacheVersion],
      ['Oldest Cache Entry',c.oldestEntry||'\u2013'],
      ['Newest Cache Entry',c.newestEntry||'\u2013'],
      ['Days With Data',fmt(c.daysWithData)],
      ['Cache Status',c.status]
    ]));

    out.push(section('Local Authority Engine'));
    out.push(rows([
      ['Pilot Pages Enabled',fmt(l.pilotPagesEnabled)],
      ['States Enabled',(l.statesEnabled||[]).join(', ')],
      ['Services Enabled',(l.servicesEnabled||[]).join(', ')],
      ['Current Rollout Stage',l.rolloutStage],
      ['PILOT_ONLY',String(l.pilotOnly)],
      ['Pages Currently Using LAE',fmt(l.pagesUsingLae)]
    ]));

    out.push(section('Google API Status'));
    out.push(rows([
      ['Google Places',g.places.status],
      ['Google Geocoding',g.geocoding.status],
      ['Last Success',g.lastSuccess||'\u2013'],
      ['Last Failure',g.lastFailure||'\u2013'],
      ['Recent Error Count',fmt(g.recentErrorCount)],
      ['Average Latency',fmt(g.avgLatencyMs)+' ms']
    ]));

    out.push(section('Cost Estimates (from request counts)'));
    out.push(grid([
      kpi('Projected Monthly Calls',fmt(co.projectedMonthlyCalls)),
      kpi('Projected Monthly Cost',usd(co.projectedMonthlyCostUsd)),
      kpi('Saved By Cache',usd(co.estimatedCostSavedByCacheUsd)),
      kpi('Budget Remaining',usd(co.budgetRemainingUsd),'of '+usd(co.budgetUsd))
    ],'grid-4'));

    out.push(section('Rollout'));
    out.push(rows([
      ['Current Stage',ro.currentStage],
      ['Stages',(ro.stages||[]).join(' \u2192 ')],
      ['States Enabled',(ro.statesEnabled||[]).join(', ')],
      ['Services Enabled',(ro.servicesEnabled||[]).join(', ')],
      ['Pages Enabled',fmt(ro.pagesEnabled)]
    ]));

    // ===== Roadmap =====
    out.push(section('Roadmap'));
    out.push('<div class="card">'+rm.map(function(it){
      var icon = it.state==='done' ? '\u2705' : '\u23F3';
      return '<div class="road"><span>'+esc(it.item)+'</span><span>'+icon+'</span></div>';
    }).join('')+'</div>');

    // ===== Alerts =====
    out.push(section('Alerts'));
    out.push('<div class="card">'+(d.alerts||[]).map(function(a){
      return '<div class="alert '+esc(a.level)+'"><span class="pill '+esc(a.level)+'">'+esc(a.level)+'</span><span>'+esc(a.msg)+'</span></div>';
    }).join('')+'</div>');

    app.innerHTML=out.join('');
  })
  .catch(function(e){ app.innerHTML='<p class="loading">Network error loading metrics.</p>'; });
})();
`;

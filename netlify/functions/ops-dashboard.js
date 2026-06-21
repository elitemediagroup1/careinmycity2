/**
 * ops-dashboard.js  (Operations Dashboard - Phase 1, view)
 *
 * Renders the internal Operations Dashboard HTML. Served behind a token gate
 * via OPS_DASHBOARD_TOKEN. Always sends X-Robots-Tag: noindex, nofollow.
 *
 * - The dashboard NEVER calls Google. It fetches /admin/metrics (ops-metrics)
 *   client-side and renders KPI cards.
 * - Matches CareInMyCity design language (blue->teal gradient, green accent).
 * - No external scripts, no animations, responsive 3/2/1 grid.
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
    "<title>Restricted &middot; CareInMyCity Ops</title>" +
    "<style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;" +
    "background:#0f1b2d;color:#e6eef8;display:grid;place-items:center;height:100vh;margin:0}" +
    ".box{max-width:380px;text-align:center;padding:2rem}h1{font-size:1.1rem;color:#7fb2ff}" +
    "p{color:#9fb3cc;font-size:.9rem;line-height:1.5}</style></head><body><div class=\"box\">" +
    "<h1>CareInMyCity Operations</h1><p>" + msg + "</p></div></body></html>";
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
    "<title>Operations Dashboard &middot; CareInMyCity</title>" +
    "<style>" + STYLES + "</style></head><body>" +
    "<header class=\"ops-top\"><div class=\"wrap\"><div class=\"brand\">CareInMyCity <span>Operations</span></div>" +
    "<div class=\"sub\">Internal monitoring &middot; Phase 1 &middot; <span id=\"genAt\">loading\u2026</span></div></div></header>" +
    "<main class=\"wrap\" id=\"app\"><p class=\"loading\">Loading metrics\u2026</p></main>" +
    "<footer class=\"wrap foot\">CareInMyCity Operations Dashboard &middot; not public &middot; \u00A9 2026 Elite Media Group. All Rights Reserved.</footer>" +
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
  ".alert{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-radius:10px;margin-bottom:8px;font-size:.88rem;border:1px solid var(--line)}" +
  ".alert.ok{background:#f0faf3}.alert.warn{background:#fdf6e8}.alert.error{background:#fcedea}.alert.info{background:#eef3fc}" +
  ".pending{opacity:.6}.pending .val{font-size:1rem;color:var(--muted)}" +
  ".foot{color:var(--muted);font-size:.78rem;padding:18px 20px 34px}" +
  ".loading{color:var(--muted)}" +
  "@media(max-width:900px){.grid,.grid-4{grid-template-columns:repeat(2,1fr)}}" +
  "@media(max-width:560px){.grid,.grid-4{grid-template-columns:1fr}}";

// ---------------------------------------------------------------------------
// Client script: fetch /admin/metrics and render. No Google, no 3rd-party JS.
// ---------------------------------------------------------------------------
var CLIENT = String.raw`
(function(){
  var TOKEN = "__TOKEN__";
  var app = document.getElementById("app");
  function esc(s){ return String(s==null?"":s).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c];}); }
  function kpi(label,val,hint){ return '<div class="card kpi"><div class="label">'+esc(label)+'</div><div class="val">'+esc(val)+'</div>'+(hint?'<div class="hint">'+esc(hint)+'</div>':'')+'</div>'; }
  function rows(pairs){ return '<div class="card">'+pairs.map(function(p){return '<div class="row"><span class="k">'+esc(p[0])+'</span><span class="v">'+esc(p[1])+'</span></div>';}).join('')+'</div>'; }
  function section(t){ return '<h2 class="section">'+esc(t)+'</h2>'; }
  function grid(cards,cls){ return '<div class="grid '+(cls||'')+'">'+cards.join('')+'</div>'; }
  function fmt(n){ return (n==null)?'\u2013':(typeof n==='number'?n.toLocaleString():n); }
  function usd(n){ return (n==null)?'\u2013':'$'+Number(n).toFixed(2); }

  fetch('/admin/metrics?token='+TOKEN,{headers:{'X-Ops-Token':decodeURIComponent(TOKEN)}})
    .then(function(r){ return r.json(); })
    .then(function(d){
      if(!d || !d.ok){ app.innerHTML='<p class="loading">Unable to load metrics ('+esc(d&&d.reason||'error')+').</p>'; return; }
      document.getElementById('genAt').textContent = new Date(d.generatedAt).toLocaleString();
      var p=d.places,c=d.cacheHealth,l=d.localAuthorityEngine,g=d.googleApi,co=d.cost,ro=d.rollout;
      var out=[];

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

      out.push(section('Alerts'));
      out.push('<div class="card">'+(d.alerts||[]).map(function(a){
        return '<div class="alert '+esc(a.level)+'"><span class="pill '+esc(a.level)+'">'+esc(a.level)+'</span><span>'+esc(a.msg)+'</span></div>';
      }).join('')+'</div>');

      out.push(section('Coming In Future Phases'));
      out.push(grid((d.pending||[]).map(function(name){
        return '<div class="card kpi pending"><div class="label">'+esc(name)+'</div><div class="val">pending</div></div>';
      }),'grid-4'));

      app.innerHTML=out.join('');
    })
    .catch(function(e){ app.innerHTML='<p class="loading">Network error loading metrics.</p>'; });
})();
`;

// Netlify Edge Function: inject-integrations
//
// Ensures the Carl widget (site.js) and the location/search client
// (care-location.js) are present on EVERY HTML page, sitewide, without
// editing thousands of pre-generated static HTML files.
//
// It is idempotent: if a page already includes a script, it is NOT added
// again. Only text/html responses are modified. Non-HTML assets, the
// Netlify functions, and the script files themselves are passed through
// untouched. No API keys are involved here (keys stay server-side in the
// Netlify Functions).

const SITE_JS = '/assets/site.js';
const CARE_LOCATION_JS = '/assets/care-location.js';

export default async (request, context) => {
  const response = await context.next();

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  let html = await response.text();

  const tags = [];
  if (!html.includes(SITE_JS)) {
    tags.push('<script src="' + SITE_JS + '" defer></script>');
  }
  if (!html.includes(CARE_LOCATION_JS)) {
    tags.push('<script src="' + CARE_LOCATION_JS + '" defer></script>');
  }

  if (tags.length === 0) {
    // Nothing to add; return original HTML unchanged.
    return new Response(html, response);
  }

  const injection = '\n' + tags.join('\n') + '\n';

  // Prefer injecting right before </body>; fall back to </head>, then append.
  if (html.includes('</body>')) {
    html = html.replace('</body>', injection + '</body>');
  } else if (html.includes('</head>')) {
    html = html.replace('</head>', injection + '</head>');
  } else {
    html = html + injection;
  }

  return new Response(html, response);
};

export const config = {
  // Run on all paths; the handler itself filters to text/html only.
  path: '/*',
  // Exclude the script assets and Netlify functions from rewriting for safety.
  excludedPath: ['/assets/*', '/.netlify/*']
};

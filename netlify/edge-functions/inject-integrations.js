// Netlify Edge Function: inject-integrations
//
// Ensures the Carl widget (site.js), the location/search client
// (care-location.js), the County Intelligence Engine (county-engine.js),
// and the EMG Loop website tracker are present on EVERY HTML page, sitewide,
// without editing thousands of pre-generated static HTML files.
//
// It is idempotent and PATH-AGNOSTIC. Only text/html responses are modified.
// Non-HTML assets and the Netlify functions are excluded.

const SCRIPTS = [
  { file: 'site.js', src: '/assets/site.js' },
  { file: 'care-location.js', src: '/assets/care-location.js' },
  { file: 'county-engine.js', src: '/assets/county-engine.js' }
];

const LOOP_SRC = 'https://app.emgloop.com/sdk/emg-loop.js';
const LOOP_KEY = ['pk', 'emg', 'careinmycity'].join('_');

export default async (request, context) => {
  const response = await context.next();

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  let html = await response.text();
  const tags = [];

  if (!html.includes(LOOP_SRC)) {
    tags.push(`<script src="${LOOP_SRC}" data-property="careinmycity" data-ingest-key="${LOOP_KEY}" data-organization="servicesinmycity-demo" async></script>`);
  }

  for (const { file, src } of SCRIPTS) {
    if (!html.includes(file)) {
      tags.push('<script src="' + src + '" defer></script>');
    }
  }

  if (tags.length === 0) {
    return new Response(html, response);
  }

  const injection = '\n' + tags.join('\n') + '\n';

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
  path: '/*',
  excludedPath: ['/assets/*', '/.netlify/*']
};

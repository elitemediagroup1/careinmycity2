// Netlify Edge Function: inject-integrations
//
// Ensures the Carl widget (site.js) and the location/search client
// (care-location.js) are present on EVERY HTML page, sitewide, without
// editing thousands of pre-generated static HTML files.
//
// It is idempotent and PATH-AGNOSTIC: if a page already references a script
// by filename (via /assets/site.js, assets/site.js, ./assets/site.js,
// ../assets/site.js, etc.) it is NOT added again. Only text/html responses
// are modified. Non-HTML assets and the Netlify functions are excluded.
// No API keys are involved here (keys stay server-side in the functions).

const SCRIPTS = [
  { file: 'site.js', src: '/assets/site.js' },
  { file: 'care-location.js', src: '/assets/care-location.js' }
];

export default async (request, context) => {
  const response = await context.next();

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  let html = await response.text();

  const tags = [];
  for (const { file, src } of SCRIPTS) {
    // Match the filename regardless of the path prefix used in the page.
    const alreadyPresent = new RegExp('["\'/]' + file.replace('.', '\\.') + '["\']').test(html)
      || html.includes('/' + file)
      || html.includes(file);
    if (!alreadyPresent) {
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

// IndexNow trigger: reads the live production sitemap, filters to canonical
// production URLs, and submits them to IndexNow in batches.
//
// Safety model (no admin token required):
//   - The ONLY source of URLs is the live production sitemap.
//     https://careinmycity.com/sitemap.xml
//   - It NEVER accepts request-body URL lists or query-string URL lists,
//     so a caller cannot inject arbitrary URLs.
//   - All URLs are filtered to canonical https://careinmycity.com/... only:
//     legacy top-level state paths, preview/branch/localhost hosts, and
//     non-careinmycity.com hosts are rejected.
//   - Returns the REAL IndexNow status/body per batch.

const { filterCanonicalUrls } = require('./lib/canonical-urls');

const SITEMAP_URL = 'https://careinmycity.com/sitemap.xml';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const KEY = '931527fc2c60480a97bfe58c417e0503';
const KEY_LOCATION = 'https://careinmycity.com/931527fc2c60480a97bfe58c417e0503.txt';
const BATCH_SIZE = 1000; // IndexNow allows up to 10,000; keep batches modest.

function extractLocs(xml) {
  const urls = [];
  const re = /<loc>\s*([^<\s]+)\s*<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    urls.push(m[1].trim());
  }
  return urls;
}

async function submitBatch(urlList) {
  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      host: 'careinmycity.com',
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList
    })
  });
  const body = await response.text();
  return { status: response.status, body, count: urlList.length };
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // The only URL source is the live production sitemap. No user-provided
    // URLs (body or query string) are ever read or trusted.
    const res = await fetch(SITEMAP_URL, { headers: { 'Cache-Control': 'no-cache' } });
    if (!res.ok) {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ ok: false, error: 'Failed to fetch sitemap', status: res.status })
      };
    }
    const xml = await res.text();
    const allUrls = extractLocs(xml);
    const { valid, rejected } = filterCanonicalUrls(allUrls);

    const results = [];
    for (let i = 0; i < valid.length; i += BATCH_SIZE) {
      const batch = valid.slice(i, i + BATCH_SIZE);
      // eslint-disable-next-line no-await-in-loop
      const r = await submitBatch(batch);
      results.push(r);
    }

    const allOk = results.every((r) => r.status >= 200 && r.status < 300);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: allOk,
        totalInSitemap: allUrls.length,
        submitted: valid.length,
        rejectedCount: rejected.length,
        batches: results.length,
        results
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, error: error.message })
    };
  }
};

// Safe IndexNow trigger: reads the live sitemap, filters to canonical
// production URLs, and submits them to IndexNow in batches.
//
// Invocation:
//   - Manual admin call: POST/GET with header 'x-indexnow-token' (or
//     ?token=...) matching the INDEXNOW_ADMIN_TOKEN env var.
//   - Can be wired to a post-deploy hook that calls this endpoint with
//     the same token.
//
// Safety:
//   - Refuses to run without a valid admin token (prevents public abuse).
//   - Only submits canonical https://careinmycity.com/... URLs
//     (legacy state paths and preview hosts are filtered out).
//   - Submits in batches and returns the REAL IndexNow status per batch.

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

  // --- Auth: require admin token ---
  const expected = process.env.INDEXNOW_ADMIN_TOKEN;
  const provided =
    (event.headers && (event.headers['x-indexnow-token'] || event.headers['X-Indexnow-Token'])) ||
    (event.queryStringParameters && event.queryStringParameters.token);

  if (!expected || !provided || provided !== expected) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ ok: false, error: 'Unauthorized' })
    };
  }

  try {
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

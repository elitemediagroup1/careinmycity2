exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { urls, key } = JSON.parse(event.body);

    if (!Array.isArray(urls) || urls.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ ok: false, error: 'No urls provided' })
      };
    }

    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: 'careinmycity.com',
        key: key || '931527fc2c60480a97bfe58c417e0503',
        keyLocation: 'https://careinmycity.com/931527fc2c60480a97bfe58c417e0503.txt',
        urlList: urls
      })
    });

    // Surface the REAL IndexNow API response (status + body) instead of
    // always reporting success. IndexNow returns 200/202 on accept, and
    // 4xx (e.g. 403 invalid key, 422 invalid urls) on rejection.
    const responseBody = await response.text();
    const ok = response.status >= 200 && response.status < 300;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok,
        indexnowStatus: response.status,
        indexnowBody: responseBody,
        submittedCount: urls.length
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

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
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ status: response.status, message: 'Submitted successfully' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

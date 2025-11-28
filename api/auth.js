// Vercel Node function (CommonJS) - OAuth proxy cho GitHub
// Yêu cầu trên Vercel: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET (env vars)
const fetch = global.fetch || require('node-fetch');

module.exports = async (req, res) => {
  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
  const VERCEL_URL = process.env.VERCEL_URL || process.env.SITE_URL || null;
  const host = VERCEL_URL ? (VERCEL_URL.startsWith('http') ? VERCEL_URL.replace(/\/$/, '') : `https://${VERCEL_URL}`) : `https://${req.headers.host}`;

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: 'Server not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.' }));
    return;
  }

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.statusCode = 204;
    res.end();
    return;
  }

  const { code = null, state = '' } = req.query || {};

  if (!code) {
    // Chuyển hướng tới GitHub authorize
    const redirect_uri = `${host}/api/auth`;
    const authorizeUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(GITHUB_CLIENT_ID)}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=repo&state=${encodeURIComponent(state)}`;
    res.writeHead(302, { Location: authorizeUrl });
    res.end();
    return;
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code
      })
    });

    const tokenJson = await tokenRes.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (tokenJson.error) {
      res.statusCode = 400;
      res.end(JSON.stringify(tokenJson));
    } else {
      res.statusCode = 200;
      res.end(JSON.stringify(tokenJson));
    }
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: String(err) }));
  }
};

// Simple OAuth proxy for GitHub (Vercel function)
// Requires env vars on Vercel: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
export default async function handler(req, res) {
  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
  const VERCEL_URL = process.env.VERCEL_URL || process.env.SITE_URL || null;
  const host = VERCEL_URL ? `https://${VERCEL_URL.replace(/^https?:\/\//,'')}` : `https://${req.headers.host}`;

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    res.status(500).json({ error: 'Server not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.' });
    return;
  }

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).end();
    return;
  }

  const code = req.query.code;
  const state = req.query.state || '';

  if (!code) {
    // Redirect user to GitHub authorize
    const redirect_uri = `${host}/api/auth`;
    const authorizeUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(GITHUB_CLIENT_ID)}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=repo&state=${encodeURIComponent(state)}`;
    res.writeHead(302, { Location: authorizeUrl });
    res.end();
    return;
  }

  // Exchange code for access token
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

    if (tokenJson.error) {
      res.status(400).json(tokenJson);
    } else {
      // Decap expects JSON with access_token
      res.status(200).json(tokenJson);
    }
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}

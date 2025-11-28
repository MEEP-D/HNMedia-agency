// /api/auth/callback.js -- Exchange code for token
const fetch = global.fetch || require("node-fetch");

module.exports = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    res.statusCode = 400;
    res.end("Missing code");
    return;
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const json = await tokenRes.json();
  const token = json.access_token;

  if (!token) {
    res.statusCode = 400;
    res.end(JSON.stringify(json));
    return;
  }

  // Redirect back to Decap CMS with token in hash
  res.writeHead(302, {
    Location: `https://${req.headers.host}/admin/#access_token=${token}`
  });
  res.end();
};

// /api/auth/index.js -- Redirect user to GitHub OAuth
module.exports = async (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const host = `https://${req.headers.host}`;
  const callback = `${host}/api/auth/callback`;

  const authorizeUrl =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(callback)}` +
    `&scope=repo,user`;

  res.writeHead(302, { Location: authorizeUrl });
  res.end();
};

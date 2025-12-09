// /api/auth.js
module.exports = async (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const host = "https://digitalhnmedia.com";
  const callback = `${host}/api/callback`;

  const authorizeUrl =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(callback)}` +
    `&scope=repo,user`;

  res.writeHead(302, { Location: authorizeUrl });
  res.end();
};

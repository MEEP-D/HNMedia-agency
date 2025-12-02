const fetch = global.fetch || require("node-fetch");

module.exports = async (req, res) => {
  const { code = "" } = req.query;

  if (!code) {
    return res.status(400).send("Missing ?code");
  }

  // Đổi code -> token
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

  if (!json.access_token) {
    return res.status(400).json(json);
  }

  // 🔥 REDIRECT SANG /admin/?token=gho_xxx
  const redirectUrl = `/admin/?token=${json.access_token}`;
  res.writeHead(302, { Location: redirectUrl });
  res.end();
};

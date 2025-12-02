const fetch = global.fetch || require("node-fetch");

module.exports = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Missing code" });
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    })
  });

  const data = await tokenRes.json();

  if (!data.access_token) {
    return res.status(400).json({ error: "Invalid token response", data });
  }

  // Trả token về cho browser
  res.status(200).json({
    token: data.access_token,
    provider: "github"
  });
};

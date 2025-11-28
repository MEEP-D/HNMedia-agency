export default async function handler(req, res) {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).send("Missing ?code from GitHub OAuth");
  }

  try {
    // Exchange code → token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          state,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).json(tokenData);
    }

    const accessToken = tokenData.access_token;

    // Redirect back to CMS with token
    const redirectUrl = `/admin/#access_token=${accessToken}&provider=github`;

    return res.redirect(302, redirectUrl);
  } catch (e) {
    console.error("OAuth error:", e);
    return res.status(500).json({ error: "OAuth failed", details: e.message });
  }
}

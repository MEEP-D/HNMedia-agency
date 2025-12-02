// Simple bypass page for Vercel + custom OAuth Decap CMS
module.exports = async (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("X-Vercel-Protection-Bypass", "1");
  res.setHeader("X-Vercel-Skip-Sso", "1");

  res.status(200).send(`
<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CMS - HN Media Agency</title>
</head>

<body>

  <!-- Load CMS from LOCAL (NOT CDN) -->
  <script src="/admin/decap-cms.js"></script>

  <div id="nc-root"></div>

  <script>
  (function () {
    // --- 1) Extract token from URL ---
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      console.log("🔥 Saving OAuth token:", token);

      // --- 2) Save token exactly as Decap CMS expects ---
      localStorage.setItem(
        "netlify-cms-user",
        JSON.stringify({
          token,
          backendName: "github",
          loginSource: "oauth",
          provider: "github"
        })
      );

      // --- 3) Clean URL ---
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);
    }

    // --- 4) Init CMS ---
    document.addEventListener("DOMContentLoaded", () => {
      if (window.CMS) {
        console.log("🔥 CMS loaded → initializing...");
        window.CMS.init({
          config: '/admin/config.yml'
        });
      } else {
        console.error("❌ CMS FAILED to load");
      }
    });
  })();
  </script>

</body>
</html>
`);
};

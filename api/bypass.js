// Bypass route for Vercel authentication
module.exports = async (req, res) => {
  res.setHeader('X-Vercel-Protection-Bypass', '1');
  res.setHeader('X-Vercel-Skip-Sso', '1');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({ bypass: true });
};
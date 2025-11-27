const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (req, res) => {
  const proxy = createProxyMiddleware({
    target: 'https://api.github.com',
    changeOrigin: true,
    pathRewrite: {
      '^/api/auth': '/user',
    },
    onProxyReq: (proxyReq, req, res) => {
      proxyReq.setHeader('Authorization', `Bearer ${process.env.GITHUB_TOKEN}`);
      proxyReq.setHeader('User-Agent', 'Vercel-Function');
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      res.status(500).json({ error: 'Proxy error' });
    }
  });

  return proxy(req, res);
};
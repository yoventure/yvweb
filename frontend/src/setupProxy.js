const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/yv',
    createProxyMiddleware({
      target: 'https://yvuserchat.azurewebsites.net',
      changeOrigin: true,
      pathRewrite: {
        '^/yv': '',
      },
      logLevel: 'debug', // 添加日志信息
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying request to:', proxyReq.path);
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
      },
    })
  );
};

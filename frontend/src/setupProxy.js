const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/yv',
    createProxyMiddleware({
      target: 'https://yvuserchat.azurewebsites.net',
      changeOrigin: true,
      pathRewrite: {
        '^/yv': '', // 将请求路径中的 '/yv' 前缀重写为空，即去掉 '/yv'
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

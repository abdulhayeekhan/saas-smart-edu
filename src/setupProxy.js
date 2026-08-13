const http = require('http');

module.exports = function(app) {
  app.use('/books-api', (req, res) => {
    const targetHost = '72.61.148.72';
    
    // The path on the target server. e.g. /books-api/api/authentication -> /api/authentication
    const targetPath = req.originalUrl.replace(/^\/books-api/, '');

    const options = {
      hostname: targetHost,
      port: 80,
      path: targetPath,
      method: req.method,
      headers: {
        ...req.headers,
        host: targetHost,
      }
    };

    // Remove headers that might be rejected by the backend or cause CORS issues
    delete options.headers.referer;
    delete options.headers.origin;
    delete options.headers.connection;
    delete options.headers['accept-encoding'];

    const proxyReq = http.request(options, (proxyRes) => {
      // Forward the status and headers back to the browser
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (e) => {
      console.error(`Proxy error: ${e.message}`);
      res.status(500).send('Proxy error');
    });

    // Pipe the original request body to the proxy request
    req.pipe(proxyReq);
  });
};

var express = require('express');
var path = require('path');
var app = express();

// Serve static files from the 'wwwroot' directory
var buildPath = path.join(__dirname, 'wwwroot');
console.log('Serving static files from:', buildPath);

app.use(express.static(buildPath));

// Serve index.html for all routes
app.get('*', (req, res) => {
  console.log('Handling request for:', req.url);
  res.sendFile(path.join(buildPath, 'index.html'));
});

var server = app.listen(process.env.PORT || 8080, () => {
  console.log('Server is listening on port', process.env.PORT || 8080);
});

// Must be longer than local proxy keep-alive timeout
server.keepAliveTimeout = (65 * 1000);

const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

// Serve static files from /home/site/wwwroot/static
app.use(express.static('/home/site/wwwroot/static'));

// Fallback to index.html for single-page apps
app.get('*', (req, res) => {
  res.sendFile(path.join('/home/site/wwwroot/static', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

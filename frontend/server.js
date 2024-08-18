const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env or .env.production
const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${env}` });

const app = express();
const port = process.env.PORT || 8080;

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// Handle all GET requests by serving the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


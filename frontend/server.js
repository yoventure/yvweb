const express = require('express');
const path = require('path');

const app = express();

// Serve static files from the "build" directory
app.use(express.static(path.join(__dirname, 'build')));

// Serve the index.html file for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', '/build/index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

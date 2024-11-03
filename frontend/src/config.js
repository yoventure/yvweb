// config.js
let config;

if (process.env.NODE_ENV === 'production') {
  config = require('./config.production');
} else {
  config = require('./config.development');
}

module.exports = config;

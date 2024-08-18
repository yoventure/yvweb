#!/bin/sh

# Navigate to the application directory
cd /home/site/wwwroot

# Set environment variables
export NODE_ENV=production
export PORT=8080

# Start the application
npm start

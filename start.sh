#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# Build if needed
if [ ! -d ".next/standalone" ]; then
  echo "Building..."
  npx next build
  cp -r .next/static .next/standalone/.next/static/
  cp -r public/* .next/standalone/public/
fi

# Start server on port 4070
echo "Starting Netplus on http://localhost:4070"
PORT=4070 node .next/standalone/server.js

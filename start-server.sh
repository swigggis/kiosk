#!/bin/bash

# Schulkiosk BBS2 Celle - Server Start Script

echo "🍴 Schulkiosk BBS2 Celle - Starting Server..."

# Build the frontend
echo "Building frontend..."
npm run build

# Start the backend server
echo "Starting backend server on port 3000..."
node server.js

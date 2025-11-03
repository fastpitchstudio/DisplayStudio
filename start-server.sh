#!/bin/bash

# DisplayStudio Quick Start Script for macOS/Linux

echo "=========================================="
echo "DisplayStudio Matrix Control Server"
echo "=========================================="
echo ""

# Get the script's directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed!"
    exit 1
fi

echo "✓ npm found: $(npm --version)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if .next build exists
if [ ! -d ".next" ]; then
    echo "🔨 Building application..."
    npm run build
    echo ""
fi

# Get local IP address
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    LOCAL_IP=$(ipconfig getifaddr en0)
    if [ -z "$LOCAL_IP" ]; then
        LOCAL_IP=$(ipconfig getifaddr en1)
    fi
else
    # Linux
    LOCAL_IP=$(hostname -I | awk '{print $1}')
fi

echo "=========================================="
echo "🚀 Starting DisplayStudio Server"
echo "=========================================="
echo ""
echo "Local access:   http://localhost:3000"
if [ ! -z "$LOCAL_IP" ]; then
    echo "Network access: http://$LOCAL_IP:3000"
fi
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
npm start

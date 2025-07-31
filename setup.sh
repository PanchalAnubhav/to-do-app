#!/bin/bash

echo "===================================="
echo "   Todo App Setup Script (Unix/Mac)"
echo "===================================="
echo

# Check if Node.js is installed
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo
    echo "Please install Node.js from: https://nodejs.org/"
    echo "1. Download the LTS version"
    echo "2. Run the installer"
    echo "3. Restart this terminal"
    echo "4. Run this script again"
    echo
    exit 1
fi

echo "[SUCCESS] Node.js is installed!"
node --version
npm --version
echo

# Install dependencies
echo "Installing dependencies..."
echo

echo "[1/3] Installing root dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install root dependencies"
    exit 1
fi

echo "[2/3] Installing client dependencies..."
cd client
npm install
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install client dependencies"
    exit 1
fi

echo "[3/3] Installing server dependencies..."
cd ../server
npm install
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install server dependencies"
    exit 1
fi

cd ..

echo
echo "===================================="
echo "   Setup Complete!"
echo "===================================="
echo
echo "Next steps:"
echo "1. Set up environment variables:"
echo "   - Copy server/.env.example to server/.env"
echo "   - Copy client/.env.example to client/.env"
echo "   - Update the values in both .env files"
echo
echo "2. Start the development servers:"
echo "   npm run dev"
echo
echo "3. Open your browser:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend: http://localhost:5000"
echo

@echo off
echo ====================================
echo   Todo App Setup Script (Windows)
echo ====================================
echo.

:: Check if Node.js is installed
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo 1. Download the LTS version
    echo 2. Run the installer
    echo 3. Make sure to check "Add to PATH"
    echo 4. Restart this terminal
    echo 5. Run this script again
    echo.
    pause
    exit /b 1
)

echo [SUCCESS] Node.js is installed!
node --version
npm --version
echo.

:: Install dependencies
echo Installing dependencies...
echo.

echo [1/3] Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install root dependencies
    pause
    exit /b 1
)

echo [2/3] Installing client dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install client dependencies
    pause
    exit /b 1
)

echo [3/3] Installing server dependencies...
cd ..\server
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install server dependencies
    pause
    exit /b 1
)

cd ..

echo.
echo ====================================
echo   Setup Complete!
echo ====================================
echo.
echo Next steps:
echo 1. Set up environment variables:
echo    - Copy server\.env.example to server\.env
echo    - Copy client\.env.example to client\.env
echo    - Update the values in both .env files
echo.
echo 2. Start the development servers:
echo    npm run dev
echo.
echo 3. Open your browser:
echo    - Frontend: http://localhost:5173
echo    - Backend: http://localhost:5000
echo.
pause

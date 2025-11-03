@echo off
REM DisplayStudio Quick Start Script for Windows

echo ==========================================
echo DisplayStudio Matrix Control Server
echo ==========================================
echo.

REM Change to script directory
cd /d "%~dp0"

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo + Node.js found
node --version

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X npm is not installed!
    pause
    exit /b 1
)

echo + npm found
npm --version
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Check if .next build exists
if not exist ".next\" (
    echo Building application...
    call npm run build
    echo.
)

REM Get local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set LOCAL_IP=%%a
    goto :found_ip
)
:found_ip
set LOCAL_IP=%LOCAL_IP:~1%

echo ==========================================
echo Starting DisplayStudio Server
echo ==========================================
echo.
echo Local access:   http://localhost:3000
if defined LOCAL_IP echo Network access: http://%LOCAL_IP%:3000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
call npm start

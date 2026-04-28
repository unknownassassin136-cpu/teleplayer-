@echo off
setlocal enabledelayedexpansion

echo 🚀 Video Streaming Platform - Setup Script
echo ==========================================

REM Backend setup
echo.
echo 📦 Setting up Backend...
cd backend

if not exist .env (
    copy .env.example .env
    echo ✓ Created .env (please edit with your Telegram credentials)
) else (
    echo ✓ .env already exists
)

if not exist node_modules (
    echo 📥 Installing backend dependencies...
    call npm install
    echo ✓ Backend dependencies installed
) else (
    echo ✓ Backend dependencies already installed
)

echo.
echo ⚠️  Next steps:
echo 1. Edit backend\.env with your Telegram API credentials from https://my.telegram.org
echo 2. Run: npm run init-telegram (to authenticate with Telegram)
echo 3. Run: npm run init-admin (to create admin user)
echo 4. Run: npm start (to start the backend)

REM Frontend setup
echo.
echo 📦 Setting up Frontend...
cd ..\frontend

if not exist node_modules (
    echo 📥 Installing frontend dependencies...
    call npm install
    echo ✓ Frontend dependencies installed
) else (
    echo ✓ Frontend dependencies already installed
)

echo.
echo ✅ Setup complete!
echo.
echo 📋 To start development:
echo   Terminal 1: cd backend ^&^& npm start
echo   Terminal 2: cd frontend ^&^& npm start
echo.
echo 🔗 Then open: http://localhost:4200

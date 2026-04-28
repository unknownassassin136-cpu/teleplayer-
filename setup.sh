#!/bin/bash

echo "🚀 Video Streaming Platform - Setup Script"
echo "=========================================="

# Backend setup
echo ""
echo "📦 Setting up Backend..."
cd backend
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✓ Created .env (please edit with your Telegram credentials)"
fi

if [ ! -d node_modules ]; then
    echo "📥 Installing backend dependencies..."
    npm install
    echo "✓ Backend dependencies installed"
else
    echo "✓ Backend dependencies already installed"
fi

echo ""
echo "⚠️  Next steps:"
echo "1. Edit backend/.env with your Telegram API credentials from https://my.telegram.org"
echo "2. Run: npm run init-telegram (to authenticate with Telegram)"
echo "3. Run: npm run init-admin (to create admin user)"
echo "4. Run: npm start (to start the backend)"

# Frontend setup
echo ""
echo "📦 Setting up Frontend..."
cd ../frontend
if [ ! -d node_modules ]; then
    echo "📥 Installing frontend dependencies..."
    npm install
    echo "✓ Frontend dependencies installed"
else
    echo "✓ Frontend dependencies already installed"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 To start development:"
echo "  Terminal 1: cd backend && npm start"
echo "  Terminal 2: cd frontend && npm start"
echo ""
echo "🔗 Then open: http://localhost:4200"

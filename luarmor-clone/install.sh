#!/bin/bash

# FocusHub Installation Script

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║          FocusHub - Secure License Management System          ║"
echo "║                    Installation Script                        ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+"
    exit 1
fi

echo "✅ Node.js $(node --version) found"
echo ""

# Backend Setup
echo "📦 Setting up Backend..."
cd backend
npm install
cp .env.example .env
echo "✅ Backend dependencies installed"
echo "⚠️  Please edit backend/.env with your secrets"
echo ""

# Frontend Setup
echo "📦 Setting up Frontend..."
cd ../frontend
npm install
echo "✅ Frontend dependencies installed"
echo ""

# Discord Bot Setup
echo "📦 Setting up Discord Bot..."
cd ../discord-bot
npm install
cp .env.example .env
echo "✅ Discord Bot dependencies installed"
echo "⚠️  Please edit discord-bot/.env with your Discord token"
echo ""

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    Installation Complete!                     ║"
echo "╠═══════════════════════════════════════════════════════════════╣"
echo "║ Next steps:                                                   ║"
echo "║                                                               ║"
echo "║ 1. Edit backend/.env with your configuration                 ║"
echo "║ 2. Edit discord-bot/.env with your Discord bot token         ║"
echo "║                                                               ║"
echo "║ To start:                                                     ║"
echo "║   Backend:     cd backend && npm start                        ║"
echo "║   Frontend:    cd frontend && npm run dev                     ║"
echo "║   Discord Bot: cd discord-bot && npm start                    ║"
echo "║                                                               ║"
echo "║ Frontend URL: http://localhost:5173                           ║"
echo "║ Backend URL:  http://localhost:5000                           ║"
echo "╚═══════════════════════════════════════════════════════════════╝"

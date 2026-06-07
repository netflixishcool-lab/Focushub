@echo off
REM FocusHub Installation Script for Windows

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║          FocusHub - Secure License Management System          ║
echo ║                    Installation Script                        ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

REM Backend Setup
echo 📦 Setting up Backend...
cd backend
call npm install
if not exist .env (
    copy .env.example .env
)
echo ✅ Backend dependencies installed
echo ⚠️  Please edit backend\.env with your secrets
echo.

REM Frontend Setup
echo 📦 Setting up Frontend...
cd ..\frontend
call npm install
echo ✅ Frontend dependencies installed
echo.

REM Discord Bot Setup
echo 📦 Setting up Discord Bot...
cd ..\discord-bot
call npm install
if not exist .env (
    copy .env.example .env
)
echo ✅ Discord Bot dependencies installed
echo ⚠️  Please edit discord-bot\.env with your Discord token
echo.

echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                    Installation Complete!                     ║
echo ╠═══════════════════════════════════════════════════════════════╣
echo ║ Next steps:                                                   ║
echo ║                                                               ║
echo ║ 1. Edit backend\.env with your configuration                 ║
echo ║ 2. Edit discord-bot\.env with your Discord bot token         ║
echo ║                                                               ║
echo ║ To start (open new terminals):                                ║
echo ║   Backend:     cd backend ^&^& npm start                      ║
echo ║   Frontend:    cd frontend ^&^& npm run dev                   ║
echo ║   Discord Bot: cd discord-bot ^&^& npm start                  ║
echo ║                                                               ║
echo ║ Frontend URL: http://localhost:5173                           ║
echo ║ Backend URL:  http://localhost:5000                           ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
pause

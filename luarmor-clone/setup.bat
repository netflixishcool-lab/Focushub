@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║        Luarmor Admin Panel - Auto Setup ^& Start           ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo Fehler: Node.js nicht installiert!
    echo Installiere von: https://nodejs.org
    pause
    exit /b 1
)

echo Gefunden: 
node --version
echo.

if not exist "backend" (
    echo Fehler: backend Ordner nicht gefunden!
    pause
    exit /b 1
)

echo Projektstruktur OK
echo.
echo Was moechtest du tun?
echo.
echo 1 - Vollständige Installation
echo 2 - Nur starten (schnell)
echo 3 - Nur Dependencies installieren
echo.
set /p CHOICE="Waehle 1-3: "

if "%CHOICE%"=="1" goto FULL_INSTALL
if "%CHOICE%"=="2" goto QUICK_START
if "%CHOICE%"=="3" goto INSTALL_ONLY
echo Ungueltige Wahl!
pause
exit /b 1

:FULL_INSTALL
echo.
echo ===== VOLLSTANDIGE INSTALLATION =====
echo.

echo 1. Installiere Backend Dependencies...
if exist "node_modules" (
    echo   node_modules existiert bereits
) else (
    call npm install
)
echo OK
echo.

echo 2. Installiere Frontend Dependencies...
cd frontend
if exist "node_modules" (
    echo   node_modules existiert bereits
) else (
    call npm install
)
cd ..
echo OK
echo.

echo 3. Erstelle .env Datei...
if exist ".env" (
    echo   .env existiert bereits
) else (
    if exist ".env.example" (
        copy .env.example .env >nul
        echo Erstellt! Bitte bearbeite .env!
    )
)
echo.
echo Installation fertig!
echo.
pause
goto END

:INSTALL_ONLY
echo.
echo Backend Dependencies...
call npm install
echo Frontend Dependencies...
cd frontend
call npm install
cd ..
echo Fertig!
pause
goto END

:QUICK_START
echo.
if not exist ".env" (
    echo Fehler: .env nicht gefunden!
    echo Starte zuerst setup.bat und waehle Option 1
    pause
    exit /b 1
)

echo.
echo Was starten?
echo.
echo 1 - ALLES (Backend + Bot + Frontend)
echo 2 - Nur Backend + Bot
echo 3 - Nur Frontend
echo 4 - Nur Backend (Port 5000)
echo 5 - Nur Bot
echo.
set /p START_CHOICE="Waehle 1-5: "

if "%START_CHOICE%"=="1" (
    echo.
    echo Oeffne 2 weitere Terminal:
    echo   Terminal 2: discord-bot.bat
    echo   Terminal 3: frontend.bat
    pause
    call npm run dev
)
if "%START_CHOICE%"=="2" (
    echo.
    echo Starte Backend + Bot...
    pause
    call npm run dev
)
if "%START_CHOICE%"=="3" (
    echo.
    cd frontend
    call npm start
)
if "%START_CHOICE%"=="4" (
    echo.
    call node backend/server.js
)
if "%START_CHOICE%"=="5" (
    echo.
    call node backend/discord-bot.js
)
goto END

:END
echo.
pause
exit /b 0

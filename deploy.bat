@echo off
title FocusHub Deploy
color 0A

echo.
echo  ===================================
echo   FocusHub - Auto Deploy
echo  ===================================
echo.

cd /d D:\Datenbank

echo [1/3] Git Push (Backend zu Railway)...
git add -A
git commit -m "Deploy: %date% %time%"
git push
echo  Backend -> Railway (auto-deploy aktiv)
echo.

echo [2/3] Frontend deployen zu Vercel...
cd frontend
call npx vercel --prod --yes
echo.

echo [3/3] Fertig!
echo  Frontend: https://frontend-12gamers-projects.vercel.app
echo  Backend:  https://focushub-production-145e.up.railway.app
echo.
echo  Druecke eine Taste zum Schliessen...
pause > nul

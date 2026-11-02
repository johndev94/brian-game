@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Please install Node.js from https://nodejs.org then run this file again.
  pause
  exit /b 1
)
if not exist node_modules (
  call npm install
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
echo Starting The Outer Realm. Keep this window open while playing.
node node_modules/vite/bin/vite.js --host 127.0.0.1 --open
pause

@echo off
title PB08 TAXI Launcher
color 0E

echo ===================================================
echo             PB08 TAXI - LAUNCHING SYSTEM
echo ===================================================
echo.

echo [1/4] Stopping any previous PB08 TAXI processes...
call "%~dp0stop.bat" >nul 2>&1

echo [2/4] Starting FastAPI Backend on http://localhost:8000 ...
start "PB08_TAXI_BACKEND" cmd /k "title PB08_TAXI_BACKEND && cd /d "%~dp0backend" && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

echo [3/4] Starting Vite React Frontend on http://localhost:5173 ...
start "PB08_TAXI_FRONTEND" cmd /k "title PB08_TAXI_FRONTEND && cd /d "%~dp0frontend" && npm run dev"

echo [4/4] Waiting 3 seconds for servers to initialize...
ping 127.0.0.1 -n 4 >nul

echo.
echo Opening PB08 TAXI in your default web browser...
start "" "http://localhost:5173"

echo.
echo ===================================================
echo           PB08 TAXI IS NOW RUNNING!
echo ===================================================
echo  - Public Website:   http://localhost:5173
echo  - Admin Panel:      http://localhost:5173/admin/login
echo    * Username:       admin
echo    * Password:       PB08Taxi@2026!
echo  - Backend API Docs: http://localhost:8000/docs
echo.
echo To STOP everything anytime, double-click: stop.bat
echo ===================================================
echo.
pause

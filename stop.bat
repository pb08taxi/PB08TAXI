@echo off
title Stopping PB08 TAXI
color 0C
echo ===================================================
echo             PB08 TAXI - STOPPING SYSTEM
echo ===================================================
echo.

echo [1/3] Terminating PB08 TAXI Terminal Windows...
taskkill /FI "WINDOWTITLE eq PB08_TAXI_BACKEND*" /F /T >nul 2>&1
taskkill /FI "WINDOWTITLE eq PB08_TAXI_FRONTEND*" /F /T >nul 2>&1

echo [2/3] Freeing Port 8000 (Backend / FastAPI)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000 " ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo [3/3] Freeing Port 5173 (Frontend / Vite)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173 " ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo ===================================================
echo [SUCCESS] PB08 TAXI processes have been stopped!
echo ===================================================
echo.
ping 127.0.0.1 -n 2 >nul
exit /b 0

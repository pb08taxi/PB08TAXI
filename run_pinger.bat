@echo off
title PB08 TAXI - 24/7 Render Keep-Alive Pinger
color 0E

echo ====================================================================
echo      PB08 TAXI ^& OpenWA - 24/7 Render Keep-Alive Pinger
echo ====================================================================
echo  This tool pings both Render deployments every 10 minutes so they
echo  never spin down or sleep (PB08TAXI ^& pb08-whatsapp-api).
echo.
echo  Keep this terminal open in the background to ensure 24/7 uptime.
echo ====================================================================
echo.

python "%~dp0render_pinger.py" --interval 600

pause

@echo off
echo ========================================
echo   BBRI Stock Prediction - Docker Mode
echo ========================================
echo.
echo Starting Docker containers...
echo This will take a few minutes on first run.
echo.

docker-compose up --build

pause

@echo off
echo ========================================
echo   BBRI Stock Prediction - Stop Docker
echo ========================================
echo.
echo Stopping Docker containers...
echo.

docker-compose down

echo.
echo Docker containers stopped successfully!
echo.
pause

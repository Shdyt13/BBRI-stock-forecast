@echo off
echo ============================================
echo   BBRI Stock Prediction System
echo   Starting Development Servers...
echo ============================================
echo.

echo Starting Frontend Server (Port 3000)...
start cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Backend Server (Port 8000)...
start cmd /k "cd backend && venv\Scripts\activate && python main.py"

echo.
echo ============================================
echo   Development Servers Started!
echo ============================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo Press any key to exit this window...
echo (Note: Servers will keep running in separate windows)
pause > nul

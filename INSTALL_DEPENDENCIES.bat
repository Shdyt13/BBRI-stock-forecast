@echo off
echo ============================================
echo   BBRI Stock Prediction - Dependencies
echo   Installation Script for Windows
echo ============================================
echo.

echo [1/4] Installing Frontend Dependencies...
echo.
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Frontend installation failed!
    echo Trying with legacy-peer-deps flag...
    call npm install --legacy-peer-deps
)
cd ..
echo.
echo [Frontend] Dependencies installed successfully!
echo.

echo [2/4] Setting up Backend Virtual Environment...
echo.
cd backend
python -m venv venv
if %errorlevel% neq 0 (
    echo ERROR: Failed to create virtual environment
    echo Please make sure Python is installed and added to PATH
    pause
    exit /b 1
)
echo.
echo [Virtual Environment] Created successfully!
echo.

echo [3/4] Installing Backend Dependencies...
echo.
call venv\Scripts\activate.bat
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Backend installation failed!
    pause
    exit /b 1
)
echo.
echo [Backend] Dependencies installed successfully!
echo.

echo [4/4] Setting up environment variables...
if not exist .env (
    copy .env.example .env
    echo [Environment] .env file created from template
) else (
    echo [Environment] .env file already exists, skipping...
)
cd ..
echo.

echo ============================================
echo   Installation Complete!
echo ============================================
echo.
echo Next steps:
echo   1. Start Frontend: cd frontend ^&^& npm run dev
echo   2. Start Backend:  cd backend ^&^& venv\Scripts\activate ^&^& python main.py
echo.
echo Press any key to exit...
pause > nul

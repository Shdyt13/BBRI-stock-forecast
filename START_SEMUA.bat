@echo off
echo ========================================
echo  SISTEM PREDIKSI SAHAM BBRI
echo  Starting Frontend + Backend
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python belum terinstall!
    echo.
    echo Silakan install Python terlebih dahulu:
    echo 1. Buka: https://www.python.org/downloads/
    echo 2. Download dan install Python
    echo 3. CENTANG "Add Python to PATH"
    echo 4. Jalankan script ini lagi
    echo.
    echo Atau baca: PANDUAN_INSTALL_PYTHON.md
    pause
    exit /b 1
)

echo [OK] Python detected: 
python --version
echo.

REM Start Frontend
echo [1/2] Starting Frontend (React + Vite)...
cd frontend
start "Frontend - BBRI Stock Prediction" cmd /k "npm run dev"
cd ..
echo [OK] Frontend started on http://localhost:3000
echo.

REM Wait a bit
timeout /t 3 /nobreak >nul

REM Start Backend
echo [2/2] Starting Backend (FastAPI + ML)...
cd backend
start "Backend - BBRI Stock Prediction API" cmd /k "python main.py"
cd ..
echo [OK] Backend started on http://localhost:8000
echo.

echo ========================================
echo  SISTEM BERHASIL DIJALANKAN!
echo ========================================
echo.
echo Frontend: http://localhost:3000/
echo Backend:  http://localhost:8000/
echo API Docs: http://localhost:8000/docs
echo.
echo Dua jendela baru telah dibuka.
echo Jangan tutup jendela tersebut!
echo.
echo Tekan tombol apapun untuk membuka browser...
pause >nul

REM Open browser
start http://localhost:3000

echo.
echo Untuk menghentikan sistem:
echo - Tutup kedua jendela Command Prompt
echo - Atau tekan Ctrl+C di masing-masing jendela
echo.
pause

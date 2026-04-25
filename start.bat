@echo off
echo ╔══════════════════════════════════════════════════╗
echo ║     SmartWaste — Full Stack Startup              ║
echo ║  Frontend: http://localhost:5173                 ║
echo ║  Backend:  http://localhost:8000                 ║
echo ╚══════════════════════════════════════════════════╝
echo.

:: ── 1. Start the YOLOv8 FastAPI backend ──────────────────────────────────────
echo [1/2] Starting YOLOv8 backend...
cd /d "%~dp0..\detection-demo\backend"

if not exist "venv\Scripts\activate.bat" (
    echo   ERROR: Virtual env not found. Run: python -m venv venv ^& pip install -r requirements.txt
    goto :frontend
)

start "SmartWaste Backend" cmd /k "venv\Scripts\activate && python app.py"
echo   Backend starting at http://localhost:8000
timeout /t 3 /nobreak >nul

:: ── 2. Start the React frontend ───────────────────────────────────────────────
:frontend
echo [2/2] Starting React frontend...
cd /d "%~dp0"

start "SmartWaste Frontend" cmd /k "npm run dev"
echo   Frontend starting at http://localhost:5173

echo.
echo Both services are starting. Open http://localhost:5173 in your browser.
pause

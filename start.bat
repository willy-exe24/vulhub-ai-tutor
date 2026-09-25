@echo off
setlocal

set ROOT=%~dp0

if not exist "%ROOT%backend\.venv\Scripts\python.exe" (
    echo [setup] Creating backend virtual environment...
    python -m venv "%ROOT%backend\.venv"
    "%ROOT%backend\.venv\Scripts\python.exe" -m pip install -q -r "%ROOT%backend\requirements.txt"
)

if not exist "%ROOT%backend\.env" (
    copy "%ROOT%backend\.env.example" "%ROOT%backend\.env" >nul
    echo [setup] Created backend\.env from .env.example — add your OpenAI/Anthropic key there if you have one.
)

if not exist "%ROOT%frontend\node_modules" (
    echo [setup] Installing frontend dependencies, this may take a minute...
    pushd "%ROOT%frontend"
    call npm install
    popd
)

echo [start] Launching backend on http://127.0.0.1:8001 ...
start "Vulhub AI Tutor — Backend" cmd /k "cd /d "%ROOT%backend" && .venv\Scripts\python -m uvicorn app.main:app --port 8001"

echo [start] Launching frontend on http://localhost:5173 ...
start "Vulhub AI Tutor — Frontend" cmd /k "cd /d "%ROOT%frontend" && npm run dev"

echo [start] Waiting for the servers to come up...
timeout /t 6 /nobreak >nul

start "" "http://localhost:5173"

echo.
echo Vulhub AI Tutor is running in the two new windows that just opened (Backend / Frontend).
echo Power on your Kali + Vulhub VMs from the app's Dashboard or Settings if they aren't running yet.
echo To stop the app, close those two windows (or Ctrl+C in each).
echo.
pause
endlocal

@echo off
title SUPPLY CHAIN COMMAND — LAUNCHING

echo.
echo ============================================================
echo   SUPPLY CHAIN COMMAND — FULL STACK LAUNCHER
echo ============================================================
echo.

:: ── 1. Start FastAPI Backend ────────────────────────────────
echo [1/2] Starting FastAPI backend on port 8000...
start "SUPPLY CHAIN BACKEND" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --reload --port 8000"

:: Small delay so backend starts first
timeout /t 3 /nobreak > nul

:: ── 2. Start Vite Frontend ──────────────────────────────────
echo [2/2] Starting React frontend on port 3000...
start "SUPPLY CHAIN FRONTEND" cmd /k "cd /d %~dp0frontend && npm run dev -- --port 3000"

:: Small delay so browser doesn't open before servers are ready
timeout /t 4 /nobreak > nul

:: ── 3. Open in Browser ─────────────────────────────────────
echo.
echo Opening app in browser...
start "" "http://localhost:3000"

echo.
echo ============================================================
echo   BOTH SERVERS ARE RUNNING
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:8000
echo   API Docs:  http://localhost:8000/docs
echo ============================================================
echo.
echo Close the two terminal windows to stop the servers.
pause

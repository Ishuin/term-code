@echo off
REM Term-Code Windows Launcher
REM This batch file launches Term-Code with Ollama

echo Starting Term-Code with Ollama...

REM Change to the Term-Code directory
cd /d D:\Projects\ghuntley-code\term-code\claude-code

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

REM Check WSL for Ollama
echo Checking Ollama in WSL...
wsl -e bash -c "if command -v ollama >/dev/null; then echo Ollama found; else echo Ollama not found; fi"
wsl -e bash -c "if curl -s http://host.docker.internal:11434/api/tags >/dev/null; then echo Ollama is running; else echo Starting Ollama...; nohup ollama serve >/dev/null 2>&1 & sleep 3; fi"

REM Set environment variables
set OLLAMA_BASE_URL=http://host.docker.internal:11434
echo Using Ollama at: %OLLAMA_BASE_URL%

REM Run Term-Code
echo.
echo ===============================
echo   TERM-CODE with OLLAMA
echo ===============================
echo.

node run-term-code.js %*

echo.
echo Term-Code session completed. 
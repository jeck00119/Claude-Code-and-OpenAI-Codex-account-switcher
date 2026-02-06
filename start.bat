@echo off
setlocal

cd /d "%~dp0"
echo Starting Account Switcher...

call :ensure_npm || goto :eof
call :ensure_dependencies || goto :eof
call npm start
goto :eof

:ensure_npm
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm was not found in PATH. Please install Node.js LTS and try again.
    pause
    exit /b 1
)
exit /b 0

:ensure_dependencies
if exist node_modules\.bin\electron.cmd (
    exit /b 0
)
echo Installing missing dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] npm install failed. See the log above for details.
    pause
    exit /b 1
)
exit /b 0

@echo off
setlocal

cd /d "%~dp0"

:: If --console flag is passed, run with visible console
if "%~1"=="--console" goto :run

:: Default: relaunch hidden via inline VBS
set "vbs=%temp%\account-switcher-launch.vbs"
> "%vbs%" echo CreateObject("Wscript.Shell").Run "cmd /c ""%~f0"" --console", 0, False
wscript "%vbs%"
del "%vbs%" 2>nul
goto :eof

:run
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

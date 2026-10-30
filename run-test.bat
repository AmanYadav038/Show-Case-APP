@echo off
setlocal
set PATH=%~dp0.tools\node-v20.18.0-win-x64;%PATH%
echo Running unit tests...
call npm run test
pause

@echo off
cd /d "%~dp0"
if not exist "node_modules\next" (
  echo Hay cai phu thuoc bang npm ci truoc. Xem README.md.
  pause
  exit /b 1
)
if not exist ".next\BUILD_ID" (
  call npm.cmd run build
  if errorlevel 1 exit /b 1
)
echo Website: http://127.0.0.1:3187/vi
echo Quan tri: http://127.0.0.1:3187/admin
call npm.cmd start

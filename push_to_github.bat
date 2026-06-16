@echo off
setlocal
cd /d "C:\Users\jithu\Downloads\Application-1-master\Application-1-master"
set GITEXE=C:\Program Files\Git\cmd\git.exe
"%GITEXE%" config --global credential.helper ""
"%GITEXE%" push origin main
if %errorlevel% equ 0 (
  echo SUCCESS
) else (
  echo FAILED %errorlevel%
)
endlocal

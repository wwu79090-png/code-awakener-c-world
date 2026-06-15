@echo off
setlocal EnableExtensions EnableDelayedExpansion

rem One-click deploy helper (PowerShell policy independent)
set "REPO=%~1"
if "%REPO%"=="" set "REPO=%GH_REPO%"

if "%REPO%"=="" (
  echo [deploy-oneclick] Missing repository.
  echo Example: scripts\deploy-oneclick.bat owner/name [branch] [create] [wait]
  exit /b 1
)

if "%~2"=="" (
  set "BRANCH=main"
) else (
  set "BRANCH=%~2"
)

set "EXTRA="
if /I "%~3"=="create" set "EXTRA=%EXTRA% --create"
if /I "%~4"=="create" set "EXTRA=%EXTRA% --create"
if /I "%~5"=="create" set "EXTRA=%EXTRA% --create"
if /I "%~3"=="wait" set "EXTRA=%EXTRA% --wait"
if /I "%~4"=="wait" set "EXTRA=%EXTRA% --wait"
if /I "%~5"=="wait" set "EXTRA=%EXTRA% --wait"

echo [deploy-oneclick] repo=%REPO%
echo [deploy-oneclick] branch=%BRANCH%
echo [deploy-oneclick] extra=%EXTRA%

node scripts/auto-deploy.js --repo %REPO% --branch %BRANCH% %EXTRA%
if errorlevel 1 (
  echo [deploy-oneclick] Deploy failed. Set GH_TOKEN and rerun.
  exit /b 1
)

echo [deploy-oneclick] Deploy command finished.
exit /b 0

@echo off
setlocal enableextensions enabledelayedexpansion

if "%GH_TOKEN%"=="" if "%GITHUB_TOKEN%"=="" (
  echo [deploy-auto] 未检测到 GH_TOKEN/GITHUB_TOKEN，尝试使用 gh CLI 继续……
  where gh >nul 2>nul
  if errorlevel 1 (
    echo [deploy-auto] 未检测到 gh CLI，需先设置 Token 或安装 gh 并登录：
    echo set GH_TOKEN=你的Token
    exit /b 1
  )
)

set "REPO=%~1"
set "BRANCH=main"
if not "%~2"=="" set "BRANCH=%~2"

set "EXTRA="
if /I "%~3"=="create" set "EXTRA=%EXTRA% --create"
if /I "%~3"=="wait" set "EXTRA=%EXTRA% --wait"
if /I "%~4"=="create" set "EXTRA=%EXTRA% --create"
if /I "%~4"=="wait" set "EXTRA=%EXTRA% --wait"
if /I "%~5"=="create" set "EXTRA=%EXTRA% --create"
if /I "%~5"=="wait" set "EXTRA=%EXTRA% --wait"

echo [deploy-auto] repo=%REPO%
echo [deploy-auto] branch=%BRANCH%
echo [deploy-auto] extra=%EXTRA%

rem 直接交给 Node 的 auto-deploy.js 自动探测仓库和远端，避免 PowerShell 启动开销。
if "%REPO%"=="" (
  call node scripts/auto-deploy.js --branch %BRANCH% %EXTRA%
) else (
  call node scripts/auto-deploy.js --repo %REPO% --branch %BRANCH% %EXTRA%
)
if errorlevel 1 exit /b 1

echo [deploy-auto] 一键部署已触发
exit /b 0

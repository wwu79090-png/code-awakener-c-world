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

if "%1"=="" (
  for /f "delims=" %%i in ('powershell -NoProfile -Command "$r=(git remote get-url origin); if($r -match 'github\\.com[:/](?<owner>[^/]+)/(?<repo>[^/.]+)(?:\\.git)?$'){ Write-Output \"$($matches.owner)/$($matches.repo)\" }"') do set "REPO=%%i"
  if "%REPO%"=="" set "REPO=%GH_REPO%"
) else (
  set "REPO=%1"
)

if "%REPO%"=="" (
  echo [deploy-auto] 未检测到仓库参数。用法：
  echo   deploy-auto.bat owner/name [branch] [create] [wait]
  exit /b 1
)

set BRANCH=main
if not "%2"=="" set BRANCH=%2

set EXTRA=
if "%3"=="create" set EXTRA=%EXTRA% --create
if "%3"=="wait" set EXTRA=%EXTRA% --wait
if "%4"=="wait" set EXTRA=%EXTRA% --wait

rem 直接调用 node 脚本，避免 npm.ps1/PowerShell 执行策略问题。
call node scripts/auto-deploy.js --repo %REPO% --branch %BRANCH% %EXTRA%
if errorlevel 1 exit /b 1

echo [deploy-auto] 一键部署已触发
exit /b 0

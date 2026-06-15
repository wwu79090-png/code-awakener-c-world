param(
  [string]$Branch = "",
  [switch]$Create = $true,
  [switch]$Wait = $true
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Repo = $env:GH_REPO
if (-not $Repo) {
  try {
    $remote = & git remote get-url origin 2>$null
    if ($remote -match 'github\.com[:/](?<owner>[^/]+)/(?<repo>[^/.]+)(?:\.git)?$') {
      $Repo = "$($Matches.owner)/$($Matches.repo)"
    }
  } catch {}
}

if (-not $Repo) {
  Write-Error "未检测到仓库信息。请设置 GH_REPO 或确保 git remote origin 存在于 github 仓库。"
  exit 1
}

if (-not $Branch) {
  try {
    $Branch = (& git branch --show-current).Trim()
    if (-not $Branch) { $Branch = "main" }
  } catch {
    $Branch = "main"
  }
}

$argsList = @("scripts/auto-deploy.js", "--repo", $Repo, "--branch", $Branch)
if ($Create) { $argsList += "--create" }
if ($Wait) { $argsList += "--wait" }

Write-Host "[quick-deploy] repo=$Repo branch=$Branch"

# 直接调用 node 脚本，避免 PowerShell 执行策略导致的 npm.ps1 拦截。
# 与 npm run 部署相比行为一致，但不依赖 npm.cmd/.ps1 的执行权。
& node @argsList
if ($LASTEXITCODE -ne 0) {
  Write-Error "发布失败，返回码: $LASTEXITCODE"
  exit $LASTEXITCODE
}

Write-Host "[quick-deploy] 发布命令已执行。"

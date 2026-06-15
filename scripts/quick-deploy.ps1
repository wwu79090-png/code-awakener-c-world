param(
  [string]$Branch = "main",
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

if (-not $env:GH_TOKEN -and -not $env:GITHUB_TOKEN) {
  try {
    $null = gh auth status 2>$null
    if ($LASTEXITCODE -ne 0) { throw "no-gh" }
  } catch {
    Write-Error "未检测到 GH_TOKEN/GITHUB_TOKEN，且未检测到已登录的 gh CLI。请先设置 Token 或登录 gh CLI。"
    exit 1
  }
}

$argsList = @("deploy:gh-pages", "--", "--repo", $Repo, "--branch", $Branch)
if ($Create) { $argsList += "--create" }
if ($Wait) { $argsList += "--wait" }

Write-Host "[quick-deploy] repo=$Repo branch=$Branch"
& npm run @argsList
if ($LASTEXITCODE -ne 0) {
  Write-Error "发布失败，返回码: $LASTEXITCODE"
  exit $LASTEXITCODE
}

Write-Host "[quick-deploy] 发布命令已执行。"

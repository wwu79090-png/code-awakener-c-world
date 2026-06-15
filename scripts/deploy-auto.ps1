param(
    [string]$Repo = "",
    [string]$Branch = "",
    [switch]$Create = $false,
    [switch]$Wait = $false
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-RepoFromGitRemote {
  try {
    $remote = & git remote get-url origin 2>$null
    if (-not $remote) { return "" }
    if ($remote -match 'github\.com[:/](?<owner>[^/]+)/(?<repo>[^/.]+)(?:\.git)?$') {
      return "$($Matches.owner)/$($Matches.repo)"
    }
  } catch {}
  return ""
}

if (-not $env:GH_TOKEN -and -not $env:GITHUB_TOKEN) {
  try {
    $null = & gh auth status 2>$null
    if ($LASTEXITCODE -ne 0) { throw "no_gh" }
  } catch {
    Write-Error "未检测到 GH_TOKEN/GITHUB_TOKEN，且未检测到已登录的 gh CLI。请先设置 Token 或登录 gh。"
    exit 1
  }
}

$token = if ($env:GH_TOKEN) { "GH_TOKEN" } else { "GITHUB_TOKEN" }
$repo = $Repo
if (-not $repo) {
  $repo = if ($env:GH_REPO) { $env:GH_REPO } else { Get-RepoFromGitRemote }
}
if (-not $repo) {
  Write-Error "请提供仓库：-Repo owner/name，或设置 GH_REPO 环境变量，或确保 git remote origin 已配置。"
  exit 1
}

$argsList = @("deploy:gh-pages","--","--repo",$repo)
if ($Branch) { $argsList += @("--branch",$Branch) }
if ($Create) { $argsList += "--create" }
if ($Wait) { $argsList += "--wait" }

Write-Host "[deploy-auto] repo=$repo"
if ($Branch) { Write-Host "[deploy-auto] branch=$Branch" }
if ($Create) { Write-Host "[deploy-auto] create=on" }
if ($Wait) { Write-Host "[deploy-auto] wait=on" }

Write-Host "[deploy-auto] 开始执行一键部署..."
& npm run @argsList
if ($LASTEXITCODE -ne 0) {
  Write-Error "部署命令返回码: $LASTEXITCODE"
  exit $LASTEXITCODE
}

Write-Host "[deploy-auto] 部署流程已触发，访问页面请看上方日志中的 Pages 地址。"

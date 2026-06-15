# 代码觉醒者（Code Awakener C）

## 一键上线 GitHub Pages

项目已内置 GitHub Pages 自动化部署：  
- 推送到 `main`/`master` 后触发 `pages-deploy.yml`  
- 构建产物来自 `npm run build`（`dist/index.html`）  
- 支持离线静态发布，默认上传 `dist/` 目录

### 一键部署入口（无需手动点 GitHub 页面）

> 推荐：先在仓库目录执行一次 `npm install`，之后直接执行一条部署命令。

#### 方式 A：使用 PowerShell 脚本（最省心）
```powershell
# 1) 先配置仓库与分支（可选）
$env:GH_REPO = "你的用户名/仓库名"   # 例如 39120/code-awakener-c-world
$env:GH_TOKEN = "你的 PAT"            # 或 $env:GITHUB_TOKEN

# 2) 直接一条命令启动
.\scripts\deploy-auto.ps1 -Repo "你的用户名/仓库名" -Branch "main" -Create -Wait
```

如果你已在仓库目录设置好 `GH_REPO`、`GH_TOKEN`，也可直接跑“零参数版”：
```powershell
.\scripts\quick-deploy.ps1
```

最简一行命令（PowerShell，适合直接复制）：
```powershell
$env:GH_TOKEN="你的_PAT"; $env:GH_REPO="你的用户名/仓库名"; .\scripts\quick-deploy.ps1 -Branch main -Create -Wait
```

#### 方式 B：直接 npm（无脚本包裹）
```bash
npm run deploy:gh-pages -- --repo 你的用户名/仓库名 --branch main --create --wait
```

#### 方式 C：CMD
```bat
set GH_REPO=你的用户名/仓库名
scripts\deploy-auto.bat 你的用户名/仓库名 main create wait
```

### 参数说明
- `--repo owner/name`：目标仓库（可省略，脚本自动读取 `origin` 或 `GH_REPO`）
- `--branch branch`：触发分支（默认自动识别远端默认分支，通常为 `main`）
- `--create`：仓库不存在时自动创建（需要 Token）
- `--wait`：输出最近一次 workflow 运行信息

### 注意
- 没有 token 也可以用 gh CLI 登录方式继续：
  - 先安装并登录 `gh`（`gh auth login`）
  - PowerShell/CMD 脚本会自动走 `gh` 推送和触发
- 若你遇到 Pages 未更新，确认仓库 `Settings -> Pages -> Source` 已设置为 **GitHub Actions**

### 变更说明
- `scripts/auto-deploy.js`：支持自动仓库推断、分支参数、无中文 workflow 文件名依赖
- `scripts/deploy-auto.ps1` / `scripts/deploy-auto.bat`：支持全自动触发部署
- `.github/workflows/pages-deploy.yml`：固定文件名稳定触发

## 重要脚本
- `npm run build`：生成发布产物到 `dist/`
- `npm run deploy:gh-pages`：全自动部署主流程（构建 + 推送 + 触发 workflow）
- `npm run deploy:gh-pages:wait`：同上，增加 `--wait` 参数

## 发布输出目录
- `dist/programming-rpg-c-basics.production.html`
- `dist/programming-rpg-c-basics.secure.html`
- `dist/index.html`
- `dist/.nojekyll`

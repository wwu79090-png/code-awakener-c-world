const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');
const { execSync, spawnSync } = require('node:child_process');

function parseArg(key, fallback = null) {
  const args = process.argv.slice(2);
  const pref = `--${key}=`;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === `--${key}`) {
      const next = args[i + 1];
      if (next && !next.startsWith('--')) return next;
      return true;
    }
    if (arg.startsWith(pref)) return arg.slice(pref.length);
  }
  return fallback;
}

function hasCommand(cmd) {
  try {
    execSync(`${cmd} --version`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function execLine(cmd, stdio = 'pipe') {
  return execSync(cmd, { encoding: 'utf8', stdio }).toString().trim();
}

function execInherit(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

function runSpawn(cmd, args, options = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', stdio: 'pipe', ...options });
  if (r.error) throw r.error;
  if (r.status !== 0) {
    const msg = `${r.stdout || ''}${r.stderr || ''}`.trim();
    throw new Error(msg || `${cmd} exited ${r.status}`);
  }
  return (r.stdout || '').toString().trim();
}

function requestGitHub(method, apiPath, token, bodyObj) {
  return new Promise((resolve) => {
    const body = bodyObj ? JSON.stringify(bodyObj) : '';
    const req = https.request(
      {
        hostname: 'api.github.com',
        path: `/repos/${apiPath}`,
        method,
        headers: {
          'User-Agent': 'code-awakener-deploy-script',
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          let json = {};
          try {
            json = data ? JSON.parse(data) : {};
          } catch {
            json = { raw: data };
          }
          resolve({ status: res.statusCode || 0, data: json });
        });
      }
    );
    req.on('error', () => resolve({ status: 0, data: { message: 'network_error' } }));
    if (body) req.write(body);
    req.end();
  });
}

function getRepoFromArgs() {
  return (
    parseArg('repo') ||
    process.env.GH_REPO ||
    process.env.GITHUB_REPOSITORY ||
    ''
  ).trim();
}

function getCurrentBranch() {
  try {
    return execLine('git branch --show-current');
  } catch {
    return '';
  }
}

function branchExists(branch) {
  if (!branch) return false;
  try {
    execLine(`git rev-parse --verify ${branch}`);
    return true;
  } catch {
    return false;
  }
}

function detectRepoFromRemote() {
  try {
    const remote = execLine('git remote get-url origin');
    const m = remote.match(/github\.com[:/](?<owner>[^/]+)\/(?<repo>[^/.]+)(?:\.git)?$/i);
    return m ? `${m.groups.owner}/${m.groups.repo}` : '';
  } catch {
    return '';
  }
}

function requireRepo(raw) {
  if (!raw || !/^[^/\s]+\/[^/\s]+$/.test(raw)) {
    console.error('请提供仓库：--repo owner/name 或设置 GH_REPO / GITHUB_REPOSITORY');
    process.exit(1);
  }
  return raw;
}

async function getLogin(token) {
  if (!token) return '';
  const r = await requestGitHub('GET', 'user', token);
  return r.status === 200 ? r.data.login || '' : '';
}

async function createRepo(ownerRepo, token) {
  const [owner, repoName] = ownerRepo.split('/');
  const login = await getLogin(token);
  const loginLower = login.toLowerCase();
  const ownerLower = owner.toLowerCase();

  const apiPath = loginLower === ownerLower ? 'user/repos' : `orgs/${owner}/repos`;
  const payload = {
    name: repoName,
    private: false,
    auto_init: true,
    description: 'Code Awakener C'
  };

  const r = await requestGitHub('POST', apiPath, token, payload);
  if (r.status === 201) {
    console.log(`[deploy] 已自动创建仓库 ${ownerRepo}`);
    return;
  }

  console.error(`[deploy] 自动创建仓库失败：${r.status}`);
  if (r.data?.message) console.error(`[deploy] ${r.data.message}`);
  process.exit(1);
}

async function ensureRepo(ownerRepo, token) {
  if (!token) return;
  const r = await requestGitHub('GET', ownerRepo, token);
  if (r.status === 200) return;

  if (r.status === 404) {
    if (parseArg('create') === true) {
      await createRepo(ownerRepo, token);
      return;
    }
    console.error(`未找到仓库 ${ownerRepo}`);
    console.error('仓库不存在。如需自动创建请加 --create');
    process.exit(1);
  }

  console.error(`仓库校验失败：${r.status}`);
  if (r.data?.message) console.error(r.data.message);
  process.exit(1);
}

function ensureRemote(ownerRepo) {
  const target = `https://github.com/${ownerRepo}.git`;
  let current = '';
  try {
    current = execLine('git remote get-url origin');
  } catch {
    current = '';
  }

  if (!current) {
    execInherit(`git remote add origin ${target}`);
    console.log(`[deploy] 已设置 origin=${target}`);
    return;
  }

  if (!current.includes(`/${ownerRepo}.git`) && !current.includes(`/${ownerRepo}`)) {
    execInherit(`git remote set-url origin ${target}`);
    console.log(`[deploy] 已更新 origin 到 ${target}`);
  }
}

function getDefaultBranchFromRemote() {
  const local = getCurrentBranch();
  if (local) return local;

  const envBranch = process.env.GITHUB_REF_NAME || process.env.GIT_BRANCH;
  if (envBranch) return envBranch;

  try {
    const remoteHead = execLine('git symbolic-ref refs/remotes/origin/HEAD');
    const normalized = remoteHead.split('/').pop();
    if (normalized) return normalized;
  } catch {}

  return 'main';
}

function ensureLocalBranch(targetBranch) {
  const current = getCurrentBranch() || 'master';

  if (branchExists(targetBranch)) return { branch: targetBranch, switched: false };

  const createFlag = parseArg('create') === true;
  if (createFlag) {
    if (current === targetBranch) return { branch: targetBranch, switched: false };
    try {
      execInherit(`git checkout -b ${targetBranch}`);
      return { branch: targetBranch, switched: true, origin: current };
    } catch (err) {
      throw new Error(`分支 ${targetBranch} 不存在且创建失败：${err.message}`);
    }
  }

  console.log(`[deploy] 分支 ${targetBranch} 不存在，自动回退到当前分支 ${current}`);
  return { branch: current, switched: false };
}

function push(branch, ownerRepo, token) {
  if (token) {
    const pushUrl = `https://x-access-token:${encodeURIComponent(token)}@github.com/${ownerRepo}.git`;
    execInherit(`git push -u ${pushUrl} ${branch}`);
    return;
  }

  if (hasCommand('gh')) {
    execInherit('git push');
    return;
  }

  throw new Error('未提供 GH_TOKEN 且无 gh CLI，无法推送');
}

function dispatchWorkflowWithGh(repo, branch) {
  // 优先按 workflow 文件触发，避免中文/空格名导致匹配不稳定
  runSpawn('gh', ['workflow', 'run', 'pages-deploy.yml', '--repo', repo, '--ref', branch], {
    stdio: 'inherit'
  });
  return true;
}

async function dispatchWorkflowWithApi(repo, branch, token) {
  if (!token) return false;
  const r = await requestGitHub(
    'POST',
    `${repo}/actions/workflows/pages-deploy.yml/dispatches`,
    token,
    { ref: branch }
  );
  return r.status === 204 || r.status === 201;
}

function waitRun(repo) {
  if (parseArg('wait') !== true) return;
  if (!hasCommand('gh')) {
    console.log('已开启 --wait，但缺少 gh CLI，无法轮询。');
    return;
  }
  try {
    execInherit(`gh run list --repo ${repo} --workflow pages-deploy.yml --limit 1`);
  } catch {
    console.log('无法读取 run 列表，继续执行。');
  }
}

async function printPagesUrl(repo, token) {
  const parts = repo.split('/');
  const fallback = `https://${parts[0]}.github.io/${parts[1]}/`;

  if (!token) {
    console.log(`[deploy] 发布触发完成，候选页面：${fallback}`);
    return;
  }

  const r = await requestGitHub('GET', `${repo}/pages`, token);
  if (r.status === 200 && r.data?.html_url) {
    console.log(`[deploy] Pages 地址：${r.data.html_url}`);
  } else {
    console.log(`[deploy] Pages 地址（预估）：${fallback}`);
  }
}

async function main() {
  console.log('[deploy] 一键 GitHub Pages 部署开始（非交互）');

  const repo = requireRepo(getRepoFromArgs() || detectRepoFromRemote());
  const branch = parseArg('branch', getDefaultBranchFromRemote());
  const branchState = ensureLocalBranch(branch);
  const branchName = branchState.branch;
  const branchOrigin = branchState.origin;
  const branchSwitched = branchState.switched === true;

  const token = (process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '').trim();
  const useGh = hasCommand('gh');

  if (!token && !useGh) {
    console.error('未检测到 GH_TOKEN/GITHUB_TOKEN 且未安装 gh CLI。');
    console.log('请先设置 GH_TOKEN 环境变量，或安装并登录 gh CLI。');
    process.exit(1);
  }

  await ensureRepo(repo, token);
  ensureRemote(repo);

  console.log('[deploy] 正在构建 dist ...');
  execInherit('npm run build');

  const nojekyll = path.join(process.cwd(), 'dist', '.nojekyll');
  if (fs.existsSync(path.join(process.cwd(), 'dist')) && !fs.existsSync(nojekyll)) {
    fs.writeFileSync(nojekyll, '');
  }

  console.log(`[deploy] 推送分支：${branchName}`);
  push(branchName, repo, token);

  if (branchSwitched && branchOrigin) {
    try {
      execInherit(`git checkout ${branchOrigin}`);
      console.log(`[deploy] 已切回原始分支：${branchOrigin}`);
    } catch {
      // 不影响主流程：仅恢复环境，忽略异常
    }
  }

  let triggered = false;
  if (useGh) {
    try {
      triggered = dispatchWorkflowWithGh(repo, branchName);
    } catch {
      triggered = false;
    }
  }

  if (!triggered) {
    triggered = await dispatchWorkflowWithApi(repo, branchName, token);
  }

  if (triggered) {
    console.log('[deploy] GitHub Actions workflow 已触发。');
  } else {
    console.log('[deploy] 未触发 workflow，请确认 Actions 文件名为 pages-deploy.yml。');
    console.log(`[deploy] 打开确认： https://github.com/${repo}/actions/workflows/pages-deploy.yml`);
  }

  waitRun(repo);
  await printPagesUrl(repo, token);
  console.log('完成。');
}

main().catch((err) => {
  console.error(`[deploy] 失败：${err.message}`);
  process.exit(1);
});

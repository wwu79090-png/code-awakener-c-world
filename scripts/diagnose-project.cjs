const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const artifactDir = path.join(rootDir, "tmp-smoke", "diagnostics", stamp);

function hasFlag(name) {
  return process.argv.slice(2).includes(`--${name}`);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function stageResultPath(name) {
  return path.join(artifactDir, `${name}.log`);
}

function runStage(stage) {
  const logPath = stageResultPath(stage.name);
  const header = [
    `== ${stage.name} ==`,
    `command: ${stage.command.join(" ")}`,
    `cwd: ${rootDir}`,
    `started: ${new Date().toISOString()}`,
    ""
  ].join(os.EOL);

  const result = spawnSync(stage.command[0], stage.command.slice(1), {
    cwd: rootDir,
    encoding: "utf8",
    windowsHide: true,
    shell: false,
    env: {
      ...process.env,
      CI: "1",
      FORCE_COLOR: "0"
    }
  });

  const stdout = result.stdout || "";
  const stderr = result.stderr || "";
  const trailer = [
    "",
    `exitCode: ${result.status ?? 0}`,
    `signal: ${result.signal || ""}`,
    `finished: ${new Date().toISOString()}`
  ].join(os.EOL);

  fs.writeFileSync(logPath, header + stdout + (stderr ? `\n[stderr]\n${stderr}` : "") + trailer, "utf8");

  if (result.error) {
    return {
      ok: false,
      stage: stage.name,
      exitCode: -1,
      error: result.error.message,
      logPath
    };
  }

  if (result.status !== 0) {
    return {
      ok: false,
      stage: stage.name,
      exitCode: result.status,
      error: (stderr || stdout || `stage ${stage.name} failed`).trim().split(/\r?\n/).slice(-8).join("\n"),
      logPath
    };
  }

  return {
    ok: true,
    stage: stage.name,
    exitCode: result.status,
    logPath
  };
}

function buildPlan() {
  const plan = [
    { name: "test", command: ["node", "programming-rpg-c-basics.test.js"] },
    { name: "static-audit", command: ["node", "scripts/static-quality-audit.cjs"] },
    { name: "complexity-audit", command: ["node", "scripts/complexity-audit.cjs"] },
    { name: "magic-audit", command: ["node", "scripts/magic-number-audit.cjs"] },
    { name: "animation-audit", command: ["node", "scripts/animation-leak-audit.cjs"] },
    { name: "build", command: ["node", "build-single-html.cjs"] },
    { name: "visual-smoke", command: ["node", "scripts/visual-regression-smoke.cjs"] }
  ];

  if (hasFlag("ui") || hasFlag("all")) {
    plan.push({ name: "mobile-smoke", command: ["node", "scripts/mobile-browser-smoke.cjs"] });
  }

  return plan;
}

function failureAdvice(stage) {
  switch (stage) {
    case "test":
      return "先看单元测试失败点，别换方法。直接修业务逻辑或断言。";
    case "static-audit":
      return "先收敛静态质量问题，再考虑重跑别的测试。";
    case "complexity-audit":
      return "先拆复杂函数，减少一次性改动，再继续测。";
    case "magic-audit":
      return "先把魔法数抽成常量，保持后续问题可读。";
    case "animation-audit":
      return "先处理动画泄漏或重复定时器，再测界面。";
    case "build":
      return "先修构建链路，不要直接切到浏览器测试。";
    case "visual-smoke":
      return "先看页面结构和截图差异，确认是否是渲染问题。";
    case "mobile-smoke":
      return "先看移动端烟测日志和截图，再判断兼容性。";
    default:
      return "先保留当前路线，沿着日志继续定位。";
  }
}

function main() {
  ensureDir(artifactDir);

  const plan = buildPlan();
  const results = [];

  for (const stage of plan) {
    console.log(`[diagnose] running ${stage.name}...`);
    const result = runStage(stage);
    results.push(result);
    if (!result.ok) {
      const summary = {
        ok: false,
        artifactDir,
        failedStage: result.stage,
        exitCode: result.exitCode,
        logPath: result.logPath,
        advice: failureAdvice(result.stage),
        results
      };
      fs.writeFileSync(path.join(artifactDir, "summary.json"), JSON.stringify(summary, null, 2), "utf8");
      console.error(JSON.stringify(summary, null, 2));
      process.exit(result.exitCode || 1);
    }
  }

  const summary = {
    ok: true,
    artifactDir,
    results
  };
  fs.writeFileSync(path.join(artifactDir, "summary.json"), JSON.stringify(summary, null, 2), "utf8");
  console.log(JSON.stringify(summary, null, 2));
}

main();

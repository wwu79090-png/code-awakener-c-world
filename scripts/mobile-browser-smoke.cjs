const fs = require("fs");
const os = require("os");
const path = require("path");

let playwright;
try {
  playwright = require("@playwright/test");
} catch (error) {
  console.error("[mobile-smoke] @playwright/test 未安装。请运行：npm install -D @playwright/test && npx playwright install chromium webkit");
  process.exit(2);
}

const { chromium, webkit, devices } = playwright;
const rootDir = path.resolve(__dirname, "..");
const targetFile = path.join(rootDir, "programming-rpg-c-basics.html");
const targetUrl = `file:///${targetFile.replace(/\\/g, "/")}`;
const artifactDir = process.env.MOBILE_SMOKE_ARTIFACT_DIR || path.join(os.tmpdir(), "code-awakener-mobile-smoke");

const mobileChromeDevice = devices["Pixel 7"] || devices["Pixel 5"] || {
  viewport: { width: 393, height: 851 },
  deviceScaleFactor: 2.75,
  isMobile: true,
  hasTouch: true,
  userAgent: "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/125 Mobile Safari/537.36"
};

const mobileSafariDevice = devices["iPhone 14"] || devices["iPhone 13"] || {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1"
};

const cases = [
  {
    name: "mobile-chrome-chromium",
    label: "Mobile Chrome（Chromium 移动端仿真）",
    browserType: chromium,
    device: mobileChromeDevice
  },
  {
    name: "mobile-safari-webkit",
    label: "Mobile Safari 兼容性（WebKit 移动端仿真，Windows 无法启动真机 Safari）",
    browserType: webkit,
    device: mobileSafariDevice
  }
];

function ensureTargetExists() {
  if (!fs.existsSync(targetFile)) {
    throw new Error(`找不到游戏 HTML：${targetFile}`);
  }
  fs.mkdirSync(artifactDir, { recursive: true });
}

function isRelevantConsoleError(entry) {
  return /(ReferenceError|TypeError|SyntaxError|运行异常|fatal|uncaught|白屏)/i.test(entry.text);
}

async function exerciseCodeGenesis(page) {
  const active = await page.locator("#codeGenesisOverlay.active").count().catch(() => 0);
  if (!active) return "code genesis not visible yet";
  const input = page.locator("#codeGenesisInput");
  await input.click();
  async function softKeyboardLine(line) {
    await input.evaluate((element, text) => {
      for (const char of text) {
        element.dispatchEvent(new InputEvent("beforeinput", {
          inputType: "insertText",
          data: char,
          bubbles: true,
          cancelable: true
        }));
      }
      element.dispatchEvent(new InputEvent("beforeinput", {
        inputType: "insertLineBreak",
        data: null,
        bubbles: true,
        cancelable: true
      }));
    }, line);
  }
  await input.evaluate((element) => {
    element.dispatchEvent(new CompositionEvent("compositionstart", { data: "", bubbles: true }));
    for (const candidate of ["i", "in", "int"]) {
      element.dispatchEvent(new InputEvent("beforeinput", {
        inputType: "insertCompositionText",
        data: candidate,
        bubbles: true,
        cancelable: true
      }));
    }
    element.dispatchEvent(new CompositionEvent("compositionend", { data: "i", bubbles: true }));
    element.dispatchEvent(new InputEvent("beforeinput", {
      inputType: "insertText",
      data: "i",
      bubbles: true,
      cancelable: true
    }));
  });
  await softKeyboardLine("nt hp = 88;");
  for (const line of ['char name[] = "smoke";', "int level = 1;", "return 0;"]) {
    await softKeyboardLine(line);
    await page.waitForTimeout(160);
  }
  await page.waitForTimeout(4200);
  const hidden = await page.locator("#codeGenesisOverlay.active").count().then((count) => count === 0);
  if (!hidden) throw new Error("代码创世终端没有在 return 0 后关闭");
  return "code genesis completed";
}

async function confirmPostGenesisSetupForSmoke(page) {
  const active = await page.locator("#postGenesisSetupOverlay.active").count().catch(() => 0);
  if (!active) return "post-genesis setup already skipped";
  await page.locator("#postGenesisSetupConfirmButton").click({ timeout: 10000 });
  await page.waitForFunction(() => !document.querySelector("#postGenesisSetupOverlay.active"), null, { timeout: 10000 });
  return "post-genesis setup confirmed";
}

async function runCase(testCase) {
  const errors = [];
  const warnings = [];
  const browser = await testCase.browserType.launch({ headless: true });
  const context = await browser.newContext({
    ...testCase.device,
    locale: "zh-CN",
    colorScheme: "dark"
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push({ type: "pageerror", text: error.message }));
  page.on("console", (message) => {
    const text = message.text();
    if (message.type() === "error") errors.push({ type: "console", text });
    if (message.type() === "warning") warnings.push(text);
  });

  await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForSelector("#game-shell", { timeout: 30000 });
  await page.waitForTimeout(3200);
  await page.keyboard.press("Space").catch(() => {});
  if (await page.locator("#codeGenesisOverlay.active").count().then((count) => count === 0).catch(() => true)) {
    await page.locator('[data-menu-action="start"]').click({ timeout: 10000 }).catch(async () => {
      await page.keyboard.press("Enter");
    });
    await page.waitForTimeout(700);
  }

  const genesisInteraction = await exerciseCodeGenesis(page);
  const postGenesisInteraction = await confirmPostGenesisSetupForSmoke(page);
  await page.waitForTimeout(1600);

  const state = await page.evaluate(() => {
    const visible = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return false;
      const style = getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity || 1) > 0.01;
    };
    const canvas = document.querySelector("canvas");
    return {
      title: document.title,
      shell: Boolean(document.querySelector("#game-shell")),
      canvas: Boolean(canvas),
      canvasSize: canvas ? { width: canvas.width, height: canvas.height } : null,
      boot: visible("#systemBootOverlay"),
      menu: visible("#mainMenuOverlay"),
      genesis: visible("#codeGenesisOverlay"),
      postGenesis: visible("#postGenesisSetupOverlay"),
      errorDialogVisible: visible("#globalErrorDialog"),
      errorToastVisible: visible("#errorRecoveryToast"),
      gameText: document.body.innerText.slice(0, 600)
    };
  });

  const screenshotPath = path.join(artifactDir, `${testCase.name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false });
  await browser.close();

  const relevantErrors = errors.filter(isRelevantConsoleError);
  if (!state.shell) throw new Error(`${testCase.label}: #game-shell 未渲染`);
  if (!state.canvas && !state.menu && !state.genesis && !state.boot) throw new Error(`${testCase.label}: 首屏疑似空白`);
  if (state.postGenesis) throw new Error(`${testCase.label}: 创角后设置仍然停留，未真正进入世界`);
  if (state.errorDialogVisible || state.errorToastVisible) throw new Error(`${testCase.label}: 错误保护层可见`);
  if (relevantErrors.length) {
    throw new Error(`${testCase.label}: 控制台存在运行错误：${JSON.stringify(relevantErrors.slice(0, 4))}`);
  }

  return {
    browser: testCase.label,
    url: targetUrl,
    state,
    interaction: {
      genesis: genesisInteraction,
      postGenesis: postGenesisInteraction
    },
    warnings: warnings.slice(0, 6),
    screenshotPath
  };
}

(async () => {
  ensureTargetExists();
  const results = [];
  for (const testCase of cases) {
    results.push(await runCase(testCase));
  }
  console.log(JSON.stringify({
    ok: true,
    note: "Windows 本地无法全自动启动 iPhone 真机 Safari；这里使用 Playwright WebKit 移动端作为 Safari 兼容性自动化替代。",
    artifactDir,
    results
  }, null, 2));
})().catch((error) => {
  console.error("[mobile-smoke] failed:", error);
  process.exit(1);
});

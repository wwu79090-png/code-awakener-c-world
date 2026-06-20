const fs = require("fs");
const os = require("os");
const path = require("path");

let playwright;
try {
  playwright = require("@playwright/test");
} catch (error) {
  console.error("[first-cabin-smoke] @playwright/test 未安装。请运行：npm install -D @playwright/test && npx playwright install chromium");
  process.exit(2);
}

const { chromium } = playwright;
const rootDir = path.resolve(__dirname, "..");
const targetFile = path.join(rootDir, "programming-rpg-c-basics.html");
const targetUrl = `file:///${targetFile.replace(/\\/g, "/")}?smoke=first-learning-cabin`;
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const artifactDir = process.env.FIRST_LEARNING_CABIN_SMOKE_ARTIFACT_DIR
  || path.join(rootDir, "tmp-smoke", "first-learning-cabin-file", stamp);

function ensureTargetExists() {
  if (!fs.existsSync(targetFile)) {
    throw new Error(`找不到游戏 HTML：${targetFile}`);
  }
  fs.mkdirSync(artifactDir, { recursive: true });
}

function normalizeText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function classifyKnownWarning(text = "") {
  const value = String(text || "");
  if (/GPU stall due to ReadPixels|\.WebGL.*ReadPixels|readPixels/i.test(value)) return "chromium-webgl-readpixels";
  if (/CONTEXT_LOST_WEBGL|loseContext: context lost/i.test(value)) return "chromium-webgl-context-lost-cleanup";
  if (/AudioContext was not allowed to start|user gesture/i.test(value)) return "headless-audio-autoplay-policy";
  if (/\[SAFE_MODE\].*基础渲染模式|启动参数或设置要求安全模式/.test(value)) return "intentional-safe-mode-smoke";
  return "";
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function snapshot(page) {
  return page.evaluate(() => window.CodeAwakenerPhaserHooks?.snapshot?.() || null);
}

async function waitForSnapshot(page, predicate, label, timeoutMs = 30000) {
  const started = Date.now();
  let last = null;
  while (Date.now() - started < timeoutMs) {
    last = await snapshot(page).catch(() => null);
    if (last && predicate(last)) return last;
    await page.waitForTimeout(160);
  }
  throw new Error(`${label} 超时。最后状态：${JSON.stringify(last, null, 2)}`);
}

async function forceCompilerCabinHandsOn(page) {
  const started = Date.now();
  let lastResult = false;
  while (Date.now() - started < 30000) {
    lastResult = await page.evaluate(() => {
      const hooks = window.CodeAwakenerPhaserHooks;
      if (!hooks?.forceCompilerCabinHandsOn) return false;
      return hooks.forceCompilerCabinHandsOn("overview");
    }).catch(() => false);
    if (lastResult) return true;
    await page.waitForTimeout(500);
  }
  throw new Error(`无法通过 CodeAwakenerPhaserHooks 进入第一学习舱，最后结果：${lastResult}`);
}

async function readVisibleBox(page, selector) {
  return page.$eval(selector, (element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return {
      text: element.textContent || "",
      visible: style.display !== "none"
        && style.visibility !== "hidden"
        && Number(style.opacity || 1) > 0.01
        && rect.width > 0
        && rect.height > 0,
      rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
    };
  });
}

async function runSmoke() {
  ensureTargetExists();
  const consoleEntries = [];
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    locale: "zh-CN",
    colorScheme: "dark"
  });

  await context.addInitScript(() => {
    try {
      localStorage.setItem("noviceGuideCompleted", "true");
      localStorage.setItem("rpg-c-basics-settings-v1", JSON.stringify({
        animationQuality: "off",
        renderQuality: "low",
        safeMode: false,
        voiceEnabled: true,
        masterVolume: 120,
        ttsVolume: 120,
        musicVolume: 0,
        sfxVolume: 0
      }));
    } catch (error) {
      void error;
    }

    window.__firstLearningCabinTtsEvents = [];
    class SmokeAudio {
      constructor(src = "") {
        this.dataset = {};
        this.readyState = 0;
        this.duration = 0.08;
        this.paused = true;
        this.volume = 1;
        this.preload = "";
        this._src = "";
        if (src) this.src = src;
      }

      set src(value) {
        this._src = String(value || "");
        window.__firstLearningCabinTtsEvents.push({ type: "src", src: this._src });
      }

      get src() {
        return this._src;
      }

      get currentSrc() {
        return this._src;
      }

      load() {
        this.readyState = 4;
        window.setTimeout(() => {
          this.oncanplaythrough?.();
        }, 0);
      }

      play() {
        this.paused = false;
        window.__firstLearningCabinTtsEvents.push({ type: "play", src: this._src });
        window.setTimeout(() => {
          this.paused = true;
          this.onended?.();
          window.__firstLearningCabinTtsEvents.push({ type: "ended", src: this._src });
        }, 80);
        return Promise.resolve();
      }

      pause() {
        this.paused = true;
        window.__firstLearningCabinTtsEvents.push({ type: "pause", src: this._src });
      }

      addEventListener(type, handler) {
        this[`on${type}`] = handler;
      }

      removeEventListener(type, handler) {
        if (this[`on${type}`] === handler) this[`on${type}`] = null;
      }
    }
    Object.defineProperty(window, "Audio", { configurable: true, writable: true, value: SmokeAudio });
  });

  const page = await context.newPage();
  page.on("pageerror", (error) => {
    consoleEntries.push({ type: "pageerror", text: error.message });
  });
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      consoleEntries.push({ type: message.type(), text: message.text() });
    }
  });

  await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForSelector("#game-shell", { timeout: 30000 });
  await page.waitForFunction(() => Boolean(window.CodeAwakenerPhaserHooks?.snapshot), null, { timeout: 30000 });
  await forceCompilerCabinHandsOn(page);

  const editorReady = await waitForSnapshot(
    page,
    (state) => state.editorOpen && state.activeChallengeId === "overview" && state.compilerHandsOnActive,
    "第一学习舱实战编辑器未进入"
  );

  await page.locator("#compilerHandsOnJumpRunButton").click({ timeout: 10000 });
  const runReady = await waitForSnapshot(
    page,
    (state) => state.editorOpen
      && state.activeChallengeId === "overview"
      && state.runButtonReady
      && !state.runDisabled
      && normalizeText(state.codeValue) === normalizeText(state.expectedOverviewCode),
    "第一学习舱未跳到可点击运行状态"
  );

  const guideBeforeClick = await page.evaluate(() => {
    const panel = document.querySelector("#compilerHandsOnSubtitle");
    const copy = panel?.querySelector(".compiler-hands-on-copy");
    return {
      active: Boolean(panel?.classList?.contains("active")),
      focus: panel?.dataset?.focus || "",
      stage: panel?.dataset?.stage || "",
      text: copy?.textContent || ""
    };
  });
  assert(guideBeforeClick.active && guideBeforeClick.focus === "run", "点击运行代理条未处于 run 焦点状态");

  await page.locator("#compilerHandsOnSubtitle .compiler-hands-on-copy").click({ timeout: 10000 });
  const outputReady = await waitForSnapshot(
    page,
    (state) => {
      const combinedConsoleText = `${state.richConsoleText || ""}\n${state.outputText || ""}`;
      return /Compilation complete/.test(state.outputText)
        && /通过：程序输出为 C language/.test(state.outputText)
        && /运行成功|C language/.test(combinedConsoleText);
    },
    "点击运行代理没有触发真实运行输出"
  );

  await page.waitForFunction(() => {
    const panel = document.querySelector("#compilerHandsOnSubtitle");
    return panel?.dataset?.focus === "output";
  }, null, { timeout: 15000 });

  await page.waitForFunction(() => {
    const hooks = window.CodeAwakenerPhaserHooks;
    const state = hooks?.snapshot?.();
    const line = document.querySelector(".code-deconstruct-line");
    return Boolean(
      state?.printfDeconstructionActive
      && line
      && line.textContent.includes('printf("C language");')
      && line.querySelectorAll(".code-deconstruct-active").length > 0
    );
  }, null, { timeout: 30000 });

  const outputBox = await readVisibleBox(page, "#consoleOutput");
  const deconstruction = await page.evaluate(() => {
    const line = document.querySelector(".code-deconstruct-line");
    const panel = document.querySelector("#compilerHandsOnSubtitle");
    const pipeline = window.CodeAwakenerPhaserHooks?.ttsPipeline?.(
      "mentor",
      "运行成功后先看输出区。这里显示的 C language，就是双引号里那段文字被程序打印出来的结果。"
    );
    return {
      subtitleFocus: panel?.dataset?.focus || "",
      subtitleStage: panel?.dataset?.stage || "",
      subtitleText: panel?.textContent || "",
      codeText: line?.textContent || "",
      activeCount: line?.querySelectorAll(".code-deconstruct-active").length || 0,
      ttsEvents: window.__firstLearningCabinTtsEvents || [],
      ttsPipeline: pipeline ? {
        engine: pipeline.engine,
        endpoint: pipeline.endpoint,
        offline: pipeline.offline,
        browserSpeechSynthesisAllowed: pipeline.browserSpeechSynthesisAllowed,
        cacheText: pipeline.cacheText,
        spokenText: pipeline.text,
        payloadInput: pipeline.payload?.input,
        payloadLang: pipeline.payload?.lang
      } : null
    };
  });

  assert(outputBox.visible, "输出区 #consoleOutput 不可见");
  assert(/C language/.test(outputBox.text), "输出区没有显示 C language");
  assert(deconstruction.subtitleFocus === "output", "运行后字幕/TTS 阶段未同步到 output");
  assert(deconstruction.activeCount > 0, "printf 字符级解构没有高亮当前字符范围");
  assert(deconstruction.ttsPipeline?.engine === "Supertonic", "第一学习舱 TTS 管线未指向 Supertonic");
  assert(deconstruction.ttsPipeline?.cacheText === "运行成功后先看输出区。这里显示的 C language，就是双引号里那段文字被程序打印出来的结果。", "TTS 缓存键没有保持原始字幕文本");
  assert(deconstruction.ttsPipeline?.browserSpeechSynthesisAllowed === false, "第一学习舱不应回退到浏览器机器人 TTS");

  const screenshotPath = path.join(artifactDir, "first-learning-cabin-file-smoke.png");
  await page.screenshot({ path: screenshotPath, fullPage: false });
  await browser.close();

  const knownWarnings = consoleEntries
    .map((entry) => ({ ...entry, classification: classifyKnownWarning(entry.text) }))
    .filter((entry) => entry.classification);
  const unexpectedConsole = consoleEntries.filter((entry) => {
    if (entry.type === "warning" && classifyKnownWarning(entry.text)) return false;
    return true;
  });
  if (unexpectedConsole.length) {
    throw new Error(`浏览器控制台存在未解释 error/warn：${JSON.stringify(unexpectedConsole.slice(0, 8), null, 2)}`);
  }

  const report = {
    ok: true,
    url: targetUrl,
    artifactDir,
    screenshotPath,
    checks: {
      editorReady: {
        editorOpen: editorReady.editorOpen,
        activeChallengeId: editorReady.activeChallengeId
      },
      clickRunProxy: {
        before: guideBeforeClick,
        afterOutput: outputReady.outputText
      },
      outputArea: outputBox,
      ttsSync: {
        subtitleFocus: deconstruction.subtitleFocus,
        subtitleStage: deconstruction.subtitleStage,
        pipeline: deconstruction.ttsPipeline,
        fakeAudioEvents: deconstruction.ttsEvents.slice(0, 8)
      },
      printfDeconstruction: {
        codeText: deconstruction.codeText,
        activeCount: deconstruction.activeCount
      },
      knownWarnings
    }
  };
  fs.writeFileSync(path.join(artifactDir, "summary.json"), JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
}

runSmoke().catch((error) => {
  console.error("[first-cabin-smoke] failed:", error);
  process.exit(1);
});

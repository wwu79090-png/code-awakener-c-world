const fs = require("fs");
const crypto = require("crypto");
const vm = require("vm");

function makeElement() {
  return {
    textContent: "",
    innerHTML: "",
    value: "",
    readOnly: false,
    className: "",
    style: {},
    dataset: {},
    classList: {
      add() {},
      remove() {},
      toggle() {},
      contains() { return false; }
    },
    addEventListener() {},
    removeEventListener() {},
    querySelector() { return makeElement(); },
    querySelectorAll() { return []; },
    appendChild() {},
    remove() {},
    animate() { return { onfinish: null }; },
    getContext() { return {}; }
  };
}

function loadGameScript() {
  const html = fs.readFileSync("programming-rpg-c-basics.html", "utf8");
  const script = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
    .map((match) => match[1])
    .join("\n");
  const context = {
    console,
    localStorage: { getItem() { return null; }, setItem() {} },
    document: {
      body: makeElement(),
      getElementById() { return makeElement(); },
      querySelectorAll() { return []; },
      querySelector() { return makeElement(); },
      addEventListener() {},
      createElement() { return makeElement(); }
    },
    window: {
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
      requestAnimationFrame() { return 0; },
      cancelAnimationFrame() {},
      addEventListener() {},
      removeEventListener() {}
    },
    btoa(value) {
      return Buffer.from(String(value), "binary").toString("base64");
    },
    atob(value) {
      return Buffer.from(String(value), "base64").toString("binary");
    },
    performance: { now() { return 0; } },
    Phaser: {
      AUTO: 0,
      Scale: { FIT: 0, CENTER_BOTH: 0 },
      Input: { Keyboard: { KeyCodes: { E: 69 }, JustDown() { return false; } } },
      Math: {
        Vector2: class {},
        Distance: { BetweenPoints() { return 0; } }
      },
      Scene: class {},
      Game: class {}
    }
  };
  vm.createContext(context);
  vm.runInContext(`${script}
globalThis.__gameApi = {
  chapters,
  chapterById,
  inspectCBeforeRun,
  inspectRunnableCBeforeRun: typeof inspectRunnableCBeforeRun === "function" ? inspectRunnableCBeforeRun : undefined,
  isLenientChallengePass: typeof isLenientChallengePass === "function" ? isLenientChallengePass : undefined,
  simulateCOutput,
  autoInjectStdIoHeader,
  normalizeProgramOutput,
  compareProgramOutput,
  createInitialGameData,
  resetGameData,
  parseCodeGenesisLine: typeof parseCodeGenesisLine === "function" ? parseCodeGenesisLine : undefined,
  createCodeGenesisInitialState: typeof createCodeGenesisInitialState === "function" ? createCodeGenesisInitialState : undefined,
  createFixedGameSavePayload: typeof createFixedGameSavePayload === "function" ? createFixedGameSavePayload : undefined,
  validateFixedGameSaveJson: typeof validateFixedGameSaveJson === "function" ? validateFixedGameSaveJson : undefined,
  resolveStartupRouteFromSave: typeof resolveStartupRouteFromSave === "function" ? resolveStartupRouteFromSave : undefined,
  applyManualEditorKeyOperation: typeof applyManualEditorKeyOperation === "function" ? applyManualEditorKeyOperation : undefined,
  manualEditorOperationFromBeforeInput: typeof manualEditorOperationFromBeforeInput === "function" ? manualEditorOperationFromBeforeInput : undefined,
  destroyKnowledgeFragment: typeof destroyKnowledgeFragment === "function" ? destroyKnowledgeFragment : undefined,
  compressSavePayload: typeof compressSavePayload === "function" ? compressSavePayload : undefined,
  decompressSavePayload: typeof decompressSavePayload === "function" ? decompressSavePayload : undefined,
  escapeHtml: typeof escapeHtml === "function" ? escapeHtml : undefined
};`, context);
  return context.__gameApi;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const api = loadGameScript();
const html = fs.readFileSync("programming-rpg-c-basics.html", "utf8");
const cspContent = html.match(/Content-Security-Policy" content="([^"]+)"/)?.[1] || "";
const rawStyleContent = html.match(/<style[^>]*>([\s\S]*?)<\/style>/)?.[1] || "";
const rawInlineScriptContent = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)]
  .find((match) => !/src=/.test(match[1]))?.[2] || "";
function sha256Directive(source) {
  return `sha256-${crypto.createHash("sha256").update(source, "utf8").digest("base64")}`;
}
const expectedIds = [
  "hello",
  "variables",
  "operators",
  "conditions",
  "loops",
  "functions",
  "arrays",
  "pointers",
  "structs",
  "files",
  "memory",
  "preprocessor",
  "stdlib",
  "best-practices"
];

assert(api.chapters.length === expectedIds.length, `expected ${expectedIds.length} chapters, got ${api.chapters.length}`);
for (const id of expectedIds) {
  assert(api.chapterById[id], `missing chapter ${id}`);
}

assert(api.compressSavePayload, "save compressor should be exported for tests");
assert(api.decompressSavePayload, "save decompressor should be exported for tests");
assert(api.escapeHtml, "HTML escaper should be exported for tests");
{
  const unicodePayload = JSON.stringify({ title: "设置：中文", values: ["霓虹蓝", "知识碎片", "黑客绿"] });
  const packed = api.compressSavePayload(unicodePayload);
  assert(/^lz2:/.test(packed), "new save compression should use the unicode-safe lz2 codec");
  assert(api.decompressSavePayload(packed) === unicodePayload, "lz2 save compression should round-trip Chinese text");
  assert(api.escapeHtml(42) === "42", "escapeHtml should safely stringify non-string values");
  assert(api.escapeHtml("<b>&</b>") === "&lt;b&gt;&amp;&lt;/b&gt;", "escapeHtml should still escape markup");
}

const samples = {
  hello: `#include <stdio.h>
int main(void) {
  printf("Hello, C World!");
  return 0;
}`,
  variables: `#include <stdio.h>
int main(void) {
  int level = 7;
  printf("%d", level);
  return 0;
}`,
  operators: `#include <stdio.h>
int main(void) {
  int attack = 12;
  int bonus = 3;
  int power = attack + bonus;
  printf("%d", power);
  return 0;
}`,
  conditions: `#include <stdio.h>
int main(void) {
  int score = 86;
  if (score >= 60) {
    printf("pass");
  } else {
    printf("fail");
  }
  return 0;
}`,
  loops: `#include <stdio.h>
int main(void) {
  int sum = 0;
  for (int i = 1; i <= 5; i++) {
    sum += i;
  }
  printf("%d", sum);
  return 0;
}`,
  functions: `#include <stdio.h>
int add(int a, int b) {
  return a + b;
}
int main(void) {
  int result = add(4, 6);
  printf("%d", result);
  return 0;
}`,
  arrays: `#include <stdio.h>
int main(void) {
  int nums[3] = {2, 4, 6};
  int total = nums[0] + nums[1] + nums[2];
  printf("%d", total);
  return 0;
}`,
  pointers: `#include <stdio.h>
int main(void) {
  int value = 9;
  int *ptr = &value;
  printf("%d", *ptr);
  return 0;
}`,
  structs: `#include <stdio.h>
struct Hero {
  int level;
};
int main(void) {
  struct Hero hero = {8};
  printf("%d", hero.level);
  return 0;
}`,
  files: `#include <stdio.h>
int main(void) {
  FILE *fp = fopen("note.txt", "w");
  fprintf(fp, "C File");
  fclose(fp);
  printf("file saved");
  return 0;
}`,
  memory: `#include <stdio.h>
#include <stdlib.h>
int main(void) {
  int *numbers = malloc(3 * sizeof(int));
  numbers[0] = 1;
  numbers[1] = 2;
  numbers[2] = 3;
  printf("%d", numbers[0] + numbers[1] + numbers[2]);
  free(numbers);
  return 0;
}`,
  preprocessor: `#include <stdio.h>
#define MAX_LEVEL 99
int main(void) {
  printf("%d", MAX_LEVEL);
  return 0;
}`,
  stdlib: `#include <stdio.h>
#include <stdlib.h>
int main(void) {
  int value = atoi("42");
  printf("%d", value);
  return 0;
}`,
  "best-practices": `#include <stdio.h>
int clampLevel(int level) {
  if (level > 99) return 99;
  if (level < 1) return 1;
  return level;
}
int main(void) {
  printf("%d", clampLevel(120));
  return 0;
}`
};

for (const id of expectedIds) {
  const issue = api.inspectCBeforeRun(samples[id], api.chapterById[id]);
  assert(issue === "", `${id} should pass, got: ${issue}`);
  const output = api.simulateCOutput(samples[id], api.chapterById[id]);
  assert(output === api.chapterById[id].output, `${id} output expected ${api.chapterById[id].output}, got ${output}`);
}

const injected = api.autoInjectStdIoHeader('int main(void) { printf("Hi"); return 0; }');
assert(/^#include <stdio\.h>/.test(injected), "C preprocessing should add stdio.h when printf is used without include");
assert(api.normalizeProgramOutput("Hello\n\n") === "Hello", "program output comparison should ignore trailing whitespace");
assert(api.compareProgramOutput("Hello\n", "Hello").ok, "output comparison should allow trailing newline differences");
assert(api.compareProgramOutput("Wrong", "Right").message.includes("预期输出"), "output mismatch should explain expected and actual output");
const initialGameData = api.createInitialGameData();
assert(initialGameData.progress.learned.length === 0, "initial game data should have no learned lessons");
assert(initialGameData.codeInventory.length === 0, "initial game data should have zero fragments");
assert(initialGameData.worldVariables.door_locked === true, "initial game data should relock the gate");

const missingInclude = `int main(void) {
  printf("Hello, C World!");
  return 0;
}`;
assert(api.inspectCBeforeRun(missingInclude, api.chapterById.hello).includes("第1行"), "missing include should report line 1");
const looseVariableSolution = `#include <stdio.h>
int main(void) {
  int score = 7;
  printf("%d", score);
  return 0;
}`;
assert(api.inspectRunnableCBeforeRun(looseVariableSolution, api.chapterById.variables) === "", "runtime judge should allow different variable names when C syntax is runnable");
assert(api.isLenientChallengePass(looseVariableSolution, api.chapterById.variables, "7"), "runtime judge should pass approximate runnable C solutions");
const syntaxBrokenSolution = `#include <stdio.h>
int main(void) {
  int score = 7
  printf("%d", score);
  return 0;
}`;
assert(api.inspectRunnableCBeforeRun(syntaxBrokenSolution, api.chapterById.variables).includes("缺少分号"), "runtime judge should still reject real syntax errors");

const qualityMarkers = [
  "Press Start 2P",
  "id=\"hpMeter\"",
  "id=\"mpMeter\"",
  "id=\"cardAlbumOverlay\"",
  "id=\"achievementOverlay\"",
  "id=\"resetCodeButton\"",
  "id=\"editorStatusText\"",
  "class=\"pixel-screw",
  "class AudioManager",
  "function createPlayerAnimations",
  "function spawnCodeParticles",
  "function showSkillCardReward",
  "function validateInWorker",
  "function insertEquippedSnippet",
  "function renderCardAlbum",
  "function renderAchievements",
  "function flashErrorLine",
  "id=\"bigPass\""
];

for (const marker of qualityMarkers) {
  assert(html.includes(marker), `missing quality marker: ${marker}`);
}

const menuMarkers = [
  "id=\"mainMenuOverlay\"",
  "id=\"pauseMenuOverlay\"",
  "id=\"settingsPanel\"",
  "id=\"loadingOverlay\"",
  "id=\"menuFxCanvas\"",
  "id=\"menuHighlight\"",
  "data-menu-action=\"start\"",
  "data-menu-action=\"continue\"",
  "data-menu-action=\"settings\"",
  "id=\"hudProgressFill\"",
  "id=\"hudQuickSlots\"",
  "id=\"bottomHintBar\"",
  "class MenuManager",
  "function applyEditorTheme",
  "function updateHudQuickSlots",
  "function showLoadingTransition",
  "function showFatalError",
  "window.addEventListener(\"error\""
];

for (const marker of menuMarkers) {
  assert(html.includes(marker), `missing menu marker: ${marker}`);
}

assert(/const\s+STORAGE\s*=\s*\{[\s\S]*cards:[\s\S]*achievements:/m.test(html), "progress storage should include cards and achievements");
assert(/lineNumbers[\s\S]*error-line/m.test(html), "editor should support line-specific error highlighting");
assert(/const\s+STORAGE\s*=\s*\{[\s\S]*settings:/m.test(html), "storage should include settings");
assert(/Worker[\s\S]*3000|3000[\s\S]*Worker/m.test(html), "code validation should use a worker-style 3 second timeout guard");
assert(/frames:\s*\[0,\s*1,\s*2,\s*3/m.test(html), "player animations should use at least four frames per direction");
assert(/imageSmoothingEnabled\s*=\s*false/m.test(html), "canvas should disable smoothing for crisp pixel rendering");
assert(/\.theme-preview\s*\{[\s\S]*flex-wrap:\s*wrap/m.test(html), "theme cards should wrap instead of overflowing horizontally");
assert(/\.theme-swatch\s*\{[\s\S]*flex:\s*1\s+1\s+140px/m.test(html), "theme cards should have responsive flex basis");
assert(/\.theme-swatch:not\(\.active\)/m.test(html), "unselected theme cards should be visually muted");
assert(/@media\s*\(max-width:\s*640px\)[\s\S]*\.setting-row\s*\{[\s\S]*grid-template-columns:\s*1fr/m.test(html), "settings rows should collapse on narrow screens");
assert(/\.settings-panel::before[\s\S]*CODE AWAKENER/m.test(html), "settings panel should use CODE AWAKENER as a subtle watermark");
assert(/--neon-blue:[\s\S]*--neon-purple:/m.test(html), "UI should expose neon blue/purple theme colors");
assert(/function createCodeRainLayer/m.test(html), "map should include a code rain atmosphere layer");
assert(/function startGatePulse/m.test(html), "compile gates should have breathing neon pulse");
assert(/playBgm\(mode = "town"\)/m.test(html), "audio manager should support named BGM modes");
assert(/ding\(\)/m.test(html), "audio manager should expose an interaction ding SFX");
assert(/settingsOpen\(\)/m.test(html), "audio manager should expose a settings-open SFX");
assert(/id="terminalBurst"/m.test(html), "interaction feedback should include a terminal-style code burst overlay");
assert(/id="glitchOverlay"/m.test(html), "compile feedback should include a glitch overlay");
assert(/function showTerminalBurst/m.test(html), "interactions should show terminal code strings");
assert(/function triggerGlitchEffect/m.test(html), "compile gates should trigger a screen glitch effect");
assert(/function showCodeCombatLine/m.test(html), "challenge success should show a typewriter code line");
assert(/function spawnPlayerTrail/m.test(html), "player movement should spawn a subtle blue pixel trail");
assert(/function spawnBinaryGateParticles/m.test(html), "compile gates should emit sparse binary particles");
assert(/function createStoneScanline/m.test(html), "stones should have a scanning-line effect");
assert(/function updateInteractiveFocus/m.test(html), "nearby interactables should brighten and glow");
assert(/\.glass-panel\s*\{[\s\S]*border-radius:\s*22px/m.test(html), "UI panels should use modern rounded frosted glass");
assert(/\.settings-panel\s*\{[\s\S]*background:\s*linear-gradient[\s\S]*rgba\(8,\s*13,\s*23,\s*0\.42\)/m.test(html), "settings panel should be a lighter frosted floating window");
assert(/\.code-meter/m.test(html), "HP/MP should use code-style progress bars");
assert(/\.code-meter::before[\s\S]*content:\s*\"\\|\"/m.test(html), "code meters should have cursor-like end caps");
assert(/\.glitch-overlay\.active/m.test(html), "glitch overlay should have an active animation state");
assert(/\.terminal-burst\.show/m.test(html), "terminal burst should have a visible animation state");
assert(/id="postProcessOverlay"/m.test(html), "scene should include a global post-processing overlay");
assert(/id="crtNoiseCanvas"/m.test(html), "scene should include a CRT noise canvas");
assert(/id="compileMatrixCanvas"/m.test(html), "compile transition should include a matrix rain canvas");
assert(/\.post-process-overlay[\s\S]*radial-gradient/m.test(html), "post-process overlay should provide vignette and color grading");
assert(/mix-blend-mode:\s*screen/m.test(html), "post-processing should use subtle screen blending for bloom/noise");
assert(/CINEMATIC_EFFECT_LEVELS\s*=\s*Object\.freeze/m.test(html), "cinematic effects should define progress-driven upgrade levels");
assert(/function getCinematicEffectLevel/m.test(html), "cinematic effects should derive strength from collected fragments");
assert(/function updateCinematicProgression/m.test(html), "cinematic effects should update as the player collects fragments");
assert(/function createVolumetricLightBeams/m.test(html), "compile gates and stones should create volumetric light beams");
assert(/function updateVolumetricLightBeams/m.test(html), "volumetric light beams should animate with cinematic progress");
assert(/function createPixelScreenReflections/m.test(html), "scene should provide lightweight pixel screen-space reflections");
assert(/function updatePixelScreenReflections/m.test(html), "pixel reflections should react to cinematic progress");
assert(/function createDynamicStardust/m.test(html), "scene should include dynamic stardust particles");
assert(/function updateDynamicStardust/m.test(html), "stardust should gather and disperse around player movement");
assert(/function createGroundEnergyPulse/m.test(html), "compile paths should include pulsing ground energy rings");
assert(/function triggerCinematicCompileBurst/m.test(html), "successful compile should trigger a cinematic energy burst");
assert(/function triggerCinematicPickupBurst/m.test(html), "fragment pickup should trigger spiral light and shield feedback");
assert(/function updateInteractionHalo/m.test(html), "interactable targets should light a rotating player halo");
assert(/\.glass-panel::after[\s\S]*cinematicBorderFlow/m.test(html), "UI panels should have animated flowing light borders");
assert(/function drawCrtNoise/m.test(html), "CRT noise should be drawn dynamically");
assert(/function triggerCompileTransition/m.test(html), "compile gates should trigger a matrix transition");
assert(/function createBinaryRing/m.test(html), "compile gates should create a binary particle ring");
assert(/function updateBinaryRings/m.test(html), "binary particle rings should animate near gates");
assert(/function createTreeSwayTweens/m.test(html), "trees should receive slow sway animation");
assert(/function createWindowGlow/m.test(html), "house windows should have breathing glow");
assert(/function compileSuccess\(\)/m.test(html), "audio manager should expose compile success SFX");
assert(/filter:\s*contrast\(1\.16\)\s*saturate\(0\.92\)\s*hue-rotate\(215deg\)/m.test(html), "game canvas should use cold cyber-dark color grading");
assert(/id="memoryReadOverlay"/m.test(html), "knowledge shard pickup should include a memory read overlay");
assert(/function showMemoryReadEffect/m.test(html), "knowledge shard pickup should show code being read into memory");
assert(/function createStoneCodePuzzle/m.test(html), "stone interaction should show a keyword-completion code puzzle");
assert(/function completeStoneCodePuzzle/m.test(html), "stone code puzzle should complete before unlocking the gate");
assert(/function repairFragmentProgressState/m.test(html), "fragment progress should repair duplicated or legacy save data");
assert(/function getCourseFragmentProgressText/m.test(html), "fragment UI should use course fragment progress instead of raw inventory length");
assert(/const alreadyCollected = gameState\.progress\.collectedFragmentKeys\.includes\(fragmentKey\)/m.test(html), "fragment collection should dedupe by unique fragment key, not keyword text");
assert(/if \(!gameState\.codeInventory\.includes\(fragment\.keyword\)\) gameState\.codeInventory\.push\(fragment\.keyword\)/m.test(html), "fragment inventory should keep keyword strings unique");
assert(/dom\.infoFragmentText\.textContent = `碎片: \$\{getCourseFragmentProgressText\(\)\}`/m.test(html), "side menu fragment count should never exceed the 14-course total");
assert(/if \(interaction\?\.type === "lesson"\)[\s\S]*else tryFillStoneBlank\(this, interaction\.chapter\.id\)/m.test(html), "pressing E near a stone should try to fill the code blank directly");
assert(/gate\.setActive\(true\)\.setVisible\(true\)\.setAlpha\(0\.34\)\.setTint\(0x64748b\)/m.test(html), "compile gates should remain visible as locked silhouettes before activation");
assert(/const gateHintText = this\.add\.text[\s\S]*先修复石碑/m.test(html), "locked compile gates should show an explicit repair-stone hint");
assert(/if \(nearGate && !isLearned\(chapter\.id\)\)[\s\S]*return \{ type: "locked", chapter \}/m.test(html), "standing at an inactive compile gate should produce locked feedback");
assert(/function createNpcPatrol/m.test(html), "scene should include a small NPC patrol/life animation");
assert(/function createAmbientCodeMotes/m.test(html), "world should include floating ambient code particles");
assert(/function updateDayNightCycle/m.test(html), "scene should include slow day-night lighting changes");
assert(/function spawnDustParticles/m.test(html), "player movement should create subtle dust particles");
assert(/\.memory-read-overlay\.show/m.test(html), "memory read overlay should have an animated visible state");
assert(/\.stone-code-puzzle/m.test(html), "stone code puzzle text should have dedicated styling");
assert(/\.hud-critical/m.test(html), "HUD meters should expose a critical warning state");
assert(/\.hud-button:hover[\s\S]*scale\(1\.05\)/m.test(html), "UI buttons should scale on hover");
assert(/\.hud-button:active[\s\S]*scale\(0\.96\)/m.test(html), "UI buttons should squash on press");
assert(/id="bootCommandInput"/m.test(html), "intro should include a command-style start input");
assert(/start_game\.exe/m.test(html), "intro command should use start_game.exe");
assert(/function showSpawnIntro/m.test(html), "game start should show a spawn ritual");
assert(/Player spawned successfully/m.test(html), "spawn intro should type a player spawned message");
assert(/C_COURSE_INTRO_GUIDE\s*=\s*Object\.freeze/m.test(html), "new game should define a C course intro guide from develop.fan outline");
assert(/C 语言简介/m.test(html), "new game intro should include the website C language introduction heading");
assert(/C 语言概述/m.test(html), "new game intro should mention the website C language overview section");
assert(/function showNewPlayerCourseIntro/m.test(html), "new game should open an explicit beginner guide after spawn");
assert(/showSpawnIntro\(\);\s*showNewPlayerCourseIntro/m.test(html), "starting a game should chain spawn ritual into the C course beginner guide");
assert(/function updateCinematicCamera/m.test(html), "camera should use cinematic lag and look-ahead");
assert(/function updateSmoothFacing/m.test(html), "player direction changes should be smoothed");
assert(/function applyWalkBob/m.test(html), "player walking should include a subtle bob");
assert(/function updateAudioMix/m.test(html), "audio should dynamically mix layers based on scene state");
assert(/startLayeredBgm/m.test(html), "audio manager should support layered BGM");
assert(/setExplorationIntensity/m.test(html), "audio manager should expose exploration intensity control");
assert(/pickupSpark\(\)/m.test(html), "audio manager should include pickup sparkle SFX");
assert(/function createGuidanceLine/m.test(html), "scene should include subtle guidance toward first objective");
assert(/function updateGuidanceLine/m.test(html), "guidance line should update without text spam");
assert(/DATA_BUS_MAP_LAYOUT\s*=\s*Object\.freeze/m.test(html), "main C-world map should use a linear data-bus layout");
assert(/function createLinearChapterPositions/m.test(html), "chapter stones should be laid out on a no-branch mainline");
assert(/function createDataBusFlowMap/m.test(html), "scene should draw a flowchart-like data bus between levels");
assert(/function updateDataBusProgress/m.test(html), "data bus should update completed/current/locked path states");
assert(/function drawLevelNodeArena/m.test(html), "each level should sit in a large glowing node arena");
assert(/function createChapterNumberMarker/m.test(html), "each stone should have a visible glowing chapter number");
assert(/function createStageVisibilityVeil/m.test(html), "locked future stages should be hidden by staged fog/occlusion");
assert(/id="worldNodeProgressHud"/m.test(html), "HUD should include a compact node-based world progress strip");
assert(/世界一：C语言基础/.test(html) && /出口/.test(html), "map should label the entrance and final compile exit");
assert(/NEON_CYBER_BOOK_STYLE/m.test(html), "visual direction should switch to neon cyber book style");
assert(/function drawNeonHoodiePlayer/m.test(html), "player should be rendered as a neon outlined hoodie character");
assert(/function drawSignatureOperatorAvatar/m.test(html), "player should have a distinctive signature avatar silhouette");
assert(/operator-core/g.test(html), "player visual identity should include an operator core marker");
assert(/signature-cape/g.test(html), "player should have an asymmetric signature cape so it is readable at a distance");
assert(/operator-antenna/g.test(html), "player should have a unique antenna silhouette unlike ordinary NPCs");
assert(/PLAYER_SKIN_PRESETS\s*=\s*Object\.freeze/m.test(html), "player should expose three neon silhouette skin presets");
assert(/hackerGreen[\s\S]*neonBlue[\s\S]*shadowPurple/m.test(html), "skin presets should include hacker green, neon blue, and shadow purple");
assert(/id="skinSelect"/m.test(html), "main menu should let the player choose an initial skin");
assert(/function applyPlayerSkin/m.test(html), "selected player skin should be applied to the geometric avatar");
assert(/function shouldRedrawPlayerSkin/m.test(html), "player skin redraw should be gated by actual skin changes");
assert(/function getPlayerTextureKey/m.test(html), "player textures should use skin-specific keys");
assert(/function ensurePlayerSkinTextures/m.test(html), "switching skins should create new skin textures instead of deleting active textures");
assert(/function rebuildPlayerSkinTextures/m.test(html), "skin switching should rebuild cached textures to avoid green/purple swaps");
assert(/setTexture\?\.\(getPlayerTextureKey\(toFacing,\s*1\)\)/m.test(html), "facing changes should use the active skin texture key");
assert(/setTexture\(getPlayerTextureKey\(gameState\.scene\.lastFacing\s*\|\|\s*"down",\s*1,\s*nextSkinId\)\)/m.test(html), "skin switching should swap to a skin-specific live texture");
assert(/function drawVectorFlatWorld/m.test(html), "world should use vector-flat terrain and grid lines");
assert(/function drawVectorHouse/m.test(html), "buildings should use modern vector-flat geometry");
assert(/function drawVectorStone/m.test(html), "stones should use modern vector-flat geometry");
assert(/function drawVectorGate/m.test(html), "compile gates should use modern vector-flat geometry");
assert(/class BloomVignettePostProcess/m.test(html), "visual stack should include bloom and vignette post-processing");
assert(/function applyGlobalPostProcessing/m.test(html), "post-processing should be applied as a global visual layer");
assert(/type:\s*Phaser\.WEBGL/m.test(html), "Phaser renderer should force WebGL for the remastered visual pass");
assert(/antialias:\s*true/m.test(html), "WebGL renderer should enable antialiasing");
assert(/pixelArt:\s*false/m.test(html), "remastered renderer should disable raw pixel-art scaling");
assert(/CINEMATIC_RENDER_MODES\s*=\s*Object\.freeze/m.test(html), "cinematic render modes should be centralized");
assert(/class CinematicRenderPipeline/m.test(html), "cinematic render pipeline should coordinate bloom, LUT, SSR, fog, and degradation");
assert(/function applyDynamicLutToneMapping/m.test(html), "dynamic LUT tone mapping should exist");
assert(/function createProceduralGrassField/m.test(html), "GPU-style procedural grass field should be created");
assert(/function updateProceduralGrassField/m.test(html), "procedural grass should react to player movement");
assert(/function spawnFractalNoiseShatter/m.test(html), "fractal-noise shatter effect should exist");
assert(/function updateScreenSpaceReflections/m.test(html), "screen-space reflection approximation should update");
assert(/function updateDepthFogSystem/m.test(html), "depth and height fog should update by area");
assert(/function updateVolumetricSdfShadows/m.test(html), "soft SDF shadow approximation should update");
assert(!/id="cinematicQualitySelect"/m.test(html), "visual settings should not expose the removed cinematic quality selector");
assert(!/id="frameCapSelect"/m.test(html), "visual settings should not expose an FPS cap selector");
assert(/id="lutStyleSelect"/m.test(html), "visual settings should expose LUT style selector");
assert(/id="ssrToggle"/m.test(html) && /id="depthFogToggle"/m.test(html) && /id="proceduralGrassToggle"/m.test(html), "visual settings should expose SSR, fog, and grass toggles");
assert(/function autoDegradeCinematicEffects/m.test(html), "renderer should auto-degrade effects under low FPS");
assert(/fps\s*<\s*CINEMATIC_RENDER_BUDGET\.lowFpsThreshold[\s\S]*ssr/m.test(html), "auto degrade should disable SSR first below the FPS budget");
assert(/开发注意事项[\s\S]*避免白屏/m.test(html), "HTML should document white-screen prevention and extension rules");
assert(/SAFE_MODE_QUERY_PARAM\s*=\s*"safeMode"/m.test(html), "runtime should expose a URL safe-mode query parameter");
assert(/ULTIMATE_QUALITY_PROFILES\s*=\s*Object\.freeze/m.test(html), "quality tiers should be centralized for low/medium/high rendering");
assert(!/value="ultra"/m.test(html), "settings should not expose the removed ultra/cinematic quality option");
assert(!/ultra:\s*\{/m.test(html), "render profiles should not keep a hidden ultra quality tier");
assert(/function normalizeRenderQuality/m.test(html), "old ultra/cinematic save values should be normalized to high");
assert(/class RenderSafetyManager/m.test(html), "render effects should be isolated by a safety manager");
assert(/function safeRunEffect/m.test(html), "effects should run through a try-catch guard");
assert(/function enterSafeMode/m.test(html), "runtime should be able to enter a stable safe mode");
assert(/function chooseInitialQualityProfile/m.test(html), "quality profile should choose a stable high default unless safe mode is required");
assert(/fps\s*<\s*22[\s\S]*disableEffect/m.test(html), "effects should only be disabled automatically after severe FPS drops");
assert(/console\.warn\(`\[FX:\$\{name\}\]/m.test(html), "failed effects should warn and auto-disable instead of crashing");
assert(/function initializeGameSafely/m.test(html), "Phaser boot should be wrapped with a safe fallback");
assert(/const SafeExecute\s*=\s*Object\.freeze/m.test(html), "runtime should expose a unified SafeExecute guard");
assert(/class SafeBehaviour/m.test(html), "runtime should expose a SafeBehaviour cleanup base");
assert(/function SafeLoadScene/m.test(html), "scene loading should go through SafeLoadScene");
assert(/const ErrorLogManager\s*=\s*Object\.freeze/m.test(html), "error logs should be managed centrally");
assert(/ErrorLogManager\.cleanup\(\)/m.test(html), "startup should prune old error logs");
assert(/collectCodeKeyword[\s\S]*SafeExecute\.run/m.test(html), "fragment collection should be protected by SafeExecute");
assert(/compileAndRunCProgram[\s\S]*SafeExecute\.runAsync/m.test(html), "compiler execution should be protected by SafeExecute");
assert(/let codeGenesisCompletionInFlight\s*=\s*false/m.test(html), "code genesis completion should guard against duplicate handoff");
assert(/safeRunEffect\("cinematicRenderPipeline"/m.test(html), "cinematic render pipeline should be guarded");
assert(/safeRunEffect\("proceduralGrass"/m.test(html), "procedural grass should be guarded");
assert(/safeRunEffect\("weatherDirector"/m.test(html), "weather director should be guarded");
assert(/registerOfflineServiceWorker\(\)[\s\S]*catch/m.test(html), "offline worker registration should be safely caught");
assert(/WebGL SSR is approximated/m.test(html), "unstable SSR should document its stable approximation and future upgrade path");
assert(/ULTIMATE_EXPERIENCE_MODULES\s*=\s*Object\.freeze/m.test(html), "ultimate experience layer should declare its module map");
assert(/class UnifiedInputPromptManager/m.test(html), "game should unify keyboard, mouse, touch, and gamepad prompt switching");
assert(/function detectActiveInputDevice/m.test(html), "input layer should detect the active input device");
assert(/function updateGamepadUiHints/m.test(html), "gamepad hints should update without changing core gameplay");
assert(/class Hd2dWorldDirector/m.test(html), "HD-2D world director should coordinate weather, day-night, and cinematic events");
assert(/function updateDynamicWeatherSystem/m.test(html), "world director should update rain, snow, fog, sandstorm, and clear states");
assert(/function applyLearningProgressWorldMorph/m.test(html), "world appearance should morph as learning progress increases");
assert(/function triggerStoryCinematicBars/m.test(html), "major story events should support cinematic letterbox bars");
assert(/id="cinematicLetterbox"/m.test(html), "cinematic letterbox overlay should exist");
assert(/class AdaptiveSymphonicAudioDirector/m.test(html), "audio should use a symphonic adaptive director layer");
assert(/function updateSpatialReverb/m.test(html), "audio should update spatial reverb by context");
assert(/function playMaterialFootstep/m.test(html), "movement should support material-aware footsteps");
assert(/function playEmotionalNpcMumble/m.test(html), "NPC dialogue should include emotional mumble sound support");
assert(/NPC_STORY_ARCS\s*=\s*Object\.freeze/m.test(html), "NPC story arcs should be data driven");
assert(/class StoryArcManager/m.test(html), "story arc manager should handle NPC arcs and memory cutscenes");
assert(/背叛[\s\S]*牺牲[\s\S]*救赎/m.test(html), "main story arc should include betrayal, sacrifice, and redemption beats");
assert(/class IdeExperienceManager/m.test(html), "editor should expose a professional IDE experience manager");
assert(/function createEditorMinimap/m.test(html), "editor should include a minimap");
assert(/function toggleCodeFold/m.test(html), "editor should support code folding");
assert(/function expandEmmetSnippet/m.test(html), "editor should support lightweight Emmet expansion");
assert(/id="editorMinimap"/m.test(html) && /id="editorNotesPanel"/m.test(html) && /id="editorRichConsole"/m.test(html), "editor UI should include minimap, notes, and rich console surfaces");
assert(/class AchievementHall3D/m.test(html), "achievement hall should render trophies as a 3D-style collection");
assert(/id="trophyHallViewport"/m.test(html), "achievement overlay should include a 3D trophy viewport");
assert(/class SaveSlotManager/m.test(html), "save system should support multiple manual save slots");
assert(/const SAVE_SLOT_COUNT\s*=\s*3/m.test(html), "save system should expose three manual save slots");
assert(/id="saveSlotGrid"/m.test(html), "settings save panel should render save slots");
assert(/function showWorldLoreLoadingSequence/m.test(html), "startup should show a lore-driven animated loading sequence");
assert(/registerOfflineServiceWorker\(\)/m.test(html), "offline service worker should be registered for repeat launches");
assert(/id="infoMenuToggle"/m.test(html), "playfield should expose only a compact info menu toggle");
assert(/id="keymapGlassBar"/m.test(html), "playfield should expose a transparent top keymap bar");
assert(/class="keymap-glass-bar"/m.test(html), "keymap bar should use the non-blocking glass style");
assert(/pointer-events:\s*none;[\s\S]*opacity:\s*0\.78/m.test(html), "keymap bar should not block the game view or pointer input");
assert(/renderTopKeymap\(\)/m.test(html), "shortcut manager should render the top keymap from current bindings");
assert(/flashTopKeymap\(event\)/m.test(html), "shortcut manager should animate key feedback when the player presses a mapped key");
assert(/shortcutManager\.flashTopKeymap\(event\)/m.test(html), "global keydown should feed visual keymap feedback");
assert(/id="infoSideMenu"/m.test(html), "persistent HUD data should live in the collapsible side info menu");
assert(/id="infoTaskText"/m.test(html) && /id="infoFragmentText"/m.test(html), "side info menu should include task and fragment status");
assert(/id="infoHpText"/m.test(html) && /id="infoMpText"/m.test(html), "side info menu should include HP and MP");
assert(/id="infoEquipText"/m.test(html), "side info menu should explain equipped fragments");
assert(/id="textSpeedSlider"/m.test(html), "side info menu should include text speed control");
assert(/id="manualSaveButton"/m.test(html), "side info menu should include a manual save button");
assert(/manualSaveButton\?\.addEventListener\("click"[\s\S]*saveGame\(\)[\s\S]*进度已手动保存/m.test(html), "manual save button should save the game and show island feedback");
assert(/Number\(gameState\.codeAccuracy\)/m.test(html), "side info menu HP should read the actual codeAccuracy state");
assert(/Number\(gameState\.hintsLeft\)/m.test(html), "side info menu MP should read the actual hintsLeft state");
assert(!/Number\(gameState\.hp\)/m.test(html) && !/Number\(gameState\.mp\)/m.test(html), "side info menu should not read undefined hp/mp fields");
assert(/Object\.values\(gameState\.equipped \|\| {}\)/m.test(html), "side info menu equipment text should read equipped skill cards");
assert(/function getDialogTextDelay/m.test(html), "dialog typewriter speed should be driven by settings");
assert(/function generateNpcPortraitDataUrl/m.test(html), "dialogue should generate high-resolution NPC portraits locally");
assert(/canvas\.width\s*=\s*128[\s\S]*canvas\.height\s*=\s*128/m.test(html), "NPC portrait generator should draw at least 128x128 images");
assert(/islandToastQueue/m.test(html) && /function renderNextIslandToast/m.test(html), "dynamic-island toasts should be queued");
assert(/#hud \.hud-top[\s\S]*display:\s*none !important/m.test(html), "legacy persistent HUD should be hidden from the central canvas");
assert(/#questTracker,[\s\S]*display:\s*none !important/m.test(html), "legacy quest tracker should be hidden as a persistent playfield widget");
assert(/function updateInfoSideMenu/m.test(html), "side info menu should refresh from runtime state");
assert(/function toggleInfoSideMenu/m.test(html), "side info menu should be collapsible");
assert(/id="questRewardToast"/m.test(html), "task completion should show a reward popup");
assert(/id="characterProfileButton"/m.test(html), "character profile entry may remain in DOM but must be hidden with legacy HUD");
assert(/id="characterProfileOverlay"/m.test(html), "character profile should show player attributes and collection progress");
assert(/function renderCharacterProfile/m.test(html), "character profile should render cards, achievements, fragments, and chapter counts");
assert(/已解锁成就",\s*`\$\{gameState\.achievements\.length\}\/\$\{achievementCatalog\.length\}`/m.test(html), "character profile should use the achievement catalog total instead of an undefined variable");
assert(!/\$\{achievements\.length\}/m.test(html), "pressing C should not crash on an undefined achievements variable");
assert(/class="hud-quick-slots quick-card-island"/m.test(html), "quick card slot DOM may remain for logic but should be hidden by the no-persistent-HUD rule");
assert(/function getSkillCardUsageDescription/m.test(html), "skill cards should explain their gameplay purpose in detail");
assert(/class="card-effect"/m.test(html), "card album should show detailed card effects");
assert(/Ctrl\+\$\{slot\.dataset\.slot\}/m.test(html), "quick card slot tooltips should explain editor keyboard usage");
assert(/class="hud-chip ide-status-bar dynamic-island-hint"/m.test(html), "legacy guide prompt DOM can remain for shortcut text");
assert(/#hud #bottomHintBar,[\s\S]*display:\s*none !important/m.test(html), "legacy guide prompt should not be a persistent playfield element");
assert(/NPC_TYPES\s*=\s*Object\.freeze/m.test(html), "NPC system should define NPC types");
assert(/TASK_TYPES\s*=\s*Object\.freeze/m.test(html), "task system should define task types");
assert(/TASK_STATUS\s*=\s*Object\.freeze/m.test(html), "task system should define task statuses");
assert(/NPC_DATA\s*=\s*Object\.freeze/m.test(html), "map should define core NPC data");
assert(/mentor[\s\S]*merchant[\s\S]*lost[\s\S]*guard[\s\S]*easterEgg/m.test(html), "map should include the five required NPC roles");
assert(/QUEST_DATA\s*=\s*Object\.freeze/m.test(html), "task system should define quest data");
assert(/class QuestManager/m.test(html), "task system should have a QuestManager");
assert(/collect_basic_fragments/m.test(html), "new player task should collect three basic syntax fragments");
assert(/function createCoreNpcs/m.test(html), "scene should create core NPCs on the map");
assert(/function updateNpcQuestIndicators/m.test(html), "NPCs should show task-state indicators");
assert(/const nameLabel = scene\.add\.text\(0, -63, data\.name \|\| "NPC"/m.test(html), "NPCs should render their names above their heads");
assert(/function renderQuestTracker/m.test(html), "quest tracker UI should render current progress");
assert(/function showQuestReward/m.test(html), "completed quests should show a reward window");
assert(/questManager\.acceptTask\("collect_basic_fragments"/m.test(html), "new game should auto accept the beginner collect quest");
assert(/redScarfHermit/m.test(html), "map should include a hidden red-scarf NPC with no quest reward");
assert(/嘿，你居然找到我了。这里什么都没有，只是想告诉你：你做得很好。/m.test(html), "hidden red-scarf NPC should deliver the warm first-discovery line");
assert(/function spawnHeartParticle/m.test(html), "hidden NPC interaction should spawn a floating heart particle");
assert(/function spawnGrassFootprint/m.test(html), "player movement should leave faint temporary footprints on grass");
assert(/function updateNpcWorldReactions/m.test(html), "NPC dialogue should react after major task completion");
assert(/function growMilestoneFlower/m.test(html), "fragment milestones should grow a flower near the stone");
assert(/function createPlayerRoomEntrance/m.test(html), "map should include a quiet player room entrance");
assert(/function enterPlayerRoom/m.test(html), "player should be able to enter the personal room");
assert(/function interactWithRoomBed/m.test(html), "personal room bed should trigger a short first-person rest");
assert(/function openDeskCodeReview/m.test(html), "personal room desk should show collected code fragments as cards");
assert(/function offerFireplaceFragmentRitual/m.test(html), "personal room fireplace should support the code-fragment ritual");
assert(/function updateRoomMemorabilia/m.test(html), "personal room should gain wall memorabilia after chapters");
assert(/function createAiCompanion/m.test(html), "early progress should unlock a shoulder AI companion");
assert(/function updateAiCompanion/m.test(html), "AI companion should idle-talk, hint, and evolve over time");
assert(/function evolveAiCompanion/m.test(html), "AI companion should visually evolve with collected fragments");
assert(/function createMossyDeveloperStone/m.test(html), "deep map should include a hidden mossy developer stone");
assert(/谢谢你来到这里/m.test(html), "developer stone should include a short personal thank-you message");
assert(/—— 杀戮/m.test(html), "developer stone should sign the message as the solo creator");
assert(/function createSignatureLandmark/m.test(html), "world should include a memorable distant landmark");
assert(/function createRegionalTintZones/m.test(html), "world should define unique color moods for regions");
assert(/function updateLivingWorldMotion/m.test(html), "world should include slow ambient motion beyond the player");
assert(/function showQuestDialogueChoices/m.test(html), "quest acceptance should offer lightweight dialogue choices");
assert(/CHOICE_NODES\s*=\s*Object\.freeze/m.test(html), "game should define key narrative choice nodes");
assert(/class NarrativeMemory/m.test(html), "game should record narrative choices in memory");
assert(/function presentChoiceNode/m.test(html), "game should present three-option key dialogue choices");
assert(/\/\/ 这条路径将被铭记。/m.test(html), "choice feedback should print the remembered-path comment");
assert(/function replayRememberedChoices/m.test(html), "late game should replay remembered choices");
assert(/ENDING_VARIANTS\s*=\s*Object\.freeze/m.test(html), "game should define multiple hidden ending variants");
assert(/function resolveHiddenEnding/m.test(html), "ending should depend on the player's choice combination");
assert(/守护者[\s\S]*破译者[\s\S]*永远的旅人/m.test(html), "hidden endings should include guardian, decoder, and traveler variants");
assert(/function createOldComputerTerminal/m.test(html), "map should include an old computer meta interaction");
assert(/id="metaOsWindow"/m.test(html), "old computer should open a simulated OS desktop");
assert(/你目前在玩《代码觉醒者》/m.test(html), "meta desktop should include a self-referential game icon");
assert(/function createDeveloperNpc/m.test(html), "late game should include a developer NPC");
assert(/function openRealityPasswordPuzzle/m.test(html), "meta puzzle should use a real-world date or time password");
assert(/function rememberNpcInteraction/m.test(html), "NPCs should remember the player's last interaction tone");
assert(/function leaveCollectedFragmentImprint/m.test(html), "collected fragments should leave faint map imprints");
assert(/function renderEndingTimeMarks/m.test(html), "ending should show first and last play timestamps");
assert(/function drawCodeLogGround/m.test(html), "background should be drawn as a low-opacity scrolling code log");
assert(/function createKeywordTrees/m.test(html), "trees should be composed from C keywords at close range");
assert(/function updatePlayerCodeFlow/m.test(html), "player body should carry subtle moving code flow");
assert(/function applySilentWhisperNarrative/m.test(html), "scene narration should support silent whisper mode");
assert(/编译器的低语，比月光更轻。/m.test(html), "NPC whispers should include poetic silent dialogue");
assert(/class="npc-code-window npc-head-island"/m.test(html), "NPC dialogue should render as a dynamic island above the NPC instead of a full-screen modal");
assert(/function positionNpcDialogIsland/m.test(html), "NPC dialogue island should be positioned from the NPC world coordinate");
assert(/openNpcCodeWindow\("导师终端"[\s\S]*npc\.container/m.test(html), "mentor dialogue should anchor the island to the NPC head");
assert(/class="choice-window choice-island"/m.test(html), "player dialogue choices should use a compact dynamic-island popup");
assert(/\.choice-window\.choice-island\s*\{[\s\S]*inset:\s*auto/m.test(html), "choice island should avoid full-screen coverage");
assert(/id="choiceFeedbackIsland"/m.test(html), "player choices should produce a non-blocking dynamic-island feedback chip");
assert(/function showChoiceFeedbackIsland/m.test(html), "choice feedback should be shown as a compact island");
assert(/function playLongCompileOvertone/m.test(html), "compile success should support a long decaying electronic overtone");
assert(/function enterSilentSoundZone/m.test(html), "safe zones should thin music into ambient silence");
assert(/function focusStoneMonoField/m.test(html), "approaching key stones should narrow the sound field to mono");
assert(/const FRAGMENT_COLLECT_RADIUS\s*=\s*40/m.test(html), "knowledge fragments should auto-collect within a 40px radius");
assert(/function createCodeKeywordFragments/m.test(html), "map should spawn auto-collecting code keyword fragments");
assert(/function createKnowledgeFragmentVisual/m.test(html), "knowledge fragments should use a dedicated high-visibility visual");
assert(/function installFragmentAutoCollectOverlap/m.test(html), "fragment collection should use Phaser physics overlap");
assert(/physics\.add\.overlap\(\s*scene\.player,\s*scene\.codeFragmentGroup,\s*collectCodeKeyword/m.test(html), "fragments should auto collect through safe physics overlap");
assert(/function showFirstFragmentGuide/m.test(html), "first fragment encounter should show a collection guide");
assert(/id="fragmentHelpButton"/m.test(html), "fragment HUD should include a help button explaining fragments");
assert(!/fragment\.setInteractive\(\{ useHandCursor: true \}\)/m.test(html), "fragments should not use mouse click interaction");
assert(!/fragment\.on\("pointerdown"/m.test(html), "fragments should not register pointerdown handlers");
assert(/function collectCodeKeyword/m.test(html), "code keyword fragments should be collectible through overlap");
assert(/function tryFillStoneBlank/m.test(html), "stone blanks should be filled from collected keywords");
assert(/const hasRequiredKeyword = gameState\.codeInventory\.includes\(spec\.answer\)/m.test(html), "stone blanks should use inventory possession after auto-collection");
assert(/function getStonePuzzleSpec/m.test(html), "stone code-fill puzzle specs should be data driven");
assert(/>> Success! Code Compiled\./m.test(html), "successful code fill should print a compile success message");
assert(/function createInvisibleCapsuleHitZone/m.test(html), "interactive model clicks should use invisible capsule hit zones");
assert(/PET_CLICK_COOLDOWN_MS\s*=\s*500/m.test(html), "pet computer clicks should use a 0.5s cooldown");
assert(/function handlePetComputerClick/m.test(html), "pet computer should route clicks through cooldown-safe logic");
assert(/function lockPetIdleAfterInactivity/m.test(html), "pet computer should return to idle without interrupting animation");
assert(/function startCyberLofiBgm/m.test(html), "audio system should expose lo-fi cyber BGM startup");
assert(/function fadeMelodyLayer/m.test(html), "audio system should fade melody layer near important objects");
assert(/function typewriterTick/m.test(html), "audio system should include crisp typewriter ticks");
assert(/function invalidSoft/m.test(html), "audio system should include a soft invalid click sound");
assert(/function smoothDampCamera/m.test(html), "camera should use SmoothDamp-style follow");
assert(/function triggerMicroGlitch/m.test(html), "compile success should trigger a subtle micro glitch");
assert(!/C\+\+/m.test(html), "first world should stay strictly C language only");
assert(/function createBreathingVegetation/m.test(html), "vegetation should breathe slowly");
assert(/function createFloatingDustMotes/m.test(html), "air should contain sparse floating dust or energy motes");
assert(/function updateTemperatureShift/m.test(html), "world lighting should shift color temperature subtly");
assert(/function createPathGuidePulse/m.test(html), "critical paths should use subtle intermittent guide lines");
assert(/lastCodeRippleAt[\s\S]*<\s*900/m.test(html), "walking code ripples should be throttled and not spawn every frame");
assert(/lastAddressStepAt[\s\S]*<\s*1200/m.test(html), "memory address footsteps should be sparse instead of flooding the ground");
assert(/function playPickupBounceFlight/m.test(html), "pickup should squash, rebound, and fly toward the player");
assert(/function triggerInteractionRipple/m.test(html), "pressing interact should create a ripple around the target");
assert(/function flashHpDamage/m.test(html), "HP loss should flash red before smoothing");
assert(/function flashHpHeal/m.test(html), "HP gain should flash green and show a small number");
assert(/function triggerErrorGlitch/m.test(html), "wrong interactions should flash a red edge glitch");
assert(/function startAmbientSoundscape/m.test(html), "audio should include a quiet ambient soundscape");
assert(/function pulseMelodyLayer/m.test(html), "pickup should briefly pulse the melody layer");
assert(/function updateHudNumericRoll/m.test(html), "HUD values should roll numerically instead of snapping");
assert(/custom-code-cursor/m.test(html), "UI should use a custom code-like cursor");
assert(/function showCodePauseMenu/m.test(html), "pause menu should be presented as a code editor floating window");
assert(/function drawPauseCodeRain/m.test(html), "pause overlay should keep a subtle binary wallpaper moving");
assert(/if \(action === "cards"\) \{\s*this\.resumeGame\(\);\s*toggleCollectionOverlay\("cards", true\);\s*\}/m.test(html), "pause menu should reveal the skill card album immediately instead of hiding it behind ESC overlay");
assert(/function playFragmentMilestoneTimeline/m.test(html), "fragment milestones should use timeline cutscenes");
assert(/function playGateTransitionTimeline/m.test(html), "compile gate traversal should use a gate transition timeline");
assert(/function lockTimelineInput/m.test(html), "timeline playback should block player input");
assert(/function createRestBench/m.test(html), "world should include a quiet bench interaction");
assert(/function handleBenchRest/m.test(html), "bench interaction should shift camera and grant calm feedback");
assert(/function createWarmthStation/m.test(html), "world should include a drinking or warmth interaction point");
assert(/function createDecorativeLever/m.test(html), "world should include a harmless decorative lever");
assert(/function createCBattleEncounter/m.test(html), "battle system should reset to a C code duel mode");
assert(/function validateCBattleSnippet/m.test(html), "code duel should validate C snippets");
assert(/function renderWorldVariables/m.test(html), "world should expose key runtime variables");
assert(/function openWorldScriptEditor/m.test(html), "world variables should be editable through a script editor");
assert(/function applyWorldVariableCommand/m.test(html), "script editor should apply exposed variable commands");
assert(!/class\s+reward|class\s+block|class 关键字/m.test(html), "first C world should not reward non-C class blocks");
assert(/function playBackpackOpenRitual/m.test(html), "opening backpack should use a character ritual animation");
assert(/function playKeyItemPickupRitual/m.test(html), "key item pickup should freeze briefly and magnify the item");
assert(/function playBattleVictoryRitual/m.test(html), "battle victory should shatter enemies into fragments and leave reward light");
assert(/function playCheckpointSaveRitual/m.test(html), "checkpoints should type a small saved message");
assert(/> Saved\./m.test(html), "save ritual should type > Saved.");
assert(/function getFragmentNarrativeText/m.test(html), "fragment descriptions should reveal a fragmented narrative over progress");
assert(/那扇门后面，藏着一个被遗忘的编译错误/m.test(html), "fragment narrative should contain the requested mystery sentence");
assert(/function triggerEnvironmentalWhisper/m.test(html), "specific places should trigger contextless environmental whispers");
assert(/温度，已经低于标准了/m.test(html), "environmental whisper should include the requested line");
assert(/function npcSilentLook/m.test(html), "NPC should sometimes silently look at the player");
assert(/function unlockCodeLogPage/m.test(html), "collected code fragments should unlock code log pages");
assert(/id="codeLogOverlay"/m.test(html), "code log overlay should exist");
assert(/function renderPersonalStatsAsCode/m.test(html), "personal stats should be printed as code comments");
assert(/Total steps/m.test(html), "personal stats should include total steps");
assert(/function generateAutobiographyCodeEnding/m.test(html), "ending should generate autobiographical C code");
assert(/int main\(void\) \{/m.test(html), "autobiography ending should be expressed as C code");
assert(/class FrameScheduler/m.test(html), "runtime should centralize recurring visual work in a FrameScheduler");
assert(/const\s+frameScheduler\s*=\s*new\s+FrameScheduler\(\)/m.test(html), "runtime should create a single frame scheduler instance");
assert(/frameScheduler\.register\("crtNoise"/m.test(html), "CRT noise should be registered on the shared RAF scheduler");
assert(/frameScheduler\.register\("hudNumericRoll"/m.test(html), "HUD numeric rolling should be registered on the shared RAF scheduler");
assert(!/requestAnimationFrame\(drawCrtNoise\)/m.test(html), "CRT noise should not schedule its own independent RAF loop");
assert(/class StaticLayerCache/m.test(html), "static map layers should be cached through a dedicated cache");
assert(/function createStaticMapCache/m.test(html), "world background should support offscreen canvas caching");
assert(/document\.createElement\("canvas"\)[\s\S]*world-bg-cache/m.test(html), "static world cache should be backed by an offscreen canvas texture");
assert(/class ParticlePool/m.test(html), "frequent particles should be reused through an object pool");
assert(/function acquirePooledParticle/m.test(html), "particle system should expose pooled acquisition");
assert(/function releasePooledParticle/m.test(html), "particle system should expose pooled release");
assert(/function shouldThrottleDistantUpdate/m.test(html), "distant ambient particles should support reduced update frequency");
assert(/frameTick\s*%[\s\S]*shouldThrottleDistantUpdate/m.test(html), "scene updates should throttle far particle work by frame cadence");
assert(/class EventBus/m.test(html), "runtime should include a simple event bus for chained interactions");
assert(/eventBus\.emit\("keyword:collected"/m.test(html), "keyword pickup should publish an event instead of only direct callbacks");
assert(/eventBus\.on\("keyword:collected"/m.test(html), "HUD and logs should subscribe to keyword pickup events");
assert(/class AudioBufferPool/m.test(html), "audio manager should own a reusable audio buffer pool");
assert(/this\.bufferPool\s*=\s*new\s+AudioBufferPool/m.test(html), "audio manager should initialize the audio pool once");
assert(/function registerCleanupTask/m.test(html), "runtime should track cleanup tasks for scene/menu resources");
assert(/function disposeSceneResources/m.test(html), "runtime should provide explicit resource disposal");
assert(/function debounce/m.test(html), "interaction-heavy controls should use debounce helpers");
assert(/submitStonePuzzleDebounced/m.test(html), "stone puzzle blank submission should be debounced");
assert(/id="variableWatchToggle"/m.test(html), "variable watcher should be minimizable");
assert(/function toggleVariableWatch/m.test(html), "HUD variable watcher should expose minimize/expand behavior");
assert(/\.variable-watch-panel\.is-minimized/m.test(html), "variable watcher minimized state should be styled");
assert(/function interpolateHslColor/m.test(html), "temperature shift should interpolate HSL colors smoothly");
assert(/const\s+C_WORLD_REGISTRY/m.test(html), "future worlds should be registered through a world registry without changing C content");
assert(/function registerWorld/m.test(html), "world registry should expose a register function");
assert(/LANGUAGE_EVOLUTION_ORDER\s*=\s*Object\.freeze/m.test(html), "multi-world order should be modeled as language evolution");
assert(/MULTI_WORLD_EXTENSION_CONTRACT/m.test(html), "HTML should document the multi-world extension contract");
assert(/function getThemeColor/m.test(html), "theme colors should be read through a world-aware function");
assert(/function getWorldStorageKey/m.test(html), "world saves should be isolated by world id prefixes");
assert(/worldId:\s*"c"/m.test(html), "save payload should include the current C world id");
assert(/function initCWorld/m.test(html), "C world should expose an init entry function");
assert(/function closeCWorld/m.test(html), "C world should expose a cleanup exit function");
assert(/function onCWorldComplete/m.test(html), "C completion should route through a world completion callback");
assert(/function showWorldTransitionUI/m.test(html), "world completion should show a language-era transition UI");
assert(/source-code-sea/m.test(html), "transition layer should model the source-code sea");
assert(/requiredToUnlock:\s*"c"/m.test(html), "next placeholder world should require C completion");
assert(fs.existsSync("docs/MULTIVERSE_ROADMAP.md"), "future language worlds should be documented outside the C-only HTML");
assert(/const\s+GAME_DATA\s*=\s*Object\.freeze/m.test(html), "map and puzzle data should have a clear data configuration section");
assert(/function renderAutobiographyTemplate/m.test(html), "autobiographical ending should be generated through a template-style renderer");
assert(/class GameWorkerBridge/m.test(html), "runtime should expose a worker bridge for off-main-thread calculations");
assert(/createWorkerScriptURL\(\)/m.test(html), "worker code should be generated as an inline Blob URL for single-file portability");
assert(/WORKER_TASKS\s*=\s*Object\.freeze/m.test(html), "worker protocol should use named task constants");
assert(/parseVariableWatch/m.test(html), "variable watcher parsing should be worker-backed");
assert(/parseCodeLogEntries/m.test(html), "code log parsing should be worker-backed");
assert(/computeParticlePhysics/m.test(html), "particle physics should be worker-backed");
assert(/function scheduleWorkerParticlePhysics/m.test(html), "scene should schedule particle physics work through the worker");
assert(/class StateMachine/m.test(html), "gameplay should include a reusable state machine");
assert(/const\s+playerStateMachine/m.test(html), "player state should be represented by a state machine");
assert(/const\s+worldStateMachine/m.test(html), "world state should be represented by a state machine");
assert(/PLAYER_STATES\s*=\s*Object\.freeze/m.test(html), "player states should be named constants");
assert(/WORLD_STATES\s*=\s*Object\.freeze/m.test(html), "world states should be named constants");
assert(/function transitionPlayerState/m.test(html), "player state transitions should be centralized");
assert(/function transitionWorldState/m.test(html), "world state transitions should be centralized");
assert(/function generateDynamicStonePuzzle/m.test(html), "stone puzzles should support parameterized C puzzle generation");
assert(/function recordPuzzleMistake/m.test(html), "wrong answers should record mistake types for personalized hints");
assert(/function getPersonalizedHint/m.test(html), "mistake history should produce personalized hints");
assert(/function showMemoryLayoutVisualization/m.test(html), "C concepts should have memory layout visualizations");
assert(/id="memoryLayoutOverlay"/m.test(html), "memory layout visualization overlay should exist");
assert(/function simulateAutobiographyCProgram/m.test(html), "autobiographical C ending should be runnable by a safe simulator");
assert(/id="autobiographyTerminal"/m.test(html), "ending terminal should display generated C program output");
assert(/class WebGLFxLayer/m.test(html), "post-processing should have a WebGL-capable FX layer");
assert(/function createWebGLParticleLayer/m.test(html), "particle rendering should expose a WebGL layer with canvas fallback");
assert(/function updateDynamicAudioLayers/m.test(html), "audio should crossfade layers based on time, distance, and danger");
assert(/function playCodeLogTypewriter/m.test(html), "code log should reveal characters with terminal typewriter animation");
assert(/ACCESSIBILITY_PROFILES\s*=\s*Object\.freeze/m.test(html), "accessibility profiles should be configurable");
assert(/function applyAccessibilityProfile/m.test(html), "accessibility mode should be applied at runtime");
assert(/id="accessibilityModeSelect"/m.test(html), "settings should expose an accessibility mode selector");
assert(/function showIdeTooltip/m.test(html), "tutorial hints should use IDE-like tooltips");
assert(/class DevConsole/m.test(html), "developer console should support runtime debugging commands");
assert(/id="devConsoleOverlay"/m.test(html), "developer console overlay should exist");
assert(/function toggleDevConsole/m.test(html), "developer console should be toggleable");
assert(/function loadWorldPack/m.test(html), "world registry should support lazy world-pack loading");
assert(/worldPacks\s*:\s*new\s+Map/m.test(html), "world registry should track world packs independently");
assert(/VISUAL_REGRESSION_TARGETS\s*=\s*Object\.freeze/m.test(html), "visual regression targets should be documented in code");
assert(/class PerformanceBudgetMonitor/m.test(html), "development mode should monitor FPS and particle budgets");
assert(/id="performanceBudgetPanel"/m.test(html), "performance budget panel should exist");
assert(/performanceMode:\s*"high"/m.test(html), "default performance mode should start at high without auto lowering");
assert(/renderQuality:\s*"high"/m.test(html), "default render quality should start at high");
assert(/cinematicQuality:\s*CINEMATIC_RENDER_MODES\.high/m.test(html), "default cinematic quality should start at high");
assert(!/<option value="auto">自动检测<\/option>/m.test(html), "stable render-quality selector should not expose auto-detect");
assert(!/<option value="auto">启动自动基准<\/option>/m.test(html), "performance selector should not expose startup benchmark mode");
assert(/const STARTUP_BENCHMARK_MS = 0/m.test(html), "startup should not run a benchmark that can lower the user's FPS settings");
assert(/function getAutoPerformanceModeId/m.test(html), "automatic performance mode should reuse a cached benchmark result");
assert(/getPerformanceModeId\(\) === "low" \? "low" : "high"/m.test(html), "render-quality auto mode should prefer high quality by default");
assert(/qualityRuntimeStatusLastAt/m.test(html), "runtime status text should be throttled to avoid settings-panel jitter");
assert(/#qualityRuntimeStatus[\s\S]*min-width:\s*220px/m.test(html), "runtime status label should reserve stable width");
assert(!/\["renderQuality",\s*"performanceMode",\s*"ssr"/m.test(html), "stable render-quality changes should not reset every runtime downgrade");
assert(/renderQualitySelect\?\.addEventListener\("change",\s*\(event\) => updateSetting\("renderQuality", event\.target\.value\)\)/m.test(html), "stable render-quality changes should apply once through updateSetting");
assert(/SERVICE_WORKER_SOURCE/m.test(html), "PWA offline support should define a service worker source");
assert(/function registerOfflineServiceWorker/m.test(html), "PWA offline support should be registerable");
assert(/BUILD_PIPELINE_MANIFEST/m.test(html), "single-file build pipeline should be documented by a manifest");
assert(/function createInlineProductionBundle/m.test(html), "build tooling should expose an inline production bundle helper");
assert(!/C\+\+/m.test(html), "advanced expansion prep must still keep the first world C-only");
assert(/SAVE_SCHEMA_VERSION\s*=\s*\d+/m.test(html), "save data should carry an explicit schema version");
assert(/function migrateSaveData/m.test(html), "save loading should migrate older save formats");
assert(/function repairSaveData/m.test(html), "corrupt saves should be repairable without wiping all data");
assert(/function computeSaveChecksum/m.test(html), "save data should include a simple checksum");
assert(/function verifySaveChecksum/m.test(html), "save loading should validate checksum before trusting data");
assert(/function saveImmutableSnapshot/m.test(html), "critical player facts should support write-once snapshots");
assert(/class ErrorRingBuffer/m.test(html), "global errors should be stored in a bounded ring buffer");
assert(/ERROR_LEVELS\s*=\s*Object\.freeze/m.test(html), "player-facing errors should have severity levels");
assert(/function reportSoftError/m.test(html), "recoverable errors should degrade gracefully through soft reporting");
assert(/function exportErrorReport/m.test(html), "players should be able to export recent error context");
assert(/class WatchdogTimer/m.test(html), "main loop should include a watchdog heartbeat monitor");
assert(/function heartbeatFrame/m.test(html), "render loop should report watchdog heartbeats");
assert(/class TimerTracker/m.test(html), "development mode should track timers for leaks");
assert(/function trackedSetTimeout/m.test(html), "timeouts should be traceable by the timer tracker");
assert(/function trackedSetInterval/m.test(html), "intervals should be traceable by the timer tracker");
assert(/function clearTrackedTimers/m.test(html), "scene cleanup should clear tracked timers");
assert(/PARTICLE_BUDGET\s*=\s*Object\.freeze/m.test(html), "particle systems should enforce a hard budget");
assert(/function enforceParticleBudget/m.test(html), "particle creation should reclaim old particles over the cap");
assert(/function withSafeParticles/m.test(html), "particle failures should degrade by disabling particles");
assert(/id="ariaLiveRegion"/m.test(html), "important events should be announced through an aria live region");
assert(/function announceGameEvent/m.test(html), "runtime should announce critical events for screen readers");
assert(/function visualAlertForMutedAudio/m.test(html), "muted mode should replace audio cues with visual feedback");
assert(/UNDO_WINDOW_MS\s*=\s*3000/m.test(html), "destructive operations should support a 3 second undo window");
assert(/function confirmActionWithUndo/m.test(html), "critical actions should have confirm and undo flow");
assert(/id="bottomActionBar"/m.test(html), "confirm flows should use the bottom action bar");
assert(!/window\.confirm/m.test(html), "confirm flows should not use blocking browser confirm dialogs");
assert(/function getContextualInteractionHint/m.test(html), "interaction prompts should explain locked/ready states");
assert(/function formatCompilerDiagnostic/m.test(html), "logic mistakes should get compiler-style diagnostics");
assert(/warning:\s*unused variable/m.test(html), "compiler diagnostics should include C-style warning copy");
assert(/function generateWorldSeed/m.test(html), "new worlds should get a shareable seed");
assert(/function applySeededNeonPalette/m.test(html), "world seed should subtly vary neon palette");
assert(/class AdaptiveDifficultyModel/m.test(html), "stone puzzle difficulty should adapt to player accuracy and time");
assert(/function adjustPuzzleDifficulty/m.test(html), "dynamic puzzle generation should consult adaptive difficulty");
assert(/function toggleDebugOverlay/m.test(html), "F2 should toggle a debug overlay");
assert(/function captureDebugScreenshot/m.test(html), "F3 should capture and download a screenshot");
assert(/id="debugOverlay"/m.test(html), "debug overlay should exist");
assert(/class WorldEditor/m.test(html), "developer console should expose a world editor mode");
assert(/editor\.enable\(\)/m.test(html), "developer console should support editor.enable()");
assert(/function saveMapJson/m.test(html), "world editor should be able to export map JSON");
assert(/class AnimationManager/m.test(html), "animations should be centrally registered and quality-aware");
assert(/ANIMATION_QUALITY\s*=\s*Object\.freeze/m.test(html), "animation intensity should support full/reduced/off modes");
assert(/id="animationQualitySelect"/m.test(html), "settings should expose animation intensity");
assert(/function triggerHudScanline/m.test(html), "HUD should include a subtle scanline animation hook");
assert(/function pulseVariableValue/m.test(html), "variable changes should pulse values visually");
assert(/function showCompilerSpark/m.test(html), "wrong interactions should emit a small short-circuit spark");
assert(/function generateLearningReport/m.test(html), "game should generate a local learning report");
assert(/id="learningReportOverlay"/m.test(html), "learning report overlay should exist");
assert(/function recordConceptReview/m.test(html), "forgotten concepts should be scheduled for review");
assert(/function checkReviewReminders/m.test(html), "review reminders should be checked locally");
assert(/function generateWorldCapsule/m.test(html), "ending should support a local time capsule export");
assert(/TIME_CAPSULE_FORMAT/m.test(html), "time capsule format should be defined");
assert(/IDLE_COMPILE_DELAY_MS\s*=\s*5000/m.test(html), "idle compile breathing should wait 5 seconds");
assert(/function updateIdleCompileBreath/m.test(html), "player idle state should drive compile breathing");
assert(/function playFacingPixelRewrite/m.test(html), "facing changes should use a pixel rewrite transition");
assert(/function spawnMemoryAddressFootstep/m.test(html), "footsteps should spawn memory-address traces");
assert(/memoryAddressHistory\s*=\s*new\s+Set/m.test(html), "memory address traces should avoid immediate duplicates");
assert(/THINKING_PARTICLE_HINT_DELAY_MS\s*=\s*30000/m.test(html), "thinking particle hint mode should wait 30 seconds");
assert(/function updateThinkingCodeRainHint/m.test(html), "particles should arrange into the active stone code after sustained thinking");
assert(/function triggerVegetationSyntaxSeason/m.test(html), "vegetation should react differently to correct and wrong answers");
assert(/function updateCompileStateLighting/m.test(html), "lighting should reflect global compile progress");
assert(/KEYWORD_NOTE_MAP\s*=\s*Object\.freeze/m.test(html), "keyword pickup audio should map tokens to notes");
assert(/function getKeywordPitch/m.test(html), "keyword pickup pitch should be deterministic");
assert(/function playKeywordPickupScale/m.test(html), "pickup animation arc should follow keyword pitch");
assert(/WORLD_MOOD\s*=\s*Object\.freeze/m.test(html), "music should expose world mood states");
assert(/MUSIC_HARMONY_PROGRESSION\s*=\s*Object\.freeze/m.test(html), "music should define a fixed harmony progression");
assert(/MUSIC_PENTATONIC_SCALE\s*=\s*Object\.freeze/m.test(html), "music should use a pentatonic melodic palette");
assert(/class ProceduralMusicDirector/m.test(html), "music should have a procedural composition director");
assert(/function createEuclideanRhythm/m.test(html), "music should generate phase-shifted Euclidean rhythms");
assert(/function createSeededMotif/m.test(html), "music should generate seeded melody fragments");
assert(/function createUnisonOscillators/m.test(html), "music voices should use detuned unison oscillators");
assert(/createPeriodicWave/m.test(html), "music should create custom PeriodicWave timbres");
assert(/function createSchroederReverb/m.test(html), "music should provide a synthetic reverb fallback");
assert(/function applyMusicMood/m.test(html), "music should react to world mood changes");
assert(/function setMoodIntensity/m.test(html), "music should expose continuous mood intensity");
assert(/function triggerMusicPickupOrnament/m.test(html), "pickup should insert a musical ornament");
assert(/function triggerMusicCompilePass/m.test(html), "compile success should map to a musical gesture");
assert(/function triggerMusicCompileError/m.test(html), "compile error should map to a distorted interval");
assert(/function pauseProceduralMusic/m.test(html), "pause should freeze procedural music layers");
assert(/function resumeProceduralMusic/m.test(html), "resume should chase back to tempo smoothly");
assert(/function updateMusicForDayNight/m.test(html), "day-night lighting should alter music layers");
assert(/function renderMusicLogEntry/m.test(html), "code log should be able to record music structure");
assert(/id="musicVolumeSlider"/m.test(html), "settings should expose independent music volume");
assert(/id="musicComplexitySelect"/m.test(html), "settings should expose music complexity control");
assert(/class BeatSyncScheduler/m.test(html), "important animation beats should be schedulable against BGM strong beats");
assert(/function scheduleAnimationOnStrongBeat/m.test(html), "animations should align keyframes to strong beats");
assert(/MAX_BEAT_SYNC_ERROR_MS\s*=\s*16/m.test(html), "BGM and animation lock should target <=16ms error");
assert(/function captureFrozenReverbBuffer/m.test(html), "pause should capture a frozen reverb tail buffer");
assert(/function freezeReverbTail/m.test(html), "pause should freeze the audible reverb tail");
assert(/function resumeFrozenReverbTail/m.test(html), "resume should restart from the frozen reverb tail");
assert(/class CyberTerminalErrorScreen/m.test(html), "errors should share a cyber terminal blue-screen renderer");
assert(/function showCyberTerminalError/m.test(html), "all fatal/recoverable error screens should use the unified terminal style");
assert(/id="debugExportButton"/m.test(html), "error screen should offer a debug export button");
assert(/MODULE_INIT_STEPS\s*=\s*Object\.freeze/m.test(html), "first load should use real module initialization steps");
assert(/function runBootCompileSequence/m.test(html), "boot should run a terminal-style compile sequence");
assert(/function updateLoadingProgress/m.test(html), "loading progress should be driven by module callbacks");
assert(/class ChapterManager/m.test(html), "story progression should be tracked by a chapter manager");
assert(/STORY_CHAPTERS\s*=\s*Object\.freeze/m.test(html), "main story chapters should be data driven");
assert(/class TutorialSequence/m.test(html), "tutorial triggers should be controlled by a sequence manager");
assert(/NPC_DIALOGUE_DATA\s*=\s*Object\.freeze/m.test(html), "NPC dialogue should be data driven");
assert(/function renderStoryStoneTerminal/m.test(html), "stones should render story terminal code panels");
assert(/function visualizeStackFrameGrowth/m.test(html), "function calls should visualize stack frame growth");
assert(/function visualizePointerBeamLock/m.test(html), "pointer lessons should visualize address beams");
assert(/function visualizeLoopTimeGear/m.test(html), "loops should visualize time gears");
assert(/function createWildCodeCreatureTutorial/m.test(html), "concept creatures should support environmental tutorials");
assert(/function createArrayHallwayVisualization/m.test(html), "arrays should have a hallway visualization");
assert(/function createStructAssemblyTable/m.test(html), "structs should have an assembly-table visualization");
assert(/function triggerMemoryLeakToxicSpread/m.test(html), "memory leaks should have a toxic spread visualization");
assert(/function triggerSegmentationTear/m.test(html), "invalid memory access should tear the world visually");
assert(/function triggerCompilerHandRitual/m.test(html), "boss rituals should summon a compiler-hand arena");
assert(/class CompilerEye/m.test(html), "dynamic navigation should be managed by a compiler-eye state machine");
assert(/function renderCompilerEyeStatus/m.test(html), "HUD should render compiler-eye status expressions");
assert(/function createCodeRippleStep/m.test(html), "movement should create code-ripple footstep comments");
assert(/function playSemanticAbsorbPickup/m.test(html), "keyword pickup should be absorbed semantically into the avatar");
assert(/function triggerCompileHeartbeat/m.test(html), "answer submission should use a compile heartbeat feedback");
assert(/function animateDoorPermissionCheck/m.test(html), "doors should open through permission verification animation");
assert(/function showCompilerSeedAnimation/m.test(html), "new concepts should reveal through compiler-seed animation");
assert(/function showErrorMirror/m.test(html), "repeated mistakes should show an error mirror");
assert(/function playSyntaxTreeAscension/m.test(html), "chapter completion should ascend fragments into an AST");
assert(/function renderHealthAsCodeLine/m.test(html), "health should be renderable as a C code line");
assert(/function updateVariableMemoryRain/m.test(html), "variable monitor should support memory-rain value feedback");
assert(/function updateInventoryGravityDistortion/m.test(html), "near-full inventory should bend ambient particles");
assert(/function enableSpringDragFeedback/m.test(html), "dragging fragments should have spring-delayed feedback");
assert(/function updateLogPaperTapeParallax/m.test(html), "code logs should scroll like textured paper tape");
assert(/function switchIdeTabAnimated/m.test(html), "menus should switch like IDE tabs");
assert(/function createCodeWeatherPhenomenon/m.test(html), "weather should support comment rain, syntax wind, and compile fog");
assert(/function triggerBirthdayCompileAnniversary/m.test(html), "birthday should trigger a compile-anniversary event");
assert(/function freezeWorldForNarrativeMoment/m.test(html), "key story moments should freeze the world but keep breathing");
assert(/COMMENT_SIGNATURE\s*=\s*"\/\/ -cyphercat"/m.test(html), "code comments should use one consistent in-world author signature");
assert(/BGM_DUCK_DB\s*=\s*-8/m.test(html), "important cues should duck BGM by 8dB");
assert(/function duckBgmForCue/m.test(html), "SFX and hints should temporarily duck BGM");
assert(/CUSTOM_CURSOR_BLINK_MS\s*=\s*530/m.test(html), "custom input cursor should match common system cadence");
assert(/function syncTextInputBlockCursor/m.test(html), "text inputs should expose a block cursor cadence hook");
assert(/function serializeParticleFreeze/m.test(html), "save should serialize frozen particle positions");
assert(/function restoreParticleFreeze/m.test(html), "load should restore particles from frozen positions");
assert(/function formatUnitSuffix/m.test(html), "numeric unit suffixes should be normalized");
assert(/function normalizeCommentSignature/m.test(html), "code comments should be normalized with the author signature");
assert(/function unifyPointerKeyboardFocus/m.test(html), "mouse and keyboard focus styles should share one selected state");
assert(/id="oscilloscopeCanvas"/m.test(html), "HUD should include an environment oscilloscope");
assert(/function drawEnvironmentOscilloscope/m.test(html), "environment hum should have a waveform visualizer");
assert(/function relayClickPulse/m.test(html), "UI click feedback should hard-sync a relay pulse");
assert(/function arrangeInventoryMemoryLayout/m.test(html), "inventory should support memory-layout auto arrangement");
assert(/function playGarbageCollectDiscard/m.test(html), "discarding items should use a garbage-collection animation");
assert(/function showInventorySegfaultWarning/m.test(html), "full inventory should warn with a segment-style visual");
assert(/function renderAgedCodeLogEntry/m.test(html), "older log entries should render with aged styling");
assert(/function drawErrorLogCracks/m.test(html), "error log entries should draw crack textures");
assert(/function showCodeLogQuickInfo/m.test(html), "code logs should expose contextual quick info");
assert(/function createLogicClouds/m.test(html), "sky should create logic-cloud shapes");
assert(/function updateLogicClouds/m.test(html), "logic clouds should drift over time");
assert(/function updateCityHeartbeat/m.test(html), "building glow should contribute to a city heartbeat");
assert(/ANIMATION_FLASH_LIMIT_HZ\s*=\s*3/m.test(html), "flash animations should be limited to 3Hz");
assert(/function limitFlashFrequency/m.test(html), "animation manager should enforce flash frequency protection");
assert(/function staticFallbackSignal/m.test(html), "disabled animations should keep non-motion feedback");
assert(/class TimelineAnimation/m.test(html), "animations should use serializable timeline objects");
assert(/MAX_ANIMATION_DELTA_MS\s*=\s*200/m.test(html), "animation delta time should be capped after tab refocus");
assert(/function capDeltaTime/m.test(html), "animation tick should clamp large deltas");
assert(/function serializeAnimationStates/m.test(html), "animation state should serialize for saves");
assert(/function deserializeAnimationStates/m.test(html), "animation state should restore after load");
assert(/onStart.*onProgress.*onComplete/s.test(html), "timeline animations should expose standard callbacks");
assert(/blockedByFocus/m.test(html), "attention-grabbing animations should respect text input focus");
assert(/function syncAnimationAudioEvents/m.test(html), "animation should schedule audio through a sync table");
assert(/id="animationBudgetOverlay"/m.test(html), "F4 should expose an animation performance budget panel");
assert(/function toggleAnimationBudgetOverlay/m.test(html), "animation budget overlay should be toggleable");
assert(/function detectAnimationDeadlocks/m.test(html), "development mode should terminate zombie animations");
assert(/function pauseFreezeAnimations/m.test(html), "pausing should freeze animations on the current frame");
assert(/function resumeFrozenAnimations/m.test(html), "resuming should compensate animation time smoothly");
assert(/noAnims=true/m.test(html), "URL emergency switch should disable animations before startup");
assert(/ANIM_CONFIG\s*=\s*Object\.freeze/m.test(html), "animation parameters should be centralized in a style sheet");
assert(/PROGRAMMER_DAY_MONTH\s*=\s*10/m.test(html), "programmer-day seasonal animation should be date-gated");
assert(/PROGRAMMER_DAY_DATE\s*=\s*24/m.test(html), "programmer-day seasonal animation should use October 24");
assert(/function applyProgrammerDayPalette/m.test(html), "programmer-day palette should be applied through a function");
assert(/"use strict";/m.test(html), "runtime script should enable strict mode");
assert(/const Game\s*=\s*\(\(\)\s*=>/m.test(html), "runtime should expose a single Game namespace façade");
assert(/QUALITY_GATE_THRESHOLDS\s*=\s*Object\.freeze/m.test(html), "quality gate thresholds should be centralized");
assert(/maxFunctionLines:\s*30/m.test(html), "quality gates should document the 30-line function target");
assert(/maxCyclomaticComplexity:\s*5/m.test(html), "quality gates should document the complexity target");
assert(/function sanitizePlayerInput/m.test(html), "player-provided text should be sanitized before rendering");
assert(/function validateStoragePayload/m.test(html), "storage payloads should be validated after localStorage reads");
assert(/function guardRecursionDepth/m.test(html), "recursive helpers should have an explicit depth guard");
assert(/function enforceDomNodeLimit/m.test(html), "DOM-rendered lists should have a maximum node limit");
assert(/function monitorFontLoadFallback/m.test(html), "custom fonts should fall back after a timeout");
assert(/function attachCanvasContextLossHandlers/m.test(html), "canvas context loss should be handled gracefully");
assert(/function createTextBitmapCache/m.test(html), "stable HUD text should support bitmap caching");
assert(/function sanitizeImportedJson/m.test(html), "JSON import paths should sanitize external data");
assert(/function exportSaveData/m.test(html), "save data should be exportable as JSON");
assert(/function importSaveData/m.test(html), "save data should be importable with validation");
assert(/存档管理/m.test(html), "settings should expose a save-management section");
assert(/data-settings-tab="save"/m.test(html) && /data-settings-section="save"/m.test(html), "save management should have its own settings tab");
assert(/id="clearSaveButton"/m.test(html), "settings should include a clear-save button");
assert(/INPUT_MODES\s*=\s*Object\.freeze/m.test(html), "input modes should be centralized");
assert(/class InputManager/m.test(html), "input manager should control game/editor ownership");
assert(/InputMode\.Editor|INPUT_MODES\.editor/m.test(html), "editor should enter an exclusive input mode");
assert(/inputManager\.setMode\(INPUT_MODES\.editor\)/m.test(html), "opening editor should set editor input mode");
assert(/inputManager\.setMode\(INPUT_MODES\.game\)/m.test(html), "closing editor should restore game input mode");
assert(/function createInitialGameData/m.test(html), "clear save should create a fresh initialized game data object");
assert(/function resetGameData/m.test(html), "clear save should reset in-memory game state");
assert(/function saveGame/m.test(html), "clear save should immediately write a default save");
assert(/class SceneResetManager/m.test(html), "scene reset manager should broadcast reset to resettable scene objects");
assert(/ResetToInitialState|resetToInitialState/m.test(html), "resettable scene objects should expose resetToInitialState");
assert(/fragmentCount.*questProgress.*unlockedFeatures/s.test(html), "F1 debug panel should display save reset state");
assert(/GUIDANCE_LEVELS\s*=\s*Object\.freeze/m.test(html), "task guidance strength levels should be centralized");
assert(/id="guidanceStrengthSelect"/m.test(html), "settings should expose a task guidance strength selector");
assert(/id="guidanceToggle"/m.test(html), "settings should expose a task guidance master switch");
assert(/TASK_GUIDANCE_COLORS\s*=\s*Object\.freeze/m.test(html), "task guidance colors should be theme-aware");
assert(/class TaskGuidanceSystem/m.test(html), "task guidance should be handled by a dedicated system");
assert(/MAX_GUIDANCE_DOTS\s*=\s*20/m.test(html), "task guidance should cap light dots at 20");
assert(/guidanceScreenArrow/m.test(html), "task guidance should include a screen-edge arrow when the target is off-screen");
assert(/function getGuidanceTargetShortLabel/m.test(html), "task guidance arrow should label the precise current target");
assert(/`▼ \$\{label\}`/m.test(html) && /`➜ \$\{label\}`/m.test(html), "task guidance should show direct arrows for on-screen and off-screen targets");
assert(/function updateGuidanceTargetHighlight/m.test(html), "nearby task targets should receive a highlight pulse");
assert(/function showQuestProgressToast/m.test(html), "quest progress should use a non-blocking toast");
assert(/function updateLostDirectionAssist/m.test(html), "guidance should escalate when the player is lost");
assert(/guideType.*collect.*puzzle.*dialog/s.test(html), "guidance target data should include task theme types");
assert(/UI_PROFILES\s*=\s*Object\.freeze/m.test(html), "UI profiles should be centralized");
assert(/class UIProfileManager/m.test(html), "UI profile manager should apply profile state");
assert(/uiProfile:\s*"default"/m.test(html), "default settings should start on the current UI");
assert(/id="uiProfileSelect"/m.test(html), "settings should expose a UI system selector");
assert(/data-ui-profile="terminal"|setAttribute\("data-ui-profile"/m.test(html), "selected UI profile should be applied to body");
assert(/body\[data-ui-profile="terminal"\]/m.test(html), "terminal UI should have profile-scoped CSS");
assert(/#00FF41/.test(html) && /#00FFFF/.test(html) && /#FF00FF/.test(html), "terminal UI should include required hacker palette");
assert(/terminal-code-rain|hacker-terminal/.test(html), "terminal UI should include code-rain or hacker terminal styling hooks");
assert(/导师提示：/m.test(html), "editor hints should be framed as mentor guidance");
assert(!/AI\s*提示|AI提示|AI\s*评价|AI评价/m.test(html), "editor-facing hints should not use AI wording");
assert(/id="startupAnnouncement"/m.test(html), "first load should include a dynamic-island announcement");
assert(/>\s*消息/.test(html) && /作者：杀戮/.test(html), "announcement should show the requested title and author");
assert(/UPDATE_ANNOUNCEMENT_PAGES\s*=\s*Object\.freeze/m.test(html), "announcement update notes should be centralized for every GitHub upload");
assert(/本次更新|更新内容/m.test(html), "announcement should present the current update content instead of stale first-version copy");
assert(/function renderStartupAnnouncementPage/m.test(html), "announcement should render paged update notes");
assert(/id="announcementPrevButton"[\s\S]*id="announcementNextButton"/m.test(html), "announcement should include pagination controls when update notes are long");
assert(/本项目永久免费对外开放/.test(html), "announcement should include the free-open project statement");
assert(/STARTUP_ANNOUNCEMENT_AUTO_HIDE_MS\s*=\s*3000/m.test(html), "announcement should auto-hide after 3 seconds");
assert(/function showStartupAnnouncement/m.test(html), "announcement should be controlled by a startup function");
assert(/id="announcementCloseButton"/m.test(html), "announcement should include a minimal close control");
assert(/id="worldSelectOverlay"/m.test(html), "start game should open a world-select overlay");
assert(/id="worldCardsGrid"/m.test(html), "world-select overlay should render world cards into a grid");
assert(/WORLD_SELECT_CONFIG\s*=\s*Object\.freeze/m.test(html), "world select data should be centralized");
assert(/class WorldSelectManager/m.test(html), "world select should have a dedicated manager");
assert(/世界一[\s\S]*C语言/s.test(html), "world one should be labeled as the playable C language world");
assert(/世界二[\s\S]*敬请期待|世界二[\s\S]*等后续更新/s.test(html), "world two should be shown as a future update");
assert(/completedWorlds:\s*\[\]/m.test(html), "save progress should include completedWorlds");
assert(/function getCWorldProgress/m.test(html), "world select should compute C world progress");
assert(/function isCWorldFullyComplete/m.test(html), "world one completion should have an explicit gate");
assert(/function renderWorldSelect/m.test(html), "world select should render progress and lock states");
assert(/function showLockedWorldDialog/m.test(html), "locked world clicks should show a dialog");
assert(/需要先完成C语言课程，才能解锁下一世界/.test(html), "locked next world should explain the C-course requirement");
assert(/该世界仍在开发中，后续更新将带来更多编程语言支持/.test(html), "placeholder worlds should show a development notice");
assert(/action === "start"[\s\S]*startGameFlowFromMainMenu/m.test(html), "main menu start should run the save-check startup flow");
assert(/world-progress-fill/m.test(html), "world one should display a progress bar");
assert(/class WorldExplorationData/m.test(html), "world exploration data should have a structured model");
assert(/worldExploration:\s*\{\}/m.test(html), "save progress should cache per-world exploration data");
assert(/function calculateWorldExplorationPercentage/m.test(html), "exploration percentage should be calculated from weighted dimensions");
assert(/0\.4[\s\S]*0\.35[\s\S]*0\.15[\s\S]*0\.1/s.test(html), "exploration weights should match the requested 40/35/15/10 formula");
assert(/function getExplorationStage/m.test(html), "exploration percentage should map to named stages");
assert(/world-exploration-ring/m.test(html), "world cards should include circular exploration progress");
assert(/exploration-detail-panel/m.test(html), "world cards should expose exploration detail panels");
assert(/id="totalWorldExploration"/m.test(html), "world select should show total exploration");
assert(/function showExplorationMilestone/m.test(html), "exploration milestones should produce feedback");
assert(/✦ 完全探索|✦ 完美探索/.test(html), "100% exploration should have a special badge");
assert(/SYSTEM_BOOT_LOG_LINES\s*=\s*Object\.freeze/m.test(html), "startup intrusion log lines should be centralized");
assert(/正在初始化系统核心/.test(html) && /欢迎回来，行者/.test(html), "startup intrusion log should include the requested system lines");
assert(/id="systemBootOverlay"/m.test(html), "startup should include a system boot log overlay");
assert(/function playSystemBootLog/m.test(html), "startup boot log should type lines before the menu settles");
assert(/function skipSystemBootLog/m.test(html), "startup boot log should be skippable");
assert(/空格跳过|Space 跳过/.test(html), "startup boot log should show a skip hint");
assert(/SYSTEM_SHUTDOWN_LOG_LINES\s*=\s*Object\.freeze/m.test(html), "shutdown log lines should be centralized");
assert(/data-menu-action="exit"/m.test(html), "main menu should expose an exit action");
assert(/function playSystemShutdownLog/m.test(html), "exit should play a shutdown log before closing");
assert(/id="gameClosedOverlay"/m.test(html), "exit fallback should include a closed-game overlay");
assert(/function finalizeGameExit/m.test(html), "exit should have a fallback when browsers block window.close");
assert(/id="systemLogOverlay"/m.test(html), "system logs should share a terminal overlay");
assert(/function showLevelCompleteSystemLog/m.test(html), "level completion should show a system log");
assert(/function showCompileErrorSystemLog/m.test(html), "compile errors should show a system-level error window");
assert(/自动修复/.test(html) && /修复失败/.test(html), "compile error log should simulate an auto-fix failure");
assert(/id="codeRoadOverlay"/m.test(html), "code road unlock ritual should have a full-screen overlay");
assert(/class RoadCompiler/m.test(html), "code road unlock ritual should be managed by a RoadCompiler module");
assert(/ROAD_COMPILER_CHAPTER_STYLES\s*=\s*Object\.freeze/m.test(html), "chapter-specific road styles should be centralized");
assert(/CORE ACCESS/.test(html) && /代码铺路模块/.test(html), "road compiler should show the requested core-access terminal copy");
assert(/下一层世界已准备就绪/.test(html) && /你正在用代码，重新定义这个世界/.test(html), "road compiler should announce the next layer terminal");
assert(/unlockEffectLevelSelect/m.test(html), "settings should expose an unlock-effect quality selector");
assert(/unlockEffectLevel:\s*"medium"/m.test(html), "unlock-effect setting should default to medium");
assert(/CODE_ROAD_LIMITS[\s\S]*glyphs:\s*300[\s\S]*particles:\s*50/s.test(html), "road compiler should enforce glyph and particle performance limits");
assert(/showLevelCompleteSystemLog\(chapter\)[\s\S]*roadCompiler\.play/m.test(html), "challenge completion should trigger the code road ritual after the system log");
assert(/class WorldRecompiler/m.test(html), "final C-world completion should use a world recompiler sequence");
assert(/id="worldRecompileOverlay"/m.test(html), "final world recompile should have a dedicated full-screen overlay");
assert(/世界一 · 重构完毕/.test(html) && /你是创造者/.test(html), "final world recompile should show the requested creator subtitle");
assert(/function collectLearnedCConceptsForRain/m.test(html), "final code rain should summarize learned C concepts");
assert(/playWorldOneRebuildSequence[\s\S]*showWorldSelect\("cpp"\)/m.test(html), "final world recompile should route into the world-two selection view");
assert(/Ctrl \+ Shift \+ F12|ctrlKey && event\.shiftKey && event\.key === "F12"/m.test(html), "system core shortcut should exist");
assert(/id="systemClock"/m.test(html), "HUD should include a subtle system clock");
assert(/id="finalRevivalOverlay"/m.test(html), "world-one completion should have a final revival overlay");
assert(/function playWorldOneRevivalEnding/m.test(html), "final world-one completion should play a revival ending sequence");
assert(/\/\/ 你成功了。/.test(html) && /世界一 · 修复完成/.test(html), "revival ending should include the requested emotional lines");
assert(/return 0;/.test(html), "revival ending should transform the mentor image into return 0");
assert(/BAD_ENDING_RULES\s*=\s*Object\.freeze/m.test(html), "bad-ending trigger rules should be centralized");
assert(/function shouldTriggerBadEnding/m.test(html), "bad-ending trigger should be explicit");
assert(/compileFailureCount:\s*0/m.test(html) && /refusedNpcRequests:\s*0/m.test(html), "save progress should track compile failures and NPC refusals");
assert(/系统检测到未修复的错误/.test(html) && /强制重启/.test(html), "bad ending should show the requested system error text");
assert(/id="completionCertificateOverlay"/m.test(html), "world-one completion certificate overlay should exist");
assert(/function renderCompletionCertificate/m.test(html), "completion certificate should be rendered from progress data");
assert(/function saveCompletionCertificateAsPng/m.test(html), "completion certificate should save to PNG");
assert(/function shareCompletionCertificate/m.test(html), "completion certificate should generate share text");
assert(/开发者签名：杀戮/.test(html), "certificate should include the developer signature");
assert(/完美探索者/.test(html) && /深度探索者/.test(html) && /完美修复师/.test(html), "certificate should support hidden achievement lines");
assert(/id="developerRoomOverlay"/m.test(html), "developer room should have a dedicated overlay");
assert(/id="developerMessageInput"/m.test(html), "developer room should include a 100-character message board input");
assert(/function enterDeveloperRoom/m.test(html), "hidden developer room should be enterable");
assert(/function saveDeveloperRoomMessage/m.test(html), "developer room message should be saved");
assert(/欢迎，玩家。/.test(html) && /—— 开发者：杀戮/.test(html), "developer room computer should include the requested fourth-wall text");
assert(/function applyPostCompletionNpcEvolution/m.test(html), "NPCs should evolve or move after world one completion");
assert(/世界末端的幽灵位点/.test(html) && /我在这里解析了风的算法/.test(html), "post-completion mentor should become a wandering ghost observation point");
assert(/function openTerminalGuessMiniGame/m.test(html), "hidden terminal guessing mini-game should exist");
assert(/伪随机双向推演/.test(html) && /未编译的脑机接口模块/.test(html), "terminal mini-game should use the renamed blind inference framing");
assert(/LOADING_QUIPS\s*=\s*Object\.freeze/m.test(html), "loading screen should have randomized developer quips");
assert(/function maybeTriggerMysterySignal/m.test(html), "mystery signal pseudo-bug should exist");
assert(/0\.01/.test(html) && /追踪到未知来源的UDP包/.test(html), "mystery signal should use a 1% chance and requested UDP text");
assert(/id="playerNamePromptOverlay"/m.test(html), "fourth-wall player-name prompt should exist");
assert(/function rememberPlayerName/m.test(html), "player name should be remembered for later dialogue");
assert(/你是谁/.test(html) && /跨层内省协议/.test(html), "player-name prompt should use the cross-layer introspection framing");
assert(/PET_AI_EVOLUTION\s*=\s*Object\.freeze/m.test(html), "companion AI evolution rules should be centralized");
assert(/dataEggsCollected:\s*0/m.test(html), "save progress should track data eggs for pet hatching");
assert(/function hatchCompanionAi/m.test(html), "companion AI should hatch from collected data eggs");
assert(/function updateCompanionAiEvolution/m.test(html), "companion AI should evolve from player behavior");
assert(/迷宫层/.test(html) && /function enterMazeLayer/m.test(html), "hidden maze layer should be enterable");
assert(/function discoverMazeMemoryRoom/m.test(html), "maze memory room should unlock hidden memory fragments");
assert(/迷宫大师/.test(html), "all maze rooms should unlock a maze-master marker");
assert(/WEATHER_STORY_STATES\s*=\s*Object\.freeze/m.test(html), "weather story states should be centralized");
assert(/function updateNarrativeWeather/m.test(html), "weather should respond to game progress");
assert(/今天，数据流很干净/.test(html) && /系统也在清洗它的缓存/.test(html), "weather should provide environmental voice lines");
assert(/NPC_DAILY_SCHEDULES\s*=\s*Object\.freeze/m.test(html), "NPC daily schedules should be data-driven");
assert(/function updateNpcDailyRoutines/m.test(html), "NPCs should have routine movement/state updates");
assert(/天色暗了，数据流也开始变慢了/.test(html), "NPC routines should unlock time-aware dialogue");
assert(/ECHO_LOG_LINES\s*=\s*Object\.freeze/m.test(html), "echo log story lines should be centralized");
assert(/function triggerEchoPoint/m.test(html), "echo points should be triggerable after idling");
assert(/你不仅是修复师。你还是这个世界的‘开始’。/.test(html), "all echoes should combine into the hidden final sentence");
assert(/ANTI_ADDICTION_PLAY_MS\s*=\s*60\s*\*\s*60\s*\*\s*1000/m.test(html), "anti-addiction easter egg should trigger after one hour");
assert(/id="antiAddictionOverlay"/m.test(html), "anti-addiction terminal overlay should exist");
assert(/function checkAntiAddictionBreak/m.test(html), "runtime should check the anti-addiction break condition");
assert(/世界不仅仅是代码/.test(html), "anti-addiction terminal should include the requested caring line");
assert(/id="guestbookOverlay"/m.test(html) && /function saveGuestbookEntry/m.test(html), "developer guestbook should support local saved entries");
assert(/我收到了你的留言。谢谢你。—— 杀戮/.test(html), "guestbook should acknowledge returned post-clear messages");
assert(/id="fishingOverlay"/m.test(html) && /function startUselessFishing/m.test(html), "useless fishing interaction should exist");
assert(/正在钓鱼/.test(html), "fishing interaction should show the requested waiting text");
assert(/function toggleRoomLightSwitch/m.test(html), "room light switch should be toggleable");
assert(/GHOST_NPC_CHANCE\s*=\s*0\.001/m.test(html), "ghost NPC chance should be 0.1%");
assert(/function maybeSpawnGhostNpc/m.test(html), "ghost NPC should be spawned by a rare event function");
assert(/我路过而已/.test(html), "ghost NPC should say the requested line");
assert(/function applyMidnightTimeEasterEgg/m.test(html), "midnight system-time easter egg should exist");
assert(/在这个时刻，数据流是最安静的/.test(html), "midnight easter egg should show the requested line");
assert(/function applyWeekendMenuGlow/m.test(html), "weekend menu glow should be time-gated");
assert(/function applyFestivalDecorations/m.test(html), "festival decorations should be date-gated");
assert(/function createRunawayNpc/m.test(html), "runaway NPC should exist");
assert(/你追不上我的/.test(html), "runaway NPC should use the requested taunt");
assert(/id="dislikeGameButton"/m.test(html), "settings should include the tiny dislike button");
assert(/function handleDislikeGameButton/m.test(html), "dislike button should have staged responses");
assert(/0xFEEDBEEF/.test(html) && /function triggerFakePrecisionBug/m.test(html), "fake bug window should use 0xFEEDBEEF");
assert(/我其实是NPC/.test(html) && /如果你这么说，那我也可能是玩家/.test(html), "impossible dialogue branch should exist");
assert(/function sitOnStoneChair/m.test(html), "stone chair rest interaction should exist");
assert(/休息者/.test(html), "sitting one minute should unlock a rest achievement marker");
assert(/id="mainMenuIdleCounter"/m.test(html), "main menu should include a useless idle counter");
assert(/function clickPatienceTree/m.test(html), "tree click patience easter egg should exist");
assert(/treeClickCount:\s*0/m.test(html), "save progress should track tree click count");
assert(/function showWhyProgrammingPrompt/m.test(html), "ending should ask why the player learns programming");
assert(/你为什么要学编程/.test(html), "ending motive prompt should ask the requested question");
assert(/function deleteForgottenCodeOnce/m.test(html), "irreversible forgotten-code deletion should exist");
assert(/你刚刚删除了我/.test(html), "forgotten-code deletion should include the requested final line");
assert(/function spawnOtherPlayerFootprint/m.test(html), "other-player footprint traces should exist");
assert(/还有一些脚印，留在了你看不见的地方/.test(html), "certificate should mention invisible footprints");
assert(/id="timeCapsuleOverlay"/m.test(html) && /function sealTimeCapsule/m.test(html), "time capsule overlay and save function should exist");
assert(/你的留言已被封装/.test(html), "time capsule should use the requested sealing text");
assert(/function getAllSaveStorageKeys/m.test(html), "clear-save should enumerate all base and world-prefixed save keys");
assert(/function clearAllSaveData/m.test(html), "settings should be able to clear all local save data");
assert(/Object\.values\(STORAGE\)[\s\S]*getWorldStorageKey/m.test(html), "clear-save should remove world-prefixed storage keys as well as base keys");
assert(/WEB_FIXED_GAME_SAVE_KEY/m.test(html) && /keys\.add\(WEB_FIXED_GAME_SAVE_KEY\)/m.test(html), "clear-save should remove the fixed gameSave.json character save key");
assert(/localStorage\.removeItem/m.test(html), "clear-save should remove saved localStorage entries");
assert(api.destroyKnowledgeFragment, "fragment cleanup should be exported for regression tests");
assert(!/function createCodeKeywordFragments[\s\S]*codeFragmentGroup\?\.clear\?\.\(true,\s*true\)/m.test(html), "fragment recreation should not ask Phaser group.clear to destroy already-cleaned children");
assert(/safeDestroyFragmentPart\(scene\.fragmentOverlapCollider,\s*"overlapCollider"\)/m.test(html), "fragment overlap collider should be destroyed through the safe cleanup wrapper");
{
  let visualDestroyed = false;
  const halfDestroyedFragment = {
    ambientTweens: [{ stop() {} }],
    visual: { destroy() { visualDestroyed = true; } },
    destroy() { throw new TypeError("Cannot read properties of null (reading 'removeCollider')"); }
  };
  assert(api.destroyKnowledgeFragment(halfDestroyedFragment) === false, "fragment cleanup should report partial failure for already half-destroyed Phaser objects");
  assert(visualDestroyed, "fragment cleanup should still destroy visual children before tolerating stale physics errors");
}
assert(/class="settings-tabs"/m.test(html), "settings should use sidebar-style tab navigation");
assert(/data-settings-tab="audio"/m.test(html) && /data-settings-tab="visual"/m.test(html), "settings tabs should include audio and visual sections");
assert(/id="editorFontSizeSlider"/m.test(html) && /id="editorInlineFontSize"/m.test(html), "editor should expose font-size controls in settings and titlebar");
assert(/max="140"/m.test(html), "volume sliders should allow the raised audio headroom");
assert(/id="fragmentCardGrid"/m.test(html), "inventory should render code fragments as cards");
assert(/function renderFragmentCards/m.test(html), "fragment cards should be rendered by a dedicated function");
assert(/function getQuestDynamicDescription/m.test(html), "quest log should update descriptions based on progress");
assert(/function inspectInstantSyntax/m.test(html), "editor should provide instant syntax checks before compile");
assert(/function autoInjectStdIoHeader/m.test(html), "judge should preprocess missing stdio.h for beginner-friendly printf tasks");
assert(/function normalizeProgramOutput/m.test(html), "judge should normalize stdout before comparison");
assert(/function compareProgramOutput/m.test(html), "judge should compare expected and actual output flexibly");
assert(/function handleEditorCommandKey/m.test(html), "editor should have a central keyboard command handler");
assert(/function handleEditorFileSwitchKey/m.test(html), "editor should use Tab for file switching when autocomplete is closed");
assert(/function indentSelectedLines/m.test(html), "editor should support Tab multi-line indentation");
assert(/function outdentSelectedLines/m.test(html), "editor should support Shift+Tab multi-line outdent");
assert(/function deleteCurrentEditorLine/m.test(html), "editor should support Ctrl+D line deletion");
assert(/function cutCurrentEditorLine/m.test(html), "editor should support Ctrl+L line cut");
assert(/shortcutManager\.matches\(event,\s*"runCode"\)/m.test(html), "editor should run code with the remappable Ctrl+Enter action");
assert(/function showRefreshConfirm/m.test(html), "F5 should be reserved for refresh confirmation instead of code execution");
assert(/function playEditorKeySound/m.test(html), "editor should route keydown audio through a dedicated key sound pool");
assert(/PERSONAL_C_NOTE_PATH\s*=\s*Object\.freeze/m.test(html), "game should embed the player's C learning-note path");
assert(/顺序查找/m.test(html), "player note path should include the current stopping point at sequential search");
assert(/二分查找.*未解锁/s.test(html), "binary search should be represented as the next locked learning target");
assert(/function getPersonalNoteHint/m.test(html), "editor should surface hints derived from the player's C notes");
assert(/笔记提示/m.test(html), "note-derived hints should be visible to players");
assert(/tok-preprocessor/m.test(html) && /tok-function/m.test(html), "C highlighter should include preprocessor and function tokens");
assert(/function runWorldCommandFromCode/m.test(html), "editor commands should be able to directly affect the world");
assert(/unlock_gate/.test(html) && /rain/.test(html), "world command layer should support unlock_gate() and rain()");
assert(/run-button\.compiling/m.test(html), "compile button should pulse while code is running");
assert(/function createMapCodeProjections/m.test(html), "map objects should expose subtle in-world code projections");
assert(/applyMusicLayerMix/m.test(html), "audio manager should expose dynamic BGM layer mixing");
assert(/musicLayers/m.test(html), "BGM should be split into drone, ambience, and theme layers");
assert(/function createQualityReport/m.test(html), "runtime should expose a compact quality report");
assert(fs.existsSync("scripts/complexity-audit.cjs"), "complexity audit script should exist");
assert(fs.existsSync("scripts/dependency-graph.cjs"), "dependency graph script should exist");
assert(fs.existsSync("scripts/magic-number-audit.cjs"), "magic number audit script should exist");
assert(fs.existsSync("scripts/animation-leak-audit.cjs"), "animation leak audit script should exist");
assert(fs.existsSync("docs/DESIGN_TESTAMENT.md"), "design testament document should exist");
assert(fs.existsSync("docs/DONE_CRITERIA.md"), "done criteria document should exist");
assert(fs.existsSync("docs/devlog/2026-06-15-quality-hardening.md"), "developer log should capture this hardening pass");
assert(fs.existsSync("docs/superpowers/plans/2026-06-15-quality-hardening.md"), "quality hardening plan should be saved");
assert(/C_EXECUTION_MODES\s*=\s*Object\.freeze/m.test(html), "C execution modes should be centralized");
assert(/TINYCC_WASM_MODULE_URL/m.test(html), "TinyCC WASM module URL should be configurable");
assert(/class TinyCCompilerWasmAdapter/m.test(html), "TinyCC WASM adapter should exist");
assert(/function loadTinyCCompilerWasm/m.test(html), "runtime should be able to load a TinyCC WASM adapter");
assert(/class CExecutionEngine/m.test(html), "C execution engine should coordinate compile and run modes");
assert(/function compileAndRunCProgram/m.test(html), "editor should compile and run C through a single entrypoint");
assert(/function interpretSupportedCSubset/m.test(html), "browser fallback should execute the supported C tutorial subset");
assert(/function applyCProgramOutputToWorld/m.test(html), "C program output should be able to mutate the game world");
assert(/function createCProgramWorkerSource/m.test(html), "C execution should run behind a worker source");
assert(/class SeededRng/m.test(html), "procedural generation should use deterministic seeded RNG");
assert(/class ProceduralWorldGenerator/m.test(html), "procedural world generator should exist");
assert(/function generateProceduralWorld/m.test(html), "new game should be able to generate a procedural world layout");
assert(/function createProceduralStonePuzzle/m.test(html), "stone puzzles should support procedural variants");
assert(/procedural:\s*true/m.test(html), "C world data should mark procedural generation support");
assert(fs.existsSync("package.json"), "desktop packaging should define package metadata");
assert(fs.existsSync("desktop/electron-main.cjs"), "Electron main process file should exist");
assert(fs.existsSync("desktop/electron-preload.cjs"), "Electron preload bridge should exist");
assert(fs.existsSync("scripts/package-desktop.cjs"), "desktop packaging helper should exist");
assert(fs.existsSync("docs/adr/0003-c-execution-runtime.md"), "C execution runtime ADR should exist");
assert(fs.existsSync("docs/adr/0004-desktop-packaging.md"), "desktop packaging ADR should exist");
assert(fs.existsSync("docs/adr/0005-procedural-worlds.md"), "procedural worlds ADR should exist");
assert(/CODE_AWAKENER_SDK_VERSION/m.test(html), "embeddable teaching SDK should expose a version");
assert(/class CodeAwakenerSDK/m.test(html), "game core should be embeddable through a public SDK class");
assert(/function createCoursePack/m.test(html), "teachers should be able to create custom course packs");
assert(/function validateCoursePack/m.test(html), "SDK should validate custom course content before mounting");
assert(/function mountCodeAwakenerCourse/m.test(html), "SDK should mount custom course packs into a target container");
assert(/CodeAwakenerSDK/m.test(html) && /globalThis\.CodeAwakenerSDK/m.test(html), "SDK should be published on globalThis for embeds");
assert(fs.existsSync("docs/SDK.md"), "SDK embedding guide should exist");
assert(fs.existsSync("CONTRIBUTING.md"), "open-source contribution guide should exist");
assert(fs.existsSync("CODE_OF_CONDUCT.md"), "community code of conduct should exist");
assert(fs.existsSync(".github/ISSUE_TEMPLATE/course-content.md"), "course content issue template should exist");
assert(fs.existsSync(".github/pull_request_template.md"), "pull request template should exist");
assert(fs.existsSync("scripts/static-quality-audit.cjs"), "static quality audit script should exist");
assert(fs.existsSync("scripts/fuzz-save-data.cjs"), "save-data fuzzing script should exist");
assert(fs.existsSync("scripts/visual-regression-smoke.cjs"), "visual regression smoke script should exist");
assert(fs.existsSync("docs/adr/0001-c-world-browser-runtime.md"), "architecture decision record for browser runtime should exist");
assert(fs.existsSync("docs/adr/0002-save-format.md"), "architecture decision record for save format should exist");
assert(fs.existsSync("CHANGELOG.md"), "project should have a changelog");
assert(/http-equiv="Content-Security-Policy"/m.test(html), "page should define a Content Security Policy meta tag");
assert(/frame-ancestors 'none'/.test(html), "CSP should prevent iframe embedding");
assert(!/unsafe-eval/.test(html) && !/unsafe-inline/.test(html), "CSP should avoid unsafe eval and unsafe inline");
assert(cspContent.includes(sha256Directive(rawStyleContent)), "CSP style hash must match raw browser style content");
assert(cspContent.includes(sha256Directive(rawInlineScriptContent)), "CSP script hash must match raw browser script content");
{
  const expectedScriptHash = rawInlineScriptContent.match(/expectedScriptHash:\s*"([^"]+)"/)?.[1] || "";
  const normalizedScript = rawInlineScriptContent.replaceAll(expectedScriptHash, "__GAME_SCRIPT_HASH__");
  const actualScriptHash = crypto.createHash("sha256").update(normalizedScript, "utf8").digest("base64");
  assert(expectedScriptHash === actualScriptHash, "tamper self-check hash must match raw browser script content");
}
assert(/phaser@3\.80\.1[\s\S]*integrity="sha384-/m.test(html), "external Phaser script should include SRI");
assert(/id="securityMascotToast"/m.test(html), "security events should use a fun mascot toast");
assert(/SECURITY_CONFIG\s*=\s*Object\.freeze/m.test(html), "security constants should be frozen");
assert(/function showSecurityMascotToast/m.test(html), "security layer should show playful non-blocking popups");
assert(/function runTamperSelfCheck/m.test(html), "security layer should verify the main script hash");
assert(/function startTamperWorker/m.test(html), "security layer should periodically self-check through a worker tick");
assert(/function startDevToolsWatcher/m.test(html), "security layer should detect DevTools for a lighthearted prompt");
assert(/function isStrictSecurityMode/m.test(html), "security integrity refresh should be gated behind strict mode");
assert(/if \(!isStrictSecurityMode\(\)\) return true;[\s\S]*function startTamperWorker/m.test(html), "normal player mode should not fail on integrity hash mismatches");
assert(/if \(!isStrictSecurityMode\(\)\) return false;[\s\S]*const source = `setInterval/m.test(html), "normal player mode should not start the tamper worker");
assert(/if \(isStrictSecurityMode\(\)\) runTamperSelfCheck\("startup"\)/m.test(html), "startup tamper check should only run in strict security mode");
assert(/id="gameContextMenu"/m.test(html), "right-click should show a safe custom game context menu");
assert(/function openGameContextMenu/m.test(html), "game should open a custom context menu instead of the browser menu");
assert(/function handleContextMenuSecurity/m.test(html), "security layer should replace right-click source/inspect menu");
assert(/addEventListener\("contextmenu",\s*handleContextMenuSecurity/m.test(html), "right-click context menu should be captured by security layer");
assert(/handleContextMenuSecurity[\s\S]*event\.preventDefault\(\)/m.test(html), "right-click handler should prevent the browser context menu");
assert(/input:\s*\{[\s\S]*mouse:\s*\{[\s\S]*preventDefault:\s*false/m.test(html), "Phaser should delegate right-click to the document security handler");
assert(/function saveBeforeSecurityRefresh/m.test(html), "security refresh should save the game before reloading");
assert(!/showSecurityMascotToast\("devtools",\s*\{[\s\S]*refreshInMs:\s*SECURITY_CONFIG\.devToolsRefreshMs/m.test(html), "DevTools prompt should not auto-refresh normal players");
assert(/showSecurityMascotToast\("devtools",\s*\{\s*stayMs:\s*7800\s*\}/m.test(html), "DevTools prompt should be a temporary non-blocking toast");
assert(!/contextMenuRefreshMs/m.test(html), "right-click alone should not trigger the refresh flow");
assert(!/查看网页源代码|检查元素|Inspect|View Source/.test(html), "custom right-click menu should not expose source or inspect labels");
assert(/function installConsoleHardening/m.test(html), "production mode should silence console log while keeping errors");
assert(/function securityBeforeJudge/m.test(html), "judge path should run security self-checks before validating answers");
assert(/compileAndRunCProgram[\s\S]*securityBeforeJudge/m.test(html), "C judgement should call securityBeforeJudge before execution");
assert(/BACKEND_JUDGE_ENDPOINT/m.test(html), "front-end judge should expose a backend API handoff point");
assert(/function protectInlineResourceBlob/m.test(html), "runtime should support blob-wrapped inline resource protection");
assert(/哎呀！检测到一丝不对劲的气息/.test(html), "tamper prompt should be playful rather than scary");
assert(/哇，你打开了开发者工具/.test(html), "DevTools prompt should welcome exploration with copyright reminder");
assert(/好的，马上刷新/.test(html), "security refresh prompt should include a cute confirmation button");
assert(fs.existsSync("scripts/build-secure-production.cjs"), "secure production build script should exist");
assert(/terser/i.test(html) || /terser/i.test(fs.readFileSync("scripts/build-secure-production.cjs", "utf8")), "secure build should document Terser minification");
assert(/javascript-obfuscator/i.test(fs.readFileSync("scripts/build-secure-production.cjs", "utf8")), "secure build should document JavaScript Obfuscator hardening");
assert(/官方Q群：414374792/.test(html), "announcement/about/completion copy should include the official QQ group");
assert(/const DEFAULT_KEY_BINDINGS\s*=\s*Object\.freeze/m.test(html), "shortcut system should define default safe key bindings");
assert(/const BROWSER_RESERVED_SHORTCUTS\s*=\s*Object\.freeze/m.test(html), "shortcut system should list browser reserved shortcuts");
assert(/class ShortcutManager/m.test(html), "shortcut system should centralize keyboard handling");
assert(/function handleReservedBrowserShortcut/m.test(html), "game should intercept preventable browser shortcuts");
assert(/function toggleGameFullscreen/m.test(html), "game should provide a custom fullscreen toggle");
assert(/function requestGamePointerLock/m.test(html), "game should request pointer lock from the playfield");
assert(/POINTER_LOCK_RETRY_COOLDOWN_MS\s*=\s*1200/m.test(html), "pointer lock should have a cooldown after manual exit");
assert(/lastPointerLockExitAt/m.test(html), "pointer lock exit time should be tracked");
assert(/Promise\.resolve\(request\)[\s\S]*catch[\s\S]*Pointer lock/m.test(html), "pointer lock promise rejections should be caught");
assert(/pointerlockerror/m.test(html), "pointer lock errors should be handled without fatal rejections");
assert(/function toggleBossMode/m.test(html), "game should include Ctrl+Shift+H boss mode");
assert(/id="shortcutConfigList"/m.test(html), "settings should include a shortcut remapping list");
assert(/id="shortcutReferencePanel"/m.test(html), "settings should include a keyboard reference panel");
assert(/id="fullscreenButton"/m.test(html), "settings should include a fullscreen button");
assert(/id="browserShortcutWarning"/m.test(html), "UI should warn about dangerous browser shortcuts");
assert(/id="bossModeOverlay"/m.test(html), "boss mode overlay should exist");
assert(/shortcutManager\.getContextHint/m.test(html), "bottom hint bar should be driven by ShortcutManager");
assert(/Ctrl\+Shift\+S/.test(html) && /Ctrl\+Shift\+R/.test(html), "safe Ctrl+Shift shortcut domain should be documented");
assert(!/body\[data-cinematic-quality="cinematic"\]/m.test(html), "cinematic quality tier should be removed from the render pipeline");
assert(/body\[data-cinematic-quality="low"\][\s\S]*#game canvas/m.test(html), "low quality should visibly reduce post-processing");
assert(!/value="cinematic"/m.test(html), "settings should not include a cinematic option value");
assert(/function shouldRunCinematicFrame/m.test(html), "cinematic effects should be frame-throttled for performance");
assert(/updateSafeSceneFx[\s\S]*shouldRunCinematicFrame\(scene, "cinematicRenderPipeline"\)/m.test(html), "cinematic post-processing should not run every frame on low profiles");
assert(/resetEffectDowngrades[\s\S]*quality downgrades reset/m.test(html), "manual quality changes should clear previous automatic downgrade state");
assert(/body\[data-render-quality="low"\][\s\S]*#cinematicFxCanvas/m.test(html), "low render quality should visibly reduce expensive overlay work");
assert(/const PERFORMANCE_DEGRADE_SEQUENCE\s*=\s*Object\.freeze\(\["ssao", "particles", "bloom"\]\)/m.test(html), "performance downgrade order should be SSAO -> particles -> Bloom");
assert(/class RollingFpsDegrader/m.test(html), "performance system should monitor a rolling FPS window");
assert(/averageWindowMs:\s*5000/m.test(html) && /thresholdFps:\s*22/m.test(html), "performance protection should only trigger after sustained severe FPS drops");
assert(/function suspendSceneForEditor/m.test(html), "editor mode should fully suspend gameplay simulation work");
assert(/function isObjectInsideCameraView/m.test(html), "off-camera animation and particles should be culled");
assert(/const CHAPTER_REGION_LAYOUT\s*=\s*Object\.freeze/m.test(html), "map should define isolated chapter regions");
assert(/const REGION_PORTAL_CONFIG\s*=\s*Object\.freeze/m.test(html), "regions should be connected through explicit portals");
assert(/function getChapterRegionId/m.test(html), "chapters should resolve to a region id");
assert(/function isChapterFragmentUnlocked/m.test(html), "fragments should be gated by chapter unlock state");
assert(/function applyFragmentChapterVisibility/m.test(html), "fragment visibility should be toggled by chapter/region state");
assert(/function unlockNextChapterFragments/m.test(html), "chapter completion should reveal the next chapter fragments");
assert(/function resetCurrentChapterFragments/m.test(html), "settings should support resetting current chapter fragments");
assert(/function createRegionPortals/m.test(html), "scene should create region isolation portals");
assert(/function teleportToRegion/m.test(html), "portals should move the player to the target region");
assert(/function renderRegionWorldMap/m.test(html), "world map should render unlocked/current/locked regions");
assert(!/event\.key === "F1"/m.test(html), "F1 should not be used for in-game shortcuts");
assert(!/event\.key === "F3"/m.test(html), "F3 should not be used for in-game shortcuts");
assert(!/event\.key === "F4"/m.test(html), "F4 should not be used for in-game shortcuts");
assert(!/event\.key === "F5" \|\| \(event\.ctrlKey && event\.key === "Enter"\)/m.test(html), "editor run should not use F5 as a normal shortcut");
assert(/PROGRAMMING_TIPS\s*=\s*Object\.freeze\(\[[\s\S]*\]\)/m.test(html), "loading screen should include a programming tip pool");
assert((html.match(/tip-[a-z0-9-]+/gi) || []).length >= 20, "loading tip pool should contain at least 20 stable entries");
assert(/id="pixelLoadingOverlay"/m.test(html) && /id="loadingProgressFill"/m.test(html), "startup should include a pixel loading progress overlay");
assert(/function updatePixelLoadingProgress/m.test(html), "loading progress should be updated by a dedicated function");
assert(/class LocalStorageSaveCodec/m.test(html), "save system should include a compressed localStorage codec");
assert(/function compressSavePayload/m.test(html) && /function decompressSavePayload/m.test(html), "save data should support LZ-style compression and decompression wrappers");
assert(/function checksumSavePayload/m.test(html), "save data should include a checksum");
assert(/function recoverSaveFromBackup/m.test(html), "save corruption should recover from a valid backup");
assert(/function pruneOldSaveBackups/m.test(html), "settings should be able to clear old save backups");
assert(/id="clearOldSavesButton"/m.test(html), "settings should expose a clear old saves button");
assert(/id="mobileControls"/m.test(html) && /id="virtualJoystick"/m.test(html) && /id="mobileInteractButton"/m.test(html), "touch devices should have virtual joystick and interact button");
assert(/function detectMobileInputMode/m.test(html), "mobile mode should be detected by width and touch capability");
assert(/function applyMobileEditorLayout/m.test(html), "small screens should switch editor to compact layout");
assert(/function installGameErrorBoundary/m.test(html), "game should install an outer error boundary");
assert(/function attemptSceneAutoRepair/m.test(html), "error boundary should try to reload scene data");
assert(/id="errorRecoveryToast"/m.test(html), "recoverable errors should show a pixel repair toast");
assert(/id="audioStartButton"/m.test(html), "main menu should expose a click-to-start audio bootstrap button");
assert(/function initializeAudioFromGesture/m.test(html), "audio context should initialize from a user gesture");
assert(/function playBootAudioCue/m.test(html), "startup audio cue should be generated without extra assets");
assert(/function announceA11yEvent/m.test(html), "important events should be announced through an accessibility helper");
assert(/id="a11yLiveRegion"/m.test(html), "game should include an ARIA live region");
assert(/id="editorContrastToggle"/m.test(html), "editor should include a high contrast toggle");
assert(/const I18N_LOCALES\s*=\s*Object\.freeze/m.test(html), "UI text should be routed through an i18n locale object");
assert(/function tI18n/m.test(html) && /globalThis\.i18n/m.test(html), "i18n should expose a translation function");
assert(/anonymousTelemetryEnabled/m.test(html), "settings should store the optional anonymous telemetry flag");
assert(/function recordTelemetryEvent/m.test(html), "optional telemetry should record local events");
assert(/function flushTelemetryQueue/m.test(html), "optional telemetry should be able to POST when enabled");
assert(/function easeOvershoot/m.test(html), "UI transitions should include a physical overshoot easing helper");
assert(/bezierFragmentArc/m.test(html), "fragment collection should use a bezier arc helper");
assert(/function queueEditorFlowMessage/m.test(html), "editor mode should suppress non-urgent popups");
assert(/function playLayeredRewardSound/m.test(html), "reward audio should support layered pitch progression");
assert(/function updateNpcGazeTracking/m.test(html), "NPCs should track the player nearby");
assert(/function spawnGroundMicroFeedback/m.test(html), "grass and water should react to player movement");
assert(/const KONAMI_SEQUENCE\s*=\s*Object\.freeze/m.test(html), "developer debug easter egg should use the Konami sequence");
assert(/id="devEasterOverlay"/m.test(html), "Konami debug overlay should exist");
assert(/id="codexCollectionPanel"/m.test(html), "codex page should exist");
assert(/function registerCodexDiscovery/m.test(html), "codex should record discoveries");
assert(/function unlockSandboxMode/m.test(html), "sandbox mode should unlock after completion");
assert(/id="sandboxPanel"/m.test(html), "sandbox creation panel should exist");
assert(/function triggerEditorKonamiJoke/m.test(html), "typing konami in the editor should trigger a joke animation");
assert(/function updateDynamicNarrativeHooks/m.test(html), "narrative hooks should react to chapter progress");
assert(/function maybeTriggerRandomWorldEvent/m.test(html), "random world events should be centralized");
assert(/const COMMUNITY_WALL_MESSAGES\s*=\s*Object\.freeze/m.test(html), "community wall should use local preset messages");
assert(/function renderCommunityWall/m.test(html), "community wall should render local simulated messages");
assert(/function startMetaFinaleCommandLine/m.test(html), "true ending should enter a command-line reboot layer");
assert(/developer@example\.com/m.test(html), "developer terminal should expose the fourth-wall contact endpoint");
assert(/id="codeGenesisOverlay"/m.test(html), "code genesis should provide a full-screen terminal overlay");
assert(/id="codeGenesisTerminal"/m.test(html) && /id="codeGenesisPreview"/m.test(html), "code genesis should split terminal and preview regions");
assert(/id="codeGenesisStatusBar"/m.test(html), "code genesis should include a fixed bottom status bar");
assert(/CODE_GENESIS_ACTS\s*=\s*Object\.freeze\(\["awakening", "life", "soul", "foundation", "descent", "handoff"\]\)/m.test(html), "code genesis should define the strict six-act flow");
assert(/function parseCodeGenesisLine/m.test(html), "code genesis should include a C-like parser");
assert(/function submitCodeGenesisLine/m.test(html), "code genesis should process terminal input line by line");
assert(/function completeCodeGenesis/m.test(html), "code genesis should complete through return 0");
assert(/function persistCodeGenesisCharacter/m.test(html), "code genesis should persist character data");
assert(/function shouldShowCodeGenesis/m.test(html), "saved character data should skip code genesis");
assert(/function applyCodeGenesisHudAvatar/m.test(html), "HUD should show the generated avatar");
assert(/function getHpAvatarGlowColor/m.test(html), "avatar glow should depend on HP");
assert(/function getMentorAddressName/m.test(html), "mentor should address the generated name");
assert(/function playCodeGenesisAscensionSound/m.test(html), "code genesis should play the ascension sound");
assert(/<textarea id="codeGenesisInput"/m.test(html), "code genesis editor should be a multiline terminal editor");
assert(/function handleCodeGenesisTerminalKey/m.test(html), "code genesis editor should manually handle keyboard input");
assert(/function handleCodeGenesisReservedBrowserShortcut/m.test(html), "code genesis editor should block browser-reserved shortcuts locally");
assert(/function commitCodeGenesisEditorOperation/m.test(html), "code genesis editor should commit manual text operations");
assert(/function processCodeGenesisBufferedLines/m.test(html), "code genesis editor should process completed terminal lines from the manual buffer");
assert(/function handleCodeGenesisPointerDown/m.test(html), "code genesis editor should manually position cursor on click");
assert(/function handleCodeGenesisDoubleClick/m.test(html), "code genesis editor should manually select words on double click");
assert(/codeGenesisInput[\s\S]*beforeinput[\s\S]*preventDefault/m.test(html), "code genesis editor should suppress browser default text input");
assert(/codeGenesisInput[\s\S]*paste[\s\S]*handleCodeGenesisTerminalKey/m.test(html), "code genesis editor should manually handle paste");
assert(/codeGenesisOverlay[\s\S]*classList\.contains\("active"\)[\s\S]*return/m.test(html), "code genesis overlay should block game global shortcuts while active");
assert(api.createCodeGenesisInitialState, "code genesis state factory should be exported for tests");
assert(api.parseCodeGenesisLine, "code genesis parser should be exported for tests");
assert(/FIXED_GAME_SAVE_PATH\s*=\s*"Application\.persistentDataPath \+ \\"\/gameSave\.json\\""/m.test(html), "startup flow should document the fixed Unity-compatible save path");
assert(/WEB_FIXED_GAME_SAVE_KEY\s*=\s*"gameSave\.json"/m.test(html), "browser build should map the fixed save file to a stable localStorage key");
assert(/function createFixedGameSavePayload/m.test(html), "startup flow should create a fixed JSON save payload");
assert(/function validateFixedGameSaveJson/m.test(html), "startup flow should validate fixed save file JSON");
assert(/function resolveStartupRouteFromSave/m.test(html), "startup flow should decide load-vs-creation from save validity");
assert(/function startGameFlowFromMainMenu/m.test(html), "start button should run the save check before entering the world");
assert(/function transitionMainMenuToCodeGenesis/m.test(html), "main menu to creator should use glitch and light-band transition");
assert(/function loadGameWorld/m.test(html), "valid saves should route through a game-world load coroutine equivalent");
assert(!/code-genesis-startup/.test(html), "code genesis should not auto-open before the player presses start");
assert(api.createFixedGameSavePayload, "fixed save payload creator should be exported for tests");
assert(api.validateFixedGameSaveJson, "fixed save validator should be exported for tests");
assert(api.resolveStartupRouteFromSave, "startup route resolver should be exported for tests");
{
  const state = api.createCodeGenesisInitialState();
  const hp = api.parseCodeGenesisLine("int hp = 88; // healthy", state);
  assert(hp.kind === "assignment" && hp.name === "hp" && hp.value === 88, "code genesis should parse int hp assignment and ignore comments");
  const name = api.parseCodeGenesisLine('char name[] = "Ada";', state);
  assert(name.kind === "assignment" && name.name === "name" && name.value === "Ada", "code genesis should parse char name assignment");
  const level = api.parseCodeGenesisLine(" int level=3 ;", state);
  assert(level.kind === "assignment" && level.name === "level" && level.value === 3, "code genesis should parse int level assignment with whitespace");
  const unknown = api.parseCodeGenesisLine("int mana = 9;", state);
  assert(unknown.kind === "warning" && /mana/.test(unknown.message), "code genesis should warn and ignore unknown attributes");
  const invalidHp = api.parseCodeGenesisLine("int hp = 101;", state);
  assert(invalidHp.kind === "error" && /1-100/.test(invalidHp.message), "code genesis should reject hp outside 1-100");
  const finish = api.parseCodeGenesisLine("return 0;", { hp: 88, name: "Ada", level: 3 });
  assert(finish.kind === "return" && finish.complete === true, "code genesis should accept return 0 when complete");
  const incomplete = api.parseCodeGenesisLine("return 0;", { hp: 88 });
  assert(incomplete.kind === "error" && /name/.test(incomplete.message) && /level/.test(incomplete.message), "code genesis should block return 0 until all fields exist");
  const fixedPayload = api.createFixedGameSavePayload({ hp: 77, name: "Ada", level: 2 });
  const validSave = api.validateFixedGameSaveJson(JSON.stringify(fixedPayload));
  assert(validSave.valid && validSave.data.character.name === "Ada", "fixed save validator should accept complete character saves");
  assert(!api.validateFixedGameSaveJson("").valid, "fixed save validator should reject empty files");
  assert(!api.validateFixedGameSaveJson("{bad json").valid, "fixed save validator should reject malformed JSON");
  assert(api.resolveStartupRouteFromSave(JSON.stringify(fixedPayload)).route === "load", "valid fixed save should load the game world");
  const corruptRoute = api.resolveStartupRouteFromSave("{bad json");
  assert(corruptRoute.route === "create" && /损坏|格式/.test(corruptRoute.message), "corrupt fixed save should route to character creation with an error");
}
assert(/function applyManualEditorKeyOperation/m.test(html), "editor should expose a pure manual keyboard operation engine");
assert(/function manualEditorOperationFromBeforeInput/m.test(html), "mobile soft keyboard beforeinput should be translated into manual editor operations");
assert(/dom\.codeInput\.addEventListener\("beforeinput", handleMobileEditorBeforeInput\)/m.test(html), "editor beforeinput should use the mobile-safe manual input bridge");
assert(/<textarea id="codeInput" inputmode="text" autocomplete="off" autocapitalize="none" autocorrect="off"/m.test(html), "code editor should expose mobile-friendly input attributes");
assert(/function handleManualEditorInputKey/m.test(html), "editor keydown should be manually handled instead of relying on textarea default editing");
assert(/function handleManualEditorPointerDown/m.test(html), "editor should manually place the cursor on pointer down");
assert(/function handleManualEditorDoubleClick/m.test(html), "editor should manually select words on double click");
assert(/if \(!touchPointer\) event\.preventDefault\(\)/m.test(html), "touch pointer down should not suppress the mobile soft keyboard");
assert(/beforeinput[\s\S]*handleMobileEditorBeforeInput[\s\S]*preventDefault/m.test(html), "editor should suppress default browser text editing through the manual bridge while active");
assert(api.applyManualEditorKeyOperation, "manual editor operation engine should be exported for tests");
assert(api.manualEditorOperationFromBeforeInput, "mobile beforeinput operation bridge should be exported for tests");
{
  const insert = api.applyManualEditorKeyOperation({ value: "ab", start: 1, end: 1 }, { key: "X" });
  assert(insert.value === "aXb" && insert.start === 2 && insert.end === 2, "manual editor should insert printable characters");
  const newline = api.applyManualEditorKeyOperation({ value: "    if (ok) {", start: 13, end: 13 }, { key: "Enter" });
  assert(newline.value === "    if (ok) {\n        ", "manual editor Enter should preserve indentation and add block indent");
  const backspace = api.applyManualEditorKeyOperation({ value: "abc\ndef", start: 4, end: 4 }, { key: "Backspace" });
  assert(backspace.value === "abcdef" && backspace.start === 3, "manual editor Backspace at line start should join previous line");
  const del = api.applyManualEditorKeyOperation({ value: "abc\ndef", start: 3, end: 3 }, { key: "Delete" });
  assert(del.value === "abcdef" && del.start === 3, "manual editor Delete at line end should join next line");
  const indent = api.applyManualEditorKeyOperation({ value: "a\nb", start: 0, end: 3 }, { key: "Tab" });
  assert(indent.value === "    a\n    b", "manual editor Tab should indent all selected lines");
  const outdent = api.applyManualEditorKeyOperation({ value: "    a\n    b", start: 0, end: 11 }, { key: "Tab", shiftKey: true });
  assert(outdent.value === "a\nb", "manual editor Shift+Tab should outdent all selected lines");
  const selectAll = api.applyManualEditorKeyOperation({ value: "abc", start: 1, end: 1 }, { key: "a", ctrlKey: true });
  assert(selectAll.start === 0 && selectAll.end === 3, "manual editor Ctrl+A should select all text");
  const wordRight = api.applyManualEditorKeyOperation({ value: "alpha beta", start: 0, end: 0 }, { key: "ArrowRight", ctrlKey: true });
  assert(wordRight.start === 5 && wordRight.end === 5, "manual editor Ctrl+Right should move by word");
  const shiftRight = api.applyManualEditorKeyOperation({ value: "abc", start: 1, end: 1 }, { key: "ArrowRight", shiftKey: true });
  assert(shiftRight.start === 1 && shiftRight.end === 2, "manual editor Shift+Arrow should extend selection");
  const mobileInsert = api.manualEditorOperationFromBeforeInput({ value: "pr", start: 2, end: 2 }, "insertText", "i");
  assert(mobileInsert.value === "pri" && mobileInsert.start === 3, "mobile soft keyboard insertText should add code characters");
  const mobileEnter = api.manualEditorOperationFromBeforeInput({ value: "    if (ok) {", start: 13, end: 13 }, "insertLineBreak");
  assert(mobileEnter.value === "    if (ok) {\n        ", "mobile soft keyboard Enter should preserve indentation");
  const mobileBackspace = api.manualEditorOperationFromBeforeInput({ value: "abc", start: 2, end: 2 }, "deleteContentBackward");
  assert(mobileBackspace.value === "ac" && mobileBackspace.start === 1, "mobile soft keyboard Backspace should delete through manual editor logic");
}
assert(/for \(const chapter of chapters\)[\s\S]*const npc = getNearestNpcInteraction\(this\)/m.test(html), "chapter stones and gates should be checked before nearby NPCs");
assert(/id: "guard"[\s\S]*x: 520,\s*y: 260/m.test(html), "compile guard should be moved away from the first stone interaction radius");
assert(fs.existsSync("scripts/mobile-browser-smoke.cjs"), "mobile Chrome/WebKit smoke script should exist");
assert(/mobile:smoke/.test(fs.readFileSync("package.json", "utf8")), "package scripts should expose mobile:smoke");
assert(/class TutorialAnimationManager/m.test(html), "tutorial animations should be centrally queued by TutorialAnimationManager");
assert(/TUTORIAL_ANIMATION_IDS\s*=\s*Object\.freeze\(\[[\s\S]*"T01_AWAKENING_PROMPT"[\s\S]*"T12_CHAPTER_UNLOCK_ROAD"/m.test(html), "tutorial system should define all 12 core animation ids");
assert(/class TutorialNpcActionController/m.test(html), "tutorial animations should drive NPC action states");
assert(/comeFromDistance|pointToTarget|shakeHead|celebrate/m.test(html), "NPC tutorial action state machine should include baked tutorial motions");
assert(/function preloadTutorialAnimationResources/m.test(html), "tutorial animation resources should be preloaded before use");
assert(/tutorialAnimationManager\.trigger/m.test(html), "gameplay events should trigger tutorial animations through the manager");
assert(/tutorialAnimationManager\.handleEscSkip/m.test(html), "Esc should route through tutorial animation skip logic");
assert(/id="tutorialAnimationToggle"/m.test(html), "settings should expose a tutorial animation toggle");
assert(/tutorialAnimationsEnabled:\s*true/m.test(html), "tutorial animation setting should default on");
assert(/tutorialAnimationManager\.reset/m.test(html), "tutorial animation manager should expose a reset interface");
assert(/objectPoolManager\.acquire\("effect"/m.test(html), "tutorial animation effects should use pooled effect objects");
assert(/强制教学动画建议完整体验/m.test(html), "skipping mandatory tutorial animations should show a friendly recommendation");
assert(/id="worldAdvanceButton"/m.test(html), "existing game HUD should expose an in-project compile/advance button");
assert(/id="infoWorldEvolutionText"/m.test(html), "info side menu should include world evolution completion data");
assert(/worldEvolutionCompletion:\s*0/m.test(html), "world evolution completion should persist in the existing save progress");
assert(/function advanceWorldEvolution/m.test(html), "compile/advance button should update world evolution state in the main project");
assert(/function createWorldEvolutionLayer/m.test(html), "world evolution should render through the existing Phaser scene layer");
assert(/function playWorldEvolutionMilestoneEffect/m.test(html), "world evolution should trigger milestone visual effects");
assert(/dom\.worldAdvanceButton\?\.addEventListener\("click",[\s\S]{0,180}advanceWorldEvolution\(\)/m.test(html), "compile/advance button should be wired to the evolution logic");
assert(/\/\* ===== 头像系统 ===== \*\//m.test(html), "single-file structure should mark the avatar system section");
assert(/function drawRandomPortraitExpression/m.test(html) && /eyebrowAngle/m.test(html) && /mouthStyle/m.test(html), "Canvas NPC portraits should randomize eyebrows and mouth expressions");
assert(/WORLD_EVOLUTION_NARRATIVE_THRESHOLDS\s*=\s*Object\.freeze\(\[30,\s*60,\s*90\]\)/m.test(html), "world evolution should auto-trigger narrative at 30/60/90 percent");
assert(/WORLD_EVOLUTION_EFFECT_THRESHOLDS\s*=\s*Object\.freeze\(\[20,\s*40,\s*60,\s*80,\s*100\]\)/m.test(html), "world evolution should define dedicated threshold performances");
assert(/function spendWorldEvolutionMp/m.test(html) && /function useWorldEvolutionFragmentItem/m.test(html), "compile advance should consume MP and fragments should restore HP/MP");
assert(/id="fragmentStarChartButton"/m.test(html) && /function openFragmentStarChart/m.test(html), "side menu should expose an interactive fragment star chart");
assert(/id="heroCustomizeButton"/m.test(html) && /function applyHeroStylePreset/m.test(html), "side menu should expose hero avatar customization");
assert(/function maybeSpawnWorldGuardianQte/m.test(html) && /function resolveWorldGuardianQte/m.test(html), "compile loop should spawn and resolve guardian QTE events");
assert(/WORLD_EVOLUTION_SAVE_SLOT_KEY/m.test(html) && /function saveWorldEvolutionSlot/m.test(html) && /function loadWorldEvolutionSlot/m.test(html), "world evolution should support localStorage save slots");
assert(/aria-live="polite"[\s\S]*id="worldEvolutionA11y"/m.test(html), "world evolution should include a screen-reader live region");
assert(/function createOffscreenParticleTexture/m.test(html), "world evolution particles should use an offscreen Canvas texture cache");
assert(/WORLD_EVOLUTION_CINEMATIC_STAGES\s*=\s*Object\.freeze/m.test(html), "world evolution should define cinematic stages for 10/30/50/70/90/100 percent");
assert(/function updateWorldEvolutionWeather/m.test(html) && /function cycleWorldEvolutionDayNight/m.test(html), "world evolution should include weather and day-night systems");
assert(/WORLD_EVOLUTION_NPCS\s*=\s*Object\.freeze/m.test(html) && /function handleWorldEvolutionDialogueChoice/m.test(html), "world evolution should include NPC branch dialogue choices");
assert(/function evaluateWorldEvolutionEnding/m.test(html) && /function showWorldEvolutionEnding/m.test(html), "world evolution should evaluate and display multiple endings");
assert(/WORLD_EVOLUTION_ACHIEVEMENTS\s*=\s*Object\.freeze/m.test(html) && /function unlockWorldEvolutionAchievement/m.test(html), "world evolution should include achievements");
assert(/function generateWorldEvolutionShareCard/m.test(html) && /function copyWorldEvolutionShareText/m.test(html), "world evolution should include social sharing cards and copy text");
assert(/function requestWorldEvolutionMicrophone/m.test(html) && /function requestWorldEvolutionCamera/m.test(html), "privacy-gated microphone and camera hooks should exist");
assert(/WORLD_EVOLUTION_QUANTUM_BRANCHES\s*=\s*Object\.freeze/m.test(html) && /function switchWorldEvolutionQuantumBranch/m.test(html), "world evolution should support quantum branch switching");
assert(/function broadcastWorldEvolutionSync/m.test(html) && /function handleWorldEvolutionStorageSync/m.test(html), "world evolution should support cross-tab localStorage communication");
assert(/function toggleWorldEvolutionDevConsole/m.test(html), "world evolution should include the developer console hook");
assert(/WORLD_EVOLUTION_WEATHER_THRESHOLDS\s*=\s*Object\.freeze/m.test(html), "world evolution should define completion-driven weather thresholds");
assert(/WORLD_EVOLUTION_REGIONS\s*=\s*Object\.freeze/m.test(html) && /function switchWorldEvolutionRegion/m.test(html), "world evolution should unlock regions and switch camera views");
assert(/WORLD_EVOLUTION_RANDOM_EVENTS\s*=\s*Object\.freeze/m.test(html) && /function maybeTriggerWorldEvolutionRandomEvent/m.test(html), "compile should be able to trigger random world events");
assert(/function handleWorldEvolutionHotkey/m.test(html) && /function installWorldEvolutionTouchGestures/m.test(html), "world evolution should support keyboard shortcuts and touch gestures");
assert(/function captureWorldEvolutionScreenshot/m.test(html) && /id="worldEvolutionScreenshotButton"/m.test(html), "world evolution should include screenshot sharing");
assert(/WORLD_EVOLUTION_UI_THEMES\s*=\s*Object\.freeze/m.test(html) && /function applyWorldEvolutionUiTheme/m.test(html), "world evolution should support saved UI themes");
assert(/function renderWorldEvolutionMirror/m.test(html) && /id="worldEvolutionMirrorText"/m.test(html), "world evolution should render async multiplayer traces and mirror stats");
assert(/WORLD_EVOLUTION_MEMORY_FRAGMENTS\s*=\s*Object\.freeze/m.test(html) && /function unlockWorldEvolutionMemoryFragment/m.test(html), "world evolution should collect story fragments into a codex");
assert(/function beginWorldEvolutionNewGamePlus/m.test(html) && /worldEvolutionNewGamePlus/m.test(html), "world evolution should include ending and new-game-plus lifecycle");

console.log(`validated ${expectedIds.length} C tutorial chapters and quality systems`);
assert(/event\.key\s*===\s*"Tab"[\s\S]{0,220}toggleInfoSideMenu\(\)/m.test(html), "Tab should toggle the in-game function info menu without using browser focus traversal");

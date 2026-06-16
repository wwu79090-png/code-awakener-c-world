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
  context.window.window = context.window;
  context.window.self = context.window;
  context.window.globalThis = context.window;
  context.window.Phaser = context.Phaser;
  vm.createContext(context);
  vm.runInContext(`${script}
globalThis.__gameApi = {
  chapters,
  chapterById,
  inspectCBeforeRun,
  inspectRunnableCBeforeRun: typeof inspectRunnableCBeforeRun === "function" ? inspectRunnableCBeforeRun : undefined,
  isLenientChallengePass: typeof isLenientChallengePass === "function" ? isLenientChallengePass : undefined,
  createEditorFilesForTask: typeof createEditorFilesForTask === "function" ? createEditorFilesForTask : undefined,
  validateEditorSubmissionForCurrentTask: typeof validateEditorSubmissionForCurrentTask === "function" ? validateEditorSubmissionForCurrentTask : undefined,
  validateExactTaskCode: typeof validateExactTaskCode === "function" ? validateExactTaskCode : undefined,
  findFirstExactCodeDifference: typeof findFirstExactCodeDifference === "function" ? findFirstExactCodeDifference : undefined,
  buildCompileFailureHelp: typeof buildCompileFailureHelp === "function" ? buildCompileFailureHelp : undefined,
  buildCompileErrorSystemLogLines: typeof buildCompileErrorSystemLogLines === "function" ? buildCompileErrorSystemLogLines : undefined,
  resetEditorAfterCompileFailure: typeof resetEditorAfterCompileFailure === "function" ? resetEditorAfterCompileFailure : undefined,
  simulateCOutput,
  autoInjectStdIoHeader,
  normalizeProgramOutput,
  compareProgramOutput,
  createInitialGameData,
  resetGameData,
  parseCodeGenesisLine: typeof parseCodeGenesisLine === "function" ? parseCodeGenesisLine : undefined,
  createCodeGenesisInitialState: typeof createCodeGenesisInitialState === "function" ? createCodeGenesisInitialState : undefined,
  deriveCodeGenesisGuideStateFromSource: typeof deriveCodeGenesisGuideStateFromSource === "function" ? deriveCodeGenesisGuideStateFromSource : undefined,
  getCodeGenesisNextGuideIndex: typeof getCodeGenesisNextGuideIndex === "function" ? getCodeGenesisNextGuideIndex : undefined,
  createFixedGameSavePayload: typeof createFixedGameSavePayload === "function" ? createFixedGameSavePayload : undefined,
  validateFixedGameSaveJson: typeof validateFixedGameSaveJson === "function" ? validateFixedGameSaveJson : undefined,
  resolveStartupRouteFromSave: typeof resolveStartupRouteFromSave === "function" ? resolveStartupRouteFromSave : undefined,
  applyManualEditorKeyOperation: typeof applyManualEditorKeyOperation === "function" ? applyManualEditorKeyOperation : undefined,
  manualEditorOperationFromBeforeInput: typeof manualEditorOperationFromBeforeInput === "function" ? manualEditorOperationFromBeforeInput : undefined,
  C_TUTORIAL_COURSE: typeof C_TUTORIAL_COURSE !== "undefined" ? C_TUTORIAL_COURSE : undefined,
  QUEST_DATA: typeof QUEST_DATA !== "undefined" ? QUEST_DATA : undefined,
  getStonePuzzleSpec: typeof getStonePuzzleSpec === "function" ? getStonePuzzleSpec : undefined,
  repairLegacyBeginnerQuestInventory: typeof repairLegacyBeginnerQuestInventory === "function" ? repairLegacyBeginnerQuestInventory : undefined,
  C_VISUAL_ENTITY_MAP: typeof C_VISUAL_ENTITY_MAP !== "undefined" ? C_VISUAL_ENTITY_MAP : undefined,
  DEVELOP_FAN_C_LANGUAGE_PATH: typeof DEVELOP_FAN_C_LANGUAGE_PATH !== "undefined" ? DEVELOP_FAN_C_LANGUAGE_PATH : undefined,
  flattenCTutorialSnippets: typeof flattenCTutorialSnippets === "function" ? flattenCTutorialSnippets : undefined,
  buildExecutionPlanForSnippet: typeof buildExecutionPlanForSnippet === "function" ? buildExecutionPlanForSnippet : undefined,
  getTutorialDifficultyTiming: typeof getTutorialDifficultyTiming === "function" ? getTutorialDifficultyTiming : undefined,
  destroyKnowledgeFragment: typeof destroyKnowledgeFragment === "function" ? destroyKnowledgeFragment : undefined,
  compressSavePayload: typeof compressSavePayload === "function" ? compressSavePayload : undefined,
  decompressSavePayload: typeof decompressSavePayload === "function" ? decompressSavePayload : undefined,
  escapeHtml: typeof escapeHtml === "function" ? escapeHtml : undefined
};
if (typeof window !== "undefined") window.__gameApi = globalThis.__gameApi;
if (typeof self !== "undefined") self.__gameApi = globalThis.__gameApi;`, context);
  return context.__gameApi;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const api = loadGameScript();
const html = fs.readFileSync("programming-rpg-c-basics.html", "utf8");
const officialSiteHtml = fs.existsSync("official-site.html") ? fs.readFileSync("official-site.html", "utf8") : "";
const buildScript = fs.existsSync("build-single-html.cjs") ? fs.readFileSync("build-single-html.cjs", "utf8") : "";
const initialBodyMarkup = html.match(/<body[\s\S]*?<script\b/)?.[0] || "";
const cspContent = html.match(/Content-Security-Policy" content="([^"]+)"/)?.[1] || "";
const rawStyleContent = html.match(/<style[^>]*>([\s\S]*?)<\/style>/)?.[1] || "";
const rawInlineScriptContent = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)]
  .find((match) => !/src=/.test(match[1]))?.[2] || "";
function sha256Directive(source) {
  return `sha256-${crypto.createHash("sha256").update(source, "utf8").digest("base64")}`;
}
const expectedIds = [
  "overview",
  "hello",
  "syntax",
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
assert(Array.isArray(api.DEVELOP_FAN_C_LANGUAGE_PATH) && api.DEVELOP_FAN_C_LANGUAGE_PATH.length === 15, "develop.fan C path should be captured as 15 main sections");
assert(api.DEVELOP_FAN_C_LANGUAGE_PATH[0].title === "C 语言概述", "develop.fan path should start with C overview");
assert(api.DEVELOP_FAN_C_LANGUAGE_PATH[14].title === "高级主题和最佳实践", "develop.fan path should end with advanced best practices");
assert(api.chapterById.overview.coursePathIndex === 1 && api.chapterById.hello.coursePathIndex === 2 && api.chapterById.syntax.coursePathIndex === 3, "first playable chapters should follow develop.fan ordering");
assert(api.chapterById["best-practices"]?.coursePathIndex === 15, "final chapter should map to develop.fan section 15");

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
  overview: `#include <stdio.h>
int main(void) {
  printf("C language");
  return 0;
}`,
  hello: `#include <stdio.h>
int main(void) {
  printf("Hello, C World!");
  return 0;
}`,
  syntax: `#include <stdio.h>
int main(void) {
  // 说明：这行注释不会执行
  printf("syntax ok");
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
assert(api.compareProgramOutput(" Hello World \n", "HelloWorld").ok, "output comparison should ignore output whitespace");
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
assert(api.isLenientChallengePass(looseVariableSolution, api.chapterById.variables, "7"), "runtime judge should pass runnable C solutions only when output matches");
assert(!api.isLenientChallengePass(looseVariableSolution, api.chapterById.variables, "8"), "runtime judge should reject runnable code when output does not match the task target");
const whitespaceOutputSolution = `#include <stdio.h>
int main(void) {
  int a = 10;
  // extra code and comments do not matter when stdout matches
  printf("  Hello, C World!\\n");
  return 0;
}`;
assert(api.inspectRunnableCBeforeRun(whitespaceOutputSolution, api.chapterById.hello) === "", "runtime judge should ignore comments, variables, and extra non-output code");
assert(api.compareProgramOutput(api.simulateCOutput(whitespaceOutputSolution, api.chapterById.hello), api.chapterById.hello.output).ok, "runtime judge should pass when normalized stdout matches expected output");
const noOutputSolution = `#include <stdio.h>
int main(void) {
  int a = 10;
  return 0;
}`;
assert(api.simulateCOutput(noOutputSolution, api.chapterById.hello) === "", "programs without output should not be filled with the expected answer");
assert(!api.compareProgramOutput(api.simulateCOutput(noOutputSolution, api.chapterById.hello), api.chapterById.hello.output).ok, "programs without matching stdout should fail");
const syntaxBrokenSolution = `#include <stdio.h>
int main(void) {
  int score = 7
  printf("%d", score);
  return 0;
}`;
assert(api.inspectRunnableCBeforeRun(syntaxBrokenSolution, api.chapterById.variables).includes("缺少分号"), "runtime judge should still reject real syntax errors");
const undeclaredVariableSolution = `#include <stdio.h>
int main(void) {
  int score = 7;
  printf("%d", level);
  return 0;
}`;
assert(api.inspectRunnableCBeforeRun(undeclaredVariableSolution, api.chapterById.variables).includes("未声明"), "runtime judge should reject printf arguments that were not declared");
const chineseSemicolonSolution = `#include <stdio.h>
int main(void) {
  int score = 7；
  printf("%d", score);
  return 0;
}`;
const chineseSemicolonIssue = api.inspectRunnableCBeforeRun(chineseSemicolonSolution, api.chapterById.variables);
assert(chineseSemicolonIssue.includes("第3行，第16列") && chineseSemicolonIssue.includes("中文符号“；”") && chineseSemicolonIssue.includes("英文半角分号"), "runtime judge should precisely explain Chinese semicolon syntax errors");
const chineseIncludeIssue = api.inspectCBeforeRun(`#include ＜stdio.h＞
int main(void) {
  printf("Hello, C World!");
  return 0;
}`, api.chapterById.hello);
assert(chineseIncludeIssue.includes("全角小于号") && chineseIncludeIssue.includes("修正示例"), "challenge inspector should explain full-width include delimiters before generic missing include errors");
const returnOutsideMainSolution = `#include <stdio.h>
int main(void) {
  printf("C language");
}
return 0;`;
const returnOutsideIssue = api.inspectRunnableCBeforeRun(returnOutsideMainSolution, api.chapterById.overview);
assert(returnOutsideIssue.includes("第5行") && returnOutsideIssue.includes("return 0; 写在 main 函数外面"), "runtime judge should report return outside main with the real line number");
assert(/inspectInstantSyntax[\s\S]*inspectLocaleSyntaxIssue/m.test(html), "instant syntax check should use the detailed locale punctuation diagnostics");
assert(typeof api.createEditorFilesForTask === "function", "task editor file lifecycle helper should exist");
assert(typeof api.validateEditorSubmissionForCurrentTask === "function", "compile button should use a dedicated preflight validator");
{
  const freshFiles = api.createEditorFilesForTask(api.chapterById.hello, { clearMain: true });
  assert(freshFiles["main.c"] === "", "opening a new stone task should force main.c to an empty input");
  assert(freshFiles["README.md"] === api.chapterById.hello.files["README.md"], "clearing main.c for a new task should keep task README content");
}
{
  const exactHelloSource = `#include <stdio.h>

int main(void) {
  printf("Hello, C World!");
  return 0;
}`;
  assert(api.chapterById.hello.taskId === "hello", "each task should expose a unique taskId");

  const exactCompile = api.validateEditorSubmissionForCurrentTask(exactHelloSource, api.chapterById.hello, "hello", "hello", { attemptNumber: 1 });
  assert(exactCompile.ok, "source identical to exactCode should pass compile preflight");
  const trailingBlankCompile = api.validateEditorSubmissionForCurrentTask(`${exactHelloSource}\n\n`, api.chapterById.hello, "hello", "hello", { attemptNumber: 1 });
  assert(trailingBlankCompile.ok, "extra blank lines at the end should be ignored by preflight");
  const reindentedCompile = api.validateEditorSubmissionForCurrentTask(exactHelloSource.replace("  printf", "    printf").replace("  return", " return"), api.chapterById.hello, "hello", "hello", { attemptNumber: 1 });
  assert(reindentedCompile.ok, "indentation width differences should not block compilation preflight");
  const changedCommentCompile = api.validateEditorSubmissionForCurrentTask(`#include <stdio.h>

int main(void) {
    // any learner note is acceptable
    printf("Hello, C World!");
    return 0;
}`, api.chapterById.hello, "hello", "hello", { attemptNumber: 1 });
  assert(changedCommentCompile.ok, "comment differences should not block compilation preflight");
  const renamedVariableCompile = api.validateEditorSubmissionForCurrentTask(looseVariableSolution, api.chapterById.variables, "variables", "variables", { attemptNumber: 1 });
  assert(renamedVariableCompile.ok, "variable-name differences should pass preflight when C syntax is runnable");
  const syntaxPreflight = api.validateEditorSubmissionForCurrentTask(syntaxBrokenSolution, api.chapterById.variables, "variables", "variables", { attemptNumber: 1 });
  assert(!syntaxPreflight.ok && syntaxPreflight.message.includes("缺少分号"), "preflight should still reject real C syntax errors");
  const emptyPreflight = api.validateEditorSubmissionForCurrentTask("", api.chapterById.hello, "hello", "hello", { attemptNumber: 1 });
  assert(!emptyPreflight.ok && emptyPreflight.message.includes("代码不能为空"), "preflight should reject empty submissions with a compiler-style error");

  const staleTaskCompile = api.validateEditorSubmissionForCurrentTask(exactHelloSource, api.chapterById.hello, "syntax", "syntax");
  assert(!staleTaskCompile.ok && staleTaskCompile.message.includes("编译错误") && staleTaskCompile.message.includes("任务ID"), "compile validation should reject submissions for a stale or mismatched task id");
}
assert(!/return validateExactTaskCode\(source,\s*chapter,\s*options\)/m.test(html), "compile preflight should no longer require exact source-code matching");
assert(/validateEditorSubmissionForCurrentTask\(rawCCode,\s*chapter,\s*gameState\.activeChallengeId,\s*gameState\.activeChallengeId\)/m.test(html), "runChallenge should validate task identity and syntax before running world commands");
assert(!/renderExactCodeReferenceForCurrentTask\(preflight\)/m.test(html), "compile preflight failures should not render a full copy-only target answer");
assert(/restoreEditorSourceAfterFailedRun\(userSourceBeforeRun,\s*preflight\.reason/m.test(html), "compile preflight failures should preserve the user's erroneous text for in-place correction");
assert(/function formatCompileErrorMessage/m.test(html) && /appendCompileFailureHelp\(failureMessage,\s*chapter,\s*penalty\.failureCount\)/m.test(html), "all failed compile paths should display a compile-error message with non-blocking help while preserving editor text");
assert(typeof api.buildCompileFailureHelp === "function", "compile failures should expose a non-blocking help builder");
assert(typeof api.buildCompileErrorSystemLogLines === "function", "compile error popup should build testable diagnostic lines");
{
  const lines = api.buildCompileErrorSystemLogLines("编译错误：[第5行] return 0; 写在 main 函数外面。", 5).join("\n");
  assert(lines.includes("第5行") && lines.includes("return 0; 写在 main 函数外面") && !lines.includes("检查第1行"), "compile error popup should show the real diagnostic instead of a fake first-line semicolon hint");
}
assert(/function skipSystemLogWindow/m.test(html) && /dom\.systemLogOverlay\?\.addEventListener\("click"[\s\S]*skipSystemLogWindow/m.test(html), "system log popups should be skippable or accelerated by click");
assert(/dom\.systemLogOverlay\?\.classList\.contains\("active"\)[\s\S]*skipSystemLogWindow\(\)/m.test(html), "system log popups should be skippable or accelerated by keyboard");
assert(api.buildCompileFailureHelp(api.chapterById.variables, 2) === "", "compile help should stay quiet before the third failed attempt");
{
  const help = api.buildCompileFailureHelp(api.chapterById.variables, 3);
  assert(help.includes("连续编译失败 3 次") && help.includes("核心示例") && help.includes("int level = ___;"), "third compile failure should show an incomplete core code example");
  assert(help.includes("检查变量名是否拼写正确") && help.includes("检查分号是否遗漏"), "third compile failure should show common error checks");
}
assert(/selectFile\("main\.c",\s*\{\s*skipSaveCurrent:\s*true\s*\}\)/m.test(html), "opening a new stone should not save the previous stone input back into main.c");
assert(/clearEditorSourceForTask\(chapterId\)/m.test(html), "opening a new stone should explicitly clear the visible code input lifecycle state");
assert(!/localStorage\.setItem\([^)]*(?:codeInput|main\.c|activeChallengeCode|lastCode)/m.test(html), "stone editor source should not be persisted through localStorage across tasks or scenes");

const qualityMarkers = [
  "Press Start 2P",
  "id=\"hpMeter\"",
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
assert(/<button id="closeEditorButton" class="close-button">关闭编辑器<\/button>/m.test(html), "editor should expose an explicit close-editor button");
assert(/event\.key === "Escape" && gameState\.editorOpen[\s\S]*closeEditor\(true\)/m.test(html), "Esc should always close the editor while it is open");
assert(/editorErrorLinePulse 620ms steps\(2, end\) 1/m.test(html), "compile error line should flash once when highlighted");
assert(/--editor-safe-top:[\s\S]*env\(safe-area-inset-top\)[\s\S]*--editor-safe-bottom:[\s\S]*env\(safe-area-inset-bottom\)/m.test(html), "mobile editor should expose safe-area CSS variables for notched screens");
assert(/function applyEditorSafeArea\(\)[\s\S]*visualViewport[\s\S]*--mobile-visual-height[\s\S]*--mobile-visual-offset-top/m.test(html), "mobile editor should recalculate safe area and visual viewport dimensions");
assert(/window\.addEventListener\("orientationchange",\s*applyEditorSafeArea\)/m.test(html), "mobile editor should refresh layout when device orientation changes");
assert(/body\.mobile-input\.is-editor-open #editorOverlay\s*\{[\s\S]*position:\s*fixed[\s\S]*padding:\s*max\(6px,\s*var\(--editor-safe-top\)\)\s+max\(8px,\s*var\(--editor-safe-right\)\)\s+max\(6px,\s*var\(--editor-safe-bottom\)\)\s+max\(8px,\s*var\(--editor-safe-left\)\)/m.test(html), "mobile editor overlay should stay inside the safe visual area");
assert(/body\.mobile-input \.vscode-window\s*\{[\s\S]*grid-template-rows:\s*minmax\(38px,\s*auto\)\s+minmax\(0,\s*1fr\)\s+minmax\(118px,\s*26dvh\)[\s\S]*min-height:\s*0/m.test(html), "mobile editor panel should use top, flexible editor, and fixed console rows");
assert(/@media\s*\(max-width:\s*1100px\),\s*\(pointer:\s*coarse\)\s*\{[\s\S]*body\.mobile-input \.vscode-window/m.test(html), "tablet-sized editor viewports should share the compact single-column editor layout");
assert(/body\.mobile-input \.console-actions\s*\{[\s\S]*display:\s*grid[\s\S]*grid-template-areas:\s*"run reset close"[\s\S]*"label status status"/m.test(html), "mobile editor action buttons should remain visible in a fixed bottom grid");
assert(/body\.mobile-input #codeInput\s*\{[\s\S]*overflow:\s*auto[\s\S]*-webkit-overflow-scrolling:\s*touch[\s\S]*overscroll-behavior:\s*contain/m.test(html), "mobile editor code input should be an internally scrollable input viewport");
assert(/const active = Boolean\(narrow \|\| coarse \|\| touch\)/m.test(html), "narrow editor viewports should use the mobile editor layout even when touch detection is unavailable");
assert(/body\.mobile-input \.vscode-window\.code-block-guided \.editor-main\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)/m.test(html), "mobile guided-code editor should collapse explicit desktop columns so the code area fills the screen");
assert(/body\.mobile-input \.code-wrap\s*\{[\s\S]*grid-template-columns:\s*clamp\(28px,\s*8vw,\s*34px\)\s+minmax\(0,\s*1fr\)/m.test(html), "mobile editor line-number gutter should stay compact so code remains visible on narrow phones");
assert(/\.vscode-window\.code-explain-collapsed \.editor-main\s*\{[\s\S]*grid-template-columns:\s*210px minmax\(0,\s*1fr\) 260px 46px/m.test(html), "collapsing the mentor analysis panel should shrink its grid column instead of reserving the full desktop width");
assert(/function setCodeExplainCollapsed[\s\S]*code-explain-collapsed[\s\S]*dom\.codeExplainToggleButton\?\.addEventListener\("click",\s*\(\)\s*=>\s*setCodeExplainCollapsed\(\)\)/m.test(html), "mentor analysis collapse button should update the editor window layout class");

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
  "data-menu-action=\"official\"",
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
assert(/body\.mobile-input \.menu-screen\s*\{[\s\S]*position:\s*fixed[\s\S]*width:\s*100vw[\s\S]*height:\s*100dvh/m.test(html), "mobile main menu overlay should be fixed to the viewport instead of the desktop game canvas");
assert(/body\.mobile-input \.main-menu-card\s*\{[\s\S]*width:\s*min\(430px,\s*calc\(100vw - 20px\)\)[\s\S]*max-height:\s*calc\(100dvh - 20px\)/m.test(html), "mobile main menu card should fit within the visible viewport");
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
assert(/\.code-meter/m.test(html), "status meters should use code-style progress bars");
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
assert(!/id="skinSelect"/m.test(initialBodyMarkup), "main menu should no longer expose skin selection before character creation");
assert(/id="postGenesisSetupOverlay"/m.test(html) && /data-post-genesis-difficulty="easy"/m.test(html) && /data-post-genesis-skin="neonBlue"/m.test(html), "difficulty and skin should be chosen immediately after character creation");
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
assert(/ULTIMATE_QUALITY_PROFILES\s*=\s*Object\.freeze/m.test(html), "quality tiers should be centralized for low/high rendering");
assert(!/id="renderQualitySelect"/m.test(html), "stable white-screen protection should be internal and no longer expose a manual render-quality selector");
assert(!/<label[^>]*class="setting-row"[\s\S]{0,260}稳定档位[\s\S]{0,260}防白屏[\s\S]{0,120}<\/label>/m.test(html), "settings should not show the confusing anti-white-screen quality row");
assert(/id="openGameSettingsButton"/m.test(html), "in-game side menu should expose a game settings button for mobile players");
const qualityProfileBlock = html.match(/const ULTIMATE_QUALITY_PROFILES\s*=\s*Object\.freeze\(\{[\s\S]*?\}\);/)?.[0] || "";
assert(!/medium\s*:/.test(qualityProfileBlock), "stable render-quality profiles should not keep a hidden medium tier");
assert(/quality === "ultra"[\s\S]*quality === "medium"[\s\S]*return "high"/m.test(html), "old medium render-quality saves should migrate to high");
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
assert(!/URL\.createObjectURL\(new Blob\(\[SERVICE_WORKER_SOURCE\]/m.test(html), "offline cache should not attempt invalid blob: service worker registration");
assert(!/console\.warn\("\[offline-cache\]/m.test(html), "offline cache fallback should stay out of console warning/error logs during normal single-file launches");
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
assert(/touch-action:\s*pan-y/m.test(html), "mobile info side menu should allow native vertical panning");
assert(/mode:\s*"menuCloseSwipe"[\s\S]*startY:\s*firstTouch\.clientY[\s\S]*pending:\s*true/m.test(html), "menu close swipe should track vertical movement before capturing touch events");
assert(/Math\.abs\(deltaY\)\s*>\s*8[\s\S]*Math\.abs\(deltaY\)\s*>\s*Math\.abs\(deltaX\)[\s\S]*drawerGesture\s*=\s*null[\s\S]*return/m.test(html), "vertical swipes inside the mobile menu should be released for native scrolling");
assert(/id="infoTaskText"/m.test(html) && /id="infoFragmentText"/m.test(html), "side info menu should include task and fragment status");
assert(/id="infoHpText"/m.test(html), "side info menu should include HP");
assert(/id="fragmentLocationList"/m.test(html), "side info menu should explain exact fragment positions");
assert(!/id="textSpeedSlider"/m.test(initialBodyMarkup), "side info menu should not include text speed controls");
assert(/id="manualSaveButton"/m.test(html), "side info menu should include a manual save button");
assert(/manualSaveButton\?\.addEventListener\("click"[\s\S]*saveGame\(\)[\s\S]*进度已手动保存/m.test(html), "manual save button should save the game and show island feedback");
assert(/Number\(gameState\.codeAccuracy\)/m.test(html), "side info menu HP should read the actual codeAccuracy state");
assert(!/id="infoMpText"|id="infoMpFill"|id="mpMeter"|id="mpValue"|useMpShardButton/.test(html), "MP UI should be removed from the player interface");
assert(!/Number\(gameState\.hp\)/m.test(html) && !/Number\(gameState\.mp\)/m.test(html), "side info menu should not read undefined hp/mp fields");
assert(!/id="infoEquipText"/m.test(initialBodyMarkup), "side info menu should not include an equipped-fragment explainer");
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
{
  assert(typeof api.getStonePuzzleSpec === "function" && api.QUEST_DATA?.collect_basic_fragments, "beginner quest and stone puzzle data should be available to tests");
  const beginnerRequiredKeywords = api.QUEST_DATA.collect_basic_fragments.requirement.keywords;
  const firstStoneSpec = api.getStonePuzzleSpec(api.chapters[0].id);
  const firstVisibleKeywords = [firstStoneSpec.answer, ...firstStoneSpec.decoys];
  assert(beginnerRequiredKeywords.every((keyword) => firstVisibleKeywords.includes(keyword)), "beginner collect quest should be completable from the first visible stone fragments");
  assert(typeof api.repairLegacyBeginnerQuestInventory === "function", "legacy beginner fragment repair helper should exist");
  const repairedBeginnerInventory = api.repairLegacyBeginnerQuestInventory(
    ["printf", "scanf", "return"],
    ["overview:printf:0", "overview:scanf:1", "overview:return:2"]
  );
  assert(repairedBeginnerInventory.repaired && repairedBeginnerInventory.codeInventory.includes("int"), "old saves with the previous scanf beginner fragment should be credited with int");
  assert(repairedBeginnerInventory.collectedFragmentKeys.includes("overview:int:1"), "old saves should mark the replacement first-stone int fragment as collected");
}
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
assert(/function getRealityDatePassword/m.test(html), "date.lock should derive its password from the local computer date");
assert(!/function openRealityPasswordPuzzle\(\)\s*\{[\s\S]*?window\.prompt/m.test(html), "date.lock should auto-detect the local date instead of using prompt()");
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
assert(!/id="devConsoleOverlay"|commands:[^\n]*set door_locked|commands:[^\n]*tp x y|commands:[^\n]*editor\.enable\(\)|commands:[^\n]*saveMapJson\(\)/m.test(html), "player build should not expose hidden developer console cheat commands");
assert(/function loadWorldPack/m.test(html), "world registry should support lazy world-pack loading");
assert(/worldPacks\s*:\s*new\s+Map/m.test(html), "world registry should track world packs independently");
assert(/VISUAL_REGRESSION_TARGETS\s*=\s*Object\.freeze/m.test(html), "visual regression targets should be documented in code");
assert(/class PerformanceBudgetMonitor/m.test(html), "development mode should monitor FPS and particle budgets");
assert(/id="performanceBudgetPanel"/m.test(html), "performance budget panel should exist");
assert(/performanceMode:\s*"high"/m.test(html), "default performance mode should start at high without auto lowering");
assert(/renderQuality:\s*"high"/m.test(html), "default render quality should start at high");
assert(/cinematicQuality:\s*CINEMATIC_RENDER_MODES\.high/m.test(html), "default cinematic quality should start at high");
assert(/function isLowPowerCinematicViewport/m.test(html), "cinematic scheduler should detect mobile low-power viewports before FPS collapses");
assert(/const lowPower = isLowPowerCinematicViewport\(\) \|\|/m.test(html), "mobile low-power viewports should use the low-power cinematic frame budget immediately");
assert(/isLowPowerCinematicViewport\(\) && \["ssao", "proceduralGrass", "depthFog"\]\.includes\(feature\)/m.test(html), "mobile low-power viewports should skip expensive SSAO, grass and fog before emergency downgrade warnings");
assert(/applyNextDowngrade\(average[\s\S]*if \(isLowPowerCinematicViewport\(\)\) return false;[\s\S]*const runtime = gameState\.runtimeRenderDowngrade/m.test(html), "rolling FPS monitor should not warn-downgrade effects already bypassed by the mobile low-power budget");
assert(/if \(severeDrop && !isLowPowerCinematicViewport\(\) && now - this\.lastLogAt > 12000/m.test(html), "severe FPS logging should stay quiet when mobile low-power budgeting already handled the render load");
assert(/average < 22[\s\S]*getPerformanceModeId\(\) !== "low"[\s\S]*!isLowPowerCinematicViewport\(\)[\s\S]*applyPerformanceMode\("low"/m.test(html), "emergency performance governor should avoid duplicate low-mode warnings on mobile low-power viewports");
assert(!/<option value="auto">自动检测<\/option>/m.test(html), "stable render-quality selector should not expose auto-detect");
assert(!/<option value="auto">启动自动基准<\/option>/m.test(html), "performance selector should not expose startup benchmark mode");
assert(/const STARTUP_BENCHMARK_MS = 0/m.test(html), "startup should not run a benchmark that can lower the user's FPS settings");
assert(/function getAutoPerformanceModeId/m.test(html), "automatic performance mode should reuse a cached benchmark result");
assert(/getPerformanceModeId\(\) === "low" \? "low" : "high"/m.test(html), "render-quality auto mode should prefer high quality by default");
assert(/qualityRuntimeStatusLastAt/m.test(html), "runtime status text should be throttled to avoid settings-panel jitter");
assert(/#qualityRuntimeStatus[\s\S]*min-width:\s*220px/m.test(html), "runtime status label should reserve stable width");
assert(!/\["renderQuality",\s*"performanceMode",\s*"ssr"/m.test(html), "stable render-quality changes should not reset every runtime downgrade");
assert(!/renderQualitySelect\?\.addEventListener\("change"/m.test(html), "removed render-quality selector should not keep a dangling change listener");
assert(/bindFastTouchAction\(dom\.openGameSettingsButton[\s\S]*menuManager\.openSettings\("game"\)/m.test(html), "mobile side-menu game settings button should open the settings panel");
assert(/SERVICE_WORKER_REGISTRATION_PATH/m.test(html), "offline cache should use an explicit same-origin service-worker path when one is available");
assert(/function registerOfflineServiceWorker/m.test(html), "offline cache support should be guarded and registerable");
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
assert(!/data-menu-action="skip"|跳关|一键通关/m.test(html), "player build should not expose skip-level or one-click-clear actions");
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
assert(/ADAPTIVE_BGM_THEMES\s*=\s*Object\.freeze\(\{[\s\S]*town:[\s\S]*puzzle:[\s\S]*battle:[\s\S]*night:/m.test(html), "BGM should provide multiple adaptive scene themes");
assert(/BGM_EVENT_VARIATIONS\s*=\s*Object\.freeze\(\{[\s\S]*pickup[\s\S]*compilePass[\s\S]*compileError[\s\S]*night[\s\S]*day/m.test(html), "BGM should queue event variations instead of looping one short melody");
assert(/queueBgmVariation\(kind = "pickup"\)/m.test(html) && /getAdaptiveBgmSection\(mode = this\.bgmMode\)/m.test(html), "AudioManager should rotate sections and event variations");
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
assert(/function playSoftSceneWash/m.test(html), "high stability effects should use a soft transparent screen wash instead of a white camera flash");
assert(!/cameras?\.main\.flash|cameras\?\.main\?\.flash|\.flash\?\.\(/m.test(html), "Phaser camera flash should not be used because it causes white-screen flicker at high stability");
const questFlashBlock = html.match(/#questFlash\s*\{([\s\S]*?)\n\s*\}/)?.[1] || "";
assert(!/background:\s*white/i.test(questFlashBlock), "quest feedback flash should not use an opaque white overlay");
const crtNoiseBlock = html.match(/function drawCrtNoise\(\)\s*\{([\s\S]*?)\n\s*\}/)?.[1] || "";
assert(!/createImageData/.test(crtNoiseBlock) && !/Math\.random\(\)\s*\*\s*255/.test(crtNoiseBlock), "CRT noise must not fill the whole viewport with high-density white pixels");
assert(/#crtNoiseCanvas\s*\{[\s\S]*display:\s*none;[\s\S]*opacity:\s*0;/m.test(html), "CRT noise canvas should stay hidden to avoid white-dot flicker");
assert(/filmGrain:\s*0/m.test(html) && /if \(budget\.filmGrain <= 0\.006\) return false/m.test(html), "film grain should be disabled instead of drawing flickering dots");
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
assert(/id="creditsOverlay"[\s\S]*感谢 花海 为本游戏提供宣传协力支持[\s\S]*QQ：2256713629[\s\S]*手机：13072295416[\s\S]*再次感谢花海的帮助与推广/m.test(html), "credits should include the requested Huahai acknowledgement and contact details");
assert(/UPDATE_ANNOUNCEMENT_PAGES\s*=\s*Object\.freeze/m.test(html), "announcement update notes should be centralized for every GitHub upload");
assert(/本次更新|更新内容/m.test(html), "announcement should present the current update content instead of stale first-version copy");
assert(/function renderStartupAnnouncementPage/m.test(html), "announcement should render paged update notes");
assert(/id="announcementPrevButton"[\s\S]*id="announcementNextButton"/m.test(html), "announcement should include pagination controls when update notes are long");
assert(/启动公告只提示当前版本|历史版本改到主菜单查看/.test(html), "announcement should point historical notes to the main menu history entry");
assert(/STARTUP_ANNOUNCEMENT_AUTO_HIDE_MS\s*=\s*14000/m.test(html), "announcement should remain visible long enough to read the current update");
assert(/function showStartupAnnouncement/m.test(html), "announcement should be controlled by a startup function");
assert(/id="announcementCloseButton"/m.test(html), "announcement should include a minimal close control");
assert(/World Build v1\.0\.26/m.test(html) || /GAME_VERSION\s*=\s*"v1\.0\.26"/m.test(html), "game version should increment when shipping a new update");
assert(/UPDATE_HISTORY\s*=\s*Object\.freeze\(\[[\s\S]*v1\.0\.1[\s\S]*零基础新手指引[\s\S]*v1\.0\.0[\s\S]*手机端适配/m.test(html), "update history should keep detailed previous release notes");
assert(/data-menu-action="history">历史更新内容/.test(html) && /id="updateHistoryOverlay"/m.test(html) && /function renderUpdateHistoryList/m.test(html), "main menu should expose update history with detailed notes");
assert(/GAME_VERSION\s*=\s*"v1\.0\.26"/m.test(html), "game version should increment for the audio hotfix release");
assert(html.includes('const OFFICIAL_SITE_HREF = "./official-site.html";') && html.includes('data-menu-action="official">访问官方网站') && /action === "official"[\s\S]*openOfficialWebsite\(\)/m.test(html), "main menu should expose and handle an official website entry");
assert(/UPDATE_ANNOUNCEMENT_PAGES\s*=\s*Object\.freeze\(\[\s*\{\s*title:\s*"> 消息 \/ 本次更新"[\s\S]*v1\.0\.26[\s\S]*音乐升级[\s\S]*音效降噪[\s\S]*持续吵叫[\s\S]*414374792/m.test(html), "startup announcement should show only the current v1.0.26 audio hotfix update");
assert(/id="announcementPageBody"[\s\S]*v1\.0\.26：音乐升级与音效降噪热修复[\s\S]*官方Q群：414374792/m.test(initialBodyMarkup), "static startup announcement placeholder should match the current v1.0.26 update before script hydration");
assert(!/公告只保留关闭、课程锁定、自由模式通关后显示/m.test(initialBodyMarkup), "static startup announcement placeholder should not show stale update copy");
assert(/UPDATE_HISTORY\s*=\s*Object\.freeze\(\[[\s\S]*v1\.0\.26[\s\S]*音乐特色升级与音效降噪[\s\S]*动态段落调度[\s\S]*重复叠加/m.test(html), "update history should record the v1.0.26 music and audio hotfix release");
assert(/UPDATE_HISTORY\s*=\s*Object\.freeze\(\[[\s\S]*v1\.0\.25[\s\S]*主线引导、碎片定位与音乐重整[\s\S]*菜单收敛[\s\S]*音乐系统加入多段主题/m.test(html), "update history should record the v1.0.25 mainline UX and music release");
assert(/UPDATE_HISTORY\s*=\s*Object\.freeze\(\[[\s\S]*v1\.0\.24[\s\S]*旧电脑日期锁与手机编辑器热修复[\s\S]*prompt\(\) is not supported[\s\S]*390x844[\s\S]*414374792/m.test(html), "update history should record the v1.0.24 date lock and mobile editor hotfix release");
assert(/UPDATE_HISTORY\s*=\s*Object\.freeze\(\[[\s\S]*v1\.0\.23[\s\S]*国内加载速度优化[\s\S]*vendor\/phaser\.min\.js[\s\S]*Google Fonts[\s\S]*Three\.js[\s\S]*MUS/m.test(html), "update history should record the v1.0.23 domestic loading optimization release");
assert(/UPDATE_HISTORY\s*=\s*Object\.freeze\(\[[\s\S]*v1\.0\.22[\s\S]*主菜单新增官方网站入口[\s\S]*official-site\.html[\s\S]*414374792/m.test(html), "update history should record the v1.0.22 official website menu entry release");
assert(/UPDATE_HISTORY\s*=\s*Object\.freeze\(\[[\s\S]*v1\.0\.21[\s\S]*官方网站技术预告片上线[\s\S]*Three\.js 星系[\s\S]*Canvas 关键词矩阵[\s\S]*dist\/programming-rpg-c-basics\.html/m.test(html), "update history should record the v1.0.21 official website release");
assert(/UPDATE_HISTORY\s*=\s*Object\.freeze\(\[[\s\S]*v1\.0\.20[\s\S]*手机端石碑编译器全屏适配[\s\S]*100\+ 行输入[\s\S]*visualViewport[\s\S]*导师解析折叠/m.test(html), "update history should record the v1.0.20 mobile stone compiler layout release");
assert(officialSiteHtml.includes("<title>代码觉醒者官方网站"), "official static website should exist as a separate source page");
assert(/id="galaxyLayer"[\s\S]*id="keywordLayer"[\s\S]*class="cursor"/m.test(officialSiteHtml), "official website should include the three-layer hero effects");
assert(/CDN_MODULES\s*=\s*Object\.freeze\(\{[\s\S]*three:[\s\S]*three\.module\.js[\s\S]*gsap:[\s\S]*gsap@3\.13\.0[\s\S]*prism:[\s\S]*prismjs@1\.30\.0/m.test(officialSiteHtml), "official website should keep dynamic ES module CDN lists for optional libraries");
assert(/function importFromCdn\(urls,\s*label,\s*timeoutMs\s*=\s*1200\)/m.test(officialSiteHtml) && /timeoutPromise\(import\(url\),\s*timeoutMs,\s*label\)/m.test(officialSiteHtml), "official website CDN imports should have a timeout fallback for slow domestic networks");
assert(/slowNetwork[\s\S]*networkInfo\?\.saveData[\s\S]*networkInfo\?\.downlink[\s\S]*lowPower[\s\S]*slowNetwork/m.test(officialSiteHtml), "official website should automatically degrade effects on slow or save-data networks");
assert(/lowPower[\s\S]*document\.body\.classList\.add\("low-power"\)/m.test(officialSiteHtml), "official website should automatically degrade effects on low-power devices");
assert(/\.section\s*\{[\s\S]*content-visibility:\s*auto[\s\S]*contain-intrinsic-size:\s*900px[\s\S]*contain:\s*layout style paint/m.test(officialSiteHtml), "official website sections should skip offscreen layout work on mobile");
assert(/<a class="primary-btn" href="\.\/programming-rpg-c-basics\.html">▶ 进入本项目游戏<\/a>/m.test(officialSiteHtml), "official website should expose a direct game link");
assert(/作者：<\/span>杀戮[\s\S]*QQ：<\/span>3424636983[\s\S]*官方Q群：<\/span>414374792/m.test(officialSiteHtml), "official website homepage terminal should show author, QQ, and official group");
assert(/制作人员名单[\s\S]*杀戮[\s\S]*3424636983[\s\S]*414374792/m.test(officialSiteHtml), "official website credits should show author, QQ, and official group");
assert(/float-contact[\s\S]*杀戮 · QQ 3424636983[\s\S]*官方Q群 414374792/m.test(officialSiteHtml), "official website floating contact button should show author, QQ, and official group");
assert(/Ctrl\+Shift|hidden-terminal|Konami|triggerKillMode|launchFireworks|drawCodeRain/m.test(officialSiteHtml), "official website should include the requested easter egg systems");
assert(/id="kineticLayer"/m.test(officialSiteHtml) && /class="reactor-stage"/m.test(officialSiteHtml) && /class="code-ribbon"/m.test(officialSiteHtml), "official website should include the extreme desktop visual layers");
assert(/id="overloadButton"[\s\S]*MAX/m.test(officialSiteHtml) && /extreme-overload/m.test(officialSiteHtml), "official website should include a desktop overload visual mode");
assert(/const AUDIO_MASTER_GAIN\s*=\s*0\.16/m.test(officialSiteHtml) && /audio\.master\.gain\.value\s*=\s*AUDIO_MASTER_GAIN/m.test(officialSiteHtml) && /playStartupFanfare/m.test(officialSiteHtml) && /长段落背景音乐已启动/m.test(officialSiteHtml), "official website music should use a quieter controlled startup path");
assert(/const AUDIO_MEDIA_VOLUME\s*=\s*0\.18/m.test(officialSiteHtml) && /buildWavLoopDataUri/m.test(officialSiteHtml) && /new Audio\(buildWavLoopDataUri\(\)\)/m.test(officialSiteHtml) && /const seconds\s*=\s*28\.8/m.test(officialSiteHtml), "official website music should include a longer quieter cinematic HTMLAudio WAV loop");
assert(/playResult\.then\(\(\)\s*=>\s*stopFallbackMusic\(\)\)/m.test(officialSiteHtml) && !/audio\.ctx\.resume\?\.\(\);\s*startMusic\(\);/m.test(officialSiteHtml), "official website should not layer WebAudio background music over the WAV loop");
assert(/if \(!audio\.started && kind === "hover"\) return/m.test(officialSiteHtml), "official website hover feedback should not pre-start audio before the MUS button click");
assert(!/requestIdleCallback\(primeMediaLoop/.test(officialSiteHtml), "official website should not pre-generate the long WAV loop during first load");
assert(/if \(lowPower\) \{[\s\S]*addEventListener\("scroll",\s*initBelowFold[\s\S]*requestIdleCallback\(initBelowFold,\s*\{\s*timeout:\s*8000\s*\}\)/m.test(officialSiteHtml), "official website low-power path should defer below-fold interactive modules past first load");
assert(/id="energyLayer"/m.test(officialSiteHtml) && /class="mission-stack"/m.test(officialSiteHtml) && /class="systems-deck"/m.test(officialSiteHtml) && /class="max-decor"/m.test(officialSiteHtml), "official website should include dense desktop-only visual modules");
assert(/UPDATE_HISTORY\s*=\s*Object\.freeze\(\[[\s\S]*v1\.0\.19[\s\S]*输出判题、MP移除与手机触摸交互[\s\S]*运行输出与任务预期一致[\s\S]*虚拟交互按钮显示“触摸”[\s\S]*感谢花海为本游戏提供宣传协力支持/m.test(html), "update history should record the v1.0.19 judge, MP, mobile touch, and credits release");
assert(/UPDATE_HISTORY\s*=\s*Object\.freeze\(\[[\s\S]*v1\.0\.18[\s\S]*启动诊断、离线缓存降噪与移动端性能保护[\s\S]*无效 blob Service Worker[\s\S]*低功耗特效预算/m.test(html), "update history should record the v1.0.18 startup diagnostic and mobile performance cleanup");
assert(/UPDATE_HISTORY\s*=\s*Object\.freeze\(\[[\s\S]*v1\.0\.17[\s\S]*智能判题与编译失败恢复[\s\S]*终端输出作为通关标准[\s\S]*连续三次失败/m.test(html), "update history should record the v1.0.17 intelligent judge and failure recovery fixes");
assert(/UPDATE_HISTORY\s*=\s*Object\.freeze\(\[[\s\S]*v1\.0\.15[\s\S]*公告按钮删减[\s\S]*100%重复触发修复[\s\S]*课程权限收口/m.test(html), "update history should record the v1.0.15 announcement, 100%, and course-lock fixes");
assert(!/<option value="medium">中画质<\/option>/.test(html), "performance mode should not expose the flickering medium-quality option");
assert(/if \(saved === "medium"\) return "high"/m.test(html) && /savedSettings\.performanceMode === "auto" \|\| savedSettings\.performanceMode === "medium"/m.test(html), "old medium performance-mode saves should migrate to high");
assert(/#systemBootSkipButton\.announcement-close[\s\S]*width:\s*auto;[\s\S]*white-space:\s*nowrap;/m.test(html), "system boot skip button should use a pill style instead of the tiny announcement close circle");
assert(!/id="announcementExpandButton"/m.test(html) && !/announcementExpandButton|toggleStartupAnnouncementExpanded|announcement-expand/m.test(html), "startup announcement should remove the detail/collapse button entirely");
{
  const announcementCloseBlock = rawStyleContent.match(/\.announcement-close\s*\{([\s\S]*?)\n\s*\}/)?.[1] || "";
  assert(/top:\s*20px;/.test(announcementCloseBlock) && /right:\s*20px;/.test(announcementCloseBlock), "startup announcement close button should be anchored 20px from the top-right corner");
  assert(!/startup-announcement-island\[data-expanded="false"\]/m.test(rawStyleContent) && !/startupAnnouncement\.setAttribute\("data-expanded"/m.test(html), "startup announcement should not keep a minimized/collapsed state after removing the shrink button");
}
assert(/UPDATE_HISTORY\s*=\s*Object\.freeze\(\[[\s\S]*v1\.0\.13[\s\S]*手机版设置入口[\s\S]*误开菜单[\s\S]*公告折叠状态/m.test(html), "update history should record the v1.0.13 mobile settings and announcement fix");
assert(/UPDATE_HISTORY\s*=\s*Object\.freeze\(\[[\s\S]*v1\.0\.12[\s\S]*移除防白屏手动选项[\s\S]*CRT 雪花噪声 canvas 默认隐藏/m.test(html), "update history should record the v1.0.12 anti-white-screen option removal");
assert(/UPDATE_HISTORY\s*=\s*Object\.freeze\(\[[\s\S]*v1\.0\.11[\s\S]*防白屏高档位白色噪点闪烁修复[\s\S]*CRT 噪声[\s\S]*每6帧[\s\S]*最多18个/m.test(html), "update history should record the v1.0.11 anti-white-noise release");
assert(/UPDATE_ANNOUNCEMENT_PAGES\s*=\s*Object\.freeze\(\[[\s\S]*音乐升级[\s\S]*动态段落[\s\S]*持续吵叫[\s\S]*增益限幅/m.test(html), "startup announcement should describe the current music and audio hotfix update");
assert(/id="announcementCloseButton"[\s\S]*>×<\/button>/m.test(html), "announcement close button should be a compact icon, not wrapping text");
assert(/function isCTutorialChapterUnlocked/m.test(html) && /course-lesson-item[\s\S]*locked[\s\S]*disabled aria-disabled/m.test(html), "course progress should lock future chapters until the player reaches them");
assert(/function isCTutorialFullyCompleted/m.test(html) && /const unlocked = isCTutorialFullyCompleted\(\)/m.test(html), "free mode editor should only unlock after full course completion");
assert(/function guardWorldEvolutionAdvance/m.test(html) && !/超越完美计数/.test(html), "world evolution completion should not repeatedly trigger post-100% spacebar effects");
assert(!/data-menu-action="creation"|造物模式|新手二周目|演示一遍世界进化/m.test(initialBodyMarkup), "main menu should not expose creation, new-game-plus, or world-evolution demo entries");
assert(!/<section id="freeModeEditorPanel"|id="freeModeCodeInput"|id="freeModeCompileButton"|id="debugStepButton"|id="tutorialFixSuggestionButton"/m.test(initialBodyMarkup), "free mode editor DOM should not be present in the player menu before full mainline completion");
assert(/function ensureFreeModeEditorPanel/m.test(html) && /isCTutorialFullyCompleted\(\)[\s\S]*ensureFreeModeEditorPanel/s.test(html), "free mode editor should be dynamically created only after the full course is completed");
assert(!/<select id="worldEvolutionThemeSelect"|id="worldEvolutionThemeSelect"|worldEvolutionThemeSelect\?\.addEventListener/m.test(initialBodyMarkup), "world/area theme controls should be absent from menu markup and automatic only");
assert(/function syncQuestInteractableTargets/m.test(html) && /forceEnableQuestStoneInteractable/m.test(html) && /stone\.setInteractive/s.test(html), "active quest guidance should force the syntax stone to be interactable for touch/click input");
assert(/function applyNpcQuestIndicator/m.test(html) && /action\.active[\s\S]*setColor\("#22c55e"\)[\s\S]*setActive\?\.?\(true\)/s.test(html), "NPC quest indicators should show a forced active green marker for matching in-progress task IDs");
assert(/WORLD_EVOLUTION_ADVANCE_COOLDOWN_MS\s*=\s*5000/m.test(html) && /worldEvolutionAdvanceLockedUntil/m.test(html) && /function requestWorldEvolutionAdvance/m.test(html), "space-triggered world evolution should use a 5 second cooldown/state lock");
assert(!/ALL_COURSES_UNLOCKED|UNLOCK_ALL_COURSES|全部解锁/m.test(html), "course progress should not contain a test-only all-unlocked macro in the player build");
assert(/function resolveNarrativeBranchWeights/m.test(html) && /function applyImplicitNarrativeBranch/m.test(html), "quantum branches should be resolved implicitly from player behavior weights");
assert(!/choiceOptions\.innerHTML[\s\S]*data-choice/m.test(html), "narrative branch choices should not be rendered as manual menu buttons");
assert(/UPDATE_HISTORY\s*=\s*Object\.freeze\(\[[\s\S]*v1\.0\.10[\s\S]*防白屏高档位白色闪烁修复[\s\S]*camera\.flash[\s\S]*纯白背景/m.test(html), "update history should record the v1.0.10 anti-white-flash release");
assert(/UPDATE_HISTORY\s*=\s*Object\.freeze\(\[[\s\S]*v1\.0\.9[\s\S]*官网课程路径对齐[\s\S]*develop\.fan[\s\S]*弹窗收起后显示具体折叠对象名称[\s\S]*手机软键盘/m.test(html), "update history should record the v1.0.9 course path and UI stability release");
assert(/UPDATE_HISTORY\s*=\s*Object\.freeze\(\[[\s\S]*v1\.0\.8[\s\S]*性能保护降噪、透明引导[\s\S]*12秒滚动窗口[\s\S]*15秒无操作/m.test(html), "update history should record the v1.0.8 guidance and performance quieting release");
assert(/UPDATE_HISTORY\s*=\s*Object\.freeze\(\[[\s\S]*v1\.0\.7[\s\S]*稳定档位移除中档[\s\S]*renderQuality=medium/m.test(html), "update history should record the v1.0.7 stable quality cleanup");
assert(/UPDATE_HISTORY\s*=\s*Object\.freeze\(\[[\s\S]*性能保护[\s\S]*低于18FPS[\s\S]*是否需要帮助[\s\S]*手机版隐藏右下角“点击开始”音频按钮/m.test(html), "history should retain the v1.0.8 guidance and performance quieting release");
assert(/UPDATE_HISTORY\s*=\s*Object\.freeze\(\[[\s\S]*v1\.0\.6[\s\S]*绝对引导系统[\s\S]*错误行标红/m.test(html), "update history should record the v1.0.6 absolute guide release");
assert(/UPDATE_HISTORY\s*=\s*Object\.freeze\(\[[\s\S]*v1\.0\.5[\s\S]*新手教程热修复[\s\S]*不卡死[\s\S]*跳过可用/m.test(html), "update history should record the v1.0.5 novice guide hotfix");
assert(/UPDATE_HISTORY\s*=\s*Object\.freeze\(\[[\s\S]*v1\.0\.3[\s\S]*手机横屏全屏[\s\S]*触摸对话/m.test(html), "update history should record the v1.0.3 mobile landscape release");
assert(/UPDATE_HISTORY\s*=\s*Object\.freeze\(\[[\s\S]*v1\.0\.3[\s\S]*信息菜单新增图标和一句话用途标签/m.test(html), "update history should record side menu icon and purpose labels");
assert(/UPDATE_HISTORY\s*=\s*Object\.freeze\(\[[\s\S]*v1\.0\.2[\s\S]*第一行代码仪式[\s\S]*编程护照/m.test(html), "update history should record the v1.0.2 learning-assist release");
assert(/DAILY_CODING_QUOTES\s*=\s*Object\.freeze\(\[[\s\S]*编程是思考的体操/m.test(html) && /function showDailyCodingQuote/m.test(html), "game should show a daily coding quote through the island system");
assert(/ENCOURAGEMENT_QUOTES\s*=\s*Object\.freeze\(\[[\s\S]*你比昨天更厉害了/m.test(html) && ((html.match(/鼓励/g) || []).length >= 10 || /getEncouragementQuote/m.test(html)), "encouragement quote library should exist for repeated learning feedback");
assert(/function triggerFirstCodeRitual/m.test(html) && /你写下了人生第一行代码/m.test(html) && /first-code-ritual/m.test(html), "first successful compile should trigger a first-code ritual");
assert(!/id="programmingPassportPanel"/m.test(initialBodyMarkup) && /function renderProgrammingPassport/m.test(html) && /function saveProgrammingPassportImage/m.test(html), "programming passport logic can remain but should not be a side-menu entry");
assert(!/id="fillCurrentLessonButton"/m.test(initialBodyMarkup) && /function fillCurrentLessonCode/m.test(html) && /order\s*<=\s*10/m.test(html), "click-to-fill lesson logic can remain but should not be a side-menu entry");
assert(/CODE_TEMPLATE_LIBRARY\s*=\s*Object\.freeze/m.test(html) && !/id="codeTemplateLibrary"/m.test(initialBodyMarkup) && /function insertCodeTemplate/m.test(html), "code template logic can remain but should not be a side-menu entry");
assert(!/id="executionSpeedSlider"/m.test(initialBodyMarkup) && /function getExecutionSpeedMultiplier/m.test(html), "execution speed logic can remain without a side-menu slider");
assert(!/id="executionPauseButton"|id="executionStepButton"/m.test(initialBodyMarkup) && /function pauseExecutionVisualization/m.test(html) && /function stepExecutionVisualization/m.test(html), "execution pause/step logic can remain without side-menu controls");
assert(/function generateKnowledgeCard/m.test(html) && !/id="knowledgeCardButton"/m.test(initialBodyMarkup), "knowledge card logic can remain but should not be a side-menu entry");
assert(!/id="exportProgressButton"|id="importProgressInput"/m.test(initialBodyMarkup) && /function exportLearningProgress/m.test(html) && /function importLearningProgress/m.test(html), "progress export/import logic can remain but should not be in the side menu");
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
assert(/CodeAwakenerSDK/m.test(html) && /publishGlobal\("CodeAwakenerSDK"/m.test(html), "SDK should be published through the shared global bridge for embeds");
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
const scriptSrcDirective = cspContent.split(";").find((part) => part.trim().startsWith("script-src")) || "";
const styleSrcDirective = cspContent.split(";").find((part) => part.trim().startsWith("style-src ")) || "";
assert(!/unsafe-eval/.test(scriptSrcDirective) && !/unsafe-inline/.test(scriptSrcDirective), "CSP script-src should avoid unsafe eval and unsafe inline");
assert(!/unsafe-inline/.test(styleSrcDirective), "CSP style-src should avoid broad unsafe inline styles");
assert(/style-src-attr 'unsafe-inline'/.test(cspContent), "CSP should allow runtime style attributes used by game animations without relaxing script execution");
assert(cspContent.includes(sha256Directive(rawStyleContent)), "CSP style hash must match raw browser style content");
assert(cspContent.includes(sha256Directive(rawInlineScriptContent)), "CSP script hash must match raw browser script content");
{
  const expectedScriptHash = rawInlineScriptContent.match(/expectedScriptHash:\s*"([^"]+)"/)?.[1] || "";
  const normalizedScript = rawInlineScriptContent.replaceAll(expectedScriptHash, "__GAME_SCRIPT_HASH__");
  const actualScriptHash = crypto.createHash("sha256").update(normalizedScript, "utf8").digest("base64");
  assert(expectedScriptHash === actualScriptHash, "tamper self-check hash must match raw browser script content");
}
assert(/<script src="\.\/vendor\/phaser\.min\.js" integrity="sha384-Fi7F0CYQBHYa\+s2vvYJeiqvOQf3tuZ28vafRGXvMt7ijxNTVf3\+eXPkNRIUi9JD2"><\/script>/m.test(html), "game should load Phaser from the local vendor bundle for faster domestic delivery");
assert(fs.existsSync("vendor/phaser.min.js"), "local Phaser vendor bundle should exist");
assert(/<script src="\.\/vendor\/phaser-loader\.js"><\/script>/m.test(html) && fs.existsSync("vendor/phaser-loader.js"), "game should include a local Phaser fallback loader for alternate deploy paths");
{
  const phaserLoader = fs.readFileSync("vendor/phaser-loader.js", "utf8");
  assert(/\.\/dist\/vendor\/phaser\.min\.js/.test(phaserLoader) && /\.\.\/vendor\/phaser\.min\.js/.test(phaserLoader), "Phaser fallback loader should retry common source and dist paths");
}
assert(!/fonts\.googleapis|fonts\.gstatic|firacode@|https:\/\/cdn\.jsdelivr\.net\/npm\/phaser/m.test(html), "game first load should not depend on external font CDNs or remote Phaser");
assert(/script-src 'self' 'nonce-code-awakener-inline'/.test(cspContent) && /style-src 'self' 'nonce-code-awakener-inline'/.test(cspContent), "CSP should be self-hosted for first-load scripts and styles");
assert(/fs\.cpSync\(vendorDir,\s*vendorOutDir,\s*\{\s*recursive:\s*true,\s*force:\s*true\s*\}\)/m.test(buildScript), "build should copy local vendor assets into dist");
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
assert(/averageWindowMs:\s*12000/m.test(html) && /thresholdFps:\s*18/m.test(html) && /actionCooldownMs:\s*30000/m.test(html), "performance protection should only trigger after long sustained severe FPS drops");
assert(/function suspendSceneForEditor/m.test(html), "editor mode should fully suspend gameplay simulation work");
assert(/function isObjectInsideCameraView/m.test(html), "off-camera animation and particles should be culled");
assert(/const CHAPTER_REGION_LAYOUT\s*=\s*Object\.freeze/m.test(html), "map should define isolated chapter regions");
assert(/chapterIds:\s*\["overview", "hello", "syntax", "variables", "operators", "conditions"\]/m.test(html), "foundation region should follow the develop.fan course path start");
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
assert(/id="mobileInteractButton"[^>]*aria-label="触摸交互"[\s\S]{0,120}>触摸<\/button>/m.test(html), "mobile interact control should be labeled as touch interaction instead of E");
assert(/body\.mobile-input\.is-settings-open \.mobile-controls[\s\S]*display:\s*none/m.test(html) && /document\.body\.classList\.add\("is-settings-open"\)/m.test(html), "mobile controls should hide while settings is open");
assert(/function detectMobileInputMode/m.test(html), "mobile mode should be detected by width and touch capability");
assert(/function showMobileTouchInteractionNotice/m.test(html) && /触摸才是交互/m.test(html), "mobile detection should explain that touch is the interaction method");
assert(/function applyMobileEditorLayout/m.test(html), "small screens should switch editor to compact layout");
assert(/function updateMobileEditorViewport/m.test(html) && /visualViewport/m.test(html) && /mobile-keyboard-open/m.test(html), "mobile editor should track the visual viewport when the soft keyboard opens");
assert(/--mobile-visual-height/m.test(html) && /scrollIntoView/m.test(html), "mobile editor should stay visible above the soft keyboard");
assert(/function installGameErrorBoundary/m.test(html), "game should install an outer error boundary");
assert(/function attemptSceneAutoRepair/m.test(html), "error boundary should try to reload scene data");
assert(/id="errorRecoveryToast"/m.test(html), "recoverable errors should show a pixel repair toast");
assert(/id="audioStartButton"/m.test(html), "main menu should expose a click-to-start audio bootstrap button");
assert(/@media \(max-width: 820px\), \(pointer: coarse\)[\s\S]*\.audio-start-button[\s\S]*display:\s*none !important/m.test(html), "mobile should hide the redundant click-to-start audio button");
assert(/function initializeAudioFromGesture/m.test(html), "audio context should initialize from a user gesture");
assert(/function playBootAudioCue/m.test(html), "startup audio cue should be generated without extra assets");
assert(/function announceA11yEvent/m.test(html), "important events should be announced through an accessibility helper");
assert(/id="a11yLiveRegion"/m.test(html), "game should include an ARIA live region");
assert(/id="editorContrastToggle"/m.test(html), "editor should include a high contrast toggle");
assert(/const I18N_LOCALES\s*=\s*Object\.freeze/m.test(html), "UI text should be routed through an i18n locale object");
assert(/function tI18n/m.test(html) && /publishGlobal\("i18n"/m.test(html), "i18n should expose a translation function");
assert(/anonymousTelemetryEnabled/m.test(html), "settings should store the optional anonymous telemetry flag");
assert(/function recordTelemetryEvent/m.test(html), "optional telemetry should record local events");
assert(/function flushTelemetryQueue/m.test(html), "optional telemetry should be able to POST when enabled");
assert(/function easeOvershoot/m.test(html), "UI transitions should include a physical overshoot easing helper");
assert(/bezierFragmentArc/m.test(html), "fragment collection should use a bezier arc helper");
assert(/Final Art Direction Pass/m.test(html) && /--ui-motion:\s*cubic-bezier\(0\.2,\s*0\.9,\s*0\.4,\s*1\)/m.test(html), "final polish should define a unified visual language and motion curve");
assert(/\.info-side-menu::before[\s\S]*background-size:\s*56px 56px/m.test(html), "side menu should have a subtle circuit texture tying UI to the world");
assert(/\.info-side-menu\s*\{[\s\S]*overflow-y:\s*auto[\s\S]*-webkit-overflow-scrolling:\s*touch/m.test(html), "mobile side menu should remain vertically scrollable after visual polish");
const genericCollapsibleBlock = html.match(/\.collapsible-glass-popup\s*\{([\s\S]*?)\n\s*\}/)?.[1] || "";
assert(!/position\s*:/.test(genericCollapsibleBlock), "generic collapsible popup class must not override fixed or absolute popup positioning");
assert(/content:\s*attr\(data-popup-collapse-label\)/m.test(html) && /POPUP_COLLAPSE_LABELS\s*=\s*Object\.freeze/m.test(html), "collapsed popup strips should show what was folded");
assert(/function enableCollapsedPopupDrag/m.test(html) && /popup-dragging/m.test(html), "collapsed popups should be draggable after folding");
assert(/function getUnifiedFeedbackTier/m.test(html) && /data-feedback-tier/m.test(html), "dynamic island feedback should use unified normal/important/epic tiers");
assert(/document\.body\.classList\.toggle\("is-menu-open", next\)/m.test(html) && /document\.body\.classList\.add\("is-dialog-open"\)/m.test(html), "menu and dialog states should dim the playfield consistently");
assert(/body\.mobile-input \.absolute-guide-chip:not\(\.primary\)[\s\S]*display:\s*none !important/m.test(html), "mobile absolute guide should keep only one transparent top hint visible");
assert(/body\.pause-menu-open #game canvas/m.test(html) && !/body\.is-paused #game canvas/m.test(html), "tutorial input locks should not blur or shrink the game canvas");
assert(/\.dynamic-island-toast,[\s\S]*\.bottom-action-bar,[\s\S]*\.save-toast[\s\S]*rgba\(3, 7, 18, 0\.42\)/m.test(html), "transient popups should use transparent glass instead of blocking panels");
assert(/function ensurePopupCollapseControl/m.test(html) && /COLLAPSIBLE_POPUP_SELECTORS\s*=\s*Object\.freeze/m.test(html), "all major popup surfaces should get a shared collapse control");
assert(/\.popup-collapse-button\s*\{[\s\S]*top:\s*20px;[\s\S]*left:\s*20px;[\s\S]*width:\s*34px;[\s\S]*height:\s*34px/m.test(html), "popup shrink button should align with the dynamic-island close button at the top-left");
assert(/\.collapsible-glass-popup\.popup-collapsed[\s\S]*max-height:\s*42px/m.test(html), "collapsed popups should shrink into a transparent compact strip");
assert(/safeRunEffect\("startupPopupCollapseControls"[\s\S]*refreshPopupCollapseControls/m.test(html), "popup collapse controls should be installed during startup");
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
  assert(api.deriveCodeGenesisGuideStateFromSource, "code genesis should derive live guide state from typed source");
  assert(api.getCodeGenesisNextGuideIndex, "code genesis should expose next guide index for live prompt refresh");
  const afterHpGuide = api.getCodeGenesisNextGuideIndex(api.deriveCodeGenesisGuideStateFromSource("int hp = 88;"));
  const afterNameGuide = api.getCodeGenesisNextGuideIndex(api.deriveCodeGenesisGuideStateFromSource('int hp = 88;\nchar name[] = "Ada";'));
  const afterLevelGuide = api.getCodeGenesisNextGuideIndex(api.deriveCodeGenesisGuideStateFromSource('int hp = 88;\nchar name[] = "Ada";\nint level = 3;'));
  assert(afterHpGuide === 1 && afterNameGuide === 2 && afterLevelGuide === 3, "code genesis live guide should advance from hp to name to level to return");
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
assert(/function restoreEditorSourceAfterFailedRun/m.test(html), "compile failures should preserve the user's current editor source");
assert(/restoreEditorSourceAfterFailedRun\(userSourceBeforeRun,\s*"validate-result"\)/m.test(html), "validation failures should restore the original user source");
assert(/restoreEditorSourceAfterFailedRun\(userSourceBeforeRun,\s*"exception"\)/m.test(html), "runtime exceptions should restore the original user source");
assert(/dom\.codeInput\.addEventListener\("beforeinput", handleMobileEditorBeforeInput\)/m.test(html), "editor beforeinput should use the mobile-safe manual input bridge");
assert(/<textarea id="codeInput"[^>]*inputmode="text"[^>]*enterkeyhint="enter"[^>]*autocapitalize="none"[^>]*autocorrect="off"/m.test(html), "code editor should expose mobile-friendly input attributes");
assert(/id="mobileEditorKeyboardButton"/m.test(html) && /function focusMobileEditorKeyboard/m.test(html), "mobile code editor should expose a touch-first keyboard focus affordance");
assert(/function handleManualEditorInputKey/m.test(html), "editor keydown should be manually handled instead of relying on textarea default editing");
assert(/function shouldDeferTextKeyToMobileBeforeInput/m.test(html), "mobile soft-keyboard keydown should be deferred to beforeinput to prevent duplicate characters");
assert(/handleEditorCommandKey[\s\S]*shouldDeferTextKeyToMobileBeforeInput/m.test(html), "main editor should avoid double-processing mobile soft-keyboard keydown events");
assert(/handleCodeGenesisTerminalKey[\s\S]*shouldDeferTextKeyToMobileBeforeInput/m.test(html), "code genesis should avoid cursor jumps from duplicated mobile keydown and beforeinput events");
assert(/function handleManualEditorCompositionStart/m.test(html) && /function handleManualEditorCompositionEnd/m.test(html), "main editor should commit IME composition only once at compositionend");
assert(/function handleCodeGenesisCompositionStart/m.test(html) && /function handleCodeGenesisCompositionEnd/m.test(html), "code genesis should commit IME composition only once at compositionend");
assert(/codeInput\.addEventListener\("compositionstart", handleManualEditorCompositionStart\)/m.test(html), "main editor should listen for composition lifecycle events");
assert(/codeGenesisInput\?\.addEventListener\("compositionend", handleCodeGenesisCompositionEnd\)/m.test(html), "code genesis should listen for composition lifecycle events");
assert(/body\.mobile-input \.file-tree,[\s\S]*body\.mobile-input \.task-panel,[\s\S]*body\.mobile-input \.code-explain-panel/m.test(html), "mobile editor should collapse side panels for a single-column code-first layout");
assert(/body\.mobile-input \.code-genesis-overlay\.active[\s\S]*grid-template-columns:\s*1fr/m.test(html), "mobile code genesis should use a single-column layout");
assert(/body\.mobile-input\.is-editor-open \.mobile-controls/m.test(html), "mobile joystick should hide while the editor is open");
assert(/navigator\.maxTouchPoints[\s\S]*return false;[\s\S]*requestPointerLock/m.test(html), "touch devices should not request pointer lock");
assert(/function handleManualEditorPointerDown/m.test(html), "editor should manually place the cursor on pointer down");
assert(/function handleManualEditorDoubleClick/m.test(html), "editor should manually select words on double click");
assert(/if \(!touchPointer\) event\.preventDefault\(\)/m.test(html), "touch pointer down should not suppress the mobile soft keyboard");
assert(/beforeinput[\s\S]*handleMobileEditorBeforeInput[\s\S]*preventDefault/m.test(html), "editor should suppress default browser text editing through the manual bridge while active");
assert(/<textarea id="codeGenesisInput"[^>]*inputmode="text"[^>]*enterkeyhint="enter"[^>]*autocapitalize="none"[^>]*autocorrect="off"/m.test(html), "code genesis terminal should expose mobile-friendly input attributes");
assert(/function handleCodeGenesisBeforeInput/m.test(html), "code genesis should translate mobile soft-keyboard input through the manual editor bridge");
assert(/codeGenesisInput\?\.addEventListener\("beforeinput", handleCodeGenesisBeforeInput\)/m.test(html), "code genesis beforeinput should not be a bare preventDefault sink");
assert(/function handleCodeGenesisNativeInputFallback/m.test(html), "code genesis should keep an input-event fallback for mobile browsers without reliable beforeinput");
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
  const composing = api.manualEditorOperationFromBeforeInput({ value: "i", start: 1, end: 1 }, "insertCompositionText", "in");
  assert(composing.value === "i" && composing.start === 1 && composing.composing, "IME composition updates should not append provisional candidate text");
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
assert(/id="worldAdvanceButton"[\s\S]*aria-hidden="true"/m.test(html), "legacy world evolution HUD button should be hidden from the main playfield");
assert(!/id="worldEvolutionMenuAdvanceButton"/m.test(html) && !/演示一次世界进化/.test(html), "world evolution demo button should be removed from the side menu");
assert(/id="infoWorldEvolutionText"/m.test(html), "info side menu should include world evolution completion data");
assert(/worldEvolutionCompletion:\s*0/m.test(html), "world evolution completion should persist in the existing save progress");
assert(/function advanceWorldEvolution/m.test(html), "compile/advance button should update world evolution state in the main project");
assert(/function createWorldEvolutionLayer/m.test(html), "world evolution should render through the existing Phaser scene layer");
assert(/function playWorldEvolutionMilestoneEffect/m.test(html), "world evolution should trigger milestone visual effects");
assert(!/bindFastTouchAction\(dom\.worldEvolutionMenuAdvanceButton/.test(html), "removed world-evolution demo button should not keep a click binding");
assert(!/requestWorldEvolutionAdvance\("space"\)/m.test(html), "spacebar should not manually advance world evolution");
assert(/\/\* ===== 头像系统 ===== \*\//m.test(html), "single-file structure should mark the avatar system section");
assert(/function drawRandomPortraitExpression/m.test(html) && /eyebrowAngle/m.test(html) && /mouthStyle/m.test(html), "Canvas NPC portraits should randomize eyebrows and mouth expressions");
assert(/WORLD_EVOLUTION_NARRATIVE_THRESHOLDS\s*=\s*Object\.freeze\(\[30,\s*60,\s*90\]\)/m.test(html), "world evolution should auto-trigger narrative at 30/60/90 percent");
assert(/WORLD_EVOLUTION_EFFECT_THRESHOLDS\s*=\s*Object\.freeze\(\[20,\s*40,\s*60,\s*80,\s*100\]\)/m.test(html), "world evolution should define dedicated threshold performances");
assert(!/function spendWorldEvolutionMp|spendWorldEvolutionMp\(|MP不足|internalMpCost|mpCost/.test(html), "compile advance must not consume or gate on MP");
assert(/function useWorldEvolutionFragmentItem/m.test(html), "fragments should still restore HP");
assert(!/id="fragmentStarChartButton"/m.test(initialBodyMarkup) && /function autoSpendEvolutionFragmentsSmartly/m.test(html), "fragment star chart should be removed from the menu and replaced by automatic smart upgrades");
assert(!/id="heroCustomizeButton"/m.test(initialBodyMarkup) && /function applyPostGenesisSetup/m.test(html), "hero avatar customization should move to the post-creation setup flow");
assert(/function maybeSpawnWorldGuardianQte/m.test(html) && /function resolveWorldGuardianQte/m.test(html), "compile loop should spawn and resolve guardian QTE events");
assert(/WORLD_EVOLUTION_SAVE_SLOT_KEY/m.test(html) && /function saveWorldEvolutionSlot/m.test(html) && /function loadWorldEvolutionSlot/m.test(html), "world evolution should support localStorage save slots");
assert(/aria-live="polite"[\s\S]*id="worldEvolutionA11y"/m.test(html), "world evolution should include a screen-reader live region");
assert(/function createOffscreenParticleTexture/m.test(html), "world evolution particles should use an offscreen Canvas texture cache");
assert(/WORLD_EVOLUTION_CINEMATIC_STAGES\s*=\s*Object\.freeze/m.test(html), "world evolution should define cinematic stages for 10/30/50/70/90/100 percent");
assert(/function updateWorldEvolutionWeather/m.test(html) && /function cycleWorldEvolutionDayNight/m.test(html), "world evolution should include weather and day-night systems");
assert(/WORLD_EVOLUTION_NPCS\s*=\s*Object\.freeze/m.test(html) && /function handleWorldEvolutionDialogueChoice/m.test(html), "world evolution should include NPC branch dialogue choices");
assert(/function evaluateWorldEvolutionEnding/m.test(html) && /function showWorldEvolutionEnding/m.test(html), "world evolution should evaluate and display multiple endings");
assert(/WORLD_EVOLUTION_ACHIEVEMENTS\s*=\s*Object\.freeze/m.test(html) && /function unlockWorldEvolutionAchievement/m.test(html), "world evolution should include achievements");
assert(/WORLD_EVOLUTION_DIFFICULTY_CONFIG\s*=\s*Object\.freeze/m.test(html), "world evolution should define simple/normal/hard difficulty parameters");
assert(/worldEvolutionDifficulty:\s*"normal"/m.test(html), "world evolution difficulty should default to normal");
assert(!/data-world-difficulty="easy"/m.test(initialBodyMarkup) && /data-post-genesis-difficulty="easy"/m.test(html) && /data-post-genesis-difficulty="normal"/m.test(html) && /data-post-genesis-difficulty="hard"/m.test(html), "difficulty should be selected after character creation, not from the side menu");
assert(/function setWorldEvolutionDifficulty/m.test(html) && /localStorage\.setItem\("difficulty"/m.test(html), "difficulty changes should persist to the required localStorage key");
assert(/function loadWorldEvolutionLocalKeys/m.test(html) && /localStorage\.getItem\("completion"\)/m.test(html), "world evolution should restore direct localStorage completion/fragments keys");
assert(/function saveWorldEvolutionLocalKeys/m.test(html) && /localStorage\.setItem\("compileCount"/m.test(html) && /localStorage\.setItem\("avatarSeed"/m.test(html), "world evolution should persist direct localStorage keys");
assert(!/id="heroAvatarCanvas"|id="regenerateHeroAvatarButton"/m.test(initialBodyMarkup) && /function drawHeroAvatarCanvas/m.test(html), "hero avatar rendering can remain but should not be a side-menu entry");
assert(!/id="worldEvolutionChronicleText"/m.test(initialBodyMarkup), "world evolution chronicle diary should not be a side-menu entry");
assert(!/id="worldEvolutionAchievementList"/m.test(initialBodyMarkup), "world evolution achievements should not be a side-menu entry");
assert(!/id="resetWorldEvolutionButton"/m.test(initialBodyMarkup) && /function resetWorldEvolutionProgress/m.test(html), "reset world progress should not be a side-menu entry");
assert(/WORLD_EVOLUTION_ACHIEVEMENTS[\s\S]*初啼[\s\S]*旅人[\s\S]*收藏家[\s\S]*觉醒[\s\S]*创世者[\s\S]*无畏[\s\S]*艺术家[\s\S]*时空行者/m.test(html), "world evolution achievements should include the required eight milestones");
assert(/worldEvolutionDiary\s*=\s*gameState\.progress\.worldEvolutionDiary\.slice\(-50\)/m.test(html), "world evolution diary should keep at most 50 chronicle entries");
assert(/#keymapGlassBar,[\s\S]{0,80}#bottomHintBar[\s\S]{0,160}display:\s*none !important/m.test(html), "no persistent keymap or bottom hint HUD should remain over the playfield");
assert(/function spawnHardModeTimeRift/m.test(html) && /resolveHardModeTimeRift/m.test(html), "hard difficulty should use a quick time-rift repair event");
assert(/getWorldEvolutionDifficultyConfig\(\)/m.test(html) && /config\.completion\[0\]/m.test(html) && /config\.fragments\[0\]/m.test(html), "compile advance should use difficulty-based completion and fragment gains");
assert(/function generateWorldEvolutionShareCard/m.test(html) && /function copyWorldEvolutionShareText/m.test(html) && !/id="worldEvolutionShareButton"/m.test(initialBodyMarkup), "world evolution sharing logic can remain but should not be a side-menu entry");
assert(/function requestWorldEvolutionMicrophone/m.test(html) && /function requestWorldEvolutionCamera/m.test(html) && !/id="worldEvolutionMicToggle"|id="worldEvolutionCameraToggle"/m.test(initialBodyMarkup), "privacy-gated hooks can remain but should not be side-menu controls");
assert(/WORLD_EVOLUTION_QUANTUM_BRANCHES\s*=\s*Object\.freeze/m.test(html) && /function switchWorldEvolutionQuantumBranch/m.test(html), "world evolution should support quantum branch switching");
assert(/function broadcastWorldEvolutionSync/m.test(html) && /function handleWorldEvolutionStorageSync/m.test(html), "world evolution should support cross-tab localStorage communication");
assert(!/id="worldEvolutionDevConsole"|WORLD_DEV_CONSOLE|worldEvolutionDevCompletion|worldEvolutionDevFragments/m.test(html), "world evolution should not expose a value-editing developer console in the player build");
assert(/WORLD_EVOLUTION_WEATHER_THRESHOLDS\s*=\s*Object\.freeze/m.test(html), "world evolution should define completion-driven weather thresholds");
assert(/WORLD_EVOLUTION_REGIONS\s*=\s*Object\.freeze/m.test(html) && /function switchWorldEvolutionRegion/m.test(html), "world evolution should unlock regions and switch camera views");
assert(/WORLD_EVOLUTION_RANDOM_EVENTS\s*=\s*Object\.freeze/m.test(html) && /function maybeTriggerWorldEvolutionRandomEvent/m.test(html), "compile should be able to trigger random world events");
assert(/function handleWorldEvolutionHotkey/m.test(html) && /function installWorldEvolutionTouchGestures/m.test(html), "world evolution should support keyboard shortcuts and touch gestures");
assert(/function captureWorldEvolutionScreenshot/m.test(html) && !/id="worldEvolutionScreenshotButton"/m.test(initialBodyMarkup), "world evolution screenshot logic can remain but should not be a side-menu entry");
assert(/WORLD_EVOLUTION_UI_THEMES\s*=\s*Object\.freeze/m.test(html) && /function applyWorldEvolutionUiTheme/m.test(html) && !/id="worldEvolutionThemeSelect"/m.test(initialBodyMarkup), "world evolution UI themes can remain but should not be side-menu controls");
assert(!/id="worldEvolutionMirrorText"/m.test(initialBodyMarkup), "world mirror stats should be removed from the player-facing menu");
assert(/WORLD_EVOLUTION_MEMORY_FRAGMENTS\s*=\s*Object\.freeze/m.test(html) && /function unlockWorldEvolutionMemoryFragment/m.test(html), "world evolution should collect story fragments into a codex");
assert(/FRAGMENT_VISUAL_LIBRARY\s*=\s*Object\.freeze/m.test(html) && /image:\s*FRAGMENT_VISUAL_LIBRARY/m.test(html), "each memory fragment should have a visual image entry");
assert(/function getFragmentWorldPosition/m.test(html) && /function renderFragmentLocationGuide/m.test(html) && /id="fragmentLocationList"/m.test(html), "fragment guidance should list concrete world positions");
assert(/function awardWorldEvolutionFromFragment/m.test(html) && /autoSpendEvolutionFragmentsSmartly\("fragment"/m.test(html), "collecting fragments should automatically advance and strengthen world evolution");
assert(/NPC_ACTIONS\s*=\s*Object\.freeze\(\[[\s\S]*id:\s*"talk"[\s\S]*id:\s*"task"[\s\S]*id:\s*"shop"[\s\S]*id:\s*"hint"/m.test(html), "NPC interactions should offer talk, task, shop, and hint choices first");
assert(/function openNpcActionChooser/m.test(html) && /data-npc-action/m.test(html) && /function performNpcAction/m.test(html), "NPC action chooser should route the selected interaction mode");
assert(/function beginWorldEvolutionNewGamePlus/m.test(html) && /worldEvolutionNewGamePlus/m.test(html), "world evolution should include ending and new-game-plus lifecycle");
assert(/COMPILE_LIFE_RULES\s*=\s*Object\.freeze/m.test(html), "compile failure penalty should centralize life and failure threshold rules");
assert(/compileLives:\s*3/m.test(html) && /compileLifeMax:\s*3/m.test(html), "save progress should start each player with three compile lives");
assert(/function handleCompileFailurePenalty/m.test(html), "compile failures should be recorded through a dedicated handler");
assert(/function resetEditorAfterCompileFailure/m.test(html), "compile failures should reset editor state after every failed run");
assert(!/function triggerCompileLifeZeroPenalty/m.test(html), "compile failures should not trigger a life-zero teleport or editor lock");
assert(!/compileLives\s*<=\s*0[\s\S]{0,120}triggerCompileLifeZeroPenalty/m.test(html), "compile failure count must not lock the editor after repeated failures");
assert(/function restoreCompileLife/m.test(html) && /interactWithRoomBed[\s\S]*restoreCompileLife\("full"/m.test(html), "room bed rest should restore compile lives");
assert(/function updateSpawnStoneLifeRecovery/m.test(html), "standing near the spawn stone should recover life after ten seconds");
assert(/ENEMY_ENCOUNTER_RULES\s*=\s*Object\.freeze/m.test(html), "enemy encounter rules should describe logic guard progression");
assert(/class CodeEnemyEncounterManager/m.test(html), "code enemies should be managed through a dedicated encounter system");
assert(!/function spawnCodeBugEnemy/m.test(html) && /function spawnLogicGuardEnemy/m.test(html) && !/type:\s*"codeBug"/m.test(html), "code Bug enemies should be removed from the player build while logic guards remain");
assert(/function resolveCodeEnemyRepair/m.test(html) && /Fix Complete/m.test(html), "successful repair should resolve enemies with Fix Complete feedback");
assert(/function grantGrowthExperience/m.test(html) && /function getPlayerGrowthLevel/m.test(html), "growth system should grant experience and derive player level");
assert(/function applyPlayerGrowthVisuals/m.test(html), "player visuals should evolve by level");
assert(/function showLevelUpFeedback/m.test(html), "level-up should show a gold pulse feedback");
assert(/infoExpText/m.test(html) && /infoCompileLivesText/m.test(html), "side info menu should show experience and compile lives");
assert(/id="noviceGuideOverlay"/m.test(html), "zero-basis novice guide overlay should exist");
assert(!/id="replayNoviceGuideButton"/m.test(initialBodyMarkup), "side menu should not include a replay novice guide button");
assert(/NOVICE_GUIDE_STEPS\s*=\s*Object\.freeze\(\[[\s\S]*interface[\s\S]*demoVideo[\s\S]*guidedCode[\s\S]*compileFeedback[\s\S]*freeTry/m.test(html), "novice guide should define the required five-step flow");
assert(/NOVICE_GUIDE_HELLO_CODE[\s\S]*printf\("Hello C!"\)/m.test(html), "novice guide should prefill the first runnable C program");
assert(/id="noviceGuideVideoCanvas"/m.test(html) && /id="noviceGuideVideoPlayButton"/m.test(html) && /id="noviceGuideVideoProgress"/m.test(html), "novice guide should include a Canvas simulated video with controls");
assert(/function drawNoviceGuideVideoFrame/m.test(html) && /function toggleNoviceGuideVideoPlayback/m.test(html), "novice guide simulated video should be Canvas-driven and controllable");
assert(/function startNoviceGuide/m.test(html) && /function advanceNoviceGuideStep/m.test(html), "novice guide should have explicit start and step progression functions");
assert(/noviceGuideCompleted/m.test(html) && /localStorage\.setItem\("noviceGuideCompleted"/m.test(html), "novice guide completion should persist to localStorage");
assert(/id="absoluteGuideLayer"/m.test(html), "absolute guide should include a non-blocking guidance layer");
assert(/ABSOLUTE_GUIDE_STAGES\s*=\s*Object\.freeze/m.test(html), "absolute guide stages should be centralized");
assert(/function startAbsoluteGuide/m.test(html) && /function updateAbsoluteGuide/m.test(html), "absolute guide should have explicit start and update functions");
assert(/ABSOLUTE_GUIDE_IDLE_MS\s*=\s*15000/m.test(html) && /ABSOLUTE_GUIDE_HELP_COOLDOWN_MS\s*=\s*60000/m.test(html), "absolute guide idle help should wait longer and avoid frequent repeated prompts");
assert(/function recordAbsoluteGuideCompileError/m.test(html) && /function highlightEditorErrorLine/m.test(html), "absolute guide should escalate compile errors and highlight the wrong line");
assert(/fileName\.endsWith\("\.md"\)\)\s*return escapeHtml\(code\)/m.test(html), "README task notes should render as escaped plain text instead of leaking syntax-highlight markup");
assert(/classList\.toggle\("readme-mode", fileName === "README\.md"\)/m.test(html), "switching to README should enable wrapped document mode");
assert(/code-wrap\.readme-mode[\s\S]*white-space:\s*pre-wrap/m.test(html), "README document mode should wrap long task notes instead of horizontal overflow");
assert(/currentFile === "README\.md"[\s\S]*classList\.remove\("show"\)/m.test(html), "README document mode should hide stale error-line overlays");
assert(/body\.absolute-guide-active[\s\S]*#questTracker[\s\S]*#codeExplainPanel:not\(\.absolute-guide-needed\)/m.test(html), "absolute guide should hide nonessential UI until needed");
assert(/safeRunEffect\("startupAbsoluteGuide"[\s\S]*startAbsoluteGuide/m.test(html), "startup should arm the absolute guide instead of auto-opening the old novice overlay");
assert(!/safeRunEffect\("startupNoviceGuide"[\s\S]*maybeStartNoviceGuide/m.test(html), "old novice guide should not auto-start on first load");
assert(/function isGuidanceOverlayBlocking/m.test(html) && /dom\.settingsPanel[\s\S]*dom\.infoSideMenu[\s\S]*dom\.overlay[\s\S]*dom\.dialog/m.test(html), "auto novice guidance should treat settings, side menu, editor, and dialog as blocking surfaces");
assert(/function canAutoStartGuidance/m.test(html) && /hasCompletedCodeGenesisCharacter\(\)[\s\S]*menuManager\?\.active === "game"[\s\S]*!isGuidanceOverlayBlocking\(\)/m.test(html), "auto novice guidance should centralize strict start conditions");
assert(/maybeStartNoviceGuide[\s\S]*scheduleNoviceGuide\(\(\) => \{[\s\S]*canAutoStartGuidance\(\)[\s\S]*startNoviceGuide\(\{ auto: true \}\)/m.test(html), "novice guide delayed callback should re-check conditions before opening");
assert(!/id="startFoundationButton"/m.test(initialBodyMarkup), "zero-basis foundation should not be manually replayable from the side menu");
assert(/function hasCompletedCodeGenesisCharacter/m.test(html), "novice guide should wait until character creation is complete");
assert(/isStartupOverlayBlockingNoviceGuide[\s\S]*dom\.mainMenu[\s\S]*dom\.worldSelectOverlay[\s\S]*dom\.codeGenesisOverlay/m.test(html), "novice guide should treat menu, world select, and code genesis overlays as blocking");
assert(/maybeStartNoviceGuide[\s\S]*hasCompletedCodeGenesisCharacter\(\)/m.test(html), "novice guide should not auto-start before a character exists");
assert(/trackedSetTimeout\(\(\) => startAbsoluteGuide\(false\), 900, "absolute-guide-after-enter-world"\)/m.test(html), "entering the game should start the absolute guide after the world is visible");
assert(/absoluteGuideRuntime\.active[\s\S]*openEditor\(interaction\.chapter\.id\)/m.test(html), "during absolute guide, lesson stones should open the editor directly");
assert(/markAbsoluteGuideAction\("openEditor"/m.test(html) && /markAbsoluteGuideAction\("runStart"/m.test(html) && /markAbsoluteGuideAction\("compileSuccess"/m.test(html), "absolute guide should track editor, run, and success stages");
assert(/buildBeginnerLineExplanation/m.test(html) && /逐行解释/.test(html), "absolute guide should provide beginner line-by-line code explanations");
assert(/id="noviceGuideRunButton"/m.test(html) && /bindFastTouchAction\(dom\.noviceGuideRunButton[\s\S]*handleNoviceGuideCompile/m.test(html), "novice guide should provide an in-panel run button beside the starter editor");
assert(/id="noviceGuideConfirmSkipButton"/m.test(html) && /bindFastTouchAction\(dom\.noviceGuideConfirmSkipButton[\s\S]*completeNoviceGuide\(true\)/m.test(html), "novice guide skip confirmation should be actionable inside the guide overlay");
assert(!/body\.novice-guide-active[\s\S]*#hud button:not\(\.novice-guide-control\)[\s\S]*pointer-events:\s*none/m.test(html), "novice guide should not globally lock HUD/editor buttons");
assert(/data-step="freeTry"[\s\S]*novice-guide-run/m.test(html), "free-try guide step should keep a visible run button");
assert(/novice-guide-spotlight/m.test(html) && /novice-guide-arrow/m.test(html), "novice guide should visually highlight targets with arrows");
assert(/novice-guide-hand-cursor/m.test(html), "guided code step should show an animated hand cursor");
assert(/bindFastTouchAction\(dom\.noviceGuideVideoPlayButton[\s\S]*toggleNoviceGuideVideoPlayback/m.test(html), "novice guide simulated video should support touch play/pause");
assert(!/id="replayNoviceGuideButton"/m.test(initialBodyMarkup), "novice guide replay should not be a side-menu entry");
assert(/compileAndAdvanceWorld[\s\S]*if \(gameState\.noviceGuideActive/m.test(html), "compile button should route through novice guide feedback while guidance is active");
assert(/const CODE_GENESIS_BEGINNER_TEMPLATE[\s\S]*int hp = 88;[\s\S]*char name\[\] = "行者";[\s\S]*return 0/m.test(html), "code genesis should retain a concise reference template");
assert(/CODE_GENESIS_GUIDED_LINES\s*=\s*Object\.freeze\(\[/m.test(html) && html.includes("int hp = 88;") && html.includes('char name[] = \\"行者\\";') && html.includes("int level = 1;") && html.includes("return 0;"), "code genesis should teach character creation line by line");
assert(/id="codeGenesisExampleButton"/m.test(html) && /id="codeGenesisExplainButton"/m.test(html) && /id="codeGenesisCreateButton"/m.test(html), "code genesis should expose helper buttons for zero-basis players");
assert(/function showCodeGenesisNextLineHint/m.test(html) && /function explainCodeGenesisBeginnerTemplate/m.test(html) && /function runCodeGenesisEditor/m.test(html), "code genesis helper buttons should guide the next line without completing creation for the player");
assert(/function refreshCodeGenesisGuideFromInput/m.test(html) && /codeGenesisInput\.placeholder/m.test(html), "code genesis helper and placeholder should refresh from the current typed code");
assert(/commitCodeGenesisEditorOperation[\s\S]*refreshCodeGenesisGuideFromInput/m.test(html), "code genesis typing should refresh the current guide without waiting for helper buttons");
assert(/runCodeGenesisEditor[\s\S]*const source = dom\.codeGenesisInput\.value[\s\S]*!source\.trim\(\)/m.test(html), "code genesis create button should validate player-typed code instead of auto-running the full template");
assert(/function pickPreferredSpeechVoice/m.test(html) && /function applyPreferredSpeechVoice/m.test(html), "TTS should prefer softer local browser voices instead of forcing the default voice");
assert(/TTSFM_CONFIG\s*=\s*Object\.freeze[\s\S]*http:\/\/localhost:8000\/v1\/audio\/speech[\s\S]*voice:\s*"nova"/m.test(html), "TTS should default to the requested ttsfm local OpenAI-compatible endpoint and female-style voice");
assert(/function speakWithTtsfmFemale/m.test(html) && /fetch\(endpoint[\s\S]*\/v1\/audio\/speech/m.test(html), "TTS should include a ttsfm connector before browser speech fallback");
assert(/voiceEnabled:\s*false/m.test(html), "TTS should be opt-in so a missing local ttsfm server cannot slow the tutorial");
assert(/browserSpeechFallback:\s*false/m.test(html), "browser robot TTS fallback should be disabled by default");
assert(/function shouldUseBrowserSpeechFallback/m.test(html), "browser speech fallback should require explicit opt-in");
assert(/speakGameText[\s\S]*shouldUseBrowserSpeechFallback\(options\)[\s\S]*speakWithBrowserFemale/m.test(html), "game speech should not fall back to browser robot voices unless explicitly enabled");
assert(/ttsfm不可用时不会播放浏览器机器人声/m.test(html), "announcement should explain that poor browser robot TTS is disabled when ttsfm is unavailable");
assert(/function openNoviceGuideRealEditor/m.test(html), "novice guide should open the real VS Code-style editor for hands-on code");
assert(/renderNoviceGuideStep[\s\S]*step\.id === "guidedCode"[\s\S]*openNoviceGuideRealEditor/m.test(html), "guided code step should bring up the normal editor");
assert(/handleNoviceGuideCompile[\s\S]*dom\.codeInput\?\.value[\s\S]*NOVICE_GUIDE_HELLO_CODE/m.test(html), "novice guide compile should read code from the real editor first");
assert(/handleNoviceGuideCompile[\s\S]*step !== "guidedCode" && step !== "compileFeedback" && step !== "freeTry"/m.test(html), "novice guide compile should allow the final free-try step to run");
assert(/function confirmSkipNoviceGuide[\s\S]*clearNoviceGuideTimers\(\)/m.test(html), "skip confirmation should clear queued guide timers so it cannot be overwritten");
assert(/function completeNoviceGuide[\s\S]*closeNoviceGuideDialogue\(\)[\s\S]*closeEditor\(true\)/m.test(html), "finishing or skipping the guide should restore dialogue and editor input state");
assert(/dom\.runButton\.addEventListener\("click", \(\) => \{[\s\S]*gameState\.noviceGuideActive[\s\S]*handleNoviceGuideCompile/m.test(html), "real editor run button should route through novice guide while active");
assert(/INFO_MENU_SECTION_ICON_MAP\s*=\s*Object\.freeze/m.test(html), "side menu should have a centralized icon and purpose map");
["课程进度", "世界进化", "任务提示", "知识碎片", "容错状态", "成长 / 惩罚", "学习辅助"].forEach((title) => {
  assert(new RegExp(`${title}[\\s\\S]*icon[\\s\\S]*purpose`).test(html), `side menu icon map should explain ${title}`);
});
assert(/function decorateInfoMenuSectionIcons/m.test(html), "side menu headings should be decorated with icons and short purpose text");
assert(/menu-section-icon/m.test(html) && /menu-section-purpose/m.test(html), "side menu should render visual icons and one-line purpose labels");
assert(/decorateInfoMenuSectionIcons\(\)/m.test(html), "side menu icon decoration should run during startup");
assert(/INFO_MENU_GROUPS\s*=\s*Object\.freeze/m.test(html), "side menu sections should be grouped into a small number of clear categories");
assert(/function organizeInfoSideMenu/m.test(html), "side menu should have a menu organization pass");
assert(/当前任务[\s\S]*碎片定位[\s\S]*状态与保存/m.test(html), "side menu should expose the three mainline groups");
assert(/class="info-menu-intro"/m.test(html), "side menu should explain that less-used functions are folded away");
assert(/organizeInfoSideMenu\(\)[\s\S]*const hpMax = getWorldEvolutionHpMax/m.test(html), "side menu organization should run before updating live values");
assert((initialBodyMarkup.match(/class="menu-help"/g) || []).length >= 7, "side menu should explain each retained mainline function with usage notes");
assert(/friendlyMode:\s*true/m.test(html) && /function applyFriendlyMode/m.test(html) && !/id="friendlyModeToggle"/m.test(initialBodyMarkup), "friendly mode should remain available internally without a side-menu toggle");
assert(/FRIENDLY_TERM_GLOSSARY\s*=\s*Object\.freeze[\s\S]*变量[\s\S]*带名字的盒子[\s\S]*编译[\s\S]*运行我的代码/m.test(html), "friendly mode should explain first-time terms with life metaphors");
assert(/id="littleCCompanion"/m.test(html) && /function showLittleCSpeech/m.test(html) && /function triggerLittleCDance/m.test(html), "Little C companion should exist, talk, and animate");
assert(/ZERO_BASIS_FOUNDATION_LESSONS\s*=\s*Object\.freeze\(\[[\s\S]*什么是“指令”[\s\S]*拿碗[\s\S]*什么是“变量”[\s\S]*年龄[\s\S]*什么是“输入”和“输出”[\s\S]*发送[\s\S]*什么是“条件判断”[\s\S]*下雨[\s\S]*什么是“循环”[\s\S]*走一圈/m.test(html), "zero-basis foundation should include five no-code concept exercises");
assert(/id="foundationOverlay"/m.test(html) && /function startZeroBasisFoundation/m.test(html) && /function completeFoundationLesson/m.test(html), "zero-basis foundation overlay should be playable and completable");
assert(/CODE_BLOCK_MODE_SNIPPETS\s*=\s*Object\.freeze/m.test(html) && /id="codeBlockModePanel"/m.test(html) && /function renderCodeBlockMode/m.test(html) && /function verifyCodeBlockProgram/m.test(html), "first ten snippets should support colorful code block mode");
assert(/CODE_BLOCK_MODE_SNIPPETS\.find\(\(item\) => item\.lesson === activeChapterId\)/m.test(html) && /if \(!config\) return null/m.test(html), "code block mode should only show blocks for the active configured chapter");
assert(/selectedIds\s*=\s*new Set\(codeBlockSelection\)/m.test(html) && /remainingBlocks\s*=\s*config\.blocks\.filter\(\(block\)\s*=>\s*!selectedIds\.has\(block\.id\)\)/m.test(html), "picked code blocks should disappear from the source bank");
assert(/code-block-guided/m.test(html) && /grid-template-columns:\s*92px minmax\(0, 1fr\) 48px/m.test(html), "code block guide mode should simplify the editor layout");
assert(/body\.mobile-input \.code-block-bank-row[\s\S]*overflow-x:\s*auto/m.test(html), "mobile code block rows should scroll horizontally instead of cluttering the screen");
assert(!/id="littleCReadButton"/m.test(initialBodyMarkup) && /function readWithLittleC/m.test(html) && /karaoke-highlight/m.test(html), "follow-reading logic can remain but should not be a side-menu entry");
assert(!/id="codeStoryBookPanel"/m.test(initialBodyMarkup) && /function renderCodeStoryBook/m.test(html) && /CODE_STORYBOOK_PAGES\s*=\s*Object\.freeze/m.test(html), "code storybook logic can remain but should not be a side-menu entry");
assert(!/id="rewardGardenCanvas"/m.test(initialBodyMarkup) && /function growRewardGardenFlower/m.test(html) && /function drawRewardGarden/m.test(html), "reward garden logic can remain but should not be a side-menu entry");
assert(!/id="parentGuidePanel"/m.test(initialBodyMarkup) && /function unlockParentGuide/m.test(html), "parent helper logic can remain but should not be a side-menu entry");
assert(/function dismissExecutionVisualization/m.test(html), "execution visualization should have a centralized dismiss helper");
assert(/function unlockParentGuide\(\)[\s\S]*dismissExecutionVisualization\("parent-guide"\)/m.test(html), "opening parent guide should clear stale memory-model overlays");
assert(/function toggleInfoSideMenu[\s\S]*dismissExecutionVisualization\("info-menu"\)[\s\S]*updateInfoSideMenu/m.test(html), "opening the info menu should clear stale execution overlays");
assert(/function closeEditor[\s\S]*dismissExecutionVisualization\("editor-close"\)/m.test(html), "closing the editor should clear execution overlays");
["第一次按下按钮", "我让电脑说话了", "我的第一个盒子", "岔路口小能手", "转圈圈大师", "积木建筑师", "打字小勇士", "花园园丁", "星穹守护者"].forEach((label) => {
  assert(html.includes(label), `friendly achievement label should include ${label}`);
});
assert(/function showPositiveMicroFeedback/m.test(html) && /✨ 做得好/.test(html), "every friendly action should be able to show positive micro feedback");
assert(/REST_REMINDER_MS\s*=\s*40\s*\*\s*60\s*\*\s*1000/m.test(html) && /function showRestReminder/m.test(html) && /休息5分钟/m.test(html), "Little C should remind long learners to rest less frequently");
assert(!/id="worldEvolutionDevButton"|开发者面板|id="worldEvolutionDevConsole"|WORLD_DEV_CONSOLE/.test(html), "player-facing menu should not expose developer value-editing or cheat panels");
assert(!/id="testIslandToastButton"|测试弹窗/.test(html), "player-facing menu should not expose test-only toast tools");
assert(/<strong>学习辅助<\/strong>[\s\S]*手动保存[\s\S]*游戏设置/m.test(html) && !/重新观看指引/m.test(initialBodyMarkup), "utility section should keep only manual save and settings");

assert(api.C_TUTORIAL_COURSE, "C tutorial course data should be exported for tests");
assert(Array.isArray(api.C_TUTORIAL_COURSE) && api.C_TUTORIAL_COURSE.length === 8, "C tutorial course should contain exactly eight structured chapters");
{
  const requiredChapterNames = ["初识C语言", "运算符与表达式", "流程控制", "数组与字符串", "函数", "指针", "结构体与联合体", "动态内存管理"];
  requiredChapterNames.forEach((name) => assert(api.C_TUTORIAL_COURSE.some((chapter) => chapter.title.includes(name)), `missing C tutorial chapter ${name}`));
  const snippets = api.flattenCTutorialSnippets();
  assert(snippets.length >= 50, `C tutorial course should include at least 50 code snippets, got ${snippets.length}`);
  api.C_TUTORIAL_COURSE.forEach((chapter) => {
    const chapterSnippets = chapter.lessons.flatMap((lesson) => lesson.snippets || []);
    assert(chapterSnippets.length >= 3, `${chapter.title} should include at least three runnable examples`);
  });
  ["printf", "scanf", "const", "#define", "for", "while", "do", "switch", "strlen", "strcpy", "return", "recursion", "*ptr", "struct", "malloc", "free", "calloc", "realloc"].forEach((token) => {
    assert(snippets.some((snippet) => snippet.code.includes(token) || snippet.title.includes(token) || snippet.concept.includes(token)), `C tutorial snippets should cover ${token}`);
  });
  [5, 10, 18, 25].forEach((order) => {
    const snippet = snippets.find((item) => item.order === order);
    assert(snippet?.intentionalError && snippet.errorType && snippet.fixSuggestion && snippet.fixedCode, `snippet #${order} should teach a recoverable error`);
  });
}
assert(api.C_VISUAL_ENTITY_MAP, "C visual entity map should be exported for tests");
["variable", "pointer", "loop", "array", "string", "function"].forEach((key) => {
  assert(api.C_VISUAL_ENTITY_MAP[key]?.entity, `visual entity map should include ${key}`);
});
assert(/variable:[\s\S]*glowing-container/.test(html), "variables should map to glowing containers");
assert(/pointer:[\s\S]*light-beam/.test(html), "pointers should map to light beams");
assert(/loop:[\s\S]*orbit/.test(html), "loops should map to orbits");
assert(/array:[\s\S]*bookshelf/.test(html), "arrays should map to bookshelf/cell visuals");
assert(/function buildExecutionPlanForSnippet/m.test(html), "C tutorial should build an execution visualization plan");
assert(/function renderExecutionMemoryModel/m.test(html), "C tutorial should render a memory model");
assert(/function renderExecutionTrace/m.test(html), "C tutorial should render code execution trace");
assert(/function playCodeExecutionVisualization/m.test(html), "C tutorial should play the execution visualization");
assert(/function compileCurrentTutorialSnippet/m.test(html), "compile button should run the current C tutorial snippet before world evolution");
assert(/function showTutorialErrorFeedback/m.test(html), "C tutorial errors should have dedicated feedback");
assert(/function applyTutorialFixSuggestion/m.test(html), "C tutorial should let players apply fix suggestions");
assert(/function unlockFreeModeIfReady/m.test(html), "free mode should unlock from C tutorial progress");
assert(/function compileFreeModeCode/m.test(html), "free mode code editor should be compilable");
assert(/function stepDebugExecution/m.test(html), "debug mode should support single-step execution");
assert(/id="courseProgressPanel"/m.test(html) && /id="courseLessonList"/m.test(html), "side menu should include course progress and chapter directory");
assert(!/id="learningLogList"|id="codeHistoryList"/m.test(initialBodyMarkup), "side menu should not include learning log or replayable code history panels");
assert(!/id="freeModeEditorPanel"|id="freeModeCodeInput"|id="freeModeCompileButton"/m.test(initialBodyMarkup) && /function ensureFreeModeEditorPanel/m.test(html), "free mode editor should be dynamically created only after unlock");
assert(!/id="debugStepButton"|id="tutorialFixSuggestionButton"/m.test(initialBodyMarkup), "side menu should not expose debug stepping or error fix suggestion controls");
assert(/<meta name="viewport" content="width=device-width, initial-scale=1\.0, maximum-scale=1\.0, user-scalable=no, viewport-fit=cover"\s*\/?>/m.test(html), "mobile viewport should disable zoom and support safe-area insets");
assert(/#game-shell\s*\{[\s\S]*width:\s*100vw;[\s\S]*height:\s*100vh;/m.test(html), "game shell should fill the mobile viewport");
assert(/#game canvas\s*\{[\s\S]*width:\s*100vw !important;[\s\S]*height:\s*100vh !important;[\s\S]*touch-action:\s*none;/m.test(html), "game canvas should fill the viewport and disable touch zoom");
assert(/@media \(max-width:\s*768px\)[\s\S]*\.info-side-menu\s*\{[\s\S]*width:\s*min\(85vw,\s*340px\)/m.test(html), "mobile side menu should use 85vw drawer width capped at 340px");
assert(/@media \(max-width:\s*768px\)[\s\S]*\.info-menu-toggle\s*\{[\s\S]*width:\s*clamp\(52px/m.test(html), "mobile menu button should meet the 52px touch target");
assert(/@media \(max-width:\s*768px\)[\s\S]*\.world-evolution-button\s*\{[\s\S]*min-width:\s*clamp\(64px/m.test(html), "mobile compile button should be at least 64px");
assert(/@media \(max-width:\s*768px\)[\s\S]*\.dynamic-island-toast\s*\{[\s\S]*width:\s*90vw;[\s\S]*overflow-x:\s*auto;[\s\S]*white-space:\s*nowrap/m.test(html), "mobile dynamic island should be wide, horizontally scrollable, and non-wrapping");
assert(/env\(safe-area-inset-top\)/m.test(html) && /env\(safe-area-inset-bottom\)/m.test(html), "mobile overlays should account for safe-area insets");
assert(/@media \(max-width:\s*768px\)[\s\S]*#dialogOverlay\s*\{[\s\S]*padding:[\s\S]*env\(safe-area-inset-bottom\)[\s\S]*\.dialog-box\s*\{[\s\S]*width:\s*100%;[\s\S]*max-height:\s*40vh;[\s\S]*overflow-y:\s*auto/m.test(html), "mobile dialogue should become a bottom sheet with scrollable content");
assert(/@media \(max-width:\s*768px\)[\s\S]*\.bottom-action-bar\s*\{[\s\S]*width:\s*100%;[\s\S]*border-radius:\s*24px 24px 0 0/m.test(html), "mobile action bar should be full width with top rounded corners");
assert(/id="mobileFullscreenPrompt"/m.test(html) && /id="mobileFullscreenStartButton"/m.test(html) && /id="mobileFullscreenLaterButton"/m.test(html), "mobile players should be asked to enter landscape fullscreen after entering the game");
assert(/function showMobileFullscreenPrompt/m.test(html) && /function enterMobileFullscreenLandscape/m.test(html) && /function requestMobileLandscapeFullscreen/m.test(html), "mobile fullscreen prompt should have explicit show, request, and enter handlers");
assert(/screen\.orientation\?\.lock\?\.\("landscape"\)/m.test(html), "mobile fullscreen handler should try to lock landscape orientation when supported");
assert(/MenuManager[\s\S]*enterGameWorld[\s\S]*maybePromptMobileFullscreen/m.test(html), "entering the game world should schedule the mobile landscape fullscreen prompt");
assert(/id="mobileDialogAdvanceButton"/m.test(html), "mobile dialogue should expose a touch button for continuing or skipping text");
assert(/bindFastTouchAction\(dom\.mobileDialogAdvanceButton[\s\S]*advanceDialog/m.test(html), "mobile dialogue continue button should use fast touch handling");
assert(/手机点继续/m.test(html), "dialogue help text should explain the mobile continue action");
assert(/function bindFastTouchAction/m.test(html), "touch-first buttons should use a fast touch action helper");
assert(/bindFastTouchAction\(dom\.infoMenuToggle[\s\S]*toggleInfoSideMenu/m.test(html), "menu button should support touchstart without 300ms delay");
assert(/function isMobileControlTouchTarget/m.test(html) && /touchesStartedOnMobileControls/m.test(html), "side-menu touch gestures should ignore virtual joystick and mobile interact controls");
assert(/dom\.mobileControls\?\.addEventListener\("touchstart"[\s\S]*stopPropagation/m.test(html), "mobile controls should stop touch bubbling so joystick plus E cannot open the menu");
assert(/bindFastTouchAction\(dom\.mobileInteractButton,\s*triggerMobileInteractButton\)/m.test(html), "mobile touch interact button should use fast touch handling instead of delayed click");
assert(/function triggerMobileInteractButton[\s\S]*performCurrentInteraction\("touch"/m.test(html), "mobile touch interact should call the scene interaction handler directly");
assert(!/function triggerMobileInteractButton[\s\S]*keyE\.isDown[\s\S]*mobile-interact-release/m.test(html), "mobile touch interact should not synthesize the E key");
assert(!/bindFastTouchAction\(dom\.worldEvolutionMenuAdvanceButton[\s\S]*compileAndAdvanceWorld/m.test(html), "removed world evolution demo button should not keep a touch binding");
assert(/function updateInfoMenuDragProgress/m.test(html) && /leftEdgeSwipe/m.test(html) && /touchmove[\s\S]*updateInfoMenuDragProgress/m.test(html), "side menu should support left-edge swipe open and drawer swipe close");
assert(/function handleCanvasTouchCreation/m.test(html) && /touch\.clientX[\s\S]*touch\.clientY/m.test(html), "Canvas trajectory creation should map touch coordinates");
assert(/function focusFreeModeEditorForMobile/m.test(html) && /scrollIntoView\(\{[\s\S]*block:\s*"center"/m.test(html), "mobile free-mode editor should scroll into view when focused");
assert(/\.free-mode-code-input[\s\S]*font-size:\s*16px/m.test(html), "mobile code editor font size should prevent iOS auto zoom");
assert(/MOBILE_PARTICLE_LIMIT\s*=\s*150/m.test(html), "mobile devices should cap world particles to 150");
assert(/navigator\.getBattery/m.test(html) && /function applyMobilePowerSaveMode/m.test(html), "mobile low battery mode should reduce animation and audio cost");
assert(/currentLesson:\s*0/m.test(html) && /compiledHistory:\s*\[\]/m.test(html) && /errorAttempts:\s*\{\}/m.test(html), "C tutorial progress should persist core local state");
assert(/localStorage\.setItem\("currentLesson"/m.test(html) && /localStorage\.setItem\("compiledHistory"/m.test(html) && /localStorage\.setItem\("freeModeCode"/m.test(html) && /localStorage\.setItem\("errorAttempts"/m.test(html), "C tutorial should persist required direct localStorage keys");
assert(api.getTutorialDifficultyTiming("easy") === 1500, "easy mode should slow teaching animation to 1.5s");
assert(api.getTutorialDifficultyTiming("normal") === 800, "normal mode should use 0.8s teaching animation");
assert(api.getTutorialDifficultyTiming("hard") === 300, "hard mode should use 0.3s teaching animation");
{
  const plan = api.buildExecutionPlanForSnippet({ code: "int nums[3] = {1, 2, 3};\nint *ptr = &nums[0];\nfor (int i = 0; i < 3; i++) { nums[i] += 1; }", title: "plan", concept: "数组 指针 循环" });
  assert(plan.memoryCells.length > 0, "execution plan should include memory cells");
  assert(plan.arrays.length > 0, "execution plan should visualize arrays");
  assert(plan.pointers.length > 0, "execution plan should visualize pointer arrows");
  assert(plan.loops.length > 0, "execution plan should visualize loop orbits");
  assert(plan.trace.length >= 3, "execution plan should include highlighted trace lines");
}
assert(/compileAndAdvanceWorld/m.test(html) && /compileCurrentTutorialSnippet\(\)/m.test(html), "world compile button should call the C tutorial compiler before evolution");

console.log(`validated ${expectedIds.length} C tutorial chapters and quality systems`);
assert(/event\.key\s*===\s*"Tab"[\s\S]{0,220}toggleInfoSideMenu\(\)/m.test(html), "Tab should toggle the in-game function info menu without using browser focus traversal");

# High Fidelity Portrait Theater Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the first-time Code Awakener opening with a high-fidelity variables theater using lightweight Live2D-style WebP atlas portraits, cyberpunk dialogue UI, and 60fps mobile degradation.

**Architecture:** Keep the existing single HTML and Phaser runtime. Add a DOM theater overlay driven by `VariableTheaterController`, while Phaser remains responsible for the main corridor camera, pod light cues, scanline, and golden guide arrow. Use embedded WebP atlas data URIs plus part metadata so the page remains directly runnable.

**Tech Stack:** Single-file HTML/CSS/JavaScript, Phaser, Node test script, `npm test`, `npm run build`.

---

### Task 1: Lock Regression Tests First

**Files:**
- Modify: `programming-rpg-c-basics.test.js`

- [ ] **Step 1: Add failing theater contract tests**

Add these assertions near the existing visual-system assertions after the assertion whose message is `NPC portrait generator should draw at least 128x128 images`:

```js
assert(/id="variableTheaterOverlay"/m.test(html), "variable theater overlay should exist for the first-time opening");
assert(/class="variable-theater-panel"/m.test(html), "variable theater should render a bottom dialogue panel");
assert(/VARIABLE_THEATER_ATLASES\s*=\s*Object\.freeze/m.test(html), "variable theater should define embedded WebP sprite atlases");
assert(/repairer:\s*\{[\s\S]*mime:\s*"image\/webp"[\s\S]*logicalWidth:\s*1200[\s\S]*logicalHeight:\s*1600/m.test(html), "repairer atlas should be a 1200x1600 WebP portrait atlas");
assert(/mentor:\s*\{[\s\S]*bodyEntity[\s\S]*codeRibbon[\s\S]*wiseSmile[\s\S]*beardStroke[\s\S]*frown[\s\S]*pupilContract/m.test(html), "mentor atlas should expose body/ribbon layers and four expressions");
assert(/merchant:\s*\{[\s\S]*tradePush[\s\S]*transparentCoat/m.test(html), "merchant atlas should expose transparent clothing and trade push parts");
assert(/tutorialWorker:\s*\{[\s\S]*goggles/m.test(html), "tutorial NPC atlas should expose the shared workwear and goggles template");
assert(/VARIABLE_THEATER_KEYWORDS\s*=\s*Object\.freeze\(\["变量",\s*"int",\s*"printf"\]\)/m.test(html), "variable theater should highlight the required variables dialogue keywords");
assert(/class VariableTheaterController/m.test(html), "variable theater controller should coordinate the opening flow");
assert(/function showVariableOpeningTheater/m.test(html), "first-time opening should be routed through the variable theater");
assert(/variablesTheaterSeen:\s*false/m.test(html), "progress state should persist whether the variable theater has been seen");
assert(/showNewPlayerCourseIntro[\s\S]*showVariableOpeningTheater/m.test(html), "new player course intro should start the variable theater");
assert(!/showNewPlayerCourseIntro[\s\S]*showOpeningNarrativeTerminal\(startMentorDialogue\)/m.test(html), "new player opening should no longer directly start the old overview terminal flow");
assert(/body\.variable-theater-open/m.test(html), "theater should expose a body state class");
assert(/@media\s*\(max-width:\s*800px\)[\s\S]*\.variable-theater-overlay/m.test(html), "variable theater should have a mobile layout below 800px");
assert(/VARIABLE_THEATER_MOBILE_FPS_TARGET\s*=\s*60/m.test(html), "mobile theater should target at least 60fps");
assert(!/VARIABLE_THEATER_MOBILE_FPS_TARGET\s*=\s*30/m.test(html), "mobile theater must not lock to 30fps");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`

Expected: FAIL on `variable theater overlay should exist for the first-time opening`.

- [ ] **Step 3: Do not modify production code yet**

Confirm the failure is due to missing theater implementation, not syntax errors.

### Task 2: Add Theater DOM and CSS Shell

**Files:**
- Modify: `programming-rpg-c-basics.html`

- [ ] **Step 1: Add overlay markup**

Insert before `<section id="dialogOverlay"`:

```html
<section id="variableTheaterOverlay" class="variable-theater-overlay" aria-hidden="true">
  <div class="variable-theater-stage" aria-hidden="true">
    <div class="variable-theater-scanline"></div>
    <div class="variable-theater-edge-fx"></div>
    <div class="variable-theater-cabin-label">#01 变量</div>
    <div class="variable-theater-floor-arrow"></div>
    <div id="variableTheaterRepairer" class="variable-theater-portrait repairer" data-emotion="neutral"></div>
    <div id="variableTheaterMentor" class="variable-theater-portrait mentor" data-expression="wiseSmile"></div>
  </div>
  <div class="variable-theater-panel" role="dialog" aria-live="polite" aria-label="变量引导剧场">
    <div id="variableTheaterSpeaker" class="variable-theater-speaker">老程序员 · 变量引路人</div>
    <div id="variableTheaterText" class="variable-theater-text"></div>
    <label class="variable-theater-console">
      <span>&gt;</span>
      <input id="variableTheaterConsoleInput" value="int level = 7;" readonly aria-label="变量剧场控制台输入">
      <span class="variable-theater-cursor" aria-hidden="true"></span>
    </label>
    <div class="variable-theater-progress" aria-hidden="true"><span id="variableTheaterProgressFill"></span></div>
    <button id="variableTheaterContinueButton" class="variable-theater-continue pixel-button" type="button">继续</button>
  </div>
</section>
```

- [ ] **Step 2: Add CSS**

Add CSS near existing dialog styles. Include:

```css
.variable-theater-overlay { position:absolute; inset:0; z-index:18; display:none; overflow:hidden; color:#e0f2fe; background:rgba(2,6,23,.08); pointer-events:none; }
.variable-theater-overlay.active { display:block; pointer-events:auto; }
body.variable-theater-open #game canvas { filter:saturate(1.08) brightness(.82); }
.variable-theater-panel { position:absolute; left:0; right:0; bottom:0; min-height:35%; padding:24px clamp(18px,4vw,44px); background:rgba(7,16,31,.6); border-top:1px solid rgba(125,211,252,.62); backdrop-filter:blur(8px) saturate(1.2); box-shadow:0 -22px 60px rgba(2,6,23,.5), inset 0 1px 0 rgba(255,255,255,.12); font-family:var(--font-code); }
@media (max-width:800px) { .variable-theater-overlay { background:rgba(2,6,23,.72); } .variable-theater-panel { min-height:42%; backdrop-filter:none; background:rgba(7,16,31,.86); padding:14px; } .variable-theater-portrait.repairer { width:34vw; left:2vw; bottom:38%; } .variable-theater-portrait.mentor { width:30vw; right:2vw; top:4%; } }
```

- [ ] **Step 3: Run test**

Run: `npm test`

Expected: Still FAIL on missing atlas/controller tests.

### Task 3: Add Embedded WebP Atlas Protocol

**Files:**
- Modify: `programming-rpg-c-basics.html`

- [ ] **Step 1: Add constants**

Create the atlas values before editing the constants. Use a temporary Node/Playwright helper outside the committed tree to render four 1200x1600 SVG character sheets to WebP data URLs. Each sheet must include a full-figure base plus clearly separated layer regions named in metadata. The helper output should be copied into the constants below, then the helper should be deleted before final handoff.

Add near player/NPC visual constants. Replace each `atlas` value with the generated WebP data URI from the helper output; the value must start with `data:image/webp;base64,UklGR`.

```js
const VARIABLE_THEATER_MOBILE_FPS_TARGET = 60;
const VARIABLE_THEATER_KEYWORDS = Object.freeze(["变量", "int", "printf"]);
const VARIABLE_THEATER_ATLASES = Object.freeze({
  repairer: {
    mime: "image/webp",
    logicalWidth: 1200,
    logicalHeight: 1600,
    atlas: generatedRepairerAtlas,
    parts: {
      body: { x: 270, y: 520, w: 650, h: 860 },
      head: { x: 430, y: 205, w: 340, h: 330 },
      hairFront: { x: 380, y: 150, w: 420, h: 320 },
      leftEye: { x: 482, y: 350, w: 86, h: 44 },
      rightEye: { x: 632, y: 350, w: 86, h: 44 },
      mouth: { x: 552, y: 438, w: 106, h: 44 },
      leftArm: { x: 118, y: 595, w: 275, h: 680 },
      rightArm: { x: 807, y: 595, w: 275, h: 680 },
      leftHand: { x: 152, y: 1118, w: 170, h: 160 },
      rightHand: { x: 874, y: 1118, w: 170, h: 160 },
      fingers: { x: 846, y: 1040, w: 250, h: 260 },
      outfit: { x: 320, y: 610, w: 560, h: 690 },
      glowEdge: { x: 220, y: 130, w: 760, h: 1220 }
    },
    outfits: { "repairer-default": "outfit" }
  },
  mentor: {
    mime: "image/webp",
    logicalWidth: 1200,
    logicalHeight: 1600,
    atlas: generatedMentorAtlas,
    parts: {
      bodyEntity: { x: 290, y: 390, w: 620, h: 920 },
      codeRibbon: { x: 170, y: 170, w: 860, h: 1010 },
      beard: { x: 438, y: 495, w: 320, h: 520 },
      pupils: { x: 494, y: 350, w: 212, h: 54 },
      brows: { x: 468, y: 302, w: 264, h: 68 },
      hand: { x: 746, y: 750, w: 230, h: 230 }
    },
    expressions: {
      wiseSmile: { mouth: "smile", brows: "calm", pupilScale: 1 },
      beardStroke: { hand: "raised", brows: "calm", pupilScale: 1 },
      frown: { mouth: "flat", brows: "down", pupilScale: 1 },
      pupilContract: { mouth: "flat", brows: "high", pupilScale: 0.72 }
    }
  },
  merchant: {
    mime: "image/webp",
    logicalWidth: 1200,
    logicalHeight: 1600,
    atlas: generatedMerchantAtlas,
    parts: {
      transparentCoat: { x: 260, y: 500, w: 700, h: 780 },
      tradePush: { x: 720, y: 720, w: 330, h: 290 },
      body: { x: 310, y: 300, w: 580, h: 980 },
      hands: { x: 210, y: 760, w: 780, h: 320 }
    }
  },
  tutorialWorker: {
    mime: "image/webp",
    logicalWidth: 1200,
    logicalHeight: 1600,
    atlas: generatedTutorialWorkerAtlas,
    parts: {
      workwear: { x: 310, y: 520, w: 580, h: 760 },
      head: { x: 440, y: 235, w: 320, h: 300 },
      goggles: { x: 392, y: 338, w: 416, h: 110 },
      gogglesBlue: { x: 392, y: 338, w: 416, h: 110 },
      gogglesGold: { x: 392, y: 468, w: 416, h: 110 },
      gogglesGray: { x: 392, y: 598, w: 416, h: 110 }
    }
  }
});
```

- [ ] **Step 2: Add renderer helper**

Implement `renderVariableTheaterPortrait(mount, atlasSpec, variant)` that creates absolutely positioned `.variable-theater-part` nodes from `parts`, using the atlas as a CSS background.

- [ ] **Step 3: Run test**

Run: `npm test`

Expected: Still FAIL on controller/opening flow assertions.

### Task 4: Add VariableTheaterController

**Files:**
- Modify: `programming-rpg-c-basics.html`

- [ ] **Step 1: Add progress field**

Add to initial progress:

```js
variablesTheaterSeen: false,
```

Add to saved progress normalization:

```js
variablesTheaterSeen: Boolean(savedProgress.variablesTheaterSeen),
```

- [ ] **Step 2: Add DOM refs**

Add to `dom`:

```js
variableTheaterOverlay: document.getElementById("variableTheaterOverlay"),
variableTheaterRepairer: document.getElementById("variableTheaterRepairer"),
variableTheaterMentor: document.getElementById("variableTheaterMentor"),
variableTheaterSpeaker: document.getElementById("variableTheaterSpeaker"),
variableTheaterText: document.getElementById("variableTheaterText"),
variableTheaterConsoleInput: document.getElementById("variableTheaterConsoleInput"),
variableTheaterProgressFill: document.getElementById("variableTheaterProgressFill"),
variableTheaterContinueButton: document.getElementById("variableTheaterContinueButton"),
```

- [ ] **Step 3: Add controller**

Implement:

```js
class VariableTheaterController {
  constructor(domRefs) { this.dom = domRefs; this.running = false; this.raf = 0; this.lowFpsFrames = 0; }
  async start(options = {}) {
    if (this.running) return false;
    this.running = true;
    document.body.classList.add("variable-theater-open");
    this.dom.variableTheaterOverlay.classList.add("active");
    this.dom.variableTheaterOverlay.setAttribute("aria-hidden", "false");
    gameState.dialogOpen = true;
    if (gameState.scene) gameState.scene.playerFrozen = true;
    renderVariableTheaterPortrait(this.dom.variableTheaterRepairer, VARIABLE_THEATER_ATLASES.repairer, "repairer-default");
    renderVariableTheaterPortrait(this.dom.variableTheaterMentor, VARIABLE_THEATER_ATLASES.mentor, "wiseSmile");
    playVariableTheaterCorridorCue(gameState.scene);
    await this.typeLine(VARIABLE_THEATER_DIALOGUE);
    extendVariableTheaterGoldenArrow(gameState.scene);
    gameState.progress.openingNarrativeSeen = true;
    gameState.progress.variablesTheaterSeen = true;
    saveProgress();
    this.stop();
    options.onDone?.();
    return true;
  }
  stop() {
    this.running = false;
    window.cancelAnimationFrame(this.raf);
    document.body.classList.remove("variable-theater-open", "variable-theater-low-fx");
    this.dom.variableTheaterOverlay.classList.remove("active");
    this.dom.variableTheaterOverlay.setAttribute("aria-hidden", "true");
    gameState.dialogOpen = false;
    if (gameState.scene) gameState.scene.playerFrozen = false;
  }
  typeLine(text) {
    return new Promise((resolve) => {
      this.dom.variableTheaterText.textContent = "";
      const chars = Array.from(String(text || ""));
      let index = 0;
      const tick = () => {
        index += 1;
        renderVariableTheaterText(this.dom.variableTheaterText, chars.slice(0, index).join(""));
        this.dom.variableTheaterProgressFill.style.width = `${Math.min(100, (index / Math.max(1, chars.length)) * 100).toFixed(2)}%`;
        if (index >= chars.length) resolve(true);
        else trackedSetTimeout(tick, getDialogTextDelay(), "variable-theater-type");
      };
      tick();
    });
  }
  updatePerformance(now) {
    const delta = now - (this.lastFrameAt || now);
    this.lastFrameAt = now;
    this.lowFpsFrames = delta > 16.7 ? this.lowFpsFrames + 1 : Math.max(0, this.lowFpsFrames - 2);
    document.body.classList.toggle("variable-theater-low-fx", this.lowFpsFrames >= 20);
    if (this.running) this.raf = window.requestAnimationFrame((nextNow) => this.updatePerformance(nextNow));
  }
}
```

The implementation must set `gameState.progress.openingNarrativeSeen = true`, `gameState.progress.variablesTheaterSeen = true`, save progress, and restore input on completion.

- [ ] **Step 4: Add `showVariableOpeningTheater`**

Add:

```js
function showVariableOpeningTheater(onDone = null) {
  if (gameState.progress.variablesTheaterSeen) {
    onDone?.();
    return false;
  }
  return variableTheaterController.start({ onDone });
}
```

- [ ] **Step 5: Run test**

Run: `npm test`

Expected: Still FAIL until opening flow is rewired.

### Task 5: Rewire First-Time Opening

**Files:**
- Modify: `programming-rpg-c-basics.html`

- [ ] **Step 1: Replace old intro call**

In `showNewPlayerCourseIntro`, replace:

```js
trackedSetTimeout(() => tutorialAnimationManager.trigger("T01_AWAKENING_PROMPT", { scene: gameState.scene }).then(() => showOpeningNarrativeTerminal(startMentorDialogue)), 720, "new-player-course-intro");
```

with:

```js
trackedSetTimeout(() => tutorialAnimationManager.trigger("T01_AWAKENING_PROMPT", { scene: gameState.scene }).then(() => showVariableOpeningTheater(startMentorDialogue)), 720, "new-player-course-intro");
```

Then adjust `startMentorDialogue` so it does not immediately open the old full `OPENING_MENTOR_LINES` dialogue after the theater. It should accept the beginner quest, expand tracker, show prompt/toast, and schedule name prompt.

- [ ] **Step 2: Keep old terminal as fallback**

Do not delete `showOpeningNarrativeTerminal`. It remains for replay/fallback and old saves.

- [ ] **Step 3: Run test**

Run: `npm test`

Expected: PASS if only static contracts are required.

### Task 6: Add Corridor and Performance Effects

**Files:**
- Modify: `programming-rpg-c-basics.html`

- [ ] **Step 1: Add Phaser cues**

Implement lightweight helpers:

```js
function playVariableTheaterCorridorCue(scene) {
  document.body.classList.add("variable-theater-scan-active");
  const objects = getChapterObjects(scene, "variables");
  objects?.pod?.setTint?.(0x38bdf8);
  trackedSetTimeout(() => document.body.classList.remove("variable-theater-scan-active"), 900, "variable-theater-scan");
  return Boolean(objects);
}
function extendVariableTheaterGoldenArrow(scene) {
  document.body.classList.add("variable-theater-arrow-active");
  trackedSetTimeout(() => document.body.classList.remove("variable-theater-arrow-active"), 2600, "variable-theater-arrow");
  return Boolean(scene);
}
function applyVariableTheaterFailureGlitch() {
  if (document.body.classList.contains("variable-theater-low-fx") || window.innerWidth < 800) return false;
  document.body.classList.add("variable-theater-glitch");
  trackedSetTimeout(() => document.body.classList.remove("variable-theater-glitch"), 200, "variable-theater-glitch");
  return true;
}
function applyVariableTheaterCompileEmotion(success) {
  const target = dom.variableTheaterRepairer;
  target?.setAttribute?.("data-emotion", success ? "success" : "failure");
  return Boolean(target);
}
```

- [ ] **Step 2: Call cues from controller**

The controller should call corridor cue on start, code ribbon acceleration on keyword, and golden arrow on complete.

- [ ] **Step 3: Run test and build**

Run: `npm test`

Expected: PASS.

Run: `npm run build`

Expected: exit 0 and dist files generated.

### Task 7: Browser Verification

**Files:**
- No required source changes unless verification finds issues.

- [ ] **Step 1: Run local page**

Use a local static server or direct file opening. Prefer the in-app browser if available.

- [ ] **Step 2: Verify desktop**

Confirm:

- First new-player flow opens variable theater.
- Left/right portraits are rendered from the WebP atlas parts, not CSS-only geometry.
- Bottom panel occupies about 35%.
- Keywords `变量`, `int`, `printf` become gold as text types.
- Golden arrow appears before entering editor.

- [ ] **Step 3: Verify mobile**

At width below 800px, confirm:

- Layout stacks vertically.
- Portraits shrink to left bottom and right top.
- No 30fps cap exists.
- Degradation targets 60fps and disables expensive effects first.

- [ ] **Step 4: Final verification**

Run:

```powershell
npm test
npm run build
```

Expected: both exit 0.

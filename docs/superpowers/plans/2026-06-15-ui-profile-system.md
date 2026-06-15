# UI Profile System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a second switchable Hacker Terminal UI system while preserving the current default UI.

**Architecture:** Keep one DOM and one Phaser game runtime. Add `uiProfile` to settings, a `UIProfileManager` that applies `body[data-ui-profile]`, and CSS profile tokens for default and terminal modes. The terminal profile changes visual skin, editor colors, code-rain/CRT intensity, menu/buttons/cards/settings styling, and persists through localStorage while clear-save resets to default.

**Tech Stack:** Single HTML/CSS/JS game, Phaser 2D canvas, DOM overlays, localStorage, existing Node static tests.

---

### Task 1: Test UI Profile Requirements

**Files:**
- Modify: `C:/Users/39120/Documents/编程学习/programming-rpg-c-basics.test.js`

- [ ] **Step 1: Write failing static tests**

Add assertions for:

```js
assert(/UI_PROFILES\s*=\s*Object\.freeze/m.test(html), "UI profiles should be centralized");
assert(/class UIProfileManager/m.test(html), "UI profile manager should apply profile state");
assert(/uiProfile:\s*"default"/m.test(html), "default settings should start on the current UI");
assert(/id="uiProfileSelect"/m.test(html), "settings should expose a UI system selector");
assert(/data-ui-profile="terminal"|setAttribute\("data-ui-profile"/m.test(html), "selected UI profile should be applied to body");
assert(/body\[data-ui-profile="terminal"\]/m.test(html), "terminal UI should have profile-scoped CSS");
assert(/#00FF41/.test(html) && /#00FFFF/.test(html) && /#FF00FF/.test(html), "terminal UI should include required hacker palette");
assert(/terminal-code-rain|hacker-terminal/.test(html), "terminal UI should include code-rain or hacker terminal styling hooks");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test`

Expected: FAIL on `UI profiles should be centralized`.

### Task 2: Add Setting and Profile Manager

**Files:**
- Modify: `C:/Users/39120/Documents/编程学习/programming-rpg-c-basics.html`

- [ ] **Step 1: Add profile constants and default setting**

Add `UI_PROFILES = Object.freeze({ default: "default", terminal: "terminal" })`.

Add `uiProfile: "default"` to `defaultSettings`.

- [ ] **Step 2: Add `UIProfileManager`**

Create a small class with:

```js
class UIProfileManager {
  apply(profile = UI_PROFILES.default) {
    const nextProfile = UI_PROFILES[profile] || UI_PROFILES.default;
    document.body?.setAttribute?.("data-ui-profile", nextProfile);
    document.documentElement?.style?.setProperty?.("--ui-profile", nextProfile);
    return nextProfile;
  }
}
```

Instantiate it and call it from `applySettings()`.

- [ ] **Step 3: Add selector in settings**

Add a `UI 系统` select with id `uiProfileSelect` in the Visual section:

```html
<select id="uiProfileSelect">
  <option value="default">默认霓虹动态岛</option>
  <option value="terminal">Hacker Terminal</option>
</select>
```

Wire DOM references, `applySettings()`, and change listener to `updateSetting("uiProfile", value)`.

### Task 3: Add Terminal Profile CSS

**Files:**
- Modify: `C:/Users/39120/Documents/编程学习/programming-rpg-c-basics.html`

- [ ] **Step 1: Add profile-scoped tokens**

Add `body[data-ui-profile="terminal"]` variables:

```css
body[data-ui-profile="terminal"] {
  --neon-blue: #00FFFF;
  --neon-purple: #FF00FF;
  --success: #00FF41;
  --danger: #FF0040;
  --reward: #FFD700;
  --terminal-bg: #0A0A0A;
  color: #00FF41;
  text-shadow: 0 0 5px rgba(0, 255, 65, 0.42);
}
```

- [ ] **Step 2: Skin major UI surfaces**

Scope styling for:

- `#game-shell`
- `.menu-screen`
- `.settings-tab`
- `.pixel-button`
- `.collection-window`
- `.fragment-card`
- `.vscode-window`
- `.editor-center`
- `.console`

Use black glass, green/blue glow, terminal underline hover, and CRT scanline intensity.

- [ ] **Step 3: Skin editor syntax colors**

Scope terminal-mode syntax classes so keywords are `#00BFFF`, strings `#00FF41`, numbers/rewards `#FFD700`, comments `#555555`, preprocessor purple, errors red.

### Task 4: Verify and Build

**Files:**
- Test: `C:/Users/39120/Documents/编程学习/programming-rpg-c-basics.test.js`

- [ ] **Step 1: Run tests**

Run: `npm.cmd test`

Expected: PASS.

- [ ] **Step 2: Run static audit**

Run: `npm.cmd run audit:static`

Expected: PASS, with no new warning beyond existing `startLessonAnimation`.

- [ ] **Step 3: Build**

Run: `npm.cmd run build`

Expected: PASS and update `dist/programming-rpg-c-basics.production.html`.

- [ ] **Step 4: Visual smoke**

Run: `node scripts/visual-regression-smoke.cjs`

Expected: PASS.


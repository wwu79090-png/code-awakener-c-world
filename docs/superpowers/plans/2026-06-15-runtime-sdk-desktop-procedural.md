# Runtime SDK Desktop Procedural Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the C learning RPG into a runtime with a C execution boundary, deterministic procedural world generation, desktop packaging, and an embeddable teaching SDK.

**Architecture:** Keep the browser HTML as the canonical runtime. Add clean adapters around compilation, world generation, and course mounting so future work can replace internals without touching lesson flow.

**Tech Stack:** Browser HTML/CSS/JavaScript, Phaser, Web Worker, WebAssembly adapter boundary, Electron shell, local documentation.

---

### Task 1: C Execution Boundary

**Files:**
- Modify: `programming-rpg-c-basics.html`
- Test: `programming-rpg-c-basics.test.js`

- [x] Add failing assertions for `CExecutionEngine`, TinyCC wasm adapter, worker source, and world-output application.
- [x] Route editor validation through `compileAndRunCProgram`.
- [x] Keep a safe supported-C-subset fallback for current browser builds.

### Task 2: Procedural C World

**Files:**
- Modify: `programming-rpg-c-basics.html`
- Test: `programming-rpg-c-basics.test.js`

- [x] Add deterministic `SeededRng`.
- [x] Add `ProceduralWorldGenerator`.
- [x] Connect generated positions to chapter nodes.
- [x] Mark the C world as procedural.

### Task 3: Desktop Shell

**Files:**
- Create: `package.json`
- Create: `desktop/electron-main.cjs`
- Create: `desktop/electron-preload.cjs`
- Create: `scripts/package-desktop.cjs`

- [x] Add Electron main window loading the canonical HTML.
- [x] Add a narrow preload bridge for saving `.c` files.
- [x] Add package scripts for test, build, and desktop preflight.

### Task 4: Teaching SDK and Community

**Files:**
- Modify: `programming-rpg-c-basics.html`
- Create: `docs/SDK.md`
- Create: `CONTRIBUTING.md`
- Create: `CODE_OF_CONDUCT.md`
- Create: `.github/ISSUE_TEMPLATE/course-content.md`
- Create: `.github/pull_request_template.md`

- [x] Expose `CodeAwakenerSDK` on `globalThis`.
- [x] Add course pack creation, validation, registration, and mounting.
- [x] Document contribution rules and course-content templates.

### Task 5: Verification

**Files:**
- Read/Run: `programming-rpg-c-basics.test.js`
- Run: `build-single-html.cjs`
- Optional: browser smoke test

- [ ] Run `node programming-rpg-c-basics.test.js`.
- [ ] Run `node build-single-html.cjs`.
- [ ] Smoke test the HTML in a browser.

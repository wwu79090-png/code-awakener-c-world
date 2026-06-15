# Quality Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the C language RPG into a quality-gated browser game where reliability, performance, accessibility, save safety, and education quality can be measured continuously.

**Architecture:** Keep the current single HTML runtime stable while adding enforceable quality gates around it. Large rewrites such as "all functions under 30 lines" and "all state under Game" are staged: first expose drift through scripts and tests, then refactor module-by-module.

**Tech Stack:** Single-file HTML, Phaser, DOM HUD, Node-based audit scripts, localStorage persistence, Playwright smoke tests where browser runtime is available.

---

### Task 1: Runtime Quality Foundation

**Files:**
- Modify: `programming-rpg-c-basics.html`
- Modify: `programming-rpg-c-basics.test.js`

- [ ] **Step 1: Write failing tests**

Add assertions that the runtime declares strict mode, a `Game` namespace, quality thresholds, input sanitizers, recursive guards, and save validation hooks.

- [ ] **Step 2: Run test to verify it fails**

Run: `node programming-rpg-c-basics.test.js`
Expected: FAIL on the first missing quality marker.

- [ ] **Step 3: Implement minimal runtime hooks**

Add `"use strict";`, `Game`, `QUALITY_GATE_THRESHOLDS`, `sanitizePlayerInput`, `validateStoragePayload`, and `guardRecursionDepth` without changing current gameplay behavior.

- [ ] **Step 4: Run tests**

Run: `node programming-rpg-c-basics.test.js`
Expected: PASS.

### Task 2: Automated Quality Reports

**Files:**
- Create: `scripts/complexity-audit.cjs`
- Create: `scripts/dependency-graph.cjs`
- Create: `scripts/magic-number-audit.cjs`
- Create: `scripts/animation-leak-audit.cjs`
- Modify: `programming-rpg-c-basics.test.js`

- [ ] **Step 1: Write failing file-existence tests**

Assert all audit scripts exist and can be discovered by the test suite.

- [ ] **Step 2: Run test to verify it fails**

Run: `node programming-rpg-c-basics.test.js`
Expected: FAIL on missing script.

- [ ] **Step 3: Add scripts**

Each script must read `programming-rpg-c-basics.html`, print a compact report, and exit non-zero only on safety-critical errors such as C world language leakage or missing runtime markers.

- [ ] **Step 4: Run scripts**

Run:
`node scripts/complexity-audit.cjs`
`node scripts/dependency-graph.cjs`
`node scripts/magic-number-audit.cjs`
`node scripts/animation-leak-audit.cjs`

Expected: Scripts produce actionable reports.

### Task 3: Developer Documents

**Files:**
- Create: `docs/DESIGN_TESTAMENT.md`
- Create: `docs/DONE_CRITERIA.md`
- Create: `docs/devlog/2026-06-15-quality-hardening.md`
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Write failing tests**

Assert all docs exist.

- [ ] **Step 2: Add documents**

Document why the project uses a C-first world, why quality is staged, what "complete" means, and what future refactors must not break.

- [ ] **Step 3: Verify**

Run: `node programming-rpg-c-basics.test.js`
Expected: PASS.

### Task 4: Browser Smoke And Build

**Files:**
- Modify: `dist/programming-rpg-c-basics.production.html`

- [ ] **Step 1: Build production HTML**

Run: `node build-single-html.cjs`
Expected: production HTML emitted under `dist/`.

- [ ] **Step 2: Run browser smoke**

Open the local file through a temporary HTTP server. Verify main menu, settings panel, and animation budget overlay show no page errors.

- [ ] **Step 3: C-only check**

Run: `rg -n "C\+\+" programming-rpg-c-basics.html`
Expected: no matches.

### Deferred Refactor Backlog

- Split functions over 30 lines module-by-module, starting with `startLessonAnimation`.
- Move top-level declarations into `Game` IIFE boundaries after tests cover public APIs.
- Replace remaining direct cross-module calls with event bus messages where behavior is shared.
- Add axe-core and multi-browser visual regression when CI is available.

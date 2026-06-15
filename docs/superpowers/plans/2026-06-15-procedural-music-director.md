# Procedural Music Director Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the C learning RPG audio layer from looped tones into a procedural cyber lo-fi music director.

**Architecture:** Keep `AudioManager` responsible for low-level Web Audio primitives and add `ProceduralMusicDirector` for composition state. Music reacts to world mood, code execution, pickups, pause/resume, and day-night state while preserving existing SFX.

**Tech Stack:** Web Audio API, seeded deterministic generation, tracked timers, DOM settings controls.

---

### Task 1: Music Contract Tests

**Files:**
- Modify: `programming-rpg-c-basics.test.js`

- [x] Add assertions for world mood constants, harmony progression, pentatonic scale, procedural director, Euclidean rhythm, seeded motifs, unison oscillators, PeriodicWave timbres, reverb fallback, mood functions, pickup/compile gestures, pause/resume hooks, music logs, and settings controls.

### Task 2: Runtime Music Engine

**Files:**
- Modify: `programming-rpg-c-basics.html`

- [x] Add `WORLD_MOOD`, `MUSIC_HARMONY_PROGRESSION`, and `MUSIC_PENTATONIC_SCALE`.
- [x] Add `ProceduralMusicDirector` with seeded motifs, harmony cycling, rest beats, pseudo-canon delay, noise rhythm, soft clipping, compressor, and reverb fallback.
- [x] Connect compile success and compile error to musical gestures.
- [x] Connect pause/resume to music freeze and chase-back behavior.

### Task 3: Player Controls

**Files:**
- Modify: `programming-rpg-c-basics.html`

- [x] Add independent music volume slider.
- [x] Add music complexity selector with full/reduced/off modes.
- [x] Persist music settings through existing settings storage.

### Task 4: Verification

**Files:**
- Run: `programming-rpg-c-basics.test.js`
- Run: `build-single-html.cjs`

- [ ] Run `node programming-rpg-c-basics.test.js`.
- [ ] Run `node build-single-html.cjs`.
- [ ] Browser smoke test the main menu and console.

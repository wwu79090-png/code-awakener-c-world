# Done Criteria

The project is considered ready for a release candidate when these are true:

- `node programming-rpg-c-basics.test.js` passes.
- `node build-single-html.cjs` emits `dist/programming-rpg-c-basics.production.html`.
- `rg -n "C\+\+" programming-rpg-c-basics.html` has no matches.
- Browser smoke opens main menu, settings, gameplay, and F4 animation budget overlay without page errors.
- `scripts/static-quality-audit.cjs`, `scripts/complexity-audit.cjs`, `scripts/dependency-graph.cjs`, `scripts/magic-number-audit.cjs`, `scripts/fuzz-save-data.cjs`, and `scripts/animation-leak-audit.cjs` all run.
- Known quality debt is documented rather than hidden.

Deferred release blockers:

- Split high-complexity functions, starting with `startLessonAnimation`.
- Add axe-core accessibility automation once a package workflow exists.
- Add full Playwright screenshot baseline once browser binaries are installed in CI.

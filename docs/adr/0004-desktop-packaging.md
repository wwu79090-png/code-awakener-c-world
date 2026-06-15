# ADR 0004: Desktop Packaging

## Status

Accepted.

## Context

The project should be able to grow from a browser page into a local desktop learning environment that can save `.c` files through a real filesystem bridge.

## Decision

Use an Electron shell with context isolation enabled. The preload bridge exposes only `saveCFile`, leaving the browser runtime portable and keeping Node APIs out of the game page.

## Consequences

- The same HTML remains the canonical runtime.
- Desktop-specific file access is opt-in through `window.codeAwakenerDesktop`.
- Packaging can later be replaced by another shell without changing lesson logic.

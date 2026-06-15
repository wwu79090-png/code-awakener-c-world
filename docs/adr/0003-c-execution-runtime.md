# ADR 0003: C Execution Runtime

## Status

Accepted.

## Context

The browser game needs a path from simulated lesson checks toward real C code execution. A full compiler binary is not bundled yet, but the runtime must already have a clean boundary for it.

## Decision

Use `CExecutionEngine` as the only public compile-and-run entrypoint. It first supports a TinyCC WebAssembly adapter and falls back to the safe supported tutorial subset when the wasm module is absent.

## Consequences

- Current lessons stay playable without downloading compiler assets.
- A future `assets/tinycc/tcc.wasm` can be added without rewriting editor flow.
- Game world mutation happens only through `applyCProgramOutputToWorld`, keeping side effects visible and auditable.

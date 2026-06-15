# 2026-06-15 Quality Hardening

The checklist became too broad to complete as one code edit without destabilizing the game. The chosen path is to convert it into measurable gates first.

Implemented in this pass:

- Strict mode.
- `Game` namespace façade for future module migration.
- Quality thresholds for function length, complexity, particles, DOM log size, and font fallback.
- Input sanitization, storage payload validation, recursion guard, JSON import filtering.
- DOM node limit enforcement for code logs.
- Canvas context loss handler and font fallback monitor.
- Save import/export and compact quality report hooks.
- Audit scripts for complexity, dependencies, magic numbers, and animation leak markers.

Known debt:

- Many historical functions exceed 30 lines.
- Top-level declarations still exist while `Game` is a façade.
- Some cross-module calls remain direct and should be replaced with event bus messages gradually.

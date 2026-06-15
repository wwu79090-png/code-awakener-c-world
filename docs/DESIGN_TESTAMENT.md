# Design Testament

This project is a C-first programming RPG. The first world must stay focused on C language concepts and must not leak future language content into player-facing code, tests, or tutorial copy.

The current single-file HTML shape is intentional for portability. Quality work should improve the single-file artifact while gradually carving internal modules through `Game.registerModule`, audit scripts, and testable pure functions.

The neon cyber editor style exists because the game teaches programming through the metaphor of a living IDE. Visual effects are allowed only when they support readability, feedback, or memory formation.

Future maintainers should preserve these rules:

- Keep the C world C-only.
- Do not trade working gameplay for a big-bang refactor.
- Add tests before changing core runtime behavior.
- Convert quality goals into scripts or tests whenever possible.
- Prefer staged refactors over heroic rewrites.

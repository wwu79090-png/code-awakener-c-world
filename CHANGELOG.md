# Changelog

## Unreleased

## v1.1.1 - 2026-06-17

- Fixed legacy saves and continue-game entry so completed characters pass through the Memory Core cinematic gate before entering the world.
- Hydrated fixed `gameSave.json` character data before the cinematic gate so old saves have the correct player identity during the bridge.
- Persisted intentional Memory Core skips with a timestamp to avoid repeatedly prompting players who chose to skip.
- Added the Memory Core cinematic overlay to novice-guide blocking checks so tutorials cannot stack over the story.
- Removed the ignored `frame-ancestors` meta CSP directive and kept the runtime frame-bust security layer to reduce browser console false alarms.

## v1.1.0 - 2026-06-17

- Added a post-character-creation five-act Memory Core cinematic using OffscreenCanvas layers for code rain, grid, scene objects, particles, actors, and UI effects.
- Added C concept story acts for variables, input/output, conditions, loops, and functions with entrance, compile interaction, and exit beats.
- Added a Web Audio cinematic layer with main/BGM/SFX routing, smooth mood transitions, panning, reverb, and randomized keyboard tick pitch.
- Added the second-act rational/emotional choice and persisted it for later mentor tone.
- Hardened quality audits so nonce inline scripts are scanned, and extended mobile smoke coverage through post-genesis world handoff.

## v1.0.20 - 2026-06-17

- Fixed the mobile stone compiler layout so the editor stays inside the visible safe area on narrow phones, tall phones, and tablet landscape viewports.
- Made the code input an internally scrollable viewport for 100+ line submissions while keeping the native textarea editing flow.
- Pinned run, reset, and close actions into a fixed bottom console grid so critical buttons remain tappable.
- Added visual viewport, orientation, and safe-area refresh logic for soft keyboards, notches, status bars, and navigation bars.
- Fixed the mentor analysis collapse control so the editor grid column shrinks instead of continuing to reserve desktop width.
- Added regression checks for mobile editor safe-area layout, scroll behavior, tablet compact layout, and mentor-analysis collapse.

## v1.0.19 - 2026-06-17

- Judge rule now passes only when C code compiles and normalized runtime output matches the task expectation.
- Output comparison ignores whitespace, newlines, indentation, and surrounding blanks; extra comments, variables, and non-output code no longer block a correct result.
- Removed MP gating from compile progress and removed MP UI/status controls, so low MP is no longer reported as a compile failure.
- Compile-error system logs now show the real diagnostic and can be skipped quickly by click or keyboard.
- Mobile interaction is touch-first: the virtual interact button says `触摸`, mobile devices explain that touch is the interaction method, movement controls stay available, and desktop `E` remains available.
- Character creation guidance now follows the current typed code, advancing from `int hp` to `char name`, `int level`, and `return 0;` instead of staying on the first prompt.
- Added credits acknowledgement for 花海, including the requested cooperation/support contact details in the in-game credits and startup announcement.

- Added versioned save envelopes with migration, repair, checksum validation, and immutable snapshots.
- Added bounded runtime error reporting, watchdog heartbeat, timer tracking, particle budget guards, and debug shortcuts.
- Added accessibility live announcements, muted visual alerts, adaptive stone-puzzle difficulty, animation intensity settings, learning report hooks, and local time capsule export.
- Added static quality, save fuzzing, and visual smoke scripts plus ADR documentation for the browser runtime and save format.
- Added C execution runtime boundary, deterministic procedural C world generation, Electron desktop shell, embeddable teaching SDK, and community contribution templates.
- Added procedural Web Audio music direction with seeded motifs, mood-driven harmony, Euclidean rhythms, independent music volume, and music complexity controls.

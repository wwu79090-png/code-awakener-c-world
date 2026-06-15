# ADR 0001: C World Browser Runtime

## Status
Accepted.

## Context
The first playable world is a C language learning RPG delivered as a portable browser experience. The project currently favors a single HTML artifact so it can be opened, shared, and smoke-tested without a server.

## Decision
Use Phaser for the 2D world, HTML/CSS overlays for IDE-style UI, and requestAnimationFrame-centered managers for HUD, particles, debugging, and animation quality. Keep world data registered through a world registry so later language worlds can be added without changing the C world contract.

## Consequences
The development file remains larger than a module project, so code is organized by classes and configuration blocks inside the single file. A build script can later inline split assets into the same production artifact.

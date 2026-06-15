# ADR 0005: Procedural Worlds

## Status

Accepted.

## Context

The C world should stay authored and pedagogically ordered, but new sessions should feel less static.

## Decision

Use deterministic seeded generation for stone and gate placement, landmark metadata, and puzzle variants. The seed is stored in save data and can be shared.

## Consequences

- Players get repeatable worlds from a seed.
- Teachers can build course packs without hardcoding every coordinate.
- The first world remains strictly about C while the world registry allows later language packs.

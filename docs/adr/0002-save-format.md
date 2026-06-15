# ADR 0002: Versioned Save Format

## Status
Accepted.

## Context
The game stores progress, cards, settings, and snapshots in localStorage. Earlier saves may not match newer structures as quality systems and future worlds are added.

## Decision
Wrap save payloads in an envelope containing `version`, `checksum`, and `data`. Loading always migrates and repairs data against safe defaults. Critical one-time facts are stored through immutable snapshots.

## Consequences
Corrupt or outdated saves degrade to repaired data instead of crashing the page. The checksum is a lightweight local integrity guard, not a security boundary.

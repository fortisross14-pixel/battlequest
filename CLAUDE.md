# CLAUDE.md

BattleQuest is a turn-based tactical battle simulator for tablets and phones. You play a time traveler who re-fights historical battles with any mix of armies and generals across 10 ages.

## Key documents
- `docs/GAME_DESIGN.md`: the source of truth for rules, content and UX. Read the relevant section before changing gameplay.
- `docs/DECISIONS.md`: log of design and implementation decisions that refine or deviate from the design doc. Add an entry whenever you make one.
- `docs/PROGRESS.md`: milestone checklist.

## Architecture rules
- `src/core` is pure, deterministic TypeScript: no DOM, no Pixi, no `Math.random` (use the seeded RNG), no timers.
- State changes only happen through commands → validation → events. The renderer and UI never change game state directly.
- Content (units, generals, terrain, battles, ages) is typed data in `src/content`. Rule constants live in one config object, not scattered through the code.
- Combat previews reuse the real combat functions.

## UX rules
- Touch first: minimum 44 pt targets, no hover-only information, two-tap confirm for moves, Pointer Events.
- Visual style: a flat "historical battle map" look (parchment, red and blue blocks, NATO-style symbols, translucent arrows). Keep it minimal and readable.

## Workflow
- Before committing, run `npm run typecheck && npm run lint && npm test`.
- New rules need unit tests in `tests/`.
- Small, descriptive commits.

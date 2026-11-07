# CLAUDE.md

BattleQuest is a turn-based tactical battle simulator for tablets and phones. You play a time traveler who re-fights historical battles with any mix of armies and generals across 10 ages.

## Key documents

- `docs/GAME_DESIGN.md`: the source of truth for rules, content and UX. Read the relevant section before changing gameplay.
- `docs/DECISIONS.md`: log of design and implementation decisions that refine or deviate from the design doc. Add an entry whenever you make one.
- `docs/PROGRESS.md`: milestone checklist.
- `docs/history/`: researched briefs per age (battles, generals, troops). Use them as the source for any historical content.

## Architecture rules

- `src/core` is pure, deterministic TypeScript: no DOM, no Pixi, no `Math.random` (use the seeded RNG), no timers.
- State changes only happen through commands → validation → events. The renderer and UI never change game state directly.
- Content (units, generals, terrain, battles, ages) is typed data in `src/content`. Rule constants live in one config object, not scattered through the code.
- Combat previews reuse the real combat functions.

## UX rules

- Touch first: minimum 44 pt targets, no hover-only information, two-tap confirm for moves, Pointer Events.
- Visual style: a flat "historical battle map" look (parchment, red and blue blocks, NATO-style symbols, translucent arrows). Keep it minimal and readable.

## Project skills (`.claude/skills/`)

- `rules-change`: any change to how battles resolve (src/core).
- `add-unit`: new or edited units and generals.
- `add-battle`: new or reworked battle scenarios.
- `balance-sim`: measure balance with headless battles before and after tuning any number.
- `visual-check`: screenshot at tablet and phone sizes and check the style and touch rules after any UI or render change.
- `motion`: timing tokens, style and recipes for every animation (intro, card reveals, victory, in-battle effects).
- `touch-controls`: the gesture set, controls architecture and gesture tests.
- `motion-check`: record animations (frame strips, fps, skip, reduced motion) after any motion or controls change.

## Game-dev skills (third-party, `.claude/skills/_third-party/`)

Copied from awesome-gamedev-agent-skills. They give general game-dev guidance; when they disagree with the project skills above or with `docs/GAME_DESIGN.md`, the project wins.

- `pixijs-rendering`: any Pixi v8 board or render code.
- `game-feel`: juice for hits, charges, routs and rewards (together with `motion`).
- `game-ui-ux`: screens, HUD, menus, the screen stack, safe areas.
- `input-systems`, `camera-systems`: input architecture and camera feel (together with `touch-controls`).
- `game-ai`, `ai-behavior-trees-utility-ai`: the enemy AI.
- `level-design`: battle maps, campaign pacing and star gates.
- `save-systems`: profile versioning and migration.
- `performance-optimization`: frame budget, pooling, profiling.

## Workflow

- Before committing, run `npm run typecheck && npm run lint && npm test`.
- New rules need unit tests in `tests/`.
- Small, descriptive commits.

# Progress

Milestone checklist. See section 12 of `GAME_DESIGN.md`.

## M0 — Scaffold
- [x] Vite + TypeScript (strict) + PixiJS + Vitest + ESLint/Prettier
- [x] Folder layout: `src/core`, `src/ai`, `src/content`, `src/meta`, `src/render`, `src/ui`, `tests`
- [x] npm scripts `dev`, `build`, `test`, `lint`, `typecheck`; CI workflow
- [x] `npm run dev` shows an empty map

## M1 — Core simulation
- [x] Seeded RNG, rules config, grid/direction helpers
- [x] Content: archetypes (4.5) and terrain (4.9: open, rough, forest, hill, river, ford, bridge)
- [x] Data model: map, units, battle state, turn and side
- [x] Command → validation → events engine, with rejection reasons
- [x] Movement: MP costs, terrain multipliers, pathfinding, turning, ZOC, pull back, evade
- [x] Combat: ranged, impact, melee (4.6); flank/rear detection; `previewCombat()`
- [x] Cohesion tests, auto-rout, rout movement, caught routers destroyed, rally (4.7)
- [x] Army breakpoint, turn limit, victory result (4.8)
- [x] Unit tests for every rule + reproducible headless scripted battle
- [x] `balance-sim` v1: `npm run balance -- duel|cost`, reports in `docs/balance/`

## M2 — Playable board
- [x] Battle-map renderer: parchment, terrain shapes, grid, unit blocks, NATO symbols, bars, pips, hatches, hollow routers
- [x] Touch controls: select, highlights, two-tap move with ghost, facing ring, combat preview, long-press card, pan/pinch, Undo / Next unit / End turn
- [x] Event-driven animations (slide, shake, floating numbers)
- [x] Sandbox battle (16×10, river, ford, bridge, hill, forest, ~8 units per side), hot-seat
- [x] Layout check at 1024×768 and 812×375; screenshots
- [x] `scripts/visual-check.mjs` (`npm run visual-check -- --url <dev url>`); debug scenarios `debug-states`, `debug-endgame`

## Next: M3 — AI + Prologue
- [ ] Utility AI (section 4.11) replacing the greedy test script for the enemy side
- [ ] Re-run `balance-sim cost` with the AI and retune costs (open outliers in `DECISIONS.md`)
- [ ] Megiddo tutorial with guided steps

# Progress

Milestone checklist. See section 12 of `GAME_DESIGN.md`.

## M0 — Scaffold
- [x] Vite + TypeScript (strict) + PixiJS + Vitest + ESLint/Prettier
- [x] Folder layout: `src/core`, `src/ai`, `src/content`, `src/meta`, `src/render`, `src/ui`, `tests`
- [x] npm scripts `dev`, `build`, `test`, `lint`, `typecheck`; CI workflow
- [x] `npm run dev` shows an empty map

## M1 — Core simulation
- [ ] Seeded RNG, rules config, grid/direction helpers
- [ ] Content: archetypes (4.5) and terrain (4.9: open, rough, forest, hill, river, ford, bridge)
- [ ] Data model: map, units, battle state, turn and side
- [ ] Command → validation → events engine, with rejection reasons
- [ ] Movement: MP costs, terrain multipliers, pathfinding, turning, ZOC, pull back, evade
- [ ] Combat: ranged, impact, melee (4.6); flank/rear detection; `previewCombat()`
- [ ] Cohesion tests, auto-rout, rout movement, caught routers destroyed, rally (4.7)
- [ ] Army breakpoint, turn limit, victory result (4.8)
- [ ] Unit tests for every rule + reproducible headless scripted battle

## M2 — Playable board
- [ ] Battle-map renderer: parchment, terrain shapes, grid, unit blocks, NATO symbols, bars, pips, hatches, hollow routers
- [ ] Touch controls: select, highlights, two-tap move with ghost, facing ring, combat preview, long-press card, pan/pinch, Undo / Next unit / End turn
- [ ] Event-driven animations (slide, shake, floating numbers)
- [ ] Sandbox battle (16×10, river, ford, bridge, hill, forest, ~8 units per side), hot-seat
- [ ] Layout check at 1024×768 and 812×375; screenshots

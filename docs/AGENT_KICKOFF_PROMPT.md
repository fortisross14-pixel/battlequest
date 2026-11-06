# Agent kickoff prompt

Copy everything below the line into a new agent session on this repo.

---

You are starting development of **BattleQuest**, a turn-based tactical battle simulator for tablets and phones. The game design document is in `docs/GAME_DESIGN.md`. Read the whole file before you write any code. `CLAUDE.md` has the working rules for this repo.

## Your goal for this session

Deliver milestones **M0, M1 and M2** from section 12 of the design doc:

1. **M0 — Scaffold.** Vite + TypeScript (strict) + PixiJS + Vitest + ESLint/Prettier. Use the folder layout from section 11 (`src/core`, `src/ai`, `src/content`, `src/meta`, `src/render`, `src/ui`, `tests`). Add npm scripts: `dev`, `build`, `test`, `lint`, `typecheck`.
2. **M1 — Core simulation** (`src/core`). It must be pure TypeScript with no DOM or Pixi imports, deterministic, and driven by a seeded RNG.
   - Data model: map (grid of terrain + elevation), units (archetype stats from section 4.5, strength, cohesion, facing, side, flags), battle state, turn and side.
   - Commands → validation → state change → events (command pattern, section 11). Commands: `Move` (with final facing), `Rotate`, `Charge`, `Shoot`, `Hold`, `EndTurn`. Every command must report a clear rejection reason when it is invalid.
   - Movement: MP costs (orthogonal 2, diagonal 3, terrain multipliers), pathfinding, facing and turning costs, zones of control, pull back, evade.
   - Combat: ranged, impact, melee, using the formulas and multipliers in 4.6. Flank and rear detection from facing.
   - Cohesion tests, auto-rout at strength 25 or below, rout movement, destruction of caught routers, rally (4.7).
   - Army breakpoint, turn limit, victory result (4.8).
   - Terrain from 4.9 that M2 needs: open, rough, forest, hill, river, ford, bridge. Skip weather and fog of war for now, but leave room for them.
   - A `previewCombat()` function that returns expected-value results and reuses the real combat code.
   - Tests: cover every rule above with focused unit tests, plus one **headless scripted battle** that runs from start to a victory result with a fixed seed and checks the outcome is reproducible.
3. **M2 — Playable board** (`src/render`, `src/ui`).
   - A battlefield rendered in the "historical battle map" style from section 10: parchment background, flat terrain shapes, a subtle grid, blue and red rectangular unit blocks rotated to their facing, a thicker front edge, a NATO-style symbol, a strength bar, a cohesion pip, hatch patterns for Disrupted and Fragmented, and hollow blocks for Routed.
   - Touch controls from section 9: tap to select; reachable, charge and shoot highlights; two-tap move confirm with a ghost; facing ring; combat preview panel with Confirm and Cancel; long-press unit card; one-finger pan and pinch zoom; Undo, Next unit and End turn buttons. Use Pointer Events so the same code also works with a mouse on desktop.
   - Short event-driven animations (slide, shake, floating damage numbers).
   - One **sandbox battle** in `src/content` (about 16×10 map with a river, a ford, a bridge, a hill and a forest; about 8 units per side mixing archetypes), playable **hot-seat** (two humans, alternating) until one army breaks.

## Constraints

- Keep the layering strict: `core` never imports from `render`, `ui` or the DOM. The renderer only reads state and plays events; it never changes game state.
- All content (unit stats, terrain values, the sandbox battle) lives in `src/content` as typed data. Use no magic numbers in the rules code; put tunable constants in one `rules config` object.
- Touch first: 44 pt minimum touch targets, no hover-only information. Test layouts at 1024×768 and 812×375 (phone landscape).
- Don't build the AI, generals, army builder, economy, or campaign yet (M3+). Shape the code so they fit later; for example, the general's command radius can be a stub that always returns false.
- If a rule in the design doc is ambiguous or produces bad gameplay once implemented, pick a sensible option, implement it, and record it in `docs/DECISIONS.md` (date, decision, reason). Don't stop to ask unless the choice is blocking.

## How to work

1. Read `docs/GAME_DESIGN.md` and `CLAUDE.md`.
2. Write a short plan of the M0–M2 tasks in `docs/PROGRESS.md` and keep it updated as you finish them.
3. Build M0, then M1 with tests (test-first for combat and morale math), then M2.
4. Before each commit run `npm run typecheck && npm run lint && npm test`. Commit in small, clear steps (one per meaningful chunk) and push to the working branch.
5. At the end, run the dev server and check the sandbox battle in a headless browser at tablet size: take screenshots of the initial board, a selected unit with highlights, a combat preview, and a routed unit. Fix anything that looks wrong.
6. Finish with a short summary covering what works, what is stubbed, the decisions logged in `docs/DECISIONS.md`, and the recommended next step (M3).

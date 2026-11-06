# Progress

Milestone checklist. See section 12 of `GAME_DESIGN.md`.

## M0 — Scaffold ✔
- [x] Vite + TypeScript (strict) + PixiJS + Vitest + ESLint/Prettier, folder layout, npm scripts, CI, Pages deploy workflow

## M1 — Core simulation ✔
- [x] Seeded RNG, rules config, grid, map, movement, ZOC, combat, cohesion, rout, rally, victory, preview, undo
- [x] Unit tests for every rule + reproducible headless battle
- [x] `balance-sim` (`npm run balance -- duel|cost|scenario`), reports in `docs/balance/`

## M2 — Playable board ✔
- [x] Battle-map renderer, touch controls, animations, hot-seat sandbox, `scripts/visual-check.mjs`

## M3 — AI, campaign start and meta loop ✔ (first playable version)
- [x] Utility AI (aggressive / defensive / timed postures, uses general skills), one command at a time
- [x] Generals in battle: command radius by rank, passive traits, 6 skill effects, pennants, general loss
- [x] 19 era units (ages 0–2), 8 playable + 6 enemy generals
- [x] 6 campaign battles: Megiddo (tutorial), Kadesh, Qarqar, Marathon, Thermopylae, Leuctra — 2 v 2 growing to 5 v 5
- [x] Profile, save (localStorage), stars, coins, general XP and ranks, age unlocks
- [x] Shop: Recruit / Veteran / General packs (pity), daily offer
- [x] Screens: menu, campaign, briefing + army builder, deployment, battle vs AI with speed control, results, shop, army (troops, generals)

## Next
- [ ] Human playtest of the six battles; retune with `balance-sim scenario` (current stand-in results are mostly too easy)
- [ ] Re-run `balance-sim cost` with the AI and retune unit costs
- [ ] Remaining Age 2 battles (Gaugamela, Hydaspes) and more generals' unique skills
- [ ] Reinforcements, fog of war, weather; marsh, village, fieldworks, road terrain

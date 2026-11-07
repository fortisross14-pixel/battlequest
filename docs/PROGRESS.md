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

## Review 1 fixes (docs/reviews/2026-11-06-review-1.md)
- [x] WP1 — Army choice, troop cards and upgrades: profile v2 + migration, upgrade with cards and coins, reward cards, slot-based army builder, general picker, Army screen upgrades
- [x] WP2 — Enemy AI that fights as an army: one best action at a time, move + charge, posture triggers, support, path-aware approach; beats the M3 AI 65% (`balance-sim aivsai`)
- [x] WP4 — Rule bugs and movement feel: evade pull-back, turn-start facing, preview includes melee, ×0.5 flank strike-back, Concede, sidestep, default facing, evade 0.6, end-turn confirm
- [x] WP3 — Unit graphics and icons: role-shaped troop badges (owner-approved) on the board and every screen, wider blocks, softer hills, clear fords, denser rough, terrain legend, phone layout with side button columns, visual-check browser fallback
- [x] WP6 — Battle readability: objective chip, melee banner, combat log drawer, preview labels, end-of-battle summary with the turning point
- [x] WP5 — Balance and campaign difficulty: utility-AI cost tuning (7 of 12 within ±15%, spread −22% to +35%), Charge and HitAndRun tags, enemy levels and breakpoints (4 of 6 battles in band), stronger general traits, Alexander’s Companion Charge and his rank-5 second skill
- [x] WP7 — Code health: screens split per screen, tap state machine and tutorial guide in tested pure code, combat log module, isSpent in core, new tests

## Owner feedback after review 1
- [x] Compact cards with rarity pill, power and details on long-press or hover; "?" cards for locked troops and generals
- [x] Slot picker in the army builder
- [x] Generals as their own unit on the map; losing the general loses the battle; conservative AI generals
- [x] Missile range 3 (shoot over units), range shown on selection
- [x] Turning costs 1 MP; Turn button
- [x] Whole army joins once any unit is in melee (idle Megiddo unit)

## Campaign timeline (docs/prompts/04-campaign-timeline.md)
- [x] Phase A — ages data (10 ages, 2 playable), star-gated unlocks, age unlocks on all wins, newlyUnlocked, profile v3 migration, tests
- [x] Phase B — timeline and age map screens, build-time Natural Earth maps, screen stack, results return to the age map
- [x] Phase C — Age 0 tutorial battles (Megiddo, Kadesh): event-driven tutorial scripts, skip, builder tips, headless script tests
- [x] Phase D — Antiquity: 10 battles (6 new), elephants (ScaresHorses, Stampede) and scythed chariots, 9 new troops, 6 new generals, difficulty bands and star route

## Next
- [ ] Human playtest of Megiddo (slightly easy) and Leuctra (slightly hard), and of cost outliers (elephants, heavy swordsmen, light cavalry, skirmishers, line infantry)
- [ ] Hannibal’s Ambush (pre-battle redeploy) and other unique general skills
- [ ] Human playtest of the twelve battles; retune with `balance-sim scenario` (stand-in results are close to all-or-nothing)
- [ ] Re-run `balance-sim cost` and retune unit costs; war elephants are +51% per point after ScaresHorses
- [ ] More generals' unique skills (Darius, Porus and Philip reuse existing effects)
- [ ] Age map: the Greek battles crowd together on phones; consider an inset or a zoomed Greece view
- [ ] Reinforcements, fog of war, weather; marsh, village, fieldworks, road terrain

# Agent prompt: build Ages 0–2 from the history briefs

Copy everything below the line into a **new** coding-agent session. A fresh session loads the project skills and `CLAUDE.md` when it starts.

---

Pull the latest branch. The next goal is to make **Age 0 (Dawn of War), Age 1 (Antiquity) and Age 2 (Classical Empires) fully playable**, built from the new history briefs and following the progression design.

**Read first**
- `CLAUDE.md`.
- `docs/GAME_DESIGN.md`:
  - **§5.1** the per-age card ladder, army limits and age power tiers;
  - **§7.3** main and optional battles and star gates;
  - **§7.4** the reworked tutorial;
  - **§7.6** the difficulty and progression curve (new);
  - **§8** economy: pack guarantees, General Pack price, age-unlock bonus.
- The history briefs:
  - `docs/history/README.md` (how to use them);
  - `docs/history/age-00-dawn-of-war.md`;
  - `docs/history/age-01-antiquity.md`;
  - `docs/history/age-02-classical-empires.md`.
- `docs/PROGRESS.md`, to see what earlier prompts (02, 04) already delivered. **This prompt replaces the content parts of `04-campaign-timeline.md` (Phases C and D).** If the timeline and age-map screens from 04 (Phases A and B) aren't built yet, build them first, as 04 describes.
- Skills: `add-battle`, `add-unit`, `rules-change`, `balance-sim`, `visual-check`, and the third-party `level-design` and `save-systems`.

## How to read the briefs
- Copy historical facts, names, dates, coordinates, briefings, flavour text and sources **as written**.
- **Every battle in the briefs still defines a `player` army.** That's from an older format: the player always picks their own army. Use it only as a hint for the `testArmy` that balance-sim stands in with. Never use it as a fixed army (the Megiddo tutorial is the one exception, below).
- Enemy armies (`enemy.units`), with their cards, levels and the general's rank, are the starting point. Tune them with `balance-sim` to hit the §7.6 targets.
- `mapSketch`, `difficulty` and the suggested traits and skills are starting points as well.

## Fixes to the briefs before building (the owner has approved these rules)
1. **Too many generals.** Each age's ladder allows 2 generic generals plus **5–8 playable named ones (2–3 Rare, 2–3 Epic, 1–2 Legendary)**. The briefs have 12 playable named generals in each of Ages 1 and 2. Keep the extra commanders as **enemy-only** generals (`playable: false`).

   Proposed playable sets:

   | Age | Rare | Epic | Legendary |
   |---|---|---|---|
   | Antiquity | Miltiades, Pausanias, Pagondas | Leonidas, Epaminondas (from Legendary), Philip II | Alexander |
   | Classical Empires | Flamininus, Xanthippus, Aemilius Paullus | Pyrrhus, Scipio Africanus (from Legendary), Vercingetorix | Hannibal, Caesar |

   The age 0 generals Thutmose III and Ramesses II become **enemy and briefing figures only** in Age 0, and join the Antiquity General Pack as Rare and Epic generals.
2. **Legendary troops.** Both briefs pick war elephants, which lack the "icon of the age" pull.
   - Antiquity: promote **Companion cavalry** to Legendary, and move Indian war elephants to Epic, next to the Theban Sacred Band. Spartan hoplites move from Rare to Epic only if that keeps 2 Epics; otherwise they stay Rare.
   - Classical Empires: add **Legio X (Caesar's Tenth Legion)** as the Legendary troop (heavySwordsmen, signature ability per `add-unit`). Classical war elephants move to Epic next to Cataphracts. Roman auxiliaries move to Rare.

   Log both changes in `docs/DECISIONS.md` and keep the ladder sizes from §5.1.
3. **Generals in tutorials:** the player always uses the generic **Bronze Age Captain** (§7.4).

## Phase A — Card ladders and economy
1. Replace the existing era units and generals with the three ladders, using the `add-unit` skill for every card.
   - Migrate saves: each removed card maps to its closest ladder card (for example `egyptianSpearmen` → `bronzeAgeSpearmen`), keeping its level and spare cards. Test it.
2. Add the army limits (1 Legendary and 2 copies of each Epic per army), age power tiers, per-age shop tabs and packs, the first-pack guarantees, the General Pack price, the age-unlock bonus, and the guaranteed road to each age's Legendary (§5.1, §8).
3. Add **`balance-sim progression`**: a simulated player plays an age in order with a simple buying and upgrading policy, over many seeds. It reports:
   - coins at each age start, and whether 2 Recruit Packs plus 1 General Pack are affordable;
   - the expected collection at each battle;
   - win rates against the §7.6 table.

## Phase B — Age 0 tutorial rework (§7.4)
1. **Megiddo: almost impossible to lose.**
   - 3 player units (generic Commons and the Bronze Age Captain) against 2 weak level-1 enemies positioned so that their flanks face the player's chariots.
   - Intended script: select and move, charge a flank twice, End turn, the enemy counter-attacks weakly and breaks, within about 2–3 turns.
   - **Fix the tutorial step targeting:** every step must highlight the exact unit or square it refers to. The owner reported that steps pointed at the wrong enemies. Add a test that each step's target matches the scenario's units.
2. **Kadesh: easy, but losable through bad play.**
   - About 4 player units against 3 level-1 enemies.
   - Objective: break the enemy army. Remove the 5-turn hold-out and the level-2 chariots.
   - Tutorial steps: army builder (choose cards, copies allowed), choose the general, shoot with archers, use the general's skill.
   - Target: about 95% win rate for sensible play. A test plays badly on purpose (units facing away, chariots never charging) and must be able to lose.
3. Both tutorial scripts are data, can be skipped, and are completed headlessly in tests.

## Phase C — Age 1 Antiquity and Age 2 Classical Empires (27 main and 13 optional battles)
1. Build every battle in both briefs with the `add-battle` skill: maps from the sketches, enemy armies from the briefs, objectives, conditions, star conditions, briefings and coordinates for the age map.
   - Optional battles branch from the main battle named in `branchesFrom` and give the brief's `reward`. **Answer to the brief's open question:** the reward is guaranteed on the first win.
2. New mechanics go through `rules-change`, at most one per battle. Examples: elephants (ScaresHorses, Stampede), scythed chariots, ambush and fog (Trasimene, Teutoburg), horse archers (Carrhae).
   - If a mechanic is too big for this round, simplify the battle and log it. Don't block on it.
3. **Tune to §7.6** with `balance-sim scenario` and `progression`:

   | Battle | Commons only | With the expected collection |
   |---|---|---|
   | Battle 1 of each age | about 50–60% | about 90% after the first packs |
   | Middle battles | | 60–75% |
   | Last 2–3 battles | | 35–50% (80%+ with the Legendary and good play) |
   | Optional battles | harder than the main battle they branch from | |

   Put the final table in `docs/balance/`.
4. Update `docs/history/README.md` status: built, plus any deviations.

## Rules
- Each phase ends with:
  - `npm run typecheck && npm run lint && npm test` green;
  - `visual-check` on changed screens and new maps;
  - decisions logged;
  - `docs/PROGRESS.md` updated;
  - small commits pushed.
- Don't edit the history briefs' historical content. Record deviations in `docs/DECISIONS.md`.
- Before your final push, run `code-review` (medium) on your diff and fix what it finds.

**Finish with:**
- a short summary per phase;
- the win-rate table for every battle in Ages 0–2 (commons only, and expected collection);
- the progression results (coins and collection at each age start);
- screenshots of both tutorials, the Antiquity and Classical Empires age maps, and two new battles;
- any mechanics you simplified or deferred.

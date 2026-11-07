# Agent prompt: campaign timeline, age maps and Antiquity

Use this **after the Review 1 fixes** (`docs/prompts/02-review-1-fixes.md`) and **before** the controls and motion work (`docs/prompts/03-controls-and-motion.md`). Copy everything below the line into a **new** agent session: the session loads the project skills when it starts, so a fresh one picks up the new ones.

---

Pull the latest branch first. The next goal is the campaign structure:

- a **timeline of ages**;
- a **map of real battle locations** inside each age;
- **star-gated** battle unlocks;
- a two-battle **tutorial age**;
- a full **Antiquity** age of 10 battles.

**Read first:**
- `CLAUDE.md`, including the new **game-dev skills** section;
- `docs/GAME_DESIGN.md` **§7, rewritten**: the timeline (7.1), age map (7.2), unlock rules and star thresholds (7.3), the Age 0 tutorial (7.4) and the age and battle list (7.5). It is the spec;
- the project skills `add-battle`, `add-unit` and `rules-change`;
- the history briefs in `docs/history/` (`age-00-…` and `age-01-…`), if they exist: they are the source for the tutorial and Antiquity battles, troops and generals. If they aren't there yet, research each battle yourself as `add-battle` describes;
- the third-party skills `level-design` (gating and pacing), `game-ui-ux` (screen stack, safe areas) and `save-systems` (migration).

**Before you start,** confirm that Review 1's work packages are complete in `docs/PROGRESS.md`. If any are unfinished, finish them first.

## Phase A — Campaign data and rules (`src/content`, `src/meta`)
1. **Data model:**
   - `Age`: id, number, name, years, region bounds for the map, emblem, an ordered battle list, star thresholds per battle (default `[0,0,1,2,4,6,8,10,14,18,22,26]`), starter troops, and `status: 'playable' | 'inPreparation'`;
   - each battle gets `lat`/`lon`.

   Add all 10 ages from §7.5. Ages 2–9 are `inPreparation`, with their battle names and coordinates listed but no scenarios.
2. **Pure, tested functions in `src/meta/campaign.ts`:**
   - `ageStars`;
   - `ageProgress` (won/total battles, stars/total);
   - `isBattleUnlocked` (star thresholds counted within the age);
   - `isAgeUnlocked` (Age 0 is always open; the next age opens once every battle of the previous age is won);
   - `newlyUnlocked(before, after)`, which lists the battles and ages a result just unlocked, for the unlock animations later.
3. **Profile migration (version bump):** map old battle records onto the new ids. Megiddo and Kadesh move into Age 0; Qarqar, Marathon, Thermopylae and Leuctra move into Antiquity. Never lose earned stars. Test it.
4. **Tests:**
   - the threshold table;
   - battles 1 and 2 always open;
   - unlocking by replaying for more stars;
   - the age unlocks on all wins, not on all ★★★;
   - `inPreparation` ages never open;
   - migration.

## Phase B — Timeline and age map screens (`src/ui`)
1. **Timeline screen** (§7.1). It replaces the current Campaign screen:
   - a horizontally scrollable parchment strip with an ink line and date ticks;
   - age nodes showing name, years, emblem, "x/10 battles" and "x/30 ★";
   - locked ages carry a seal and their requirement; unbuilt ages say "In preparation";
   - the screen opens scrolled to the newest unlocked age.
2. **Age map screen** (§7.2):
   - Generate the region maps **at build time** from Natural Earth data: the `world-atlas` npm package (TopoJSON, public domain data) with `topojson-client` and `d3-geo` as **devDependencies**, in a script `scripts/maps/build-age-maps.ts`. Project each age's bounds, simplify, and write small static SVGs (land, coast and a few rivers) to `src/content/maps/`. Commit the SVGs. The runtime ships only the SVG, not the map libraries.
   - Battle nodes are placed by projecting lat/lon with the same projection, saved alongside each SVG.
   - Each node shows its name and year, stars, and a lock with the stars needed. A dotted route links the battles in order.
   - The header shows the age name and its progress.
   - The map pans and pinch-zooms if it is larger than the screen, using the same gesture code as the battlefield.
   - Tapping a locked node shows "Need 3 more ★" and briefly highlights the battles that could still earn stars.
3. Keep a simple **screen stack** (menu → timeline → age map → briefing → battle → results → back to the age map), following `game-ui-ux`. Back always returns to the previous screen.
4. After a result, return to the **age map**, not the menu. Highlight what `newlyUnlocked` reports, with a simple fade for now; the ceremonies come in prompt 03. Leave a clear hook such as `playUnlocks(events)`.
5. Touch rules: 44 pt targets; nodes that are close together must stay tappable (offset them or add a picker); it must work at 1024×768 and 812×375. Run `visual-check` on both new screens.

## Phase C — Age 0: Dawn of War (tutorial, §7.4)
1. **Megiddo** (very easy, fixed army made of the player's 2 starting troops plus Thutmose). Tutorial steps:
   - select, move and face;
   - attack a **flank** and see the difference from a frontal attack: the preview shows the multiplier;
   - **support**: put a second unit on the same enemy;
   - how armies break.

   Use a map layout that makes the flank attack the obvious winning move.
2. **Kadesh** (easy). Tutorial steps:
   - **choose troops** in the army builder (it should suggest taking 2 archers, to show that copies are allowed);
   - **pick a general**;
   - **shoot** with archers;
   - **use a general skill**.

   Drop the old hold-out objective if it gets in the way of teaching.
3. Make the tutorial steps data-driven (one tutorial script per battle). Steps advance on real events. They can be skipped, and they are never shown again once the battle is won.
4. Rewards: winning Megiddo grants archers and Thutmose (as in Review 1); winning both unlocks Antiquity and grants its starter troops.
5. Tests: each tutorial script can be completed headlessly by following its own steps.

## Phase D — Age 1: Antiquity (10 battles)
1. Rework Qarqar, Marathon, Thermopylae and Leuctra, and add **Plataea, Chaeronea, Granicus, Issus, Gaugamela and Hydaspes**, in the order of §7.5, using the `add-battle` skill for each: research, the one-problem sentence, map, enemy, coordinates, briefing, tests.
2. New rules these battles need go through `rules-change`:
   - elephants (ScaresHorses, Stampede) for Hydaspes;
   - scythed chariots for Gaugamela;
   - anything else the scenarios require.

   New troops and generals (for example the Macedonian phalanx, Companions, Persian Immortals, Alexander, Darius, Porus) go through `add-unit`.
3. **Difficulty follows the star gates.** With `balance-sim scenario`, target win rates of about 80% for battles 1–2, falling to about 40% for battles 9–10, using a "reasonable owned army" that matches what a player is likely to own at that point. Check that the full 30-star route is reachable but needs replays or upgrades for the last gates.
4. Log new mechanics, threshold tweaks and difficulty numbers in `docs/DECISIONS.md`.

## Rules
- Each phase ends with:
  - `npm run typecheck && npm run lint && npm test` green;
  - `visual-check` on any changed screen;
  - decisions logged;
  - `docs/PROGRESS.md` updated;
  - small commits pushed.
- Don't edit the third-party skills in `.claude/skills/` (the ones listed in `_third-party/`). If one of them conflicts with a project skill or the design doc, the project wins.
- Before your final push, run `code-review` (medium) on your diff and fix what it finds.

**Finish with:**
- a short summary per phase;
- screenshots of the timeline (fresh profile, and after finishing Age 0), the Antiquity map with a mix of locked and starred nodes, and both tutorial battles;
- the win-rate table for the 12 playable battles;
- anything you deferred.

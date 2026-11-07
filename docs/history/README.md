# History briefs

This folder holds the **historical research** behind every age, battle, general and troop in the game. A history agent writes it, following `TEMPLATE.md`. The build agent turns it into game data in `src/content` using the `add-battle` and `add-unit` skills.

**Roster:** `ROSTER.md` lists every main and optional battle for each age.

**Files:** one per age, `age-NN-<slug>.md`, from `age-00-dawn-of-war.md` to `age-09-age-of-rifles.md`. The age and battle list in `GAME_DESIGN.md` §7.5 is the starting point; the history briefs may propose swaps, and each swap is explained at the top of the age file.

**How the build agent uses a brief:**
- Copy history, names, dates, coordinates, briefings and flavor text as written.
- Treat `suggested*` fields, `difficulty` and `mapSketch` as starting points. Tune them with `balance-sim`, then log any significant change in `docs/DECISIONS.md`.
- Every `newMechanics` entry and `existingEffect: none` skill goes through the `rules-change` skill before the battle or general that needs it.
- If the brief and `GAME_DESIGN.md` disagree on a game rule, the design doc wins. If they disagree on a historical fact, the brief wins.

**Status**

| Age | File | Status |
|---|---|---|
| 0 Dawn of War | `age-00-dawn-of-war.md` | to do |
| 1 Antiquity | `age-01-antiquity.md` | to do (needed first) |
| 2 Classical Empires | `age-02-classical-empires.md` | to do |
| 3 Early Middle Ages | `age-03-early-middle-ages.md` | to do |
| 4 High and Late Middle Ages | `age-04-high-late-middle-ages.md` | to do |
| 5 Age of Exploration | `age-05-exploration.md` | to do |
| 6 Pike and Shot | `age-06-pike-and-shot.md` | to do |
| 7 Linear Warfare | `age-07-linear-warfare.md` | to do |
| 8 Napoleonic Wars | `age-08-napoleonic.md` | to do |
| 9 Age of Rifles | `age-09-age-of-rifles.md` | to do |

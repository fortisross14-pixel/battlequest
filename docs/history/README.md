# History briefs

This folder holds the **historical research** behind every age, battle, general and troop in the game. A history agent writes it, following `TEMPLATE.md`. The build agent turns it into game data in `src/content` using the `add-battle` and `add-unit` skills.

**Roster:** `ROSTER.md` lists every main and optional battle for each age.

**Files:** one per age, `age-NN-<slug>.md`, from `age-00-dawn-of-war.md` to `age-09-age-of-rifles.md`. The age and battle list in `GAME_DESIGN.md` §7.5 is the starting point; the history briefs may propose swaps, and each swap is explained at the top of the age file.

**How the build agent uses a brief:**
- Copy history, names, dates, coordinates, briefings and flavor text as written.
- Treat `suggested*` fields, `difficulty` and `mapSketch` as starting points. Tune them with `balance-sim`, then log any significant change in `docs/DECISIONS.md`.
- Every `newMechanics` entry and `existingEffect: none` skill goes through the `rules-change` skill before the battle or general that needs it.
- If the brief and `GAME_DESIGN.md` disagree on a game rule, the design doc wins. If they disagree on a historical fact, the brief wins.

**Phase 1 scope: Ages 0–4.** That is 70 battles (45 main and 25 optional, per `ROSTER.md`), the five card ladders and their generals, delivered one age per document. Ages 5–9 follow later.

Age 0 is a tutorial with a mini ladder: 3 Bronze Age Commons (spearmen, archers, chariots), 1 generic Common general, and the named generals of Megiddo and Kadesh. The existing troop ids (`egyptianSpearmen`, `egyptianArchers`, `egyptianChariots`, `canaaniteWarriors`, `canaaniteChariots`) are folded into the ladders by the build agent, so the briefs don't need to reuse them.

**Status**

| Age | File | Status |
|---|---|---|
| 0 Dawn of War | `age-00-dawn-of-war.md` | **built** 2026-11-07 (prompt 06). Deviations: tutorials use the Bronze Age Captain, no enemy general on the field; Kadesh breaks the army instead of the hold-out and has 4 slots against 3 Level 1 units; Megiddo has 3 player units (spearmen, two chariots) against 2 Disrupted blocks behind a brook. |
| 1 Antiquity | `age-01-antiquity.md` | **built** 2026-11-07: 10 main and 7 optional battles. Deviations: prompt 06 ladder and general fixes; scythed chariots kept as an enemy-only card at Gaugamela; optional rewards naming enemy-only generals replaced (Mantinea 418 Spartan hoplites, Cunaxa Hoplite phalanx, Coronea Leonidas); hold-point objectives (Issus, Persian Gate) become break-the-army; strike-the-commander (Cunaxa) is break-the-army with the enemy general as the ★★★ bonus; the generic bonus "preserve the unit…" is replaced by a concrete one per battle; rain at Hydaspes not modelled; enemy counts and levels tuned. See DECISIONS, Ages 0–2 C. |
| 2 Classical Empires | `age-02-classical-empires.md` | **built** 2026-11-07: 12 main and 6 optional battles. Deviations: Legio X added as the Legendary; Hellenistic phalanx enemy-only and fielded at Cynoscephalae and Pydna (the brief used Classical spearmen); rewards naming enemy-only generals replaced (Metaurus Classical war elephants, Edessa Cataphracts); fog and ambush (Trebia, Trasimene, Teutoburg) are set-ups (hidden or flanking deployment squares) without fog of war; Metaurus hold-point becomes break-the-army; Alesia puts enemies on both sides; rain at Trebia not modelled; map region stops at 42° E. See DECISIONS, Ages 0–2 C. |
| 3 Early Middle Ages | `age-03-early-middle-ages.md` | received 2026-11-07; build with prompt 10 (ladder fixes listed there) |
| 4 High and Late Middle Ages | `age-04-high-late-middle-ages.md` | received 2026-11-07; build with prompt 10 (ladder fixes listed there) |
| 5 Age of Exploration | `age-05-exploration.md` | to do |
| 6 Pike and Shot | `age-06-pike-and-shot.md` | to do |
| 7 Linear Warfare | `age-07-linear-warfare.md` | to do |
| 8 Napoleonic Wars | `age-08-napoleonic.md` | to do |
| 9 Age of Rifles | `age-09-age-of-rifles.md` | to do |

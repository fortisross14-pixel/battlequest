# Agent prompt: tactical actions and age filters

> **Superseded by `09-premium-ux-and-battle-depth.md`** (07 and 08 merged, lighter testing). Kept for history; don't run it.

Use this **after `07-premium-ux-and-motion.md`**, because the action UI plugs into its command bubble and attack preview. If 07 hasn't started yet, Phase A (rules) and Phase D (age filter) can run first, and Phase B waits for the bubble. Copy everything below the line into a **new** coding-agent session.

---

Pull the latest branch. The goal is **more tactical depth in battle**: better cards get real tactical choices (area Volleys, Fortify, Full charge breakthroughs and other signature actions), while Commons stay simple. Also add **age filters** to the Army screen and the army builder.

**Read first**
- `CLAUDE.md`.
- `docs/GAME_DESIGN.md`:
  - **§4.12 Tactical actions** (new): the spec for every action, with starting numbers and the rules for adding actions;
  - §4.6 and §4.7 (combat and cohesion);
  - §5.1 (rarity unlocks actions).
- `docs/UX_PRESENTATION.md`:
  - §2 (petal changes and **attack modes**);
  - §3 (the Volley, Fortify and breakthrough animations);
  - §4 (**age filter**, unit-card actions).
- Skills: `rules-change` (every action), `add-unit` (assigning actions to cards), `balance-sim`, `game-ai` and `ai-behavior-trees-utility-ai` (the AI must use the actions), `motion`, `game-feel`, `visual-check`, `motion-check`.

## Phase A — Rules (`src/core`, the `rules-change` skill for each action)
1. Add an **action system**:
   - each card lists its actions (data in `src/content`);
   - each action is a command with validation, events and its numbers in `RULES.actions`;
   - `previewCombat()` covers every attack mode.
2. Implement, each with tests and a `docs/DECISIONS.md` entry:
   - **Volley:** a 2×2 area, about 55% of a focused shot per enemy, no friendly units or friendly melee in the area, a cohesion test per unit hit, counts as the unit's shot for Reload.
   - **Fortify:** 1 MP, lasts until the unit moves or the end of the enemy's next turn. Damage taken ×0.75, no push-back, a deeper anti-cavalry counter against frontal charges, no breakthrough possible against it, and the unit can't charge that turn. It replaces Hold on cards that have it.
   - **Full charge:** at least 2 squares of straight run-up, uses all MP, impact ×1.25, and a breakthrough chance using the §4.12 formula (capped at 75%; impossible against fortified or anti-cavalry defenders facing the charge).
     - On a breakthrough: the cavalry lands on the square behind the target, turned to face the target's rear, not engaged, and the target takes an extra cohesion test.
     - On a failure: a normal impact plus engagement, and one cohesion level lost if the cavalry hit spears or pikes head on.
   - **Testudo, Pila volley** (the existing OneShot), **Othismos, Parthian shot, Feigned retreat, Trample, Last stand**, as in the §4.12 table.
3. **Balance checks** (`balance-sim duel`, new cases):
   - fortified spears facing a heavy-cavalry Full charge win at least 80%;
   - a Full charge on Fragmented archers in the open breaks through at least 60% of the time;
   - a Volley on one isolated unit never beats a focused shot;
   - a Volley on 3 bunched units beats a focused shot.

   Re-run `balance-sim cost` and `progression`, and keep the §7.6 targets for Ages 0–2.

## Phase B — Assign actions to the existing cards (`add-unit` skill)
Use these as a starting point, adjusted to the ladder as built after prompt 06. Commons get no tactical actions.

| Age | Card | Actions |
|---|---|---|
| Antiquity | Hoplite phalanx | Fortify |
| Antiquity | Persian shield archers | Volley |
| Antiquity | Spartan hoplites | Fortify, Othismos |
| Antiquity | Macedonian phalanx | Fortify (front only, stronger against cavalry) |
| Antiquity | Theban Sacred Band | Last stand |
| Antiquity | Indian war elephants | Trample |
| Antiquity | **Companion cavalry (Legendary)** | Full charge with +15% breakthrough chance ("Wedge") |
| Classical Empires | Roman legionaries | Pila volley, Testudo |
| Classical Empires | Roman auxiliaries | Volley |
| Classical Empires | Carthaginian cavalry | Feigned retreat |
| Classical Empires | Hellenistic phalanx | Fortify |
| Classical Empires | Parthian horse archers | Parthian shot |
| Classical Empires | Cataphracts | Full charge |
| Classical Empires | Classical war elephants | Trample |
| Classical Empires | **Legio X (Legendary)** | Testudo, Pila volley, and "Unbreakable": can't rout while within the general's command radius |

Update the unit cards: each action gets an icon and a line, and locked actions show as greyed teasers on lower rarities.

## Phase C — UI and motion (`UX_PRESENTATION.md` §2–3)
1. **Command bubble:**
   - the 6 o'clock petal shows Hold, Fortify or Testudo, with its MP cost;
   - a Signature petal (7:30) holds non-attack actions, showing charges left or a cooldown.
2. **Attack mode tabs** in the preview:
   - **Shoot | Volley:** a draggable 2×2 frame showing each unit's expected loss and the total, with invalid squares hatched and red when it can't be fired;
   - **Engage | Full charge:** the breakthrough percentage, plus a ghost of the cavalry on its landing square, already turned. A reason is shown when a breakthrough is impossible.
   - The last mode chosen is remembered per unit.
3. **Animations, with GSAP and the motion tokens:**
   - the Volley's ink rain into the frame, with varied per-unit impacts and a total;
   - the Fortify or Testudo shield lock;
   - the Full charge passing through the defender and whipping round behind it, or recoiling on a failure.

   Respect Reduce motion. Run `motion-check` and `review-animations`.
4. **The AI uses the actions:**
   - it fortifies spears when enemy cavalry threatens their front;
   - it fires a Volley when 2 or more targets are bunched;
   - it makes a Full charge when the breakthrough chance is good and the landing square is safe.

   Add tests for each, and re-run `balance-sim aivsai`.
5. **Tutorial hint:** the first time the player owns a card with an action, a one-time hint in the guidance strip explains it. The hint can be skipped.

## Phase D — Age filters (`UX_PRESENTATION.md` §4)
On the Army screen (both the Troops and Generals tabs) and in the army builder:
- age chips **All · Dawn of War · Antiquity · …**, showing only unlocked ages, each with an owned count ("Antiquity 7/11");
- **default: the newest unlocked age** (the battle's own age in the army builder), remembered until the app is closed;
- role chips (Infantry, Ranged, Cavalry, Special);
- sorting by rarity, then level;
- Flip transitions when the filter changes.

Tests: the default chip is the newest unlocked age, the filter applies to both tabs, and All shows everything owned.

## Rules
- Each phase ends with:
  - `npm run typecheck && npm run lint && npm test` green;
  - `visual-check` (and `motion-check` for Phase C);
  - decisions logged;
  - `docs/PROGRESS.md` updated;
  - small commits pushed.
- At most 3 tactical actions per unit besides Move and Hold. If an action makes the bubble or preview hard to read, simplify it and log why.
- Before your final push, run `code-review` (medium) on your diff.

**Finish with:**
- a summary per phase;
- the new duel results;
- before and after campaign win rates for Ages 0–2;
- contact sheets for Volley, Fortify and breakthrough;
- screenshots of the attack-mode tabs and the filtered Army screen;
- anything you simplified.

# Agent prompt: unit-count break rule, two-step results, and Ages 3–4

Run this after `09-premium-ux-and-battle-depth.md`, in a **new** coding-agent session. If 09 is still in progress, finish it first. Parts 1 and 2 are small and can go in as soon as 09's current phase is pushed.

---

Pull the latest branch. Follow the **PROTOTYPE PHASE** rules in `CLAUDE.md`. For each part, ask: have I completed the requirement, and does the game run? If yes, push and move on. **No balance runs, tuning or win-rate tables in this prompt.**

## Part 1 — Break rule by unit count (GAME_DESIGN §4.8, rewritten)
- An army breaks when **its general falls**, or when **at most 1 troop** (2 for armies of 7 or more) is still fighting. The general's unit isn't counted as a troop. Routed units count as not fighting until they rally.
- Replace the cost-share breakpoint and the per-battle `enemyBreakpoint` / `playerBreakpoint` with an optional `breakAt`. Use it only where the history calls for it (for example Teutoburg 3, Thermopylae 0). Log each one.
- Stars count units: ★★ means at most 1 troop lost. Show strength lost separately, as damage, not as "losses".
- The HUD breakpoint meters read, for example, "3 troops fighting · breaks at 1", plus the general's state.
- One small test for the new rule. Don't re-tune battles. If existing balance tests fail because of the rule change, move them to `tests/balance/` (see `CLAUDE.md`).

## Part 2 — Two-step results screen (UX_PRESENTATION §4 "Results")
- **Step 1, the result:**
  - the VICTORY or DEFEAT seal, with the **reason in large type**;
  - stars listed one per line, each with its condition (earned ones stamp in; missed ones are greyed, with what happened);
  - both armies, each unit with a strength bar that animates down and a status of **Standing / Routed / Fled / Destroyed** (drop "held");
  - the turning point;
  - a Replay button for the battle diagram;
  - **Collect rewards ›**.
- **Step 2, the rewards:** a sheet slides up with the coin roll-up, the XP bars (and rank-up), the new cards (card recipe) and the unlocks. Then **Retry · Back to map ›**, and the map plays the unlock moment.
- Use GSAP and the motion tokens. Every step can be skipped with a tap; Reduce motion gives fades. Defeat gets a muted version with one tip.
- Validate with `visual-check` / `motion-check` at both sizes.

## Part 3 — Build Ages 3 and 4 from the history briefs
**Read:**
- `docs/history/age-03-early-middle-ages.md` and `docs/history/age-04-high-late-middle-ages.md`;
- `docs/history/README.md`;
- GAME_DESIGN §4.12, §5.1, §7.3 and §7.6.

**Skills:** `add-battle`, `add-unit`, `rules-change`, `level-design`.

**Brief fixes** (owner-approved rules; log them in `docs/DECISIONS.md`):
1. **The `player` army in every battle** is the old format. Use it only as a hint for `testArmy`.
2. **Trim the generals** to 2 generic generals plus 5–8 playable named ones (2–3 Rare, 2–3 Epic, 1–2 Legendary). Every other commander becomes **enemy-only** (`playable: false`).

   | Age | Rare | Epic | Legendary |
   |---|---|---|---|
   | Early Middle Ages | Harold Godwinson, Brian Boru, Godfrey of Bouillon | Charles Martel, Belisarius, William of Normandy | Khalid ibn al-Walid, **Charlemagne** |
   | High and Late Middle Ages | William Wallace, Alexander Nevsky, João I | Robert the Bruce, Baibars, Edward the Black Prince | Saladin, Richard I |

   **Charlemagne is missing from the brief, so add him** (owner request) with `add-unit`:
   - Legendary, Frankish, *lived 742–814*.
   - Trait: his armies could campaign year after year, so the whole army gets +morale and a better rally chance.
   - Skill: **Paladins' Rally**: units in his command radius gain one cohesion level, and a routed unit there rallies.
   - Sources: Einhard's *Vita Karoli Magni*; the *Royal Frankish Annals*; Rosamond McKitterick, *Charlemagne: The Formation of a European Identity* (2008).
   - **His card is the reward of the optional Roncevaux Pass battle.** Rework that battle so the player defends Charlemagne's rearguard in the pass against the Basque ambush:
     - challenge type `desperateDefence`;
     - objective: hold out, or get the baggage train off the far edge, within N turns;
     - the ★★★ condition is "lose no troop".

   Log in `docs/DECISIONS.md` that this flips the brief's player side for Roncevaux. The brief's history text stays as written, because the rearguard really was destroyed: the scenario asks whether you can do better.

   William of Normandy moves from Legendary to Epic, and Harald Hardrada becomes enemy-only, so the general limits still hold.

3. **Legendary troops** must be the age's icon, without duplicating a Rare card:
   - Early Middle Ages: the **Varangian Guard** moves from Epic to Legendary. Crusader knights move from Legendary to Epic, next to Seljuk heavy cavalry.
   - High and Late Middle Ages: replace "English longbow elite" (it duplicates Longbowmen) with the **Knights Templar** as the Legendary (`heavyCavalry`). Longbowmen stay Rare.
4. **The briefs suggest no tactical actions.** Assign them with `add-unit`; Commons get none.

   | Age | Card | Actions |
   |---|---|---|
   | Early Middle Ages | Frankish heavy infantry | Fortify (the shield wall at Tours) |
   | Early Middle Ages | Byzantine spearmen | Fortify |
   | Early Middle Ages | Norman knights | Full charge |
   | Early Middle Ages | Turkic horse archers | Feigned retreat |
   | Early Middle Ages | Crusader knights | Full charge |
   | Early Middle Ages | Seljuk heavy cavalry | Full charge |
   | Early Middle Ages | **Varangian Guard (Legendary)** | Last stand, and an axe-blow armour-piercing melee as its signature |
   | High and Late Middle Ages | Feudal knights | Full charge |
   | High and Late Middle Ages | Mamluk cavalry | Parthian shot |
   | High and Late Middle Ages | Scottish schiltron | Fortify |
   | High and Late Middle Ages | Longbowmen | Volley |
   | High and Late Middle Ages | Dismounted men-at-arms | Fortify, Last stand |
   | High and Late Middle Ages | Mongol horse archers | Parthian shot, Feigned retreat |
   | High and Late Middle Ages | **Knights Templar (Legendary)** | Full charge with +15% breakthrough chance, and Last stand |

5. **The briefs' open question:** optional-battle rewards are guaranteed on the first win (already decided in 06).

**Build:**
- every battle in both briefs (Age 3: 10 main and 6 optional; Age 4: 11 main and 6 optional);
- their age maps (Natural Earth regions per the age blocks);
- the ladders, power tiers, shop tabs and Legendary road;
- the history-driven new mechanics, at most one per battle through `rules-change`. Simplify and log anything too big; examples are crossbows in Age 4 and wagon forts.

Use the briefs' `difficulty` values and enemy levels as given. **No tuning in this round.** Each battle only has to load and be playable to a result. Update `docs/history/README.md` status to built.

## Finish with
- a summary per part;
- confirmation that every new battle loads and can be played to a result;
- screenshots of both results steps and both new age maps;
- anything simplified or deferred.

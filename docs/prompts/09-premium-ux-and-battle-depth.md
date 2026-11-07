# Agent prompt: premium UX, motion and battle depth

This prompt merges and replaces `07-premium-ux-and-motion.md` and `08-battle-depth-and-filters.md`, with a lighter test policy. Run it after `06-build-ages-0-2.md`, in a **new** coding-agent session.

---

**First, ask the owner for this wave's test plan,** proposing the debug-only default from `CLAUDE.md`. Use whatever they choose; with no answer, use the default.

Pull the latest branch. This update is mostly **visual and feel**. It covers:
- a command bubble instead of the bottom buttons;
- a battle screen where nothing overlaps the battlefield;
- everything animated with GSAP;
- premium menus and card reveals;
- numbered age-map paths;
- a Restart battle option;
- age filters;
- **tactical actions** (Volley, Fortify, Full charge and the signature actions), which add depth in battle.

Keep the minimal parchment, ink and wax style.

**Read first**
- `CLAUDE.md`, especially the **lean test policy** in Workflow and the animation and polish skills.
- **`docs/UX_PRESENTATION.md`**: the look-and-feel spec. §1 layout, §2 command bubble and attack modes, §3 battle motion, §4 menus and age filter, §5 age map, §6 battle menu, §7 extras.
- **`docs/GAME_DESIGN.md` §4.12**: the tactical actions, with their numbers. Also §9–10.
- Skills:
  - `motion`, `touch-controls`, `visual-check`, `motion-check`, `rules-change`, `add-unit`;
  - GSAP: `gsap-core`, `gsap-timeline`, `gsap-plugins`, `gsap-performance`;
  - craft: `emil-design-eng`, `animate`, `choreograph`, `apple-design`, `mobile-native`;
  - `game-feel`, `game-ui-ux`, `pixijs-rendering`.
- If `docs/PROGRESS.md` shows prompt 06 isn't finished, finish it first.

**Testing for this update: follow the PROTOTYPE PHASE rules in `CLAUDE.md`.** Requirement done and game runs, then push. In detail:
- `npm run typecheck && npm run lint && npm test` must stay green.
- New unit tests only for the new core rules (one focused test per tactical action, plus the `Restart` command) and for bugs you fix. **No new UI, layout or gesture test suites, and no balance-sim tuning** (balance is already tuned).
- Validate visually: run `visual-check` and `motion-check` after each phase at 1024×768, then do one pass at 812×375 at the end. Read the screenshots and contact sheets and fix what looks wrong.
- Debug with the dev server and browser console. Keep the app free of console errors.

## Phase A — Foundations
1. **Add GSAP**, pinned to an exact version (`npm view gsap version`). Register Flip, DrawSVGPlugin, SplitText and CustomEase.
2. **Create `src/ui/motion.ts`:**
   - the `MOTION` tokens from the `motion` skill (including `bubble`) and the eases;
   - Reduce motion through `gsap.matchMedia()` plus a setting;
   - Animation speed through `globalTimeline.timeScale`;
   - `sfx()` and `haptic()` stubs.
3. Replace the hand-rolled `tween()` in `render/battleView.ts` with GSAP on Pixi properties.
4. **Input never waits for animation:** a tap acts at once, or jumps the current timeline to its end.
5. **Layout manager** (UX §1): HUD elements register their rectangles, and the camera uses the remaining play area.

## Phase B — Battle screen and battle menu (UX §1, §6)
1. **Reserved HUD zones:**
   - top bar: menu, name, turn, objective chip, breakpoint meters;
   - guidance strip, for tutorial and hints, with ink leader lines to their targets;
   - bottom-left: general medallion;
   - bottom-right: End turn plus the "waiting" chip;
   - one toast stack.

   **Remove the bottom Undo, Next unit, Turn and ★ General buttons.** Fix the overlap in the owner's screenshot: the tutorial card covers units, and the hint toast covers a unit.
2. **Battle menu (☰):** Resume, **Restart battle** (with confirmation, no penalty, back to deployment with the same army and a new seed), Objectives, Settings, How to play, Retreat.
   - Add a `Restart` command in core; the UI never changes state itself.

## Phase C — Command bubble and controls (UX §2, `touch-controls`)
1. Move the controller's modes into a small state machine: idle, selected (bubble open), previewing move (ghost), facing, previewing attack, info open.
2. **Command bubble:**
   - **petals** at fixed clock positions: Info 12, Turn 3, Hold/Fortify/Testudo 6, Signature 7:30, Skill 9, Undo 10:30;
   - the petals rotate as a group to stay on screen and off the HUD.
3. **Interactions:**
   - **Moving is the default:** tap a reachable square for the ghost (numbered footprints, MP cost), then tap again or double-tap to confirm;
   - tap an enemy for the attack preview; tap another of your units to switch selection; tap unreachable ground to deselect;
   - **Turn mode:** 8 arrowheads, rotating live;
   - **Info card:** grows out of the unit with Flip.
4. Also: the "Moved · Undo" toast, a long press opening Info directly, End turn confirmation when units haven't acted, haptics, and desktop shortcuts.

## Phase D — Tactical actions (GAME_DESIGN §4.12)
1. **Rules**, with `rules-change`, numbers in `RULES.actions`, and `previewCombat()` covering every attack mode:
   - **Volley:** a 2×2 area, about 55% of a focused shot to each enemy, no friendly units in the area.
   - **Fortify:** 1 MP, damage taken ×0.75, no push-back, a deeper anti-cavalry counter against frontal charges, no breakthrough possible against it, and no charging that turn. It replaces Hold on cards that have it.
   - **Full charge:** at least 2 squares of straight run-up, uses all MP, impact ×1.25, and a breakthrough chance per the §4.12 formula (capped at 75%).
     - On success, the cavalry lands behind the target, turned to face its rear, and is not engaged.
     - On failure, it is engaged, and loses one cohesion level if it hit spears head on.
   - **Testudo, Pila volley, Othismos, Parthian shot, Feigned retreat, Trample, Last stand**, as in the §4.12 table.
2. **Assign actions to cards** with `add-unit`. Commons get none.

   | Age | Card | Actions |
   |---|---|---|
   | Antiquity | Hoplite phalanx | Fortify |
   | Antiquity | Persian shield archers | Volley |
   | Antiquity | Spartan hoplites | Fortify, Othismos |
   | Antiquity | Macedonian phalanx | Fortify |
   | Antiquity | Theban Sacred Band | Last stand |
   | Antiquity | Indian elephants | Trample |
   | Antiquity | **Companion cavalry (Legendary)** | Full charge with +15% breakthrough chance |
   | Classical Empires | Roman legionaries | Pila volley, Testudo |
   | Classical Empires | Roman auxiliaries | Volley |
   | Classical Empires | Carthaginian cavalry | Feigned retreat |
   | Classical Empires | Hellenistic phalanx | Fortify |
   | Classical Empires | Parthian horse archers | Parthian shot |
   | Classical Empires | Cataphracts | Full charge |
   | Classical Empires | Classical elephants | Trample |
   | Classical Empires | **Legio X (Legendary)** | Testudo, Pila volley, Unbreakable while within the general's command radius |

   Each action gets an icon and a line on the unit card. Lower rarities show the action greyed out as a teaser.
3. **UI:**
   - the 6 o'clock petal shows Hold, Fortify or Testudo with its MP cost; the Signature petal shows charges left or a cooldown;
   - **attack-mode tabs** in the preview:
     - **Shoot | Volley:** a draggable 2×2 frame with the losses for each unit hit and the total;
     - **Engage | Full charge:** the breakthrough %, a ghost of the landing square already turned, and the reason when a breakthrough is impossible;
   - a one-time hint the first time the player owns a card with an action.
4. **The AI uses the actions:**
   - it fortifies spears when your cavalry threatens their front;
   - it fires a Volley at 2 or more bunched units;
   - it makes a Full charge when the chance is good and the landing square is safe.

## Phase E — Battle motion (UX §3)
Use GSAP and the motion tokens for:
- the **bubble bloom: about 0.5 s total, but tappable within about 120 ms**; it closes in about 0.25 s;
- bubble to ghost;
- the move along the path;
- turn mode;
- the Info Flip;
- the attack bracket drawn in ink;
- the charge, with a 60 ms hit-stop;
- **Volley:** ink rain into the frame;
- **Fortify:** a shield lock;
- the **Full charge breakthrough:** passing through and whipping round behind;
- the rout;
- the turn banner.

Reduce motion turns all of these into short fades. Run `review-animations` once on the result and fix what it flags.

## Phase F — Premium menus, ceremonies and filters (UX §4, `motion` recipes)
1. **Materials:** paper grain, two-layer shadows, brass buttons with press feedback, number tickers, ink dividers.
2. **Transitions:** a screen crossfade plus slide; **timeline medallion → age map** as a shared-element zoom; **age-map seal → briefing** as a flip. The army builder gets a slot snap, Flip when closing gaps, and an eased power meter.
3. **Age filter** on the Army screen (Troops and Generals) and in the army builder:
   - **All · Dawn of War · Antiquity · …**, showing only unlocked ages, each with an owned count;
   - **default: the newest unlocked age** (the battle's own age in the army builder), remembered until the app is closed;
   - role chips; sorting by rarity, then level; Flip when the filter changes.
4. **Motion lab:** a dev page, `?debug=motion-lab`, that plays:
   - the battle intro;
   - pack openings (each rarity forced);
   - a hero-card reveal;
   - victory and defeat;
   - the campaign unlock moments.

   **Stop and send the owner the contact sheets and the GitHub Pages link, then wait for approval** before wiring them into the real flow. After approval, integrate them, along with the card-detail tilt and the foil on Epic and Legendary cards.

## Phase G — Age map and extras (UX §5, §7)
1. **Age map:**
   - numbered wax seals for main battles;
   - an ink route with arrowheads (solid when travelled, moving dashes for the next segment, dotted when locked);
   - a "Next" pennant, with the camera easing to it;
   - optional battles as small diamond "Side" seals;
   - locks showing the stars needed;
   - a segmented progress rail;
   - a legend.
2. **Extras:** threat view toggle, replay of the last enemy turn, a damage-forecast pip on the move ghost, "Did you know?" on the intro and loading screens, and a colour-blind palette. Put the rest of UX §7 in `docs/PROGRESS.md` under "Backlog".

## Rules
- Animate only transform and opacity (HTML) or position, rotation, scale and alpha (Pixi). Everything can be interrupted and skipped; nothing blocks input; animations never change game state.
- At most 3 tactical actions per unit besides Move and Hold.
- Log decisions in `docs/DECISIONS.md` and update `docs/PROGRESS.md`. Make small commits and push after each phase.
- Run `code-review` (medium) once before the final push.

**Finish with:**
- a short summary per phase;
- before and after battle screenshots at both sizes;
- contact sheets for the bubble, move, charge, Volley, Fortify and breakthrough;
- screenshots of the attack-mode tabs, the filtered Army screen and an age map;
- the controls list for How to play;
- anything deferred.

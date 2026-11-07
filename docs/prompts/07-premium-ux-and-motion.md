# Agent prompt: premium UX, command bubble and motion

Use this **after `06-build-ages-0-2.md` is finished**. It **replaces `03-controls-and-motion.md`**: everything from 03 is folded in here, so don't run 03. Copy everything below the line into a **new** coding-agent session, so it loads the new skills.

---

Pull the latest branch. The next goal is to make BattleQuest **look and feel premium**: a command bubble instead of bottom buttons, a battle screen where nothing overlaps the battlefield, everything animated with GSAP, premium menus and card reveals, clear numbered paths on the age maps, and a Restart battle option — all while keeping the minimal parchment, ink and wax style.

**Read first**
- `CLAUDE.md`, including the new "Animation and polish skills" section.
- **`docs/UX_PRESENTATION.md`, the spec for this whole prompt.** §1 layout, §2 command bubble, §3 battle motion, §4 menus, §5 age map, §6 battle menu, §7 more ideas, §8 quality bar.
- `docs/GAME_DESIGN.md` §9–10.
- Project skills: `motion`, `touch-controls`, `motion-check`, `visual-check`.
- Third-party skills:
  - `gsap-core`, `gsap-timeline`, `gsap-plugins`, `gsap-performance`, `gsap-utils`;
  - `emil-design-eng`, `animate`, `choreograph`, `apple-design`, `mobile-native`, `animation-performance`, `review-animations`;
  - `game-ui-ux`, `game-feel`, `camera-systems`, `pixijs-rendering`.
- Check `docs/PROGRESS.md`. If prompt 06 isn't complete, finish it first.

## Phase A — Foundations
1. **Add GSAP** as a dependency, pinned to an exact version (check it with `npm view gsap version`). Register Flip, DrawSVGPlugin, SplitText and CustomEase.
2. **Create `src/ui/motion.ts`:**
   - the `MOTION` tokens from the `motion` skill, including `bubble`;
   - eases built with CustomEase;
   - `gsap.matchMedia()` for reduced motion, plus the in-game setting;
   - Animation speed through `globalTimeline.timeScale`;
   - an `sfx()` no-op stub and a `haptic()` helper.
3. **Replace the hand-rolled `tween()`** in `render/battleView.ts` with GSAP tweens on Pixi properties. Keep the Pixi ticker for rendering.
4. **Input never waits for animation:** a tap acts at once, or jumps the current timeline to its end (`progress(1)`).
5. **Layout manager** (UX §1): HUD elements register their rectangles, and the camera's insets and fit-to-screen use the remaining play area.
6. **Build `scripts/motion-check.mjs`** and its debug URL entry points, from the `motion-check` skill.

## Phase B — Battle screen layout and battle menu (UX §1 and §6)
1. Rebuild the battle HUD into the reserved zones:
   - top bar: menu, name, turn, objective chip, breakpoint meters;
   - guidance strip, with coach marks and ink leader lines;
   - bottom-left general medallion;
   - bottom-right End turn with the "waiting" chip;
   - one toast stack.

   **Remove the bottom Undo, Next unit, Turn and ★ General buttons.**
2. **Tutorial steps move into the guidance strip** and point at their target with a leader line, never covering it. Fix the current overlap shown in the owner's screenshot: the tutorial card covers the units, and the hint toast covers a unit.
3. **Layout tests:**
   - no HUD rectangle overlaps another;
   - at default zoom, no unit is under the HUD;
   - at 1024×768 and 812×375, the coach mark never covers its target.
4. **Battle menu (☰):** Resume, **Restart battle** (confirmation, no penalty, back to deployment with the same army and a new seed), Objectives, Settings, How to play, Retreat.
   - Add a `Restart` command in core with a test. The UI never changes state itself.

## Phase C — Command bubble and controls (UX §2, `touch-controls` skill)
1. A **controls state machine** (pure and unit-tested): idle → selected (bubble open) → previewing-move (ghost) → facing → previewing-attack, plus info-open. Test every transition and cancel path.
2. **Command bubble:**
   - petals at fixed clock positions;
   - the group rotates to stay on screen and avoid the HUD;
   - **moving is the default**: tap a reachable square for the ghost with numbered footprints and MP cost, then tap again or double-tap to confirm;
   - tap an enemy for the attack preview;
   - tap another of your units to switch selection; tap unreachable ground to deselect.
3. **Turn mode** (arrowheads, live rotation) and the **Info card**, which grows out of the unit with Flip and shrinks back into it.
4. Also: the "Moved · Undo" toast, a long press opening Info directly, the optional expert drag-to-move setting, End turn confirmation when units haven't acted, haptics, and desktop shortcuts.
5. **Playwright gesture tests** at both screen sizes, including taps during animations: they must never be lost or doubled. Also a latency check: from pointerdown to the first highlight must take under 16 ms.

## Phase D — Battle motion (UX §3)
Implement every row of the UX §3 table with GSAP:
- the bubble bloom (**about 0.5 s total, as the owner asked, but usable within about 120 ms**) and its close;
- bubble to ghost;
- the confirm move along the path;
- turn mode;
- the Info Flip;
- the attack-preview ink bracket (DrawSVG);
- the charge with hit-stop;
- the rout;
- the turn banner.

Reduce motion turns all of these into short fades. Run `review-animations` and fix what it finds.

## Phase E — Premium menus and ceremonies (UX §4, `motion` skill recipes)
1. **Materials:**
   - a paper-grain texture, two-layer shadows and deckled edges on large sheets;
   - brass primary buttons with press feedback;
   - number tickers;
   - ink dividers drawn with DrawSVG.
2. **Transitions:**
   - the standard screen crossfade and slide;
   - **timeline medallion → age map**, as a shared-element zoom;
   - **age-map seal → briefing card**, as a flip.
3. **Army builder:** a magnetic slot snap, Flip when closing gaps, and an eased power meter.
4. **Motion lab first:** a dev-only `?debug=motion-lab` page that plays:
   - the battle intro;
   - pack openings (Common, Rare, Epic and Legendary forced);
   - a hero (general) card reveal;
   - victory and defeat;
   - the campaign moments (timeline open, entering an age, a battle unlocking, an age unlocking).

   Run `motion-check`, then **stop and send the owner the contact sheets and the GitHub Pages link. Wait for approval** before wiring the ceremonies into the real flow.
5. After approval, integrate them: the battle intro, pack and hero reveals, victory and defeat into results, campaign unlock moments, and the card-detail tilt with foil on Epic and Legendary cards.

## Phase F — Age map paths (UX §5)
- numbered wax seals for main battles;
- an ink route with arrowheads (solid when travelled, animated dashes for the next segment, dotted when locked);
- a "Next" pennant, with the camera easing to it;
- optional battles as smaller diamond "Side" seals on dotted branches;
- lock feedback with the stars needed;
- a segmented progress rail;
- a collapsible legend.

## Phase G — Extras in scope now (UX §7)
1. **Threat view** toggle.
2. **Replay last enemy turn** from the turn banner.
3. **Damage-forecast pip** on the move ghost.
4. **"Did you know?"** on the loading and intro screens, taken from the history briefs.
5. **Colour-blind palette** setting (blue and orange).

Put the other §7 ideas in `docs/PROGRESS.md` under "Backlog".

## Rules
- Animate only transform and opacity (HTML) or position, rotation, scale and alpha (Pixi). Every animation can be interrupted and skipped, and none blocks input.
- Animations never change game state: core state is final before an animation starts.
- Each phase ends with:
  - `npm run typecheck && npm run lint && npm test` green;
  - `visual-check` and `motion-check` at 1024×768 and 812×375, including reduced motion;
  - worst-frame fps of at least 45 with 4× CPU throttling;
  - `review-animations` clean;
  - decisions logged in `docs/DECISIONS.md`;
  - `docs/PROGRESS.md` updated;
  - small commits pushed.
- Don't edit the third-party skills. Before your final push, run `code-review` (medium) on your diff.

**Finish with:**
- a short summary per phase;
- before and after screenshots of the battle screen at both sizes;
- contact sheets for the bubble, the move and a charge;
- fps numbers per sequence;
- the controls list for the How to play page;
- anything deferred.

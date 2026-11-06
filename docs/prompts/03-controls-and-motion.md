# Agent prompt: elite controls and animations

Use this **after** the Review 1 fixes (`docs/prompts/02-review-1-fixes.md`) **and** the campaign timeline (`docs/prompts/04-campaign-timeline.md`) are done and pushed. Copy everything below the line into the agent session.

---

The Review 1 fixes and the campaign timeline are done. The next goal is to make BattleQuest **feel premium**: expert-grade touch controls and ceremonial animations (battle intro, pack and hero-card reveals, victory), while keeping the minimal historical-battle-map style.

**Read first:**
- `CLAUDE.md`
- `docs/GAME_DESIGN.md` §9 (touch controls) and §10 (visual style)
- the project skills **`motion`** (timing tokens, style vocabulary, and recipes for every sequence below), **`touch-controls`** (gesture set, controls architecture, tests) and **`motion-check`** (recording and checking animations)

Follow them; don't improvise their rules. If the `frontend-design` plugin skills are available (`frontend-design`, `audit-suite`'s `web-animation-design` / `make-interfaces-feel-better`), use them as extra guidance for the HTML screens. The project skills win if they disagree.

**Before you start**, confirm that Review 1's work packages are complete in `docs/PROGRESS.md`. If something is unfinished, list it and finish it first.

## Phase A — Foundations
1. Create `src/ui/motion.ts`:
   - the `MOTION` tokens and easings;
   - a Web Animations API helper for HTML;
   - a reduced-motion check (OS setting plus an in-game setting);
   - an `sfx()` no-op stub and a `haptic()` helper.
2. Grow the board's `tween()` in `render/battleView.ts` into a small timeline helper: sequence, parallel, stagger, `fastForward()`, and object pooling for particles and numbers.
3. Change input so that **no animation blocks a tap**: a tap either acts or fast-forwards the current animation.
4. Add a Settings panel (in the menu and the in-battle ☰): Reduce motion, Quick confirm, Haptics, Animation speed (1×, 2×).
5. Build `scripts/motion-check.mjs` and the debug URL entry points from the `motion-check` skill.

## Phase B — Elite controls (`touch-controls` skill)
1. Extract the controller's modes into a pure state machine that can be unit-tested, with full transition tests.
2. Add these controls:
   - drag to move, with a live path ghost and snapping;
   - drag to face;
   - drag onto an enemy, which shows the attack preview;
   - double-tap to centre on a unit;
   - a long-press progress ring;
   - swipe on the action bar to cycle units;
   - camera inertia and rubber-band edges;
   - two-finger double-tap to fit the map;
   - End turn confirmation when units haven't acted (hold to skip it);
   - haptics;
   - desktop keyboard shortcuts.
3. Tap-tap must keep working exactly as before. Both paths send the same commands.
4. Add Playwright gesture tests at both screen sizes, including taps during animations and a latency check (pointerdown to first highlight under 16 ms).

## Phase C — Ceremonies (`motion` skill recipes)
1. **Build a motion lab first:** a dev-only `?debug=motion-lab` page with buttons that play each sequence:
   - the battle intro;
   - a pack opening (Common, Rare, Epic and Legendary forced);
   - a hero (general) card reveal;
   - victory;
   - defeat;
   - the campaign moments: opening the timeline, entering an age, a battle unlocking, an age unlocking.

   Run `motion-check`, then **stop and send me the contact sheets plus the GitHub Pages link** so I can try it on my tablet. Wait for my approval or changes before you wire the sequences into the real flow.
2. After approval, integrate them:
   - the intro plays when a battle loads;
   - the pack and hero reveals replace the current shop and reward reveal;
   - victory and defeat lead into the results screen (stars, coin roll-up, XP bar, rank-up, cards earned);
   - the timeline and age-map transitions, plus battle and age unlocks, play when you return to the campaign;
   - meaning badges ("NEW", "Upgrade ready") link to the Army screen.

## Phase D — In-battle effects
Move along the path, the charge wind-up and impact, the shooting arc, the cohesion ring, rout hollowing, the general-skill ripple, the turn banner, and screen transitions. All of these come from the `motion` skill recipes. They must respect Animation speed and Reduce motion, and the AI's turn speed control (1×, 2×, skip) must still work.

## Rules
- Animations never change game state. Core state is final before an animation starts.
- Animate only transform and opacity (CSS) or position, rotation, scale and alpha (Pixi). Don't add animation libraries unless a logged decision justifies one.
- Each phase ends with:
  - `npm run typecheck && npm run lint && npm test` green;
  - `visual-check` and `motion-check` passing at 1024×768 and 812×375, including reduced motion;
  - worst-frame fps of at least 45 with 4× CPU throttling;
  - decisions logged in `docs/DECISIONS.md`;
  - `docs/PROGRESS.md` updated;
  - small commits pushed.
- Before your final push, run `code-review` (medium) on your diff and fix what it finds.

**Finish with:** a short summary per phase, fps numbers per sequence, the contact sheets for each ceremony, a list of the new gestures (for a "Controls" help page), and anything you deferred.

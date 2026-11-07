# CLAUDE.md

BattleQuest is a turn-based tactical battle simulator for tablets and phones. You play a time traveler who re-fights historical battles with any mix of armies and generals across 10 ages.

## ⚠ PROTOTYPE PHASE: speed over verification (owner's standing order)

We are still adding units, tactical actions, generals and battles. **Any balance tuned now will be broken by the next round.** Until the owner announces the balance and optimization phase:

**Definition of done. Ask only two questions:**

1. **Have I completed the requirement?** (Read the prompt or task again and tick each item.)
2. **Does the game run?**
   - `npm run typecheck` and `npm run build` pass;
   - the dev server loads with no console errors;
   - you clicked through the changed feature once, and took 1–2 screenshots at tablet size.

**If both answers are yes: commit and push. Stop testing.**

**Don't, during this phase:**

- **No balance work:** no `balance-sim`, no win-rate tables, no tuning enemy armies, costs or rule numbers to hit targets.
- **Don't fix balance tests.** If `npm test` fails on an assertion about win rates, pacing, progression medians, difficulty bands or army sizes, that is a balance test, not a bug. **Move it into `tests/balance/`**, which `npm test` excludes; it runs only with `npm run test:balance`. Don't tune anything to make it pass.
- **No new test suites.** At most one small unit test for a new core rule, and one regression test for a bug you fix.
- **No repeated fps, motion or gesture runs.** One `visual-check` screenshot pass per task (one `motion-check` contact sheet if it's animation work) is enough.
- **No debugging loops longer than 10 minutes.** If something that isn't the requirement (a flaky or unrelated test, a tooling issue) costs more than 10 minutes, write it in `docs/PROGRESS.md` under "Known issues" and move on.

**Time budget:** at least 80% of a task is building the requirement; at most 20% is checking.

## Key documents

- `docs/GAME_DESIGN.md`: the source of truth for rules, content and UX. Read the relevant section before changing gameplay.
- `docs/DECISIONS.md`: log of design and implementation decisions that refine or deviate from the design doc. Add an entry whenever you make one.
- `docs/PROGRESS.md`: milestone checklist.
- `docs/UX_PRESENTATION.md`: battle screen layout, the command bubble, motion, menus, age-map paths, battle menu. The source of truth for look and feel.
- `docs/history/`: researched briefs per age (battles, generals, troops). Use them as the source for any historical content.

## Architecture rules

- `src/core` is pure, deterministic TypeScript: no DOM, no Pixi, no `Math.random` (use the seeded RNG), no timers.
- State changes only happen through commands → validation → events. The renderer and UI never change game state directly.
- Content (units, generals, terrain, battles, ages) is typed data in `src/content`. Rule constants live in one config object, not scattered through the code.
- Combat previews reuse the real combat functions.

## UX rules

- Touch first: minimum 44 pt targets, no hover-only information, two-tap confirm for moves, Pointer Events.
- Visual style: a flat "historical battle map" look (parchment, red and blue blocks, NATO-style symbols, translucent arrows). Keep it minimal and readable.

## Project skills (`.claude/skills/`)

- `rules-change`: any change to how battles resolve (src/core).
- `add-unit`: new or edited units and generals.
- `add-battle`: new or reworked battle scenarios.
- `balance-sim`: measure balance with headless battles before and after tuning any number.
- `visual-check`: screenshot at tablet and phone sizes and check the style and touch rules after any UI or render change.
- `motion`: timing tokens, style and recipes for every animation (intro, card reveals, victory, in-battle effects).
- `touch-controls`: the gesture set, controls architecture and gesture tests.
- `motion-check`: record animations (frame strips, fps, skip, reduced motion) after any motion or controls change.

## Game-dev skills (third-party, `.claude/skills/_third-party/`)

Copied from awesome-gamedev-agent-skills. They give general game-dev guidance; when they disagree with the project skills above or with `docs/GAME_DESIGN.md`, the project wins.

- `pixijs-rendering`: any Pixi v8 board or render code.
- `game-feel`: juice for hits, charges, routs and rewards (together with `motion`).
- `game-ui-ux`: screens, HUD, menus, the screen stack, safe areas.
- `input-systems`, `camera-systems`: input architecture and camera feel (together with `touch-controls`).
- `game-ai`, `ai-behavior-trees-utility-ai`: the enemy AI.
- `level-design`: battle maps, campaign pacing and star gates.
- `save-systems`: profile versioning and migration.
- `performance-optimization`: frame budget, pooling, profiling.

## Animation and polish skills (third-party)

- GSAP (`_third-party/gsap-skills`): `gsap-core`, `gsap-timeline`, `gsap-plugins` (Flip, DrawSVG, SplitText…), `gsap-performance`, `gsap-utils`. GSAP is the animation engine for HTML and the Pixi board.
- Emil Kowalski design engineering (`_third-party/emil-kowalski-skills`): `emil-design-eng` (polish), `animate`, `choreograph`, `review-animations` (run before committing motion), `animation-performance`, `apple-design` (gestures, springs), `mobile-native`, `animation-vocabulary`, `find-animation-opportunities`.
- The project's `motion` skill and `docs/UX_PRESENTATION.md` win over these when they disagree.

## Workflow

- Follow the **PROTOTYPE PHASE** rules above. They override any skill, prompt or document that asks for more testing or tuning.
- Before pushing: `npm run typecheck && npm run build && npm test`. `npm test` must not include balance tests (see above).
- Small, descriptive commits. Push after every completed requirement.

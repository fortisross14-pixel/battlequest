---
name: motion
description: BattleQuest's motion system (timing tokens, easing, the ink-on-parchment style, performance and skip rules) plus recipes for battle loading, card and hero reveals, victory and defeat, and in-battle effects. Use before adding or changing any animation, transition or visual effect, in src/render (Pixi) or src/ui (HTML/CSS).
---

# Motion

> **Prototype phase:** follow the PROTOTYPE PHASE rules in `CLAUDE.md`. Skip every balance, tuning and win-rate step below, and keep checks to: the requirement is done, and the game runs.

The game looks like a living historical battle map, and animation should feel like **ink, paper, wax and brass**: quick, confident, a little ceremonial. Keep it minimal. Effects are flat shapes, lines and dots; no 3D models, glossy gradients or particle storms.

## Rules (all of them, every time)

1. **Use tokens, not magic numbers.** All durations and easings live in one `MOTION` config (`src/ui/motion.ts`; the renderer imports the same values).

   | Token      | ms         | Use                                                               |
   | ---------- | ---------- | ----------------------------------------------------------------- |
   | `instant`  | 80         | Press feedback, highlight on                                      |
   | `quick`    | 160        | Selection, small state changes                                    |
   | `move`     | 240        | One unit sliding one square (scale with path length, at most 600) |
   | `impact`   | 320        | Charge contact, squash and shake                                  |
   | `reveal`   | 450        | Card flip, panel in, unit info card (Flip)                        |
   | `bubble`   | 500        | Command bubble bloom (usable within ~120 ms; close 250)           |
   | `ceremony` | up to 2400 | Battle intro, victory sequence (total)                            |

   | Easing                         | Use                                          |
   | ------------------------------ | -------------------------------------------- |
   | `out` cubic-bezier(.2,.8,.2,1) | Things arriving                              |
   | `in` cubic-bezier(.6,0,.8,.2)  | Things leaving                               |
   | `inOut`                        | Things moving across                         |
   | `back` (small overshoot)       | Stamps, seals, stars                         |
   | `spring`                       | Card settle, only via a damped spring helper |

2. **Input never waits for decoration.**
   - Any tap during an animation either acts at once or fast-forwards the animation to its end state. Never queue up taps.
   - Every ceremony (intro, pack opening, victory) can be skipped with a tap. A **Skip** button appears after 600 ms.
   - Core state is already final when an animation starts; animations only _show_ events.
3. **Respect `prefers-reduced-motion`,** plus an in-game "Reduce motion" setting. Both replace movement with short fades (at most 160 ms) and turn off shake, flashes and parallax. Test both modes.
4. **Performance budget:** 60 fps on a mid-range tablet.
   - Animate only `transform` and `opacity` in CSS; on the Pixi side, only position, rotation, scale and alpha.
   - Never animate layout properties (width, top, box-shadow blur).
   - Pool Pixi objects for particles and floating numbers. Have at most about 40 particles alive at once.
5. **One engine: GSAP** (free, all plugins included; pin an exact version in `package.json`).
   - **HTML screens:** GSAP tweens and timelines. Use Flip for shared-element transitions, DrawSVG for ink lines, SplitText only on ceremonial titles, and CustomEase for the tokens' curves.
   - **Board (Pixi):** GSAP tweens Pixi display-object properties directly (x, y, rotation, alpha, scale). Replace the hand-rolled `tween()` in `render/battleView.ts`. Keep the Pixi ticker for rendering. `fastForward()` = `timeline.progress(1)`.
   - Reduced motion through `gsap.matchMedia()` plus the in-game setting. Animation speed through `gsap.globalTimeline.timeScale()`.
   - Read the third-party skills `gsap-core`, `gsap-timeline`, `gsap-plugins` and `gsap-performance` for the API, and `emil-design-eng`, `animate` and `choreograph` for the craft. Run `review-animations` before committing motion work.
6. **Style vocabulary:**
   - parchment, ink strokes drawn on (dash-offset), wax seals, stamps, laurels, brass or gold foil glints;
   - blue and red side colors, with rarity colors only on cards (Common grey, Rare blue, Epic purple, Legendary gold);
   - particles are small ink specks or paper flecks;
   - light is a single soft glint sweep, never bloom.
7. **Hooks for sound.** Every recipe below emits a named cue (`sfx('seal-break')`) through a no-op `sfx()` stub, so audio can be added later without touching animation code.

## Recipes

### Battle loading / intro (about 2.2 s total, skippable; also covers real loading)

1. The parchment fades in. The **title card** (place, year, age, in serif) writes on letter by letter, or with a clip reveal, over 400 ms.
2. Terrain **inks in**: rivers and roads draw along their path (stroke dash), forests and hills fade and scale in from 0.96 with a 30 ms stagger.
3. The grid sketches in at low alpha.
4. Units **stamp down** side by side: each block drops from scale 1.15 to 1 with the `back` easing, 40 ms stagger, plus a tiny ink-spatter ring. Generals' pennants unfurl last.
5. The objective chip slides in from the top. The camera eases to the starting view.

If the game is still loading assets, hold on step 1 with an animated quill line. Never show a blank screen.

### Pack opening and hero (general) cards

1. **Pack:** a sealed paper envelope with a wax seal sits centre screen and breathes (scale 1 ↔ 1.02). Tap to break the seal: it cracks into 3–4 flat shards and the flap opens.
2. **Fan out:** the cards slide out face down and fan into a row, with a 70 ms stagger and the `out` easing.
3. **Anticipation:** before the flip, Rare and better cards show their rarity: an edge glint in the rarity color, and Epic and Legendary cards tremble slightly (±1.5°, 2 cycles).
4. **Flip:** tap a card, or tap "Reveal all".
   - 3D `rotateY` 0 → 180° with `perspective: 800px` and `backface-visibility: hidden` on both faces, 450 ms.
   - Scale 1 → 1.08 → 1 during the flip.
   - On the reveal, a short stamp ring and, for Legendary, a single gold-foil glint sweep across the card.
5. **Hero cards** (generals) are larger: the portrait medallion presses in like a seal, and the name writes on beneath it.
6. **Meaning badges** after the reveal: "NEW" ribbon for an unlock, or "+1 card · 2/2 Upgrade ready" with a small pulse that links to the upgrade.
7. **Skip** reveals everything instantly.

### Victory (about 2.4 s, then the results screen)

1. The last enemy routs: a 250 ms slow-motion beat (0.4× speed), then the board desaturates slightly.
2. The **battle diagram**: the turns just played redraw as translucent blue and red arrows, sped up, like the historical maps the game is styled on. This is the signature moment.
3. The **"VICTORY" seal** stamps on with the `back` easing and a small paper shake, plus a laurel wreath drawing around it.
4. The results build in sequence:
   - stars fill one by one with a stamp each;
   - the coin counter rolls up;
   - the general's XP bar fills, with a rank-up flourish if earned;
   - cards earned flip in, using the card recipe.

### Campaign: timeline and age maps

- **Opening the timeline:** the ink line draws left to right to the newest unlocked age (600 ms); age nodes fade and scale in along it with a 60 ms stagger; the view eases to the current age.
- **Entering an age:** the tapped node grows into the age map (shared-element zoom, `reveal`); the map's coastlines ink in; battle nodes stamp down in historical order; the dotted route draws between the open ones.
- **Battle unlocked** (after a result pushes the star total past a threshold): back on the age map, the star counter rolls up, the next node's lock shakes, then cracks and falls, and the dotted route draws on to it. If several unlock, play them one after another, at most 1.5 s in total.
- **Age unlocked** (every battle won): a short banner ("Antiquity complete"), then the timeline: the next age's wax seal cracks into shards, the ink line extends to it, and its node lights up with a single glint.
- **Stars earned on a node:** each new star stamps in with the `back` easing; a tap anywhere skips to the end state.

### Defeat

Muted and fast (under 1.2 s): ink bleeds in from the edges, then a "DEFEAT" stamp in dark red at reduced opacity, then one helpful tip and the Retry button. Never punishing.

### In battle

- **Move:** slide along the path's squares (not a straight line), easing per segment; facing rotates at the end with `quick`.
- **Charge:** wind-up (pull back 4% for 80 ms), a fast dash with a fading ink trail arrow, an impact squash (scale 1.06 × 0.94) and shake on both blocks, ink specks, then the floating loss numbers.
- **Shoot:** a faint dashed arc from shooter to target, a small dot burst, then the numbers.
- **Cohesion drop:** a ring pulse in the new cohesion color, and the hatch pattern fades in.
- **Rout:** the block hollows out (fill fades to outline) and slides off with a slight wobble.
- **General skill:** a ring ripples across the command radius in the side color, and affected units glint once.
- **Turn change:** a thin banner sweeps across ("Turn 4 · Your move"), at most 700 ms. During the enemy turn, the camera eases to each acting unit only if it is off screen.
- **Screen transitions:** a 200 ms crossfade plus an 8 px slide in the direction of navigation, the same everywhere.

## Checks

Run the `motion-check` skill after any animation work.

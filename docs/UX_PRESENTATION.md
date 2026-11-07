# BattleQuest: UX and presentation spec

This is the source of truth for **how the game looks, feels and moves**. The rules live in `GAME_DESIGN.md`. This document says how the player touches them. It extends `GAME_DESIGN.md` §9–10 and replaces their older button-based controls.

**Goal: premium but minimal.** It should feel like a beautifully made historical atlas that comes alive: parchment, ink, wax and brass, with every interaction answered by short, physical, confident motion. Effects are flat shapes, lines and dots — no glossy gradients, particle storms or 3D models.

**Engine:** GSAP (free, including every plugin) drives all motion, for the HTML screens and the Pixi board alike. Craft rules come from the `motion` skill plus the third-party `emil-design-eng`, `animate`, `choreograph` and `apple-design` skills.

---

## 1. Battle screen layout (fixes overlapping HUD)

**Problem today:**
- the tutorial card covers the top of the battlefield and units;
- the hint toast covers a unit at the bottom;
- the map runs under the HUD.

**Rule: the HUD lives in reserved zones, and the battlefield lives in the space left over.** Nothing ever floats over the map at its default zoom, except things attached to a unit, such as the command bubble.

```
┌───────────────────────────────────────────────────────────────┐
│ ☰  Megiddo · Turn 2/10      [Objective chip]    You 12% │ Enemy 30%  │  ← top bar (52 px)
├───────────────────────────────────────────────────────────────┤
│ ┌ coach mark (tutorial / hints), docks here, 1–2 lines ┐       │  ← guidance strip (0 or 56 px, collapses)
│                                                               │
│                    PLAY AREA (map + units)                    │
│        camera bounds = this rect; the map fits inside it      │
│                                                               │
│  (General medallion)                       (2 waiting) [End turn] │  ← bottom corners only
└───────────────────────────────────────────────────────────────┘
```

**Top bar.** It holds:
- the menu ☰;
- the battle name and turn;
- the **objective chip** (tap it to expand the objective, hold-out turns left and the bonus-star condition with its live status);
- the two army breakpoint meters, which fill toward their break point.

**Guidance strip.** Tutorial steps and hints dock here, not on top of the map. The strip:
- is one compact line plus an optional "more";
- draws a thin **ink leader line** to the target unit or square, so the strip never needs to sit on top of it;
- slides up and away when there's nothing to say, and the play area grows back with a Flip animation.

**Bottom corners only.**
- Bottom-left: the **general medallion** (portrait seal, rank pips, skill cooldown ring; tap it to use the skill).
- Bottom-right: **End turn**, with a small "2 waiting" chip next to it that cycles through units that haven't acted.
- Nothing sits in the bottom centre.

**Toasts** ("Moved · Undo", combat results) appear in one stack just above End turn, never over the centre.

**Layout manager.**
- Every HUD element registers its rectangle. The camera's insets and its fit-to-screen use the remaining play area.
- The coach mark and the command bubble choose positions that avoid the HUD rectangles and the target's screen rectangle.
- A test asserts:
  - no HUD rectangle overlaps another;
  - at default zoom, no unit is under a HUD rectangle;
  - at 1024×768 and 812×375, the coach mark never covers its own target.

**Phone (812×375).**
- The top bar shrinks to 44 px, and the objective becomes an icon.
- The guidance strip becomes a single line that expands on tap.
- Corner controls are 52 px circles.
- Safe areas (the notch) are respected (`mobile-native` skill).

## 2. Command bubble (replaces the bottom action buttons)

**Tap your unit:** it's selected, and a **command bubble** blooms around it:
- the centre disc sits on the unit;
- 3–5 **petals** sit on a ring around it.

**Petals, always in the same clock position** (muscle memory):

| Petal | Position | When it appears |
|---|---|---|
| **Info** ⓘ | 12 o'clock | always: opens the unit card |
| **Turn** ↻ | 3 o'clock | always (greyed out with the reason if the unit has no MP) |
| **Hold** ⛨ / **Fortify** ▣ / **Testudo** | 6 o'clock | the unit's defensive action. Fortify or Testudo replaces Hold on units that have it (GAME_DESIGN §4.12), showing its MP cost |
| **Signature** ✦ | 7:30 | only on cards with a non-attack signature action (Last stand, Othismos…), with charges left or a cooldown |
| **Skill** ★ | 9 o'clock | only on the general's unit, with a cooldown ring |
| **Undo** ↶ | 10:30 | only if this unit's last move can be undone |

**Moving needs no petal: it's the default.** While the bubble is open, reachable squares are tinted.
- Tap any reachable square: the bubble folds into a **ghost** of the unit at that square, with its path (numbered footprints) and its MP cost.
- Tap the same square again, or double-tap it, to confirm.
- Tap an enemy: the attack preview opens. Tap again (or Confirm) to attack.
- Tap your own other unit: switches selection; the bubble jumps to it.
- Tap empty ground the unit can't reach: deselect. The bubble folds away, with a small "can't reach" ink flick at the tap point.

**Attack modes (GAME_DESIGN §4.12).** When a unit has more than one way to attack, tapping an enemy opens the preview with **mode tabs** above it, defaulting to the basic attack:
- **Shoot | Volley:** on Volley, a 2×2 **area frame** appears, anchored on the tapped enemy. Drag it, or tap a neighbouring square to shift it. Every unit inside shows its expected loss, plus the total. Squares out of range or line of sight are hatched, and a frame containing a friendly unit turns red and can't be confirmed.
- **Engage | Full charge:** Full charge shows the **breakthrough chance** as a big percentage and draws a ghost of the cavalry on the square behind the target, already turned, so you can see where it would end up. If a breakthrough is impossible, the tab says why ("Fortified spears: no breakthrough").
- The chosen tab is remembered per unit for the rest of the battle.

**Turn mode:** the petals fold away and 8 small arrowheads appear around the unit, each showing its MP cost. Tap one, or drag around the unit, to rotate live in 45° snaps. Release or tap to confirm.

**Info:** the unit card **grows out of the unit** (a shared-element Flip from the unit's block to a side sheet): stats, tags, state, level, and why it is Disrupted (from the combat log). Close it, or swipe it away: it shrinks back into the unit.

**Edges:** near a screen edge, the petals rotate as a group so that all of them stay on screen, keeping their order. A petal is never placed under a HUD rectangle.

**Accessibility and expert speed:**
- Petals are 48 px with labels that appear on long-press.
- A long-press on a unit opens Info directly.
- A two-finger tap on the map deselects.
- Desktop extras (wheel to zoom, keyboard shortcuts) stay as in the `touch-controls` skill.

**Retired:** the Undo, Next unit, Turn and ★ General buttons in the bottom bar.
- Undo moves to the bubble petal and to the "Moved · Undo" toast.
- Next unit moves to the "waiting" chip.
- The general's skill moves to the medallion and the petal.
- The AI-turn speed control appears only during the enemy's turn, as a small chip in the top bar.

## 3. Motion design (battle)

All timings are tokens in `src/ui/motion.ts` (see the `motion` skill), and the Animation speed setting scales them. Nothing blocks input: a tap during an animation acts at once, or jumps the animation to its end.

| Moment | Choreography | Total |
|---|---|---|
| **Bubble bloom** | The centre disc presses in (scale 0.85 → 1, `back`). Petals fly out from the centre along their angles in importance order: Info first, then a 25–40 ms varied stagger, never uniform (`choreograph`). Each petal overshoots its radius slightly and settles; labels fade in last. **Petals are tappable the moment they are visible.** | **about 0.5 s** (owner's request); usable within about 120 ms |
| Bubble close | The reverse, faster: petals retract together and the disc shrinks. | about 0.25 s |
| Bubble to ghost (move) | The petals fold into the disc, the disc travels to the target square, and the ghost unit fades in there. Footprints ink in along the path. | about 0.35 s |
| Confirm move | The unit slides along its path square by square (eased per segment), the footprints fade, and the facing settles at the end with a small rotation overshoot. | 0.2–0.6 s by path length |
| Turn mode | Arrowheads sweep in around the ring (a clockwise wave); the block rotates live with a spring. | about 0.3 s |
| Info card | The block grows into the sheet (Flip). The content is already in place inside it — one entrance per container, no second stagger. | about 0.45 s |
| Attack preview | The target gets a red ink bracket that draws on (DrawSVG); the odds pill pops in beside it. | about 0.3 s |
| **Volley** | A fan of fine ink dashes arcs from the shooter and rains into the 2×2 frame, landing on each unit hit in quick succession (varied 30–60 ms, not uniform). Small loss numbers appear per unit, then one total. | about 0.8 s |
| **Fortify / Testudo** | Shield marks lock along the block's front edge with a short stamp; the front edge thickens. Testudo adds a tiled shield pattern. | about 0.35 s |
| **Full charge: breakthrough** | Longer wind-up, a dash with a strong ink trail, and the defender's block ripples as the cavalry **passes through it**, landing behind already turned (one 180° whip with a small overshoot), with a dust burst. On a failure, a hard stop and recoil on impact. | about 0.9 s |
| Charge | Wind-up (4% pull-back), a dash with a fading ink-trail arrow, an impact squash and shake on both blocks, ink specks, then floating loss numbers, with a 60 ms hit-stop on the impact frame (`game-feel`). | about 0.6 s |
| Rout | The block hollows out, wobbles and slides off. The breakpoint meter ticks up with a pulse. | about 0.7 s |
| Turn change | A thin ink banner sweeps across the guidance strip ("Turn 4 · Your move"). | ≤ 0.7 s |

**Reduce motion** (the OS setting or the in-game toggle) turns all of these into short fades of at most 0.16 s, with no shake, flight or hit-stop.

## 4. Premium menus and screens

Shared rules (`emil-design-eng`, `choreograph`):
- one entrance per container;
- staggers vary by importance and are never uniform;
- frequent screens open fast, and only ceremonial ones get long sequences;
- everything is interruptible.

**Materials (flat, but with depth):**
- **Paper layers.** Each panel is a parchment sheet with a faint paper-grain texture (an inline SVG noise filter baked to a small tile), a soft two-layer shadow (a tight contact shadow plus a wide ambient one), and a slightly deckled edge on large sheets.
- **Ink, wax and brass.** Dividers and route lines draw on with DrawSVG. Locks and unlocks are wax seals. Primary buttons have brass edges with a single soft glint on hover or press. Rarity colours appear only on cards.
- **Press feedback on every button:** scale to 0.97 and the shadow tightens (80 ms); release springs back (180 ms). No sticky hover on touch (`mobile-native`).
- **Number tickers:** coins, stars and XP roll to their new value (`gsap.utils.snap`) with a short brass glint when they finish.

**Transitions:**
- Screen to screen: a 220 ms crossfade plus an 8 px slide in the direction of travel.
- **Timeline node → age map:** a shared-element zoom. The tapped age medallion expands into the age map.
- **Age-map node → briefing:** the battle seal flips over and becomes the briefing card.

**Cards and packs** (the recipes in the `motion` skill):
- The pack's wax seal breaks and cards fan out face down.
- Rarity anticipation: an edge glint, and a tremble for Epic and Legendary.
- A 3D flip with a short delay between cards, and a single foil sweep for Legendary.
- "NEW" ribbons, and "Upgrade ready" badges that link to the Army screen.

**Unit card actions.** Each tactical action has an icon and a one-line description on the card. Locked actions on higher rarities of the same role are previewed in grey ("Rare: Fortify") as a teaser.

**Card detail:** tilts slightly with drag or device motion (at most 6°, a soft parallax between the art, frame and text layers), and gets a flat foil sheen on Epic and Legendary cards.

**Age filter (Army screen and Army builder).** A row of age chips at the top, **All · Dawn of War · Antiquity · …**, showing only unlocked ages, on both the Troops and the Generals tabs.
- **Default: the newest unlocked age.** In the army builder, the default is the battle's own age instead.
- The chosen filter is remembered until the app is closed.
- Each chip shows the number of cards owned in that age ("Antiquity 7/11").
- Cards are sorted by rarity (Legendary first), then by level. A second chip row filters by role (Infantry, Ranged, Cavalry, Special).
- Changing the filter animates the cards with Flip. They don't just pop.

**Army builder:**
- Cards slide into slots with a magnetic snap and a small dust puff.
- Removing a card lets the remaining slots close the gap with Flip.
- The army power meter eases to its new value.

**Results:** the victory sequence from the `motion` skill: the battle redrawn as arrows, the VICTORY seal, then stars, coins, XP and cards in sequence, all skippable with a tap.

## 5. Age map: make the path obvious

**Problem:** players can't tell which battle comes first without reading the years.

- **Numbered seals.** Each main battle's node is a wax seal with its number (1, 2, 3 …) in large type; the name and year sit beneath it.
- **Route with direction.** An ink route links the main battles in order, with small arrowheads every few centimetres:
  - travelled segments (won battles) are solid ink;
  - the next segment is animated dashes moving forward;
  - locked segments are faint dotted lines.
- **"Next" flag.** A brass pennant flies over the next playable battle and gently waves. On entering the map, the camera eases to it.
- **Optional battles** are smaller diamond seals on short side branches, drawn as dotted lines off their parent node, labelled "Side". They never take a number on the main path.
- **Locked nodes** show a lock with the stars needed ("🔒 4★"). Tapping one shakes the lock and shows how many more stars are needed, highlighting the battles that could still earn stars.
- **Progress rail.** A segmented progress bar in the header, with one segment per main battle (filled, current, locked), plus the star count.
- **Legend:** a small key in a corner (main, side, locked, next) that can be collapsed.

## 6. Battle menu (☰)

The battle menu opens as a parchment sheet sliding from the left. Items, in order:
1. **Resume**
2. **Restart battle.** Asks to confirm: "Restart from deployment? This battle's progress will be lost." There is no penalty: it doesn't count as a defeat. It returns to deployment with the same army and a fresh seed. Add a `Restart` command in core, so the UI never changes state itself.
3. **Battle objectives** (the same content as the objective chip, in full)
4. **Settings:** Animation speed, Reduce motion, Haptics, Quick confirm, Sound (for later)
5. **How to play:** the controls help page, generated from the gesture list
6. **Retreat** (counts as a defeat, with a confirmation)

## 7. More ideas worth building (from other tactics and mobile games)

The prompt lists which ones are in scope now. The rest are a backlog.

**Battle readability (Into the Breach, Fire Emblem, FoG2):**
- **Threat view:** hold a toggle, or the enemy's breakpoint meter, to tint every square an enemy can charge or shoot next turn.
- **Enemy intent markers** after the AI plans (optional, "assist" setting): small arrows showing who will attack whom. This is great for learning.
- **Damage forecast on the ghost:** while the move ghost is shown, enemies that could then attack it show a small warning pip.
- **Replay last enemy turn:** a button on the turn banner replays the AI's moves as arrows.
- **Micro camera:** a tiny zoom punch-in on big impacts (≤ 3%); the camera eases to off-screen actions during the enemy turn.
- **Atmosphere:** subtle weather overlays (rain streaks, fog as an ink wash that lifts as units see), and a time-of-day paper tint (dawn warm, dusk cool).
- **Rout moments:** a 150 ms slow-motion beat when an army breaks.

**Meta and collection (Clash Royale, Marvel Snap, Hearthstone):**
- **Codex:** a lore book of battles, generals and troops. Each entry unlocks on first win or on owning the card, and uses the history briefs.
- **Medals:** achievements as stamped medals on a sash.
- **Card mastery borders:** a frame that changes at Lv3 and Lv5.
- **Seasonal "Battle of the day"** with a fixed army, on the timeline.
- **Loading-screen "Did you know?"** facts from the briefs.

**Feel and polish:**
- **Sound hooks:** quill scratch on ink lines, a drum on turn start, a wax-stamp thud, coin clinks — all behind the `sfx()` stub, so audio can be added later.
- **Haptics:** light on snap, medium on charge, success on victory.
- **Accessibility:** a colour-blind palette (blue and orange), text size scaling, and Reduce motion.

## 8. Quality bar

- 60 fps on a mid-range tablet. The worst frame is at least 45 fps with 4× CPU throttling (`motion-check`).
- No layout or paint properties are animated. The board animates position, scale, rotation and alpha only.
- Every animation can be interrupted and skipped. Input is never blocked.
- `review-animations` is run on every motion change, and the findings are fixed before commit.

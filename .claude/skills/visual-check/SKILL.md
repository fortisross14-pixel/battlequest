---
name: visual-check
description: Screenshot the running game at tablet and phone sizes and check it against BattleQuest's battle-map style and touch rules. Use after any change to src/render or src/ui, before committing UI work, and when asked whether something "looks right".
---

# Visual check

> **Prototype phase:** follow the PROTOTYPE PHASE rules in `CLAUDE.md`. Skip every balance, tuning and win-rate step below, and keep checks to: the requirement is done, and the game runs.

Graphics and touch UX are judged by looking at the game, not by reading code. Do this for every render or UI change.

## Steps

1. Start the dev server in the background (`npm run dev`) and read the port from its output.
2. Run `scripts/visual-check.mjs` (create it the first time if it doesn't exist). It uses the pre-installed Playwright (`require('playwright')`; never run `playwright install`). It should:
   - open the game at **1024×768** (tablet landscape) and **812×375** (phone landscape), with `deviceScaleFactor: 1`;
   - take screenshots of: the initial board; a selected unit with its highlights; the move ghost and facing ring; the combat preview panel; a unit in each cohesion state (load a debug scenario through a URL parameter such as `?scenario=debug-states`);
   - drive the game with pointer and touch events (`page.touchscreen.tap`, pointer drags), not mouse-only events;
   - save the screenshots to `screenshots/<date>-<label>/`, which is gitignored.
3. Open every screenshot with the Read tool and check it against the list below.
4. Fix what fails, then run the check again. In your summary, say which items you checked and which you couldn't.

## Checklist (from docs/GAME_DESIGN.md §9–10)

- [ ] Parchment background; flat terrain shapes; the grid is subtle until a unit is selected
- [ ] Units are blue and red rectangles rotated to their facing, with a visibly thicker **front edge**
- [ ] A NATO-style symbol is legible at both sizes; the strength bar and cohesion pip are visible
- [ ] Disrupted and Fragmented units are hatched; Routed units are hollow (outline only)
- [ ] The general's pennant is readable
- [ ] Reachable, charge and shoot highlights are easy to tell apart without relying on color alone
- [ ] Every button and touch target is at least 44 px; End turn, Undo and Next unit are within thumb reach in the bottom corners
- [ ] No text is cut off or overlapping, and nothing is hidden behind the phone's notch area
- [ ] No information is available only on hover

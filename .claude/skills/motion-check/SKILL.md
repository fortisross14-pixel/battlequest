---
name: motion-check
description: Record and inspect BattleQuest animations (frame strips, video, fps, input-during-animation, reduced-motion) at tablet and phone sizes. Use after any animation, transition or controls change, and before committing motion work.
---

# Motion check

A screenshot can't show whether an animation feels right, so this check records it.

## Tool
`scripts/motion-check.mjs` (create it the first time if it doesn't exist).
- Use the globally installed Playwright: `require('/opt/node22/lib/node_modules/playwright')`, or `executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'`. Never run `playwright install`.
- Sizes: 1024×768 and 812×375, `deviceScaleFactor: 1`, `hasTouch: true`.
- Debug entry points (add them as URL params if missing):
  - `?scenario=debug-intro` — battle intro;
  - `?debug=pack&rarity=legendary` — pack opening with a forced result;
  - `?debug=victory` — victory sequence;
  - `?debug=defeat` — defeat sequence;
  - `?scenario=debug-states` — in-battle effects;
  - `&seed=N` — fixes the dice.
- For each sequence:
  1. **Frame strip:** capture a screenshot every 100 ms (or use `page.video` and extract frames) and tile them into one contact-sheet PNG per sequence in `screenshots/<date>-motion/`.
  2. **Frame rate:** count `requestAnimationFrame` callbacks during the sequence, with 4× CPU throttling through CDP (`Emulation.setCPUThrottlingRate`) to mimic a tablet. Report the average and worst-frame fps.
  3. **Skip test:** tap at 300 ms. The sequence must jump to its end state within one frame, and the tap must not trigger anything else.
  4. **Input test (battle):** start a unit move, then tap another unit 100 ms later. The second selection must happen and the first move must finish cleanly.
  5. **Reduced motion:** run again with `reducedMotion: 'reduce'` and confirm there's no movement or shake, only short fades.

## Review
Open each contact sheet with the Read tool and check:
- [ ] The timing matches the `motion` skill tokens (count frames: 100 ms per tile)
- [ ] Anticipation, action and settle are all visible: nothing pops in without easing, nothing drifts on after it should have stopped
- [ ] The style stays minimal: flat shapes, ink, paper and seals, with rarity colors only on cards
- [ ] Text is readable at every frame where it is meant to be read
- [ ] Worst frame is at least 45 fps throttled, and the average at least 55 fps
- [ ] Skip and input tests pass
- [ ] Reduced motion is respected

In your summary, report the fps numbers and attach the contact sheets for the owner.

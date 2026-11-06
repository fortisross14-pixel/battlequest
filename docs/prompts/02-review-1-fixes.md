# Agent prompt: Review 1 fixes

Copy everything below the line into a new agent session on this repo.

---

The first playable version of BattleQuest (M0–M3) has been reviewed. Your job is to fix what the review found.

**Read first:**
- `CLAUDE.md`
- `docs/reviews/2026-11-06-review-1.md`: the findings and seven work packages (WP1–WP7), with file and line references
- the sections of `docs/GAME_DESIGN.md` they mention. **§5, §8 and §10 were just rewritten to match the owner's decisions** (troop cards that you unlock and upgrade with cards plus coins, an army builder based on unit slots, wide unit blocks with pictograms). They are the spec: don't follow the old points-budget behaviour.

**Order of work**
1. **WP1 — Army choice, cards and upgrades.** This is the owner's top complaint. Use the `add-unit` skill for content changes.
2. **WP2 — Enemy AI.** Reproduce the "idle neighbour" bug in a test before you fix it.
3. **WP4 — Rule bugs and movement feel.** Use the `rules-change` skill for every core change.
4. **WP3 — Graphics and icons.** Fix the `visual-check` Playwright problem first. Then build the icon sheet, take a screenshot, and **stop for my approval** before you replace the in-game icons. While you wait, you can do the block-shape, terrain and phone-layout parts.
5. **WP6 — Battle readability.**
6. **WP5 — Balance and campaign difficulty.** Do it after WP1, WP2 and WP4, because those change the numbers. Use the `balance-sim` skill.
7. **WP7 — Code health.** Do the splits as you touch those files, not as a separate big-bang refactor.

**Rules**
- Each work package ends with:
  - its "Done when" items met;
  - `npm run typecheck && npm run lint && npm test` green;
  - `visual-check` run for any UI work;
  - decisions logged in `docs/DECISIONS.md`;
  - `docs/PROGRESS.md` updated;
  - one or more small commits pushed to your working branch.
- Existing player saves must survive. The profile migration (v1 → v2) needs a test.
- If the review and the design doc disagree, the design doc wins. If either one is unclear or produces bad gameplay, pick a sensible option, log it, and carry on. Stop to ask only for the icon approval or a blocking choice.
- Before your final push, run `code-review` (medium) on your diff and fix what it finds.

**Finish with a short summary:** what changed in each work package, before/after numbers (AI-vs-AI win rate, campaign win rates, unit cost spread), anything you skipped, and screenshots of the new briefing/army builder, the Army screen with upgrades, and a battle with the new unit blocks.

---
name: balance-sim
description: Run thousands of headless battles with the real core rules to measure unit, general and scenario balance, and flag outliers. Use after changing unit stats, rule constants, combat or morale math, or general skills, and before tuning any balance number by hand.
---

# Balance simulator

Balance is measured, not guessed. Every balance claim ("pikes are too strong", "Cannae is too hard") must be backed by a run of this tool.

## The tool

The tool is `scripts/balance/` (create it the first time if it doesn't exist), run with `npm run balance -- <mode> [options]`. It imports `src/core` directly and must use the real rules: never a copy of the formulas. Use a fixed seed list so runs are reproducible.

Modes:

- **`duel`** — 1v1 for every pair of archetypes, run under four setups: front attack, flank attack, attacker charges, and defender braces. Output a win-rate matrix and the average turns to resolve.
- **`cost`** — equal-points armies made of a single archetype each (for example 600 points of A against 600 points of B), on open ground. Output **win rate per point of cost**. This is the main check that costs are fair.
- **`terrain`** — the same matchups on each terrain type (forest, hill, ford, bridge, mud), to confirm terrain swings results the way §4.9 intends.
- **`scenario <battleId>`** — the AI plays the enemy and a scripted reasonable player army plays the player, with N seeds. Output the player's win rate and average losses. It is valid once the AI exists (M3+).
- **`general <generalId>`** — the same scenario with and without the general's trait and skill, to measure what the general is worth.

The tool writes a Markdown report to `docs/balance/<date>-<mode>.md`, with tables and an "Outliers" section. Use the `dataviz` skill if you add charts.

## Targets

- `duel`: the counters in §4.5 must hold. A spear facing a frontal cavalry charge should win at least 65% of the time; cavalry hitting a spear's flank should win at least 65%.
- `cost`: no archetype's win rate per point should be more than **±15%** above or below the median, except intended specialists, which you must document.
- `scenario`: tutorial and early battles should give a 60–80% win rate with the default starter army; Age-final battles 30–50%.

## When something is off

1. Change data in `src/content` or the constants in the rules config first. Change core logic only if the rule itself is wrong.
2. Run the tool again and confirm the change didn't break any other matchup.
3. Log the change and the before/after numbers in `docs/DECISIONS.md`.

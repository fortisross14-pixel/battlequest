---
name: rules-change
description: Safely add or change a battle rule or mechanic in src/core (combat, morale, movement, terrain, victory, skill effects). Use for any change to how battles resolve, as opposed to a pure data change.
---

# Change a rule

The battle rules are the heart of the game and must stay deterministic, tested and documented.

1. **Read the relevant section** of `docs/GAME_DESIGN.md` (§4) and any related entries in `docs/DECISIONS.md`.
2. **Write the failing test first** in `tests/core/`. Cover the normal case and at least one edge case: a flank attack, a routed unit, a unit at the edge of the map, a bridge, and so on.
3. **Implement it in `src/core`:**
   - Tunable numbers go in the rules config object, never inline.
   - Use only the seeded RNG; no DOM, no timers.
   - The state change happens inside command handling and emits events, so the renderer can animate it.
   - If the rule affects combat outcomes, `previewCombat()` must reflect it automatically, because it reuses the same functions. Add a test that the preview and the real outcome agree on expected values.
4. **Run** `npm run typecheck && npm run lint && npm test`.
5. **Run** `balance-sim duel` and `balance-sim cost` (and `scenario` for affected battles) to see what the change did to balance.
6. **Document it:** update `docs/GAME_DESIGN.md` if the rule is now different from what's written there, and add a `docs/DECISIONS.md` entry with the date, the change, the reason, and the balance impact.
7. If the rule has a visual consequence (a new state or marker), run `visual-check`.

---
name: add-battle
description: Add a historical battle scenario to the campaign (map, armies, objectives, briefing, tests). Use whenever creating or reworking a battle in src/content.
---

# Add a battle

> **Prototype phase:** follow the PROTOTYPE PHASE rules in `CLAUDE.md`. Skip every balance, tuning and win-rate step below, and keep checks to: the requirement is done, and the game runs.

Each battle is a short tactical puzzle built around one clear historical "problem" (docs/GAME_DESIGN.md §7). Content is data only. If the battle needs a new mechanic, use the `rules-change` skill first.

## Steps

1. **Research.** If `docs/history/` has a brief for this battle, start from it: copy its facts, coordinates, briefing and sources, and treat its sketch, difficulty and suggestions as starting points. Otherwise: Write 3–5 bullet points of real history: where it happened, the terrain, the forces, and what decided the battle. If you can't verify a fact, leave it out rather than invent it.
2. **Name the problem in one sentence**, for example "Hold a one-square bridge against a larger army for 6 turns". The map, objectives and bonus star condition all come from this sentence.
3. **Map:** pick the size class from §4.1. Simplify the terrain so it reads at a glance: a few strong features, not noise. Mark both deployment zones.
4. **Enemy army:** use archetypes from the right era, the enemy general, the AI posture (§4.11), and any reinforcements with their arrival turn.
5. **Campaign placement:** the age, the battle's order within it (historical order), its **latitude/longitude** for the age map node, and a check that its difficulty fits its star gate (§7.3): later battles in an age should be harder.
6. **Player settings:** unit slots, turn limit, weather, fog of war on or off, army breakpoint if it isn't 50%.
7. **Objectives and stars:** the win condition, plus a ★★★ bonus condition that rewards playing the battle the way it was historically won.
8. **Briefing:** 3–4 sentences, mostly history with one tactical hint. Keep the tone vivid and short.
9. **Tests** in `tests/content/`:
   - the battle loads and validates against the content schema;
   - all deployment squares are passable;
   - both sides can reach each other;
   - a scripted run with a fixed seed reaches a result inside the turn limit.
10. **Balance:** run `balance-sim scenario <battleId>` and check the win rate is inside the target band for its place in the age.
11. **Look:** run `visual-check` on the new map.
12. Add the battle to its age in the campaign data and tick it off in `docs/PROGRESS.md`.

## Template

Copy the shape of the most recent finished battle in `src/content/battles/`, don't start from scratch, so all battles stay consistent.

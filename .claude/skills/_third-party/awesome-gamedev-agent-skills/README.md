# Third-party skills: awesome-gamedev-agent-skills

These skills are copied unchanged from
[gamedev-skills/awesome-gamedev-agent-skills](https://github.com/gamedev-skills/awesome-gamedev-agent-skills)
at commit `19d93f97c9c1ea0f8b306e77aa81e0d3e352d3e9` (2026-10-28), under the Apache License 2.0
(see `LICENSE` and `NOTICE` in this folder).

| Skill folder                   | Use in BattleQuest                                                   |
| ------------------------------ | -------------------------------------------------------------------- |
| `pixijs-rendering`             | PixiJS v8 render layer (battlefield, ceremonies drawn on the board)  |
| `game-feel`                    | Juice: hit-stop, shake, squash and stretch, layered feedback         |
| `game-ui-ux`                   | Menus, HUD, screen stack, safe areas, responsive layout              |
| `input-systems`                | Input architecture, buffering, accessibility                         |
| `camera-systems`               | Camera smoothing, bounds, framing                                    |
| `game-ai`                      | FSMs, pathfinding, enemy decision-making                             |
| `ai-behavior-trees-utility-ai` | Utility AI curves and considerations (the enemy AI is utility-based) |
| `level-design`                 | Battle maps, pacing, gating and the campaign's critical path         |
| `save-systems`                 | Profile versioning, migration, crash-safe saves                      |
| `performance-optimization`     | Frame budget, pooling, profiling                                     |

Not copied: the router, which assumes the whole collection is present (`CLAUDE.md` does its job here); engine skills for Godot, Unity, Unreal and others; `card-game` (a deckbuilder, not a collection game); `create-game-assets` (a raster and 3D pipeline with Python tools). The game's own project skills (`motion`, `touch-controls`, `rules-change`…) win when the two disagree.

To update: re-copy the folders from a newer commit, review the diff, and update the commit above.
For the whole collection on your own machine: `claude plugin marketplace add gamedev-skills/awesome-gamedev-agent-skills`.

---
name: add-unit
description: Add a unit type or a general to the game data with consistent stats, tags, icon and tests. Use whenever creating or editing entries in src/content/units or src/content/generals.
---

# Add a unit or general

If `docs/history/` has a brief for this troop or general, start from it (history, flavor, suggested modifiers, trait and skills), then balance it.

## Units

1. **Pick the base archetype** from §4.5. Era units are re-skins of an archetype plus small modifiers: at most ±1 on two stats and at most one extra tag. A brand-new archetype is a design change: log it in `docs/DECISIONS.md` and get the user's approval first.
2. **Fill in** the id, display name, age, archetype, stat modifiers, tags, cost, rarity, and a one-line flavor description.
3. **Icon:** use the archetype's NATO-style symbol, with an optional small glyph for the era variant. Add it to the SVG sprite. Draw no new art style.
4. **Actions** (GAME_DESIGN §4.12): Commons get only the basics. Rares get 1 signature action, Epics 1–2, and Legendaries their signature actions (usually an upgraded version). That's at most 3 besides Move and Hold. Pick actions from the §4.12 catalog that match what the troop was famous for (the history brief's `distinctive` field). A new action type is a rules change: use `rules-change`, and give it an icon, a card line, AI scoring and a duel check.
5. **Tests:** the entry validates against the schema, and the derived stats equal the archetype stats plus the modifiers.
6. **Balance:** run `balance-sim cost` and `balance-sim duel`. The new unit must land inside the ±15% band, or be documented as a specialist.

## Generals

1. **Fill in** rarity, era, passive traits (with values at rank 1 and rank 10), the active skill or skills with their cooldowns, the rank at which the second skill unlocks, and an initials-based portrait.
2. **Implement skills** as data plus effect handlers in core. Reuse existing effect types (stat modifier, cohesion change, heal, extra action, reveal) before adding new ones. A new effect type needs the `rules-change` skill.
3. **Tests:** every skill's effect and cooldown has a test, and every passive scales correctly with rank.
4. **Balance:** run `balance-sim general <id>`. A Legendary general should be noticeably stronger than a Common one, but should never turn an unwinnable battle into an automatic win.

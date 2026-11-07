# BattleQuest — Game Design Document

> Working title: **BattleQuest: Through the Ages**
> Platform: tablet first (landscape), then phone. Touch only.
> Genre: Turn-based tactical battle simulator with light collection/progression meta.
> Status: v0.1 draft. Numbers are starting points for tuning, not final balance.

---

## 1. Pitch

You are **the Chronicler**, a traveler who moves through history and re-fights its great battles. Each battle is a short, tight tactical puzzle on a grid: unit type, position, facing, terrain and morale decide the outcome, in the style of *Field of Glory II: Medieval*.

The twist: **you choose your army and your general**, and they don't have to come from the same era. Napoleon with Roman legions at Thermopylae, Alexander with Spanish tercios at Agincourt. Your enemies are historically flavored; your army is whatever you have collected.

The look is a **living historical battle map**: the same red-and-blue blocks, arrows and terrain shapes you see in textbook battle diagrams (Waterloo, Gaugamela), animated and playable.

## 2. Design pillars

1. **Tactics first.** Every decision should be about position, facing, timing and matchups. There is little management outside battle.
2. **Readable at a glance.** Minimal graphics, maximum clarity. A player should be able to read the whole battle state from the map, the way you read a historical battle diagram.
3. **Built for fingers.** Every action takes one or two taps. Nothing needs precision dragging, hover or right-click.
4. **Fun combinations.** Mixing eras and generals is the fantasy. Balance comes from points cost and matchups, not from banning combinations.
5. **Short sessions.** A battle takes 10–20 minutes, 8–15 turns. You can retry quickly.
6. **Fair progression.** Coins and packs speed you up. Skill can always beat a battle with a weaker army.

## 3. Core loop

```
 Timeline → age map (pick battle)
        │
        ▼
 Battle briefing ──► Army builder (pick general + fill unit slots)
        │
        ▼
 Deployment (place units in your deployment zone)
        │
        ▼
 Battle (alternating turns until one army breaks or objectives resolve)
        │
        ▼
 Results: stars, coins, general XP
        │
        ▼
 Shop: buy troop packs / general packs, upgrade
        │
        └──► back to the campaign map (next battle, or retry for more stars)
```

- **First session:** the Prologue battle is the tutorial. It uses a fixed army and general, so the player learns the rules before buying anything.
- **Losing still pays a little:** you get a small coin reward and general XP. A retry is never a waste of time.

## 4. Battle system

### 4.1 Map and grid

- **Square grid**, 8-directional movement and facing. Squares read well as "blocks", which matches the battle-map look.
- Map sizes: small 12×8 (phone and tutorial), standard 16×10, large 20×12 (late ages). Pinch to zoom, drag to pan.
- **One unit per square.** A unit is an abstract block of a few hundred to a few thousand soldiers.
- Each map has a **deployment zone** for each side (shaded squares).

### 4.2 Turn structure

- **Alternating side turns** (IGOUGO): the player moves all their units, then the AI moves all of theirs. One full round of both sides is one **turn**. Each battle has a turn limit.
- During your turn, units act in any order you like. Each unit gets:
  - **Movement**, up to its Movement Points (MP), including turning, and
  - **One action**: Shoot, Charge, Skill (if it is the general's unit), or Hold (brace and gain a defense bonus).
  - A charge **is** movement plus action: the unit moves in a straight line into contact.
- **End of side turn:** every melee in progress resolves (both sides deal damage), then cohesion tests, then rout movement.

### 4.3 Movement, facing and zones of control

- **Costs:** orthogonal step = 2 MP, diagonal step = 3 MP (this approximates real distance). Terrain multiplies the cost (see 4.7).
- **Facing:** 8 directions. A unit's **front arc** is the 3 squares ahead of it, its **flanks** are the 2 side squares, and its **rear** is the 3 squares behind it.
- **Turning:** any change of facing costs **1 MP**, whatever the angle, so a unit can spend all but 1 MP moving and still turn. Light units (skirmishers, light cavalry) turn for free. A selected unit has a **Turn** button that opens the facing ring.
- **Facing after a move:** a unit keeps the facing it started with if it can afford the turns; otherwise it faces the way it walked. The player can pick another facing.
- **Sidestep / backstep:** as its first move of the turn, a unit outside any enemy zone of control may shift one square left, right or back without turning, for 3 MP (scaled by terrain like a normal step).
- **Zone of control (ZOC):** a unit that enters a square inside an enemy's front arc must stop. It can't walk past enemies. It can leave only by:
  - charging, or
  - **pulling back** one square straight backwards (only if it is not in melee). "Backwards" is measured from the facing it had at the start of the turn, and pulling back ends its movement, or
  - **evading**, for units with the Evade ability (see 4.5).
- **Units in melee** can't move except to rout.

### 4.4 Unit stats

Every unit type has:

| Stat | Meaning |
|---|---|
| **Strength** | Hit points as a percentage (100 = full). At 0 the unit is destroyed. |
| **MP** | Movement points per turn. |
| **Melee** | Damage dealt in ongoing melee. |
| **Impact** | Damage dealt on the charge (first clash). |
| **Ranged / Range** | Shooting damage, and the farthest square it can hit (0 = can't shoot). Basic missile troops have range **3**: from A1 they reach A2, A3 and A4, two empty squares away. Elite or later-age shooters (and some generals) reach one more. Skirmishers' javelins reach 2. |
| **Armor** | Reduces incoming damage. |
| **Morale** | Base resistance to cohesion loss. |
| **Cost** | Army points. |
| **Tags** | Abilities and special rules (see 4.5). |

Stats use a 1–10 scale so they stay readable on the unit card.

### 4.5 Unit archetypes (the rock-paper-scissors core)

Each age re-skins these archetypes: a "Hoplite", a "Legionary" and a "Landsknecht" share a base archetype with era modifiers. That keeps cross-era mixing balanced and readable.

Costs were tuned with `balance-sim cost` in review 1 (see docs/DECISIONS.md).

| Archetype | MP | Melee | Impact | Ranged (rng) | Armor | Morale | Cost | Tags / notes |
|---|---|---|---|---|---|---|---|---|
| Skirmishers (javelin/sling) | 10 | 2 | 2 | 4 (2) | 2 | 4 | 55 | Evade, LightTurn, RoughTerrainOK |
| Archers | 8 | 2 | 1 | 6 (3) | 2 | 4 | 47 | — |
| Crossbowmen | 8 | 3 | 1 | 7 (3) | 4 | 5 | 62 | ArmorPiercing, NoMoveAndShoot |
| Spearmen | 8 | 5 | 5 | 0 | 5 | 6 | 87 | AntiCavalry (front) |
| Heavy swordsmen (legion) | 8 | 7 | 6 | 3 (1)* | 6 | 7 | 97 | *Pila: one-shot volley |
| Pikemen | 6 | 7 | 7 | 0 | 5 | 6 | 83 | AntiCavalry (strong, front), FrontOnly, FlankVulnerable |
| Light cavalry / horse archers | 16 | 3 | 3 | 4 (3) | 2 | 5 | 70 | Evade, LightTurn |
| Heavy cavalry / knights | 12 | 6 | 9 | 0 | 7 | 7 | 104 | Charge (×1.2 impact after a 2+ square run-up, not into a spear wall), Pursue, RoughTerrainBad |
| Chariots | 12 | 3 | 8 | 3 (2) | 4 | 5 | 70 | Charge, HitAndRun (falls back a square after the impact instead of staying in melee), RoughTerrainVeryBad |
| War elephants | 8 | 7 | 9 | 0 | 6 | 6 | 97 | ScaresHorses, Stampede (routed elephants damage adjacent friends) |
| Arquebusiers / musketeers | 8 | 3 | 1 | 8 (3) | 3 | 5 | 60 | ArmorPiercing, Reload (fire every other turn until Age 8), RainPenalty |
| Line infantry | 8 | 5 | 4 | 7 (3) | 3 | 7 | 77 | Formations: Line / Column / Square |
| Field artillery | 4 | 1 | 0 | 9 (6) | 2 | 5 | 100 | NoMoveAndShoot, HelplessInMelee, Bounce (hits the unit behind the target for half damage) |

Elephants and scythed chariots (defined for Antiquity, see docs/DECISIONS.md): **ScaresHorses**: horsemen and chariots fight elephants at ×0.6 (charge, counter and melee), and elephants hit them ×1.25. **Stampede**: when an elephant unit routs, each friend next to it loses 15 strength and tests. **Scythed** (an era tag for chariots): ×1.5 impact when charging foot troops.

Key matchups to protect while balancing:

- Spears and pikes beat a frontal cavalry charge. Cavalry beats them on the flank or rear.
- Heavy cavalry beats skirmishers and archers in the open, but they evade.
- Shooters wear down heavy infantry slowly and lose badly if they get caught.
- Gunpowder shreds armor, but it is slow to fire early on and miserable in rain.
- Line infantry in **Square** is immune to the cavalry flank bonus, but takes double damage from artillery.

### 4.6 Combat resolution

The math lives entirely in the simulation core, is deterministic for a given RNG seed, and is unit-tested.

**Damage** (applies to ranged, impact and melee):

```
effAtk  = attackerStat × attackerModifiers
effDef  = defender.armor × defenderModifiers   (ArmorPiercing halves this)
damage  = BASE × effAtk / (effAtk + effDef) × situational × random(0.85, 1.15)
BASE    = 30   (equal stats → about 15 strength lost per exchange)
```

Situational multipliers (they stack multiplicatively):

| Situation | Multiplier |
|---|---|
| Attacking a flank | ×1.5 |
| Attacking the rear | ×2.0 |
| Attacker uphill of the defender | ×1.2 |
| Defender in cover (forest, village, fieldworks) vs ranged | ×0.6 |
| Defender bracing (Hold) | ×0.8 |
| Attacker Disrupted / Fragmented | ×0.75 / ×0.5 |
| Strength scaling: attacker's current strength | × (0.5 + 0.5 × strength/100) |
| Shooting at long range (more than half of max range) | ×0.7 |

**Impact (charge)** happens once, when the charger makes contact. Both sides deal damage: the charger uses Impact; the defender uses Impact if it is AntiCavalry and is charged from the front by cavalry, otherwise Melee × 0.5. A charge that wins clearly can push the defender back 1 square.

**Melee** goes on at the end of each side's turn while units stay in contact. Both sides use Melee. A unit strikes an opponent to its front if it has one; a unit with enemies only on its flank or rear strikes back at **×0.5**, both at impact and in melee.

The **charge preview** shows the impact plus the expected first melee round, since that round is fought at the end of the same side turn.

### 4.7 Cohesion and morale

Units have four cohesion states:

| State | Effect |
|---|---|
| **Steady** | Normal. |
| **Disrupted** | −25% damage dealt. Can still charge. |
| **Fragmented** | −50% damage dealt. Can't charge. |
| **Routed** | Out of control. Flees toward its own map edge every turn. Destroyed if caught. |

**Cohesion test.** A unit tests whenever it takes damage, and when a friendly unit adjacent to it routs. The chance to drop one level:

```
p = 0.05
  + 1.5 × (damageTakenThisTest / 100)
  + 0.20 if attacked in the flank, 0.35 if in the rear
  + 0.15 if an adjacent friendly unit routed this turn
  + 0.10 if strength < 50
  − 0.03 × morale
  − 0.15 if within the general's command radius
p clamped to [0, 0.9]
```

- A unit at strength 25 or lower routs automatically.
- **Rally:** at the start of its side's turn, a Routed or Fragmented unit that is not adjacent to an enemy and is within the general's command radius has a 35% chance (plus the general's bonus) to go up one level.
- **Pursuit:** cavalry with Pursue that routs its opponent follows it 1–2 squares. It may get out of position, which is a deliberate trade-off.

### 4.8 Army breakpoint and victory

- **An army breaks** when the cost of its routed and destroyed units reaches **50%** of its total army cost. Some scenarios change this threshold, for example 40% for Teutoburg ambushes.
- The battle ends when one army breaks, when a scenario objective is met (hold the bridge for 6 turns, kill the enemy general, escape with N units), or when the turn limit is reached. At the turn limit, objectives decide the result; otherwise it is a draw, which counts as a loss for stars.
- **Stars:** ★ win. ★★ win having lost under 30% of your army. ★★★ win having lost under 30% **and** completed the battle's bonus condition, such as "win by turn 10" or "keep your general alive".

### 4.9 Terrain

| Terrain | Move cost | Effects |
|---|---|---|
| Open | ×1 | — |
| Rough / scrub | ×1.5 | Cavalry and chariots −25% impact. Heavy cavalry −20% melee. |
| Forest | ×2 | Blocks line of sight. Cover vs ranged. Cavalry −50% impact and melee. Light infantry +20% melee. |
| Hill (elevation 1–2) | ×1.5 uphill | Uphill bonus. Higher units see and shoot over lower ones. Artillery +1 range. |
| River | impassable | Crossing only at fords or bridges. |
| Ford | ×3 | A unit in a ford fights at −30% and counts as Disrupted. |
| Bridge | ×1 | One unit wide. Only the front square can fight. This is the chokepoint. |
| Marsh / mud | ×3 | Heavy units −30% melee and impact. Can't charge into it. |
| Village / farm | ×1.5 | Strong cover. +25% defense. Holds the objective (Hougoumont, La Haye Sainte). |
| Fieldworks / stakes | ×2 to cross | Cavalry can't charge across them. Defenders get +30% vs impact. |
| Road | ×0.5 (column only) | Fast movement out of combat. |

**Weather and scenario modifiers:** fog (vision limited to 3 squares, fog of war on), rain (gunpowder ranged −50%, mud spreads), heat (−1 morale after turn 8), and timed **reinforcements** (Blücher arriving at Waterloo on turn 8).

**Line of sight:** woods and higher ground block it; **units never do**, so missile troops shoot over friends and enemies alike. A missile unit in melee can't shoot: it fights with its (weak) melee instead. Selecting a missile unit shows the squares it can hit.

**Fog of war:** off by default (you see the full map, as on a battle diagram). Scenarios such as Trasimene, Teutoburg and Austerlitz turn it on.

### 4.10 Generals in battle

- The general takes the field as **their own unit**: the general and guard, a small cavalry unit with a banner badge and the general's pennant. It deploys behind the line like any unit, and it costs nothing (it doesn't count towards the army's breakpoint).
- **Command radius** (3–5 squares, set by rank and traits) around the general's unit: units inside it get the cohesion and rally bonus. Passive traits apply to the whole army.
- **If the general's unit routs or is destroyed, that army loses the battle at once.** Generals are therefore conservative: the AI keeps its general about two squares behind the middle of its army, out of reach of enemy charges, and only attacks with it to run down a router or to finish a unit it is likely to break. In the meta game, a fallen general is unavailable for the next battle only. There is no permadeath.
- **Active skills** cost one action from the general's unit and have a cooldown in turns.

### 4.11 Enemy AI

Utility-based, kept simple:

- Each scenario gives the AI a **posture**: Aggressive, Defensive (hold a line or objective), Ambush (stay hidden until triggered), or Timed (defend until turn N, then attack).
- For each unit, the AI scores candidate actions: expected damage dealt minus expected damage taken, flank opportunities, objective value, staying near its general, and avoiding counter-flank.
- The AI acts in order of its highest-scoring action first. Ranged units shoot before melee units charge.
- **Difficulty** comes from scenario setup (enemy points, quality, terrain) more than from AI cheating. A "Hard" toggle grants a +10% enemy morale bonus.

## 5. Units and collection

The troop dynamic is **unlock and upgrade**.

- **Troop cards.** A troop type is **unlocked** the first time you get one of its cards. Once a type is unlocked you can field **any number of copies** of it. The battle's unit slots are the only limit.
- **Starting roster:** a new player owns **2 troop types**: the two units the Prologue battle uses. More types come from packs, battle rewards and age unlocks.
- **Card count.** Every extra card of a type you already own is kept as a spare card. The Army screen shows how many spare cards you hold for each type.
- **Upgrading costs cards and coins.** You choose when to upgrade; it is never automatic.

  | Upgrade | Spare cards | Coins |
  |---|---|---|
  | Lv1 → Lv2 | 1 | 15 |
  | Lv2 → Lv3 | 2 | 40 |
  | Lv3 → Lv4 | 4 | 100 |
  | Lv4 → Lv5 | 8 | 250 |

  - Coin costs ×1.5 for Rare troops and ×2 for Epic troops.
  - Level 5 is the maximum. Spare cards beyond it convert to 5 coins each.
- **Level effect:** each level gives +5% to Melee, Impact, Ranged and Morale. The level applies to every copy of that type you field.
- **Era tag:** every unit belongs to an age. Mixing eras is allowed and encouraged.

### Army builder

- Each battle sets a number of **unit slots** (for example 3) and a choice of **general**.
- **Slots are the main limit, not points.** You can fill 3 slots with 3 archers, 3 chariots, or one of each. Matchups make it a real decision: 3 archers get slaughtered by cavalry.
- Every slot must be filled to deploy.
- The screen shows an **army power** indicator against the enemy's power as a difficulty hint only. It doesn't block anything.
- Unit point costs still exist inside the battle rules: they set when an army breaks and how stars count losses.
- The **general picker** appears on every battle. Each card shows the general's name, rank, first skill, rarity and power; long-press (or hover with a mouse) for traits, skills and cooldowns. The general takes the field with their own guard unit.
- **Slots:** tap a slot to open a picker with your troops, and tap one to place it.
- **Cards:** troop and general cards are compact: name, type, level or rank, a coloured **rarity pill** (grey Common, blue Rare, purple Epic, gold Legendary) and a **power** number in the top-right corner. Details open on long-press or hover. Troops and generals not found yet show as a card with a large **?**.
- The Prologue is the only battle with a fixed army, and that army is built from the player's two starting troop types.
- Saved army presets are a later feature.
- An optional **"Historical challenge"** gives a fixed historical army and pays bonus coins.

## 6. Generals

### 6.1 Structure

| Field | Description |
|---|---|
| Rarity | Common, Rare, Epic, Legendary |
| Era | Flavor only. Any general can lead any army. |
| Rank | 1–10, from XP earned in battle |
| Command radius | 3 at rank 1, 4 at rank 4, 5 at rank 8 |
| Passive traits | 1–2 (for example "+10% cavalry impact") that scale with rank |
| Active skills | 1 at rank 1, a 2nd unlocked at rank 5. Each has a cooldown. |

**Rank-ups** raise passive values (for example, +10% at rank 1 grows to +20% at rank 10) and lower skill cooldowns.
**XP:** win 100, loss 30, plus bonuses for stars and kills.

### 6.2 Example roster

| General | Rarity | Passive | Active skill(s) |
|---|---|---|---|
| Captain (generic) | Common | +5% morale in radius | **Rally** — one routed unit in radius rallies to Disrupted |
| Centurion (generic) | Common | +5% infantry armor | **Hold Fast** — one unit gets +30% defense this turn |
| Leonidas | Rare | Infantry in radius +10% strength | **Hold the Line** — units in radius can't drop below Disrupted for 2 turns |
| Alexander | Legendary | Cavalry +10% impact | **Companion Charge** — the general's unit and adjacent cavalry may charge again this turn · **Hammer and Anvil** (rank 5) — flank bonus +50% for 2 turns |
| Hannibal | Legendary | Flank attacks +15% | **Ambush** — redeploy 2 units into any forest square before the battle · **Double Envelopment** (rank 5) |
| Julius Caesar | Epic | Infantry +5% strength, +rally chance | **Veni Vidi Vici** — all units in radius gain +1 cohesion level |
| Genghis Khan | Legendary | Light cavalry +3 MP | **Feigned Retreat** — evading units pull pursuers out of formation (they become Disrupted) |
| Joan of Arc | Epic | Morale +1 for the whole army | **Inspire** — heal 15 strength on all units in radius |
| Gonzalo Fernández de Córdoba | Epic | Gunpowder units +10% ranged | **Entrench** — build fieldworks in front of 3 units |
| Saladin | Epic | Units ignore heat penalties; light cavalry +10% | **Desert Mirage** — enemy ranged −50% for 1 turn |
| Gustavus Adolphus | Epic | Musketeers fire every turn (no Reload) | **Salvo** — every shooter in radius fires immediately |
| Napoleon | Legendary | +1 action to one unit per turn | **Grand Battery** — artillery +50% damage for 2 turns · **Imperial Guard** (rank 5) — one unit becomes immune to cohesion tests for 2 turns |
| Wellington | Epic | Units behind a hill crest take −30% ranged damage | **Reverse Slope** — hide units from enemy sight for 1 turn |
| Sun Tzu | Legendary | Sees through fog of war | **Know Your Enemy** — reveal enemy AI targets for next turn; −1 enemy morale |

## 7. Campaign: the ages

The campaign is a journey through history in two levels:

1. a **timeline** of ages;
2. inside each age, a **map** of its battles at their real locations.

Every battle is built around one clear historical "problem" (the terrain or scenario challenge).

### 7.1 Timeline screen

- One horizontal, scrollable **timeline** across a parchment strip, oldest on the left. An ink line runs through it with date ticks (1500 BC … 1900 AD).
- Each age is a large node on the line showing:
  - its name and date range;
  - a small emblem (laurel, crown, musket…);
  - **progress**: battles won out of total ("0/10 battles") and stars out of total ("0/30 ★").
- **Locked** ages are greyed out with a wax seal and their requirement ("Win every battle of Antiquity"). Ages whose content isn't built yet say "In preparation".
- On first launch, only **Age 0** is open. The timeline opens scrolled to the newest unlocked age.
- Unlocking an age is a moment: the seal cracks and the ink line extends to the new age (see the `motion` skill).

### 7.2 Age map screen

- A minimal parchment **map of the age's region**: flat land, sea and coastline in ink lines; a few labelled rivers and cities; no clutter. It is generated from public-domain Natural Earth data, simplified, and committed as static SVG.
- Each battle is a **node at its real location**, with:
  - its name and year;
  - its stars (☆☆☆ / ★★☆ …);
  - a lock showing the stars it needs ("🔒 4 ★").
- A dotted route line links battles in historical order.
- The header shows the age name and its progress: "Antiquity · 3/10 battles · 7/30 ★".
- Tapping an open node opens the briefing and army builder. Tapping a locked node says how many more stars are needed.

### 7.3 Unlock rules

- **Battles unlock by stars earned in that age.** The first two battles are always open. The rest need the age's star total to reach a threshold:

  | Battle # in age | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
  |---|---|---|---|---|---|---|---|---|---|---|---|---|
  | Stars needed | 0 | 0 | 1 | 2 | 4 | 6 | 8 | 10 | 14 | 18 | 22 | 26 |

  The thresholds are data per age, so they can be tuned.
- **The next age unlocks** when every battle in the current age has been **won** (at least ★). Three stars everywhere is not required.
- **Stars** (§4.8): ★ win; ★★ win losing under 30%; ★★★ also meet the battle's bonus condition. A battle keeps its best result. Replays can raise stars, and the extra stars count immediately toward unlocks.

### 7.4 Age 0: Dawn of War (tutorial)

Two guided battles, each with tutorial steps that advance when the player does the thing asked.

| # | Battle | Teaches | Army |
|---|---|---|---|
| 0.1 | **Megiddo, 1457 BC** (very easy) | Select, move, facing; why attacking a **flank** beats attacking the front; **support** (two units on one enemy); how armies break | Fixed: the player's 2 starting troop types plus Thutmose III for this battle |
| 0.2 | **Kadesh, 1274 BC** (easy) | **Choosing troops** in the army builder (slots; several copies of one type allowed); **ranged attacks** with archers; **using a general skill**; picking a general | Player's choice. The player gets archers and Thutmose for winning Megiddo. |

Winning both battles unlocks **Age 1: Antiquity** and grants its starter troops.

### 7.5 The ages

There are 10 ages, each with 10–12 battles. The battle list is a starting point; `add-battle` research may swap some.

| # | Age | Years | Battles |
|---|---|---|---|
| 0 | Dawn of War (tutorial) | 1500–1250 BC | Megiddo · Kadesh |
| 1 | **Antiquity** (Bronze Age to Alexander) | 860–320 BC | Qarqar (coalition vs Assyria) · Marathon (strong wings, weak centre) · Thermopylae (hold the pass) · Plataea · Leuctra (oblique attack) · Chaeronea · Granicus (river crossing) · Issus (coastal plain) · Gaugamela (wide plain, scythed chariots, find the gap) · Hydaspes (river crossing plus elephants) |
| 2 | Classical Empires (Rome and Carthage) | 280 BC–AD 378 | Heraclea · Trebia · Lake Trasimene (fog ambush, escape) · Cannae (double envelopment) · Zama (elephant lanes) · Cynoscephalae · Pydna · Carrhae · Alesia (two fronts) · Pharsalus · Teutoburg (forest ambush, survive) · Adrianople |
| 3 | Early Middle Ages | 451–1176 | Catalaunian Plains (hold the ridge) · Taginae · Yarmouk · Tours (shield wall vs cavalry) · Lechfeld · Stamford Bridge · Hastings (hill, feigned retreat) · Manzikert (don't get lured) · Dorylaeum · Legnano |
| 4 | High and Late Middle Ages | 1187–1410 | Hattin (heat, water) · Arsuf · Bouvines · Mohi (bridge assault) · Ain Jalut (feigned retreat) · Stirling Bridge (the bridge trap) · Bannockburn (bog and pits) · Crécy (longbows on the hill) · Poitiers · Agincourt (mud between woods) · Grunwald |
| 5 | Age of Exploration | 1476–1600 | Morat · Fornovo · Cerignola (arquebus behind a trench) · Ravenna · Marignano · Pavia · Otumba (strike the standard) · Mohács · Panipat · Nagashino · Sekigahara (fog, defections) |
| 6 | Pike and Shot | 1605–1683 | Kircholm · Klushino · White Mountain · Breitenfeld · Lützen · Nördlingen · Rocroi (the last tercios) · Marston Moor · Naseby · Vienna 1683 (hussar charge, reinforcements) |
| 7 | Linear Warfare | 1704–1781 | Blenheim (village strongpoints) · Poltava · Fontenoy · Plassey · Rossbach · Leuthen (oblique order behind hills) · Quebec · Saratoga · Guilford Courthouse · Cowpens |
| 8 | Napoleonic Wars | 1800–1815 | Marengo · Austerlitz (fog, Pratzen Heights) · Jena · Eylau · Friedland · Talavera · Wagram · Salamanca · Borodino (redoubts) · Leipzig · **Waterloo** (Hougoumont, La Haye Sainte, Prussians on turn 8) |
| 9 | Age of Rifles | 1854–1898 | Alma · Balaclava · Solferino · Bull Run · Antietam · Gettysburg · Königgrätz · Sedan · Little Bighorn · Isandlwana · Omdurman |

Each battle definition includes:
- map, deployment zones, and the enemy army and its general;
- AI posture, objectives, turn limit, weather and reinforcements;
- unit slots and the bonus star condition;
- briefing text (3–4 sentences of history plus the tactical problem);
- **map coordinates** (latitude/longitude) for its node on the age map.

**MVP content:** Age 0 (2 tutorial battles) plus Age 1 Antiquity (10 battles). Later ages show on the timeline as "In preparation" and are added as content only.

## 8. Economy and packs

- **Coins** (one soft currency).
  - Win, first time: 100 × age number, plus 50 per star.
  - Replay win: 30% of that.
  - Loss: 20 coins.
- **Shop:**
  - **Recruit Pack** (120 coins): 4 troop cards from unlocked ages, weighted toward the current age and toward types you already own.
  - **Veteran Pack** (400): 3 cards, at least one Rare+.
  - **General Pack** (600): 1 general, or an XP medal if you get a duplicate.
  - **Age Pack** (special): unlocks when you reach a new age and contains that age's signature units.
  - **Daily offer:** one specific unit or general at a fixed price, with no randomness.
- **Battle rewards include troop cards:** 2 cards for a first win, 1 for a replay win, none for a loss. Cards are drawn mostly from types you already own, so you can upgrade them.
- **Duplicates:** a duplicate troop card becomes a spare card for upgrading (see §5). A duplicate general becomes a **Medal** worth 500 XP for that general.
- **Pity:** a guaranteed Epic+ general in every 5 General Packs.
- **Monetization:** out of scope for the MVP. Design the economy so it is fully playable for free. Keep the shop code isolated so real-money purchases could be added later.

## 9. Touch controls and UX

Target device: a 10–11" tablet in landscape. It must also work on a 6" phone in landscape (auto-zoom, smaller maps).

| Gesture | Result |
|---|---|
| Tap own unit | Select it. Shows reachable squares (soft blue), charge targets (red outline) and shoot targets (crosshair). |
| Tap a reachable square | Shows a **ghost** of the unit at that square, with its path. Tap again to confirm (two-tap confirm prevents fat-finger mistakes). |
| After a move | A facing ring with 8 handles appears around the unit. Tap a handle, or tap elsewhere to keep the default facing (the direction of movement). |
| Tap an enemy that is a valid target | A **combat preview** panel shows expected losses for both sides and the chance of a cohesion drop, with Confirm and Cancel. |
| Long-press any unit | Full unit card (stats, tags, state). |
| One-finger drag on empty map | Pan. |
| Pinch | Zoom. |
| Buttons | **Undo** (last move, allowed only if no combat happened and nothing new was revealed), **Next unit** (cycles units that still have actions), **End turn**, **General skill**. |

- Minimum touch target is 44 pt. Buttons sit along the bottom corners within thumb reach.
- No hover-only information anywhere.
- Enemy turn plays back quickly, one move at a time, with a speed toggle (1×, 2×, skip).

## 10. Visual style

The inspiration is classic battle diagrams like the Waterloo and Gaugamela maps: flat, readable and handsome.

- **Map:** off-white or parchment background. Terrain is drawn as flat, soft shapes: green woods, blue river lines, thin contour lines for hills, grey blocks for villages, dotted roads. The grid is subtle (thin lines at low alpha) and gets stronger while a unit is selected.
- **Units:** colored **wide rectangles** (player blue, enemy red, configurable for color-blind players), about 80% of the square's width and 45% of its depth, rotated to their facing. The **long side is the front**, as in historical battle maps, and is drawn thicker.
- **Troop badges:** on each block sits a bold, upright **badge** that stands out from the plain blocks:
  - its **shape tells the role**: a heraldic shield for melee foot, a hexagon for missile troops, a circle for mounted troops, a rounded square for artillery;
  - it is filled with the side's colour, with a cream inner ring, a dark outline and a soft shadow;
  - inside is a chunky cream **pictogram** of the troop: spear, pike, sword and shield, bow, crossbow, javelins, horse head with lance (heavy) or with flowing mane (light), chariot, elephant, musket, cannon;
  - **level pips** (one per level above 1) run along its bottom edge.

  The same badge is the troop's icon in every screen (army builder, Army screen, shop, pack reveal, unit card). Under the block sit a **strength bar** and a **cohesion pip** (green, yellow, orange, red), both large enough to read at a glance on a phone.
- **States:** a Disrupted unit's rectangle gets a hatch pattern; Fragmented gets a heavier hatch; a Routed unit is **hollow, outline only** (like the white blocks in the Waterloo map), slightly faded, and its badge turns pale.
- **General:** the general's own unit has a banner badge with a gold ring and a small pennant with the general's name ("NEY 1600" style).
- **Movement:** big translucent **arrows**, like the ones in battle diagrams, show planned charges and the last turn's enemy moves.
- **Feedback:** short tweens only. A block slides; on impact it shakes; floating numbers show losses; a pulse shows a cohesion drop. Nothing heavier.
- **Typography:** one serif for titles (map-label feel) and one clean sans for UI.
- **Assets:** almost everything is drawn in code (vectors). Icons come from one SVG sprite sheet. Generals get a simple portrait medallion (a silhouette plus initials is enough for the MVP).

**Audio** (later): drums at turn start, a clash sound on impact, a horn for a rout, light ambient music per age.

## 11. Technical architecture (recommended)

- **Language:** TypeScript (strict).
- **Build:** Vite. **Tests:** Vitest.
- **Rendering:** PixiJS (WebGL canvas) for the battlefield: fast pan and zoom, crisp vectors. HTML/CSS overlay for menus, panels and buttons, using lightweight Preact or plain DOM.
- **Distribution:** start as a PWA in the browser (fast iteration on a real tablet). Wrap with Capacitor later for iOS and Android.
- **Persistence:** localStorage or IndexedDB behind a `SaveStore` interface, so Capacitor Preferences can replace it later.

### Layering (strict)

```
src/
  core/        Pure simulation. No DOM, no Pixi, no timers.
               Grid, pathfinding, LOS, rules, combat, morale, turn engine,
               victory, seeded RNG. Deterministic: same seed + same commands = same result.
  ai/          Enemy AI. Reads core state, outputs core commands.
  content/     Data only: units, generals, terrain, battles, ages (typed TS or JSON + schema).
  meta/        Campaign progress, economy, packs, XP, save/load.
  render/      Pixi battlefield view. Reads state, never mutates it. Plays animations from core events.
  ui/          Screens, panels, input → commands.
tests/         Unit tests for core/, ai/ and meta/.
```

- **Command pattern:** the UI and AI send commands (`Move`, `Rotate`, `Charge`, `Shoot`, `UseSkill`, `EndTurn`) to `core`. `core` validates them, applies them and emits **events** (`UnitMoved`, `DamageDealt`, `CohesionChanged`, `UnitRouted`, …). The renderer animates the events. This gives undo, replays, AI simulation, and easy tests.
- **Combat preview** calls the same combat functions with expected-value math, so the preview always matches the rules.
- **Content is data:** adding a battle or a unit means editing content files, not engine code.

## 12. Milestones

| Milestone | Goal | Done when |
|---|---|---|
| **M0** Scaffold | Vite + TS + Pixi + Vitest + lint, folder layout | `npm run dev` shows an empty map, `npm test` passes, CI-ready |
| **M1** Core sim | Grid, movement/ZOC/facing, combat, cohesion, rout, victory; seeded RNG; headless | Strong unit-test coverage. A scripted test battle runs headless to a result. |
| **M2** Playable board | Render map and units in the battle-map style; full touch controls; hot-seat 2 players | One sandbox battle is playable end to end on a tablet browser |
| **M3** AI + Prologue | Utility AI, Megiddo tutorial with guided steps | A new player can win the Prologue against the AI |
| **M4** Army & generals | Army builder (unit slots), deployment phase, generals with traits/skills/rank | Different generals and armies noticeably change how a battle plays |
| **M5** Meta | Timeline and age maps with star unlocks, coins, shop, packs, XP, save/load | The full loop works: battle → reward → pack → stronger army → next battle |
| **M6** Age 0 + Antiquity | 2 tutorial battles plus the 10 Antiquity battles, their units and generals | Age 0 teaches every core skill; Antiquity is complete, balanced and its star gates feel right |
| M7+ | One age per milestone, plus polish, audio, Capacitor builds | — |

## 13. Open questions

1. **Square vs hex grid.** This document picks squares (matches the block look and FoG2). Revisit after M2 playtests.
2. **Simultaneous vs alternating melee timing:** is end-of-turn resolution readable enough?
3. **Unit size:** should one square ever hold 2 units (a general's escort plus a unit)? Currently no.
4. **Phone portrait mode:** worth supporting, or landscape only?
5. **Player color:** always blue, or flip by scenario to match historical maps?
6. **Online features** (leaderboards, async PvP): explicitly out of scope for now.

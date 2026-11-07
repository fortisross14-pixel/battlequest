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
  - **One action**: Shoot, Charge, Skill (if it is the general's unit), Hold (brace and gain a defense bonus), or one of the unit's **tactical actions** (§4.12: Volley, Fortify, Full charge…).
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

### 4.12 Tactical actions (depth through choices)

Every unit can **Move**, use its **basic attack** (Shoot or Charge), and **Hold**. Better cards add **tactical actions**, which are real choices with trade-offs, not just bigger numbers. That keeps Commons simple and makes Rares, Epics and Legendaries feel different to play, not only stronger.

| Rarity | Actions |
|---|---|
| Common | Move, basic attack, Hold |
| Rare | + 1 signature action |
| Epic | + 1–2 signature actions |
| Legendary | + its signature actions, usually an upgraded version (for example a higher chance to break through on a Full charge) |

All numbers below are starting points in `RULES.actions`, and `balance-sim` tunes them.

**Volley** (area fire; Rare+ archers, and later every artillery unit as "Bombard").
- Instead of a focused shot, the shooter targets a **2×2 area**. Every **enemy** unit in it takes about **55% of a focused shot**. Hitting 1 unit is weaker than a normal shot; hitting 3–4 bunched units is much stronger (up to about 2.2× in total).
- At least one square of the area must be in range and in line of sight. The area can't contain a friendly unit (no friendly fire), and can't contain a melee involving a friend.
- Each unit hit makes its own cohesion test, with the lower damage.
- It counts as the unit's shot for Reload. Bombard also keeps Bounce.
- Effect on tactics: tight blocks become risky, and spacing your deployment matters.

**Fortify** (Rare+ spearmen and pikemen; shield walls in later ages).
- Costs **1 MP**. You can use it after moving if 1 MP is left, but not while in melee.
- It lasts until the unit moves, or until the end of the enemy's next turn.
- While fortified, the unit:
  - takes ×0.75 damage from every attack;
  - can't be pushed back;
  - stays braced against a frontal charge by cavalry or chariots, which deepens its anti-cavalry counter: the counter-impact is ×2, the charger's impact ×0.5, and the charger can never break through.
- A fortified unit can't charge on that turn.
- Fortify replaces Hold on units that have it. Hold stays the weaker brace that every unit has.
- The answer to a charge you can see coming: **fortified spears are a wall that charges break against.**

**Full charge** (Rare+ heavy cavalry; the Legendary versions are stronger).
- When charging, choose **Engage** (the normal charge, into melee) or **Full charge**. Full charge needs at least 2 squares of straight run-up and uses all remaining MP. It deals impact ×1.25.
- **Breakthrough chance.** The cavalry can pierce the unit and come out **on the square directly behind it, already turned to face the enemy's rear**, without being locked in melee.
  - The chance is 30% + 5% per point of the charger's impact above the defender's armor, +15% if the defender is Disrupted, +30% if Fragmented. It is −40%, and never possible, against a defender that is fortified or anti-cavalry and facing the charge. The total is capped at 75%, and the preview shows it.
  - Breaking through needs that square behind the defender to be free and passable.
- On a breakthrough, the defender makes an extra cohesion test (+0.25). Next turn the cavalry can hit it in the rear.
- On a failure, the charge is a normal impact and the cavalry is engaged. If it hit spears or pikes head on, the cavalry also loses one cohesion level ("broke on the spears").

**Other signature actions** (each belongs to specific named cards, as the add-unit skill assigns):

| Action | What it does | Example cards |
|---|---|---|
| **Testudo** | Costs 1 MP. Ranged damage taken ×0.4 until the unit moves. The unit can't attack that turn. | Roman legionaries, Legio X |
| **Pila volley** | One short-range volley per battle, just before a charge: the target starts the melee one cohesion level lower if it fails a test. This is the existing OneShot. | Roman legionaries |
| **Othismos (push)** | In melee: a shove that pushes the enemy back 1 square if it fails a strength check, breaking its line. | Spartan hoplites |
| **Parthian shot** | Shoot, then move back up to half MP, even out of a zone of control. | Parthian horse archers |
| **Feigned retreat** | Evade a charge on purpose: the pursuer is left Disrupted and out of position. | Carthaginian or steppe cavalry |
| **Trample** | An elephant's charge also damages the units on either side of the target, at 40%. | War elephants |
| **Last stand** | Once per battle: for 2 turns the unit can't rout, and its melee is ×1.2. | Theban Sacred Band |

**Rules for adding actions:**
- At most **3 actions per unit** besides Move and Hold. The command bubble and the attack preview must stay readable.
- Each action has an icon and a one-line description on the unit card.
- The AI must use the same actions, scored like any other move.
- Every action needs `balance-sim` duel checks. For example, fortified spears facing a heavy-cavalry Full charge must win at least 80% of the time, and a Volley on one isolated unit must never beat a focused shot.

## 5. Units and collection

The troop dynamic is **unlock and upgrade**, and every age has its own small **card ladder**: you start each age with plain, generic troops, then collect the famous named troops that make you feel powerful.

### 5.1 The card ladder (per age)

| Rarity | How many per age | Named? | Feel | Example (Antiquity) |
|---|---|---|---|---|
| **Common** | 4–5, one for each main troop role of the age | **No.** Generic: "Antiquity archers", "Antiquity cavalry" | Honest, plain. You can win the first battles with them, and you struggle later. | Antiquity spearmen · Antiquity archers · Antiquity skirmishers · Antiquity cavalry · Antiquity swordsmen |
| **Rare** | 3–4 | **Yes**: famous troops | A clear step up, with a specialty | Hoplites · Egyptian archers · Persian chariots · Cretan archers |
| **Epic** | 2 | Yes | Battle-winners in the right spot | Spartan hoplites · Persian Immortals |
| **Legendary** | 1, at most 2 | Yes, the age's icon | The power fantasy: battles that were hard become easy | **Myrmidons** (Antiquity) · Napoleon's **Imperial Guard** (Napoleonic Wars) |

That is about 11 troop cards per age and about 110 in the whole game. **Fewer, more meaningful cards.**

**Actions.** Rarity also unlocks tactical actions (§4.12): Commons have only the basics, while Rares, Epics and Legendaries add signature choices.

**Power.** At the same level, each rarity step is worth about +20–25% overall strength over the Common of its role:
- **Rare:** about +20%, plus a specialty tag;
- **Epic:** about +45%;
- **Legendary:** about +75%, plus one signature ability.

Balance works within an age. `balance-sim` checks the ladder: a full Common army should win the age's first battles about 70% of the time and its last battles about 20%; an army built around the Legendary troop should three-star most of the age.

**The intended feeling:**
1. You enter an age with generic Commons and struggle.
2. You open packs, find the Egyptian archers and Hoplites, and push further.
3. You pull the Myrmidons, go back, and three-star the battles that beat you.
4. The next age starts again with its own Commons, and the ladder repeats.

**Army limits** keep tactics in play even with strong cards: at most **1 Legendary** and **2 copies of each Epic** per army. Commons and Rares can fill any number of slots.

**Older troops in later ages.** You can always field any troop you own (the cross-era fantasy stays), but each age is a **power tier**. Troop stats scale with their age: a later age's Commons roughly match an earlier age's Epics. Myrmidons are a legend in Antiquity and a curiosity at Waterloo. Upgrades and generals can make an old favourite viable for a while, but every new age's ladder is the main path.

**Generals follow a ladder per age too:**
- **2 generic generals:** 1 Common and 1 **Uncommon** (for example "Antiquity captain" and "Antiquity veteran commander"). Uncommon is a rarity for generic generals only; troops don't use it, because levels already make a generic troop stronger.
- **5–8 named generals:** 2–3 Rare (Miltiades, Pericles…), 2–3 Epic (Leonidas, Darius…) and 1–2 Legendary (Alexander in Antiquity, Napoleon in the Napoleonic Wars).

**Enemy armies use the same cards.** A battle defines only the enemy army; the player always picks their own. Enemies use generic Commons by default and a named card only where that real elite troop existed. A strong historical army is shown with **higher levels and a higher general rank**, never with an invented troop: Troy's archers are Antiquity archers at level 3, not "Trojan archers". Meeting a named card as an enemy is also a teaser for collecting it.

### 5.2 Cards, levels and upgrades

- **Troop cards.** A troop type is **unlocked** the first time you get one of its cards. Once it is unlocked you can field copies of it, within the battle's unit slots and the army limits above.
- **Starting roster:** a new player owns **2 Common troop types**: the two units the Prologue battle uses. Each new age grants its Common troops when it unlocks. Rares, Epics and Legendaries come from packs, optional battles and milestones.
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
- **Era tag:** every unit belongs to an age, which sets its power tier (§5.1). Mixing eras is allowed.

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
| Rarity | Common, Uncommon (generic generals only), Rare, Epic, Legendary |
| Era | The age the general belongs to. It sets their power tier, as for troops (§5.1). Any general can lead any army. |
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

- **Main and optional battles.** Each age has a **main path** of 10–12 battles (the list in §7.5) plus 5–10 **optional battles** (see `docs/history/ROSTER.md`).
  - Main battles drive the age: their star gates are below, and winning all of them opens the next age.
  - Optional battles branch off a specific main battle on the age map. They open when that main battle is won.
  - Optional battles are never required to finish an age. They pay out rarer rewards (a specific troop card, a general, lore) and harder historical challenges.
  - Their stars count toward the age's star total, so they are another route to the main-path gates.
- **Main battles unlock by stars earned in that age.** The first two are always open. The rest need the age's star total to reach a threshold:

  | Battle # in age | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
  |---|---|---|---|---|---|---|---|---|---|---|---|---|
  | Stars needed | 0 | 0 | 1 | 2 | 4 | 6 | 8 | 10 | 14 | 18 | 22 | 26 |

  The thresholds are data per age, so they can be tuned.
- **The next age unlocks** when every **main** battle in the current age has been **won** (at least ★). Three stars everywhere is not required.
- **One tactical idea per battle.** Every battle has a `challengeType` (line and flank; pass, bridge or ford; river crossing; ambush and vision; hills and defensive ground; cavalry and pursuit; hold until reinforcements; strike the commander; desperate defence; attrition). Each age mixes several types, so that it never becomes ten versions of "break the army". Normally no battle adds a new mechanic, and never more than one.
- **Stars** (§4.8): ★ win; ★★ win losing under 30%; ★★★ also meet the battle's bonus condition. A battle keeps its best result. Replays can raise stars, and the extra stars count immediately toward unlocks.

### 7.4 Age 0: Dawn of War (tutorial)

Two guided battles, both fought with **generic Bronze Age Common troops** and the **generic Bronze Age Captain**. The named generals (Thutmose III, Ramesses II) appear in the briefings and history, not in the player's army.

Tutorial steps advance when the player does what is asked. Every step that points at a unit or square highlights **the exact one the step means**.

| # | Battle | How it plays | Teaches |
|---|---|---|---|
| 0.1 | **Megiddo** | **Almost impossible to lose.** The player has 3 units against 2 weak enemies (level 1, low morale) whose flanks already face the player's chariots. Script: select and move; charge a flank twice; End turn; the enemy counter-attacks weakly and breaks. Done in about 2–3 turns. | Select, move, facing, flank versus front, support (two units on one enemy), how an army breaks |
| 0.2 | **Kadesh** | **Easy, but it can be lost by playing badly** (turning a unit's back to the enemy, never charging with the chariots). The player's army is clearly stronger: about 4 units against 3, the enemy at level 1. Facing the enemy and attacking sensibly wins. Objective: break the enemy army (no hold-out timer). | Army builder (choose cards, copies allowed), shooting with archers, choosing a general, using a general skill |

Winning Megiddo grants a Common Bronze Age archers card for Kadesh. Winning both battles unlocks **Age 1: Antiquity**, grants its Common troops and generic generals, and pays enough coins for the first packs (§7.6).

### 7.6 Difficulty and progression curve (every age)

Each age repeats the same arc:

| Point in the age | Expected collection (from that age's ladder) | Target win rate |
|---|---|---|
| **Battle 1** | Commons only, plus the generic general | **About 50–60%.** Doable but not trivial: smart play wins. |
| | After the first packs (1–2 Rares and a named Rare general) | **About 90%.** Easy even without careful tactics. |
| **Battles 2–4** | A few Rares, some Lv2 | 75–90% |
| **Middle battles** | Rares at Lv2–3, maybe one Epic | 60–75%. Good matchups and positioning start to matter. |
| **Last 2–3 battles** | Epics, upgraded Rares, a strong general | **35–50%.** Real challenges that need top troops and strategy. With the Legendary and good play, 80%+. |
| **Optional battles** | as for the main battle they branch from | 10–20 points harder than that battle |

**Economy pacing that makes the arc work:**
- When an age opens, the player can afford roughly **2 Recruit Packs and 1 General Pack** for that age, from the previous age's rewards plus an age-unlock coin bonus.
- The **first Recruit Pack** bought in each age guarantees a Rare troop. The **first General Pack** in each age guarantees a named Rare general or better.
- After that, coins from the age's battles fund about one pack per 1–2 wins. Upgrades compete for the same coins, which is a deliberate choice.
- `balance-sim` gets a **progression** mode: a simulated player clears an age in order, buying packs and upgrades with a simple policy. It checks the affordability points and the win-rate targets in the table above.

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
| 9 | Age of Rifles | 1854–1898 | Alma · Balaclava · Solferino · Bull Run · Antietam · Gettysburg · Königgrätz · Sedan · Little Bighorn · Isandlwana · Adwa (Ethiopian forces coordinating in the hills) |

Each battle definition includes:
- map, deployment zones, and the enemy army and its general;
- AI posture, objectives, turn limit, weather and reinforcements;
- unit slots and the bonus star condition;
- briefing text (3–4 sentences of history plus the tactical problem);
- **map coordinates** (latitude/longitude) for its node on the age map.

Age 9 swapped Omdurman (a one-sided massacre that makes a poor puzzle) for Adwa; Omdurman stays in the roster as optional, pending the history brief's sensitivity notes.

The main path above is fixed for planning. The full roster of main and optional battles, about 160 in all, is in `docs/history/ROSTER.md`.

**MVP content:** Age 0 (2 tutorial battles) plus Age 1 Antiquity (10 main battles; its optional battles can follow). Later ages show on the timeline as "In preparation" and are added as content only.

## 8. Economy and packs

- **Coins** (one soft currency).
  - Win, first time: 100 × (age number + 1), plus 50 per star.
  - **Age unlock bonus:** enough coins, together with the age's earlier rewards, for the first packs of the new age (§7.6).
  - Replay win: 30% of that.
  - Loss: 20 coins.
- **Shop:**
  - **Packs are per age.** Each age's shop tab sells packs drawn only from that age's ladder, so you always know what you are chasing.
  - **Recruit Pack** (120 coins): 4 troop cards from the chosen age, mostly Common, with a chance of Rare or better.
  - **Veteran Pack** (400): 3 cards, at least one Rare+.
  - **General Pack** (about 250 in Age 1, rising by age): 1 general from the chosen age's ladder, or an XP medal if you get a duplicate.
  - **First pack guarantees** in each age: the first Recruit Pack holds at least one Rare; the first General Pack holds a named Rare general or better.
  - **Age Pack** (special): unlocks when you reach a new age and contains that age's signature units.
  - **Daily offer:** one specific unit or general at a fixed price, with no randomness.
- **Battle rewards include troop cards:** 2 cards for a first win, 1 for a replay win, none for a loss. Cards are drawn mostly from types you already own, so you can upgrade them.
- **Duplicates:** a duplicate troop card becomes a spare card for upgrading (see §5). A duplicate general becomes a **Medal** worth 500 XP for that general.
- **Pity:** a guaranteed Epic+ general in every 5 General Packs.
- **A guaranteed road to each age's Legendary troop:** one copy is granted by reaching about 70% of the age's main-path stars, or by a final optional battle. A lucky pack can deliver it sooner.
- **Monetization:** out of scope for the MVP. Design the economy so it is fully playable for free. Keep the shop code isolated so real-money purchases could be added later.

## 9. Touch controls and UX

Target device: a 10–11" tablet in landscape. It must also work on a 6" phone in landscape (auto-zoom, smaller maps).

**The full spec is `docs/UX_PRESENTATION.md`.** In short:
- **Tap your unit:** a **command bubble** blooms around it, with petals for Info, Turn, Hold, the general's Skill and Undo.
- **Moving is the default:** tap any reachable square to see the move ghost, then tap it again (or double-tap) to confirm.
- **Tap an enemy:** the attack preview opens; tap again to confirm.
- **Long-press:** unit card. **Drag on empty map:** pan. **Pinch:** zoom.
- **The HUD lives in reserved zones** (top bar, guidance strip, bottom corners), so nothing covers the battlefield.
- **The ☰ battle menu** has Resume, Restart battle, Objectives, Settings, How to play and Retreat.
- Every interaction is animated with GSAP, is interruptible and never blocks input.

Rules that still hold:
- Minimum touch target is 44 pt. No information is available only on hover.
- Enemy turn plays back one move at a time, with a speed chip (1×, 2×, skip).
- Undo is allowed only for moves and turns with no combat and nothing new revealed.

## 10. Visual style

Presentation, materials, motion and menus are specified in `docs/UX_PRESENTATION.md`; this section sets the base look.

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

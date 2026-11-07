# History brief template

Write one file per age: `docs/history/age-NN-<slug>.md` (for example `age-01-antiquity.md`). Each file has four parts, in this order:

1. the age;
2. its troops;
3. its generals;
4. its battles.

Every entity is a fenced `yaml` block, so the build agent can convert it straight into game data. Notes for humans go outside the blocks.

**Write the content in English** (the game's language).

**The card ladder (GAME_DESIGN §5.1). Every age has exactly this set of playable cards:**
- **Troops:** 4–5 **Common** troops that are unnamed and generic ("Antiquity archers"), one per main role; 3–4 **Rare** famous named troops; 2 **Epic**; and **1 Legendary**, the age's icon (at most 2).
- **Generals:** 1–2 generic Commons ("Antiquity captain"), 2–3 named Rares or Epics, and **1 Legendary**.

Enemy armies are built from the same ladder (enemy-only names are fine for flavour: set `playable: false` and use the archetype). Don't create a separate troop for every faction. If a battle's history needs a troop the ladder doesn't have, use the closest card and explain it in the battle's notes.

**Accuracy rules**
- Don't invent facts. If something is disputed (numbers, exact location, who commanded), give the most accepted value and explain the dispute in `uncertainty`.
- Every battle and general lists at least 2 reliable `sources`: academic works, reputable encyclopedias, or primary sources in translation.
- Game suggestions (traits, skills, difficulty, map sketches) are *suggestions*. The build agent balances them later with `balance-sim`.

---

## 1. Age

```yaml
age:
  number: 1
  id: antiquity
  name: Antiquity
  subtitle: From the Bronze Age to Alexander
  years: "860–320 BC"
  region:                         # map bounds for the age map (degrees)
    north: 45.0
    south: 25.0
    west: 10.0
    east: 80.0
  emblem: "Laurel wreath around a hoplite helmet"   # idea for a small flat icon
  intro: >                        # 2–3 sentences shown on the timeline
    ...
  ladder:                         # the age's playable cards (see the card ladder rules above)
    common: [antiquitySpearmen, antiquityArchers, antiquitySkirmishers, antiquityCavalry, antiquitySwordsmen]
    rare: [hoplites, egyptianArchers, persianChariots, cretanArchers]
    epic: [spartanHoplites, persianImmortals]
    legendary: [myrmidons]
    generals: { common: [antiquityCaptain], rareEpic: [leonidas, miltiades, darius1], legendary: [alexander] }
  newMechanics:                   # anything the current rules can't express (see the vocabulary below)
    - name: Elephants frighten horses
      needed_for: [hydaspes]
      description: >
        ...
  sensitivities: >                # anything that needs care (colonial wars, massacres, living traditions); empty if none
    ...
```

## 2. Troops (one block per troop type available in this age)

```yaml
troop:
  id: macedonianPhalanx           # camelCase, unique across the game
  name: Macedonian phalanx
  faction: Macedon
  archetype: pikemen              # one of the 13 archetypes (vocabulary below)
  rarity: rare                    # common | rare | epic | legendary
  playable: true                  # false = enemy only
  history: >                      # 2–3 sentences: equipment, how they fought, where they were decisive
    ...
  distinctive: >                  # what made them different from the plain archetype
    ...
  suggestedModifiers:             # at most ±1 on two stats: melee, impact, ranged, armor, morale, mp
    morale: +1
    armor: -1
  suggestedTags: [AntiCavalryStrong, FrontOnly]   # from the vocabulary, or new ones explained in `distinctive`
  flavor: "Sarissas 6 metres long: a hedge no horse would face."   # one line for the unit card
  iconHint: "Two long crossed pikes"              # idea for the pictogram
```

## 3. Generals (playable and enemy)

```yaml
general:
  id: alexander
  name: Alexander the Great
  pennant: ALEXANDER              # at most 10 capital letters
  lived: "356–323 BC"
  faction: Macedon
  rarity: legendary               # based on fame and impact
  playable: true                  # false = enemy only
  bio: >                          # 2 sentences
    ...
  style: >                        # how they actually won battles; this is the basis for the trait and skills
    ...
  suggestedTrait:                 # a permanent bonus, in game terms
    text: "Cavalry +10% impact"
    targets: cavalry              # all | infantry | cavalry | ranged | a troop id
    stat: impact
    strength: medium              # small | medium | large
  suggestedSkills:                # 1 or 2, each grounded in a real tactic
    - name: Companion Charge
      historicalBasis: "Gaugamela: the wedge charge into the gap in Darius' line"
      effect: >
        The general's unit and adjacent cavalry may charge again this turn.
      existingEffect: none        # rally | holdFast | heal | cohesionUp | holdTheLine | flankBoost | none (= new mechanic)
  quote: "..."                    # optional, only if well attested; give its source
  portraitHint: "Profile with lion-scalp helmet, as on his coins"
  sources: [...]
```

## 4. Battles (in historical order, 10–12 per age)

```yaml
battle:
  id: gaugamela
  name: Gaugamela
  date: "1 October 331 BC"
  orderInAge: 9                   # historical order; it also sets the star gate (later = harder)
  node: main                      # main | optional (see ROSTER.md)
  branchesFrom: null              # optional battles only: the id of the main battle it opens after
  reward: null                    # optional battles only: e.g. "card: immortals ×2" or "general: cyrusYounger"
  challengeType: holdUntilReinforcements   # one of the types listed in the vocabulary below
  location:
    modernPlace: "near Mosul, Iraq"
    lat: 36.36
    lon: 43.25
    uncertainty: "exact site disputed (Tell Gomel)"
  sides:
    player:                       # usually the historical victor; say so if the underdog makes a better puzzle
      faction: Macedon
      commander: alexander
      strength: "~47,000"
      composition:                # proportions by archetype, not exact numbers
        pikemen: 40%
        heavyCavalry: 15%
        lightCavalry: 10%
        skirmishers: 20%
        spearmen: 15%
    enemy:
      faction: Achaemenid Persia
      commander: darius3
      strength: "~100,000 (ancient sources claim far more)"
      composition:
        heavyCavalry: 25%
        lightCavalry: 20%
        chariots: 5%              # scythed chariots
        spearmen: 30%
        archers: 15%
        warElephants: 5%
  whatHappened: >                 # 4–6 sentences: deployment, phases, the turning point, the result
    ...
  decisiveFactor: >               # one sentence: why the winner won
    ...
  problem: "Survive the outflanking cavalry until a gap opens in the Persian line, then strike the gap."   # the puzzle in one sentence
  terrain: >                      # short description
    Wide, flat plain levelled by the Persians for their chariots; low rough ground on the far flanks.
  mapSketch: |                    # optional, about 16 columns × 10 rows; the player deploys on the west (left)
    ................
    ..r..........r..
    AA.........EEEE.
    AA.........EEEE.
    AA.........EEEE.
    ................
  mapLegend: ". open  r rough  F forest  H hill  ~ river  f ford  B bridge  M marsh  V village  W fieldworks  = road  A player deployment  E enemy deployment"
  conditions:                     # anything that changes the rules for this battle
    weather: clear                # clear | rain | fog | heat
    fogOfWar: false
    reinforcements: []            # e.g. [{ side: enemy, turn: 6, troops: "2 cavalry from the north edge" }]
    special: []                   # e.g. "night", "ambush", "enemy starts disordered"
  objective:
    type: breakArmy               # breakArmy | holdOut | killGeneral | escape | holdPoint
    detail: ""                    # e.g. "hold the pass for 10 turns"
  bonusStarIdea: "Win by routing the enemy general's unit"   # rewards fighting it the historical way
  difficulty: 4                   # 1–5 within this age
  briefing: >                     # 3–4 sentences, vivid, second person, ending with one tactical hint
    ...
  didYouKnow: "..."               # optional one-line fact for the loading screen
  sources: [...]
```

---

## Vocabulary (what the game can already express)

**Archetypes:** `skirmishers`, `archers`, `crossbowmen`, `spearmen`, `heavySwordsmen`, `pikemen`, `lightCavalry`, `heavyCavalry`, `chariots`, `warElephants`, `arquebusiers`, `lineInfantry`, `fieldArtillery`.

**Tags:** Evade, LightTurn, RoughTerrainOK, RoughTerrainBad, RoughTerrainVeryBad, ArmorPiercing, NoMoveAndShoot, AntiCavalry, AntiCavalryStrong, FrontOnly, FlankVulnerable, OneShot (a single volley, like pila), Reload, Charge, Pursue, ScaresHorses, Stampede, RainPenalty, Formations, HelplessInMelee, Bounce. If none fits, describe the new behaviour in plain words.

**Terrain:** open, rough, forest, hill, river, ford, bridge, marsh, village, fieldworks, road.

**Objectives:** breakArmy, holdOut, killGeneral, escape, holdPoint.

**Challenge types** (one per battle, mixed within each age): lineAndFlank, passBridgeOrFord, riverCrossing, ambushAndVision, hillsAndDefence, cavalryAndPursuit, holdUntilReinforcements, strikeTheCommander, desperateDefence, attrition.

**General skill effects already built:** rally, holdFast, heal, cohesionUp, holdTheLine, flankBoost. Anything else is a new mechanic: describe it in `effect` and set `existingEffect: none`.

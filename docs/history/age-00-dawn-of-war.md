# Age 0: Dawn of War

```yaml
age:
  number: 0
  name: Dawn of War
  years: "c. 1500–1274 BC"
  region: { north: 37, south: 23, west: 28, east: 38 }
  intro: "Before cavalry and legions, kings fought with infantry, composite bows and chariots. These two tutorials introduce manoeuvre and command through the earliest detailed surviving battle accounts, while treating royal propaganda with care."
  sensitivities: "Megiddo and Kadesh are preserved chiefly through Egyptian royal accounts. Their claims of victory, exact army sizes, casualty figures and personal heroism are not neutral evidence."
  newMechanics: []
```

## Ladder

```yaml
ladder:
  troops:
    - { id: bronzeAgeSpearmen, rarity: common, playable: true }
    - { id: bronzeAgeArchers, rarity: common, playable: true }
    - { id: bronzeAgeChariots, rarity: common, playable: true }
  generals:
    - { id: bronzeAgeCaptain, rarity: common, playable: true }
    - { id: thutmoseIII, rarity: rare, playable: true }
    - { id: kingOfKadesh, rarity: rare, playable: false }
    - { id: ramessesII, rarity: epic, playable: true }
    - { id: muwatalliII, rarity: epic, playable: false }
```

## Troops

```yaml
troop:
  id: bronzeAgeSpearmen
  name: Bronze Age spearmen
  faction: "New Kingdom Egypt and Levantine kingdoms"
  archetype: spearmen
  rarity: common
  playable: true
  history: "New Kingdom armies combined infantry, archers and chariots. Spearmen guarded camps and held the ground required by chariots, but were not later pike formations."
  modifiers: { armor: -1, mp: +1 }
  flavor: "Shield and spear: the ground beneath the chariots."
  iconHint: "Round-topped shield crossed by a bronze spear"
```

```yaml
troop:
  id: bronzeAgeArchers
  name: Bronze Age archers
  faction: "New Kingdom Egypt and Levantine kingdoms"
  archetype: archers
  rarity: common
  playable: true
  history: "The composite bow was a major Egyptian weapon both on foot and from chariots. Archers supported manoeuvre but suffered if caught in close combat."
  modifiers: {}
  flavor: "Composite-bow volleys before the clash."
  iconHint: "Recurved bow"
```

```yaml
troop:
  id: bronzeAgeChariots
  name: Bronze Age chariots
  faction: "New Kingdom Egypt, Hatti and Levantine kingdoms"
  archetype: chariots
  rarity: common
  playable: true
  history: "Chariots were elite vehicles whose exact design and crew varied by army. They needed firm, open ground and combined speed, missile fire and shock rather than functioning as later cavalry."
  modifiers: { ranged: +1, impact: -1 }
  flavor: "Fast wheels, open ground, and a decisive flank."
  iconHint: "Two-spoked wheel and drawn bow"
```

## Generals

```yaml
general:
  id: bronzeAgeCaptain
  name: Bronze Age Captain
  pennant: CAPTAIN
  lived: "not a named historical individual"
  faction: "New Kingdom Egypt"
  rarity: common
  playable: true
  bio: "This is a tutorial representative of the Egyptian officer corps, not an invented historical individual. It lets Kadesh teach general selection without attaching a false biography to a real person."
  style: "Keeps nearby infantry steady under pressure."
  trait: "Infantry +5% morale"
  skills:
    - { name: Rally, historicalBasis: "A generic command abstraction; not attributed to an individual.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Anthony J. Spalinger, War in Ancient Egypt (2005).", "Richard A. Gabriel, The Culture of War: Invention and Early Development (1990)."]
```

```yaml
general:
  id: thutmoseIII
  name: Thutmose III
  pennant: THUTMOSE
  lived: "c. 1504–1450 BC"
  faction: "New Kingdom Egypt"
  rarity: rare
  playable: true
  bio: "Thutmose III led Egypt's first major Asiatic campaign after Hatshepsut's death. The Karnak annals present him as the active commander of the march through Aruna and the battle before Megiddo."
  style: "Accepts operational risk to obtain surprise and strike before an enemy can organise."
  trait: "Chariots +10% impact"
  skills:
    - { name: Pharaoh's Command, historicalBasis: "The Megiddo narrative repeatedly places the king at the head of his army.", effect: "All units in command radius improve one cohesion level.", existingEffect: cohesionUp }
  sources: ["James H. Breasted, Ancient Records of Egypt, vol. II (1906), §§420–451.", "Donald B. Redford, The Wars in Syria and Palestine of Thutmose III (2003)."]
```

```yaml
general:
  id: kingOfKadesh
  name: King of Kadesh
  pennant: KADESH
  lived: "unknown"
  faction: "Canaanite city-state coalition"
  rarity: rare
  playable: false
  bio: "The Egyptian account names the ruler of Kadesh as the leading opponent at Megiddo but does not securely preserve a personal name. This title avoids creating a fictitious identity."
  style: "Commands a coalition whose prepared field position is upset by surprise."
  trait: "Army +5% morale"
  skills: []
  sources: ["James H. Breasted, Ancient Records of Egypt, vol. II (1906), §§420–451.", "Donald B. Redford, The Wars in Syria and Palestine of Thutmose III (2003)."]
```

```yaml
general:
  id: ramessesII
  name: Ramesses II
  pennant: RAMESSES
  lived: "c. 1279–1213 BC"
  faction: "New Kingdom Egypt"
  rarity: epic
  playable: true
  bio: "Ramesses II led Egypt's expedition against Kadesh in his fifth regnal year. His monuments portray a personal victory, while modern scholarship treats the battle as a costly recovery from surprise without the capture of Kadesh."
  style: "Rallies a threatened position and buys time for separated forces to close up."
  trait: "Units in command radius +10% morale"
  skills:
    - { name: Rally at the Camp, historicalBasis: "Egyptian accounts credit Ramesses with restoring resistance during the chariot crisis.", effect: "One routed or Fragmented unit in command radius improves one cohesion level.", existingEffect: rally }
  sources: ["William J. Murnane, The Road to Kadesh (1990).", "Kenneth A. Kitchen, Pharaoh Triumphant (1982)."]
```

```yaml
general:
  id: muwatalliII
  name: Muwatalli II
  pennant: MUWATALLI
  lived: "died c. 1272 BC"
  faction: "Hittite Empire"
  rarity: epic
  playable: false
  bio: "Muwatalli II assembled the Hittite-led force opposing Ramesses at Kadesh. He concealed the main army while chariots struck the separated Egyptian divisions."
  style: "Uses concealment and a concentrated opening blow, but cannot convert surprise into complete destruction."
  trait: "Chariots +10% impact"
  skills:
    - { name: Concealed Chariot Strike, historicalBasis: "The Egyptian divisions were deceived about the Hittite position before the chariot assault.", effect: "One enemy unit begins Disrupted.", existingEffect: none }
  sources: ["Trevor Bryce, The Kingdom of the Hittites, 2nd ed. (2005).", "William J. Murnane, The Road to Kadesh (1990)."]
```

## Battles

```yaml
battle:
  id: megiddo
  name: Megiddo
  date: "Year 23 of Thutmose III; commonly c. 1457 BC"
  orderInAge: 1
  node: main
  branchesFrom: null
  reward: null
  challengeType: lineAndFlank
  location: { modernPlace: "Tel Megiddo, Israel", lat: 32.584, lon: 35.185, uncertainty: "The campaign route and broad area are reconstructed from the Karnak annals; exact field positions and both army totals are unknown." }
  player:
    faction: "New Kingdom Egypt"
    commander: thutmoseIII
    generalRank: 1
    strength: "unknown"
    composition: { spearmen: "45%", archers: "25%", chariots: "30%" }
    units:
      - { card: bronzeAgeSpearmen, level: 1 }
      - { card: bronzeAgeChariots, level: 1 }
  enemy:
    faction: "Canaanite city-state coalition"
    commander: kingOfKadesh
    generalRank: 1
    strength: "unknown"
    composition: { spearmen: "50%", archers: "20%", chariots: "30%" }
    units:
      - { card: bronzeAgeSpearmen, level: 1, role: "centre" }
      - { card: bronzeAgeSpearmen, level: 1, role: "exposed wing" }
      - { card: bronzeAgeChariots, level: 1, role: "reserve" }
  whatHappened: "A coalition centred on Kadesh and Megiddo challenged Egyptian authority in the southern Levant. Thutmose took the narrow Aruna pass rather than safer approaches and emerged unexpectedly near Megiddo. The coalition lost the field and fled into the city, while Egyptian troops stopped to plunder. The later siege is deliberately outside this tutorial."
  decisiveFactor: "Operational surprise through Aruna denied the coalition a prepared deployment."
  problem: "Turn the exposed Canaanite flank before its line can face the Egyptian advance."
  terrain: "Open ground near Megiddo, with rough hill-country approaches abstracting the exit from Aruna."
  mapSketch: |
    ................
    ......rr........
    .AAA......EEE...
    .AAA......EEE...
    .AAA......EEE...
    ................
    ................
    ................
    ................
    ................
  # legend: . open  r rough  F forest  H hill  ~ river  f ford  B bridge  M marsh  V village  W fieldworks  = road  A player  E enemy
  conditions: { weather: clear, fogOfWar: false, reinforcements: [], special: ["Tutorial steps: select a unit, move, face, attack a flank, add support, break an army."] }
  objective: { type: breakArmy, detail: "Break the coalition's field force; the siege of Megiddo is not represented." }
  bonusStar: "Win by the end of turn 6."
  difficulty: 1
  briefing: "You have cleared the Aruna pass before the Canaanite kings can turn their line. Megiddo is close, but their army still blocks the plain. Keep your spearmen facing forward and use the chariot to attack the exposed flank."
  didYouKnow: "The Karnak annals are among the earliest detailed surviving records of a military campaign."
  sources: ["James H. Breasted, Ancient Records of Egypt, vol. II (1906), §§420–451.", "Donald B. Redford, The Wars in Syria and Palestine of Thutmose III (2003)."]
```

```yaml
battle:
  id: kadesh
  name: Kadesh
  date: "Year 5 of Ramesses II; commonly 1274 BC"
  orderInAge: 2
  node: main
  branchesFrom: null
  reward: null
  challengeType: holdUntilReinforcements
  location: { modernPlace: "Tell Nebi Mend, Syria", lat: 34.557, lon: 36.515, uncertainty: "The identification is widely accepted, but the exact sequence, unit positions and numbers depend heavily on Egyptian royal accounts." }
  player:
    faction: "New Kingdom Egypt"
    commander: ramessesII
    generalRank: 1
    strength: "probably tens of thousands; exact total disputed"
    composition: { spearmen: "40%", archers: "25%", chariots: "35%" }
    units:
      - { card: bronzeAgeSpearmen, level: 1 }
      - { card: bronzeAgeArchers, level: 1 }
      - { card: bronzeAgeChariots, level: 1 }
  enemy:
    faction: "Hittite Empire and allies"
    commander: muwatalliII
    generalRank: 2
    strength: "probably comparable in broad scale; disputed"
    composition: { spearmen: "35%", archers: "15%", chariots: "50%" }
    units:
      - { card: bronzeAgeChariots, level: 2, role: "opening attack" }
      - { card: bronzeAgeChariots, level: 2, role: "opening attack" }
      - { card: bronzeAgeSpearmen, level: 1, role: "support" }
      - { card: bronzeAgeArchers, level: 1, role: "support" }
  whatHappened: "Ramesses advanced toward Kadesh with his divisions separated and accepted false reports that Muwatalli was far away. Hittite chariots crossed the Orontes, shattered the approaching Re division and struck the Egyptian camp. Ramesses' troops resisted and further Egyptian forces arrived. Kadesh remained in the Hittite sphere, so this is a survival scenario rather than a claim of Egyptian conquest."
  decisiveFactor: "The Egyptian camp held long enough for resistance and reinforcements to prevent decisive Hittite destruction."
  problem: "Choose a force that can defend the camp, use archers before contact, and keep the general alive until the line recovers."
  terrain: "A river-crossing environment around Kadesh on the Orontes; the map abstracts the camp and fords rather than claiming an exact reconstruction."
  mapSketch: |
    ........~.......
    ........~.......
    .AAA....f..EEE..
    .AAA....~..EEE..
    .AAA....~..EEE..
    .AAA....f..EEE..
    ........~.......
    ........~.......
    ................
    ................
  # legend: . open  r rough  F forest  H hill  ~ river  f ford  B bridge  M marsh  V village  W fieldworks  = road  A player  E enemy
  conditions: { weather: clear, fogOfWar: false, reinforcements: [{ side: player, turn: 4, troops: "One Bronze Age spearmen block from the south edge, level 1." }], special: ["Tutorial steps: choose three cards, shoot with archers, assign Ramesses, use Rally at the Camp."] }
  objective: { type: holdOut, detail: "Keep the Egyptian army unbroken for 5 turns." }
  bonusStar: "Keep Ramesses' unit alive and end with no player unit Routed."
  difficulty: 2
  briefing: "False reports have left Ramesses' camp exposed beside the Orontes. Hittite chariots are crossing while the Egyptian army is still closing up. Choose a balanced force, put spears on the approaches, and rally a unit before one rout becomes many."
  didYouKnow: "The Egyptian account survives in several monumental versions, including the Poem, Bulletin and reliefs."
  sources: ["William J. Murnane, The Road to Kadesh (1990).", "Kenneth A. Kitchen, Pharaoh Triumphant (1982).", "James H. Breasted, Ancient Records of Egypt, vol. III (1906), §§298–350."]
```

## Notes

- **Swaps:** None.
- **Uncertain facts:** Megiddo's exact battlefield deployment and army size; Kadesh's exact chronology, Hittite chariot numbers, unit positions and final tactical result.
- **Questions for the owner:** Should Ramesses be the fixed Kadesh tutorial general, or should the player select between Ramesses and the generic Bronze Age Captain after completing Megiddo? The latter teaches selection more explicitly; the former is cleaner historically.

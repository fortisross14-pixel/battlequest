# Age 4: High and Late Middle Ages



```yaml

age:

  number: 4

  name: "High and Late Middle Ages"

  years: "1187–1415"

  region: { north: 59, south: 28, west: -11, east: 90 }

  intro: "Crusader states, royal armies and steppe empires fought with cavalry, missile troops and increasingly deliberate defensive ground."

  sensitivities: "Avoid treating crusading, Islamic and steppe societies as monolithic. National narratives frequently magnify these battles."

  newMechanics: []

```



## Ladder



```yaml

ladder:

  troops:

    - { id: medievalSpearmen, rarity: common, playable: true }

    - { id: medievalArchers, rarity: common, playable: true }

    - { id: medievalCrossbowmen, rarity: common, playable: true }

    - { id: medievalLightCavalry, rarity: common, playable: true }

    - { id: feudalKnights, rarity: rare, playable: true }

    - { id: mamlukCavalry, rarity: rare, playable: true }

    - { id: scottishSchiltron, rarity: rare, playable: true }

    - { id: longbowmen, rarity: rare, playable: true }

    - { id: dismountedMenAtArms, rarity: epic, playable: true }

    - { id: mongolHorseArchers, rarity: epic, playable: true }

    - { id: englishLongbowElite, rarity: legendary, playable: true }

  generals:

    - { id: medievalCaptain, rarity: common, playable: true }

    - { id: medievalMarshal, rarity: uncommon, playable: true }

    - { id: saladin, rarity: legendary, playable: true }

    - { id: richardI, rarity: legendary, playable: true }

    - { id: philipAugustus, rarity: epic, playable: true }

    - { id: subutai, rarity: legendary, playable: true }

    - { id: baibars, rarity: epic, playable: true }

    - { id: williamWallace, rarity: rare, playable: true }

    - { id: robertBruce, rarity: epic, playable: true }

    - { id: edwardIII, rarity: epic, playable: true }

    - { id: blackPrince, rarity: epic, playable: true }

    - { id: jogaila, rarity: epic, playable: true }

    - { id: henryV, rarity: legendary, playable: true }

    - { id: alexanderNevsky, rarity: rare, playable: true }

    - { id: ivanDonskoy, rarity: rare, playable: true }

    - { id: joaoI, rarity: rare, playable: true }

    - { id: bayezidI, rarity: epic, playable: true }

    - { id: timur, rarity: legendary, playable: true }

```



## Troops



```yaml
troop:
  id: medievalSpearmen
  name: "Medieval spearmen"
  faction: "European and Near Eastern armies"
  archetype: spearmen
  rarity: common
  playable: true
  history: "Medieval spearmen represent a historically attested battlefield role in European and Near Eastern armies forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { armor: +1 }
  flavor: "A firm hedge of spears."
  iconHint: "Spear and shield"
```

```yaml
troop:
  id: medievalArchers
  name: "Medieval archers"
  faction: "European and Near Eastern armies"
  archetype: archers
  rarity: common
  playable: true
  history: "Medieval archers represent a historically attested battlefield role in European and Near Eastern armies forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: {}
  flavor: "Missiles create time."
  iconHint: "Bow"
```

```yaml
troop:
  id: medievalCrossbowmen
  name: "Medieval crossbowmen"
  faction: "Mediterranean armies"
  archetype: crossbowmen
  rarity: common
  playable: true
  history: "Medieval crossbowmen represent a historically attested battlefield role in Mediterranean armies forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { armor: +1, mp: -1 }
  flavor: "Slow to reload, hard to ignore."
  iconHint: "Crossbow"
```

```yaml
troop:
  id: medievalLightCavalry
  name: "Medieval light cavalry"
  faction: "Steppe and Mediterranean armies"
  archetype: lightCavalry
  rarity: common
  playable: true
  history: "Medieval light cavalry represent a historically attested battlefield role in Steppe and Mediterranean armies forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: {}
  flavor: "Probe, raid, return."
  iconHint: "Horse and lance"
```

```yaml
troop:
  id: feudalKnights
  name: "Feudal knights"
  faction: "Western European armies"
  archetype: heavyCavalry
  rarity: rare
  playable: true
  history: "Feudal knights represent a historically attested battlefield role in Western European armies forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { impact: +1, morale: +1 }
  flavor: "A charge is not a plan."
  iconHint: "Lance and great helm"
```

```yaml
troop:
  id: mamlukCavalry
  name: "Mamluk cavalry"
  faction: "Mamluk Sultanate"
  archetype: heavyCavalry
  rarity: rare
  playable: true
  history: "Mamluk cavalry represent a historically attested battlefield role in Mamluk Sultanate forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { armor: +1, impact: +1 }
  flavor: "Disciplined mounted warfare."
  iconHint: "Mamluk helmet"
```

```yaml
troop:
  id: scottishSchiltron
  name: "Scottish schiltron"
  faction: "Kingdom of Scots"
  archetype: spearmen
  rarity: rare
  playable: true
  history: "Scottish schiltron represent a historically attested battlefield role in Kingdom of Scots forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { armor: +1, morale: +1 }
  flavor: "A bristling circle that must not move."
  iconHint: "Pike circle"
```

```yaml
troop:
  id: longbowmen
  name: "English longbowmen"
  faction: "England"
  archetype: archers
  rarity: rare
  playable: true
  history: "English longbowmen represent a historically attested battlefield role in England forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { ranged: +1, armor: -1 }
  flavor: "Stakes, mud, and volleys."
  iconHint: "Longbow"
```

```yaml
troop:
  id: dismountedMenAtArms
  name: "Dismounted men-at-arms"
  faction: "Western European armies"
  archetype: heavySwordsmen
  rarity: epic
  playable: true
  history: "Dismounted men-at-arms represent a historically attested battlefield role in Western European armies forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { melee: +1, armor: +1 }
  flavor: "Armour on foot holds the gap."
  iconHint: "Poleaxe"
```

```yaml
troop:
  id: mongolHorseArchers
  name: "Mongol horse archers"
  faction: "Mongol Empire"
  archetype: lightCavalry
  rarity: epic
  playable: true
  history: "Mongol horse archers represent a historically attested battlefield role in Mongol Empire forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { ranged: +1, mp: +1 }
  flavor: "Range, rhythm, and envelopment."
  iconHint: "Composite bow"
```

```yaml
troop:
  id: englishLongbowElite
  name: "Elite English longbowmen"
  faction: "England"
  archetype: archers
  rarity: legendary
  playable: true
  history: "Elite English longbowmen represent a historically attested battlefield role in England forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { ranged: +1, morale: +1 }
  flavor: "Their ground is part of their weapon."
  iconHint: "Longbow and stakes"
```



## Generals



```yaml
general:
  id: medievalCaptain
  name: "Medieval Captain"
  pennant: MEDIEVALCA
  lived: "unknown; composite card"
  faction: "Any"
  rarity: common
  playable: true
  bio: "A generic commander card for medieval armies where command was collective or a particular historical leader is not central to the scenario."
  style: "Holds an improvised line."
  trait: "Infantry +5% morale"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["John France, Western Warfare in the Age of the Crusades (1999).", "Kelly DeVries, Medieval Military Technology (1992)."]
```

```yaml
general:
  id: medievalMarshal
  name: "Medieval Marshal"
  pennant: MEDIEVALMA
  lived: "unknown; composite card"
  faction: "Any"
  rarity: uncommon
  playable: true
  bio: "A generic senior officer card representing the tactical authority of a royal or feudal household."
  style: "Controls a mounted reserve."
  trait: "Cavalry +5% impact"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Philippe Contamine, War in the Middle Ages (1984).", "John France, Western Warfare in the Age of the Crusades (1999)."]
```

```yaml
general:
  id: saladin
  name: "Saladin"
  pennant: SALADIN
  lived: "1137/38–1193"
  faction: "Ayyubid Sultanate"
  rarity: legendary
  playable: true
  bio: "Ayyubid sultan who destroyed the crusader field army at Hattin and recaptured Jerusalem. Muslim and Latin narratives differ sharply in detail and emphasis."
  style: "Uses encirclement, water denial and patience."
  trait: "Light cavalry +10% ranged"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Ibn al-Athir, The Complete History.", "Malcolm C. Lyons and D. E. P. Jackson, Saladin (1982)."]
```

```yaml
general:
  id: richardI
  name: "Richard I"
  pennant: RICHARDI
  lived: "1157–1199"
  faction: "England"
  rarity: legendary
  playable: true
  bio: "King of England and crusade commander who defeated Saladin's army at Arsuf. He kept his infantry formation together under sustained harassment."
  style: "Keeps a disciplined march under harassment."
  trait: "Infantry +10% morale"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Itinerarium Peregrinorum et Gesta Regis Ricardi.", "John Gillingham, Richard I (1999)."]
```

```yaml
general:
  id: philipAugustus
  name: "Philip II Augustus"
  pennant: PHILIPIIAU
  lived: "1165–1223"
  faction: "France"
  rarity: epic
  playable: true
  bio: "King of France whose coalition victory at Bouvines transformed Capetian prestige. He did not personally command every phase of the fighting."
  style: "Anchors a coalition centre."
  trait: "Infantry +10% armor"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["William the Breton, Philippidos.", "John W. Baldwin, The Government of Philip Augustus (1986)."]
```

```yaml
general:
  id: subutai
  name: "Subutai"
  pennant: SUBUTAI
  lived: "c. 1175–1248"
  faction: "Mongol Empire"
  rarity: legendary
  playable: true
  bio: "Mongol general associated with the campaign culminating at Mohi. The sources make attribution of each operational decision difficult."
  style: "Draws an enemy across a river into an encirclement."
  trait: "Light cavalry +10% impact"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["The Secret History of the Mongols.", "Stephen Pow, The Mongol Empire (2018)."]
```

```yaml
general:
  id: baibars
  name: "Baibars"
  pennant: BAIBARS
  lived: "c. 1223–1277"
  faction: "Mamluk Sultanate"
  rarity: epic
  playable: true
  bio: "Mamluk commander and later sultan associated with the victory at Ain Jalut. His precise role is contested because later Mamluk histories promote his career."
  style: "Uses feigned retreat and a protected reserve."
  trait: "Cavalry +10% impact"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Ibn Abd al-Zahir, al-Rawd al-zahir.", "Reuven Amitai, Mongols and Mamluks (1995)."]
```

```yaml
general:
  id: williamWallace
  name: "William Wallace"
  pennant: WILLIAMWAL
  lived: "c. 1270–1305"
  faction: "Scotland"
  rarity: rare
  playable: true
  bio: "Scottish leader traditionally linked to the victory at Stirling Bridge alongside Andrew Moray. Moray's contribution deserves equal emphasis."
  style: "Makes a narrow crossing decisive."
  trait: "Spearmen +10% morale"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["John Barbour, The Bruce.", "Michael Brown, The Wars of Scotland (2004)."]
```

```yaml
general:
  id: robertBruce
  name: "Robert I"
  pennant: ROBERTI
  lived: "1274–1329"
  faction: "Scotland"
  rarity: epic
  playable: true
  bio: "King of Scots who defeated Edward II at Bannockburn. The battle used ground, discipline and a defensive infantry formation."
  style: "Turns restricted ground into a shield for infantry."
  trait: "Spearmen +10% armor"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["John Barbour, The Bruce.", "Michael Penman, Robert the Bruce (2014)."]
```

```yaml
general:
  id: edwardIII
  name: "Edward III"
  pennant: EDWARDIII
  lived: "1312–1377"
  faction: "England"
  rarity: epic
  playable: true
  bio: "King of England whose army fought from prepared positions at Crécy. Modern scholarship challenges simple claims that longbows alone decided the battle."
  style: "Fights from a prepared defensive line."
  trait: "Archers +10% ranged"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Jean Froissart, Chronicles.", "Clifford J. Rogers, War Cruel and Sharp (2000)."]
```

```yaml
general:
  id: blackPrince
  name: "Edward of Woodstock"
  pennant: EDWARDOFWO
  lived: "1330–1376"
  faction: "England"
  rarity: epic
  playable: true
  bio: "Edward of Woodstock commanded the English army at Poitiers and captured King John II of France. Accounts diverge over the final French attack."
  style: "Combines a defensive position and controlled counterattack."
  trait: "Archers +10% ranged"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Jean Froissart, Chronicles.", "David Green, The Black Prince (2007)."]
```

```yaml
general:
  id: jogaila
  name: "Władysław II Jagiełło"
  pennant: WŁADYSŁAWI
  lived: "c. 1352–1434"
  faction: "Poland-Lithuania"
  rarity: epic
  playable: true
  bio: "King of Poland and grand duke of Lithuania whose coalition defeated the Teutonic Order at Grunwald. Command decisions are debated in Polish, Lithuanian and Teutonic traditions."
  style: "Keeps a large coalition in the battle."
  trait: "Army +5% morale"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Jan Dlugosz, Annals of Poland.", "Sven Ekdahl, The Battle of Grunwald (2010)."]
```

```yaml
general:
  id: henryV
  name: "Henry V"
  pennant: HENRYV
  lived: "1386–1422"
  faction: "England"
  rarity: legendary
  playable: true
  bio: "King of England who defeated a larger French army at Agincourt. Mud, terrain, French command and English shooting all matter in the explanation."
  style: "Makes mud and a narrow front defeat a larger army."
  trait: "Archers +10% ranged"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Enguerrand de Monstrelet, Chronicles.", "Anne Curry, Agincourt: A New History (2005)."]
```

```yaml
general:
  id: alexanderNevsky
  name: "Alexander Nevsky"
  pennant: ALEXANDERN
  lived: "1221–1263"
  faction: "Novgorod"
  rarity: rare
  playable: true
  bio: "Prince of Novgorod who defeated a crusading force on Lake Peipus. Later Russian memory greatly enlarged the battle's scale."
  style: "Pins an advance on precarious ground."
  trait: "Infantry +10% morale"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Novgorod First Chronicle.", "John Lister Illingworth Fennell, The Crisis of Medieval Russia (1983)."]
```

```yaml
general:
  id: ivanDonskoy
  name: "Dmitry Donskoy"
  pennant: DMITRYDONS
  lived: "1350–1389"
  faction: "Moscow"
  rarity: rare
  playable: true
  bio: "Moscow prince credited with victory over Mamai at Kulikovo. The later literary tradition contains much elaboration."
  style: "Hides a reserve behind a pressured line."
  trait: "Heavy infantry +10% melee"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["The Tale of the Battle with Mamai.", "Janet Martin, Medieval Russia 980–1584 (2007)."]
```

```yaml
general:
  id: joaoI
  name: "João I"
  pennant: JOÃOI
  lived: "1357–1433"
  faction: "Portugal"
  rarity: rare
  playable: true
  bio: "King of Portugal whose army defeated Castile at Aljubarrota with allied English support. Exact battlefield obstacles remain debated."
  style: "Defends a prepared position with allies."
  trait: "Infantry +10% morale"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Fernão Lopes, Chronicle of King João I.", "A. R. Disney, A History of Portugal and the Portuguese Empire (2009)."]
```

```yaml
general:
  id: bayezidI
  name: "Bayezid I"
  pennant: BAYEZIDI
  lived: "c. 1360–1403"
  faction: "Ottoman Empire"
  rarity: epic
  playable: true
  bio: "Ottoman sultan who defeated the Nicopolis crusade and was later defeated and captured by Timur at Ankara."
  style: "Commits a layered mounted army."
  trait: "Heavy cavalry +10% impact"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Laonikos Chalkokondyles, Histories.", "Caroline Finkel, Osman's Dream (2005)."]
```

```yaml
general:
  id: timur
  name: "Timur"
  pennant: TIMUR
  lived: "1336–1405"
  faction: "Timurid Empire"
  rarity: legendary
  playable: true
  bio: "Central Asian conqueror whose army defeated Bayezid at Ankara. Accounts are shaped by courtly and hostile traditions."
  style: "Fixes an enemy and attacks both flanks."
  trait: "Light cavalry +10% impact"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Sharaf al-Din Ali Yazdi, Zafarnama.", "Beatrice Forbes Manz, The Rise and Rule of Tamerlane (1989)."]
```



## Battles



```yaml
battle:
  id: hattin
  name: "Hattin"
  date: "4 July 1187"
  orderInAge: 1
  node: main
  branchesFrom: null
  reward: null
  challengeType: attrition
  location: { modernPlace: "Horns of Hattin, Israel", lat: 32.79, lon: 35.47, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Ayyubid Sultanate"
    commander: saladin
    generalRank: 2
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: medievalLightCavalry, level: 1, role: "centre" }, { card: medievalArchers, level: 1, role: "left wing" }, { card: mamlukCavalry, level: 1, role: "right wing" }]
  enemy:
    faction: "Kingdom of Jerusalem"
    commander: medievalCaptain
    generalRank: 3
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: medievalSpearmen, level: 1, role: "centre" }, { card: medievalArchers, level: 1, role: "left wing" }, { card: medievalLightCavalry, level: 1, role: "right wing" }]
  whatHappened: "Saladin shadowed the thirsty crusader march, surrounded the army near Hattin and destroyed its field force. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Harass the march and deny the enemy a safe route to water."
  problem: "Harass the march and deny the enemy a safe route to water."
  terrain: "The map abstracts the decisive ground into a small tactical board and does not claim exact formation positions."
  mapSketch: |
    ....HH..........
    .AAA......EEE...
    .AAA......EEE...
    .AAA......EEE...
    ................
    ................
    ................
    ................
    ................
    ................
  # legend: . open  r rough  F forest  H hill  ~ river  f ford  B bridge  M marsh  V village  W fieldworks  = road  A player  E enemy
  conditions: { weather: clear, fogOfWar: false, reinforcements: [], special: [] }
  objective: { type: breakArmy, detail: "Harass the march and deny the enemy a safe route to water." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 1
  briefing: "Hattin: Saladin shadowed the thirsty crusader march, surrounded the army near Hattin and destroyed its field force. Tactical hint: Harass the march and deny the enemy a safe route to water."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Ibn al-Athir, The Complete History.", "Malcolm C. Lyons and D. E. P. Jackson, Saladin (1982)."]
```

```yaml
battle:
  id: arsuf
  name: "Arsuf"
  date: "7 September 1191"
  orderInAge: 2
  node: main
  branchesFrom: null
  reward: null
  challengeType: cavalryAndPursuit
  location: { modernPlace: "Arsuf, Israel", lat: 32.21, lon: 34.84, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "England and crusader coalition"
    commander: richardI
    generalRank: 2
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: feudalKnights, level: 1, role: "centre" }, { card: medievalSpearmen, level: 1, role: "left wing" }, { card: medievalCrossbowmen, level: 1, role: "right wing" }]
  enemy:
    faction: "Ayyubid Sultanate"
    commander: saladin
    generalRank: 3
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: medievalLightCavalry, level: 1, role: "centre" }, { card: medievalArchers, level: 1, role: "left wing" }, { card: mamlukCavalry, level: 1, role: "right wing" }]
  whatHappened: "Richard's column absorbed prolonged missile attacks, then launched a controlled countercharge that forced Saladin's army away. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Do not charge early; release the cavalry only when the enemy is committed."
  problem: "Do not charge early; release the cavalry only when the enemy is committed."
  terrain: "The map abstracts the decisive ground into a small tactical board and does not claim exact formation positions."
  mapSketch: |
    ................
    .AAA......EEE...
    .AAA......EEE...
    .AAA......EEE...
    ................
    ................
    ................
    ................
    ................
    ................
  # legend: . open  r rough  F forest  H hill  ~ river  f ford  B bridge  M marsh  V village  W fieldworks  = road  A player  E enemy
  conditions: { weather: clear, fogOfWar: false, reinforcements: [], special: [] }
  objective: { type: breakArmy, detail: "Do not charge early; release the cavalry only when the enemy is committed." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 1
  briefing: "Arsuf: Richard's column absorbed prolonged missile attacks, then launched a controlled countercharge that forced Saladin's army away. Tactical hint: Do not charge early; release the cavalry only when the enemy is committed."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Itinerarium Peregrinorum et Gesta Regis Ricardi.", "John Gillingham, Richard I (1999)."]
```

```yaml
battle:
  id: lasNavasTolosa
  name: "Las Navas de Tolosa"
  date: "16 July 1212"
  orderInAge: 3
  node: optional
  branchesFrom: arsuf
  reward: "troop: feudalKnights"
  challengeType: lineAndFlank
  location: { modernPlace: "near Santa Elena, Spain", lat: 38.34, lon: -3.54, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Christian coalition"
    commander: medievalCaptain
    generalRank: 3
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: medievalSpearmen, level: 1, role: "centre" }, { card: medievalArchers, level: 1, role: "left wing" }, { card: medievalLightCavalry, level: 1, role: "right wing" }]
  enemy:
    faction: "Almohad Caliphate"
    commander: medievalCaptain
    generalRank: 4
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: medievalSpearmen, level: 2, role: "centre" }, { card: medievalArchers, level: 2, role: "left wing" }, { card: medievalLightCavalry, level: 2, role: "right wing" }]
  whatHappened: "A coalition crossed the Sierra Morena and broke an Almohad position; the precise tactical sequence and numbers are disputed. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Open a route through the centre before the enemy reserve can stabilise it."
  problem: "Open a route through the centre before the enemy reserve can stabilise it."
  terrain: "The map abstracts the decisive ground into a small tactical board and does not claim exact formation positions."
  mapSketch: |
    ................
    .AAA......EEE...
    .AAA......EEE...
    .AAA......EEE...
    ................
    ................
    ................
    ................
    ................
    ................
  # legend: . open  r rough  F forest  H hill  ~ river  f ford  B bridge  M marsh  V village  W fieldworks  = road  A player  E enemy
  conditions: { weather: clear, fogOfWar: false, reinforcements: [], special: [] }
  objective: { type: breakArmy, detail: "Open a route through the centre before the enemy reserve can stabilise it." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 2
  briefing: "Las Navas de Tolosa: A coalition crossed the Sierra Morena and broke an Almohad position; the precise tactical sequence and numbers are disputed. Tactical hint: Open a route through the centre before the enemy reserve can stabilise it."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Rodrigo Jiménez de Rada, De rebus Hispaniae.", "Joseph F. O'Callaghan, Reconquest and Crusade in Medieval Spain (2003)."]
```

```yaml
battle:
  id: bouvines
  name: "Bouvines"
  date: "27 July 1214"
  orderInAge: 4
  node: main
  branchesFrom: null
  reward: null
  challengeType: lineAndFlank
  location: { modernPlace: "Bouvines, France", lat: 50.57, lon: 3.19, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "France"
    commander: philipAugustus
    generalRank: 3
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: feudalKnights, level: 1, role: "centre" }, { card: medievalSpearmen, level: 1, role: "left wing" }, { card: medievalCrossbowmen, level: 1, role: "right wing" }]
  enemy:
    faction: "Imperial-English coalition"
    commander: medievalCaptain
    generalRank: 4
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: medievalSpearmen, level: 2, role: "centre" }, { card: medievalArchers, level: 2, role: "left wing" }, { card: medievalLightCavalry, level: 2, role: "right wing" }]
  whatHappened: "Philip's coalition fought the emperor Otto IV and allies in a confused battle whose capture of key nobles decided the political result. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Keep the centre alive and isolate the enemy cavalry leaders."
  problem: "Keep the centre alive and isolate the enemy cavalry leaders."
  terrain: "The map abstracts the decisive ground into a small tactical board and does not claim exact formation positions."
  mapSketch: |
    ................
    .AAA......EEE...
    .AAA......EEE...
    .AAA......EEE...
    ................
    ................
    ................
    ................
    ................
    ................
  # legend: . open  r rough  F forest  H hill  ~ river  f ford  B bridge  M marsh  V village  W fieldworks  = road  A player  E enemy
  conditions: { weather: clear, fogOfWar: false, reinforcements: [], special: [] }
  objective: { type: breakArmy, detail: "Keep the centre alive and isolate the enemy cavalry leaders." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 2
  briefing: "Bouvines: Philip's coalition fought the emperor Otto IV and allies in a confused battle whose capture of key nobles decided the political result. Tactical hint: Keep the centre alive and isolate the enemy cavalry leaders."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["William the Breton, Philippidos.", "John W. Baldwin, The Government of Philip Augustus (1986)."]
```

```yaml
battle:
  id: mohi
  name: "Mohi"
  date: "11 April 1241"
  orderInAge: 5
  node: main
  branchesFrom: null
  reward: null
  challengeType: passBridgeOrFord
  location: { modernPlace: "Sajó River, Hungary", lat: 47.95, lon: 20.93, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Mongol Empire"
    commander: subutai
    generalRank: 4
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: mongolHorseArchers, level: 2, role: "centre" }, { card: mongolHorseArchers, level: 2, role: "left wing" }, { card: medievalLightCavalry, level: 2, role: "right wing" }]
  enemy:
    faction: "Kingdom of Hungary"
    commander: medievalCaptain
    generalRank: 5
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: medievalSpearmen, level: 2, role: "centre" }, { card: medievalArchers, level: 2, role: "left wing" }, { card: medievalLightCavalry, level: 2, role: "right wing" }]
  whatHappened: "Mongol forces forced the Sajó crossings and trapped much of the Hungarian army in its camp; details of command are debated. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Open the bridge and ford, then prevent the camp from becoming a refuge."
  problem: "Open the bridge and ford, then prevent the camp from becoming a refuge."
  terrain: "The map abstracts the decisive ground into a small tactical board and does not claim exact formation positions."
  mapSketch: |
    FFFFHHHHFFFFFFFF
    FFFFH....HFFFFF
    ....H.A..H.E...
    ....H.A..H.E...
    ....H.A..H.E...
    FFFFH....HFFFFF
    FFFFHHHHFFFFFFFF
    ................
    ................
    ................
  # legend: . open  r rough  F forest  H hill  ~ river  f ford  B bridge  M marsh  V village  W fieldworks  = road  A player  E enemy
  conditions: { weather: clear, fogOfWar: false, reinforcements: [], special: [] }
  objective: { type: holdPoint, detail: "Open the bridge and ford, then prevent the camp from becoming a refuge." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 3
  briefing: "Mohi: Mongol forces forced the Sajó crossings and trapped much of the Hungarian army in its camp; details of command are debated. Tactical hint: Open the bridge and ford, then prevent the camp from becoming a refuge."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["The Secret History of the Mongols.", "Stephen Pow, The Mongol Empire (2018)."]
```

```yaml
battle:
  id: battleIce
  name: "Battle on the Ice"
  date: "5 April 1242"
  orderInAge: 6
  node: optional
  branchesFrom: bouvines
  reward: "general: alexanderNevsky"
  challengeType: desperateDefence
  location: { modernPlace: "Lake Peipus, Estonia", lat: 58.55, lon: 27.55, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Novgorod"
    commander: alexanderNevsky
    generalRank: 4
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: medievalSpearmen, level: 2, role: "centre" }, { card: medievalArchers, level: 2, role: "left wing" }, { card: medievalLightCavalry, level: 2, role: "right wing" }]
  enemy:
    faction: "Livonian Order"
    commander: medievalCaptain
    generalRank: 5
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: medievalSpearmen, level: 2, role: "centre" }, { card: medievalArchers, level: 2, role: "left wing" }, { card: medievalLightCavalry, level: 2, role: "right wing" }]
  whatHappened: "Novgorod defeated a crusading force near Lake Peipus; later accounts overstate both the scale and the ice's tactical role. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Hold the narrow approach and counterattack the overextended spearhead."
  problem: "Hold the narrow approach and counterattack the overextended spearhead."
  terrain: "The map abstracts the decisive ground into a small tactical board and does not claim exact formation positions."
  mapSketch: |
    FFFFFFFF........
    FFFF....EEE.....
    .AAA....EEE.....
    .AAA....EEE.....
    .AAA....EEE.....
    ~~~~....~~~~~~~~
    ~~~~....~~~~~~~~
    ~~~~~~~~~~~~~~~~
    ~~~~~~~~~~~~~~~~
    ~~~~~~~~~~~~~~~~
  # legend: . open  r rough  F forest  H hill  ~ river  f ford  B bridge  M marsh  V village  W fieldworks  = road  A player  E enemy
  conditions: { weather: clear, fogOfWar: false, reinforcements: [], special: [] }
  objective: { type: holdOut, detail: "Hold the narrow approach and counterattack the overextended spearhead." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 3
  briefing: "Battle on the Ice: Novgorod defeated a crusading force near Lake Peipus; later accounts overstate both the scale and the ice's tactical role. Tactical hint: Hold the narrow approach and counterattack the overextended spearhead."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Novgorod First Chronicle.", "John Lister Illingworth Fennell, The Crisis of Medieval Russia (1983)."]
```

```yaml
battle:
  id: ainJalut
  name: "Ain Jalut"
  date: "3 September 1260"
  orderInAge: 7
  node: main
  branchesFrom: null
  reward: null
  challengeType: ambushAndVision
  location: { modernPlace: "Jezreel Valley, Israel", lat: 32.61, lon: 35.33, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Mamluk Sultanate"
    commander: baibars
    generalRank: 4
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: mamlukCavalry, level: 2, role: "centre" }, { card: medievalArchers, level: 2, role: "left wing" }, { card: medievalSpearmen, level: 2, role: "right wing" }]
  enemy:
    faction: "Mongol Empire"
    commander: medievalCaptain
    generalRank: 5
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: mongolHorseArchers, level: 2, role: "centre" }, { card: mongolHorseArchers, level: 2, role: "left wing" }, { card: medievalLightCavalry, level: 2, role: "right wing" }]
  whatHappened: "Mamluk forces drew a Mongol vanguard toward a concealed reserve and won a rare Mongol field defeat. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Feign a withdrawal only after the reserve is positioned to close the trap."
  problem: "Feign a withdrawal only after the reserve is positioned to close the trap."
  terrain: "The map abstracts the decisive ground into a small tactical board and does not claim exact formation positions."
  mapSketch: |
    FFFF............
    FFF....EEE......
    FF.....EEE......
    .AAA............
    .AAA....rr......
    .AAA....rr......
    ................
    ................
    ................
    ................
  # legend: . open  r rough  F forest  H hill  ~ river  f ford  B bridge  M marsh  V village  W fieldworks  = road  A player  E enemy
  conditions: { weather: clear, fogOfWar: true, reinforcements: [], special: [] }
  objective: { type: breakArmy, detail: "Feign a withdrawal only after the reserve is positioned to close the trap." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 3
  briefing: "Ain Jalut: Mamluk forces drew a Mongol vanguard toward a concealed reserve and won a rare Mongol field defeat. Tactical hint: Feign a withdrawal only after the reserve is positioned to close the trap."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Ibn Abd al-Zahir, al-Rawd al-zahir.", "Reuven Amitai, Mongols and Mamluks (1995)."]
```

```yaml
battle:
  id: stirlingBridge
  name: "Stirling Bridge"
  date: "11 September 1297"
  orderInAge: 8
  node: main
  branchesFrom: null
  reward: null
  challengeType: passBridgeOrFord
  location: { modernPlace: "Stirling, Scotland", lat: 56.12, lon: -3.94, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Scotland"
    commander: williamWallace
    generalRank: 4
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: scottishSchiltron, level: 2, role: "centre" }, { card: medievalArchers, level: 2, role: "left wing" }, { card: medievalSpearmen, level: 2, role: "right wing" }]
  enemy:
    faction: "England"
    commander: medievalCaptain
    generalRank: 5
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: englishLongbowElite, level: 2, role: "centre" }, { card: longbowmen, level: 2, role: "left wing" }, { card: dismountedMenAtArms, level: 2, role: "right wing" }]
  whatHappened: "Wallace and Moray struck the English after part of their force crossed a narrow bridge, defeating it in detail. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Let only part of the army cross before the counterattack begins."
  problem: "Let only part of the army cross before the counterattack begins."
  terrain: "The map abstracts the decisive ground into a small tactical board and does not claim exact formation positions."
  mapSketch: |
    FFFFHHHHFFFFFFFF
    FFFFH....HFFFFF
    ....H.A..H.E...
    ....H.A..H.E...
    ....H.A..H.E...
    FFFFH....HFFFFF
    FFFFHHHHFFFFFFFF
    ................
    ................
    ................
  # legend: . open  r rough  F forest  H hill  ~ river  f ford  B bridge  M marsh  V village  W fieldworks  = road  A player  E enemy
  conditions: { weather: clear, fogOfWar: false, reinforcements: [], special: [] }
  objective: { type: holdPoint, detail: "Let only part of the army cross before the counterattack begins." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 3
  briefing: "Stirling Bridge: Wallace and Moray struck the English after part of their force crossed a narrow bridge, defeating it in detail. Tactical hint: Let only part of the army cross before the counterattack begins."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["John Barbour, The Bruce.", "Michael Brown, The Wars of Scotland (2004)."]
```

```yaml
battle:
  id: bannockburn
  name: "Bannockburn"
  date: "23–24 June 1314"
  orderInAge: 9
  node: main
  branchesFrom: null
  reward: null
  challengeType: hillsAndDefence
  location: { modernPlace: "near Stirling, Scotland", lat: 56.1, lon: -3.96, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Scotland"
    commander: robertBruce
    generalRank: 5
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: scottishSchiltron, level: 2, role: "centre" }, { card: medievalArchers, level: 2, role: "left wing" }, { card: medievalSpearmen, level: 2, role: "right wing" }]
  enemy:
    faction: "England"
    commander: medievalCaptain
    generalRank: 6
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: englishLongbowElite, level: 3, role: "centre" }, { card: longbowmen, level: 3, role: "left wing" }, { card: dismountedMenAtArms, level: 3, role: "right wing" }]
  whatHappened: "Bruce used restricted approaches and schiltrons to defeat Edward II's larger invading army. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Keep the schiltrons cohesive and make the enemy cavalry fight in bad ground."
  problem: "Keep the schiltrons cohesive and make the enemy cavalry fight in bad ground."
  terrain: "The map abstracts the decisive ground into a small tactical board and does not claim exact formation positions."
  mapSketch: |
    ....HHHH........
    .AAA......EEE...
    .AAA......EEE...
    .AAA......EEE...
    ................
    ................
    ................
    ................
    ................
    ................
  # legend: . open  r rough  F forest  H hill  ~ river  f ford  B bridge  M marsh  V village  W fieldworks  = road  A player  E enemy
  conditions: { weather: clear, fogOfWar: false, reinforcements: [], special: [] }
  objective: { type: breakArmy, detail: "Keep the schiltrons cohesive and make the enemy cavalry fight in bad ground." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 4
  briefing: "Bannockburn: Bruce used restricted approaches and schiltrons to defeat Edward II's larger invading army. Tactical hint: Keep the schiltrons cohesive and make the enemy cavalry fight in bad ground."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["John Barbour, The Bruce.", "Michael Penman, Robert the Bruce (2014)."]
```

```yaml
battle:
  id: crecy
  name: "Crécy"
  date: "26 August 1346"
  orderInAge: 10
  node: main
  branchesFrom: null
  reward: null
  challengeType: hillsAndDefence
  location: { modernPlace: "Crécy-en-Ponthieu, France", lat: 50.25, lon: 1.89, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "England"
    commander: edwardIII
    generalRank: 5
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: englishLongbowElite, level: 2, role: "centre" }, { card: longbowmen, level: 2, role: "left wing" }, { card: dismountedMenAtArms, level: 2, role: "right wing" }]
  enemy:
    faction: "France"
    commander: medievalCaptain
    generalRank: 6
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: feudalKnights, level: 3, role: "centre" }, { card: medievalSpearmen, level: 3, role: "left wing" }, { card: medievalCrossbowmen, level: 3, role: "right wing" }]
  whatHappened: "The English fought from a prepared position; repeated French attacks failed in mud and disorder under arrows and counterattacks. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Keep the high ground, protect the archers and let the enemy attack uphill."
  problem: "Keep the high ground, protect the archers and let the enemy attack uphill."
  terrain: "The map abstracts the decisive ground into a small tactical board and does not claim exact formation positions."
  mapSketch: |
    ....HHHH........
    .AAA......EEE...
    .AAA......EEE...
    .AAA......EEE...
    ................
    ................
    ................
    ................
    ................
    ................
  # legend: . open  r rough  F forest  H hill  ~ river  f ford  B bridge  M marsh  V village  W fieldworks  = road  A player  E enemy
  conditions: { weather: clear, fogOfWar: false, reinforcements: [], special: [] }
  objective: { type: breakArmy, detail: "Keep the high ground, protect the archers and let the enemy attack uphill." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 4
  briefing: "Crécy: The English fought from a prepared position; repeated French attacks failed in mud and disorder under arrows and counterattacks. Tactical hint: Keep the high ground, protect the archers and let the enemy attack uphill."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Jean Froissart, Chronicles.", "Clifford J. Rogers, War Cruel and Sharp (2000)."]
```

```yaml
battle:
  id: poitiers
  name: "Poitiers"
  date: "19 September 1356"
  orderInAge: 11
  node: main
  branchesFrom: null
  reward: null
  challengeType: hillsAndDefence
  location: { modernPlace: "near Nouaillé-Maupertuis, France", lat: 46.48, lon: 0.47, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "England"
    commander: blackPrince
    generalRank: 5
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: englishLongbowElite, level: 2, role: "centre" }, { card: longbowmen, level: 2, role: "left wing" }, { card: dismountedMenAtArms, level: 2, role: "right wing" }]
  enemy:
    faction: "France"
    commander: medievalCaptain
    generalRank: 6
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: feudalKnights, level: 3, role: "centre" }, { card: medievalSpearmen, level: 3, role: "left wing" }, { card: medievalCrossbowmen, level: 3, role: "right wing" }]
  whatHappened: "The Black Prince's smaller army held a strong position, beat back French assaults and captured King John II. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Make each French assault cross the same narrow killing ground."
  problem: "Make each French assault cross the same narrow killing ground."
  terrain: "The map abstracts the decisive ground into a small tactical board and does not claim exact formation positions."
  mapSketch: |
    ....HHHH........
    .AAA......EEE...
    .AAA......EEE...
    .AAA......EEE...
    ................
    ................
    ................
    ................
    ................
    ................
  # legend: . open  r rough  F forest  H hill  ~ river  f ford  B bridge  M marsh  V village  W fieldworks  = road  A player  E enemy
  conditions: { weather: clear, fogOfWar: false, reinforcements: [], special: [] }
  objective: { type: breakArmy, detail: "Make each French assault cross the same narrow killing ground." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 4
  briefing: "Poitiers: The Black Prince's smaller army held a strong position, beat back French assaults and captured King John II. Tactical hint: Make each French assault cross the same narrow killing ground."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Jean Froissart, Chronicles.", "David Green, The Black Prince (2007)."]
```

```yaml
battle:
  id: kulikovo
  name: "Kulikovo"
  date: "8 September 1380"
  orderInAge: 12
  node: optional
  branchesFrom: bannockburn
  reward: "general: ivanDonskoy"
  challengeType: holdUntilReinforcements
  location: { modernPlace: "Kulikovo Field, Russia", lat: 53.66, lon: 38.64, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Moscow coalition"
    commander: ivanDonskoy
    generalRank: 6
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: medievalSpearmen, level: 3, role: "centre" }, { card: medievalArchers, level: 3, role: "left wing" }, { card: medievalLightCavalry, level: 3, role: "right wing" }]
  enemy:
    faction: "Mamai's coalition"
    commander: medievalCaptain
    generalRank: 7
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: medievalSpearmen, level: 3, role: "centre" }, { card: medievalArchers, level: 3, role: "left wing" }, { card: medievalLightCavalry, level: 3, role: "right wing" }]
  whatHappened: "Moscow's army endured a heavy central assault before a concealed reserve attacked the flank. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Hold the centre until the hidden reserve can strike."
  problem: "Hold the centre until the hidden reserve can strike."
  terrain: "The map abstracts the decisive ground into a small tactical board and does not claim exact formation positions."
  mapSketch: |
    ................
    .AAA......EEE...
    .AAA......EEE...
    .AAA......EEE...
    ................
    ................
    ................
    ................
    ................
    ................
  # legend: . open  r rough  F forest  H hill  ~ river  f ford  B bridge  M marsh  V village  W fieldworks  = road  A player  E enemy
  conditions: { weather: clear, fogOfWar: false, reinforcements: [], special: [] }
  objective: { type: holdOut, detail: "Hold the centre until the hidden reserve can strike." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 5
  briefing: "Kulikovo: Moscow's army endured a heavy central assault before a concealed reserve attacked the flank. Tactical hint: Hold the centre until the hidden reserve can strike."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["The Tale of the Battle with Mamai.", "Janet Martin, Medieval Russia 980–1584 (2007)."]
```

```yaml
battle:
  id: aljubarrota
  name: "Aljubarrota"
  date: "14 August 1385"
  orderInAge: 13
  node: optional
  branchesFrom: poitiers
  reward: "general: joaoI"
  challengeType: hillsAndDefence
  location: { modernPlace: "Aljubarrota, Portugal", lat: 39.63, lon: -8.83, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Portugal"
    commander: joaoI
    generalRank: 6
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: medievalSpearmen, level: 3, role: "centre" }, { card: medievalArchers, level: 3, role: "left wing" }, { card: medievalLightCavalry, level: 3, role: "right wing" }]
  enemy:
    faction: "Castile"
    commander: medievalCaptain
    generalRank: 7
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: medievalSpearmen, level: 3, role: "centre" }, { card: medievalArchers, level: 3, role: "left wing" }, { card: medievalLightCavalry, level: 3, role: "right wing" }]
  whatHappened: "Portuguese and English allies defeated a larger Castilian army from prepared positions; the extent of fieldworks is debated. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Hold the prepared front and counterattack only after the assault loses order."
  problem: "Hold the prepared front and counterattack only after the assault loses order."
  terrain: "The map abstracts the decisive ground into a small tactical board and does not claim exact formation positions."
  mapSketch: |
    ....HHHH........
    .AAA......EEE...
    .AAA......EEE...
    .AAA......EEE...
    ................
    ................
    ................
    ................
    ................
    ................
  # legend: . open  r rough  F forest  H hill  ~ river  f ford  B bridge  M marsh  V village  W fieldworks  = road  A player  E enemy
  conditions: { weather: clear, fogOfWar: false, reinforcements: [], special: [] }
  objective: { type: breakArmy, detail: "Hold the prepared front and counterattack only after the assault loses order." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 5
  briefing: "Aljubarrota: Portuguese and English allies defeated a larger Castilian army from prepared positions; the extent of fieldworks is debated. Tactical hint: Hold the prepared front and counterattack only after the assault loses order."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Fernão Lopes, Chronicle of King João I.", "A. R. Disney, A History of Portugal and the Portuguese Empire (2009)."]
```

```yaml
battle:
  id: nicopolis
  name: "Nicopolis"
  date: "25 September 1396"
  orderInAge: 14
  node: optional
  branchesFrom: grunwald
  reward: "general: bayezidI"
  challengeType: cavalryAndPursuit
  location: { modernPlace: "Nikopol, Bulgaria", lat: 43.7, lon: 24.89, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Ottoman Empire"
    commander: bayezidI
    generalRank: 6
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: medievalLightCavalry, level: 3, role: "centre" }, { card: mamlukCavalry, level: 3, role: "left wing" }, { card: medievalArchers, level: 3, role: "right wing" }]
  enemy:
    faction: "Crusader coalition"
    commander: medievalCaptain
    generalRank: 7
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: medievalSpearmen, level: 3, role: "centre" }, { card: medievalArchers, level: 3, role: "left wing" }, { card: medievalLightCavalry, level: 3, role: "right wing" }]
  whatHappened: "An impetuous crusader vanguard outran its support and was defeated by Ottoman layers and a reserve. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Absorb the first charge, then commit the reserve to the isolated vanguard."
  problem: "Absorb the first charge, then commit the reserve to the isolated vanguard."
  terrain: "The map abstracts the decisive ground into a small tactical board and does not claim exact formation positions."
  mapSketch: |
    ................
    .AAA......EEE...
    .AAA......EEE...
    .AAA......EEE...
    ................
    ................
    ................
    ................
    ................
    ................
  # legend: . open  r rough  F forest  H hill  ~ river  f ford  B bridge  M marsh  V village  W fieldworks  = road  A player  E enemy
  conditions: { weather: clear, fogOfWar: false, reinforcements: [], special: [] }
  objective: { type: breakArmy, detail: "Absorb the first charge, then commit the reserve to the isolated vanguard." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 5
  briefing: "Nicopolis: An impetuous crusader vanguard outran its support and was defeated by Ottoman layers and a reserve. Tactical hint: Absorb the first charge, then commit the reserve to the isolated vanguard."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Laonikos Chalkokondyles, Histories.", "Caroline Finkel, Osman's Dream (2005)."]
```

```yaml
battle:
  id: ankara
  name: "Ankara"
  date: "28 July 1402"
  orderInAge: 15
  node: optional
  branchesFrom: grunwald
  reward: "general: timur"
  challengeType: lineAndFlank
  location: { modernPlace: "Çubuk plain, Turkey", lat: 40.15, lon: 33.09, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Timurid Empire"
    commander: timur
    generalRank: 6
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: mongolHorseArchers, level: 3, role: "centre" }, { card: mongolHorseArchers, level: 3, role: "left wing" }, { card: mamlukCavalry, level: 3, role: "right wing" }]
  enemy:
    faction: "Ottoman Empire"
    commander: bayezidI
    generalRank: 7
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: medievalLightCavalry, level: 3, role: "centre" }, { card: mamlukCavalry, level: 3, role: "left wing" }, { card: medievalArchers, level: 3, role: "right wing" }]
  whatHappened: "Timur used a larger, more mobile army to envelop Bayezid's force; Bayezid was captured after defeat. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Fix the centre, turn both wings and control the water sources."
  problem: "Fix the centre, turn both wings and control the water sources."
  terrain: "The map abstracts the decisive ground into a small tactical board and does not claim exact formation positions."
  mapSketch: |
    ................
    .AAA......EEE...
    .AAA......EEE...
    .AAA......EEE...
    ................
    ................
    ................
    ................
    ................
    ................
  # legend: . open  r rough  F forest  H hill  ~ river  f ford  B bridge  M marsh  V village  W fieldworks  = road  A player  E enemy
  conditions: { weather: clear, fogOfWar: false, reinforcements: [], special: [] }
  objective: { type: breakArmy, detail: "Fix the centre, turn both wings and control the water sources." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 5
  briefing: "Ankara: Timur used a larger, more mobile army to envelop Bayezid's force; Bayezid was captured after defeat. Tactical hint: Fix the centre, turn both wings and control the water sources."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Sharaf al-Din Ali Yazdi, Zafarnama.", "Beatrice Forbes Manz, The Rise and Rule of Tamerlane (1989)."]
```

```yaml
battle:
  id: grunwald
  name: "Grunwald"
  date: "15 July 1410"
  orderInAge: 16
  node: main
  branchesFrom: null
  reward: null
  challengeType: lineAndFlank
  location: { modernPlace: "Grunwald, Poland", lat: 53.48, lon: 20.09, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Poland-Lithuania"
    commander: jogaila
    generalRank: 6
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: feudalKnights, level: 3, role: "centre" }, { card: medievalSpearmen, level: 3, role: "left wing" }, { card: medievalLightCavalry, level: 3, role: "right wing" }]
  enemy:
    faction: "Teutonic Order"
    commander: medievalCaptain
    generalRank: 7
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: medievalSpearmen, level: 3, role: "centre" }, { card: medievalArchers, level: 3, role: "left wing" }, { card: medievalLightCavalry, level: 3, role: "right wing" }]
  whatHappened: "The Polish-Lithuanian coalition defeated the Teutonic Order in a long battle of changing wings and reserves. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Keep the coalition centre intact while recovering the threatened wing."
  problem: "Keep the coalition centre intact while recovering the threatened wing."
  terrain: "The map abstracts the decisive ground into a small tactical board and does not claim exact formation positions."
  mapSketch: |
    ................
    .AAA......EEE...
    .AAA......EEE...
    .AAA......EEE...
    ................
    ................
    ................
    ................
    ................
    ................
  # legend: . open  r rough  F forest  H hill  ~ river  f ford  B bridge  M marsh  V village  W fieldworks  = road  A player  E enemy
  conditions: { weather: clear, fogOfWar: false, reinforcements: [], special: [] }
  objective: { type: breakArmy, detail: "Keep the coalition centre intact while recovering the threatened wing." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 5
  briefing: "Grunwald: The Polish-Lithuanian coalition defeated the Teutonic Order in a long battle of changing wings and reserves. Tactical hint: Keep the coalition centre intact while recovering the threatened wing."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Jan Dlugosz, Annals of Poland.", "Sven Ekdahl, The Battle of Grunwald (2010)."]
```

```yaml
battle:
  id: agincourt
  name: "Agincourt"
  date: "25 October 1415"
  orderInAge: 17
  node: main
  branchesFrom: null
  reward: null
  challengeType: desperateDefence
  location: { modernPlace: "Azincourt, France", lat: 50.46, lon: 2.14, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "England"
    commander: henryV
    generalRank: 6
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: englishLongbowElite, level: 3, role: "centre" }, { card: longbowmen, level: 3, role: "left wing" }, { card: dismountedMenAtArms, level: 3, role: "right wing" }]
  enemy:
    faction: "France"
    commander: medievalCaptain
    generalRank: 7
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: feudalKnights, level: 3, role: "centre" }, { card: medievalSpearmen, level: 3, role: "left wing" }, { card: medievalCrossbowmen, level: 3, role: "right wing" }]
  whatHappened: "English troops defended a narrow muddy approach; French attacks became compressed and exhausted before the English countered. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Use the narrow muddy front to prevent the larger enemy from deploying."
  problem: "Use the narrow muddy front to prevent the larger enemy from deploying."
  terrain: "The map abstracts the decisive ground into a small tactical board and does not claim exact formation positions."
  mapSketch: |
    FFFFFFFF........
    FFFF....EEE.....
    .AAA....EEE.....
    .AAA....EEE.....
    .AAA....EEE.....
    ~~~~....~~~~~~~~
    ~~~~....~~~~~~~~
    ~~~~~~~~~~~~~~~~
    ~~~~~~~~~~~~~~~~
    ~~~~~~~~~~~~~~~~
  # legend: . open  r rough  F forest  H hill  ~ river  f ford  B bridge  M marsh  V village  W fieldworks  = road  A player  E enemy
  conditions: { weather: clear, fogOfWar: false, reinforcements: [], special: [] }
  objective: { type: holdOut, detail: "Use the narrow muddy front to prevent the larger enemy from deploying." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 5
  briefing: "Agincourt: English troops defended a narrow muddy approach; French attacks became compressed and exhausted before the English countered. Tactical hint: Use the narrow muddy front to prevent the larger enemy from deploying."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Enguerrand de Monstrelet, Chronicles.", "Anne Curry, Agincourt: A New History (2005)."]
```



## Notes



- **Swaps:** None from the approved list.

- **Uncertain facts:** Exact strengths, casualties, battlefield micro-topography and several command details remain disputed.

- **Questions for the owner:** Should optional-node rewards be guaranteed on first completion, or enter the normal card pool after unlock?
# Age 2: Classical Empires



```yaml

age:

  number: 2

  name: "Classical Empires"

  years: "280 BC–AD 378"

  region: { north: 56, south: 25, west: -10, east: 75 }

  intro: "Republics and empires field legions, phalanxes, elephants, cataphracts and horse archers across the Mediterranean and western Asia."

  sensitivities: "Roman, Greek and later imperial sources often use hostile stereotypes and exaggerated numbers for opponents."

  newMechanics: []

```



## Ladder



```yaml

ladder:

  troops:

    - { id: classicalSpearmen, rarity: common, playable: true }

    - { id: classicalArchers, rarity: common, playable: true }

    - { id: classicalSkirmishers, rarity: common, playable: true }

    - { id: classicalLightCavalry, rarity: common, playable: true }

    - { id: romanLegionaries, rarity: rare, playable: true }

    - { id: carthaginianCavalry, rarity: rare, playable: true }

    - { id: hellenisticPhalanx, rarity: rare, playable: true }

    - { id: parthianHorseArchers, rarity: rare, playable: true }

    - { id: romanAuxiliaries, rarity: epic, playable: true }

    - { id: cataphracts, rarity: epic, playable: true }

    - { id: classicalElephants, rarity: legendary, playable: true }

  generals:

    - { id: classicalCaptain, rarity: common, playable: true }

    - { id: classicalTribune, rarity: uncommon, playable: true }

    - { id: pyrrhus, rarity: epic, playable: true }

    - { id: hannibal, rarity: legendary, playable: true }

    - { id: scipioAfricanus, rarity: legendary, playable: true }

    - { id: flamininus, rarity: rare, playable: true }

    - { id: aemiliusPaullus, rarity: epic, playable: true }

    - { id: crassus, rarity: rare, playable: false }

    - { id: vercingetorix, rarity: epic, playable: true }

    - { id: caesar, rarity: legendary, playable: true }

    - { id: arminius, rarity: epic, playable: true }

    - { id: fritigern, rarity: rare, playable: true }

    - { id: xanthippus, rarity: rare, playable: true }

    - { id: hasdrubalBarca, rarity: rare, playable: false }

    - { id: shapurI, rarity: epic, playable: true }

    - { id: julian, rarity: epic, playable: true }

```



## Troops



```yaml
troop:
  id: classicalSpearmen
  name: "Classical spearmen"
  faction: "Hellenistic and eastern armies"
  archetype: spearmen
  rarity: common
  playable: true
  history: "Classical spearmen represent a historically attested battlefield role in Hellenistic and eastern armies forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { armor: +1 }
  flavor: "A disciplined centre."
  iconHint: "Spear and shield"
```

```yaml
troop:
  id: classicalArchers
  name: "Classical archers"
  faction: "Eastern armies"
  archetype: archers
  rarity: common
  playable: true
  history: "Classical archers represent a historically attested battlefield role in Eastern armies forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: {}
  flavor: "Missiles before contact."
  iconHint: "Bow"
```

```yaml
troop:
  id: classicalSkirmishers
  name: "Classical skirmishers"
  faction: "Mediterranean armies"
  archetype: skirmishers
  rarity: common
  playable: true
  history: "Classical skirmishers represent a historically attested battlefield role in Mediterranean armies forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { mp: +1 }
  flavor: "A fast screen."
  iconHint: "Javelins"
```

```yaml
troop:
  id: classicalLightCavalry
  name: "Classical light cavalry"
  faction: "Mediterranean and eastern armies"
  archetype: lightCavalry
  rarity: common
  playable: true
  history: "Classical light cavalry represent a historically attested battlefield role in Mediterranean and eastern armies forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: {}
  flavor: "Harass and exploit."
  iconHint: "Horse and spear"
```

```yaml
troop:
  id: romanLegionaries
  name: "Roman legionaries"
  faction: "Roman Republic and Empire"
  archetype: heavySwordsmen
  rarity: rare
  playable: true
  history: "Roman legionaries represent a historically attested battlefield role in Roman Republic and Empire forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { armor: +1, morale: +1 }
  flavor: "Pila, shield, and sustained pressure."
  iconHint: "Scutum and pila"
```

```yaml
troop:
  id: carthaginianCavalry
  name: "Carthaginian cavalry"
  faction: "Carthage and Numidia"
  archetype: lightCavalry
  rarity: rare
  playable: true
  history: "Carthaginian cavalry represent a historically attested battlefield role in Carthage and Numidia forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { mp: +1, armor: -1 }
  flavor: "Win the wing, then return."
  iconHint: "Horse and crescent"
```

```yaml
troop:
  id: hellenisticPhalanx
  name: "Hellenistic phalanx"
  faction: "Macedonian kingdoms"
  archetype: pikemen
  rarity: rare
  playable: true
  history: "Hellenistic phalanx represent a historically attested battlefield role in Macedonian kingdoms forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { morale: +1, armor: -1 }
  flavor: "Powerful to the front."
  iconHint: "Sarissas"
```

```yaml
troop:
  id: parthianHorseArchers
  name: "Parthian horse archers"
  faction: "Parthia"
  archetype: lightCavalry
  rarity: rare
  playable: true
  history: "Parthian horse archers represent a historically attested battlefield role in Parthia forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { ranged: +1, melee: -1 }
  flavor: "Distance is their armour."
  iconHint: "Horse and bow"
```

```yaml
troop:
  id: romanAuxiliaries
  name: "Roman auxiliaries"
  faction: "Roman Empire"
  archetype: archers
  rarity: epic
  playable: true
  history: "Roman auxiliaries represent a historically attested battlefield role in Roman Empire forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { ranged: +1, morale: -1 }
  flavor: "Empire-wide specialist support."
  iconHint: "Bow and standard"
```

```yaml
troop:
  id: cataphracts
  name: "Cataphracts"
  faction: "Parthia and late Rome"
  archetype: heavyCavalry
  rarity: epic
  playable: true
  history: "Cataphracts represent a historically attested battlefield role in Parthia and late Rome forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { armor: +1, mp: -1 }
  flavor: "Armoured shock at full weight."
  iconHint: "Armoured horse"
```

```yaml
troop:
  id: classicalElephants
  name: "Classical war elephants"
  faction: "Carthage and Hellenistic kingdoms"
  archetype: warElephants
  rarity: legendary
  playable: true
  history: "Classical war elephants represent a historically attested battlefield role in Carthage and Hellenistic kingdoms forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { morale: +1, mp: -1 }
  flavor: "A living wall and a dangerous rout."
  iconHint: "Elephant head"
```



## Generals



```yaml
general:
  id: classicalCaptain
  name: "Classical Captain"
  pennant: CLASSICALC
  lived: "unknown; composite card"
  faction: "Any"
  rarity: common
  playable: true
  bio: "A generic commander card for forces whose named commander is not essential to the scenario or is uncertain in the sources."
  style: "Keeps a line together."
  trait: "Infantry +5% morale"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Polybius, Histories.", "Adrian Goldsworthy, The Roman Army at War (1996)."]
```

```yaml
general:
  id: classicalTribune
  name: "Classical Tribune"
  pennant: CLASSICALT
  lived: "unknown; composite card"
  faction: "Rome"
  rarity: uncommon
  playable: true
  bio: "A generic Roman officer card representing the staff and junior command structure rather than a particular historical person."
  style: "Coordinates legionary reserves."
  trait: "Infantry +5% armour"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Polybius, Histories 6.", "Adrian Goldsworthy, The Roman Army at War (1996)."]
```

```yaml
general:
  id: pyrrhus
  name: "Pyrrhus"
  pennant: PYRRHUS
  lived: "319–272 BC"
  faction: "Epirus"
  rarity: epic
  playable: true
  bio: "King of Epirus who defeated Rome at Heraclea with a combined army of phalanx, cavalry and elephants. The phrase 'Pyrrhic victory' belongs to later reception, not a precise tactical verdict."
  style: "Uses pikes, cavalry and elephants together."
  trait: "Elephants +10% morale"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Plutarch, Pyrrhus 16–17.", "Duncan Head, Armies of the Macedonian and Punic Wars (1982)."]
```

```yaml
general:
  id: hannibal
  name: "Hannibal"
  pennant: HANNIBAL
  lived: "247–c. 183 BC"
  faction: "Carthage"
  rarity: legendary
  playable: true
  bio: "Carthaginian commander whose Italian victories exploited terrain, cavalry and timing. The detailed narratives descend principally from Polybius and Livy."
  style: "Wins through terrain, timing and envelopment."
  trait: "Flank attacks +15%"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Polybius, Histories 3.", "John Lazenby, Hannibal's War (1978)."]
```

```yaml
general:
  id: scipioAfricanus
  name: "Scipio Africanus"
  pennant: SCIPIOAFRI
  lived: "236–c. 183 BC"
  faction: "Rome"
  rarity: legendary
  playable: true
  bio: "Roman commander at Zama and the leading Roman figure of the final war against Hannibal. His later reputation complicates the tradition."
  style: "Creates lanes, wins cavalry, and turns it back."
  trait: "Cavalry +10% impact"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Polybius, Histories 15.", "Adrian Goldsworthy, The Fall of Carthage (2000)."]
```

```yaml
general:
  id: flamininus
  name: "T. Quinctius Flamininus"
  pennant: TQUINCTIUS
  lived: "c. 228–174 BC"
  faction: "Rome"
  rarity: rare
  playable: true
  bio: "Roman commander at Cynoscephalae, where broken ground exposed the limits of phalanx formation. His own political presentation was shaped by Greek 'liberation' rhetoric."
  style: "Exploits broken ground against pikes."
  trait: "Infantry +10% melee"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Polybius, Histories 18.18–27.", "N. G. L. Hammond, The Macedonian State (1989)."]
```

```yaml
general:
  id: aemiliusPaullus
  name: "L. Aemilius Paullus"
  pennant: LAEMILIUSP
  lived: "c. 229–160 BC"
  faction: "Rome"
  rarity: epic
  playable: true
  bio: "Roman consul at Pydna. Plutarch's biography preserves the famous account of the Macedonian phalanx breaking formation over uneven ground."
  style: "Waits for phalanx cohesion to fail."
  trait: "Infantry +10% morale"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Plutarch, Aemilius Paulus 18–22.", "N. G. L. Hammond, The Macedonian State (1989)."]
```

```yaml
general:
  id: crassus
  name: "M. Licinius Crassus"
  pennant: MLICINIUSC
  lived: "c. 115–53 BC"
  faction: "Rome"
  rarity: rare
  playable: false
  bio: "Roman triumvir whose eastern expedition ended at Carrhae. The narrative tradition is hostile and the exact events of his final days remain disputed."
  style: "Pushes a heavy army into open eastern ground."
  trait: "Army +5% morale"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Plutarch, Crassus 20–31.", "Erich S. Gruen, The Hellenistic World and the Coming of Rome (1984)."]
```

```yaml
general:
  id: vercingetorix
  name: "Vercingetorix"
  pennant: VERCINGETO
  lived: "died 46 BC"
  faction: "Arverni"
  rarity: epic
  playable: true
  bio: "Arvernian leader of the Gallic revolt against Caesar and defender of Alesia. Caesar is the main narrative witness and an interested participant."
  style: "Uses strongpoints and relief armies."
  trait: "Defenders +10% morale"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Caesar, Gallic War 7.", "Adrian Goldsworthy, Caesar (2006)."]
```

```yaml
general:
  id: caesar
  name: "Julius Caesar"
  pennant: JULIUSCAES
  lived: "100–44 BC"
  faction: "Rome"
  rarity: legendary
  playable: true
  bio: "Roman commander whose campaigns and civil-war victories were narrated in his own commentaries. Those works are indispensable but self-justifying evidence."
  style: "Uses flexible reserves and fast decisions."
  trait: "Infantry +10% melee"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Caesar, Gallic War and Civil War.", "Adrian Goldsworthy, Caesar (2006)."]
```

```yaml
general:
  id: arminius
  name: "Arminius"
  pennant: ARMINIUS
  lived: "c. 18 BC–AD 21"
  faction: "Cherusci"
  rarity: epic
  playable: true
  bio: "Cheruscan leader and former Roman auxiliary who organised the destruction of Varus' army. Much of his biography comes from Tacitus writing later."
  style: "Turns woods and weather into an ambush."
  trait: "Rough-terrain units +10% morale"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Tacitus, Annals 1–2.", "Peter S. Wells, The Battle That Stopped Rome (2003)."]
```

```yaml
general:
  id: fritigern
  name: "Fritigern"
  pennant: FRITIGERN
  lived: "fl. AD 376–382"
  faction: "Goths"
  rarity: rare
  playable: true
  bio: "Gothic leader in the Danubian crisis and commander associated with Adrianople. Ammianus' narrative makes the battle clearer than Fritigern's personal decisions."
  style: "Uses mobility against an incomplete enemy."
  trait: "Cavalry +10% impact"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Ammianus Marcellinus, Res Gestae 31.", "Peter Heather, The Fall of the Roman Empire (2005)."]
```

```yaml
general:
  id: xanthippus
  name: "Xanthippus"
  pennant: XANTHIPPUS
  lived: "third century BC; dates unknown"
  faction: "Carthage"
  rarity: rare
  playable: true
  bio: "Spartan mercenary commander credited by Polybius with reorganising Carthaginian forces before the Bagradas campaign. Later traditions add uncertain biography."
  style: "Uses elephants and cavalry on open ground."
  trait: "Cavalry +10% impact"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Polybius, Histories 1.32–35.", "Adrian Goldsworthy, The Fall of Carthage (2000)."]
```

```yaml
general:
  id: hasdrubalBarca
  name: "Hasdrubal Barca"
  pennant: HASDRUBALB
  lived: "died 207 BC"
  faction: "Carthage"
  rarity: rare
  playable: false
  bio: "Hannibal's brother, killed after defeat at the Metaurus while attempting to bring his army from Spain into Italy. Details depend heavily on Livy."
  style: "Seeks to unite separate armies."
  trait: "Army +5% morale"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Livy, History of Rome 27.46–51.", "John Lazenby, Hannibal's War (1978)."]
```

```yaml
general:
  id: shapurI
  name: "Shapur I"
  pennant: SHAPURI
  lived: "c. AD 240–270"
  faction: "Sasanian Persia"
  rarity: epic
  playable: true
  bio: "Sasanian king whose own inscription records the capture of Valerian after Edessa. Its triumphal language must be balanced against sparse outside evidence."
  style: "Targets the enemy commander."
  trait: "Cavalry +10% impact"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Res Gestae Divi Saporis.", "Touraj Daryaee, Sasanian Persia (2009)."]
```

```yaml
general:
  id: julian
  name: "Julian"
  pennant: JULIAN
  lived: "AD 331–363"
  faction: "Rome"
  rarity: epic
  playable: true
  bio: "Roman Caesar and later emperor who commanded at Argentoratum. Ammianus was an admirer and participant in Julian's campaigns."
  style: "Holds infantry steady under cavalry pressure."
  trait: "Infantry +10% morale"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Ammianus Marcellinus, Res Gestae 16.12.", "John Drinkwater, The Alamanni and Rome (2007)."]
```



## Battles



```yaml
battle:
  id: heraclea
  name: "Heraclea"
  date: "280 BC"
  orderInAge: 1
  node: main
  branchesFrom: null
  reward: null
  challengeType: cavalryAndPursuit
  location: { modernPlace: "near Policoro, Italy", lat: 40.19, lon: 16.68, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Epirus"
    commander: pyrrhus
    generalRank: 2
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: hellenisticPhalanx, level: 1, role: "centre" }, { card: classicalElephants, level: 1, role: "left wing" }, { card: classicalLightCavalry, level: 1, role: "right wing" }]
  enemy:
    faction: "Rome"
    commander: classicalCaptain
    generalRank: 3
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: romanLegionaries, level: 1, role: "centre" }, { card: romanLegionaries, level: 1, role: "left wing" }, { card: classicalSkirmishers, level: 1, role: "right wing" }]
  whatHappened: "Pyrrhus defeated Romans with phalanx, cavalry and elephants. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Fix the Roman line, then use elephants and cavalry."
  problem: "Fix the Roman line, then use elephants and cavalry."
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
  objective: { type: breakArmy, detail: "Fix the Roman line, then use elephants and cavalry." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 1
  briefing: "Heraclea: Pyrrhus defeated Romans with phalanx, cavalry and elephants. Tactical hint: Fix the Roman line, then use elephants and cavalry."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Plutarch, Pyrrhus 16–17.", "Duncan Head, Armies of the Macedonian and Punic Wars (1982)."]
```

```yaml
battle:
  id: bagradas
  name: "Bagradas"
  date: "255 BC"
  orderInAge: 2
  node: optional
  branchesFrom: heraclea
  reward: "general: xanthippus"
  challengeType: lineAndFlank
  location: { modernPlace: "near Tunis, Tunisia", lat: 36.78, lon: 10.2, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Carthage"
    commander: xanthippus
    generalRank: 3
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: classicalSpearmen, level: 1, role: "centre" }, { card: carthaginianCavalry, level: 1, role: "left wing" }, { card: classicalElephants, level: 1, role: "right wing" }]
  enemy:
    faction: "Rome"
    commander: classicalCaptain
    generalRank: 4
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: romanLegionaries, level: 2, role: "centre" }, { card: romanLegionaries, level: 2, role: "left wing" }, { card: classicalSkirmishers, level: 2, role: "right wing" }]
  whatHappened: "Xanthippus used elephants and superior cavalry against Rome in open country. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Exploit open ground before legionaries close."
  problem: "Exploit open ground before legionaries close."
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
  objective: { type: breakArmy, detail: "Exploit open ground before legionaries close." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 2
  briefing: "Bagradas: Xanthippus used elephants and superior cavalry against Rome in open country. Tactical hint: Exploit open ground before legionaries close."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Polybius, Histories 1.32–35.", "Adrian Goldsworthy, The Fall of Carthage (2000)."]
```

```yaml
battle:
  id: trebia
  name: "Trebia"
  date: "218 BC"
  orderInAge: 3
  node: main
  branchesFrom: null
  reward: null
  challengeType: ambushAndVision
  location: { modernPlace: "near Piacenza, Italy", lat: 45.04, lon: 9.7, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Carthage"
    commander: hannibal
    generalRank: 3
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: classicalSpearmen, level: 1, role: "centre" }, { card: carthaginianCavalry, level: 1, role: "left wing" }, { card: classicalElephants, level: 1, role: "right wing" }]
  enemy:
    faction: "Rome"
    commander: classicalCaptain
    generalRank: 4
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: romanLegionaries, level: 2, role: "centre" }, { card: romanLegionaries, level: 2, role: "left wing" }, { card: classicalSkirmishers, level: 2, role: "right wing" }]
  whatHappened: "Hannibal drew cold Roman troops across the Trebia and struck with a concealed force. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Draw the enemy across the river, then spring the ambush."
  problem: "Draw the enemy across the river, then spring the ambush."
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
  conditions: { weather: rain, fogOfWar: true, reinforcements: [], special: [] }
  objective: { type: breakArmy, detail: "Draw the enemy across the river, then spring the ambush." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 2
  briefing: "Trebia: Hannibal drew cold Roman troops across the Trebia and struck with a concealed force. Tactical hint: Draw the enemy across the river, then spring the ambush."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Polybius, Histories 3.70–74.", "John Lazenby, Hannibal's War (1978)."]
```

```yaml
battle:
  id: lakeTrasimene
  name: "Lake Trasimene"
  date: "217 BC"
  orderInAge: 4
  node: main
  branchesFrom: null
  reward: null
  challengeType: ambushAndVision
  location: { modernPlace: "Lake Trasimene, Italy", lat: 43.15, lon: 12.1, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Carthage"
    commander: hannibal
    generalRank: 3
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: classicalSpearmen, level: 1, role: "centre" }, { card: carthaginianCavalry, level: 1, role: "left wing" }, { card: classicalElephants, level: 1, role: "right wing" }]
  enemy:
    faction: "Rome"
    commander: classicalCaptain
    generalRank: 4
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: romanLegionaries, level: 2, role: "centre" }, { card: romanLegionaries, level: 2, role: "left wing" }, { card: classicalSkirmishers, level: 2, role: "right wing" }]
  whatHappened: "Hannibal attacked a Roman column in morning mist beside the lake. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Trap the marching column before it deploys."
  problem: "Trap the marching column before it deploys."
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
  objective: { type: breakArmy, detail: "Trap the marching column before it deploys." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 2
  briefing: "Lake Trasimene: Hannibal attacked a Roman column in morning mist beside the lake. Tactical hint: Trap the marching column before it deploys."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Polybius, Histories 3.82–85.", "John Lazenby, Hannibal's War (1978)."]
```

```yaml
battle:
  id: cannae
  name: "Cannae"
  date: "216 BC"
  orderInAge: 5
  node: main
  branchesFrom: null
  reward: null
  challengeType: lineAndFlank
  location: { modernPlace: "Cannae, Italy", lat: 41.3, lon: 16.15, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Carthage"
    commander: hannibal
    generalRank: 4
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: classicalSpearmen, level: 2, role: "centre" }, { card: carthaginianCavalry, level: 2, role: "left wing" }, { card: classicalElephants, level: 2, role: "right wing" }]
  enemy:
    faction: "Rome"
    commander: classicalCaptain
    generalRank: 5
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: romanLegionaries, level: 2, role: "centre" }, { card: romanLegionaries, level: 2, role: "left wing" }, { card: classicalSkirmishers, level: 2, role: "right wing" }]
  whatHappened: "Hannibal's centre yielded while wings and cavalry enclosed the Roman mass. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Let the centre bend without breaking, then close both wings."
  problem: "Let the centre bend without breaking, then close both wings."
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
  objective: { type: breakArmy, detail: "Let the centre bend without breaking, then close both wings." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 3
  briefing: "Cannae: Hannibal's centre yielded while wings and cavalry enclosed the Roman mass. Tactical hint: Let the centre bend without breaking, then close both wings."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Polybius, Histories 3.110–117.", "Adrian Goldsworthy, Cannae (2001)."]
```

```yaml
battle:
  id: metaurus
  name: "Metaurus"
  date: "207 BC"
  orderInAge: 6
  node: optional
  branchesFrom: cannae
  reward: "general: hasdrubalBarca"
  challengeType: passBridgeOrFord
  location: { modernPlace: "near the Metaurus, Italy", lat: 43.65, lon: 13.12, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Rome"
    commander: classicalCaptain
    generalRank: 5
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: romanLegionaries, level: 2, role: "centre" }, { card: romanLegionaries, level: 2, role: "left wing" }, { card: classicalSkirmishers, level: 2, role: "right wing" }]
  enemy:
    faction: "Carthage"
    commander: hasdrubalBarca
    generalRank: 6
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: classicalSpearmen, level: 3, role: "centre" }, { card: carthaginianCavalry, level: 3, role: "left wing" }, { card: classicalElephants, level: 3, role: "right wing" }]
  whatHappened: "Roman armies intercepted Hasdrubal before he could join Hannibal; the Roman force was commanded by consuls Nero and Livius. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Stop the column before it reaches its ally."
  problem: "Stop the column before it reaches its ally."
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
  objective: { type: holdPoint, detail: "Stop the column before it reaches its ally." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 4
  briefing: "Metaurus: Roman armies intercepted Hasdrubal before he could join Hannibal; the Roman force was commanded by consuls Nero and Livius. Tactical hint: Stop the column before it reaches its ally."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Livy, History of Rome 27.46–51.", "John Lazenby, Hannibal's War (1978)."]
```

```yaml
battle:
  id: zama
  name: "Zama"
  date: "202 BC"
  orderInAge: 7
  node: main
  branchesFrom: null
  reward: null
  challengeType: lineAndFlank
  location: { modernPlace: "near Zama, Tunisia", lat: 36.18, lon: 9.2, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Rome"
    commander: scipioAfricanus
    generalRank: 4
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: romanLegionaries, level: 2, role: "centre" }, { card: romanLegionaries, level: 2, role: "left wing" }, { card: classicalSkirmishers, level: 2, role: "right wing" }]
  enemy:
    faction: "Carthage"
    commander: hannibal
    generalRank: 5
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: classicalSpearmen, level: 2, role: "centre" }, { card: carthaginianCavalry, level: 2, role: "left wing" }, { card: classicalElephants, level: 2, role: "right wing" }]
  whatHappened: "Scipio opened lanes for elephants and returned victorious cavalry to the rear. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Absorb elephants, win cavalry, then strike the rear."
  problem: "Absorb elephants, win cavalry, then strike the rear."
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
  objective: { type: breakArmy, detail: "Absorb elephants, win cavalry, then strike the rear." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 3
  briefing: "Zama: Scipio opened lanes for elephants and returned victorious cavalry to the rear. Tactical hint: Absorb elephants, win cavalry, then strike the rear."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Polybius, Histories 15.9–16.", "Adrian Goldsworthy, The Fall of Carthage (2000)."]
```

```yaml
battle:
  id: cynoscephalae
  name: "Cynoscephalae"
  date: "197 BC"
  orderInAge: 8
  node: main
  branchesFrom: null
  reward: null
  challengeType: hillsAndDefence
  location: { modernPlace: "near Farsala, Greece", lat: 39.38, lon: 22.37, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Rome"
    commander: flamininus
    generalRank: 4
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: romanLegionaries, level: 2, role: "centre" }, { card: romanLegionaries, level: 2, role: "left wing" }, { card: classicalSkirmishers, level: 2, role: "right wing" }]
  enemy:
    faction: "Macedon"
    commander: classicalCaptain
    generalRank: 5
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: classicalSpearmen, level: 2, role: "centre" }, { card: classicalArchers, level: 2, role: "left wing" }, { card: classicalLightCavalry, level: 2, role: "right wing" }]
  whatHappened: "A Roman wing exploited an exposed phalanx flank in broken hills. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Fight for the ridges and hit the pikes where they cannot face."
  problem: "Fight for the ridges and hit the pikes where they cannot face."
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
  objective: { type: breakArmy, detail: "Fight for the ridges and hit the pikes where they cannot face." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 3
  briefing: "Cynoscephalae: A Roman wing exploited an exposed phalanx flank in broken hills. Tactical hint: Fight for the ridges and hit the pikes where they cannot face."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Polybius, Histories 18.18–27.", "N. G. L. Hammond, The Macedonian State (1989)."]
```

```yaml
battle:
  id: pydna
  name: "Pydna"
  date: "168 BC"
  orderInAge: 9
  node: main
  branchesFrom: null
  reward: null
  challengeType: hillsAndDefence
  location: { modernPlace: "near Pydna, Greece", lat: 40.37, lon: 22.52, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Rome"
    commander: aemiliusPaullus
    generalRank: 4
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: romanLegionaries, level: 2, role: "centre" }, { card: romanLegionaries, level: 2, role: "left wing" }, { card: classicalSkirmishers, level: 2, role: "right wing" }]
  enemy:
    faction: "Macedon"
    commander: classicalCaptain
    generalRank: 5
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: classicalSpearmen, level: 2, role: "centre" }, { card: classicalArchers, level: 2, role: "left wing" }, { card: classicalLightCavalry, level: 2, role: "right wing" }]
  whatHappened: "The phalanx lost cohesion on broken ground and Roman troops entered its gaps. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Draw pikes onto broken ground, then penetrate the gaps."
  problem: "Draw pikes onto broken ground, then penetrate the gaps."
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
  objective: { type: breakArmy, detail: "Draw pikes onto broken ground, then penetrate the gaps." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 3
  briefing: "Pydna: The phalanx lost cohesion on broken ground and Roman troops entered its gaps. Tactical hint: Draw pikes onto broken ground, then penetrate the gaps."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Plutarch, Aemilius Paulus 18–22.", "N. G. L. Hammond, The Macedonian State (1989)."]
```

```yaml
battle:
  id: bibracte
  name: "Bibracte"
  date: "58 BC"
  orderInAge: 10
  node: optional
  branchesFrom: pydna
  reward: "troop: romanLegionaries"
  challengeType: hillsAndDefence
  location: { modernPlace: "Mont Beuvray, France", lat: 46.92, lon: 4.04, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Rome"
    commander: caesar
    generalRank: 5
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: romanLegionaries, level: 2, role: "centre" }, { card: romanLegionaries, level: 2, role: "left wing" }, { card: classicalSkirmishers, level: 2, role: "right wing" }]
  enemy:
    faction: "Helvetii"
    commander: classicalCaptain
    generalRank: 6
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: classicalSpearmen, level: 3, role: "centre" }, { card: classicalArchers, level: 3, role: "left wing" }, { card: classicalLightCavalry, level: 3, role: "right wing" }]
  whatHappened: "Caesar fought the Helvetii on rising ground after a contested march; Vercingetorix was not present. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Hold the hill and defeat the enemy before its wagons cover retreat."
  problem: "Hold the hill and defeat the enemy before its wagons cover retreat."
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
  objective: { type: breakArmy, detail: "Hold the hill and defeat the enemy before its wagons cover retreat." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 4
  briefing: "Bibracte: Caesar fought the Helvetii on rising ground after a contested march; Vercingetorix was not present. Tactical hint: Hold the hill and defeat the enemy before its wagons cover retreat."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Caesar, Gallic War 1.21–26.", "Kate Gilliver, Caesar's Gallic Wars (2003)."]
```

```yaml
battle:
  id: carrhae
  name: "Carrhae"
  date: "53 BC"
  orderInAge: 11
  node: main
  branchesFrom: null
  reward: null
  challengeType: cavalryAndPursuit
  location: { modernPlace: "Harran, Turkey", lat: 36.86, lon: 39.03, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Parthia"
    commander: classicalCaptain
    generalRank: 5
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: parthianHorseArchers, level: 2, role: "centre" }, { card: parthianHorseArchers, level: 2, role: "left wing" }, { card: cataphracts, level: 2, role: "right wing" }]
  enemy:
    faction: "Rome"
    commander: crassus
    generalRank: 6
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: romanLegionaries, level: 3, role: "centre" }, { card: romanLegionaries, level: 3, role: "left wing" }, { card: classicalSkirmishers, level: 3, role: "right wing" }]
  whatHappened: "Parthian horse archers and cataphracts, led in the sources by Surena, exhausted Crassus in open country. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Survive missile pressure and reach defensible ground."
  problem: "Survive missile pressure and reach defensible ground."
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
  objective: { type: breakArmy, detail: "Survive missile pressure and reach defensible ground." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 4
  briefing: "Carrhae: Parthian horse archers and cataphracts, led in the sources by Surena, exhausted Crassus in open country. Tactical hint: Survive missile pressure and reach defensible ground."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Plutarch, Crassus 20–31.", "Erik Gruen, The Hellenistic World and the Coming of Rome (1984)."]
```

```yaml
battle:
  id: alesia
  name: "Alesia"
  date: "52 BC"
  orderInAge: 12
  node: main
  branchesFrom: null
  reward: null
  challengeType: holdUntilReinforcements
  location: { modernPlace: "Alise-Sainte-Reine, France", lat: 47.54, lon: 4.5, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Rome"
    commander: caesar
    generalRank: 5
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: romanLegionaries, level: 2, role: "centre" }, { card: romanLegionaries, level: 2, role: "left wing" }, { card: classicalSkirmishers, level: 2, role: "right wing" }]
  enemy:
    faction: "Gaul"
    commander: vercingetorix
    generalRank: 6
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: classicalSpearmen, level: 3, role: "centre" }, { card: classicalArchers, level: 3, role: "left wing" }, { card: classicalLightCavalry, level: 3, role: "right wing" }]
  whatHappened: "Caesar built lines against both a besieged force and a relief army. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Hold two fronts until the relief attempt breaks."
  problem: "Hold two fronts until the relief attempt breaks."
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
  objective: { type: holdOut, detail: "Hold two fronts until the relief attempt breaks." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 4
  briefing: "Alesia: Caesar built lines against both a besieged force and a relief army. Tactical hint: Hold two fronts until the relief attempt breaks."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Caesar, Gallic War 7.68–90.", "Adrian Goldsworthy, Caesar (2006)."]
```

```yaml
battle:
  id: pharsalus
  name: "Pharsalus"
  date: "48 BC"
  orderInAge: 13
  node: main
  branchesFrom: null
  reward: null
  challengeType: lineAndFlank
  location: { modernPlace: "near Farsala, Greece", lat: 39.37, lon: 22.93, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Rome"
    commander: caesar
    generalRank: 5
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: romanLegionaries, level: 2, role: "centre" }, { card: romanLegionaries, level: 2, role: "left wing" }, { card: classicalSkirmishers, level: 2, role: "right wing" }]
  enemy:
    faction: "Roman Senate"
    commander: classicalCaptain
    generalRank: 6
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: classicalSpearmen, level: 3, role: "centre" }, { card: classicalArchers, level: 3, role: "left wing" }, { card: classicalLightCavalry, level: 3, role: "right wing" }]
  whatHappened: "Caesar's reserve helped defeat the stronger enemy cavalry wing. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Blunt cavalry with the reserve, then turn the exposed line."
  problem: "Blunt cavalry with the reserve, then turn the exposed line."
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
  objective: { type: breakArmy, detail: "Blunt cavalry with the reserve, then turn the exposed line." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 4
  briefing: "Pharsalus: Caesar's reserve helped defeat the stronger enemy cavalry wing. Tactical hint: Blunt cavalry with the reserve, then turn the exposed line."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Caesar, Civil War 3.82–99.", "Adrian Goldsworthy, Caesar (2006)."]
```

```yaml
battle:
  id: munda
  name: "Munda"
  date: "45 BC"
  orderInAge: 14
  node: optional
  branchesFrom: pharsalus
  reward: "general: caesar"
  challengeType: hillsAndDefence
  location: { modernPlace: "southern Spain", lat: 37.25, lon: -5.2, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Rome"
    commander: caesar
    generalRank: 6
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: romanLegionaries, level: 3, role: "centre" }, { card: romanLegionaries, level: 3, role: "left wing" }, { card: classicalSkirmishers, level: 3, role: "right wing" }]
  enemy:
    faction: "Pompeian Romans"
    commander: classicalCaptain
    generalRank: 7
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: classicalSpearmen, level: 3, role: "centre" }, { card: classicalArchers, level: 3, role: "left wing" }, { card: classicalLightCavalry, level: 3, role: "right wing" }]
  whatHappened: "Caesar won a hard uphill battle ending organised Pompeian resistance. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Break the ridge before the enemy counterattacks downhill."
  problem: "Break the ridge before the enemy counterattacks downhill."
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
  objective: { type: breakArmy, detail: "Break the ridge before the enemy counterattacks downhill." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 5
  briefing: "Munda: Caesar won a hard uphill battle ending organised Pompeian resistance. Tactical hint: Break the ridge before the enemy counterattacks downhill."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Appian, Civil Wars 2.101–105.", "Adrian Goldsworthy, Caesar (2006)."]
```

```yaml
battle:
  id: teutoburgForest
  name: "Teutoburg Forest"
  date: "AD 9"
  orderInAge: 15
  node: main
  branchesFrom: null
  reward: null
  challengeType: ambushAndVision
  location: { modernPlace: "Kalkriese area, Germany", lat: 52.41, lon: 8.15, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Cherusci"
    commander: arminius
    generalRank: 5
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: classicalSpearmen, level: 2, role: "centre" }, { card: classicalArchers, level: 2, role: "left wing" }, { card: classicalLightCavalry, level: 2, role: "right wing" }]
  enemy:
    faction: "Rome"
    commander: classicalCaptain
    generalRank: 6
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: romanLegionaries, level: 3, role: "centre" }, { card: romanLegionaries, level: 3, role: "left wing" }, { card: classicalSkirmishers, level: 3, role: "right wing" }]
  whatHappened: "Arminius destroyed Varus' marching legions in difficult wooded country. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Ambush the stretched column before it forms a line."
  problem: "Ambush the stretched column before it forms a line."
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
  objective: { type: breakArmy, detail: "Ambush the stretched column before it forms a line." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 4
  briefing: "Teutoburg Forest: Arminius destroyed Varus' marching legions in difficult wooded country. Tactical hint: Ambush the stretched column before it forms a line."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Tacitus, Annals 1.55–71.", "Peter S. Wells, The Battle That Stopped Rome (2003)."]
```

```yaml
battle:
  id: edessa
  name: "Edessa"
  date: "260"
  orderInAge: 16
  node: optional
  branchesFrom: teutoburgForest
  reward: "general: shapurI"
  challengeType: strikeTheCommander
  location: { modernPlace: "near Şanlıurfa, Turkey", lat: 37.15, lon: 38.79, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Sasanian Persia"
    commander: shapurI
    generalRank: 6
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: classicalSpearmen, level: 3, role: "centre" }, { card: classicalArchers, level: 3, role: "left wing" }, { card: classicalLightCavalry, level: 3, role: "right wing" }]
  enemy:
    faction: "Rome"
    commander: classicalCaptain
    generalRank: 7
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: romanLegionaries, level: 3, role: "centre" }, { card: romanLegionaries, level: 3, role: "left wing" }, { card: classicalSkirmishers, level: 3, role: "right wing" }]
  whatHappened: "Shapur defeated and captured Emperor Valerian; exact tactics are uncertain. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Isolate the emperor's guard and capture the commander."
  problem: "Isolate the emperor's guard and capture the commander."
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
  objective: { type: killGeneral, detail: "Isolate the emperor's guard and capture the commander." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 5
  briefing: "Edessa: Shapur defeated and captured Emperor Valerian; exact tactics are uncertain. Tactical hint: Isolate the emperor's guard and capture the commander."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Res Gestae Divi Saporis.", "Touraj Daryaee, Sasanian Persia (2009)."]
```

```yaml
battle:
  id: argentoratum
  name: "Argentoratum"
  date: "357"
  orderInAge: 17
  node: optional
  branchesFrom: teutoburgForest
  reward: "troop: cataphracts"
  challengeType: hillsAndDefence
  location: { modernPlace: "Strasbourg, France", lat: 48.58, lon: 7.75, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Rome"
    commander: julian
    generalRank: 6
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: romanLegionaries, level: 3, role: "centre" }, { card: romanLegionaries, level: 3, role: "left wing" }, { card: classicalSkirmishers, level: 3, role: "right wing" }]
  enemy:
    faction: "Alamanni"
    commander: classicalCaptain
    generalRank: 7
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: classicalSpearmen, level: 3, role: "centre" }, { card: classicalArchers, level: 3, role: "left wing" }, { card: classicalLightCavalry, level: 3, role: "right wing" }]
  whatHappened: "Julian's infantry overcame cavalry setbacks to defeat the Alamanni. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Keep the centre intact and recover the cavalry flank."
  problem: "Keep the centre intact and recover the cavalry flank."
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
  objective: { type: breakArmy, detail: "Keep the centre intact and recover the cavalry flank." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 5
  briefing: "Argentoratum: Julian's infantry overcame cavalry setbacks to defeat the Alamanni. Tactical hint: Keep the centre intact and recover the cavalry flank."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Ammianus Marcellinus, Res Gestae 16.12.", "John Drinkwater, The Alamanni and Rome (2007)."]
```

```yaml
battle:
  id: adrianople
  name: "Adrianople"
  date: "378"
  orderInAge: 18
  node: main
  branchesFrom: null
  reward: null
  challengeType: cavalryAndPursuit
  location: { modernPlace: "near Edirne, Turkey", lat: 41.68, lon: 26.56, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Goths"
    commander: fritigern
    generalRank: 6
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: classicalSpearmen, level: 3, role: "centre" }, { card: classicalArchers, level: 3, role: "left wing" }, { card: classicalLightCavalry, level: 3, role: "right wing" }]
  enemy:
    faction: "Rome"
    commander: classicalCaptain
    generalRank: 7
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: romanLegionaries, level: 3, role: "centre" }, { card: romanLegionaries, level: 3, role: "left wing" }, { card: classicalSkirmishers, level: 3, role: "right wing" }]
  whatHappened: "Roman troops attacked before all reinforcements arrived and were enveloped after Gothic cavalry returned. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Punish an enemy advancing without its full army."
  problem: "Punish an enemy advancing without its full army."
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
  objective: { type: breakArmy, detail: "Punish an enemy advancing without its full army." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 5
  briefing: "Adrianople: Roman troops attacked before all reinforcements arrived and were enveloped after Gothic cavalry returned. Tactical hint: Punish an enemy advancing without its full army."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Ammianus Marcellinus, Res Gestae 31.12–13.", "Peter Heather, The Fall of the Roman Empire (2005)."]
```



## Notes



- **Swaps:** None from the approved list.

- **Uncertain facts:** Exact strengths, casualties, battlefield micro-topography and several command details remain disputed.

- **Questions for the owner:** Should optional-node rewards be guaranteed on first completion, or enter the normal card pool after unlock?
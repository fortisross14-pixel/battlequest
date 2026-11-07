# Age 1: Antiquity



```yaml

age:

  number: 1

  name: "Antiquity"

  years: "860–320 BC"

  region: { north: 45, south: 25, west: 10, east: 80 }

  intro: "Iron Age empires, Greek phalanxes and Macedonian combined arms turn terrain and formation into decisive weapons."

  sensitivities: "Assyrian inscriptions and Greek-Macedonian narratives are partisan; Persian, Indian and Saka forces require particular care against exoticising shorthand."

  newMechanics: []

```



## Ladder



```yaml

ladder:

  troops:

    - { id: antiquitySpearmen, rarity: common, playable: true }

    - { id: antiquityArchers, rarity: common, playable: true }

    - { id: antiquitySkirmishers, rarity: common, playable: true }

    - { id: antiquityLightCavalry, rarity: common, playable: true }

    - { id: hoplitePhalanx, rarity: rare, playable: true }

    - { id: persianShieldArchers, rarity: rare, playable: true }

    - { id: spartanHoplites, rarity: rare, playable: true }

    - { id: macedonianPhalanx, rarity: rare, playable: true }

    - { id: companionCavalry, rarity: epic, playable: true }

    - { id: thebanSacredBand, rarity: epic, playable: true }

    - { id: indianElephants, rarity: legendary, playable: true }

  generals:

    - { id: antiquityCaptain, rarity: common, playable: true }

    - { id: antiquityScout, rarity: uncommon, playable: true }

    - { id: shalmaneserIII, rarity: epic, playable: true }

    - { id: hadadezer, rarity: rare, playable: false }

    - { id: miltiades, rarity: epic, playable: true }

    - { id: datis, rarity: rare, playable: false }

    - { id: leonidas, rarity: rare, playable: true }

    - { id: xerxes, rarity: legendary, playable: false }

    - { id: pausanias, rarity: rare, playable: true }

    - { id: mardonius, rarity: epic, playable: false }

    - { id: epaminondas, rarity: legendary, playable: true }

    - { id: cleombrotus, rarity: rare, playable: false }

    - { id: philipII, rarity: epic, playable: true }

    - { id: alexander, rarity: legendary, playable: true }

    - { id: dariusIII, rarity: legendary, playable: false }

    - { id: porus, rarity: epic, playable: true }

    - { id: pagondas, rarity: rare, playable: true }

    - { id: agisII, rarity: rare, playable: true }

    - { id: cyrusYounger, rarity: rare, playable: true }

    - { id: agesilaus, rarity: epic, playable: true }

    - { id: ariobarzanes, rarity: rare, playable: false }

    - { id: sakaChiefs, rarity: common, playable: false }

```



## Troops



```yaml
troop:
  id: antiquitySpearmen
  name: "Antiquity spearmen"
  faction: "Mediterranean and Near Eastern armies"
  archetype: spearmen
  rarity: common
  playable: true
  history: "Antiquity spearmen represent a historically attested battlefield role in Mediterranean and Near Eastern armies forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { armor: +1 }
  flavor: "A steady front."
  iconHint: "Spear and shield"
```

```yaml
troop:
  id: antiquityArchers
  name: "Antiquity archers"
  faction: "Mediterranean and Near Eastern armies"
  archetype: archers
  rarity: common
  playable: true
  history: "Antiquity archers represent a historically attested battlefield role in Mediterranean and Near Eastern armies forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: {}
  flavor: "Arrows soften the line."
  iconHint: "Bow and quiver"
```

```yaml
troop:
  id: antiquitySkirmishers
  name: "Antiquity skirmishers"
  faction: "Greek and Near Eastern armies"
  archetype: skirmishers
  rarity: common
  playable: true
  history: "Antiquity skirmishers represent a historically attested battlefield role in Greek and Near Eastern armies forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { mp: +1 }
  flavor: "Javelins, then distance."
  iconHint: "Javelins"
```

```yaml
troop:
  id: antiquityLightCavalry
  name: "Antiquity light cavalry"
  faction: "Achaemenid and steppe armies"
  archetype: lightCavalry
  rarity: common
  playable: true
  history: "Antiquity light cavalry represent a historically attested battlefield role in Achaemenid and steppe armies forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: {}
  flavor: "Find the flank."
  iconHint: "Horse and bow"
```

```yaml
troop:
  id: hoplitePhalanx
  name: "Hoplite phalanx"
  faction: "Greek city-states"
  archetype: spearmen
  rarity: rare
  playable: true
  history: "Hoplite phalanx represent a historically attested battlefield role in Greek city-states forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { armor: +1, morale: +1 }
  flavor: "Shield to shield."
  iconHint: "Round shield"
```

```yaml
troop:
  id: persianShieldArchers
  name: "Persian shield archers"
  faction: "Achaemenid Persia"
  archetype: archers
  rarity: rare
  playable: true
  history: "Persian shield archers represent a historically attested battlefield role in Achaemenid Persia forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { armor: +1, ranged: -1 }
  flavor: "A wicker wall and arrows."
  iconHint: "Tall shield"
```

```yaml
troop:
  id: spartanHoplites
  name: "Spartan hoplites"
  faction: "Sparta"
  archetype: spearmen
  rarity: rare
  playable: true
  history: "Spartan hoplites represent a historically attested battlefield role in Sparta forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { melee: +1, morale: +1 }
  flavor: "A disciplined narrow front."
  iconHint: "Lambda shield"
```

```yaml
troop:
  id: macedonianPhalanx
  name: "Macedonian phalanx"
  faction: "Macedon"
  archetype: pikemen
  rarity: rare
  playable: true
  history: "Macedonian phalanx represent a historically attested battlefield role in Macedon forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { morale: +1, armor: -1 }
  flavor: "A hedge of sarissas."
  iconHint: "Crossed pikes"
```

```yaml
troop:
  id: companionCavalry
  name: "Companion cavalry"
  faction: "Macedon"
  archetype: heavyCavalry
  rarity: epic
  playable: true
  history: "Companion cavalry represent a historically attested battlefield role in Macedon forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { impact: +1, morale: +1 }
  flavor: "The wedge seeks the gap."
  iconHint: "Horse and starburst"
```

```yaml
troop:
  id: thebanSacredBand
  name: "Theban Sacred Band"
  faction: "Thebes"
  archetype: heavySwordsmen
  rarity: epic
  playable: true
  history: "Theban Sacred Band represent a historically attested battlefield role in Thebes forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { melee: +1, morale: +1 }
  flavor: "Elite at the decisive point."
  iconHint: "Paired shields"
```

```yaml
troop:
  id: indianElephants
  name: "Indian war elephants"
  faction: "Paurava kingdom"
  archetype: warElephants
  rarity: legendary
  playable: true
  history: "Indian war elephants represent a historically attested battlefield role in Paurava kingdom forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { morale: +1, mp: -1 }
  flavor: "A living wall."
  iconHint: "Elephant head"
```



## Generals



```yaml
general:
  id: antiquityCaptain
  name: "Antiquity Captain"
  pennant: ANTIQUITYC
  lived: "unknown; composite card"
  faction: "Any"
  rarity: common
  playable: true
  bio: "A deliberately generic commander card for small city-state and imperial contingents."
  style: "Keeps a line together."
  trait: "Infantry +5% morale"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["J. F. Lazenby, The Defence of Greece (1993).", "A. B. Bosworth, Conquest and Empire (1988)."]
```

```yaml
general:
  id: antiquityScout
  name: "Antiquity Scout"
  pennant: ANTIQUITYS
  lived: "unknown; composite card"
  faction: "Any"
  rarity: uncommon
  playable: true
  bio: "A deliberately generic light-force commander card used where the sources do not securely name a battlefield commander."
  style: "Screens with light troops."
  trait: "Light cavalry +2 MP"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Pierre Briant, From Cyrus to Alexander (2002).", "A. B. Bosworth, Conquest and Empire (1988)."]
```

```yaml
general:
  id: shalmaneserIII
  name: "Shalmaneser III"
  pennant: SHALMANESE
  lived: "859–824 BC"
  faction: "Neo-Assyrian Empire"
  rarity: epic
  playable: true
  bio: "King of Assyria whose Kurkh Monolith records the Qarqar campaign. His victory claim is powerful evidence but also royal propaganda."
  style: "Coordinates archers, spears and mounted troops."
  trait: "Shooters +10% ranged"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["A. K. Grayson, Assyrian Rulers of the Early First Millennium BC II, RIMA 3 (1996).", "Karen Radner, Ancient Assyria (2015)."]
```

```yaml
general:
  id: hadadezer
  name: "Hadadezer of Damascus"
  pennant: HADADEZERO
  lived: "ninth century BC; exact dates unknown"
  faction: "Aram-Damascus"
  rarity: rare
  playable: false
  bio: "King of Damascus named by the Kurkh Monolith as a leading member of the anti-Assyrian coalition at Qarqar. His precise operational role is unknown."
  style: "Holds an allied line together."
  trait: "Army +5% morale"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["A. K. Grayson, RIMA 3 (1996).", "Hadi Ghantous, The Politics of God in Ancient Syria-Palestine (2013)."]
```

```yaml
general:
  id: miltiades
  name: "Miltiades"
  pennant: MILTIADES
  lived: "c. 550–489 BC"
  faction: "Athens"
  rarity: epic
  playable: true
  bio: "Athenian strategos traditionally associated with the Marathon plan. Herodotus is the principal narrative source; later tactical detail remains debated."
  style: "Wins on the wings, then closes inward."
  trait: "Flank attacks +15%"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Herodotus, Histories 6.102–117.", "Peter Krentz, The Battle of Marathon (2010)."]
```

```yaml
general:
  id: datis
  name: "Datis"
  pennant: DATIS
  lived: "early fifth century BC; dates unknown"
  faction: "Achaemenid Persia"
  rarity: rare
  playable: false
  bio: "Persian commander of the 490 BC expedition in Herodotus' account, operating with Artaphernes. The chain of command and tactics are not fully recoverable."
  style: "Uses missiles in open ground."
  trait: "Archers +10% ranged"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Herodotus, Histories 6.94–119.", "Pierre Briant, From Cyrus to Alexander (2002)."]
```

```yaml
general:
  id: leonidas
  name: "Leonidas I"
  pennant: LEONIDASI
  lived: "died 480 BC"
  faction: "Sparta"
  rarity: rare
  playable: true
  bio: "A Spartan king who commanded the Greek rearguard at Thermopylae. His last stand became central to later Greek memory."
  style: "Turns a pass into an equaliser."
  trait: "Infantry +10% melee"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Herodotus, Histories 7.201–239.", "J. F. Lazenby, The Defence of Greece (1993)."]
```

```yaml
general:
  id: xerxes
  name: "Xerxes I"
  pennant: XERXESI
  lived: "c. 518–465 BC"
  faction: "Achaemenid Persia"
  rarity: legendary
  playable: false
  bio: "Achaemenid king who led the invasion of Greece in 480 BC. Greek sources are hostile and must be read alongside the wider Persian imperial context."
  style: "Uses numbers to find an alternate route."
  trait: "Army +5% morale"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Herodotus, Histories 7–9.", "Pierre Briant, From Cyrus to Alexander (2002)."]
```

```yaml
general:
  id: pausanias
  name: "Pausanias"
  pennant: PAUSANIAS
  lived: "fl. 479 BC"
  faction: "Sparta and Greek alliance"
  rarity: rare
  playable: true
  bio: "Spartan regent and commander of the allied Greeks at Plataea in Herodotus' narrative. The army's decisions were coalition decisions, not a one-man performance."
  style: "Holds cohesion while withdrawing."
  trait: "Infantry +10% morale"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Herodotus, Histories 9.1–89.", "J. F. Lazenby, The Defence of Greece (1993)."]
```

```yaml
general:
  id: mardonius
  name: "Mardonius"
  pennant: MARDONIUS
  lived: "died 479 BC"
  faction: "Achaemenid Persia"
  rarity: epic
  playable: false
  bio: "Persian noble and field commander in Greece after Xerxes' departure. He was killed in the fighting at Plataea."
  style: "Presses a divided enemy."
  trait: "Cavalry +10% impact"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Herodotus, Histories 8.100–9.64.", "Pierre Briant, From Cyrus to Alexander (2002)."]
```

```yaml
general:
  id: epaminondas
  name: "Epaminondas"
  pennant: EPAMINONDA
  lived: "c. 418–362 BC"
  faction: "Thebes"
  rarity: legendary
  playable: true
  bio: "Theban statesman and commander associated with the deep left at Leuctra and the decisive effort at Mantinea. Later tradition magnifies his individual control of events."
  style: "Concentrates force at one decisive point."
  trait: "Infantry flank attacks +15%"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Xenophon, Hellenica 6.4 and 7.5.", "John Buckler, The Theban Hegemony (1980)."]
```

```yaml
general:
  id: cleombrotus
  name: "Cleombrotus I"
  pennant: CLEOMBROTU
  lived: "died 371 BC"
  faction: "Sparta"
  rarity: rare
  playable: false
  bio: "Spartan king killed at Leuctra. The surviving account does not permit a detailed reconstruction of his tactical intentions."
  style: "Trusts a conventional Spartan clash."
  trait: "Spearmen +10% melee"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Xenophon, Hellenica 6.4.", "John Buckler, The Theban Hegemony (1980)."]
```

```yaml
general:
  id: philipII
  name: "Philip II"
  pennant: PHILIPII
  lived: "382–336 BC"
  faction: "Macedon"
  rarity: epic
  playable: true
  bio: "King of Macedon who defeated the Greek coalition at Chaeronea. The battle's exact sequence is less certain than its strategic consequence."
  style: "Uses pikes to rupture a linked line."
  trait: "Pikemen +10% morale"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Diodorus Siculus, Library 16.84–86.", "Ian Worthington, Philip II of Macedonia (2008)."]
```

```yaml
general:
  id: alexander
  name: "Alexander the Great"
  pennant: ALEXANDERT
  lived: "356–323 BC"
  faction: "Macedon"
  rarity: legendary
  playable: true
  bio: "Macedonian king whose campaigns joined a pike infantry core to aggressive companion cavalry. Arrian is the fullest surviving account but was written centuries after the events."
  style: "Fixes with infantry and strikes with cavalry."
  trait: "Cavalry +10% impact"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Arrian, Anabasis of Alexander.", "A. B. Bosworth, Conquest and Empire (1988)."]
```

```yaml
general:
  id: dariusIII
  name: "Darius III"
  pennant: DARIUSIII
  lived: "c. 380–330 BC"
  faction: "Achaemenid Persia"
  rarity: legendary
  playable: false
  bio: "Last Achaemenid king, defeated by Alexander at Issus and Gaugamela. Later Greek and Roman narratives often minimise his agency."
  style: "Uses broad fronts and cavalry wings."
  trait: "Army +5% morale"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Arrian, Anabasis 2–3.", "Pierre Briant, From Cyrus to Alexander (2002)."]
```

```yaml
general:
  id: porus
  name: "Porus"
  pennant: PORUS
  lived: "fourth century BC; dates unknown"
  faction: "Paurava kingdom"
  rarity: epic
  playable: true
  bio: "Ruler of a kingdom east of the Hydaspes who opposed Alexander with cavalry, infantry and elephants. His name and exact realm are transmitted through Greek sources."
  style: "Anchors a line on elephants."
  trait: "War elephants +10% morale"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Arrian, Anabasis 5.8–18.", "Waldemar Heckel, Who's Who in the Age of Alexander (2006)."]
```

```yaml
general:
  id: pagondas
  name: "Pagondas"
  pennant: PAGONDAS
  lived: "fl. 424 BC"
  faction: "Boeotia"
  rarity: rare
  playable: true
  bio: "Boeotian commander at Delium, credited by Thucydides with a deep formation and a reserve. This is unusually valuable near-contemporary tactical testimony."
  style: "Uses a deep wing and reserve."
  trait: "Infantry +10% melee"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Thucydides, History 4.89–101.", "Donald Kagan, The Archidamian War (1974)."]
```

```yaml
general:
  id: agisII
  name: "Agis II"
  pennant: AGISII
  lived: "c. 445–400 BC"
  faction: "Sparta"
  rarity: rare
  playable: true
  bio: "Spartan king who commanded at Mantinea in 418 BC. Thucydides reports both his problematic redeployment and the eventual Spartan victory."
  style: "Repairs formation under pressure."
  trait: "Spearmen +10% morale"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Thucydides, History 5.63–74.", "Donald Kagan, The Peace of Nicias and the Sicilian Expedition (1981)."]
```

```yaml
general:
  id: cyrusYounger
  name: "Cyrus the Younger"
  pennant: CYRUSTHEYO
  lived: "c. 424–401 BC"
  faction: "Persian rebels"
  rarity: rare
  playable: true
  bio: "Achaemenid prince who recruited Greek mercenaries in an attempt to seize the throne. He died at Cunaxa after pressing toward Artaxerxes."
  style: "Risks all on a strike at the king."
  trait: "Hoplites +10% melee"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Xenophon, Anabasis 1.7–10.", "Pierre Briant, From Cyrus to Alexander (2002)."]
```

```yaml
general:
  id: agesilaus
  name: "Agesilaus II"
  pennant: AGESILAUSI
  lived: "c. 444–360 BC"
  faction: "Sparta"
  rarity: epic
  playable: true
  bio: "Spartan king who fought at Coronea after campaigning in Asia Minor. Xenophon's close association with him makes source criticism essential."
  style: "Sustains a costly frontal fight."
  trait: "Infantry +10% morale"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Xenophon, Hellenica 4.3.15–21.", "Paul Cartledge, Agesilaos and the Crisis of Sparta (1987)."]
```

```yaml
general:
  id: ariobarzanes
  name: "Ariobarzanes"
  pennant: ARIOBARZAN
  lived: "died 330 BC"
  faction: "Achaemenid Persia"
  rarity: rare
  playable: false
  bio: "Persian commander who defended the Persian Gate against Alexander. The terrain and route of the turning movement remain contested."
  style: "Turns a pass into a killing ground."
  trait: "Rough-terrain units +10% morale"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Arrian, Anabasis 3.18.", "Quintus Curtius Rufus, History of Alexander 5.3–4."]
```

```yaml
general:
  id: sakaChiefs
  name: "Saka chiefs"
  pennant: SAKACHIEFS
  lived: "unknown; composite card"
  faction: "Saka peoples"
  rarity: common
  playable: false
  bio: "A collective card for the Saka leaders reported in the Jaxartes campaign; the surviving sources do not securely preserve one opposing commander."
  style: "Uses mobile mounted archery."
  trait: "Light cavalry +3 MP"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Arrian, Anabasis 4.1–4.", "A. B. Bosworth, Conquest and Empire (1988)."]
```



## Battles



```yaml
battle:
  id: qarqar
  name: "Qarqar"
  date: "853 BC"
  orderInAge: 1
  node: main
  branchesFrom: null
  reward: null
  challengeType: lineAndFlank
  location: { modernPlace: "Tell Qarqur area, Syria", lat: 35.59, lon: 36.39, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Neo-Assyrian Empire"
    commander: shalmaneserIII
    generalRank: 2
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: antiquitySpearmen, level: 1, role: "centre" }, { card: antiquityArchers, level: 1, role: "left wing" }, { card: antiquityLightCavalry, level: 1, role: "right wing" }]
  enemy:
    faction: "Syro-Palestinian coalition"
    commander: hadadezer
    generalRank: 3
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: antiquitySpearmen, level: 1, role: "centre" }, { card: antiquityArchers, level: 1, role: "left wing" }, { card: antiquityLightCavalry, level: 1, role: "right wing" }]
  whatHappened: "Shalmaneser claimed victory over a coalition that nonetheless survived. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Break one coalition wing before its chariots turn the flank."
  problem: "Break one coalition wing before its chariots turn the flank."
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
  objective: { type: breakArmy, detail: "Break one coalition wing before its chariots turn the flank." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 1
  briefing: "Qarqar: Shalmaneser claimed victory over a coalition that nonetheless survived. Tactical hint: Break one coalition wing before its chariots turn the flank."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["A. K. Grayson, Assyrian Rulers of the Early First Millennium BC II, RIMA 3 (1996).", "Hadi Ghantous, The Politics of God in Ancient Syria-Palestine (2013)."]
```

```yaml
battle:
  id: marathon
  name: "Marathon"
  date: "490 BC"
  orderInAge: 2
  node: main
  branchesFrom: null
  reward: null
  challengeType: lineAndFlank
  location: { modernPlace: "Marathon plain, Greece", lat: 38.15, lon: 23.97, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Athens"
    commander: miltiades
    generalRank: 2
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: hoplitePhalanx, level: 1, role: "centre" }, { card: hoplitePhalanx, level: 1, role: "left wing" }, { card: antiquitySkirmishers, level: 1, role: "right wing" }]
  enemy:
    faction: "Achaemenid Persia"
    commander: datis
    generalRank: 3
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: persianShieldArchers, level: 1, role: "centre" }, { card: persianShieldArchers, level: 1, role: "left wing" }, { card: antiquityLightCavalry, level: 1, role: "right wing" }]
  whatHappened: "Greek wings defeated the Persian wings and closed on the centre. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Delay in the centre while both wings close the trap."
  problem: "Delay in the centre while both wings close the trap."
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
  objective: { type: breakArmy, detail: "Delay in the centre while both wings close the trap." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 1
  briefing: "Marathon: Greek wings defeated the Persian wings and closed on the centre. Tactical hint: Delay in the centre while both wings close the trap."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Herodotus, Histories 6.102–117.", "Peter Krentz, The Battle of Marathon (2010)."]
```

```yaml
battle:
  id: thermopylae
  name: "Thermopylae"
  date: "480 BC"
  orderInAge: 3
  node: main
  branchesFrom: null
  reward: null
  challengeType: desperateDefence
  location: { modernPlace: "Thermopylae, Greece", lat: 38.8, lon: 22.54, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Sparta"
    commander: leonidas
    generalRank: 3
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: spartanHoplites, level: 1, role: "centre" }, { card: spartanHoplites, level: 1, role: "left wing" }, { card: antiquitySkirmishers, level: 1, role: "right wing" }]
  enemy:
    faction: "Achaemenid Persia"
    commander: xerxes
    generalRank: 4
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: persianShieldArchers, level: 2, role: "centre" }, { card: persianShieldArchers, level: 2, role: "left wing" }, { card: antiquityLightCavalry, level: 2, role: "right wing" }]
  whatHappened: "The Greek rearguard held a narrow pass until it was outflanked; the player uses the underdog defence. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Hold the pass until the rear route decides the fight."
  problem: "Hold the pass until the rear route decides the fight."
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
  objective: { type: holdOut, detail: "Hold the pass until the rear route decides the fight." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 2
  briefing: "Thermopylae: The Greek rearguard held a narrow pass until it was outflanked; the player uses the underdog defence. Tactical hint: Hold the pass until the rear route decides the fight."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Herodotus, Histories 7.201–239.", "J. F. Lazenby, The Defence of Greece (1993)."]
```

```yaml
battle:
  id: plataea
  name: "Plataea"
  date: "479 BC"
  orderInAge: 4
  node: main
  branchesFrom: null
  reward: null
  challengeType: holdUntilReinforcements
  location: { modernPlace: "near Plataea, Greece", lat: 38.21, lon: 23.25, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Sparta and Greek alliance"
    commander: pausanias
    generalRank: 3
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: antiquitySpearmen, level: 1, role: "centre" }, { card: antiquityArchers, level: 1, role: "left wing" }, { card: antiquityLightCavalry, level: 1, role: "right wing" }]
  enemy:
    faction: "Achaemenid Persia"
    commander: mardonius
    generalRank: 4
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: persianShieldArchers, level: 2, role: "centre" }, { card: persianShieldArchers, level: 2, role: "left wing" }, { card: antiquityLightCavalry, level: 2, role: "right wing" }]
  whatHappened: "Mardonius attacked a fragmented Greek withdrawal and was killed after key infantry held. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Keep the divided line alive until allies reform."
  problem: "Keep the divided line alive until allies reform."
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
  objective: { type: holdOut, detail: "Keep the divided line alive until allies reform." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 2
  briefing: "Plataea: Mardonius attacked a fragmented Greek withdrawal and was killed after key infantry held. Tactical hint: Keep the divided line alive until allies reform."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Herodotus, Histories 9.1–89.", "J. F. Lazenby, The Defence of Greece (1993)."]
```

```yaml
battle:
  id: delium
  name: "Delium"
  date: "424 BC"
  orderInAge: 5
  node: optional
  branchesFrom: plataea
  reward: "general: pagondas"
  challengeType: holdUntilReinforcements
  location: { modernPlace: "Delium, Boeotia", lat: 38.37, lon: 23.55, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Boeotia"
    commander: pagondas
    generalRank: 4
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: antiquitySpearmen, level: 2, role: "centre" }, { card: antiquityArchers, level: 2, role: "left wing" }, { card: antiquityLightCavalry, level: 2, role: "right wing" }]
  enemy:
    faction: "Athens"
    commander: antiquityCaptain
    generalRank: 5
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: hoplitePhalanx, level: 2, role: "centre" }, { card: hoplitePhalanx, level: 2, role: "left wing" }, { card: antiquitySkirmishers, level: 2, role: "right wing" }]
  whatHappened: "Pagondas' deep wing and reserve turned an Athenian local success. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Pin the line until the reserve reaches its exposed wing."
  problem: "Pin the line until the reserve reaches its exposed wing."
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
  objective: { type: holdOut, detail: "Pin the line until the reserve reaches its exposed wing." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 3
  briefing: "Delium: Pagondas' deep wing and reserve turned an Athenian local success. Tactical hint: Pin the line until the reserve reaches its exposed wing."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Thucydides, History 4.89–101.", "Donald Kagan, The Archidamian War (1974)."]
```

```yaml
battle:
  id: mantinea418
  name: "Mantinea"
  date: "418 BC"
  orderInAge: 6
  node: optional
  branchesFrom: plataea
  reward: "general: agisII"
  challengeType: lineAndFlank
  location: { modernPlace: "Mantinea plain, Arcadia", lat: 37.62, lon: 22.39, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Sparta"
    commander: agisII
    generalRank: 4
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: spartanHoplites, level: 2, role: "centre" }, { card: spartanHoplites, level: 2, role: "left wing" }, { card: antiquitySkirmishers, level: 2, role: "right wing" }]
  enemy:
    faction: "Argive-Athenian coalition"
    commander: antiquityCaptain
    generalRank: 5
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: antiquitySpearmen, level: 2, role: "centre" }, { card: antiquityArchers, level: 2, role: "left wing" }, { card: antiquityLightCavalry, level: 2, role: "right wing" }]
  whatHappened: "Agis repaired a risky redeployment and won a hard phalanx battle. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Repair the gap before the enemy overlaps it."
  problem: "Repair the gap before the enemy overlaps it."
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
  objective: { type: breakArmy, detail: "Repair the gap before the enemy overlaps it." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 3
  briefing: "Mantinea: Agis repaired a risky redeployment and won a hard phalanx battle. Tactical hint: Repair the gap before the enemy overlaps it."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Thucydides, History 5.63–74.", "Donald Kagan, The Peace of Nicias and the Sicilian Expedition (1981)."]
```

```yaml
battle:
  id: cunaxa
  name: "Cunaxa"
  date: "401 BC"
  orderInAge: 7
  node: optional
  branchesFrom: plataea
  reward: "general: cyrusYounger"
  challengeType: strikeTheCommander
  location: { modernPlace: "near Babylon, Iraq", lat: 33.65, lon: 44.2, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Persian rebels"
    commander: cyrusYounger
    generalRank: 4
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: antiquitySpearmen, level: 2, role: "centre" }, { card: antiquityArchers, level: 2, role: "left wing" }, { card: antiquityLightCavalry, level: 2, role: "right wing" }]
  enemy:
    faction: "Achaemenid Persia"
    commander: antiquityCaptain
    generalRank: 5
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: persianShieldArchers, level: 2, role: "centre" }, { card: persianShieldArchers, level: 2, role: "left wing" }, { card: antiquityLightCavalry, level: 2, role: "right wing" }]
  whatHappened: "Cyrus died attacking Artaxerxes II despite local success by his Greek wing. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Open a safe route to the enemy general."
  problem: "Open a safe route to the enemy general."
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
  objective: { type: killGeneral, detail: "Open a safe route to the enemy general." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 3
  briefing: "Cunaxa: Cyrus died attacking Artaxerxes II despite local success by his Greek wing. Tactical hint: Open a safe route to the enemy general."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Xenophon, Anabasis 1.7–10.", "Pierre Briant, From Cyrus to Alexander (2002)."]
```

```yaml
battle:
  id: coronea
  name: "Coronea"
  date: "394 BC"
  orderInAge: 8
  node: optional
  branchesFrom: leuctra
  reward: "general: agesilaus"
  challengeType: attrition
  location: { modernPlace: "Coronea, Boeotia", lat: 38.45, lon: 22.95, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Sparta"
    commander: agesilaus
    generalRank: 4
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: spartanHoplites, level: 2, role: "centre" }, { card: spartanHoplites, level: 2, role: "left wing" }, { card: antiquitySkirmishers, level: 2, role: "right wing" }]
  enemy:
    faction: "Greek coalition"
    commander: antiquityCaptain
    generalRank: 5
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: antiquitySpearmen, level: 2, role: "centre" }, { card: antiquityArchers, level: 2, role: "left wing" }, { card: antiquityLightCavalry, level: 2, role: "right wing" }]
  whatHappened: "Both sides won on a wing before a brutal central contest. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Endure the centre and stop the enemy wing rolling up the line."
  problem: "Endure the centre and stop the enemy wing rolling up the line."
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
  objective: { type: breakArmy, detail: "Endure the centre and stop the enemy wing rolling up the line." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 3
  briefing: "Coronea: Both sides won on a wing before a brutal central contest. Tactical hint: Endure the centre and stop the enemy wing rolling up the line."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Xenophon, Hellenica 4.3.15–21.", "Paul Cartledge, Agesilaos and the Crisis of Sparta (1987)."]
```

```yaml
battle:
  id: leuctra
  name: "Leuctra"
  date: "371 BC"
  orderInAge: 9
  node: main
  branchesFrom: null
  reward: null
  challengeType: lineAndFlank
  location: { modernPlace: "Leuctra, Boeotia", lat: 38.32, lon: 23.19, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Thebes"
    commander: epaminondas
    generalRank: 4
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: hoplitePhalanx, level: 2, role: "centre" }, { card: thebanSacredBand, level: 2, role: "left wing" }, { card: antiquityLightCavalry, level: 2, role: "right wing" }]
  enemy:
    faction: "Sparta"
    commander: cleombrotus
    generalRank: 5
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: spartanHoplites, level: 2, role: "centre" }, { card: spartanHoplites, level: 2, role: "left wing" }, { card: antiquitySkirmishers, level: 2, role: "right wing" }]
  whatHappened: "Theban mass on the left broke the Spartan king's wing. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Break the king's wing before the refused right must fight."
  problem: "Break the king's wing before the refused right must fight."
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
  objective: { type: breakArmy, detail: "Break the king's wing before the refused right must fight." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 3
  briefing: "Leuctra: Theban mass on the left broke the Spartan king's wing. Tactical hint: Break the king's wing before the refused right must fight."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Xenophon, Hellenica 6.4.", "John Buckler, The Theban Hegemony (1980)."]
```

```yaml
battle:
  id: mantinea362
  name: "Mantinea"
  date: "362 BC"
  orderInAge: 10
  node: optional
  branchesFrom: leuctra
  reward: "troop: thebanSacredBand"
  challengeType: cavalryAndPursuit
  location: { modernPlace: "Mantinea plain, Arcadia", lat: 37.62, lon: 22.39, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Thebes"
    commander: epaminondas
    generalRank: 5
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: hoplitePhalanx, level: 2, role: "centre" }, { card: thebanSacredBand, level: 2, role: "left wing" }, { card: antiquityLightCavalry, level: 2, role: "right wing" }]
  enemy:
    faction: "Mantinean coalition"
    commander: antiquityCaptain
    generalRank: 6
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: antiquitySpearmen, level: 3, role: "centre" }, { card: antiquityArchers, level: 3, role: "left wing" }, { card: antiquityLightCavalry, level: 3, role: "right wing" }]
  whatHappened: "Epaminondas won a local breakthrough but died in the battle. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Mask the concentration and preserve Epaminondas."
  problem: "Mask the concentration and preserve Epaminondas."
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
  objective: { type: breakArmy, detail: "Mask the concentration and preserve Epaminondas." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 4
  briefing: "Mantinea: Epaminondas won a local breakthrough but died in the battle. Tactical hint: Mask the concentration and preserve Epaminondas."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Xenophon, Hellenica 7.5.", "John Buckler, The Theban Hegemony (1980)."]
```

```yaml
battle:
  id: chaeronea
  name: "Chaeronea"
  date: "338 BC"
  orderInAge: 11
  node: main
  branchesFrom: null
  reward: null
  challengeType: lineAndFlank
  location: { modernPlace: "Chaeronea, Greece", lat: 38.49, lon: 22.85, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Macedon"
    commander: philipII
    generalRank: 4
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: macedonianPhalanx, level: 2, role: "centre" }, { card: companionCavalry, level: 2, role: "left wing" }, { card: antiquitySkirmishers, level: 2, role: "right wing" }]
  enemy:
    faction: "Greek coalition"
    commander: antiquityCaptain
    generalRank: 5
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: antiquitySpearmen, level: 2, role: "centre" }, { card: antiquityArchers, level: 2, role: "left wing" }, { card: antiquityLightCavalry, level: 2, role: "right wing" }]
  whatHappened: "Philip defeated the allied Greek line; detailed manoeuvres are sparse. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Create a seam before the coalition reforms."
  problem: "Create a seam before the coalition reforms."
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
  objective: { type: breakArmy, detail: "Create a seam before the coalition reforms." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 3
  briefing: "Chaeronea: Philip defeated the allied Greek line; detailed manoeuvres are sparse. Tactical hint: Create a seam before the coalition reforms."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Diodorus Siculus, Library 16.84–86.", "Ian Worthington, Philip II of Macedonia (2008)."]
```

```yaml
battle:
  id: granicus
  name: "Granicus"
  date: "May 334 BC"
  orderInAge: 12
  node: main
  branchesFrom: null
  reward: null
  challengeType: riverCrossing
  location: { modernPlace: "Kocabaş Çay, Turkey", lat: 39.96, lon: 27.45, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Macedon"
    commander: alexander
    generalRank: 4
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: macedonianPhalanx, level: 2, role: "centre" }, { card: companionCavalry, level: 2, role: "left wing" }, { card: antiquitySkirmishers, level: 2, role: "right wing" }]
  enemy:
    faction: "Achaemenid Persia"
    commander: antiquityCaptain
    generalRank: 5
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: persianShieldArchers, level: 2, role: "centre" }, { card: persianShieldArchers, level: 2, role: "left wing" }, { card: antiquityLightCavalry, level: 2, role: "right wing" }]
  whatHappened: "Alexander secured a contested riverbank and isolated Persian infantry; Persian satraps, not Darius III, commanded locally. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Force a bridgehead before cavalry crushes the crossing."
  problem: "Force a bridgehead before cavalry crushes the crossing."
  terrain: "The map abstracts the decisive ground into a small tactical board and does not claim exact formation positions."
  mapSketch: |
    .......~~.......
    .AAA...~~.EEE...
    .AAA...ff.EEE...
    .AAA...~~.EEE...
    .......~~.......
    ................
    ................
    ................
    ................
    ................
  # legend: . open  r rough  F forest  H hill  ~ river  f ford  B bridge  M marsh  V village  W fieldworks  = road  A player  E enemy
  conditions: { weather: clear, fogOfWar: false, reinforcements: [], special: [] }
  objective: { type: breakArmy, detail: "Force a bridgehead before cavalry crushes the crossing." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 3
  briefing: "Granicus: Alexander secured a contested riverbank and isolated Persian infantry; Persian satraps, not Darius III, commanded locally. Tactical hint: Force a bridgehead before cavalry crushes the crossing."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Arrian, Anabasis 1.12–16.", "A. B. Bosworth, A Historical Commentary on Arrian, vol. I (1980)."]
```

```yaml
battle:
  id: issus
  name: "Issus"
  date: "333 BC"
  orderInAge: 13
  node: main
  branchesFrom: null
  reward: null
  challengeType: passBridgeOrFord
  location: { modernPlace: "near Issus, Turkey", lat: 36.98, lon: 36.2, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Macedon"
    commander: alexander
    generalRank: 5
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: macedonianPhalanx, level: 2, role: "centre" }, { card: companionCavalry, level: 2, role: "left wing" }, { card: antiquitySkirmishers, level: 2, role: "right wing" }]
  enemy:
    faction: "Achaemenid Persia"
    commander: dariusIII
    generalRank: 6
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: persianShieldArchers, level: 3, role: "centre" }, { card: persianShieldArchers, level: 3, role: "left wing" }, { card: antiquityLightCavalry, level: 3, role: "right wing" }]
  whatHappened: "Narrow ground limited Persian numbers as Alexander pressed toward Darius. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Cross the stream and threaten the king before the centre breaks."
  problem: "Cross the stream and threaten the king before the centre breaks."
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
  objective: { type: holdPoint, detail: "Cross the stream and threaten the king before the centre breaks." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 4
  briefing: "Issus: Narrow ground limited Persian numbers as Alexander pressed toward Darius. Tactical hint: Cross the stream and threaten the king before the centre breaks."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Arrian, Anabasis 2.6–12.", "A. B. Bosworth, Conquest and Empire (1988)."]
```

```yaml
battle:
  id: gaugamela
  name: "Gaugamela"
  date: "1 October 331 BC"
  orderInAge: 14
  node: main
  branchesFrom: null
  reward: null
  challengeType: lineAndFlank
  location: { modernPlace: "near Mosul, Iraq", lat: 36.36, lon: 43.25, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Macedon"
    commander: alexander
    generalRank: 6
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: macedonianPhalanx, level: 3, role: "centre" }, { card: companionCavalry, level: 3, role: "left wing" }, { card: antiquitySkirmishers, level: 3, role: "right wing" }]
  enemy:
    faction: "Achaemenid Persia"
    commander: dariusIII
    generalRank: 7
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: persianShieldArchers, level: 3, role: "centre" }, { card: persianShieldArchers, level: 3, role: "left wing" }, { card: antiquityLightCavalry, level: 3, role: "right wing" }]
  whatHappened: "Alexander's oblique advance created a gap in a broad Persian line. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Survive envelopment and strike the gap."
  problem: "Survive envelopment and strike the gap."
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
  objective: { type: breakArmy, detail: "Survive envelopment and strike the gap." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 5
  briefing: "Gaugamela: Alexander's oblique advance created a gap in a broad Persian line. Tactical hint: Survive envelopment and strike the gap."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Arrian, Anabasis 3.7–15.", "A. B. Bosworth, Conquest and Empire (1988)."]
```

```yaml
battle:
  id: persianGate
  name: "Persian Gate"
  date: "winter 331/330 BC"
  orderInAge: 15
  node: optional
  branchesFrom: gaugamela
  reward: "troop: antiquitySkirmishers"
  challengeType: passBridgeOrFord
  location: { modernPlace: "Zagros approaches, Iran", lat: 30.55, lon: 51.85, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Macedon"
    commander: alexander
    generalRank: 6
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: macedonianPhalanx, level: 3, role: "centre" }, { card: companionCavalry, level: 3, role: "left wing" }, { card: antiquitySkirmishers, level: 3, role: "right wing" }]
  enemy:
    faction: "Achaemenid Persia"
    commander: ariobarzanes
    generalRank: 7
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: persianShieldArchers, level: 3, role: "centre" }, { card: persianShieldArchers, level: 3, role: "left wing" }, { card: antiquityLightCavalry, level: 3, role: "right wing" }]
  whatHappened: "Ariobarzanes blocked a pass until Alexander found a route around it. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Secure the alternate mountain route."
  problem: "Secure the alternate mountain route."
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
  objective: { type: holdPoint, detail: "Secure the alternate mountain route." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 5
  briefing: "Persian Gate: Ariobarzanes blocked a pass until Alexander found a route around it. Tactical hint: Secure the alternate mountain route."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Arrian, Anabasis 3.18.", "Quintus Curtius Rufus, History of Alexander 5.3–4."]
```

```yaml
battle:
  id: jaxartes
  name: "Jaxartes"
  date: "329 BC"
  orderInAge: 16
  node: optional
  branchesFrom: gaugamela
  reward: "troop: antiquityLightCavalry"
  challengeType: riverCrossing
  location: { modernPlace: "near Khujand, Tajikistan", lat: 40.28, lon: 69.63, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Macedon"
    commander: alexander
    generalRank: 6
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: macedonianPhalanx, level: 3, role: "centre" }, { card: companionCavalry, level: 3, role: "left wing" }, { card: antiquitySkirmishers, level: 3, role: "right wing" }]
  enemy:
    faction: "Saka peoples"
    commander: sakaChiefs
    generalRank: 7
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: antiquitySpearmen, level: 3, role: "centre" }, { card: antiquityArchers, level: 3, role: "left wing" }, { card: antiquityLightCavalry, level: 3, role: "right wing" }]
  whatHappened: "Macedonian missiles covered a river crossing against mobile Saka opponents. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Cross under cover and catch horse archers."
  problem: "Cross under cover and catch horse archers."
  terrain: "The map abstracts the decisive ground into a small tactical board and does not claim exact formation positions."
  mapSketch: |
    .......~~.......
    .AAA...~~.EEE...
    .AAA...ff.EEE...
    .AAA...~~.EEE...
    .......~~.......
    ................
    ................
    ................
    ................
    ................
  # legend: . open  r rough  F forest  H hill  ~ river  f ford  B bridge  M marsh  V village  W fieldworks  = road  A player  E enemy
  conditions: { weather: clear, fogOfWar: false, reinforcements: [], special: [] }
  objective: { type: breakArmy, detail: "Cross under cover and catch horse archers." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 5
  briefing: "Jaxartes: Macedonian missiles covered a river crossing against mobile Saka opponents. Tactical hint: Cross under cover and catch horse archers."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Arrian, Anabasis 4.1–4.", "A. B. Bosworth, Conquest and Empire (1988)."]
```

```yaml
battle:
  id: hydaspes
  name: "Hydaspes"
  date: "326 BC"
  orderInAge: 17
  node: main
  branchesFrom: null
  reward: null
  challengeType: riverCrossing
  location: { modernPlace: "Jhelum River, Pakistan", lat: 32.94, lon: 73.73, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Macedon"
    commander: alexander
    generalRank: 6
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: macedonianPhalanx, level: 3, role: "centre" }, { card: companionCavalry, level: 3, role: "left wing" }, { card: antiquitySkirmishers, level: 3, role: "right wing" }]
  enemy:
    faction: "Paurava kingdom"
    commander: porus
    generalRank: 7
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: indianElephants, level: 3, role: "centre" }, { card: antiquitySpearmen, level: 3, role: "left wing" }, { card: antiquityLightCavalry, level: 3, role: "right wing" }]
  whatHappened: "Alexander crossed away from his camp and defeated Porus' cavalry and elephants. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Cross unseen, win the cavalry fight, then dismantle elephants."
  problem: "Cross unseen, win the cavalry fight, then dismantle elephants."
  terrain: "The map abstracts the decisive ground into a small tactical board and does not claim exact formation positions."
  mapSketch: |
    .......~~.......
    .AAA...~~.EEE...
    .AAA...ff.EEE...
    .AAA...~~.EEE...
    .......~~.......
    ................
    ................
    ................
    ................
    ................
  # legend: . open  r rough  F forest  H hill  ~ river  f ford  B bridge  M marsh  V village  W fieldworks  = road  A player  E enemy
  conditions: { weather: rain, fogOfWar: false, reinforcements: [], special: [] }
  objective: { type: breakArmy, detail: "Cross unseen, win the cavalry fight, then dismantle elephants." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 5
  briefing: "Hydaspes: Alexander crossed away from his camp and defeated Porus' cavalry and elephants. Tactical hint: Cross unseen, win the cavalry fight, then dismantle elephants."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Arrian, Anabasis 5.8–18.", "Quintus Curtius Rufus, History of Alexander 8.13–14."]
```



## Notes



- **Swaps:** None from the approved list.

- **Uncertain facts:** Exact strengths, casualties, battlefield micro-topography and several command details remain disputed.

- **Questions for the owner:** Should optional-node rewards be guaranteed on first completion, or enter the normal card pool after unlock?
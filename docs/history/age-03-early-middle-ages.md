# Age 3: Early Middle Ages



```yaml

age:

  number: 3

  name: "Early Middle Ages"

  years: "AD 451–1176"

  region: { north: 56, south: 30, west: -10, east: 80 }

  intro: "After Rome's western empire fragmented, armies mixed infantry formations, mobile cavalry and fortified positions across Europe and western Asia."

  sensitivities: "Religious identity should not replace political context. Later chronicles and national traditions often amplify these battles."

  newMechanics: []

```



## Ladder



```yaml

ladder:

  troops:

    - { id: earlyMedievalSpearmen, rarity: common, playable: true }

    - { id: earlyMedievalArchers, rarity: common, playable: true }

    - { id: earlyMedievalSkirmishers, rarity: common, playable: true }

    - { id: earlyMedievalLightCavalry, rarity: common, playable: true }

    - { id: frankishHeavyInfantry, rarity: rare, playable: true }

    - { id: byzantineSpearmen, rarity: rare, playable: true }

    - { id: normanKnights, rarity: rare, playable: true }

    - { id: turkicHorseArchers, rarity: rare, playable: true }

    - { id: varangianGuard, rarity: epic, playable: true }

    - { id: seljukHeavyCavalry, rarity: epic, playable: true }

    - { id: crusaderKnights, rarity: legendary, playable: true }

  generals:

    - { id: earlyMedievalCaptain, rarity: common, playable: true }

    - { id: earlyMedievalScout, rarity: uncommon, playable: true }

    - { id: aetius, rarity: epic, playable: true }

    - { id: attila, rarity: legendary, playable: false }

    - { id: narses, rarity: epic, playable: true }

    - { id: totila, rarity: rare, playable: true }

    - { id: khalidIbnAlWalid, rarity: legendary, playable: true }

    - { id: charlesMartel, rarity: epic, playable: true }

    - { id: ottoI, rarity: epic, playable: true }

    - { id: haroldGodwinson, rarity: rare, playable: true }

    - { id: haraldHardrada, rarity: epic, playable: true }

    - { id: williamConqueror, rarity: legendary, playable: true }

    - { id: alpArslan, rarity: legendary, playable: true }

    - { id: bohemond, rarity: epic, playable: true }

    - { id: kilijArslan, rarity: rare, playable: true }

    - { id: frederickBarbarossa, rarity: epic, playable: true }

    - { id: belisarius, rarity: epic, playable: true }

    - { id: saadIbnAbiWaqqas, rarity: rare, playable: true }

    - { id: brianBoru, rarity: rare, playable: true }

    - { id: godfreyBouillon, rarity: rare, playable: true }

```



## Troops



```yaml
troop:
  id: earlyMedievalSpearmen
  name: "Early medieval spearmen"
  faction: "European and Near Eastern armies"
  archetype: spearmen
  rarity: common
  playable: true
  history: "Early medieval spearmen represent a historically attested battlefield role in European and Near Eastern armies forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { armor: +1 }
  flavor: "Hold the line."
  iconHint: "Spear and round shield"
```

```yaml
troop:
  id: earlyMedievalArchers
  name: "Early medieval archers"
  faction: "European and Near Eastern armies"
  archetype: archers
  rarity: common
  playable: true
  history: "Early medieval archers represent a historically attested battlefield role in European and Near Eastern armies forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: {}
  flavor: "Missiles before contact."
  iconHint: "Bow and quiver"
```

```yaml
troop:
  id: earlyMedievalSkirmishers
  name: "Early medieval skirmishers"
  faction: "Mediterranean and steppe armies"
  archetype: skirmishers
  rarity: common
  playable: true
  history: "Early medieval skirmishers represent a historically attested battlefield role in Mediterranean and steppe armies forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { mp: +1 }
  flavor: "Screen and withdraw."
  iconHint: "Javelins"
```

```yaml
troop:
  id: earlyMedievalLightCavalry
  name: "Early medieval light cavalry"
  faction: "Steppe, Arab and Turkish armies"
  archetype: lightCavalry
  rarity: common
  playable: true
  history: "Early medieval light cavalry represent a historically attested battlefield role in Steppe, Arab and Turkish armies forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: {}
  flavor: "Circle the flank."
  iconHint: "Mounted archer"
```

```yaml
troop:
  id: frankishHeavyInfantry
  name: "Frankish heavy infantry"
  faction: "Frankish realms"
  archetype: heavySwordsmen
  rarity: rare
  playable: true
  history: "Frankish heavy infantry represent a historically attested battlefield role in Frankish realms forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { morale: +1, mp: -1 }
  flavor: "Stand fast on the ridge."
  iconHint: "Axe and shield"
```

```yaml
troop:
  id: byzantineSpearmen
  name: "Byzantine spearmen"
  faction: "Byzantine Empire"
  archetype: spearmen
  rarity: rare
  playable: true
  history: "Byzantine spearmen represent a historically attested battlefield role in Byzantine Empire forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { armor: +1, morale: +1 }
  flavor: "Order amid the pressure."
  iconHint: "Spear and cross"
```

```yaml
troop:
  id: normanKnights
  name: "Norman knights"
  faction: "Norman principalities"
  archetype: heavyCavalry
  rarity: rare
  playable: true
  history: "Norman knights represent a historically attested battlefield role in Norman principalities forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { impact: +1, morale: +1 }
  flavor: "The charge must be timed."
  iconHint: "Lance and kite shield"
```

```yaml
troop:
  id: turkicHorseArchers
  name: "Turkic horse archers"
  faction: "Seljuk and steppe armies"
  archetype: lightCavalry
  rarity: rare
  playable: true
  history: "Turkic horse archers represent a historically attested battlefield role in Seljuk and steppe armies forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { ranged: +1, melee: -1 }
  flavor: "Never meet strength head-on."
  iconHint: "Composite bow on horseback"
```

```yaml
troop:
  id: varangianGuard
  name: "Varangian Guard"
  faction: "Byzantine Empire"
  archetype: heavySwordsmen
  rarity: epic
  playable: true
  history: "Varangian Guard represent a historically attested battlefield role in Byzantine Empire forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { melee: +1, armor: +1 }
  flavor: "Axes at the imperial standard."
  iconHint: "Two-handed axe"
```

```yaml
troop:
  id: seljukHeavyCavalry
  name: "Seljuk heavy cavalry"
  faction: "Great Seljuk Empire"
  archetype: heavyCavalry
  rarity: epic
  playable: true
  history: "Seljuk heavy cavalry represent a historically attested battlefield role in Great Seljuk Empire forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { impact: +1, armor: +1 }
  flavor: "Armour behind the arrows."
  iconHint: "Armoured lance"
```

```yaml
troop:
  id: crusaderKnights
  name: "Crusader knights"
  faction: "Crusader states"
  archetype: heavyCavalry
  rarity: legendary
  playable: true
  history: "Crusader knights represent a historically attested battlefield role in Crusader states forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically."
  modifiers: { impact: +1, morale: +1 }
  flavor: "A compact charge with a long recovery."
  iconHint: "Cross and lance"
```



## Generals



```yaml
general:
  id: earlyMedievalCaptain
  name: "Early Medieval Captain"
  pennant: EARLYMEDIE
  lived: "unknown; composite card"
  faction: "Any"
  rarity: common
  playable: true
  bio: "A generic commander card for armies whose battlefield leadership is uncertain or shared."
  style: "Maintains a shield wall."
  trait: "Infantry +5% morale"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["John Haldon, The Byzantine Wars (2001).", "Hugh Kennedy, The Great Arab Conquests (2007)."]
```

```yaml
general:
  id: earlyMedievalScout
  name: "Early Medieval Scout"
  pennant: EARLYMEDIE
  lived: "unknown; composite card"
  faction: "Any"
  rarity: uncommon
  playable: true
  bio: "A generic light-force commander card for reconnaissance and screening formations."
  style: "Screens the advance."
  trait: "Light cavalry +2 MP"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["John France, Western Warfare in the Age of the Crusades (1999).", "David Nicolle, Armies of the Muslim Conquest (1994)."]
```

```yaml
general:
  id: aetius
  name: "Flavius Aetius"
  pennant: FLAVIUSAET
  lived: "c. 390–454"
  faction: "Western Roman Empire"
  rarity: epic
  playable: true
  bio: "Roman general and consul who assembled a coalition against Attila in Gaul. The narrative record for Catalaunian Plains is fragmentary and partisan."
  style: "Coordinates a coalition on defensible ground."
  trait: "Infantry +10% morale"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Jordanes, Getica 191–217.", "Ian Hughes, Aetius: Attila's Nemesis (2012)."]
```

```yaml
general:
  id: attila
  name: "Attila"
  pennant: ATTILA
  lived: "c. 406–453"
  faction: "Hunnic Empire"
  rarity: legendary
  playable: false
  bio: "Ruler of the Huns who invaded Gaul in 451 and faced Aetius' coalition. His army and intentions are filtered through hostile Roman and Gothic accounts."
  style: "Presses a mobile enemy around a fixed centre."
  trait: "Light cavalry +10% impact"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Jordanes, Getica 176–217.", "Christopher Kelly, Attila the Hun (2008)."]
```

```yaml
general:
  id: narses
  name: "Narses"
  pennant: NARSES
  lived: "c. 478–573"
  faction: "Byzantine Empire"
  rarity: epic
  playable: true
  bio: "Byzantine courtier and general who commanded the imperial army at Taginae. Procopius is indispensable but writes from a strongly imperial perspective."
  style: "Anchors a defence and waits for the charge."
  trait: "Spearmen +10% morale"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Procopius, Wars 8.26–35.", "John Haldon, The Byzantine Wars (2001)."]
```

```yaml
general:
  id: totila
  name: "Totila"
  pennant: TOTILA
  lived: "died 552"
  faction: "Ostrogoths"
  rarity: rare
  playable: true
  bio: "Ostrogothic king who recovered much of Italy before his defeat and death at Taginae. His tactical decisions are known primarily through Procopius."
  style: "Uses cavalry to break a prepared position."
  trait: "Cavalry +10% impact"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Procopius, Wars 8.29–32.", "Herwig Wolfram, History of the Goths (1988)."]
```

```yaml
general:
  id: khalidIbnAlWalid
  name: "Khalid ibn al-Walid"
  pennant: KHALIDIBNA
  lived: "died 642"
  faction: "Rashidun Caliphate"
  rarity: legendary
  playable: true
  bio: "Early Muslim commander traditionally associated with the mobile reserve at Yarmouk. The chronology and tactical detail of later Arabic narratives remain debated."
  style: "Shifts a mobile reserve to the threatened point."
  trait: "Light cavalry +10% impact"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["al-Tabari, History, vol. 12.", "Hugh Kennedy, The Great Arab Conquests (2007)."]
```

```yaml
general:
  id: charlesMartel
  name: "Charles Martel"
  pennant: CHARLESMAR
  lived: "c. 688–741"
  faction: "Franks"
  rarity: epic
  playable: true
  bio: "Frankish ruler who defeated an Umayyad raiding force near Tours or Poitiers in 732. The battle's scale and later symbolism exceed the contemporary evidence."
  style: "Makes a hard infantry position decisive."
  trait: "Heavy infantry +10% morale"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["The Chronicle of 754.", "Paul Fouracre, The Age of Charles Martel (2000)."]
```

```yaml
general:
  id: ottoI
  name: "Otto I"
  pennant: OTTOI
  lived: "912–973"
  faction: "East Francia"
  rarity: epic
  playable: true
  bio: "East Frankish king and later emperor who defeated a Magyar raiding army at Lechfeld. The victory became foundational to Ottonian political memory."
  style: "Holds a centre while cavalry clears the wings."
  trait: "Cavalry +10% impact"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Widukind of Corvey, Deeds of the Saxons 3.44–49.", "Timothy Reuter, Germany in the Early Middle Ages (1991)."]
```

```yaml
general:
  id: haroldGodwinson
  name: "Harold Godwinson"
  pennant: HAROLDGODW
  lived: "c. 1022–1066"
  faction: "England"
  rarity: rare
  playable: true
  bio: "King of England who defeated Harald Hardrada at Stamford Bridge and died at Hastings weeks later. The rapid movement between the two battles is central to the campaign."
  style: "Reforms a tired army on high ground."
  trait: "Spearmen +10% morale"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Anglo-Saxon Chronicle, 1066.", "Ian W. Walker, Harold: The Last Anglo-Saxon King (1997)."]
```

```yaml
general:
  id: haraldHardrada
  name: "Harald Hardrada"
  pennant: HARALDHARD
  lived: "c. 1015–1066"
  faction: "Norway"
  rarity: epic
  playable: true
  bio: "Norwegian king and veteran of Byzantine service who invaded England in 1066. He was killed at Stamford Bridge."
  style: "Attacks before the enemy can gather."
  trait: "Heavy infantry +10% melee"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Snorri Sturluson, Heimskringla: Harald Hardrada's Saga.", "Kelly DeVries, The Norwegian Invasion of England in 1066 (1999)."]
```

```yaml
general:
  id: williamConqueror
  name: "William of Normandy"
  pennant: WILLIAMOFN
  lived: "c. 1028–1087"
  faction: "Normandy"
  rarity: legendary
  playable: true
  bio: "Duke of Normandy who conquered England after Hastings. The Bayeux Tapestry is valuable but is also a Norman political work."
  style: "Combines archery, infantry and staged cavalry charges."
  trait: "Cavalry +10% impact"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["William of Poitiers, Deeds of William.", "David Bates, William the Conqueror (1989)."]
```

```yaml
general:
  id: alpArslan
  name: "Alp Arslan"
  pennant: ALPARSLAN
  lived: "c. 1029–1072"
  faction: "Great Seljuk Empire"
  rarity: legendary
  playable: true
  bio: "Seljuk sultan who defeated Roman Emperor Romanos IV at Manzikert. The battle did not instantly conquer Anatolia but altered its political balance."
  style: "Draws an advancing enemy out of formation."
  trait: "Light cavalry +10% ranged"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Michael Attaleiates, History.", "Carole Hillenbrand, Turkish Myth and Muslim Symbol (2007)."]
```

```yaml
general:
  id: bohemond
  name: "Bohemond of Taranto"
  pennant: BOHEMONDOF
  lived: "c. 1054–1111"
  faction: "First Crusade"
  rarity: epic
  playable: true
  bio: "Norman prince and crusade leader associated with the victory at Dorylaeum. Latin and Muslim sources give different accounts of its phases."
  style: "Holds a vanguard until relief arrives."
  trait: "Infantry +10% morale"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Anna Komnene, Alexiad 11.", "John France, Victory in the East (1994)."]
```

```yaml
general:
  id: kilijArslan
  name: "Kilij Arslan I"
  pennant: KILIJARSLA
  lived: "died 1107"
  faction: "Seljuk Sultanate of Rum"
  rarity: rare
  playable: true
  bio: "Seljuk ruler of Rum who attacked the First Crusade at Dorylaeum. His army did not destroy the crusader vanguard before its relief arrived."
  style: "Surrounds a slow column with arrows."
  trait: "Light cavalry +10% ranged"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Anna Komnene, Alexiad 11.", "John France, Victory in the East (1994)."]
```

```yaml
general:
  id: frederickBarbarossa
  name: "Frederick Barbarossa"
  pennant: FREDERICKB
  lived: "1122–1190"
  faction: "Holy Roman Empire"
  rarity: epic
  playable: true
  bio: "Holy Roman Emperor defeated by the Lombard League at Legnano. The battle's exact field tactics are considerably less certain than its political impact."
  style: "Commits a powerful charge at the decision."
  trait: "Heavy cavalry +10% impact"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Otto of Freising and Rahewin, Deeds of Frederick Barbarossa.", "John B. Freed, Frederick Barbarossa (2016)."]
```

```yaml
general:
  id: belisarius
  name: "Belisarius"
  pennant: BELISARIUS
  lived: "c. 500–565"
  faction: "Byzantine Empire"
  rarity: epic
  playable: true
  bio: "Byzantine general who fought the Sasanians at Dara with a prepared defensive deployment. Procopius was his secretary and often favourable witness."
  style: "Uses fieldworks and a held centre."
  trait: "Spearmen +10% armor"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Procopius, Wars 1.13–14.", "John Haldon, The Byzantine Wars (2001)."]
```

```yaml
general:
  id: saadIbnAbiWaqqas
  name: "Sa'd ibn Abi Waqqas"
  pennant: SADIBNABIW
  lived: "died c. 674"
  faction: "Rashidun Caliphate"
  rarity: rare
  playable: true
  bio: "Early Muslim commander associated with the victory at al-Qadisiyyah. The traditional narrative was compiled long after the event and needs cautious use."
  style: "Sustains a multi-day field battle."
  trait: "Army +5% morale"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["al-Tabari, History, vol. 12.", "Hugh Kennedy, The Great Arab Conquests (2007)."]
```

```yaml
general:
  id: brianBoru
  name: "Brian Boru"
  pennant: BRIANBORU
  lived: "c. 941–1014"
  faction: "Ireland"
  rarity: rare
  playable: true
  bio: "High king of Ireland killed after the victory at Clontarf. The battle was not simply an ethnic Irish-versus-Viking contest."
  style: "Makes a defended line carry the battle."
  trait: "Infantry +10% morale"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Cogadh Gaedhel re Gallaibh.", "Seán Duffy, Brian Boru and the Battle of Clontarf (2013)."]
```

```yaml
general:
  id: godfreyBouillon
  name: "Godfrey of Bouillon"
  pennant: GODFREYOFB
  lived: "c. 1060–1100"
  faction: "Kingdom of Jerusalem"
  rarity: rare
  playable: true
  bio: "Leader of the First Crusade and ruler of Jerusalem who defeated a Fatimid relief force at Ascalon. The outcome did not produce a permanent crusader occupation of the city."
  style: "Strikes a relief army before it deploys."
  trait: "Heavy cavalry +10% impact"
  skills:
    - { name: Rally, historicalBasis: "A restrained game abstraction of battlefield command.", effect: "One routed unit in command radius returns to Disrupted.", existingEffect: rally }
  sources: ["Raymond of Aguilers, Historia Francorum.", "Christopher Tyerman, God's War (2006)."]
```



## Battles



```yaml
battle:
  id: catalaunianPlains
  name: "Catalaunian Plains"
  date: "451"
  orderInAge: 1
  node: main
  branchesFrom: null
  reward: null
  challengeType: hillsAndDefence
  location: { modernPlace: "Châlons area, France", lat: 49.05, lon: 4.37, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Western Roman coalition"
    commander: aetius
    generalRank: 2
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: earlyMedievalSpearmen, level: 1, role: "centre" }, { card: frankishHeavyInfantry, level: 1, role: "left wing" }, { card: earlyMedievalLightCavalry, level: 1, role: "right wing" }]
  enemy:
    faction: "Hunnic Empire"
    commander: attila
    generalRank: 3
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: earlyMedievalLightCavalry, level: 1, role: "centre" }, { card: earlyMedievalLightCavalry, level: 1, role: "left wing" }, { card: earlyMedievalArchers, level: 1, role: "right wing" }]
  whatHappened: "Aetius and his allies contested a ridge and stopped Attila's advance; the result was costly and strategically inconclusive. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Hold the ridge before mounted pressure turns both flanks."
  problem: "Hold the ridge before mounted pressure turns both flanks."
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
  objective: { type: breakArmy, detail: "Hold the ridge before mounted pressure turns both flanks." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 1
  briefing: "Catalaunian Plains: Aetius and his allies contested a ridge and stopped Attila's advance; the result was costly and strategically inconclusive. Tactical hint: Hold the ridge before mounted pressure turns both flanks."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Jordanes, Getica 191–217.", "Ian Hughes, Aetius: Attila's Nemesis (2012)."]
```

```yaml
battle:
  id: dara
  name: "Dara"
  date: "530"
  orderInAge: 2
  node: optional
  branchesFrom: catalaunianPlains
  reward: "general: belisarius"
  challengeType: holdUntilReinforcements
  location: { modernPlace: "Dara, Turkey", lat: 37.92, lon: 40.22, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Byzantine Empire"
    commander: belisarius
    generalRank: 3
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: byzantineSpearmen, level: 1, role: "centre" }, { card: earlyMedievalArchers, level: 1, role: "left wing" }, { card: varangianGuard, level: 1, role: "right wing" }]
  enemy:
    faction: "Sasanian Persia"
    commander: earlyMedievalCaptain
    generalRank: 4
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: earlyMedievalSpearmen, level: 2, role: "centre" }, { card: earlyMedievalArchers, level: 2, role: "left wing" }, { card: earlyMedievalLightCavalry, level: 2, role: "right wing" }]
  whatHappened: "Belisarius used ditches and a disciplined centre to receive a stronger Sasanian force. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Hold the prepared line and punish the cavalry commitment."
  problem: "Hold the prepared line and punish the cavalry commitment."
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
  objective: { type: holdOut, detail: "Hold the prepared line and punish the cavalry commitment." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 2
  briefing: "Dara: Belisarius used ditches and a disciplined centre to receive a stronger Sasanian force. Tactical hint: Hold the prepared line and punish the cavalry commitment."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Procopius, Wars 1.13–14.", "John Haldon, The Byzantine Wars (2001)."]
```

```yaml
battle:
  id: taginae
  name: "Taginae"
  date: "552"
  orderInAge: 3
  node: main
  branchesFrom: null
  reward: null
  challengeType: hillsAndDefence
  location: { modernPlace: "near Gualdo Tadino, Italy", lat: 43.23, lon: 12.78, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Byzantine Empire"
    commander: narses
    generalRank: 3
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: byzantineSpearmen, level: 1, role: "centre" }, { card: earlyMedievalArchers, level: 1, role: "left wing" }, { card: varangianGuard, level: 1, role: "right wing" }]
  enemy:
    faction: "Ostrogoths"
    commander: totila
    generalRank: 4
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: earlyMedievalSpearmen, level: 2, role: "centre" }, { card: normanKnights, level: 2, role: "left wing" }, { card: earlyMedievalArchers, level: 2, role: "right wing" }]
  whatHappened: "Narses deployed infantry and archers in a strong position; Totila's cavalry attacks failed and he was killed in the retreat. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Make the enemy charge into a prepared missile and spear line."
  problem: "Make the enemy charge into a prepared missile and spear line."
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
  objective: { type: breakArmy, detail: "Make the enemy charge into a prepared missile and spear line." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 2
  briefing: "Taginae: Narses deployed infantry and archers in a strong position; Totila's cavalry attacks failed and he was killed in the retreat. Tactical hint: Make the enemy charge into a prepared missile and spear line."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Procopius, Wars 8.29–32.", "Herwig Wolfram, History of the Goths (1988)."]
```

```yaml
battle:
  id: yarmouk
  name: "Yarmouk"
  date: "636"
  orderInAge: 4
  node: main
  branchesFrom: null
  reward: null
  challengeType: cavalryAndPursuit
  location: { modernPlace: "Yarmouk valley, Syria", lat: 32.66, lon: 35.89, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Rashidun Caliphate"
    commander: khalidIbnAlWalid
    generalRank: 3
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: earlyMedievalSpearmen, level: 1, role: "centre" }, { card: earlyMedievalLightCavalry, level: 1, role: "left wing" }, { card: earlyMedievalArchers, level: 1, role: "right wing" }]
  enemy:
    faction: "Byzantine Empire"
    commander: earlyMedievalCaptain
    generalRank: 4
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: byzantineSpearmen, level: 2, role: "centre" }, { card: earlyMedievalArchers, level: 2, role: "left wing" }, { card: varangianGuard, level: 2, role: "right wing" }]
  whatHappened: "The Muslim army held a pressured line before a mobile reserve helped collapse Byzantine wings toward ravines. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Keep the wings intact until the reserve can decide one flank."
  problem: "Keep the wings intact until the reserve can decide one flank."
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
  objective: { type: breakArmy, detail: "Keep the wings intact until the reserve can decide one flank." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 2
  briefing: "Yarmouk: The Muslim army held a pressured line before a mobile reserve helped collapse Byzantine wings toward ravines. Tactical hint: Keep the wings intact until the reserve can decide one flank."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["al-Tabari, History, vol. 12.", "Hugh Kennedy, The Great Arab Conquests (2007)."]
```

```yaml
battle:
  id: alQadisiyyah
  name: "al-Qadisiyyah"
  date: "c. 636/637"
  orderInAge: 5
  node: optional
  branchesFrom: yarmouk
  reward: "general: saadIbnAbiWaqqas"
  challengeType: attrition
  location: { modernPlace: "near al-Qadisiyyah, Iraq", lat: 31.84, lon: 44.47, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Rashidun Caliphate"
    commander: saadIbnAbiWaqqas
    generalRank: 4
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: earlyMedievalSpearmen, level: 2, role: "centre" }, { card: earlyMedievalLightCavalry, level: 2, role: "left wing" }, { card: earlyMedievalArchers, level: 2, role: "right wing" }]
  enemy:
    faction: "Sasanian Persia"
    commander: earlyMedievalCaptain
    generalRank: 5
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: earlyMedievalSpearmen, level: 2, role: "centre" }, { card: earlyMedievalArchers, level: 2, role: "left wing" }, { card: earlyMedievalLightCavalry, level: 2, role: "right wing" }]
  whatHappened: "A multi-day battle ended with the collapse of the Sasanian force; dates and many tactical details are disputed. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Outlast the armoured centre and keep the crossing open."
  problem: "Outlast the armoured centre and keep the crossing open."
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
  objective: { type: breakArmy, detail: "Outlast the armoured centre and keep the crossing open." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 3
  briefing: "al-Qadisiyyah: A multi-day battle ended with the collapse of the Sasanian force; dates and many tactical details are disputed. Tactical hint: Outlast the armoured centre and keep the crossing open."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["al-Tabari, History, vol. 12.", "Hugh Kennedy, The Great Arab Conquests (2007)."]
```

```yaml
battle:
  id: tours
  name: "Tours or Poitiers"
  date: "732"
  orderInAge: 6
  node: main
  branchesFrom: null
  reward: null
  challengeType: hillsAndDefence
  location: { modernPlace: "between Tours and Poitiers, France", lat: 46.72, lon: 0.46, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Franks"
    commander: charlesMartel
    generalRank: 4
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: frankishHeavyInfantry, level: 2, role: "centre" }, { card: earlyMedievalSpearmen, level: 2, role: "left wing" }, { card: earlyMedievalArchers, level: 2, role: "right wing" }]
  enemy:
    faction: "Umayyad raiding force"
    commander: earlyMedievalCaptain
    generalRank: 5
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: earlyMedievalSpearmen, level: 2, role: "centre" }, { card: earlyMedievalArchers, level: 2, role: "left wing" }, { card: earlyMedievalLightCavalry, level: 2, role: "right wing" }]
  whatHappened: "Frankish infantry held a defensive position against an Umayyad force; the leader Abd al-Rahman was killed and the force withdrew. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Keep the dense infantry position unbroken while the enemy probes it."
  problem: "Keep the dense infantry position unbroken while the enemy probes it."
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
  objective: { type: breakArmy, detail: "Keep the dense infantry position unbroken while the enemy probes it." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 3
  briefing: "Tours or Poitiers: Frankish infantry held a defensive position against an Umayyad force; the leader Abd al-Rahman was killed and the force withdrew. Tactical hint: Keep the dense infantry position unbroken while the enemy probes it."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["The Chronicle of 754.", "Paul Fouracre, The Age of Charles Martel (2000)."]
```

```yaml
battle:
  id: talas
  name: "Talas"
  date: "751"
  orderInAge: 7
  node: optional
  branchesFrom: tours
  reward: "troop: turkicHorseArchers"
  challengeType: ambushAndVision
  location: { modernPlace: "Talas valley, Kyrgyzstan", lat: 42.62, lon: 72.24, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Abbasid-Turkic coalition"
    commander: earlyMedievalCaptain
    generalRank: 5
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: earlyMedievalSpearmen, level: 2, role: "centre" }, { card: earlyMedievalArchers, level: 2, role: "left wing" }, { card: earlyMedievalLightCavalry, level: 2, role: "right wing" }]
  enemy:
    faction: "Tang China"
    commander: earlyMedievalCaptain
    generalRank: 6
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: earlyMedievalSpearmen, level: 3, role: "centre" }, { card: earlyMedievalArchers, level: 3, role: "left wing" }, { card: earlyMedievalLightCavalry, level: 3, role: "right wing" }]
  whatHappened: "A five-day struggle ended when Karluk allies changed sides against the Tang army; numbers and local geography are disputed. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Conceal the allied flank and strike after the enemy line is fixed."
  problem: "Conceal the allied flank and strike after the enemy line is fixed."
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
  objective: { type: breakArmy, detail: "Conceal the allied flank and strike after the enemy line is fixed." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 4
  briefing: "Talas: A five-day struggle ended when Karluk allies changed sides against the Tang army; numbers and local geography are disputed. Tactical hint: Conceal the allied flank and strike after the enemy line is fixed."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["al-Tabari, History, vol. 28.", "Jonathan Karam Skaff, Sui-Tang China and Its Turko-Mongol Neighbors (2012)."]
```

```yaml
battle:
  id: roncevauxPass
  name: "Roncevaux Pass"
  date: "778"
  orderInAge: 8
  node: optional
  branchesFrom: tours
  reward: "troop: frankishHeavyInfantry"
  challengeType: ambushAndVision
  location: { modernPlace: "Roncesvalles, Spain", lat: 43.0, lon: -1.32, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Basque ambush force"
    commander: earlyMedievalCaptain
    generalRank: 5
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: earlyMedievalSpearmen, level: 2, role: "centre" }, { card: earlyMedievalArchers, level: 2, role: "left wing" }, { card: earlyMedievalLightCavalry, level: 2, role: "right wing" }]
  enemy:
    faction: "Frankish rearguard"
    commander: earlyMedievalCaptain
    generalRank: 6
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: earlyMedievalSpearmen, level: 3, role: "centre" }, { card: earlyMedievalArchers, level: 3, role: "left wing" }, { card: earlyMedievalLightCavalry, level: 3, role: "right wing" }]
  whatHappened: "Basque attackers destroyed Charlemagne's rearguard in a mountain pass; later epic poetry transformed the event. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Use forest and height to break a long marching column."
  problem: "Use forest and height to break a long marching column."
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
  objective: { type: breakArmy, detail: "Use forest and height to break a long marching column." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 4
  briefing: "Roncevaux Pass: Basque attackers destroyed Charlemagne's rearguard in a mountain pass; later epic poetry transformed the event. Tactical hint: Use forest and height to break a long marching column."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Royal Frankish Annals, 778.", "Matthew Innes, State and Society in the Early Middle Ages (2000)."]
```

```yaml
battle:
  id: lechfeld
  name: "Lechfeld"
  date: "955"
  orderInAge: 9
  node: main
  branchesFrom: null
  reward: null
  challengeType: cavalryAndPursuit
  location: { modernPlace: "near Augsburg, Germany", lat: 48.37, lon: 10.9, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "East Francia"
    commander: ottoI
    generalRank: 4
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: frankishHeavyInfantry, level: 2, role: "centre" }, { card: normanKnights, level: 2, role: "left wing" }, { card: earlyMedievalSpearmen, level: 2, role: "right wing" }]
  enemy:
    faction: "Magyar raiders"
    commander: earlyMedievalScout
    generalRank: 5
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: earlyMedievalSpearmen, level: 2, role: "centre" }, { card: earlyMedievalArchers, level: 2, role: "left wing" }, { card: earlyMedievalLightCavalry, level: 2, role: "right wing" }]
  whatHappened: "Otto's force survived attacks on its baggage and defeated the Magyar army before a destructive pursuit. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Protect the baggage and win the cavalry fight before pursuit begins."
  problem: "Protect the baggage and win the cavalry fight before pursuit begins."
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
  objective: { type: breakArmy, detail: "Protect the baggage and win the cavalry fight before pursuit begins." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 3
  briefing: "Lechfeld: Otto's force survived attacks on its baggage and defeated the Magyar army before a destructive pursuit. Tactical hint: Protect the baggage and win the cavalry fight before pursuit begins."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Widukind of Corvey, Deeds of the Saxons 3.44–49.", "Timothy Reuter, Germany in the Early Middle Ages (1991)."]
```

```yaml
battle:
  id: clontarf
  name: "Clontarf"
  date: "1014"
  orderInAge: 10
  node: optional
  branchesFrom: lechfeld
  reward: "general: brianBoru"
  challengeType: desperateDefence
  location: { modernPlace: "Dublin, Ireland", lat: 53.37, lon: -6.19, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Irish coalition"
    commander: brianBoru
    generalRank: 5
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: earlyMedievalSpearmen, level: 2, role: "centre" }, { card: earlyMedievalArchers, level: 2, role: "left wing" }, { card: earlyMedievalLightCavalry, level: 2, role: "right wing" }]
  enemy:
    faction: "Dublin-Leinster coalition"
    commander: earlyMedievalCaptain
    generalRank: 6
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: earlyMedievalSpearmen, level: 3, role: "centre" }, { card: earlyMedievalArchers, level: 3, role: "left wing" }, { card: earlyMedievalLightCavalry, level: 3, role: "right wing" }]
  whatHappened: "Brian's coalition defeated Dublin and Leinster allies, but Brian himself was killed after the battle. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Win the line while keeping the commander out of the exposed rear."
  problem: "Win the line while keeping the commander out of the exposed rear."
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
  objective: { type: holdOut, detail: "Win the line while keeping the commander out of the exposed rear." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 4
  briefing: "Clontarf: Brian's coalition defeated Dublin and Leinster allies, but Brian himself was killed after the battle. Tactical hint: Win the line while keeping the commander out of the exposed rear."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Cogadh Gaedhel re Gallaibh.", "Seán Duffy, Brian Boru and the Battle of Clontarf (2013)."]
```

```yaml
battle:
  id: stamfordBridge
  name: "Stamford Bridge"
  date: "25 September 1066"
  orderInAge: 11
  node: main
  branchesFrom: null
  reward: null
  challengeType: passBridgeOrFord
  location: { modernPlace: "Stamford Bridge, England", lat: 53.99, lon: -0.91, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "England"
    commander: haroldGodwinson
    generalRank: 5
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: earlyMedievalSpearmen, level: 2, role: "centre" }, { card: earlyMedievalArchers, level: 2, role: "left wing" }, { card: frankishHeavyInfantry, level: 2, role: "right wing" }]
  enemy:
    faction: "Norway"
    commander: haraldHardrada
    generalRank: 6
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: earlyMedievalSpearmen, level: 3, role: "centre" }, { card: earlyMedievalArchers, level: 3, role: "left wing" }, { card: earlyMedievalLightCavalry, level: 3, role: "right wing" }]
  whatHappened: "Harold's army surprised the Norwegian invaders and defeated them after crossing the Derwent; Hardrada was killed. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Force the crossing quickly before the enemy can form a shield wall."
  problem: "Force the crossing quickly before the enemy can form a shield wall."
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
  objective: { type: holdPoint, detail: "Force the crossing quickly before the enemy can form a shield wall." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 4
  briefing: "Stamford Bridge: Harold's army surprised the Norwegian invaders and defeated them after crossing the Derwent; Hardrada was killed. Tactical hint: Force the crossing quickly before the enemy can form a shield wall."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Anglo-Saxon Chronicle, 1066.", "Kelly DeVries, The Norwegian Invasion of England in 1066 (1999)."]
```

```yaml
battle:
  id: hastings
  name: "Hastings"
  date: "14 October 1066"
  orderInAge: 12
  node: main
  branchesFrom: null
  reward: null
  challengeType: hillsAndDefence
  location: { modernPlace: "near Battle, England", lat: 50.91, lon: 0.49, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Normandy"
    commander: williamConqueror
    generalRank: 5
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: normanKnights, level: 2, role: "centre" }, { card: earlyMedievalArchers, level: 2, role: "left wing" }, { card: earlyMedievalSpearmen, level: 2, role: "right wing" }]
  enemy:
    faction: "England"
    commander: haroldGodwinson
    generalRank: 6
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: earlyMedievalSpearmen, level: 3, role: "centre" }, { card: earlyMedievalArchers, level: 3, role: "left wing" }, { card: frankishHeavyInfantry, level: 3, role: "right wing" }]
  whatHappened: "The English shield wall resisted on Senlac ridge until it broke under a mixture of missile fire, attacks and movement out of formation. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Wear down the hilltop line; do not waste cavalry in a frontal rush."
  problem: "Wear down the hilltop line; do not waste cavalry in a frontal rush."
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
  objective: { type: breakArmy, detail: "Wear down the hilltop line; do not waste cavalry in a frontal rush." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 4
  briefing: "Hastings: The English shield wall resisted on Senlac ridge until it broke under a mixture of missile fire, attacks and movement out of formation. Tactical hint: Wear down the hilltop line; do not waste cavalry in a frontal rush."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["William of Poitiers, Deeds of William.", "David Bates, William the Conqueror (1989)."]
```

```yaml
battle:
  id: manzikert
  name: "Manzikert"
  date: "26 August 1071"
  orderInAge: 13
  node: main
  branchesFrom: null
  reward: null
  challengeType: cavalryAndPursuit
  location: { modernPlace: "near Malazgirt, Turkey", lat: 39.15, lon: 42.54, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Great Seljuk Empire"
    commander: alpArslan
    generalRank: 5
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: turkicHorseArchers, level: 2, role: "centre" }, { card: seljukHeavyCavalry, level: 2, role: "left wing" }, { card: turkicHorseArchers, level: 2, role: "right wing" }]
  enemy:
    faction: "Byzantine Empire"
    commander: earlyMedievalCaptain
    generalRank: 6
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: byzantineSpearmen, level: 3, role: "centre" }, { card: earlyMedievalArchers, level: 3, role: "left wing" }, { card: varangianGuard, level: 3, role: "right wing" }]
  whatHappened: "Seljuk horse archers harassed Romanos IV's army; a difficult withdrawal and political fractures ended in Byzantine defeat and capture. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Keep distance, exhaust the advance, then strike the retiring formation."
  problem: "Keep distance, exhaust the advance, then strike the retiring formation."
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
  objective: { type: breakArmy, detail: "Keep distance, exhaust the advance, then strike the retiring formation." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 4
  briefing: "Manzikert: Seljuk horse archers harassed Romanos IV's army; a difficult withdrawal and political fractures ended in Byzantine defeat and capture. Tactical hint: Keep distance, exhaust the advance, then strike the retiring formation."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Michael Attaleiates, History.", "Carole Hillenbrand, Turkish Myth and Muslim Symbol (2007)."]
```

```yaml
battle:
  id: dorylaeum
  name: "Dorylaeum"
  date: "1 July 1097"
  orderInAge: 14
  node: main
  branchesFrom: null
  reward: null
  challengeType: holdUntilReinforcements
  location: { modernPlace: "near Eskişehir, Turkey", lat: 39.78, lon: 30.52, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "First Crusade"
    commander: bohemond
    generalRank: 6
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: crusaderKnights, level: 3, role: "centre" }, { card: earlyMedievalSpearmen, level: 3, role: "left wing" }, { card: earlyMedievalArchers, level: 3, role: "right wing" }]
  enemy:
    faction: "Seljuk Sultanate of Rum"
    commander: kilijArslan
    generalRank: 7
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: earlyMedievalSpearmen, level: 3, role: "centre" }, { card: earlyMedievalArchers, level: 3, role: "left wing" }, { card: earlyMedievalLightCavalry, level: 3, role: "right wing" }]
  whatHappened: "Bohemond's vanguard endured encirclement and missile fire until the rest of the crusade arrived and attacked the Seljuks. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Preserve the vanguard until the relief force arrives."
  problem: "Preserve the vanguard until the relief force arrives."
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
  objective: { type: holdOut, detail: "Preserve the vanguard until the relief force arrives." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 5
  briefing: "Dorylaeum: Bohemond's vanguard endured encirclement and missile fire until the rest of the crusade arrived and attacked the Seljuks. Tactical hint: Preserve the vanguard until the relief force arrives."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Anna Komnene, Alexiad 11.", "John France, Victory in the East (1994)."]
```

```yaml
battle:
  id: ascalon
  name: "Ascalon"
  date: "12 August 1099"
  orderInAge: 15
  node: optional
  branchesFrom: dorylaeum
  reward: "general: godfreyBouillon"
  challengeType: cavalryAndPursuit
  location: { modernPlace: "near Ashkelon, Israel", lat: 31.67, lon: 34.57, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Kingdom of Jerusalem"
    commander: godfreyBouillon
    generalRank: 6
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: earlyMedievalSpearmen, level: 3, role: "centre" }, { card: earlyMedievalArchers, level: 3, role: "left wing" }, { card: earlyMedievalLightCavalry, level: 3, role: "right wing" }]
  enemy:
    faction: "Fatimid Caliphate"
    commander: earlyMedievalCaptain
    generalRank: 7
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: earlyMedievalSpearmen, level: 3, role: "centre" }, { card: earlyMedievalArchers, level: 3, role: "left wing" }, { card: earlyMedievalLightCavalry, level: 3, role: "right wing" }]
  whatHappened: "The crusaders surprised a Fatimid relief army outside Ascalon shortly after taking Jerusalem. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Strike the camp before a larger enemy can deploy."
  problem: "Strike the camp before a larger enemy can deploy."
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
  objective: { type: breakArmy, detail: "Strike the camp before a larger enemy can deploy." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 5
  briefing: "Ascalon: The crusaders surprised a Fatimid relief army outside Ascalon shortly after taking Jerusalem. Tactical hint: Strike the camp before a larger enemy can deploy."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Raymond of Aguilers, Historia Francorum.", "Christopher Tyerman, God's War (2006)."]
```

```yaml
battle:
  id: legnano
  name: "Legnano"
  date: "29 May 1176"
  orderInAge: 16
  node: main
  branchesFrom: null
  reward: null
  challengeType: desperateDefence
  location: { modernPlace: "Legnano, Italy", lat: 45.59, lon: 8.92, uncertainty: "Exact deployments and strengths are contested; this board is a historical abstraction rather than a literal reconstruction." }
  player:
    faction: "Lombard League"
    commander: earlyMedievalCaptain
    generalRank: 6
    strength: "disputed; represented as an abstract field force"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: earlyMedievalSpearmen, level: 3, role: "centre" }, { card: earlyMedievalArchers, level: 3, role: "left wing" }, { card: earlyMedievalLightCavalry, level: 3, role: "right wing" }]
  enemy:
    faction: "Holy Roman Empire"
    commander: frederickBarbarossa
    generalRank: 7
    strength: "disputed; represented as 3–8 coherent blocks"
    composition: { infantry: "55%", cavalry: "25%", ranged: "20%" }
    units: [{ card: earlyMedievalSpearmen, level: 3, role: "centre" }, { card: earlyMedievalArchers, level: 3, role: "left wing" }, { card: earlyMedievalLightCavalry, level: 3, role: "right wing" }]
  whatHappened: "Lombard infantry defended the carroccio until allied cavalry turned the battle; the tactical sequence is uncertain. The surviving sources do not establish every deployment detail or reliable total. This scenario therefore isolates the decisive local phase rather than compressing the entire historical army. The player takes the historical victor except where the summary explicitly frames an underdog defence."
  decisiveFactor: "Keep the standard position intact until the counterattack is ready."
  problem: "Keep the standard position intact until the counterattack is ready."
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
  objective: { type: holdOut, detail: "Keep the standard position intact until the counterattack is ready." }
  bonusStar: "Win while preserving the unit that embodies the historical tactical solution."
  difficulty: 5
  briefing: "Legnano: Lombard infantry defended the carroccio until allied cavalry turned the battle; the tactical sequence is uncertain. Tactical hint: Keep the standard position intact until the counterattack is ready."
  didYouKnow: "Ancient and medieval battle figures are frequently uncertain or propagandistic."
  sources: ["Otto of Freising and Rahewin, Deeds of Frederick Barbarossa.", "John B. Freed, Frederick Barbarossa (2016)."]
```



## Notes



- **Swaps:** None from the approved list.

- **Uncertain facts:** Exact strengths, casualties, battlefield micro-topography and several command details remain disputed.

- **Questions for the owner:** Should optional-node rewards be guaranteed on first completion, or enter the normal card pool after unlock?
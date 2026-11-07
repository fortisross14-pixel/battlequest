/**
 * Campaigns (owner, 2026-11-07): each age's battles grouped by topic into a few themed
 * campaigns, so the age map shows one story at a time. Unlocking is unchanged (stars in the
 * age for main battles, the parent's win for optional ones); a campaign appears on the map
 * once one of its battles is open. Battles are listed in historical order. Proposed from the
 * history briefs; the owner reviews the groupings.
 */
export interface Campaign {
  id: string;
  age: number;
  name: string;
  /** One line under the name. */
  blurb: string;
  /** Main and optional battles, in historical order. */
  battles: string[];
}

export const CAMPAIGNS: Campaign[] = [
  // ---------- Age 0: Dawn of War ----------
  {
    id: 'egyptInCanaan',
    age: 0,
    name: 'Egypt in Canaan',
    blurb: 'Pharaoh’s chariots on the roads of the Levant.',
    battles: ['megiddo', 'kadesh'],
  },
  // ---------- Age 1: Antiquity ----------
  {
    id: 'persianWars',
    age: 1,
    name: 'The Persian Wars',
    blurb: 'From Assyria’s chariots to the Greek stand against Persia.',
    battles: ['qarqar', 'marathon', 'thermopylae', 'plataea'],
  },
  {
    id: 'greekAgainstGreek',
    age: 1,
    name: 'Greek against Greek',
    blurb: 'Athens, Sparta and Thebes fight for Greece.',
    battles: ['delium', 'mantinea418', 'cunaxa', 'coronea', 'leuctra', 'mantinea362'],
  },
  {
    id: 'alexander',
    age: 1,
    name: 'Philip and Alexander',
    blurb: 'Macedon’s phalanx and Companions, from Chaeronea to India.',
    battles: ['chaeronea', 'granicus', 'issus', 'gaugamela', 'persianGate', 'jaxartes', 'hydaspes'],
  },
  // ---------- Age 2: Classical Empires ----------
  {
    id: 'pyrrhusHannibal',
    age: 2,
    name: 'Pyrrhus and Hannibal',
    blurb: 'Rome against the elephant kings and Carthage.',
    battles: ['heraclea', 'bagradas', 'trebia', 'lakeTrasimene', 'cannae', 'metaurus', 'zama'],
  },
  {
    id: 'macedonFalls',
    age: 2,
    name: 'The Fall of Macedon',
    blurb: 'Legion against phalanx.',
    battles: ['cynoscephalae', 'pydna'],
  },
  {
    id: 'caesar',
    age: 2,
    name: 'Caesar and the Triumvirs',
    blurb: 'Gaul, Parthia and the civil war.',
    battles: ['bibracte', 'carrhae', 'alesia', 'pharsalus', 'munda'],
  },
  {
    id: 'frontiers',
    age: 2,
    name: 'The Empire’s Frontiers',
    blurb: 'Germans, Persians and Goths at the edges of Rome.',
    battles: ['teutoburgForest', 'edessa', 'argentoratum', 'adrianople'],
  },
];

export function campaignsOfAge(age: number): Campaign[] {
  return CAMPAIGNS.filter((c) => c.age === age);
}

export function campaignOf(battleId: string): Campaign | undefined {
  return CAMPAIGNS.find((c) => c.battles.includes(battleId));
}

import { mapFromRows } from '../../core/map';
import type { Scenario, ScenarioUnit } from '../../core/state';
import { Cohesion, type Dir, type Side } from '../../core/types';
import { unitType, type ArchetypeId } from '../units';

/**
 * Visual-check scenario: units in every cohesion state and at several strengths,
 * plus a ready charge (knights vs archers) and a ready shot (archers vs spearmen).
 * Load it with ?scenario=debug-states.
 */
const TERRAIN = [
  '............',
  '.....F......',
  '.....F..,,..',
  '............',
  '......~.....',
  '......=.....',
  '......~.....',
  '......B.....',
];

const ELEVATION = [
  '000000000000',
  '000000000000',
  '000000000000',
  '000000000110',
  '000000000110',
  '000000000000',
  '000000000000',
  '000000000000',
];

function u(
  id: string,
  side: Side,
  type: ArchetypeId,
  x: number,
  y: number,
  facing: Dir,
  cohesion = Cohesion.Steady,
  strength = 100,
): ScenarioUnit {
  return { id, side, type: unitType(type), x, y, facing, cohesion, strength };
}

export function debugStatesScenario(seed = 7): Scenario {
  return {
    id: 'debug-states',
    name: 'Debug: unit states',
    map: mapFromRows(TERRAIN, ELEVATION),
    sides: { blue: { name: 'Blue', edge: 'west' }, red: { name: 'Red', edge: 'east' } },
    units: [
      u('b-steady', 'blue', 'spearmen', 1, 0, 2),
      u('b-disrupted', 'blue', 'heavySwordsmen', 1, 1, 2, Cohesion.Disrupted, 70),
      u('b-fragmented', 'blue', 'pikemen', 1, 2, 2, Cohesion.Fragmented, 45),
      u('b-routed', 'blue', 'archers', 8, 1, 6, Cohesion.Routed, 22),
      u('b-knights', 'blue', 'heavyCavalry', 3, 3, 2),
      u('b-archers', 'blue', 'archers', 3, 5, 2),
      u('b-skirm', 'blue', 'skirmishers', 4, 6, 1),
      u('b-lcav', 'blue', 'lightCavalry', 2, 7, 2),

      u('r-steady', 'red', 'spearmen', 10, 0, 6),
      u('r-disrupted', 'red', 'crossbowmen', 10, 1, 5, Cohesion.Disrupted, 60),
      u('r-fragmented', 'red', 'chariots', 10, 2, 6, Cohesion.Fragmented, 40),
      u('r-archers', 'red', 'archers', 6, 3, 6),
      u('r-spear', 'red', 'spearmen', 6, 5, 6),
      u('r-elephants', 'red', 'warElephants', 9, 4, 7),
      u('r-artillery', 'red', 'fieldArtillery', 10, 6, 6),
      u('r-routed', 'red', 'skirmishers', 11, 7, 2, Cohesion.Routed, 18),
    ],
    turnLimit: 15,
    firstSide: 'blue',
    seed,
  };
}

/** Visual-check scenario: one charge breaks the red army, to show the result screen. */
export function debugEndgameScenario(seed = 7): Scenario {
  return {
    id: 'debug-endgame',
    name: 'Debug: endgame',
    map: mapFromRows(TERRAIN, ELEVATION),
    sides: { blue: { name: 'Blue', edge: 'west' }, red: { name: 'Red', edge: 'east' } },
    units: [
      u('b-knights', 'blue', 'heavyCavalry', 3, 3, 2),
      u('b-spear', 'blue', 'spearmen', 2, 5, 2),
      u('r-archers', 'red', 'archers', 6, 3, 6, Cohesion.Disrupted, 30),
    ],
    turnLimit: 15,
    firstSide: 'blue',
    seed,
  };
}

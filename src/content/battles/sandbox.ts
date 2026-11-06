import { mapFromRows } from '../../core/map';
import type { Scenario, ScenarioUnit } from '../../core/state';
import type { Dir, Side } from '../../core/types';
import { unitType, type ArchetypeId } from '../units';

/**
 * Sandbox battle for M2: a river with a ford in the north and a bridge in the south,
 * woods on the blue bank, a hill and a wood on the red bank. Hot-seat, no generals.
 */
const TERRAIN = [
  '.....FFF~.......',
  '....FFFF~.......',
  '........=.......',
  '........~..,,...',
  '..,,....~.......',
  '.......~........',
  '.......~.....FF.',
  '.......B.....FF.',
  '.......~......F.',
  '.......~........',
];

const ELEVATION = [
  '0000000000000000',
  '0000000000000000',
  '0000000000000000',
  '0000000000111100',
  '0000000000122100',
  '0000000000122100',
  '0000000000111100',
  '0000000000000000',
  '0000000000000000',
  '0000000000000000',
];

const EAST: Dir = 2;
const WEST: Dir = 6;

function u(id: string, side: Side, type: ArchetypeId, x: number, y: number): ScenarioUnit {
  return { id, side, type: unitType(type), x, y, facing: side === 'blue' ? EAST : WEST };
}

export const SANDBOX_UNITS: ScenarioUnit[] = [
  u('b-knights', 'blue', 'heavyCavalry', 3, 2),
  u('b-skirm', 'blue', 'skirmishers', 6, 2),
  u('b-spear', 'blue', 'spearmen', 5, 3),
  u('b-legion1', 'blue', 'heavySwordsmen', 5, 4),
  u('b-archers', 'blue', 'archers', 4, 5),
  u('b-legion2', 'blue', 'heavySwordsmen', 5, 6),
  u('b-pikes', 'blue', 'pikemen', 5, 7),
  u('b-lightcav', 'blue', 'lightCavalry', 3, 8),

  u('r-chariots', 'red', 'chariots', 12, 1),
  u('r-spear1', 'red', 'spearmen', 10, 2),
  u('r-swords', 'red', 'heavySwordsmen', 10, 4),
  u('r-xbow', 'red', 'crossbowmen', 11, 4),
  u('r-spear2', 'red', 'spearmen', 10, 5),
  u('r-archers', 'red', 'archers', 11, 5),
  u('r-skirm', 'red', 'skirmishers', 9, 7),
  u('r-knights', 'red', 'heavyCavalry', 12, 8),
];

export function sandboxScenario(seed = 1457): Scenario {
  return {
    id: 'sandbox',
    name: 'River Sandbox',
    map: mapFromRows(TERRAIN, ELEVATION),
    sides: {
      blue: { name: 'Blue', edge: 'west' },
      red: { name: 'Red', edge: 'east' },
    },
    units: SANDBOX_UNITS,
    turnLimit: 15,
    firstSide: 'blue',
    seed,
  };
}

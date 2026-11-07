import { mapFromRows } from '../../core/map';
import type { Scenario, ScenarioUnit } from '../../core/state';
import type { Dir, Side } from '../../core/types';
import { eraUnitType } from '../eraUnits';

/**
 * Visual-check scenario for the tactical actions (GAME_DESIGN 4.12): Persian shield archers
 * facing a bunched Volley target, Companion cavalry with room to break through, a Hoplite
 * phalanx that can Fortify, legionaries that can form a Testudo, Spartans for Othismos and
 * Parthian horse archers. Load it with ?scenario=debug-actions.
 */
const E: Dir = 2;
const W: Dir = 6;

function u(id: string, side: Side, card: string, x: number, y: number, facing: Dir): ScenarioUnit {
  return { id, side, type: eraUnitType(card, 2), x, y, facing };
}

export function debugActionsScenario(seed = 1): Scenario {
  return {
    id: 'debug-actions',
    name: 'Debug: tactical actions',
    map: mapFromRows([
      '............',
      '............',
      '............',
      '............',
      '............',
      '............',
      '............',
      '............',
    ]),
    sides: { blue: { name: 'Blue', edge: 'west' }, red: { name: 'Red', edge: 'east' } },
    units: [
      u('b-archers', 'blue', 'persianShieldArchers', 3, 1, E),
      u('b-companions', 'blue', 'companionCavalry', 2, 4, E),
      u('b-hoplites', 'blue', 'hoplitePhalanx', 4, 6, E),
      u('b-legion', 'blue', 'romanLegionaries', 3, 3, E),
      u('b-parthians', 'blue', 'parthianHorseArchers', 5, 7, E),
      // A bunched block for the Volley.
      u('r-a', 'red', 'antiquitySpearmen', 6, 1, W),
      u('r-b', 'red', 'antiquitySpearmen', 6, 2, W),
      u('r-c', 'red', 'antiquityArchers', 7, 1, W),
      // Archers facing away with a clear square behind: the Full charge target.
      u('r-archers', 'red', 'antiquityArchers', 6, 4, E),
      u('r-cav', 'red', 'antiquityLightCavalry', 10, 6, W),
      u('r-spear', 'red', 'antiquitySpearmen', 8, 7, W),
    ],
    turnLimit: 15,
    firstSide: 'blue',
    seed,
  };
}

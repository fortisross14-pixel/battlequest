import type { Scenario } from '../../core/state';
import { debugEndgameScenario, debugStatesScenario } from './debugStates';
import { sandboxScenario } from './sandbox';
import { debugActionsScenario } from './debugActions';

/** Battles that can be loaded with ?scenario=<id>. */
export const BATTLES: Record<string, (seed?: number) => Scenario> = {
  sandbox: sandboxScenario,
  'debug-states': debugStatesScenario,
  'debug-endgame': debugEndgameScenario,
  'debug-actions': debugActionsScenario,
};

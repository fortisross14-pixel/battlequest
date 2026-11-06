import type { Posture } from '../../ai/utility';
import type { Dir } from '../../core/types';

/** The ★★★ condition of a battle (GAME_DESIGN 4.8). */
export type BonusCondition =
  | { kind: 'winByTurn'; turn: number }
  | { kind: 'generalAlive' }
  | { kind: 'noUnitLost' }
  | { kind: 'enemyGeneralLost' };

export interface EnemyUnit {
  /** Era unit id (src/content/eraUnits.ts). */
  type: string;
  x: number;
  y: number;
  facing: Dir;
  /** The enemy general rides with this unit. */
  general?: boolean;
  level?: number;
}

/**
 * A campaign battle as data. The player is always blue and deploys on the west;
 * the enemy is red and flees east.
 */
export interface CampaignBattle {
  id: string;
  name: string;
  /** e.g. "1457 BC". */
  year: string;
  age: number;
  /** Order inside its age. */
  order: number;
  /** The tactical problem in one sentence. */
  problem: string;
  /** 3–4 sentences: history plus one tactical hint. */
  briefing: string;
  terrain: string[];
  elevation?: string[];
  /** Same size as `terrain`; 'D' marks the player's deployment squares. */
  deployment: string[];
  enemy: EnemyUnit[];
  enemyGeneral?: { id: string; rank: number };
  posture: Posture;
  attackTurn?: number;
  turnLimit: number;
  /** 'player' = the player wins by holding out until the turn limit. */
  holdOut?: 'player';
  /** Unit slots: the army must fill exactly this many (GAME_DESIGN 5). */
  maxUnits: number;
  /**
   * Tutorial / historical challenge: the composition is fixed. Unit levels come from the
   * player's roster; the general may be one the player doesn't own (for this battle only).
   */
  fixedArmy?: ArmyChoice;
  /** Granted the first time this battle is won. */
  firstWinUnlocks?: { units?: string[]; generals?: string[] };
  bonus: BonusCondition;
  bonusText: string;
  /** Army used by tests and balance-sim to stand in for the player. */
  testArmy: ArmyChoice;
  /** How the stand-in player plays (default: defensive for hold-outs, else aggressive). */
  testPosture?: Posture;
  tutorial?: boolean;
}

export interface ArmyChoice {
  units: { type: string; level?: number }[];
  general?: { id: string; rank: number; unitIndex: number };
}

export interface Age {
  id: number;
  name: string;
  /** Prologue: the new player's troops. Later ages: free troops granted when the age unlocks. */
  starterUnits: string[];
}

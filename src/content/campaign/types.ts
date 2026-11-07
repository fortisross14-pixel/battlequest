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
  /** Real location, for the node on the age map (decimal degrees). */
  lat: number;
  lon: number;
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
  /**
   * Share of its army cost the enemy must lose to break (default 0.5). Small armies use a
   * higher value so one lost unit doesn't end the battle.
   */
  enemyBreakpoint?: number;
  /** The same for the player's army (tutorial and small battles can be more forgiving). */
  playerBreakpoint?: number;
  /** Unit slots: the army must fill exactly this many (GAME_DESIGN 5). */
  maxUnits: number;
  /**
   * Tutorial / historical challenge: the composition is fixed. Unit levels come from the
   * player's roster; the general may be one the player doesn't own (for this battle only).
   */
  fixedArmy?: ArmyChoice;
  /** Starting squares for the first units, in army order (a tutorial sets up its lesson). */
  startAt?: { x: number; y: number }[];
  /** Granted the first time this battle is won (an optional battle's reward). */
  firstWinUnlocks?: { units?: string[]; generals?: string[] };
  /**
   * Optional battle (GAME_DESIGN 7.3): the main battle it branches from. It opens when that
   * battle is won and is never needed to finish the age.
   */
  branchesFrom?: string;
  /** The tactical idea (GAME_DESIGN 7.3), from the history brief. */
  challengeType?: ChallengeType;
  bonus: BonusCondition;
  bonusText: string;
  /** Army used by tests and balance-sim to stand in for the player. */
  testArmy: ArmyChoice;
  /** How the stand-in player plays (default: defensive for hold-outs, else aggressive). */
  testPosture?: Posture;
  /** Guided steps shown in battle until the battle is first won (GAME_DESIGN 7.4). */
  tutorial?: TutorialStep[];
  /** Tips shown in the army builder for this battle (tutorial). */
  builderTips?: string[];
}

export interface ArmyChoice {
  units: { type: string; level?: number }[];
  /** The general leads from their own unit on the map. `unitIndex` is from older saves and ignored. */
  general?: { id: string; rank: number; unitIndex?: number };
}

export type ChallengeType =
  | 'lineAndFlank'
  | 'passBridgeOrFord'
  | 'riverCrossing'
  | 'ambushAndVision'
  | 'hillsAndDefence'
  | 'cavalryAndPursuit'
  | 'holdUntilReinforcements'
  | 'strikeTheCommander'
  | 'desperateDefence'
  | 'attrition';

/** What the tutorial waits for before moving to its next step. */
export type TutorialTrigger =
  | 'select'
  | 'move'
  | 'facing'
  | 'charge'
  /** A charge that hits an enemy's flank or rear. */
  | 'flankCharge'
  /** A charge on an enemy already in melee with one of your units. */
  | 'support'
  | 'shoot'
  | 'skill'
  | 'endTurn'
  | 'never';

export interface TutorialStep {
  text: string;
  until: TutorialTrigger;
  /** The troop (era unit id) the step asks the player to use, if one. */
  unit?: string;
}

export type AgeEmblem =
  | 'chariot'
  | 'laurel'
  | 'eagle'
  | 'crown'
  | 'castle'
  | 'ship'
  | 'pike'
  | 'tricorne'
  | 'bicorne'
  | 'rifle';

/** A map region in degrees. */
export interface MapBounds {
  west: number;
  east: number;
  south: number;
  north: number;
}

/** A battle listed for an age whose content isn't built yet. */
export interface PlannedBattle {
  name: string;
  year: string;
  lat: number;
  lon: number;
}

/** One age of the campaign (GAME_DESIGN 7). Its id is also its number on the timeline. */
export interface Age {
  id: number;
  name: string;
  /** Shown under the name, e.g. "860–320 BC". */
  years: string;
  /** Start and end year for the timeline (BC negative). */
  from: number;
  to: number;
  /** The region its map shows. */
  region: MapBounds;
  emblem: AgeEmblem;
  /** Main-path battles, in historical order. */
  battles: string[];
  /** Optional battles (each names the main battle it branches from). */
  optional?: string[];
  /** Battles of an age in preparation: names and places only. */
  planned?: PlannedBattle[];
  /** Stars earned in this age needed to open battle #1, #2, … */
  starThresholds: number[];
  /** Age 0: the new player's troops. Later ages: the Commons granted when the age opens. */
  starterUnits: string[];
  /** The generic generals granted when the age opens. */
  starterGenerals?: string[];
  /** The age's Legendary troop, granted at LEGENDARY_ROAD of the main-path stars (GAME_DESIGN 8). */
  legendary?: string;
  status: 'playable' | 'inPreparation';
}

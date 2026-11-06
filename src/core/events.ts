import type { Arc } from './geometry';
import type { BattleResult, Cohesion, Dir, Pos, Side } from './types';

export type MoveKind =
  | 'move'
  | 'pullBack'
  | 'sidestep'
  | 'breakOff'
  | 'evade'
  | 'rout'
  | 'pursuit'
  | 'pushBack'
  | 'followUp';
export type DamageKind = 'ranged' | 'impact' | 'melee';

/** Everything the renderer needs to animate a state change. */
export type GameEvent =
  | { type: 'UnitMoved'; unitId: string; kind: MoveKind; path: Pos[]; facing: Dir }
  | { type: 'UnitRotated'; unitId: string; from: Dir; to: Dir }
  | { type: 'ChargeDeclared'; unitId: string; targetId: string; path: Pos[] }
  | { type: 'ShotFired'; unitId: string; targetId: string }
  | { type: 'HoldDeclared'; unitId: string }
  | { type: 'EvadeRoll'; unitId: string; chance: number; roll: number; evaded: boolean }
  | {
      type: 'DamageDealt';
      attackerId: string;
      targetId: string;
      kind: DamageKind;
      amount: number;
      arc: Arc;
    }
  | { type: 'CohesionTest'; unitId: string; chance: number; roll: number; dropped: boolean }
  | { type: 'CohesionChanged'; unitId: string; from: Cohesion; to: Cohesion }
  | { type: 'UnitRouted'; unitId: string; cause: 'strength' | 'cohesion' }
  | { type: 'UnitDestroyed'; unitId: string; cause: 'strength' | 'caught' }
  | { type: 'UnitFled'; unitId: string }
  | { type: 'UnitRallied'; unitId: string; from: Cohesion; to: Cohesion }
  | { type: 'MeleeJoined'; a: string; b: string }
  | { type: 'SkillUsed'; unitId: string; skillId: string; name: string }
  | { type: 'UnitHealed'; unitId: string; amount: number }
  | { type: 'GeneralLost'; side: Side; generalId: string; name: string }
  | { type: 'MeleePhase' }
  | { type: 'SideTurnEnded'; side: Side; turn: number }
  | { type: 'SideTurnStarted'; side: Side; turn: number }
  | { type: 'BattleEnded'; result: BattleResult };

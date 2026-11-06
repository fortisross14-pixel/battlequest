export type RejectionCode =
  | 'BATTLE_OVER'
  | 'UNKNOWN_UNIT'
  | 'NOT_YOUR_TURN'
  | 'NOT_ON_MAP'
  | 'ROUTED'
  | 'ENGAGED'
  | 'ALREADY_ACTED'
  | 'NOT_ENOUGH_MP'
  | 'SAME_SQUARE'
  | 'UNREACHABLE'
  | 'IN_ZOC'
  | 'BAD_TARGET'
  | 'FRAGMENTED'
  | 'NO_CHARGE_LINE'
  | 'PATH_BLOCKED'
  | 'CANNOT_SHOOT'
  | 'OUT_OF_RANGE'
  | 'NOT_IN_ARC'
  | 'NO_LINE_OF_SIGHT'
  | 'MOVED_THIS_TURN'
  | 'RELOADING'
  | 'NO_AMMO'
  | 'NOTHING_TO_UNDO';

/** Why a command was refused. `message` is written for players. */
export interface Rejection {
  code: RejectionCode;
  message: string;
}

export function reject(code: RejectionCode, message: string): Rejection {
  return { code, message };
}

export function isRejection(x: unknown): x is Rejection {
  return typeof x === 'object' && x !== null && 'code' in x && 'message' in x && !('path' in x);
}

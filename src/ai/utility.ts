import {
  arcOf,
  chebyshev,
  hasLineOfSight,
  isEngaged,
  isFighting,
  isOnMap,
  isRejection,
  nearestDir,
  planMove,
  previewCombat,
  rangeDistance,
  reachableSquares,
  shootingRange,
  validateCommand,
  elevationAt,
  terrainRules,
  inEnemyZoc,
  isCavalryLike,
  hasTag,
  type BattleState,
  type Command,
  type CombatPreview,
  type Dir,
  type Pos,
  type Side,
  type Unit,
} from '../core';

/**
 * Scenario-level behaviour (GAME_DESIGN 4.11).
 * - aggressive: advance and attack.
 * - defensive: hold position, brace, counter-attack only good opportunities.
 * - timed: defensive until `attackTurn`, then aggressive.
 */
export type Posture = 'aggressive' | 'defensive' | 'timed';

export interface AiConfig {
  posture: Posture;
  attackTurn?: number;
}

/** Weights for the utility scores. Tunable in one place. */
export const AI_WEIGHTS = {
  cohesionDrop: 20,
  rout: 50,
  catchRouter: 45,
  /** Minimum score for an attack to be worth it. */
  attackThreshold: { aggressive: 2, defensive: 7 },
  approach: 2,
  inRangeBonus: 9,
  exposedFront: 5,
  flankThreat: 6,
  friendNearby: 0.8,
  highGround: 1.5,
  coverForShooters: 1.5,
  anchorPull: 1.5,
  /** A move must beat staying put by this much. */
  moveMargin: 0.5,
};

type Stage = 'fresh' | 'moved' | 'done';

function attackValue(p: CombatPreview): number {
  const W = AI_WEIGHTS;
  if (p.outcome === 'catchRouter') return W.catchRouter;
  const gain =
    p.defender.expectedLoss +
    W.cohesionDrop * p.defender.cohesionDropChance +
    W.rout * p.defender.routChance;
  const cost =
    p.attacker.expectedLoss +
    W.cohesionDrop * p.attacker.cohesionDropChance +
    W.rout * p.attacker.routChance;
  const v = gain - cost;
  // An evader that slips away costs us our action but nothing else.
  return p.outcome === 'mayEvade' ? v * (1 - p.evadeChance) : v;
}

function isShooter(u: Unit): boolean {
  return u.type.stats.ranged > 0 && u.type.stats.range > 1;
}

/**
 * Utility AI. Call `next(state)` repeatedly: it returns one valid command at a time
 * (ending with EndTurn), so the UI can animate each enemy move. Deterministic.
 */
export class AiPlayer {
  private stage = new Map<string, Stage>();
  private turnKey = '';
  /** Where each unit started the battle: defensive units hold near it. */
  private anchors = new Map<string, Pos>();

  constructor(
    readonly side: Side,
    readonly config: AiConfig,
  ) {}

  private posture(state: BattleState): 'aggressive' | 'defensive' {
    if (this.config.posture === 'timed') {
      return state.turn >= (this.config.attackTurn ?? 1) ? 'aggressive' : 'defensive';
    }
    return this.config.posture;
  }

  next(state: BattleState): Command {
    if (state.result || state.activeSide !== this.side) return { type: 'EndTurn' };
    const key = `${state.turn}:${state.activeSide}`;
    if (key !== this.turnKey) {
      this.turnKey = key;
      this.stage.clear();
    }
    for (const u of state.units) {
      if (u.side === this.side && !this.anchors.has(u.id))
        this.anchors.set(u.id, { x: u.x, y: u.y });
    }
    // Shooters act before melee units (4.11), then by id for determinism.
    const mine = state.units
      .filter((u) => u.side === this.side && isFighting(u))
      .sort((a, b) => Number(isShooter(b)) - Number(isShooter(a)) || a.id.localeCompare(b.id));
    for (const u of mine) {
      const stage = this.stage.get(u.id) ?? 'fresh';
      if (stage === 'done') continue;
      const cmd = this.decide(state, u, stage);
      if (cmd && !validateCommand(state, cmd)) return cmd;
      this.stage.set(u.id, 'done');
    }
    return { type: 'EndTurn' };
  }

  private decide(state: BattleState, u: Unit, stage: Stage): Command | null {
    const posture = this.posture(state);
    if (isEngaged(state, u.id)) {
      this.stage.set(u.id, 'done');
      return null;
    }
    if (!u.hasActed) {
      const attack = this.bestAttack(state, u, posture);
      if (attack) {
        this.stage.set(u.id, 'done');
        return attack;
      }
    }
    if (stage === 'fresh' && u.mpLeft > 0) {
      const move = this.bestMove(state, u, posture);
      this.stage.set(u.id, 'moved');
      if (move) return move;
    }
    // Brace if an enemy could reach us and we did nothing else.
    if (!u.hasActed && this.threatened(state, u)) {
      this.stage.set(u.id, 'done');
      return { type: 'Hold', unitId: u.id };
    }
    this.stage.set(u.id, 'done');
    return null;
  }

  private bestAttack(
    state: BattleState,
    u: Unit,
    posture: 'aggressive' | 'defensive',
  ): Command | null {
    let best: { cmd: Command; v: number } | null = null;
    const enemies = state.units.filter((e) => e.side !== u.side && isOnMap(e));
    for (const e of enemies) {
      for (const type of ['Charge', 'Shoot'] as const) {
        const cmd = { type, unitId: u.id, targetId: e.id };
        const p = previewCombat(state, cmd);
        if (isRejection(p)) continue;
        let v = attackValue(p);
        // A shooter should not trade its missiles for a poor melee.
        if (type === 'Charge' && isShooter(u) && p.outcome !== 'catchRouter') v -= 6;
        if (!best || v > best.v) best = { cmd, v };
      }
    }
    if (!best) return null;
    return best.v >= AI_WEIGHTS.attackThreshold[posture] ? best.cmd : null;
  }

  /** True if a fighting enemy is close enough to charge this unit next turn. */
  private threatened(state: BattleState, u: Unit): boolean {
    return state.units.some(
      (e) =>
        e.side !== u.side &&
        isFighting(e) &&
        e.type.stats.impact > 0 &&
        chebyshev(e, u) <= Math.ceil(e.type.stats.mp / 2),
    );
  }

  private scoreSquare(
    state: BattleState,
    u: Unit,
    p: Pos,
    facing: Dir,
    posture: 'aggressive' | 'defensive',
  ): number {
    const W = AI_WEIGHTS;
    const enemies = state.units.filter((e) => e.side !== u.side && isFighting(e));
    if (enemies.length === 0) return 0;
    let score = 0;
    const nearest = enemies.reduce((a, b) => (chebyshev(a, p) <= chebyshev(b, p) ? a : b));
    const dist = chebyshev(nearest, p);

    if (isShooter(u)) {
      const range = shootingRange(state, u);
      const canShoot = enemies.some(
        (e) =>
          rangeDistance(p, e) <= range &&
          hasLineOfSight(state, p, e) &&
          arcOf(p, facing, e) === 'front',
      );
      if (canShoot) score += W.inRangeBonus;
      score -= W.approach * Math.abs(dist - Math.max(2, Math.floor(range * 0.75)));
      if (terrainRules(state.map, p).cover) score += W.coverForShooters;
    } else if (posture === 'aggressive') {
      score -= W.approach * dist;
    }

    if (posture === 'defensive') {
      const a = this.anchors.get(u.id) ?? u;
      score -= W.anchorPull * chebyshev(a, p);
    }

    // Ending in an enemy's front arc invites its charge; spears welcome cavalry though.
    if (inEnemyZoc(state, u.side, p)) {
      const spearVsCav =
        (hasTag(u, 'AntiCavalry') || hasTag(u, 'AntiCavalryStrong')) &&
        enemies.some((e) => isCavalryLike(e.type) && chebyshev(e, p) === 1);
      if (!spearVsCav) score -= W.exposedFront * (isShooter(u) ? 2 : 1);
    }

    // Enemies that could hit our flank or rear next turn.
    for (const e of enemies) {
      if (e.type.stats.impact <= 0) continue;
      if (chebyshev(e, p) > Math.ceil(e.type.stats.mp / 2) + 1) continue;
      if (arcOf(p, facing, e) !== 'front') score -= W.flankThreat;
    }

    // Stay in line with friends.
    for (const f of state.units) {
      if (f.side === u.side && f.id !== u.id && isFighting(f) && chebyshev(f, p) === 1)
        score += W.friendNearby;
    }
    score += W.highGround * elevationAt(state.map, p);
    return score;
  }

  private faceTowardsEnemy(state: BattleState, u: Unit, p: Pos): Dir {
    const enemies = state.units.filter((e) => e.side !== u.side && isFighting(e));
    if (enemies.length === 0) return u.facing;
    const nearest = enemies.reduce((a, b) => (chebyshev(a, p) <= chebyshev(b, p) ? a : b));
    return nearestDir(p, nearest);
  }

  private bestMove(
    state: BattleState,
    u: Unit,
    posture: 'aggressive' | 'defensive',
  ): Command | null {
    const stayFacing = this.faceTowardsEnemy(state, u, u);
    let bestScore = this.scoreSquare(state, u, u, u.facing, posture);
    let best: Command | null = null;
    // Turning in place to face the enemy.
    if (
      stayFacing !== u.facing &&
      !validateCommand(state, { type: 'Rotate', unitId: u.id, facing: stayFacing })
    ) {
      const s = this.scoreSquare(state, u, u, stayFacing, posture);
      if (s > bestScore + AI_WEIGHTS.moveMargin) {
        bestScore = s;
        best = { type: 'Rotate', unitId: u.id, facing: stayFacing };
      }
    }
    for (const r of reachableSquares(state, u)) {
      const want = this.faceTowardsEnemy(state, u, r.pos);
      let facing = r.facing;
      if (r.kind === 'move') {
        const plan = planMove(state, u, r.pos, want);
        if (!isRejection(plan)) facing = want;
      }
      const s = this.scoreSquare(state, u, r.pos, facing, posture) - r.cost * 0.01;
      if (s > bestScore + AI_WEIGHTS.moveMargin) {
        bestScore = s;
        best = {
          type: 'Move',
          unitId: u.id,
          to: r.pos,
          ...(r.kind === 'move' && facing === want ? { facing } : {}),
        };
      }
    }
    return best;
  }
}

/** Plays one whole side turn for the AI (headless use: tests, balance-sim). */
export function playAiSideTurn(
  ai: AiPlayer,
  apply: (cmd: Command) => { ok: boolean },
  getState: () => BattleState,
): void {
  for (let i = 0; i < 400; i++) {
    if (getState().result) return;
    const cmd = ai.next(getState());
    const res = apply(cmd);
    if (cmd.type === 'EndTurn') return;
    if (!res.ok) break;
  }
  if (!getState().result) apply({ type: 'EndTurn' });
}

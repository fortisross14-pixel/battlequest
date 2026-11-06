import {
  arcOf,
  chebyshev,
  connects,
  cutsCorner,
  DIRS,
  hasLineOfSight,
  inBounds,
  isDiagonal,
  isEngaged,
  isFighting,
  isOnMap,
  isPassable,
  isRejection,
  nearestDir,
  planMove,
  previewCombat,
  rangeDistance,
  reachableSquares,
  requireUnit,
  RULES,
  searchFor,
  shootingRange,
  step,
  terrainMoveMultiplier,
  validateCommand,
  elevationAt,
  terrainRules,
  inEnemyZoc,
  isCavalryLike,
  hasTag,
  inCommandRadius,
  Cohesion,
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
 * Defensive and timed units turn aggressive for the rest of the battle once they are
 * triggered (an enemy comes close, a friend nearby is in melee, or they are hurt).
 */
export type Posture = 'aggressive' | 'defensive' | 'timed';

export interface AiConfig {
  posture: Posture;
  attackTurn?: number;
}

/** Something that plays a side one command at a time (the AI, or a frozen baseline). */
export interface CommandSource {
  next(state: BattleState): Command;
  /** Tells the player a command it returned was rejected, so it moves on to another unit. */
  rejected?(cmd: Command): void;
}

/** Weights for the utility scores. Tunable in one place. */
export const AI_WEIGHTS = {
  cohesionDrop: 20,
  rout: 50,
  catchRouter: 45,
  /** Minimum score for an attack to be worth it. */
  attackThreshold: { aggressive: 2, defensive: 5 },
  /** Per square of movement-cost distance to the nearest enemy. */
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
  /** Charging an enemy that is already in melee with a friend. */
  support: 6,
  /** Extra when that support charge hits the enemy's flank or rear. */
  supportFlank: 4,
  /** Ending next to the flank or rear of an enemy that is pinned in melee. */
  flankSquare: 3,
  /** A shooter trading its missiles for a melee (not against routers). */
  shooterCharge: 6,
  /** Shooters stay within this many squares ahead of the friendly line… */
  shooterLead: 2,
  /** …or lose this much per extra square. */
  shooterAhead: 3,
  /** Moving first costs a little, so a direct charge beats an equal move + charge. */
  moveChargeCost: 0.5,
  /** A worthwhile general skill. */
  skill: 12,
  /** Posture triggers: an enemy this close… */
  triggerRadius: 3,
  /** …or a friend this close in melee. */
  friendEngagedRadius: 4,
  /** Positional moves rank below attacks: their score gain is scaled by this. */
  moveScale: 0.1,
};

type Stage = 'fresh' | 'moved' | 'done';
type Stance = 'aggressive' | 'defensive';

interface Option {
  unitId: string;
  cmd: Command;
  value: number;
}

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

/** A straight charge line from `from` to `to` (orthogonal or diagonal). */
function lineTo(from: Pos, to: Pos): { dir: Dir; distance: number } | null {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (dx === 0 && dy === 0) return null;
  if (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy)) return null;
  return { dir: nearestDir(from, to), distance: chebyshev(from, to) };
}

/**
 * Utility AI. Call `next(state)` repeatedly: it returns one valid command at a time
 * (ending with EndTurn), so the UI can animate each enemy move. Each call scores every
 * unit's best option and plays the single best one, then re-scores. Deterministic.
 */
export class AiPlayer implements CommandSource {
  private stage = new Map<string, Stage>();
  private turnKey = '';
  /** Where each unit started the battle: defensive units hold near it. */
  private anchors = new Map<string, Pos>();
  /** Units that have turned aggressive for the rest of the battle. */
  private triggered = new Set<string>();
  /** Movement-cost distance fields towards the enemy, per unit, for this side turn. */
  private fields = new Map<string, Float64Array>();

  constructor(
    readonly side: Side,
    readonly config: AiConfig,
  ) {}

  /** The stance a unit plays with now, after posture triggers. */
  postureOf(state: BattleState, unitId: string): Stance {
    this.updateTriggers(state);
    if (this.config.posture === 'aggressive') return 'aggressive';
    if (this.config.posture === 'timed' && state.turn >= (this.config.attackTurn ?? 1)) {
      return 'aggressive';
    }
    return this.triggered.has(unitId) ? 'aggressive' : 'defensive';
  }

  rejected(cmd: Command): void {
    if ('unitId' in cmd) this.stage.set(cmd.unitId, 'done');
  }

  next(state: BattleState): Command {
    if (state.result || state.activeSide !== this.side) return { type: 'EndTurn' };
    const key = `${state.turn}:${state.activeSide}`;
    if (key !== this.turnKey) {
      this.turnKey = key;
      this.stage.clear();
      this.fields.clear();
    }
    for (const u of state.units) {
      if (u.side === this.side && !this.anchors.has(u.id))
        this.anchors.set(u.id, { x: u.x, y: u.y });
    }
    this.updateTriggers(state);

    const mine = state.units
      .filter((u) => u.side === this.side && isFighting(u))
      .sort((a, b) => a.id.localeCompare(b.id));
    let best: Option | null = null;
    for (const u of mine) {
      const stage = this.stage.get(u.id) ?? 'fresh';
      if (stage === 'done') continue;
      const opt = this.bestOption(state, u, stage);
      if (!opt || validateCommand(state, opt.cmd)) {
        this.stage.set(u.id, 'done');
        continue;
      }
      if (!best || opt.value > best.value) best = opt;
    }
    if (!best) return { type: 'EndTurn' };
    const t = best.cmd.type;
    // After a skill the unit may still move; after a charge, shot or brace it is done.
    if (t === 'Move' || t === 'Rotate') this.stage.set(best.unitId, 'moved');
    else if (t !== 'UseSkill') this.stage.set(best.unitId, 'done');
    return best.cmd;
  }

  // ---------- Posture triggers ----------

  private updateTriggers(state: BattleState): void {
    const W = AI_WEIGHTS;
    const mine = state.units.filter((u) => u.side === this.side && isOnMap(u));
    const enemies = state.units.filter((e) => e.side !== this.side && isFighting(e));
    for (const u of mine) {
      if (this.triggered.has(u.id)) continue;
      const enemyClose = enemies.some((e) => chebyshev(e, u) <= W.triggerRadius);
      const friendFighting = mine.some(
        (f) => chebyshev(f, u) <= W.friendEngagedRadius && isEngaged(state, f.id),
      );
      // Units start at full strength, so any loss means it was shot or fought.
      const hurt = u.strength < 100;
      if (enemyClose || friendFighting || hurt) this.triggered.add(u.id);
    }
  }

  // ---------- Choosing one unit's option ----------

  private bestOption(state: BattleState, u: Unit, stage: Stage): Option | null {
    const stance = this.postureOf(state, u.id);
    // A general in melee can still use a skill.
    const skill = u.hasActed ? null : this.bestSkill(state, u);
    if (skill) return { unitId: u.id, cmd: skill, value: AI_WEIGHTS.skill };
    if (isEngaged(state, u.id)) return null;

    const threshold = AI_WEIGHTS.attackThreshold[stance];
    let best: Option | null = null;
    const consider = (cmd: Command, value: number) => {
      if (value >= threshold && (!best || value > best.value)) best = { unitId: u.id, cmd, value };
    };
    const direct = u.hasActed ? null : this.bestAttack(state, u);
    if (direct) consider(direct.cmd, direct.value);
    if (!u.hasActed && stage === 'fresh' && u.mpLeft > 0) {
      const mc = this.bestMoveCharge(state, u);
      if (mc) consider(mc.cmd, mc.value);
    }
    if (best) return best;

    if (stage === 'fresh' && u.mpLeft > 0) {
      const move = this.bestMove(state, u, stance);
      if (move) return { unitId: u.id, cmd: move.cmd, value: move.gain * AI_WEIGHTS.moveScale };
    }
    // Brace if an enemy could reach us and we did nothing else.
    if (!u.hasActed && this.threatened(state, u))
      return { unitId: u.id, cmd: { type: 'Hold', unitId: u.id }, value: 0 };
    return null;
  }

  /** Simple rules for when a general's skill is worth the general unit's action. */
  private bestSkill(state: BattleState, u: Unit): Command | null {
    const g = state.sides[this.side].general;
    if (!g || g.lost || g.unitId !== u.id) return null;
    const mine = state.units.filter(
      (x) => x.side === this.side && isOnMap(x) && inCommandRadius(state, x),
    );
    const enemyNear = (x: Unit) =>
      state.units.some((e) => e.side !== this.side && isFighting(e) && chebyshev(e, x) <= 3);
    for (const sk of g.skills) {
      if (state.turn < sk.readyTurn) continue;
      const e = sk.effect;
      const cmd = (targetId?: string): Command => ({
        type: 'UseSkill',
        unitId: u.id,
        skillId: sk.id,
        ...(targetId ? { targetId } : {}),
      });
      if (e.kind === 'rally') {
        const t = mine.find((x) => x.cohesion === Cohesion.Routed);
        if (t) return cmd(t.id);
      } else if (e.kind === 'heal') {
        const missing = mine
          .filter(isFighting)
          .reduce((sum, x) => sum + Math.min(e.amount, 100 - x.strength), 0);
        if (missing >= 2 * e.amount) return cmd();
      } else if (e.kind === 'cohesionUp') {
        if (mine.filter((x) => isFighting(x) && x.cohesion >= Cohesion.Disrupted).length >= 2)
          return cmd();
      } else if (e.kind === 'holdTheLine') {
        if (mine.filter((x) => isEngaged(state, x.id)).length >= 2) return cmd();
      } else if (e.kind === 'flankBoost') {
        if (mine.filter((x) => isFighting(x) && enemyNear(x)).length >= 2) return cmd();
      } else if (e.kind === 'holdFast') {
        const t = mine.find((x) => isFighting(x) && isEngaged(state, x.id));
        if (t) return cmd(t.id);
      }
    }
    return null;
  }

  /** Value of a charge or shot, including the bonus for joining a friend's fight. */
  private attackScore(
    state: BattleState,
    u: Unit,
    cmd: { type: 'Charge' | 'Shoot'; unitId: string; targetId: string },
  ): number | null {
    const p = previewCombat(state, cmd);
    if (isRejection(p)) return null;
    const W = AI_WEIGHTS;
    let v = attackValue(p);
    if (cmd.type === 'Charge' && isShooter(u) && p.outcome !== 'catchRouter') v -= W.shooterCharge;
    const target = requireUnit(state, cmd.targetId);
    if (cmd.type === 'Charge' && p.outcome !== 'catchRouter' && isEngaged(state, target.id)) {
      v += W.support;
      if (arcOf(target, target.facing, u) !== 'front') v += W.supportFlank;
    }
    return v;
  }

  private bestAttack(state: BattleState, u: Unit): { cmd: Command; value: number } | null {
    let best: { cmd: Command; value: number } | null = null;
    for (const e of state.units) {
      if (e.side === u.side || !isOnMap(e)) continue;
      for (const type of ['Charge', 'Shoot'] as const) {
        const cmd = { type, unitId: u.id, targetId: e.id };
        const v = this.attackScore(state, u, cmd);
        if (v !== null && (!best || v > best.value)) best = { cmd, value: v };
      }
    }
    return best;
  }

  /**
   * Move-then-charge: for each square the unit can reach facing straight at an enemy,
   * pretend it moved there and score the charge from there. Returns the Move to make.
   */
  private bestMoveCharge(state: BattleState, u: Unit): { cmd: Command; value: number } | null {
    const reach = searchFor(state, u);
    const orth = RULES.movement.orthogonalCost;
    const targets = state.units.filter((e) => e.side !== u.side && isOnMap(e));
    let best: { cmd: Command; value: number } | null = null;
    for (const r of reachableSquares(state, u)) {
      if (r.kind !== 'move') continue;
      for (const e of targets) {
        const line = lineTo(r.pos, e);
        if (!line) continue;
        // Quick reject: the charge itself needs about (distance − 1) squares of MP.
        if ((line.distance - 1) * orth > u.mpLeft - r.cost + 1e-9) continue;
        const plan = planMove(state, u, r.pos, line.dir, reach);
        if (isRejection(plan)) continue;
        const sim: BattleState = {
          ...state,
          units: state.units.map((x) =>
            x.id === u.id
              ? { ...x, x: r.pos.x, y: r.pos.y, facing: line.dir, mpLeft: u.mpLeft - plan.cost }
              : x,
          ),
        };
        const moved = sim.units.find((x) => x.id === u.id)!;
        const v = this.attackScore(sim, moved, { type: 'Charge', unitId: u.id, targetId: e.id });
        if (v === null) continue;
        const value = v - AI_WEIGHTS.moveChargeCost - plan.cost * 0.01;
        if (!best || value > best.value) {
          best = {
            cmd: { type: 'Move', unitId: u.id, to: { ...r.pos }, facing: line.dir },
            value,
          };
        }
      }
    }
    return best;
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

  // ---------- Positional moves ----------

  /**
   * Distance from every square to the nearest fighting enemy, in squares of movement
   * cost for this unit (rivers, woods and fords count; other units don't block).
   */
  private field(state: BattleState, u: Unit): Float64Array {
    const cached = this.fields.get(u.id);
    if (cached) return cached;
    const { width, height } = state.map;
    const dist = new Float64Array(width * height).fill(Infinity);
    const queue: { i: number; d: number }[] = [];
    for (const e of state.units) {
      if (e.side === u.side || !isFighting(e)) continue;
      dist[e.y * width + e.x] = 0;
      queue.push({ i: e.y * width + e.x, d: 0 });
    }
    const M = RULES.movement;
    // Small maps: a simple sorted-queue Dijkstra is fast enough.
    while (queue.length) {
      queue.sort((a, b) => b.d - a.d);
      const { i, d } = queue.pop()!;
      if (d > dist[i]!) continue;
      const p = { x: i % width, y: Math.floor(i / width) };
      for (const dir of DIRS) {
        const q = step(p, dir);
        if (!inBounds(state.map, q) || !isPassable(state.map, q)) continue;
        if (!connects(state.map, p, dir) || cutsCorner(state.map, p, dir)) continue;
        const mult = terrainMoveMultiplier(state, u, p);
        if (!Number.isFinite(mult)) continue;
        const c = (isDiagonal(dir) ? M.diagonalCost : M.orthogonalCost) * mult;
        const j = q.y * width + q.x;
        if (d + c < dist[j]!) {
          dist[j] = d + c;
          queue.push({ i: j, d: d + c });
        }
      }
    }
    for (let i = 0; i < dist.length; i++) dist[i] = dist[i]! / M.orthogonalCost;
    this.fields.set(u.id, dist);
    return dist;
  }

  private pathDist(state: BattleState, u: Unit, p: Pos): number {
    const d = this.field(state, u)[p.y * state.map.width + p.x]!;
    return Number.isFinite(d) ? d : 99;
  }

  private scoreSquare(state: BattleState, u: Unit, p: Pos, facing: Dir, stance: Stance): number {
    const W = AI_WEIGHTS;
    const enemies = state.units.filter((e) => e.side !== u.side && isFighting(e));
    if (enemies.length === 0) return 0;
    let score = 0;
    const dist = this.pathDist(state, u, p);

    if (isShooter(u)) {
      const range = shootingRange(state, u);
      const canShoot = enemies.some(
        (e) =>
          rangeDistance(p, e) <= range &&
          hasLineOfSight(state, p, e) &&
          arcOf(p, facing, e) === 'front',
      );
      const ideal = Math.max(2, Math.floor(range * 0.75));
      if (canShoot) {
        score += W.inRangeBonus;
        const nearest = Math.min(...enemies.map((e) => chebyshev(e, p)));
        score -= W.approach * 0.5 * Math.abs(nearest - ideal);
      } else if (stance === 'aggressive') {
        score -= W.approach * Math.max(0, dist - ideal);
      }
      if (terrainRules(state.map, p).cover) score += W.coverForShooters;
      // Shooters keep with the army instead of running ahead of the melee line.
      const line = state.units
        .filter((f) => f.side === u.side && f.id !== u.id && isFighting(f) && !isShooter(f))
        .map((f) => this.pathDist(state, u, f))
        .sort((a, b) => a - b);
      if (line.length) {
        const front = line[Math.floor(line.length / 2)]!;
        const ahead = front - dist - W.shooterLead;
        if (ahead > 0) score -= W.shooterAhead * ahead;
      }
    } else if (stance === 'aggressive') {
      score -= W.approach * dist;
      // Squares on the flank or rear of an enemy pinned by a friend set up a charge.
      for (const e of enemies) {
        if (chebyshev(e, p) === 1 && isEngaged(state, e.id) && arcOf(e, e.facing, p) !== 'front')
          score += W.flankSquare;
      }
    }

    if (stance === 'defensive') {
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

    // Enemies that could hit our flank or rear next turn. Enemies in melee can't charge.
    for (const e of enemies) {
      if (e.type.stats.impact <= 0 || isEngaged(state, e.id)) continue;
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
    stance: Stance,
  ): { cmd: Command; gain: number } | null {
    const stay = this.scoreSquare(state, u, u, u.facing, stance);
    let bestScore = stay;
    let best: Command | null = null;
    const stayFacing = this.faceTowardsEnemy(state, u, u);
    // Turning in place to face the enemy.
    if (
      stayFacing !== u.facing &&
      !validateCommand(state, { type: 'Rotate', unitId: u.id, facing: stayFacing })
    ) {
      const s = this.scoreSquare(state, u, u, stayFacing, stance);
      if (s > bestScore + AI_WEIGHTS.moveMargin) {
        bestScore = s;
        best = { type: 'Rotate', unitId: u.id, facing: stayFacing };
      }
    }
    const reach = searchFor(state, u);
    for (const r of reachableSquares(state, u)) {
      const want = this.faceTowardsEnemy(state, u, r.pos);
      let facing = r.facing;
      if (r.kind === 'move') {
        const plan = planMove(state, u, r.pos, want, reach);
        if (!isRejection(plan)) facing = want;
      }
      const s = this.scoreSquare(state, u, r.pos, facing, stance) - r.cost * 0.01;
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
    return best ? { cmd: best, gain: bestScore - stay } : null;
  }
}

/**
 * Plays one whole side turn (headless use: tests, balance-sim). A rejected command is
 * reported back to the player, which moves on to its next unit.
 */
export function playAiSideTurn(
  ai: CommandSource,
  apply: (cmd: Command) => { ok: boolean },
  getState: () => BattleState,
): void {
  let rejections = 0;
  for (let i = 0; i < 400; i++) {
    if (getState().result) return;
    const cmd = ai.next(getState());
    const res = apply(cmd);
    if (cmd.type === 'EndTurn') return;
    if (!res.ok) {
      ai.rejected?.(cmd);
      if (++rejections > 20 || !ai.rejected) break;
    }
  }
  if (!getState().result) apply({ type: 'EndTurn' });
}

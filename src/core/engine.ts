import {
  canEvade,
  evadeChance,
  evadePath,
  checkShot,
  computeDamage,
  planCharge,
  rollDamage,
  antiCavalryFront,
  type ChargePlan,
} from './combat';
import { RULES } from './config';
import {
  breakthrough,
  hasAction,
  othismosChance,
  planFullCharge,
  planOthismos,
  planParthian,
  planStance,
  planVolley,
  volleyDamage,
} from './actions';
import { expireEffects, planSkill, resolveSkill, type SkillPlan } from './generals';
import { nextRandom } from './rng';
import type { GameEvent } from './events';
import { arcOf, isAdjacent, opposite, step, toDir, type Arc } from './geometry';
import {
  afterDamage,
  applyDamage,
  cohesionTest,
  destroyUnit,
  pursue,
  rallyPhase,
  routMove,
} from './morale';
import { planMove, stepCost, turnCost, type MovePlan } from './movement';
import { isRejection, reject, type Rejection } from './rejection';
import {
  createBattleState,
  getUnit,
  hasTag,
  isArmyBroken,
  isEngaged,
  isFighting,
  isOnMap,
  isRouted,
  opponentsOf,
  requireUnit,
  unitAt,
  type Scenario,
} from './state';
import {
  Cohesion,
  SIDES,
  otherSide,
  type BattleState,
  type Dir,
  type Pos,
  type Side,
  type Unit,
} from './types';

export type Command =
  | { type: 'Move'; unitId: string; to: Pos; facing?: Dir }
  | { type: 'Rotate'; unitId: string; facing: Dir }
  /** `full`: a Full charge (GAME_DESIGN 4.12), with a chance to break through. */
  | { type: 'Charge'; unitId: string; targetId: string; full?: boolean }
  | { type: 'Shoot'; unitId: string; targetId: string }
  | { type: 'Hold'; unitId: string }
  | { type: 'UseSkill'; unitId: string; skillId: string; targetId?: string }
  // Tactical actions (GAME_DESIGN 4.12).
  /** Area fire: `at` is the top-left square of the 2×2 area. */
  | { type: 'Volley'; unitId: string; at: Pos }
  | { type: 'Fortify'; unitId: string }
  | { type: 'Testudo'; unitId: string }
  | { type: 'LastStand'; unitId: string }
  | { type: 'Othismos'; unitId: string; targetId: string }
  /** Shoot, then retire to `to` (half MP, ignoring zones of control). */
  | { type: 'ParthianShot'; unitId: string; targetId: string; to: Pos }
  /** A side gives up the battle (retreat). Allowed on either side's turn. */
  | { type: 'Concede'; side: Side }
  /** Ends the battle so it can be replayed from deployment (UX §6): no winner, no defeat. */
  | { type: 'Restart' }
  | { type: 'EndTurn' };

export type CommandResult =
  { ok: true; state: BattleState; events: GameEvent[] } | { ok: false; rejection: Rejection };

/** Creates a battle and runs the first side's turn start. */
export function startBattle(scenario: Scenario): BattleState {
  const state = createBattleState(scenario);
  startSideTurn(state, []);
  return state;
}

// ---------- Validation ----------

function controllable(state: BattleState, unitId: string): Unit | Rejection {
  if (state.result) return reject('BATTLE_OVER', 'The battle is over.');
  const u = getUnit(state, unitId);
  if (!u) return reject('UNKNOWN_UNIT', `No unit ${unitId}.`);
  if (u.side !== state.activeSide)
    return reject('NOT_YOUR_TURN', 'That unit belongs to the other side.');
  if (!isOnMap(u)) return reject('NOT_ON_MAP', 'That unit has left the battle.');
  if (isRouted(u)) return reject('ROUTED', 'Routed units are out of control.');
  return u;
}

function needsAction(u: Unit): Rejection | null {
  return u.hasActed
    ? reject('ALREADY_ACTED', 'This unit has already used its action this turn.')
    : null;
}

type Plan =
  | { type: 'Move'; unit: Unit; plan: MovePlan }
  | { type: 'Rotate'; unit: Unit; facing: Dir; cost: number }
  | { type: 'Charge'; unit: Unit; target: Unit; plan: ChargePlan; full: boolean }
  | { type: 'Shoot'; unit: Unit; target: Unit }
  | { type: 'Hold'; unit: Unit }
  | { type: 'Volley'; unit: Unit; at: Pos; targets: Unit[] }
  | { type: 'Fortify' | 'Testudo' | 'LastStand'; unit: Unit }
  | { type: 'Othismos'; unit: Unit; target: Unit; dir: Dir; to: Pos | null }
  | { type: 'ParthianShot'; unit: Unit; target: Unit; path: Pos[] }
  | { type: 'UseSkill'; unit: Unit; plan: SkillPlan }
  | { type: 'Concede'; side: Side }
  | { type: 'Restart' }
  | { type: 'EndTurn' };

/** Checks a command against the rules. Never changes state. */
export function planCommand(state: BattleState, cmd: Command): Plan | Rejection {
  if (cmd.type === 'EndTurn') {
    return state.result ? reject('BATTLE_OVER', 'The battle is over.') : { type: 'EndTurn' };
  }
  if (cmd.type === 'Restart') {
    return state.result ? reject('BATTLE_OVER', 'The battle is over.') : { type: 'Restart' };
  }
  if (cmd.type === 'Concede') {
    return state.result
      ? reject('BATTLE_OVER', 'The battle is over.')
      : { type: 'Concede', side: cmd.side };
  }
  const u = controllable(state, cmd.unitId);
  if (isRejection(u)) return u;
  switch (cmd.type) {
    case 'Move': {
      const plan = planMove(state, u, cmd.to, cmd.facing);
      return isRejection(plan) ? plan : { type: 'Move', unit: u, plan };
    }
    case 'Rotate': {
      if (isEngaged(state, u.id)) return reject('ENGAGED', 'Units in melee cannot turn.');
      const cost = turnCost(u, u.facing, cmd.facing);
      if (cost > u.mpLeft + 1e-9)
        return reject('NOT_ENOUGH_MP', 'Not enough movement points to turn.');
      return { type: 'Rotate', unit: u, facing: toDir(cmd.facing), cost };
    }
    case 'Charge': {
      const acted = needsAction(u);
      if (acted) return acted;
      const target = getUnit(state, cmd.targetId);
      if (!target) return reject('UNKNOWN_UNIT', `No unit ${cmd.targetId}.`);
      const plan = planCharge(state, u, target);
      if (isRejection(plan)) return plan;
      if (cmd.full) {
        const bad = planFullCharge(u, plan);
        if (bad) return bad;
      }
      return { type: 'Charge', unit: u, target, plan, full: !!cmd.full };
    }
    case 'Shoot': {
      const acted = needsAction(u);
      if (acted) return acted;
      const target = getUnit(state, cmd.targetId);
      if (!target) return reject('UNKNOWN_UNIT', `No unit ${cmd.targetId}.`);
      const bad = checkShot(state, u, target);
      return bad ?? { type: 'Shoot', unit: u, target };
    }
    case 'UseSkill': {
      const plan = planSkill(state, u, cmd.skillId, cmd.targetId);
      return isRejection(plan) ? plan : { type: 'UseSkill', unit: u, plan };
    }
    case 'Hold': {
      const acted = needsAction(u);
      if (acted) return acted;
      if (isEngaged(state, u.id)) return reject('ENGAGED', 'Units already in melee cannot brace.');
      return { type: 'Hold', unit: u };
    }
    case 'Volley': {
      const acted = needsAction(u);
      if (acted) return acted;
      const v = planVolley(state, u, cmd.at);
      return isRejection(v) ? v : { type: 'Volley', unit: u, at: cmd.at, targets: v.targets };
    }
    case 'Fortify':
    case 'Testudo':
    case 'LastStand': {
      const kind =
        cmd.type === 'Fortify' ? 'fortify' : cmd.type === 'Testudo' ? 'testudo' : 'lastStand';
      const bad = planStance(state, u, kind);
      return bad ?? { type: cmd.type, unit: u };
    }
    case 'Othismos': {
      const target = getUnit(state, cmd.targetId);
      if (!target) return reject('UNKNOWN_UNIT', `No unit ${cmd.targetId}.`);
      const p = planOthismos(state, u, target);
      return isRejection(p) ? p : { type: 'Othismos', unit: u, target, dir: p.dir, to: p.to };
    }
    case 'ParthianShot': {
      const acted = needsAction(u);
      if (acted) return acted;
      const target = getUnit(state, cmd.targetId);
      if (!target) return reject('UNKNOWN_UNIT', `No unit ${cmd.targetId}.`);
      const bad = checkShot(state, u, target);
      if (bad) return bad;
      const path = planParthian(state, u, cmd.to);
      return isRejection(path) ? path : { type: 'ParthianShot', unit: u, target, path };
    }
  }
}

export function validateCommand(state: BattleState, cmd: Command): Rejection | null {
  const p = planCommand(state, cmd);
  return isRejection(p) ? p : null;
}

// ---------- Application ----------

/** Applies a command to a copy of the state. The input state is never modified. */
export function applyCommand(state: BattleState, cmd: Command): CommandResult {
  const checked = planCommand(state, cmd);
  if (isRejection(checked)) return { ok: false, rejection: checked };
  const draft = structuredClone(state);
  const events: GameEvent[] = [];
  const unit = 'unit' in checked ? requireUnit(draft, checked.unit.id) : null;
  switch (checked.type) {
    case 'Move': {
      const { plan } = checked;
      const dest = plan.path[plan.path.length - 1]!;
      unit!.x = dest.x;
      unit!.y = dest.y;
      unit!.facing = plan.facing;
      // A pull-back ends the unit's movement; a sidestep or a normal move spends its cost.
      unit!.mpLeft = plan.kind === 'pullBack' ? 0 : unit!.mpLeft - plan.cost;
      unit!.hasMoved = true;
      // Moving breaks a Fortify or a Testudo (GAME_DESIGN 4.12).
      unit!.fortified = false;
      unit!.testudo = false;
      events.push({
        type: 'UnitMoved',
        unitId: unit!.id,
        kind: plan.kind,
        path: plan.path,
        facing: plan.facing,
      });
      break;
    }
    case 'Rotate': {
      const from = unit!.facing;
      unit!.facing = checked.facing;
      unit!.mpLeft -= checked.cost;
      events.push({ type: 'UnitRotated', unitId: unit!.id, from, to: checked.facing });
      break;
    }
    case 'Charge':
      resolveCharge(
        draft,
        unit!,
        requireUnit(draft, checked.target.id),
        checked.plan,
        events,
        checked.full,
      );
      break;
    case 'Volley':
      resolveVolley(
        draft,
        unit!,
        checked.at,
        checked.targets.map((t) => requireUnit(draft, t.id)),
        events,
      );
      break;
    case 'Fortify':
      unit!.mpLeft -= RULES.actions.fortify.mp;
      unit!.fortified = true;
      // A fortified unit can't charge on that turn.
      unit!.hasActed = true;
      events.push({ type: 'Fortified', unitId: unit!.id });
      break;
    case 'Testudo':
      unit!.mpLeft -= RULES.actions.testudo.mp;
      unit!.testudo = true;
      // The unit can't attack on that turn.
      unit!.hasActed = true;
      events.push({ type: 'TestudoFormed', unitId: unit!.id });
      break;
    case 'LastStand':
      unit!.lastStandUsed = true;
      unit!.lastStandUntil = draft.turn + RULES.actions.lastStand.turns - 1;
      events.push({ type: 'LastStandDeclared', unitId: unit!.id });
      break;
    case 'Othismos':
      resolveOthismos(draft, unit!, requireUnit(draft, checked.target.id), checked.to, events);
      break;
    case 'ParthianShot': {
      resolveShot(draft, unit!, requireUnit(draft, checked.target.id), events);
      const dest = checked.path[checked.path.length - 1]!;
      if (isFighting(unit!) && (dest.x !== unit!.x || dest.y !== unit!.y)) {
        unit!.x = dest.x;
        unit!.y = dest.y;
        unit!.hasMoved = true;
        events.push({
          type: 'UnitMoved',
          unitId: unit!.id,
          kind: 'retire',
          path: checked.path,
          facing: unit!.facing,
        });
      }
      unit!.mpLeft = 0;
      break;
    }
    case 'Shoot':
      resolveShot(draft, unit!, requireUnit(draft, checked.target.id), events);
      break;
    case 'Hold':
      unit!.hasActed = true;
      unit!.bracing = true;
      unit!.mpLeft = 0;
      events.push({ type: 'HoldDeclared', unitId: unit!.id });
      break;
    case 'UseSkill':
      resolveSkill(draft, unit!, checked.plan, events);
      break;
    case 'Concede':
      draft.result = {
        winner: otherSide(checked.side),
        reason: 'conceded',
        turn: draft.turn,
        broken: [checked.side],
      };
      events.push({ type: 'BattleEnded', result: draft.result });
      break;
    case 'Restart':
      draft.result = { winner: null, reason: 'restarted', turn: draft.turn, broken: [] };
      events.push({ type: 'BattleEnded', result: draft.result });
      break;
    case 'EndTurn':
      endSideTurn(draft, events);
      break;
  }
  checkVictory(draft, events);
  return { ok: true, state: draft, events };
}

function resolveShot(state: BattleState, u: Unit, target: Unit, events: GameEvent[]): void {
  u.hasActed = true;
  u.lastShotTurn = state.turn;
  u.ammoUsed = true;
  if (u.type.tags.includes('NoMoveAndShoot')) u.mpLeft = 0;
  events.push({ type: 'ShotFired', unitId: u.id, targetId: target.id });
  const calc = computeDamage(state, u, target, 'ranged');
  const dmg = applyDamage(target, rollDamage(state, calc, target.strength));
  events.push({
    type: 'DamageDealt',
    attackerId: u.id,
    targetId: target.id,
    kind: 'ranged',
    amount: dmg,
    arc: calc.arc,
  });
  afterDamage(state, target, dmg, calc.arc, events);
}

/** Volley (4.12): every enemy in the area takes a share of a focused shot and tests. */
function resolveVolley(
  state: BattleState,
  u: Unit,
  at: Pos,
  targets: Unit[],
  events: GameEvent[],
): void {
  u.hasActed = true;
  u.lastShotTurn = state.turn;
  if (u.type.tags.includes('NoMoveAndShoot')) u.mpLeft = 0;
  events.push({ type: 'VolleyFired', unitId: u.id, at, targetIds: targets.map((t) => t.id) });
  const hits = targets.map((t) => ({ t, calc: volleyDamage(state, u, t) }));
  const dealt = hits.map(({ t, calc }) => {
    const amount = applyDamage(t, rollDamage(state, calc, t.strength));
    events.push({
      type: 'DamageDealt',
      attackerId: u.id,
      targetId: t.id,
      kind: 'ranged',
      amount,
      arc: calc.arc,
    });
    return amount;
  });
  hits.forEach(({ t, calc }, i) => afterDamage(state, t, dealt[i]!, calc.arc, events));
}

/** Othismos (4.12): a shove that pushes the enemy back a square if it loses the check. */
function resolveOthismos(
  state: BattleState,
  u: Unit,
  t: Unit,
  to: Pos | null,
  events: GameEvent[],
): void {
  u.hasActed = true;
  const chance = othismosChance(u, t);
  const roll = nextRandom(state);
  const pushed = !!to && roll < chance;
  events.push({ type: 'OthismosRoll', unitId: u.id, targetId: t.id, chance, roll, pushed });
  if (!pushed || !to) return;
  const from = { x: t.x, y: t.y };
  t.x = to.x;
  t.y = to.y;
  events.push({
    type: 'UnitMoved',
    unitId: t.id,
    kind: 'pushBack',
    path: [from, to],
    facing: t.facing,
  });
  // Its line is broken: out of the melee, and a test to hold together.
  state.engagements = state.engagements.filter(
    (e) => !((e.a === u.id && e.b === t.id) || (e.a === t.id && e.b === u.id)),
  );
  cohesionTest(
    state,
    t,
    { damage: 0, arc: 'front', adjacentRout: false, extra: RULES.actions.othismos.cohesion },
    events,
  );
}

/** Trample: the units on either side of the target (across the charge) take a share. */
function trample(
  state: BattleState,
  u: Unit,
  target: Unit,
  plan: ChargePlan,
  events: GameEvent[],
): void {
  for (const turn of [2, 6]) {
    const d = ((plan.dir + turn) % 8) as Dir;
    const p = step(target, d);
    const v = unitAt(state, p);
    if (!v || v.side === u.side || !isFighting(v)) continue;
    const calc = computeDamage(state, u, v, 'charge', { runUp: plan.path.length - 1 });
    const scaled = { ...calc, expected: calc.expected * RULES.actions.trample.factor };
    const amount = applyDamage(v, rollDamage(state, scaled, v.strength));
    events.push({
      type: 'DamageDealt',
      attackerId: u.id,
      targetId: v.id,
      kind: 'trample',
      amount,
      arc: calc.arc,
    });
    afterDamage(state, v, amount, calc.arc, events);
  }
}

function resolveCharge(
  state: BattleState,
  u: Unit,
  target: Unit,
  plan: ChargePlan,
  events: GameEvent[],
  full = false,
): void {
  // Worked out before the charger moves: the square behind the target, the odds.
  const through = full ? breakthrough(state, u, target, plan) : null;
  const contact = plan.path[plan.path.length - 1]!;
  u.x = contact.x;
  u.y = contact.y;
  u.facing = plan.dir;
  u.mpLeft = 0;
  u.hasActed = true;
  u.bracing = false;
  if (plan.path.length > 1) u.hasMoved = true;
  events.push({ type: 'ChargeDeclared', unitId: u.id, targetId: target.id, path: plan.path });
  if (plan.path.length > 1) {
    events.push({
      type: 'UnitMoved',
      unitId: u.id,
      kind: 'move',
      path: plan.path,
      facing: u.facing,
    });
  }

  if (isRouted(target)) {
    destroyUnit(state, target, 'caught', events);
    return;
  }

  const path = canEvade(state, target) ? evadePath(state, target, plan.dir) : [];
  // Feigned retreat (4.12): an evade on purpose that leaves the pursuer out of order.
  const feign = hasAction(target, 'feignedRetreat');
  if (path.length > 1) {
    const chance = feign
      ? Math.max(evadeChance(u, target), RULES.actions.feignedRetreat.evade)
      : evadeChance(u, target);
    const roll = nextRandom(state);
    const evaded = roll < chance;
    events.push({ type: 'EvadeRoll', unitId: target.id, chance, roll, evaded });
    if (evaded) {
      const end = path[path.length - 1]!;
      target.x = end.x;
      target.y = end.y;
      events.push({
        type: 'UnitMoved',
        unitId: target.id,
        kind: 'evade',
        path,
        facing: target.facing,
      });
      if (feign && isFighting(u) && u.cohesion < Cohesion.Disrupted) {
        events.push({
          type: 'CohesionChanged',
          unitId: u.id,
          from: u.cohesion,
          to: Cohesion.Disrupted,
        });
        u.cohesion = Cohesion.Disrupted;
      }
      return;
    }
  }

  // Impact: both sides strike at once.
  const hit = computeDamage(state, u, target, 'charge', { runUp: plan.path.length - 1, full });
  const back = computeDamage(state, target, u, 'counter');
  const dmgToTarget = applyDamage(target, rollDamage(state, hit, target.strength));
  const dmgToCharger = applyDamage(u, rollDamage(state, back, u.strength));
  events.push({
    type: 'DamageDealt',
    attackerId: u.id,
    targetId: target.id,
    kind: 'impact',
    amount: dmgToTarget,
    arc: hit.arc,
  });
  events.push({
    type: 'DamageDealt',
    attackerId: target.id,
    targetId: u.id,
    kind: 'impact',
    amount: dmgToCharger,
    arc: back.arc,
  });
  // Full charge: roll the breakthrough before anyone is locked in melee.
  let brokeThrough = false;
  if (through) {
    const roll = nextRandom(state);
    brokeThrough =
      through.chance > 0 && roll < through.chance && target.strength > 0 && u.strength > 0;
    events.push({
      type: 'BreakthroughRoll',
      unitId: u.id,
      targetId: target.id,
      chance: through.chance,
      roll,
      success: brokeThrough,
    });
  }
  if (target.strength > 0 && u.strength > 0 && !brokeThrough) {
    state.engagements.push({ a: u.id, b: target.id });
    events.push({ type: 'MeleeJoined', a: u.id, b: target.id });
  }
  // Trample (4.12): an elephant's charge also hits the units either side of the target.
  if (hasAction(u, 'trample')) trample(state, u, target, plan, events);
  afterDamage(state, target, dmgToTarget, hit.arc, events);
  afterDamage(state, u, dmgToCharger, back.arc, events);
  if (brokeThrough && through!.landing && isFighting(u)) {
    const from = { x: u.x, y: u.y };
    u.x = through!.landing.x;
    u.y = through!.landing.y;
    u.facing = through!.facing;
    events.push({
      type: 'UnitMoved',
      unitId: u.id,
      kind: 'breakthrough',
      path: [from, { x: target.x, y: target.y }, through!.landing],
      facing: u.facing,
    });
    // Broken through: the defender's extra test.
    cohesionTest(
      state,
      target,
      { damage: 0, arc: 'rear', adjacentRout: false, extra: RULES.actions.fullCharge.defenderTest },
      events,
    );
    return;
  }
  // A failed Full charge into spears or pikes head on breaks on them.
  if (full && isFighting(u) && antiCavalryFront(target, u) && u.cohesion < Cohesion.Fragmented) {
    const to = (u.cohesion + 1) as Cohesion;
    events.push({ type: 'CohesionChanged', unitId: u.id, from: u.cohesion, to });
    u.cohesion = to;
  }

  // A clear win pushes the defender back one square and the charger follows up.
  // A fortified unit can't be pushed back (4.12).
  const clear =
    isFighting(u) &&
    isFighting(target) &&
    !target.fortified &&
    wonClearly(dmgToTarget, dmgToCharger);
  if (!clear && isFighting(u) && isFighting(target) && hasTag(u, 'HitAndRun')) {
    breakOff(state, u, target, plan, events);
  }
  if (clear) {
    if (stepCost(state, target, target, plan.dir) !== null) {
      const from = { x: target.x, y: target.y };
      const to = step(target, plan.dir);
      target.x = to.x;
      target.y = to.y;
      events.push({
        type: 'UnitMoved',
        unitId: target.id,
        kind: 'pushBack',
        path: [from, to],
        facing: target.facing,
      });
      if (stepCost(state, u, u, plan.dir) !== null) {
        const uFrom = { x: u.x, y: u.y };
        u.x = from.x;
        u.y = from.y;
        events.push({
          type: 'UnitMoved',
          unitId: u.id,
          kind: 'followUp',
          path: [uFrom, from],
          facing: u.facing,
        });
      }
    }
  }
}

/**
 * HitAndRun (chariots): after an impact that neither breaks nor pushes back the target, the
 * charger falls back one square along its path and leaves the melee. With no room behind,
 * it stays in melee.
 */
function breakOff(
  state: BattleState,
  u: Unit,
  target: Unit,
  plan: ChargePlan,
  events: GameEvent[],
): void {
  const back = opposite(plan.dir);
  if (stepCost(state, u, u, back) === null) return;
  const from = { x: u.x, y: u.y };
  const to = step(u, back);
  u.x = to.x;
  u.y = to.y;
  state.engagements = state.engagements.filter(
    (e) => !((e.a === u.id && e.b === target.id) || (e.a === target.id && e.b === u.id)),
  );
  events.push({
    type: 'UnitMoved',
    unitId: u.id,
    kind: 'breakOff',
    path: [from, to],
    facing: u.facing,
  });
}

export function wonClearly(dealt: number, taken: number): boolean {
  return dealt >= RULES.combat.pushBackMinDamage && dealt >= RULES.combat.pushBackRatio * taken;
}

// ---------- Turn phases ----------

/** Drops engagements whose units are no longer adjacent or no longer fighting. */
function pruneEngagements(state: BattleState): void {
  state.engagements = state.engagements.filter((e) => {
    const a = getUnit(state, e.a);
    const b = getUnit(state, e.b);
    return !!a && !!b && isFighting(a) && isFighting(b) && isAdjacent(a, b);
  });
}

/** The opponent a unit strikes in melee: one to its front if any, else the first one. */
export function meleeTargetOf(state: BattleState, u: Unit): Unit | undefined {
  const opps = opponentsOf(state, u.id);
  return opps.find((o) => arcOf(u, u.facing, o) === 'front') ?? opps[0];
}

/** Each engaged unit strikes one opponent (preferring one to its front); damage lands simultaneously. */
export function meleePhase(state: BattleState, events: GameEvent[]): void {
  pruneEngagements(state);
  if (state.engagements.length === 0) return;
  events.push({ type: 'MeleePhase' });
  const ARC_RANK: Record<Arc, number> = { front: 0, flank: 1, rear: 2 };
  const hits = new Map<string, { damage: number; arc: Arc }>();
  for (const u of state.units) {
    if (!isFighting(u)) continue;
    const opps = opponentsOf(state, u.id);
    if (opps.length === 0) continue;
    const target = meleeTargetOf(state, u)!;
    const calc = computeDamage(state, u, target, 'melee');
    const already = hits.get(target.id)?.damage ?? 0;
    const amount = rollDamage(state, calc, Math.max(0, target.strength - already));
    events.push({
      type: 'DamageDealt',
      attackerId: u.id,
      targetId: target.id,
      kind: 'melee',
      amount,
      arc: calc.arc,
    });
    const prev = hits.get(target.id) ?? { damage: 0, arc: 'front' as Arc };
    hits.set(target.id, {
      damage: prev.damage + amount,
      arc: ARC_RANK[calc.arc] > ARC_RANK[prev.arc] ? calc.arc : prev.arc,
    });
  }
  const applied = new Map<string, number>();
  for (const u of state.units) {
    const h = hits.get(u.id);
    if (h) applied.set(u.id, applyDamage(u, h.damage));
  }
  for (const u of state.units) {
    const h = hits.get(u.id);
    if (h) afterDamage(state, u, applied.get(u.id)!, h.arc, events);
  }
}

/** Units that routed this side turn run, then Pursue units follow them. */
function routPhase(state: BattleState, events: GameEvent[]): void {
  for (const id of state.routedThisTurn) {
    const u = getUnit(state, id);
    if (u) routMove(state, u, events);
  }
  for (const { pursuerId, routerId } of state.pendingPursuits)
    pursue(state, pursuerId, routerId, events);
  state.pendingPursuits = [];
}

function endSideTurn(state: BattleState, events: GameEvent[]): void {
  meleePhase(state, events);
  routPhase(state, events);
  pruneEngagements(state);
  events.push({ type: 'SideTurnEnded', side: state.activeSide, turn: state.turn });
  checkVictory(state, events);
  if (state.result) return;
  const next = otherSide(state.activeSide);
  if (next === state.firstSide) {
    if (state.turn >= state.turnLimit) {
      const w = state.turnLimitWinner;
      state.result = {
        winner: w,
        reason: w ? 'heldOut' : 'turnLimit',
        turn: state.turn,
        broken: [],
      };
      events.push({ type: 'BattleEnded', result: state.result });
      return;
    }
    state.turn += 1;
  }
  state.activeSide = next;
  startSideTurn(state, events);
}

function startSideTurn(state: BattleState, events: GameEvent[]): void {
  state.routedThisTurn = [];
  for (const u of state.units) {
    if (u.side !== state.activeSide) continue;
    u.mpLeft = u.type.stats.mp;
    u.turnStartFacing = u.facing;
    u.hasActed = false;
    u.hasMoved = false;
    u.bracing = false;
    u.holdFast = 1;
    u.fortified = false;
  }
  expireEffects(state, state.activeSide);
  events.push({ type: 'SideTurnStarted', side: state.activeSide, turn: state.turn });
  rallyPhase(state, events);
  // Only units that were already routed flee now; any that rout during these moves
  // (from a caught neighbour) flee once, at the end of this side turn.
  const routers = state.units.filter(
    (u) => u.side === state.activeSide && isOnMap(u) && isRouted(u),
  );
  for (const u of routers) routMove(state, u, events);
  pruneEngagements(state);
}

export function checkVictory(state: BattleState, events: GameEvent[]): void {
  if (state.result) return;
  const broken = SIDES.filter((s) => isArmyBroken(state, s));
  if (broken.length === 0) return;
  state.result = {
    winner: broken.length === 1 ? otherSide(broken[0]!) : null,
    reason: broken.some((s) => state.sides[s].general?.lost) ? 'generalFell' : 'armyBroken',
    turn: state.turn,
    broken,
  };
  events.push({ type: 'BattleEnded', result: state.result });
}

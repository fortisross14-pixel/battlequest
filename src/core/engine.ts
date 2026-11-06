import {
  canEvade,
  evadeChance,
  evadePath,
  checkShot,
  computeDamage,
  planCharge,
  rollDamage,
  type ChargePlan,
} from './combat';
import { RULES } from './config';
import { nextRandom } from './rng';
import type { GameEvent } from './events';
import { arcOf, isAdjacent, step, toDir, type Arc } from './geometry';
import { afterDamage, applyDamage, destroyUnit, pursue, rallyPhase, routMove } from './morale';
import { planMove, stepCost, turnCost, type MovePlan } from './movement';
import { isRejection, reject, type Rejection } from './rejection';
import {
  createBattleState,
  getUnit,
  isArmyBroken,
  isEngaged,
  isFighting,
  isOnMap,
  isRouted,
  opponentsOf,
  requireUnit,
  type Scenario,
} from './state';
import { SIDES, otherSide, type BattleState, type Dir, type Pos, type Unit } from './types';

export type Command =
  | { type: 'Move'; unitId: string; to: Pos; facing?: Dir }
  | { type: 'Rotate'; unitId: string; facing: Dir }
  | { type: 'Charge'; unitId: string; targetId: string }
  | { type: 'Shoot'; unitId: string; targetId: string }
  | { type: 'Hold'; unitId: string }
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
  | { type: 'Charge'; unit: Unit; target: Unit; plan: ChargePlan }
  | { type: 'Shoot'; unit: Unit; target: Unit }
  | { type: 'Hold'; unit: Unit }
  | { type: 'EndTurn' };

/** Checks a command against the rules. Never changes state. */
export function planCommand(state: BattleState, cmd: Command): Plan | Rejection {
  if (cmd.type === 'EndTurn') {
    return state.result ? reject('BATTLE_OVER', 'The battle is over.') : { type: 'EndTurn' };
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
      return isRejection(plan) ? plan : { type: 'Charge', unit: u, target, plan };
    }
    case 'Shoot': {
      const acted = needsAction(u);
      if (acted) return acted;
      const target = getUnit(state, cmd.targetId);
      if (!target) return reject('UNKNOWN_UNIT', `No unit ${cmd.targetId}.`);
      const bad = checkShot(state, u, target);
      return bad ?? { type: 'Shoot', unit: u, target };
    }
    case 'Hold': {
      const acted = needsAction(u);
      return acted ?? { type: 'Hold', unit: u };
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
      unit!.mpLeft = plan.kind === 'pullBack' ? 0 : unit!.mpLeft - plan.cost;
      unit!.hasMoved = true;
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
      resolveCharge(draft, unit!, requireUnit(draft, checked.target.id), checked.plan, events);
      break;
    case 'Shoot':
      resolveShot(draft, unit!, requireUnit(draft, checked.target.id), events);
      break;
    case 'Hold':
      unit!.hasActed = true;
      unit!.bracing = true;
      unit!.mpLeft = 0;
      events.push({ type: 'HoldDeclared', unitId: unit!.id });
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

function resolveCharge(
  state: BattleState,
  u: Unit,
  target: Unit,
  plan: ChargePlan,
  events: GameEvent[],
): void {
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
  if (path.length > 1) {
    const chance = evadeChance(u, target);
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
      return;
    }
  }

  // Impact: both sides strike at once.
  const hit = computeDamage(state, u, target, 'charge');
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
  if (target.strength > 0 && u.strength > 0) {
    state.engagements.push({ a: u.id, b: target.id });
    events.push({ type: 'MeleeJoined', a: u.id, b: target.id });
  }
  afterDamage(state, target, dmgToTarget, hit.arc, events);
  afterDamage(state, u, dmgToCharger, back.arc, events);

  // A clear win pushes the defender back one square and the charger follows up.
  if (isFighting(u) && isFighting(target) && wonClearly(dmgToTarget, dmgToCharger)) {
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
    const target = opps.find((o) => arcOf(u, u.facing, o) === 'front') ?? opps[0]!;
    const calc = computeDamage(state, u, target, 'melee');
    const amount = rollDamage(state, calc, 100);
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
      state.result = { winner: null, reason: 'turnLimit', turn: state.turn, broken: [] };
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
    u.hasActed = false;
    u.hasMoved = false;
    u.bracing = false;
  }
  events.push({ type: 'SideTurnStarted', side: state.activeSide, turn: state.turn });
  rallyPhase(state, events);
  for (const u of state.units) {
    if (u.side === state.activeSide && isOnMap(u) && isRouted(u)) routMove(state, u, events);
  }
  pruneEngagements(state);
}

export function checkVictory(state: BattleState, events: GameEvent[]): void {
  if (state.result) return;
  const broken = SIDES.filter((s) => isArmyBroken(state, s));
  if (broken.length === 0) return;
  state.result = {
    winner: broken.length === 1 ? otherSide(broken[0]!) : null,
    reason: 'armyBroken',
    turn: state.turn,
    broken,
  };
  events.push({ type: 'BattleEnded', result: state.result });
}

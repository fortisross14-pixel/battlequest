import {
  chebyshev,
  enemiesOf,
  isFighting,
  isRejection,
  previewCombat,
  reachableSquares,
  validateCommand,
  type BattleSession,
  type BattleState,
  type Pos,
  type Unit,
} from '../core';

/**
 * A fixed, greedy script used by the headless tests and the balance simulator.
 * It is NOT the M3 utility AI: it charges when the preview favours it, otherwise shoots,
 * otherwise walks towards the nearest enemy and tries again. Deterministic.
 */
export function greedyAttack(session: BattleSession, u: Unit): boolean {
  const s = session.state;
  const targets = enemiesOf(s, u)
    .filter(isFighting)
    .sort((a, b) => chebyshev(u, a) - chebyshev(u, b) || a.id.localeCompare(b.id));
  for (const t of targets) {
    const cmd = { type: 'Charge' as const, unitId: u.id, targetId: t.id };
    const p = previewCombat(s, cmd);
    if (
      !isRejection(p) &&
      (p.outcome !== 'fight' || p.defender.expectedLoss >= p.attacker.expectedLoss)
    ) {
      session.apply(cmd);
      return true;
    }
  }
  for (const t of targets) {
    const cmd = { type: 'Shoot' as const, unitId: u.id, targetId: t.id };
    if (!validateCommand(s, cmd)) {
      session.apply(cmd);
      return true;
    }
  }
  return false;
}

function nearestEnemyDistance(s: BattleState, u: Unit, p: Pos): number {
  return Math.min(
    ...enemiesOf(s, u)
      .filter(isFighting)
      .map((e) => chebyshev(e, p)),
  );
}

/** Plays every unit of the active side once, then ends the side turn. */
export function playGreedySideTurn(session: BattleSession): void {
  const side = session.state.activeSide;
  const ids = session.state.units.filter((u) => u.side === side).map((u) => u.id);
  const find = (id: string) => session.state.units.find((x) => x.id === id)!;
  for (const id of ids) {
    const u = find(id);
    if (!isFighting(u) || u.hasActed || session.state.result) continue;
    if (greedyAttack(session, u)) continue;
    const here = nearestEnemyDistance(session.state, u, u);
    const options = reachableSquares(session.state, u)
      .map((r) => ({ r, d: nearestEnemyDistance(session.state, u, r.pos) }))
      .sort(
        (a, b) =>
          a.d - b.d || a.r.cost - b.r.cost || a.r.pos.y - b.r.pos.y || a.r.pos.x - b.r.pos.x,
      );
    const best = options[0];
    if (best && best.d < here) {
      session.apply({ type: 'Move', unitId: id, to: best.r.pos });
      const moved = find(id);
      if (!moved.hasActed) greedyAttack(session, moved);
    }
  }
  if (!session.state.result) session.apply({ type: 'EndTurn' });
}

/** Plays both sides with the greedy script until the battle ends (or a safety cap). */
export function playGreedyBattle(session: BattleSession, maxSideTurns = 200): BattleSession {
  for (let i = 0; i < maxSideTurns && !session.state.result; i++) playGreedySideTurn(session);
  return session;
}

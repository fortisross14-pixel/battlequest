import { describe, expect, it } from 'vitest';
import {
  BattleSession,
  chebyshev,
  enemiesOf,
  isFighting,
  isRejection,
  previewCombat,
  reachableSquares,
  startBattle,
  validateCommand,
  type BattleState,
  type Pos,
  type Unit,
} from '../src/core';
import { sandboxScenario } from '../src/content/battles/sandbox';

/**
 * A fixed, greedy script (not the M3 AI): charge if the preview favours us, otherwise shoot,
 * otherwise advance towards the nearest enemy and try again.
 */
function tryAttack(session: BattleSession, u: Unit): boolean {
  const s = session.state;
  const targets = enemiesOf(s, u)
    .filter(isFighting)
    .sort((a, b) => chebyshev(u, a) - chebyshev(u, b) || a.id.localeCompare(b.id));
  for (const t of targets) {
    const cmd = { type: 'Charge' as const, unitId: u.id, targetId: t.id };
    const p = previewCombat(s, cmd);
    if (
      !isRejection(p) &&
      p.outcome === 'fight' &&
      p.defender.expectedLoss >= p.attacker.expectedLoss
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

function playSideTurn(session: BattleSession): void {
  const side = session.state.activeSide;
  const ids = session.state.units.filter((u) => u.side === side).map((u) => u.id);
  for (const id of ids) {
    const u = session.state.units.find((x) => x.id === id)!;
    if (!isFighting(u) || u.hasActed || session.state.result) continue;
    if (tryAttack(session, u)) continue;
    const options = reachableSquares(session.state, u)
      .map((r) => ({ r, d: nearestEnemyDistance(session.state, u, r.pos) }))
      .sort(
        (a, b) =>
          a.d - b.d || a.r.cost - b.r.cost || a.r.pos.y - b.r.pos.y || a.r.pos.x - b.r.pos.x,
      );
    const best = options[0];
    if (best && best.d < nearestEnemyDistance(session.state, u, u)) {
      session.apply({ type: 'Move', unitId: id, to: best.r.pos });
      const moved = session.state.units.find((x) => x.id === id)!;
      if (!moved.hasActed) tryAttack(session, moved);
    }
  }
  if (!session.state.result) session.apply({ type: 'EndTurn' });
}

function playBattle(seed: number): BattleSession {
  const session = new BattleSession(startBattle(sandboxScenario(seed)));
  for (let i = 0; i < 200 && !session.state.result; i++) playSideTurn(session);
  return session;
}

describe('headless scripted battle', () => {
  it('runs the sandbox battle to a result', () => {
    const session = playBattle(1457);
    const result = session.state.result;
    expect(result).not.toBeNull();
    expect(result!.reason).toBe('armyBroken');
    expect(result!.winner).not.toBeNull();
    expect(session.log.length).toBeGreaterThan(20);
  });

  it('is reproducible: the same seed and commands give the same battle', () => {
    const a = playBattle(1457);
    const b = playBattle(1457);
    expect(JSON.stringify(b.state)).toBe(JSON.stringify(a.state));
    expect(b.log).toEqual(a.log);

    // Replaying the command log from scratch rebuilds the exact same final state.
    const replay = new BattleSession(startBattle(sandboxScenario(1457)));
    for (const cmd of a.log) expect(replay.apply(cmd).ok).toBe(true);
    expect(JSON.stringify(replay.state)).toBe(JSON.stringify(a.state));
  });

  it('a different seed changes the dice', () => {
    expect(JSON.stringify(playBattle(99).state)).not.toBe(JSON.stringify(playBattle(1457).state));
  });

  it('undo restores the state before a move and is blocked after combat', () => {
    const session = new BattleSession(startBattle(sandboxScenario(1)));
    const before = JSON.stringify(session.state);
    expect(session.apply({ type: 'Move', unitId: 'b-spear', to: { x: 6, y: 3 } }).ok).toBe(true);
    expect(session.canUndo()).toBe(true);
    session.undo();
    expect(JSON.stringify(session.state)).toBe(before);
    session.apply({ type: 'Hold', unitId: 'b-spear' });
    expect(session.canUndo()).toBe(false);
  });
});

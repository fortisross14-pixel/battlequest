import { describe, expect, it } from 'vitest';
import { AiPlayer, playAiSideTurn } from '../../src/ai/utility';
import { BATTLE_BY_ID } from '../../src/content/campaign/battles';
import { buildScenario } from '../../src/content/campaign/build';
import type { ArmyChoice, CampaignBattle } from '../../src/content/campaign/types';
import { BattleSession, isEngaged, isOnMap, startBattle, type BattleState } from '../../src/core';

/**
 * The tutorial difficulty (GAME_DESIGN 7.4): Megiddo is almost impossible to lose; Kadesh
 * is easy for sensible play but can be lost by playing badly (backs to the enemy, chariots
 * never charging).
 */

function play(b: CampaignBattle, army: ArmyChoice, seed: number, bad = false): BattleState {
  const session = new BattleSession(startBattle(buildScenario(b, army, seed)));
  const blue = new AiPlayer('blue', { posture: 'aggressive' });
  const red = new AiPlayer('red', { posture: b.posture, attackTurn: b.attackTurn });
  for (let i = 0; i < 60 && !session.state.result; i++) {
    const s = session.state;
    if (s.activeSide === 'red' || !bad) {
      playAiSideTurn(
        s.activeSide === 'red' ? red : blue,
        (c) => session.apply(c),
        () => session.state,
      );
      continue;
    }
    // Bad play: every free unit turns its back to the enemy (who comes from the east) and
    // nobody ever charges; then the turn ends.
    for (const u of s.units) {
      if (u.side !== 'blue' || !isOnMap(u) || isEngaged(s, u.id) || u.facing === 6) continue;
      session.apply({ type: 'Rotate', unitId: u.id, facing: 6 });
    }
    session.apply({ type: 'EndTurn' });
  }
  return session.state;
}

const seeds = Array.from({ length: 20 }, (_, i) => 101 + i * 37);
const wins = (b: CampaignBattle, army: ArmyChoice, bad = false) =>
  seeds.filter((s) => play(b, army, s, bad).result?.winner === 'blue').length / seeds.length;

describe('tutorial difficulty (GAME_DESIGN 7.4)', () => {
  it('Megiddo: the stand-in player wins every time', () => {
    const b = BATTLE_BY_ID.megiddo!;
    expect(wins(b, b.fixedArmy!)).toBeGreaterThanOrEqual(0.95);
  });

  it('Kadesh: sensible play wins about 95% of the time', () => {
    const b = BATTLE_BY_ID.kadesh!;
    expect(wins(b, b.testArmy)).toBeGreaterThanOrEqual(0.85);
  });

  it('Kadesh: playing badly can lose', () => {
    const b = BATTLE_BY_ID.kadesh!;
    expect(wins(b, b.testArmy, true)).toBeLessThan(0.7);
  });

  it('Kadesh: four player units against three Level 1 enemies, break the army', () => {
    const b = BATTLE_BY_ID.kadesh!;
    expect(b.maxUnits).toBe(4);
    expect(b.enemy).toHaveLength(3);
    expect(b.enemy.every((e) => (e.level ?? 1) === 1)).toBe(true);
    expect(b.holdOut).toBeUndefined();
    expect(b.testArmy.general?.id).toBe('bronzeAgeCaptain');
  });

  it('both tutorials are fought with the generic Bronze Age Captain', () => {
    expect(BATTLE_BY_ID.megiddo!.fixedArmy!.general?.id).toBe('bronzeAgeCaptain');
    expect(BATTLE_BY_ID.megiddo!.fixedArmy!.units).toHaveLength(3);
  });
});

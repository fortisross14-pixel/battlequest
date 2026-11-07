import { describe, expect, it } from 'vitest';
import { BATTLE_BY_ID } from '../../src/content/campaign/battles';
import { buildScenario } from '../../src/content/campaign/build';
import { startBattle, type GameEvent } from '../../src/core';
import { bonusStatus, objectiveText } from '../../src/meta/rewards';
import { battleSummary, describeEvents, meleeResults } from '../../src/ui/combatLog';
import { battle, E, run, unit, W } from '../core/helpers';

const names = { blue: 'Blue', red: 'Red' };

describe('combat log', () => {
  it('explains a failed cohesion test and the level it fell to', () => {
    const s = battle({
      units: [
        ['b', 'blue', 'spearmen', 3, 3, E],
        ['r', 'red', 'spearmen', 8, 3, W],
      ],
    });
    const events: GameEvent[] = [
      { type: 'CohesionTest', unitId: 'r', chance: 0.34, roll: 0.21, dropped: true },
      { type: 'CohesionChanged', unitId: 'r', from: 0, to: 1 },
      { type: 'CohesionTest', unitId: 'b', chance: 0.2, roll: 0.8, dropped: false },
      { type: 'UnitRouted', unitId: 'r', cause: 'cohesion' },
    ];
    const text = describeEvents(events, s, names).map((e) => e.text);
    expect(text).toEqual([
      'Red Spearmen tested cohesion: 34% chance to waver, rolled 21 → failed, now Disrupted.',
      'Blue Spearmen tested cohesion: 20% chance to waver, rolled 80 → held.',
      'Red Spearmen routed (its nerve broke)!',
    ]);
  });

  it('reports evade rolls with the chance and the roll', () => {
    const s = battle({
      units: [
        ['k', 'blue', 'heavyCavalry', 2, 3, E],
        ['sk', 'red', 'skirmishers', 5, 3, W],
      ],
    });
    const [e] = describeEvents(
      [{ type: 'EvadeRoll', unitId: 'sk', chance: 0.5, roll: 0.37, evaded: true }],
      s,
      names,
    );
    expect(e!.text).toBe('Red Skirmishers tried to evade: 50% chance, rolled 37 → slipped away.');
  });

  it('groups the melee phase into fights with both sides’ losses', () => {
    let s = battle({
      units: [
        ['b', 'blue', 'heavySwordsmen', 3, 3, E],
        ['r', 'red', 'spearmen', 5, 3, W],
        ['r2', 'red', 'spearmen', 11, 7, W],
      ],
    });
    s = run(s, { type: 'Charge', unitId: 'b', targetId: 'r' }).state;
    const { state, events } = run(s, { type: 'EndTurn' });
    const fights = meleeResults(events);
    expect(fights).toHaveLength(1);
    const f = fights[0]!;
    expect(f.lossA + f.lossB).toBeGreaterThan(0);
    const lines = describeEvents(events, state, names).filter((l) => l.kind === 'melee');
    expect(lines[0]!.text).toBe('Melee: 1 fight.');
    expect(lines[1]!.text).toMatch(/−\d+ vs .* −\d+\.$/);
  });

  it('the summary names the first rout as the turning point and counts losses', () => {
    const start = battle({
      units: [
        ['b', 'blue', 'spearmen', 3, 3, E],
        ['r', 'red', 'spearmen', 8, 3, W],
      ],
    });
    const end = structuredClone(start);
    unit(end, 'r').strength = 40;
    unit(end, 'r').cohesion = 3;
    const log = describeEvents(
      [{ type: 'UnitRouted', unitId: 'r', cause: 'strength' }],
      end,
      names,
    );
    const sum = battleSummary(start, end, log);
    expect(sum.turningPoint).toBe('Turn 1: Red Spearmen routed (too few men left)!');
    expect(sum.units.find((u) => u.id === 'r')).toMatchObject({ lost: 60, fate: 'routed' });
    expect(sum.units.find((u) => u.id === 'b')).toMatchObject({ lost: 0, fate: 'fighting' });
  });
});

describe('objective chip', () => {
  it('shows turns left and the live bonus state', () => {
    const b = BATTLE_BY_ID.megiddo!; // bonus: win by turn 6
    const s = structuredClone(startBattle(buildScenario(b, b.fixedArmy!, 1)));
    expect(objectiveText(b, s)).toBe('Break the enemy · 10 turns left');
    expect(bonusStatus(b, s)).toBe('pending');
    s.turn = 7;
    expect(objectiveText(b, s)).toBe('Break the enemy · 4 turns left');
    expect(bonusStatus(b, s)).toBe('failed');

    const k = BATTLE_BY_ID.kadesh!; // break the army; bonus: lose no unit
    const ks = structuredClone(startBattle(buildScenario(k, k.testArmy, 1)));
    expect(objectiveText(k, ks)).toBe('Break the enemy · 12 turns left');
    expect(objectiveText({ ...k, holdOut: 'player' }, ks)).toBe('Hold out · 12 turns left');
    expect(bonusStatus(k, ks)).toBe('met');
    unit(ks, 'p0').cohesion = 3; // a routed unit counts as lost
    expect(bonusStatus(k, ks)).toBe('failed');
  });
});

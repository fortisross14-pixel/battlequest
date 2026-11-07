import { limitProblems } from '../../src/meta/army';
import { describe, expect, it } from 'vitest';
import { AiPlayer, playAiSideTurn } from '../../src/ai/utility';
import { AGES, BATTLE_BY_ID, CAMPAIGN } from '../../src/content/campaign/battles';
import { buildScenario, deploymentSquares } from '../../src/content/campaign/build';
import { ERA_UNIT_BY_ID } from '../../src/content/eraUnits';
import { GENERAL_BY_ID, generalPackAge } from '../../src/content/generals';
import {
  BattleSession,
  DIRS,
  isPassable,
  mapFromRows,
  startBattle,
  step,
  type Pos,
} from '../../src/core';
import type { CampaignBattle } from '../../src/content/campaign/types';

function reachable(b: CampaignBattle, from: Pos, to: Pos): boolean {
  const map = mapFromRows(b.terrain, b.elevation);
  const seen = new Set([`${from.x},${from.y}`]);
  const queue = [from];
  while (queue.length) {
    const p = queue.shift()!;
    if (p.x === to.x && p.y === to.y) return true;
    for (const d of DIRS) {
      const n = step(p, d);
      const k = `${n.x},${n.y}`;
      if (!seen.has(k) && isPassable(map, n)) {
        seen.add(k);
        queue.push(n);
      }
    }
  }
  return false;
}

function playAi(b: CampaignBattle, seed: number) {
  const session = new BattleSession(startBattle(buildScenario(b, b.testArmy, seed)));
  const ais = {
    blue: new AiPlayer('blue', { posture: 'aggressive' }),
    red: new AiPlayer('red', { posture: b.posture, attackTurn: b.attackTurn }),
  };
  for (let i = 0; i < 80 && !session.state.result; i++) {
    playAiSideTurn(
      ais[session.state.activeSide],
      (c) => session.apply(c),
      () => session.state,
    );
  }
  return session.state;
}

describe('campaign', () => {
  it('playable ages list real battles and starter troops; the rest list planned battles', () => {
    expect(AGES).toHaveLength(10);
    for (const a of AGES) {
      for (const u of a.starterUnits) expect(ERA_UNIT_BY_ID[u], u).toBeDefined();
      if (a.status === 'playable') {
        expect(a.battles.length).toBeGreaterThanOrEqual(2);
        for (const id of a.battles) expect(BATTLE_BY_ID[id], id).toBeDefined();
      } else {
        expect(a.planned!.length).toBeGreaterThanOrEqual(10);
        for (const b of a.planned!) {
          expect(Math.abs(b.lat)).toBeLessThanOrEqual(90);
          expect(Math.abs(b.lon)).toBeLessThanOrEqual(180);
        }
      }
    }
  });

  it('every battle sits inside its age map, in its age list', () => {
    for (const b of CAMPAIGN) {
      const age = AGES.find((a) => a.id === b.age)!;
      expect(age.battles, b.id).toContain(b.id);
      expect(b.lat).toBeGreaterThan(age.region.south);
      expect(b.lat).toBeLessThan(age.region.north);
      expect(b.lon).toBeGreaterThan(age.region.west);
      expect(b.lon).toBeLessThan(age.region.east);
    }
  });

  it('battle sizes grow through the campaign', () => {
    const sizes = CAMPAIGN.map((b) => b.maxUnits);
    expect(sizes[0]).toBeLessThanOrEqual(3);
    for (let i = 1; i < sizes.length; i++) expect(sizes[i]).toBeGreaterThanOrEqual(sizes[i - 1]!);
  });
});

describe.each(CAMPAIGN)('battle $id', (b) => {
  it('has a well-formed map and valid content references', () => {
    const w = b.terrain[0]!.length;
    for (const rows of [b.terrain, b.deployment, b.elevation ?? b.terrain]) {
      expect(rows).toHaveLength(b.terrain.length);
      for (const r of rows) expect(r).toHaveLength(w);
    }
    for (const e of b.enemy) expect(ERA_UNIT_BY_ID[e.type], e.type).toBeDefined();
    if (b.enemyGeneral) {
      expect(GENERAL_BY_ID[b.enemyGeneral.id]).toBeDefined();
      expect(b.enemy.filter((e) => e.general)).toHaveLength(1);
    }
    expect(b.briefing.split('. ').length).toBeGreaterThanOrEqual(3);
  });

  it('all deployment squares are passable and there are enough of them', () => {
    const map = mapFromRows(b.terrain, b.elevation);
    const squares = deploymentSquares(b);
    expect(squares.length).toBeGreaterThanOrEqual(b.maxUnits);
    for (const p of squares) expect(isPassable(map, p), `${p.x},${p.y}`).toBe(true);
    for (const e of b.enemy) expect(isPassable(map, e), `${e.x},${e.y}`).toBe(true);
  });

  it('both sides can reach each other', () => {
    const start = deploymentSquares(b)[0]!;
    for (const e of b.enemy) expect(reachable(b, start, e)).toBe(true);
  });

  it('the test and fixed armies fill exactly the unit slots', () => {
    for (const army of [b.testArmy, b.fixedArmy].filter(Boolean)) {
      expect(army!.units).toHaveLength(b.maxUnits);
    }
  });

  it('a scripted run reaches a result inside the turn limit', () => {
    const s = playAi(b, 1);
    expect(s.result).not.toBeNull();
    expect(s.result!.turn).toBeLessThanOrEqual(b.turnLimit);
  });
});

describe('test armies', () => {
  it.each(CAMPAIGN)(
    '$id: uses cards a player could collect by then, within the army limits',
    (b) => {
      for (const u of b.testArmy.units) {
        const def = ERA_UNIT_BY_ID[u.type];
        expect(def, u.type).toBeDefined();
        expect(def!.enemyOnly, u.type).toBeUndefined();
        expect(def!.age, u.type).toBeLessThanOrEqual(b.age);
      }
      expect(limitProblems(b.testArmy.units.map((u) => u.type))).toEqual([]);
      const g = b.testArmy.general && GENERAL_BY_ID[b.testArmy.general.id];
      if (g) {
        expect(g.playable).toBe(true);
        expect(generalPackAge(g)).toBeLessThanOrEqual(Math.max(b.age, 0));
      }
    },
  );
});

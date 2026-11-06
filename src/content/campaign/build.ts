import { mapFromRows } from '../../core/map';
import type { Scenario, ScenarioUnit } from '../../core/state';
import type { Pos } from '../../core/types';
import { eraUnitType } from '../eraUnits';
import { GENERAL_BY_ID } from '../generals';
import type { ArmyChoice, CampaignBattle } from './types';

export const PLAYER_SIDE = 'blue' as const;
export const ENEMY_SIDE = 'red' as const;

/** Deployment squares, best first: frontmost column, then outwards from the centre row. */
export function deploymentSquares(b: CampaignBattle): Pos[] {
  const out: Pos[] = [];
  b.deployment.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) if (row[x] === 'D') out.push({ x, y });
  });
  const mid = (b.deployment.length - 1) / 2;
  return out.sort((a, c) => c.x - a.x || Math.abs(a.y - mid) - Math.abs(c.y - mid) || a.y - c.y);
}

export function armyCost(army: ArmyChoice): number {
  return army.units.reduce((s, u) => s + eraUnitType(u.type, u.level).stats.cost, 0);
}

/** Builds the scenario. Player units get ids p0, p1…; enemy units e0, e1…. */
export function buildScenario(b: CampaignBattle, army: ArmyChoice, seed: number): Scenario {
  const squares = deploymentSquares(b);
  if (army.units.length > squares.length) throw new Error(`${b.id}: not enough deployment squares`);
  const units: ScenarioUnit[] = army.units.map((u, i) => ({
    id: `p${i}`,
    side: PLAYER_SIDE,
    type: eraUnitType(u.type, u.level),
    x: squares[i]!.x,
    y: squares[i]!.y,
    facing: 2,
  }));
  b.enemy.forEach((e, i) =>
    units.push({
      id: `e${i}`,
      side: ENEMY_SIDE,
      type: eraUnitType(e.type, e.level),
      x: e.x,
      y: e.y,
      facing: e.facing,
    }),
  );
  const enemyGenIdx = b.enemy.findIndex((e) => e.general);
  const enemyGen = b.enemyGeneral && GENERAL_BY_ID[b.enemyGeneral.id];
  const playerGen = army.general && GENERAL_BY_ID[army.general.id];
  return {
    id: b.id,
    name: b.name,
    map: mapFromRows(b.terrain, b.elevation),
    sides: {
      blue: {
        name: 'You',
        edge: 'west',
        general: playerGen
          ? { def: playerGen, rank: army.general!.rank, unitId: `p${army.general!.unitIndex}` }
          : undefined,
      },
      red: {
        name: 'Enemy',
        edge: 'east',
        general:
          enemyGen && enemyGenIdx >= 0
            ? { def: enemyGen, rank: b.enemyGeneral!.rank, unitId: `e${enemyGenIdx}` }
            : undefined,
      },
    },
    units,
    turnLimit: b.turnLimit,
    turnLimitWinner: b.holdOut === 'player' ? PLAYER_SIDE : undefined,
    firstSide: PLAYER_SIDE,
    seed,
  };
}

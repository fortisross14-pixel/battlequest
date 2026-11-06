import { mapFromRows, isPassable, inBounds } from '../../core/map';
import type { Scenario, ScenarioUnit } from '../../core/state';
import type { Pos } from '../../core/types';
import { eraUnitType } from '../eraUnits';
import { GENERAL_BY_ID } from '../generals';
import { unitType } from '../units';
import type { ArmyChoice, CampaignBattle } from './types';

export const PLAYER_SIDE = 'blue' as const;
export const ENEMY_SIDE = 'red' as const;

/** Ids of the generals' own units on the map. */
export const PLAYER_GENERAL_ID = 'pg';
export const ENEMY_GENERAL_ID = 'eg';

/** Deployment squares, best first: frontmost column, then outwards from the centre row. */
export function deploymentSquares(b: CampaignBattle): Pos[] {
  const out: Pos[] = [];
  b.deployment.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) if (row[x] === 'D') out.push({ x, y });
  });
  const mid = (b.deployment.length - 1) / 2;
  return out.sort((a, c) => c.x - a.x || Math.abs(a.y - mid) - Math.abs(c.y - mid) || a.y - c.y);
}

/**
 * Where the player's army starts: units on the front squares, and the general (if any)
 * on the rearmost free square nearest the centre, behind the line.
 */
export function defaultPlacement(b: CampaignBattle, army: ArmyChoice): Pos[] {
  const squares = deploymentSquares(b);
  const need = army.units.length + (army.general ? 1 : 0);
  if (need > squares.length) throw new Error(`${b.id}: not enough deployment squares`);
  const out = squares.slice(0, army.units.length);
  if (army.general) {
    const mid = (b.deployment.length - 1) / 2;
    const rest = squares
      .slice(army.units.length)
      .sort((a, c) => a.x - c.x || Math.abs(a.y - mid) - Math.abs(c.y - mid));
    out.push(rest[0]!);
  }
  return out;
}

/** A free, passable square for the enemy general: behind the unit it is attached to. */
function enemyGeneralSquare(b: CampaignBattle, taken: Pos[]): Pos | null {
  const at = b.enemy.find((e) => e.general);
  if (!at) return null;
  const map = mapFromRows(b.terrain, b.elevation);
  const free = (p: Pos) =>
    inBounds(map, p) && isPassable(map, p) && !taken.some((t) => t.x === p.x && t.y === p.y);
  // Straight behind first (the enemy flees east), then spiralling outwards.
  for (let r = 1; r <= 4; r++) {
    for (const p of [
      { x: at.x + r, y: at.y },
      { x: at.x + r, y: at.y - 1 },
      { x: at.x + r, y: at.y + 1 },
      { x: at.x, y: at.y - r },
      { x: at.x, y: at.y + r },
    ]) {
      if (free(p)) return p;
    }
  }
  return null;
}

/**
 * Builds the scenario. Player units get ids p0, p1…, enemy units e0, e1…, and the
 * generals' own units pg and eg. `placement` (from the deployment screen) overrides the
 * default squares: one per unit, then the general.
 */
export function buildScenario(
  b: CampaignBattle,
  army: ArmyChoice,
  seed: number,
  placement?: Pos[],
): Scenario {
  const where = defaultPlacement(b, army).map((p, i) => placement?.[i] ?? p);
  const units: ScenarioUnit[] = army.units.map((u, i) => ({
    id: `p${i}`,
    side: PLAYER_SIDE,
    type: eraUnitType(u.type, u.level),
    x: where[i]!.x,
    y: where[i]!.y,
    facing: 2,
  }));
  const playerGen = army.general && GENERAL_BY_ID[army.general.id];
  if (playerGen) {
    const p = where[army.units.length]!;
    units.push({
      id: PLAYER_GENERAL_ID,
      side: PLAYER_SIDE,
      type: unitType('generalGuard'),
      x: p.x,
      y: p.y,
      facing: 2,
    });
  }
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
  const enemyGen = b.enemyGeneral && GENERAL_BY_ID[b.enemyGeneral.id];
  const enemySquare = enemyGen ? enemyGeneralSquare(b, units) : null;
  if (enemyGen && enemySquare) {
    units.push({
      id: ENEMY_GENERAL_ID,
      side: ENEMY_SIDE,
      type: unitType('generalGuard'),
      x: enemySquare.x,
      y: enemySquare.y,
      facing: 6,
    });
  }
  return {
    id: b.id,
    name: b.name,
    map: mapFromRows(b.terrain, b.elevation),
    sides: {
      blue: {
        name: 'You',
        edge: 'west',
        breakpoint: b.playerBreakpoint,
        general: playerGen
          ? { def: playerGen, rank: army.general!.rank, unitId: PLAYER_GENERAL_ID }
          : undefined,
      },
      red: {
        name: 'Enemy',
        edge: 'east',
        breakpoint: b.enemyBreakpoint,
        general:
          enemyGen && enemySquare
            ? { def: enemyGen, rank: b.enemyGeneral!.rank, unitId: ENEMY_GENERAL_ID }
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

/** Kept for older callers: the points value of an army (balance tooling). */
export function armyCost(army: ArmyChoice): number {
  return army.units.reduce((s, u) => s + eraUnitType(u.type, u.level).stats.cost, 0);
}

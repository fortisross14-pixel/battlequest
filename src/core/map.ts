import { RULES, type TerrainRules } from './config';
import { isDiagonal, step, toDir } from './geometry';
import type { BattleMap, Cell, Dir, MapEdge, Pos, TerrainType } from './types';

export const TERRAIN_CHARS: Record<string, TerrainType> = {
  '.': 'open',
  ',': 'rough',
  F: 'forest',
  '~': 'river',
  '=': 'ford',
  B: 'bridge',
};

/**
 * Builds a map from ASCII rows (see TERRAIN_CHARS) and optional elevation rows of digits.
 * All rows must have the same length.
 */
export function mapFromRows(terrainRows: string[], elevationRows?: string[]): BattleMap {
  const height = terrainRows.length;
  const width = terrainRows[0]?.length ?? 0;
  const cells: Cell[] = [];
  for (let y = 0; y < height; y++) {
    const row = terrainRows[y]!;
    if (row.length !== width)
      throw new Error(`Map row ${y} has length ${row.length}, expected ${width}`);
    for (let x = 0; x < width; x++) {
      const terrain = TERRAIN_CHARS[row[x]!];
      if (!terrain) throw new Error(`Unknown terrain '${row[x]}' at ${x},${y}`);
      const elevation = Number(elevationRows?.[y]?.[x] ?? '0');
      cells.push({ terrain, elevation });
    }
  }
  return { width, height, cells };
}

export function inBounds(map: BattleMap, p: Pos): boolean {
  return p.x >= 0 && p.y >= 0 && p.x < map.width && p.y < map.height;
}

export function cellAt(map: BattleMap, p: Pos): Cell | undefined {
  return inBounds(map, p) ? map.cells[p.y * map.width + p.x] : undefined;
}

export function terrainRules(map: BattleMap, p: Pos): TerrainRules {
  const cell = cellAt(map, p);
  return RULES.terrain[cell?.terrain ?? 'open'];
}

export function elevationAt(map: BattleMap, p: Pos): number {
  return cellAt(map, p)?.elevation ?? 0;
}

export function isPassable(map: BattleMap, p: Pos): boolean {
  const cell = cellAt(map, p);
  return !!cell && Number.isFinite(RULES.terrain[cell.terrain].moveCost);
}

/**
 * A narrow square (bridge) only connects along its axis. The axis runs across the river:
 * if the squares north and south of it are impassable, the bridge runs east-west.
 */
export function narrowAxis(map: BattleMap, p: Pos): Dir[] | null {
  if (!terrainRules(map, p).narrow) return null;
  const blockedNS = !isPassable(map, step(p, 0)) && !isPassable(map, step(p, 4));
  return blockedNS ? [2, 6] : [0, 4];
}

/** True if a step (or a fight) in direction `d` between `from` and its neighbour respects bridges. */
export function connects(map: BattleMap, from: Pos, d: Dir): boolean {
  const to = step(from, d);
  const a = narrowAxis(map, from);
  if (a && !a.includes(d)) return false;
  const b = narrowAxis(map, to);
  if (b && !b.includes(d)) return false;
  return true;
}

/** Diagonal steps may not cut a corner between two impassable squares (e.g. a river bend). */
export function cutsCorner(map: BattleMap, from: Pos, d: Dir): boolean {
  if (!isDiagonal(d)) return false;
  const left = step(from, toDir(d - 1));
  const right = step(from, toDir(d + 1));
  return !isPassable(map, left) && !isPassable(map, right);
}

/** How many squares a unit at `p` still is from its side's map edge. */
export function distanceToEdge(map: BattleMap, p: Pos, edge: MapEdge): number {
  switch (edge) {
    case 'west':
      return p.x;
    case 'east':
      return map.width - 1 - p.x;
    case 'north':
      return p.y;
    case 'south':
      return map.height - 1 - p.y;
  }
}

/** Facing that points at a map edge. */
export function edgeDir(edge: MapEdge): Dir {
  return ({ north: 0, east: 2, south: 4, west: 6 } as const)[edge];
}

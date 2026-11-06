import { Container, Graphics } from 'pixi.js';
import { cellAt, narrowAxis } from '../core/map';
import type { BattleMap, Pos } from '../core/types';
import { dashed, hash01 } from './draw';
import { CELL, THEME } from './theme';

const centre = (x: number, y: number): Pos => ({ x: (x + 0.5) * CELL, y: (y + 0.5) * CELL });

function isWater(map: BattleMap, x: number, y: number): boolean {
  const t = cellAt(map, { x, y })?.terrain;
  return t === 'river' || t === 'ford' || t === 'bridge';
}

/** Flat, soft terrain shapes in the style of a printed battle diagram. Drawn once. */
export function buildTerrainLayer(map: BattleMap): Container {
  const layer = new Container();
  const W = map.width * CELL;
  const H = map.height * CELL;

  const paper = new Graphics();
  paper.rect(0, 0, W, H).fill(THEME.mapPaper);
  layer.addChild(paper);

  // Hills: tinted plateaus with blocky contour lines at each elevation step.
  const hills = new Graphics();
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const e = cellAt(map, { x, y })!.elevation;
      if (e > 0)
        hills.rect(x * CELL, y * CELL, CELL, CELL).fill({ color: THEME.hillFill, alpha: 0.35 * e });
    }
  }
  const contours = new Graphics();
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const e = cellAt(map, { x, y })!.elevation;
      if (e === 0) continue;
      const edge = (nx: number, ny: number) => (cellAt(map, { x: nx, y: ny })?.elevation ?? 0) < e;
      const x0 = x * CELL;
      const y0 = y * CELL;
      if (edge(x, y - 1)) contours.moveTo(x0, y0).lineTo(x0 + CELL, y0);
      if (edge(x, y + 1)) contours.moveTo(x0, y0 + CELL).lineTo(x0 + CELL, y0 + CELL);
      if (edge(x - 1, y)) contours.moveTo(x0, y0).lineTo(x0, y0 + CELL);
      if (edge(x + 1, y)) contours.moveTo(x0 + CELL, y0).lineTo(x0 + CELL, y0 + CELL);
    }
  }
  contours.stroke({ width: 2, color: THEME.contour, alpha: 0.8 });
  layer.addChild(hills, contours);

  // Rough ground: scattered tufts.
  const rough = new Graphics();
  // Forest: overlapping soft blobs with a few darker tree dots.
  const forest = new Graphics();
  const trees = new Graphics();
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const t = cellAt(map, { x, y })!.terrain;
      if (t === 'rough') {
        for (let i = 0; i < 6; i++) {
          const px = x * CELL + 8 + hash01(x, y, i, 1) * (CELL - 16);
          const py = y * CELL + 8 + hash01(x, y, i, 2) * (CELL - 16);
          rough
            .moveTo(px - 4, py + 2)
            .lineTo(px, py - 3)
            .lineTo(px + 4, py + 2);
        }
      } else if (t === 'forest') {
        const c = centre(x, y);
        forest.circle(c.x, c.y, CELL * 0.58).fill({ color: THEME.forest, alpha: 0.9 });
        for (let i = 0; i < 4; i++) {
          const px = x * CELL + 12 + hash01(x, y, i, 3) * (CELL - 24);
          const py = y * CELL + 12 + hash01(x, y, i, 4) * (CELL - 24);
          trees
            .circle(px, py, 5 + hash01(x, y, i, 5) * 3)
            .fill({ color: THEME.forestDark, alpha: 0.55 });
        }
      }
    }
  }
  rough.stroke({ width: 1.5, color: THEME.rough, alpha: 0.85 });
  layer.addChild(rough, forest, trees);

  // Rivers: a thick band through the centres of connected water squares.
  const river = new Graphics();
  const banks = new Graphics();
  const crossings = new Graphics();
  const drawSegments = (g: Graphics) => {
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (!isWater(map, x, y)) continue;
        const a = centre(x, y);
        let linked = false;
        for (const [dx, dy] of [
          [1, 0],
          [0, 1],
          [1, 1],
          [-1, 1],
        ] as const) {
          if (!isWater(map, x + dx, y + dy)) continue;
          // Skip a diagonal link if the river already turns through an orthogonal neighbour.
          if (dx !== 0 && dy !== 0 && (isWater(map, x + dx, y) || isWater(map, x, y + dy)))
            continue;
          const b = centre(x + dx, y + dy);
          g.moveTo(a.x, a.y).lineTo(b.x, b.y);
          linked = true;
        }
        // Run off the map edge.
        if (y === 0) g.moveTo(a.x, a.y).lineTo(a.x, 0);
        if (y === map.height - 1) g.moveTo(a.x, a.y).lineTo(a.x, map.height * CELL);
        if (x === 0) g.moveTo(a.x, a.y).lineTo(0, a.y);
        if (x === map.width - 1) g.moveTo(a.x, a.y).lineTo(map.width * CELL, a.y);
        if (!linked) g.circle(a.x, a.y, 1);
      }
    }
  };
  drawSegments(banks);
  banks.stroke({
    width: CELL * 0.62,
    color: THEME.waterDark,
    alpha: 0.35,
    cap: 'round',
    join: 'round',
  });
  drawSegments(river);
  river.stroke({ width: CELL * 0.52, color: THEME.water, alpha: 1, cap: 'round', join: 'round' });

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const t = cellAt(map, { x, y })!.terrain;
      const c = centre(x, y);
      if (t === 'ford') {
        // Stepping stones across the stream.
        for (let i = -2; i <= 2; i++) {
          crossings
            .ellipse(c.x + i * 11, c.y + (i % 2) * 5, 6, 4)
            .fill({ color: THEME.fordStone, alpha: 0.95 });
        }
        dashed(crossings, { x: c.x - CELL / 2, y: c.y }, { x: c.x + CELL / 2, y: c.y }, 5, 5);
        crossings.stroke({ width: 1.5, color: THEME.ink, alpha: 0.35 });
      } else if (t === 'bridge') {
        const axis = narrowAxis(map, { x, y });
        const horizontal = !axis || axis.includes(2);
        const w = horizontal ? CELL * 1.05 : CELL * 0.5;
        const h = horizontal ? CELL * 0.5 : CELL * 1.05;
        crossings
          .rect(c.x - w / 2, c.y - h / 2, w, h)
          .fill(THEME.bridge)
          .stroke({ width: 2, color: THEME.ink, alpha: 0.6 });
        for (let i = -2; i <= 2; i++) {
          if (horizontal)
            crossings.moveTo(c.x + i * 11, c.y - h / 2).lineTo(c.x + i * 11, c.y + h / 2);
          else crossings.moveTo(c.x - w / 2, c.y + i * 11).lineTo(c.x + w / 2, c.y + i * 11);
        }
        crossings.stroke({ width: 1, color: THEME.ink, alpha: 0.35 });
      }
    }
  }
  layer.addChild(banks, river, crossings);

  // A thin map frame.
  const frame = new Graphics();
  frame.rect(0, 0, W, H).stroke({ width: 3, color: THEME.ink, alpha: 0.55 });
  layer.addChild(frame);
  return layer;
}

/** The square grid: subtle, stronger while a unit is selected. */
export function buildGrid(map: BattleMap): Graphics {
  const g = new Graphics();
  for (let x = 1; x < map.width; x++) g.moveTo(x * CELL, 0).lineTo(x * CELL, map.height * CELL);
  for (let y = 1; y < map.height; y++) g.moveTo(0, y * CELL).lineTo(map.width * CELL, y * CELL);
  g.stroke({ width: 1, color: THEME.grid, alpha: 1 });
  g.alpha = THEME.gridAlpha;
  return g;
}

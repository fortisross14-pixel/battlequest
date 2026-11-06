import { Texture } from 'pixi.js';
import type { Side, UnitSymbol } from '../core/types';
import { badgeMarkup, PICTOGRAMS } from './pictograms';

/**
 * Board badges are the same SVG as the screen icons, rasterised into textures on demand
 * (troop type × side × level × normal/routed) and cached. Level-1 badges are preloaded.
 */
const RASTER_W = 192; // pixels: sharp up to 2.5× zoom on a 2× screen
const RASTER_H = Math.round((RASTER_W * 44) / 40);

const ready = new Map<string, Texture>();
const pending = new Map<string, Promise<Texture>>();

const key = (symbol: UnitSymbol, side: Side, level: number, muted: boolean) =>
  `${symbol}|${side}|${level}|${muted ? 1 : 0}`;

function rasterise(symbol: UnitSymbol, side: Side, level: number, muted: boolean) {
  const k = key(symbol, side, level, muted);
  const known = pending.get(k);
  if (known) return known;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${RASTER_W}" height="${RASTER_H}" viewBox="0 0 40 44">${badgeMarkup(symbol, side, level, muted)}</svg>`;
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  const p = img.decode().then(() => {
    const t = Texture.from(img);
    ready.set(k, t);
    return t;
  });
  pending.set(k, p);
  return p;
}

/** Preloads the level-1 badges. Call once before the first battle is drawn. */
export async function loadBadgeTextures(): Promise<void> {
  const jobs: Promise<Texture>[] = [];
  for (const symbol of Object.keys(PICTOGRAMS) as UnitSymbol[]) {
    for (const side of ['blue', 'red'] as const) {
      for (const muted of [false, true]) jobs.push(rasterise(symbol, side, 1, muted));
    }
  }
  await Promise.allSettled(jobs);
}

/**
 * The badge texture if it is ready; otherwise starts loading it and calls `onReady` with
 * it later, returning an empty texture for now.
 */
export function badgeTexture(
  symbol: UnitSymbol,
  side: Side,
  level: number,
  muted: boolean,
  onReady: (t: Texture) => void,
): Texture {
  const lv = Math.max(1, Math.min(5, Math.round(level)));
  const t = ready.get(key(symbol, side, lv, muted));
  if (t) return t;
  rasterise(symbol, side, lv, muted).then(onReady, () => undefined);
  return Texture.EMPTY;
}

/** Badge aspect ratio (height / width). */
export const BADGE_ASPECT = 44 / 40;

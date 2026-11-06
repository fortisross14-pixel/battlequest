import type { Side, UnitSymbol } from '../core/types';
import { badgeSvg } from '../render/pictograms';

/**
 * The troop badge as inline SVG (the same badge as on the board). `size` is the space the
 * old block icon used; the badge is a little narrower and taller.
 */
export function unitIcon(symbol: UnitSymbol, side: Side = 'blue', size = 40, level = 1): string {
  return badgeSvg(symbol, side, Math.round(size * 0.8), level);
}

export function stars(n: number, max = 3): string {
  return '★'.repeat(n) + '☆'.repeat(Math.max(0, max - n));
}

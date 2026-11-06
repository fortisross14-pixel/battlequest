import type { Side, UnitSymbol } from '../core/types';

const SYMBOL_PATHS: Record<UnitSymbol, string> = {
  infantry: '<path d="M7 5 L33 21 M7 21 L33 5"/>',
  gun: '<path d="M7 5 L33 21 M7 21 L33 5"/><circle cx="20" cy="13" r="3" fill="currentColor" stroke="none"/>',
  skirmisher:
    '<circle cx="12" cy="13" r="2.6" fill="currentColor" stroke="none"/><circle cx="20" cy="13" r="2.6" fill="currentColor" stroke="none"/><circle cx="28" cy="13" r="2.6" fill="currentColor" stroke="none"/>',
  archer: '<path d="M7 18 Q20 0 33 18"/>',
  crossbow: '<path d="M7 16 Q20 1 33 16 M20 21 L20 5"/>',
  spear:
    '<path d="M20 22 L20 6"/><path d="M20 3 L16 9 L24 9 Z" fill="currentColor" stroke="none"/>',
  pike: '<path d="M15 22 L15 6 M25 22 L25 6"/><path d="M15 3 L12 9 L18 9 Z M25 3 L22 9 L28 9 Z" fill="currentColor" stroke="none"/>',
  cavalry: '<path d="M7 21 L33 5"/>',
  lightCavalry:
    '<path d="M7 21 L33 5" stroke-width="1.6"/><circle cx="10" cy="8" r="2.4" fill="currentColor" stroke="none"/>',
  chariot: '<path d="M7 21 L33 5"/><circle cx="20" cy="13" r="5"/>',
  elephant: '<path d="M7 21 L7 12 Q20 -2 33 12 L33 21"/>',
  artillery: '<circle cx="20" cy="13" r="6" fill="currentColor" stroke="none"/>',
};

/** A small battle-map block with the unit's NATO-style symbol, as inline SVG. */
export function unitIcon(symbol: UnitSymbol, side: Side = 'blue', size = 40): string {
  const fill = side === 'blue' ? '#2f5d9e' : '#b23a3a';
  const dark = side === 'blue' ? '#1c3a66' : '#6e1f1f';
  return `<svg class="unit-icon" width="${size}" height="${(size * 26) / 40}" viewBox="0 0 40 26" aria-hidden="true">
<rect x="1" y="1" width="38" height="24" fill="${fill}" stroke="${dark}" stroke-width="1.5"/>
<path d="M0 1.5 L40 1.5" stroke="${dark}" stroke-width="4"/>
<g fill="none" stroke="#f7f1e3" stroke-width="2.2" stroke-linecap="round" color="#f7f1e3">${SYMBOL_PATHS[symbol]}</g>
</svg>`;
}

export function stars(n: number, max = 3): string {
  return '★'.repeat(n) + '☆'.repeat(Math.max(0, max - n));
}

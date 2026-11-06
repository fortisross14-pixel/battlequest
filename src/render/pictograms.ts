import type { UnitSymbol } from '../core/types';

/**
 * Troop pictograms (GAME_DESIGN 10): one flat, single-colour silhouette per troop type,
 * drawn in a 32×32 box with `currentColor`, at the same line weight and visual size.
 * Shared by the board, the army builder, the Army screen, the shop and the unit card.
 */
const S = 'stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"';
const F = 'fill="currentColor"';
const W = 2.6; // main line weight

export const PICTOGRAMS: Record<UnitSymbol, string> = {
  // Spear and round shield.
  spear: `<path ${S} stroke-width="${W}" d="M21 30 L21 10"/>
<path ${F} d="M21 1.5 L24.6 8.5 L21 12 L17.4 8.5 Z"/>
<path ${F} fill-rule="evenodd" d="M12 11 a8 8 0 1 0 0.01 0 Z M12 13.4 a5.6 5.6 0 1 1 -0.01 0 Z M12 16.6 a2.4 2.4 0 1 0 0.01 0 Z"/>`,

  // Three long pikes.
  pike: `<path ${S} stroke-width="${W}" d="M9 30 L9 9 M16 30 L16 7 M23 30 L23 9"/>
<path ${F} d="M9 2 L11.4 6.5 L9 10 L6.6 6.5 Z M16 0.5 L18.4 5 L16 8.5 L13.6 5 Z M23 2 L25.4 6.5 L23 10 L20.6 6.5 Z"/>`,

  // Sword and tall shield.
  infantry: `<path ${F} fill-rule="evenodd" d="M4 9 Q11 6 18 9 L18 26 Q11 30 4 26 Z M11 15.2 a2.4 2.4 0 1 0 0.01 0 Z"/>
<path ${F} d="M25 2 L27.2 6 L27.2 20 L22.8 20 L22.8 6 Z"/>
<path ${S} stroke-width="${W}" d="M20.5 21.3 L29.5 21.3 M25 22 L25 27"/>
<circle ${F} cx="25" cy="29" r="1.8"/>`,

  // Bow with a nocked arrow.
  archer: `<path ${S} stroke-width="${W}" d="M10 3 Q26 16 10 29"/>
<path ${S} stroke-width="1.3" d="M10 3 L10 29"/>
<path ${S} stroke-width="2" d="M5 16 L25 16 M5 16 L3 13.5 M5 16 L3 18.5 M8 16 L6 13.5 M8 16 L6 18.5"/>
<path ${F} d="M30 16 L24 12.2 L24 19.8 Z"/>`,

  // Crossbow: prod across a stock, bolt pointing up.
  crossbow: `<path ${S} stroke-width="${W}" d="M4 14 Q16 5 28 14"/>
<path ${S} stroke-width="1.3" d="M4 14 L16 19 L28 14"/>
<path ${F} d="M14 8 L18 8 L18.6 26 L20 30 L12 30 L13.4 26 Z"/>
<path ${F} d="M16 0.5 L19.5 6.5 L12.5 6.5 Z"/>`,

  // Javelins and a sling stone.
  skirmisher: `<path ${S} stroke-width="2.3" d="M5 26 L22 9 M10 29 L27 12"/>
<path ${F} d="M25.5 5.5 L23.9 11.6 L19.4 7.1 Z M30.5 8.5 L28.9 14.6 L24.4 10.1 Z"/>
<circle ${F} cx="7" cy="12" r="3"/>`,

  // Horse head with a lance and pennon behind it.
  cavalry: `<path ${S} stroke-width="${W}" d="M5.5 31 L5.5 4"/>
<path ${F} d="M5.5 1.5 L14 5 L5.5 8.5 Z"/>
<path ${F} fill-rule="evenodd" d="M10 31 C10 22 12 14 16 10 L16.5 4.5 L19.6 8.4 C23.2 8.8 26.6 12.6 29.2 18 C30.2 20.4 28.8 22.4 26.4 22.2 C24 22 22.4 20.4 21 19.6 C19.4 22.6 19 26.6 19.6 31 Z M21 13 a1.4 1.4 0 1 0 0.01 0 Z"/>`,

  // Lean horse head with a flowing mane.
  lightCavalry: `<path ${F} fill-rule="evenodd" d="M9 31 C9 22 11 14 15 10 L15.5 4.5 L18.6 8.4 C22.4 8.8 26 12.6 28.6 18 C29.6 20.4 28.2 22.4 25.8 22.2 C23.4 22 21.8 20.4 20.4 19.6 C18.8 22.6 18.4 26.6 19 31 Z M20.4 13 a1.4 1.4 0 1 0 0.01 0 Z"/>
<path ${S} stroke-width="2" d="M13.6 11 C10 12 7 11 4 9 M12 16 C9 17.4 6 17 3 15.6 M11 21.6 C8.4 23 6 23 3.4 22"/>`,

  // Chariot: spoked wheel, car and pole.
  chariot: `<circle ${S} stroke-width="${W}" cx="12" cy="20" r="8.5"/>
<path ${S} stroke-width="1.8" d="M12 11.5 L12 28.5 M4.6 15.75 L19.4 24.25 M4.6 24.25 L19.4 15.75"/>
<circle ${F} cx="12" cy="20" r="2.4"/>
<path ${F} d="M3 7 L21 7 L22.5 12 L5 12 Z"/>
<path ${S} stroke-width="${W}" d="M20 18 L30.5 13"/>`,

  // Elephant facing right: trunk, tusk, ear.
  elephant: `<path ${F} fill-rule="evenodd" d="M3 21 C3 12 8.5 7.5 16 7.5 C20 7.5 23.5 8.6 25.6 11 C28.6 13.6 29.4 17.4 28.4 21 C27.8 24 28 26.6 30.6 27.6 L30.4 30.4 C26.2 30.4 24.6 27.4 24.8 24.4 L23.8 25.6 L23.8 30.5 L20.2 30.5 L20.2 25.2 L11.4 25.2 L11.4 30.5 L7.8 30.5 L7.8 25 C4.8 24.4 3 23 3 21 Z M17 11.4 C14.6 12.2 14 16.6 15.4 19.4 C17 21.6 19.6 20.8 20.2 18.6 C20.8 15.4 19.6 11.6 17 11.4 Z"/>
<path ${S} stroke-width="1.8" d="M24.6 20.6 C26.4 22.4 28.6 22.4 30.4 21"/>`,

  // Musket, level, with stock and lock.
  gun: `<path ${S} stroke-width="${W}" d="M12 14 L30.5 14"/>
<path ${F} d="M2 13 L13.5 11.6 L14.5 17.4 L3.6 21.6 Z"/>
<path ${S} stroke-width="1.7" d="M15 17 C15.4 20 17.6 20.6 19 18.6"/>
<path ${F} d="M14 10.2 L17.6 10.2 L17.6 14 L14 14 Z"/>`,

  // Cannon: tapered barrel on a spoked wheel.
  artillery: `<path ${F} d="M6 21 L27.6 10.2 C29.2 9.6 30.4 10.4 30.4 11.8 C30.4 12.8 29.8 13.4 28.8 13.8 L8.6 25.6 Z"/>
<circle ${F} cx="29.6" cy="11.8" r="1.6"/>
<path ${S} stroke-width="${W}" d="M13 23 L2.5 29.5"/>
<circle ${S} stroke-width="${W}" cx="13" cy="23" r="6.2"/>
<path ${S} stroke-width="1.6" d="M13 16.8 L13 29.2 M6.8 23 L19.2 23"/>
<circle ${F} cx="13" cy="23" r="1.9"/>`,
};

/** The NATO-style mark drawn small in a corner of the block (GAME_DESIGN 10). */
export type NatoMark = 'infantry' | 'cavalry' | 'artillery';

export function natoMarkOf(symbol: UnitSymbol): NatoMark {
  if (symbol === 'artillery') return 'artillery';
  if (
    symbol === 'cavalry' ||
    symbol === 'lightCavalry' ||
    symbol === 'chariot' ||
    symbol === 'elephant'
  ) {
    return 'cavalry';
  }
  return 'infantry';
}

/** A pictogram as a standalone SVG string of the given pixel size. */
export function pictogramSvg(symbol: UnitSymbol, size: number, color = 'currentColor'): string {
  return `<svg class="pictogram" width="${size}" height="${size}" viewBox="0 0 32 32" style="color:${color}" aria-hidden="true">${PICTOGRAMS[symbol]}</svg>`;
}

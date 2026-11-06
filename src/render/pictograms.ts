import type { Side, UnitSymbol } from '../core/types';

/**
 * Troop badges (GAME_DESIGN 10). Every unit carries a bold badge: a shape that tells its
 * role (shield = melee foot, hexagon = missile troops, circle = mounted, rounded square =
 * artillery), filled with the side's colour, with a cream inner ring, a dark outline and
 * a chunky cream pictogram of the troop. Shared by the board and every screen.
 *
 * Pictograms are drawn in a 32×32 box with `currentColor`.
 */
const S = 'stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"';
const F = 'fill="currentColor"';
const W = 3.4; // main line weight: bold enough to read at 16 px

export const PICTOGRAMS: Record<UnitSymbol, string> = {
  // Spear and round shield.
  spear: `<path ${S} stroke-width="${W}" d="M22 30 L22 11"/>
<path ${F} d="M22 1 L26.4 9.5 L22 13 L17.6 9.5 Z"/>
<path ${F} fill-rule="evenodd" d="M11.5 10.5 a8.5 8.5 0 1 0 0.01 0 Z M11.5 16.6 a2.4 2.4 0 1 1 -0.01 0 Z"/>`,

  // Three long pikes.
  pike: `<path ${S} stroke-width="3" d="M8 30 L8 10 M16 30 L16 8 M24 30 L24 10"/>
<path ${F} d="M8 1.5 L11 7 L8 11 L5 7 Z M16 0 L19 5.5 L16 9.5 L13 5.5 Z M24 1.5 L27 7 L24 11 L21 7 Z"/>`,

  // Sword and tall shield.
  infantry: `<path ${F} fill-rule="evenodd" d="M3 8 Q10.5 5 18 8 L18 25.5 Q10.5 30.5 3 25.5 Z M10.5 14.2 a2.6 2.6 0 1 0 0.01 0 Z"/>
<path ${F} d="M25 1 L28 5.5 L28 19.5 L22 19.5 L22 5.5 Z"/>
<path ${S} stroke-width="${W}" d="M20 21 L30 21 M25 22 L25 27"/>
<circle ${F} cx="25" cy="29.2" r="2.3"/>`,

  // Bow with a nocked arrow.
  archer: `<path ${S} stroke-width="${W}" d="M9 2.5 Q27 16 9 29.5"/>
<path ${S} stroke-width="1.8" d="M9 2.5 L9 29.5"/>
<path ${S} stroke-width="2.6" d="M4 16 L24 16 M5 16 L2.5 12.5 M5 16 L2.5 19.5"/>
<path ${F} d="M31 16 L23.5 11 L23.5 21 Z"/>`,

  // Crossbow: prod across a stock, bolt pointing up.
  crossbow: `<path ${S} stroke-width="${W}" d="M3 14 Q16 4.5 29 14"/>
<path ${S} stroke-width="1.8" d="M3 14 L16 19.5 L29 14"/>
<path ${F} d="M13.4 8 L18.6 8 L19.2 25.5 L21 30.5 L11 30.5 L12.8 25.5 Z"/>
<path ${F} d="M16 0 L20.2 7 L11.8 7 Z"/>`,

  // Javelins and a sling stone.
  skirmisher: `<path ${S} stroke-width="3" d="M4.5 26.5 L20.5 10.5 M10 30 L26 14"/>
<path ${F} d="M25 5 L23 12.6 L17.4 7 Z M30.5 8.5 L28.5 16.1 L22.9 10.5 Z"/>
<circle ${F} cx="7.5" cy="10.5" r="3.6"/>`,

  // Horse head with a lance and pennon behind it.
  cavalry: `<path ${S} stroke-width="3" d="M5 31 L5 4"/>
<path ${F} d="M5 1 L14.5 5 L5 9 Z"/>
<path ${F} fill-rule="evenodd" d="M9.5 31 C9.5 22 11.5 14 15.5 10 L16 4 L19.4 8.2 C23.2 8.6 26.8 12.6 29.4 18 C30.4 20.6 28.9 22.8 26.3 22.6 C23.9 22.4 22.2 20.8 20.8 20 C19.2 23 18.8 26.8 19.4 31 Z M21 12.8 a1.6 1.6 0 1 0 0.01 0 Z"/>`,

  // Lean horse head with a flowing mane.
  lightCavalry: `<path ${F} fill-rule="evenodd" d="M9 31 C9 22 11 14 15 10 L15.5 4 L18.8 8.2 C22.6 8.6 26.4 12.6 29 18 C30 20.6 28.5 22.8 25.9 22.6 C23.5 22.4 21.8 20.8 20.4 20 C18.8 23 18.4 26.8 19 31 Z M20.6 12.8 a1.6 1.6 0 1 0 0.01 0 Z"/>
<path ${S} stroke-width="2.6" d="M13.4 11 C9.8 12 6.6 11 3.4 8.6 M12 16.4 C8.8 17.8 5.6 17.4 2.6 15.6 M11 22 C8.4 23.4 5.8 23.4 3 22.2"/>`,

  // Chariot: spoked wheel, car and pole.
  chariot: `<circle ${S} stroke-width="3.2" cx="12" cy="20" r="8.6"/>
<path ${S} stroke-width="2.4" d="M12 11.4 L12 28.6 M4.6 15.7 L19.4 24.3 M4.6 24.3 L19.4 15.7"/>
<circle ${F} cx="12" cy="20" r="3"/>
<path ${F} d="M2 5.5 L21.5 5.5 L23.5 11.5 L4 11.5 Z"/>
<path ${S} stroke-width="${W}" d="M20.5 17.5 L30.5 12.5"/>`,

  // Elephant facing right: trunk, tusk, ear.
  elephant: `<path ${F} fill-rule="evenodd" d="M2.5 21 C2.5 12 8 7 16 7 C20 7 23.6 8.2 25.8 10.6 C28.9 13.3 29.7 17.2 28.7 21 C28.1 24 28.3 26.4 31 27.4 L30.8 30.8 C26.3 30.8 24.6 27.6 24.8 24.6 L24 25.8 L24 31 L20 31 L20 25.4 L11.6 25.4 L11.6 31 L7.6 31 L7.6 25.2 C4.4 24.6 2.5 23.2 2.5 21 Z M16.6 11.2 C14 12 13.4 16.8 14.9 19.7 C16.6 22 19.4 21.2 20 18.8 C20.7 15.4 19.4 11.4 16.6 11.2 Z"/>
<path ${S} stroke-width="2.4" d="M24.6 20.4 C26.4 22.4 28.8 22.4 30.8 20.8"/>`,

  // Musket, level, with stock and lock.
  gun: `<path ${S} stroke-width="${W}" d="M12 13.5 L30.5 13.5"/>
<path ${F} d="M1.5 12.5 L14 10.8 L15 17.6 L3.4 22.4 Z"/>
<path ${S} stroke-width="2.4" d="M15 17 C15.4 20.4 18 21 19.6 18.6"/>
<path ${F} d="M14 9 L18.4 9 L18.4 13.5 L14 13.5 Z"/>`,

  // Cannon: tapered barrel on a spoked wheel.
  artillery: `<path ${F} d="M5.5 20.5 L27.4 9.6 C29.2 8.9 30.6 9.8 30.6 11.5 C30.6 12.6 29.9 13.3 28.8 13.8 L8.4 25.8 Z"/>
<path ${S} stroke-width="${W}" d="M13 23 L2.5 29.8"/>
<circle ${S} stroke-width="3.2" cx="13" cy="23" r="6.4"/>
<circle ${F} cx="13" cy="23" r="2.4"/>`,
};

/** Badge shape by battlefield role. */
export type BadgeShape = 'shield' | 'hexagon' | 'circle' | 'square';

export function badgeShapeOf(symbol: UnitSymbol): BadgeShape {
  switch (symbol) {
    case 'archer':
    case 'crossbow':
    case 'skirmisher':
    case 'gun':
      return 'hexagon';
    case 'cavalry':
    case 'lightCavalry':
    case 'chariot':
    case 'elephant':
      return 'circle';
    case 'artillery':
      return 'square';
    default:
      return 'shield';
  }
}

/** Badge outlines in a 40×44 box (the pictogram sits in its upper middle). */
export const BADGE_PATHS: Record<BadgeShape, string> = {
  shield: 'M3 3 L37 3 L37 20 C37 31.5 29.5 38 20 42.5 C10.5 38 3 31.5 3 20 Z',
  hexagon: 'M20 1.5 L37.5 11.5 L37.5 31.5 L20 41.5 L2.5 31.5 L2.5 11.5 Z',
  circle: 'M20 3 A18.5 18.5 0 1 1 19.99 3 Z',
  square: 'M9 3 L31 3 Q37 3 37 9 L37 33 Q37 39 31 39 L9 39 Q3 39 3 33 L3 9 Q3 3 9 3 Z',
};

/** Where the pictogram sits inside each badge (centre y, size) in the 40×44 box. */
const ICON_AT: Record<BadgeShape, { cy: number; size: number }> = {
  shield: { cy: 19, size: 24 },
  hexagon: { cy: 21.5, size: 23 },
  circle: { cy: 21.5, size: 23 },
  square: { cy: 21, size: 24 },
};

export const BADGE_COLORS: Record<Side, { fill: string; dark: string }> = {
  blue: { fill: '#2f5d9e', dark: '#15294a' },
  red: { fill: '#b23a3a', dark: '#4e1414' },
};
export const BADGE_CREAM = '#f7f1e3';

/**
 * The badge's inner SVG markup in a 40×44 box: shadow, dark outline, side fill, cream inner
 * ring, the pictogram, and one pip per level above 1 along the bottom.
 */
export function badgeMarkup(symbol: UnitSymbol, side: Side, level = 1, muted = false): string {
  const shape = badgeShapeOf(symbol);
  const d = BADGE_PATHS[shape];
  const c = BADGE_COLORS[side];
  const at = ICON_AT[shape];
  const k = at.size / 32;
  const pips = Math.max(0, Math.min(4, level - 1));
  const pipY = shape === 'shield' ? 34.5 : shape === 'square' ? 34 : 35.5;
  const pipMarks = Array.from({ length: pips }, (_, i) => {
    const x = 20 + (i - (pips - 1) / 2) * 5.6;
    return `<circle cx="${x}" cy="${pipY}" r="2.1" fill="${BADGE_CREAM}" stroke="${c.dark}" stroke-width="0.8"/>`;
  }).join('');
  const iconY = pips ? at.cy - 2 : at.cy;
  return `<path d="${d}" transform="translate(1.2 1.6)" fill="#000" fill-opacity="0.28"/>
<path d="${d}" fill="${muted ? '#fff' : c.fill}" fill-opacity="${muted ? 0.5 : 1}" stroke="${c.dark}" stroke-width="2.6" stroke-linejoin="round"/>
<path d="${d}" transform="translate(20 21.5) scale(0.82) translate(-20 -21.5)" fill="none" stroke="${muted ? c.fill : BADGE_CREAM}" stroke-width="1.6" stroke-opacity="0.85" stroke-linejoin="round"/>
<g transform="translate(${20 - at.size / 2} ${iconY - at.size / 2}) scale(${k})" color="${muted ? c.fill : BADGE_CREAM}">${PICTOGRAMS[symbol]}</g>
${pipMarks}`;
}

/** A badge as a standalone SVG of the given width (height follows the 40×44 box). */
export function badgeSvg(symbol: UnitSymbol, side: Side, width: number, level = 1): string {
  const h = (width * 44) / 40;
  return `<svg class="badge-icon" width="${width}" height="${h}" viewBox="0 0 40 44" aria-hidden="true">${badgeMarkup(symbol, side, level)}</svg>`;
}

/** A plain pictogram as a standalone SVG of the given pixel size. */
export function pictogramSvg(symbol: UnitSymbol, size: number, color = 'currentColor'): string {
  return `<svg class="pictogram" width="${size}" height="${size}" viewBox="0 0 32 32" style="color:${color}" aria-hidden="true">${PICTOGRAMS[symbol]}</svg>`;
}

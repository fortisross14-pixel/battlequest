import type { AgeEmblem } from '../../content/campaign/types';
import { PICTOGRAMS } from '../../render/pictograms';

/** Small ink emblems for the ages on the timeline (32×32, currentColor). */
const S =
  'stroke="currentColor" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"';
const F = 'fill="currentColor"';

const EMBLEMS: Record<AgeEmblem, string> = {
  chariot: PICTOGRAMS.chariot,
  laurel: `<path ${S} d="M16 28 C8 24 5 16 7 6 M16 28 C24 24 27 16 25 6"/>
<path ${F} d="M7 10 l-4 -2 l2 4 Z M6.5 15 l-4.5 -1 l3 3.5 Z M8 20 l-4 0 l3.5 3 Z M25 10 l4 -2 l-2 4 Z M25.5 15 l4.5 -1 l-3 3.5 Z M24 20 l4 0 l-3.5 3 Z"/>`,
  eagle: `<path ${F} d="M16 6 C14 6 13 8 13.5 10 L4 8 L8 13 L3 14 L10 17 L13 17 L14 25 L12 29 L16 27 L20 29 L18 25 L19 17 L22 17 L29 14 L24 13 L28 8 L18.5 10 C19 8 18 6 16 6 Z"/>`,
  crown: `<path ${F} d="M4 24 L6 10 L11 17 L16 7 L21 17 L26 10 L28 24 Z"/><rect ${F} x="4" y="25.5" width="24" height="3.5" rx="1"/>`,
  castle: `<path ${F} d="M6 29 L6 9 L9 9 L9 12 L12 12 L12 9 L15 9 L15 12 L17 12 L17 9 L20 9 L20 12 L23 12 L23 9 L26 9 L26 29 L19 29 L19 22 C19 19.5 13 19.5 13 22 L13 29 Z"/>`,
  ship: `<path ${F} d="M15 4 L15 21 L5 21 Z M17 6 L27 21 L17 21 Z"/><path ${F} d="M3 23 L29 23 L25 29 L7 29 Z"/>`,
  pike: PICTOGRAMS.pike,
  tricorne: `<path ${F} d="M3 21 C8 11 24 11 29 21 C24 24 20 18 16 24 C12 18 8 24 3 21 Z"/><circle ${F} cx="16" cy="12" r="2.5"/>`,
  bicorne: `<path ${F} d="M2 22 C6 13 12 9 16 9 C20 9 26 13 30 22 C24 19 20 21 16 25 C12 21 8 19 2 22 Z"/><circle cx="16" cy="15" r="2.6" fill="#f8f2e2"/>`,
  rifle: PICTOGRAMS.gun,
};

export function emblemSvg(e: AgeEmblem, size = 40): string {
  return `<svg class="emblem" width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true">${EMBLEMS[e]}</svg>`;
}

/** A red wax seal for locked ages. */
export function sealSvg(size = 44): string {
  return `<svg class="seal" width="${size}" height="${size}" viewBox="0 0 44 44" aria-hidden="true">
<path d="M22 2 L26 6 L32 4 L33 10 L39 12 L37 18 L42 22 L37 26 L39 32 L33 34 L32 40 L26 38 L22 42 L18 38 L12 40 L11 34 L5 32 L7 26 L2 22 L7 18 L5 12 L11 10 L12 4 L18 6 Z" fill="#9e2a22" stroke="#5e1410" stroke-width="1.5"/>
<circle cx="22" cy="22" r="11" fill="none" stroke="#e8b4a8" stroke-width="1.5" opacity="0.7"/>
<path d="M22 14 L24.3 19.6 L30 20 L25.6 23.6 L27 29 L22 26 L17 29 L18.4 23.6 L14 20 L19.7 19.6 Z" fill="#e8b4a8" opacity="0.8"/>
</svg>`;
}

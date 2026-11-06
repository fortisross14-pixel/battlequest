/**
 * Dev-only icon sheet (icons.html): every troop pictogram on blue and red blocks, at card
 * size and at board size, for the owner to approve before the in-game icons change.
 */
import type { UnitSymbol } from '../core/types';
import { natoMarkOf, PICTOGRAMS, pictogramSvg } from '../render/pictograms';

const BLUE = { fill: '#2f5d9e', dark: '#1c3a66' };
const RED = { fill: '#b23a3a', dark: '#6e1f1f' };
const CREAM = '#f7f1e3';

const TYPES: [UnitSymbol, string, string][] = [
  ['spear', 'Spear', 'Spearmen, hoplites'],
  ['pike', 'Pike', 'Pikemen, sarissa'],
  ['infantry', 'Sword and shield', 'Heavy swordsmen, legions'],
  ['archer', 'Bow', 'Archers'],
  ['crossbow', 'Crossbow', 'Crossbowmen'],
  ['skirmisher', 'Javelin / sling', 'Skirmishers, peltasts'],
  ['cavalry', 'Horse head, heavy', 'Heavy cavalry, knights'],
  ['lightCavalry', 'Horse head, light', 'Light cavalry, horse archers'],
  ['chariot', 'Chariot', 'Chariots'],
  ['elephant', 'Elephant', 'War elephants'],
  ['gun', 'Musket', 'Arquebusiers, line infantry'],
  ['artillery', 'Cannon', 'Field artillery'],
];

function nato(symbol: UnitSymbol, x: number, y: number, s: number): string {
  const m = natoMarkOf(symbol);
  const sw = Math.max(1, s * 0.16);
  if (m === 'artillery')
    return `<circle cx="${x + s / 2}" cy="${y + s / 2}" r="${s * 0.32}" fill="${CREAM}"/>`;
  const p = `stroke="${CREAM}" stroke-width="${sw}" stroke-linecap="round"`;
  return m === 'cavalry'
    ? `<path ${p} d="M${x} ${y + s} L${x + s} ${y}"/>`
    : `<path ${p} d="M${x} ${y} L${x + s} ${y + s} M${x} ${y + s} L${x + s} ${y}"/>`;
}

/** A card-size icon: a flat block with the pictogram. */
function cardIcon(symbol: UnitSymbol, side: typeof BLUE, w: number): string {
  const h = Math.round(w * 0.62);
  const icon = h * 0.86;
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="2" fill="${side.fill}" stroke="${side.dark}" stroke-width="1.5"/>
<path d="M1 2 L${w - 1} 2" stroke="${side.dark}" stroke-width="${Math.max(3, h * 0.12)}"/>
<g transform="translate(${w * 0.42 - icon / 2} ${(h - icon) / 2 + 1}) scale(${icon / 32})" color="${CREAM}">${PICTOGRAMS[symbol]}</g>
${nato(symbol, w - h * 0.3 - 3, h - h * 0.3 - 3, h * 0.22)}
</svg>`;
}

/**
 * One board square with a unit: a wide block (80% × 45%) rotated to its facing, the long
 * side as the front, the pictogram kept upright, NATO mark and level chevrons inside the
 * block, and the strength bar and cohesion pip under it.
 */
function boardUnit(
  symbol: UnitSymbol,
  side: typeof BLUE,
  sq: number,
  facingDeg: number,
  level: number,
  strength: number,
  pip: string,
): string {
  const c = sq / 2;
  const bw = sq * 0.78;
  const bh = sq * 0.42;
  const x0 = c - bw / 2;
  const y0 = c - bh / 2 - sq * 0.07;
  const front = Math.max(2.5, sq * 0.07);
  const chev = Array.from({ length: level - 1 }, (_, i) => {
    const cx = x0 + bw - sq * 0.09;
    const cy = y0 + bh * 0.62 - i * sq * 0.075;
    const a = sq * 0.06;
    return `<path d="M${cx - a} ${cy + a * 0.6} L${cx} ${cy} L${cx + a} ${cy + a * 0.6}" stroke="${CREAM}" stroke-width="${Math.max(1.2, sq * 0.03)}" fill="none" stroke-linecap="round"/>`;
  }).join('');
  const icon = bh * 0.92;
  const iy = y0 + bh / 2;
  const barW = sq * 0.62;
  const barY = sq * 0.86;
  const barH = Math.max(4, sq * 0.075);
  return `<svg width="${sq}" height="${sq}" viewBox="0 0 ${sq} ${sq}">
<rect x="0.5" y="0.5" width="${sq - 1}" height="${sq - 1}" fill="none" stroke="rgba(59,50,38,0.12)"/>
<g transform="rotate(${facingDeg} ${c} ${iy})">
<rect x="${x0}" y="${y0}" width="${bw}" height="${bh}" fill="${side.fill}" stroke="${side.dark}" stroke-width="1.2"/>
<path d="M${x0} ${y0 + front / 2} L${x0 + bw} ${y0 + front / 2}" stroke="${side.dark}" stroke-width="${front}"/>
${nato(symbol, x0 + sq * 0.05, y0 + front + sq * 0.03, sq * 0.11)}
${chev}
</g>
<g transform="translate(${c - icon / 2} ${iy - icon / 2}) scale(${icon / 32})" color="${CREAM}">${PICTOGRAMS[symbol]}</g>
<rect x="${c - barW / 2}" y="${barY}" width="${barW}" height="${barH}" rx="${barH / 2}" fill="rgba(59,50,38,0.25)"/>
<rect x="${c - barW / 2}" y="${barY}" width="${(barW * strength) / 100}" height="${barH}" rx="${barH / 2}" fill="#3b3226"/>
<circle cx="${c + barW / 2 + barH * 1.3}" cy="${barY + barH / 2}" r="${barH * 0.95}" fill="${pip}" stroke="#3b3226" stroke-width="1"/>
</svg>`;
}

const cards = TYPES.map(
  ([sym, name, troops]) => `<figure>
  <div class="big">${pictogramSvg(sym, 64, '#3b3226')}</div>
  <div class="pair">${cardIcon(sym, BLUE, 64)}${cardIcon(sym, RED, 64)}</div>
  <div class="pair">${cardIcon(sym, BLUE, 40)}${cardIcon(sym, RED, 40)}</div>
  <figcaption><b>${name}</b><small>${troops}</small></figcaption>
</figure>`,
).join('');

const board = (sq: number) =>
  TYPES.map(([sym], i) => {
    const side = i % 2 ? RED : BLUE;
    const facing = [0, 90, 45, 270][i % 4]!;
    const level = (i % 4) + 1;
    const pips = ['#4f8f3a', '#d9b21b', '#e07b1f', '#c0392b'];
    return boardUnit(sym, side, sq, facing, level, 100 - (i % 5) * 15, pips[i % 4]!);
  }).join('');

document.querySelector('#sheet')!.innerHTML = `
<h1>Troop pictograms <small>for approval</small></h1>
<p>One flat silhouette per troop type, same line weight and size. Top: the pictogram alone, then card-size blocks (Army screen, shop, builder) at 64 and 40 px.</p>
<div class="grid">${cards}</div>
<h2>On the board</h2>
<p>Wide blocks (80% × 45% of a square), long side = front (thick edge), rotated to the facing. The pictogram stays upright so it is always readable; the small NATO mark (✕ infantry, ╱ cavalry, ● artillery) and the level chevrons turn with the block. Strength bar and cohesion pip are larger. Facings shown: N, E, NE, W; levels 1–4.</p>
<h3>Tablet (64 px squares)</h3><div class="board">${board(64)}</div>
<h3>Phone (44 px squares)</h3><div class="board">${board(44)}</div>`;

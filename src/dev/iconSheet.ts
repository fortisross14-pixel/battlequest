/**
 * Dev-only icon sheet (icons.html): every troop badge at card size, and two ways to show
 * badges on the board, for the owner to approve before the in-game icons change.
 */
import type { Side, UnitSymbol } from '../core/types';
import { BADGE_COLORS, badgeMarkup, badgeSvg } from '../render/pictograms';

const TYPES: [UnitSymbol, string, string][] = [
  ['spear', 'Spear', 'Spearmen, hoplites'],
  ['pike', 'Pike', 'Pikemen'],
  ['infantry', 'Sword and shield', 'Heavy swordsmen'],
  ['archer', 'Bow', 'Archers'],
  ['crossbow', 'Crossbow', 'Crossbowmen'],
  ['skirmisher', 'Javelin / sling', 'Skirmishers'],
  ['gun', 'Musket', 'Arquebusiers, line'],
  ['cavalry', 'Heavy horse', 'Heavy cavalry'],
  ['lightCavalry', 'Light horse', 'Light cavalry'],
  ['chariot', 'Chariot', 'Chariots'],
  ['elephant', 'Elephant', 'War elephants'],
  ['artillery', 'Cannon', 'Field artillery'],
];

const PIPS = ['#4f9d4a', '#e2c02b', '#e07b24', '#c0392b'];

interface Mock {
  sym: UnitSymbol;
  side: Side;
  x: number;
  y: number;
  /** Degrees, 0 = north. */
  facing: number;
  level: number;
  strength: number;
  coh: number;
}

/** One unit on a board of `sq`-pixel squares, with the badge drawn in the given style. */
function unitMarkup(u: Mock, sq: number, style: 'onBlock' | 'pole'): string {
  const c = BADGE_COLORS[u.side];
  const cx = (u.x + 0.5) * sq;
  const cy = (u.y + 0.5) * sq;
  const bw = sq * 0.8;
  const bh = sq * 0.45;
  const front = Math.max(2.5, sq * 0.09);
  const block = `<g transform="rotate(${u.facing} ${cx} ${cy})">
<rect x="${cx - bw / 2}" y="${cy - bh / 2}" width="${bw}" height="${bh}" fill="${c.fill}" stroke="${c.dark}" stroke-width="1.2"/>
<path d="M${cx - bw / 2} ${cy - bh / 2 + front / 2} L${cx + bw / 2} ${cy - bh / 2 + front / 2}" stroke="${c.dark}" stroke-width="${front}"/>
</g>`;
  const barW = sq * 0.62;
  const barH = Math.max(4, sq * 0.08);
  const barY = (u.y + 1) * sq - barH - sq * 0.05;
  const bar = `<rect x="${cx - barW / 2}" y="${barY}" width="${barW}" height="${barH}" rx="${barH / 2}" fill="rgba(59,50,38,0.55)"/>
<rect x="${cx - barW / 2}" y="${barY}" width="${(barW * u.strength) / 100}" height="${barH}" rx="${barH / 2}" fill="#f3ead2"/>
<circle cx="${cx + barW / 2 + barH}" cy="${barY + barH / 2}" r="${barH}" fill="${PIPS[u.coh]}" stroke="#3b3226" stroke-width="1"/>`;
  let badge: string;
  if (style === 'onBlock') {
    const w = sq * 0.6;
    const k = w / 40;
    badge = `<g transform="translate(${cx - w / 2} ${cy - (44 * k) / 2 - sq * 0.04}) scale(${k})">${badgeMarkup(u.sym, u.side, u.level)}</g>`;
  } else {
    const w = sq * 0.52;
    const k = w / 40;
    const px = cx + sq * 0.14;
    const by = cy - sq * 0.86;
    badge = `<path d="M${px} ${cy} L${px} ${by + 40 * k}" stroke="#3b3226" stroke-width="${Math.max(1.2, sq * 0.03)}"/>
<g transform="translate(${px - w / 2} ${by}) scale(${k})">${badgeMarkup(u.sym, u.side, u.level)}</g>`;
  }
  return block + bar + badge;
}

function board(sq: number, style: 'onBlock' | 'pole'): string {
  const cols = 9;
  const rows = 5;
  // A tight formation: a blue line facing east, a red line facing west.
  const units: Mock[] = [];
  TYPES.slice(0, 6).forEach(([sym], i) =>
    units.push({
      sym,
      side: 'blue',
      x: 2 + (i % 2),
      y: Math.floor(i / 2) + 1,
      facing: 90,
      level: 1 + (i % 3),
      strength: 100 - i * 9,
      coh: i % 2,
    }),
  );
  TYPES.slice(6).forEach(([sym], i) =>
    units.push({
      sym,
      side: 'red',
      x: 5 + (i % 2),
      y: Math.floor(i / 2) + 1,
      facing: i === 5 ? 225 : 270,
      level: 1 + ((i + 1) % 4),
      strength: 95 - i * 8,
      coh: (i + 1) % 3,
    }),
  );
  const grid = [
    ...Array.from(
      { length: cols + 1 },
      (_, x) => `<path d="M${x * sq} 0 L${x * sq} ${rows * sq}"/>`,
    ),
    ...Array.from(
      { length: rows + 1 },
      (_, y) => `<path d="M0 ${y * sq} L${cols * sq} ${y * sq}"/>`,
    ),
  ].join('');
  return `<svg width="${cols * sq}" height="${rows * sq}" viewBox="0 0 ${cols * sq} ${rows * sq}" style="background:#f4ecd8">
<g stroke="rgba(107,90,58,0.18)" stroke-width="1">${grid}</g>
${units.map((u) => unitMarkup(u, sq, style)).join('')}
</svg>`;
}

const cards = TYPES.map(
  ([sym, name, troops]) => `<figure>
  <div class="pair">${badgeSvg(sym, 'blue', 56)}${badgeSvg(sym, 'red', 56)}</div>
  <div class="pair">${badgeSvg(sym, 'blue', 36, 3)}${badgeSvg(sym, 'red', 36, 5)}</div>
  <figcaption><b>${name}</b><small>${troops}</small></figcaption>
</figure>`,
).join('');

document.querySelector('#sheet')!.innerHTML = `
<h1>Troop badges <small>v2, for approval</small></h1>
<p>Bold badges that stand out from the plain blocks. The <b>shape tells the role</b> (shield = melee foot, hexagon = missile troops, circle = mounted, rounded square = artillery), the colour tells the side, and a chunky cream pictogram tells the troop type. Pips along the bottom show the level (Lv3 and Lv5 in the second row). Sizes: 56 px and 36 px (Army screen, shop, builder, unit card).</p>
<div class="grid">${cards}</div>
<h2>On the board: two options</h2>
<div class="opts">
<section><h3>A · Badge on the block</h3><p>The badge sits on the unit; the block's ends and thick front edge show the facing.</p>
<h4>Tablet (64 px squares)</h4>${board(64, 'onBlock')}<h4>Phone (44 px squares)</h4>${board(44, 'onBlock')}</section>
<section><h3>B · Badge on a pole</h3><p>The badge floats above the unit on a short pole, like a standard; the whole block stays visible.</p>
<h4>Tablet (64 px squares)</h4>${board(64, 'pole')}<h4>Phone (44 px squares)</h4>${board(44, 'pole')}</section>
</div>`;

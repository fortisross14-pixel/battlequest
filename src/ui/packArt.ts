import type { PackKind } from '../meta/shop';
import { ageEmblem } from './emblems';
import { el } from './hud';

/**
 * The owner's pack art (src/assets/packs/): an ivory foil wrapper with an empty circle at
 * the top, where the age emblem sits as the pack's wax seal, ringed in the pack's colour.
 * Recruit and Veteran Packs share the troop wrapper (the Veteran's better odds show as a
 * blue-purple glow); the supply-sack wrapper is the daily offer. Seal positions are
 * fractions of each image (README there); tune them here.
 */
export type PackArtKind = PackKind | 'daily';

type ArtFile = 'recruit' | 'veteran' | 'general';

const SEAL_SLOT: Record<ArtFile, { cx: number; cy: number; d: number }> = {
  recruit: { cx: 0.5, cy: 0.22, d: 0.31 },
  veteran: { cx: 0.5, cy: 0.21, d: 0.29 },
  general: { cx: 0.5, cy: 0.23, d: 0.37 },
};

export const PACK_ART: Record<
  PackArtKind,
  { name: string; file: ArtFile; ring: string; glow?: boolean }
> = {
  recruit: { name: 'Recruit Pack', file: 'recruit', ring: '#a8743a' },
  veteran: { name: 'Veteran Pack', file: 'recruit', ring: '#7b4fb0', glow: true },
  general: { name: 'General Pack', file: 'general', ring: '#c99a1e' },
  daily: { name: 'Daily offer', file: 'veteran', ring: '#4f8a4a' },
};

/** Every pack shows in the same box: width × this (the wrappers are about 320 × 589). */
export const PACK_ASPECT = 1.84;

const FILES = import.meta.glob('../assets/packs/pack-*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const url = (file: ArtFile, w: 320 | 640) => FILES[`../assets/packs/pack-${file}-${w}.webp`]!;

/**
 * The age emblem as a seal that can crack: four shards (static quarter clips) each
 * holding the whole emblem, ringed in the pack's colour.
 */
export function packSeal(kind: PackArtKind, age: number): HTMLElement {
  const seal = el('div', {
    class: 'wax-seal pack-seal',
    'aria-hidden': 'true',
    style: `--ring:${PACK_ART[kind].ring}`,
  });
  for (let i = 0; i < 4; i++) {
    const shard = el('span', { class: `shard s${i}` });
    shard.append(ageEmblem(age, 64));
    seal.append(shard);
  }
  return seal;
}

/**
 * A pack: the wrapper image with the seal over its top circle, in a box of `width` CSS px
 * (the same for every pack). The image picks the 320 or 640 px file for the density.
 */
export function packArt(kind: PackArtKind, age: number, width: number): HTMLElement {
  const a = PACK_ART[kind];
  const slot = SEAL_SLOT[a.file];
  const height = Math.round(width * PACK_ASPECT);
  const img = el('img', {
    class: 'pack-img',
    src: url(a.file, 640),
    srcset: `${url(a.file, 320)} 320w, ${url(a.file, 640)} 640w`,
    sizes: `${width}px`,
    alt: '',
    draggable: 'false',
  });
  const seal = packSeal(kind, age);
  // The image fills the box's width; its height follows its own aspect, centred.
  const d = slot.d * width;
  seal.style.width = `${d}px`;
  seal.style.height = `${d}px`;
  seal.style.left = `${slot.cx * 100}%`;
  seal.style.top = `${slot.cy * 100}%`;
  const wrap = el('div', { class: 'pack-frame' }, img, seal);
  return el(
    'div',
    {
      class: `pack-art ${kind} ${a.glow ? 'glow' : ''}`,
      style: `width:${width}px;height:${height}px`,
      'aria-hidden': 'true',
    },
    el('span', { class: 'pack-shadow' }),
    wrap,
  );
}

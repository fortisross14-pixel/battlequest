import { el } from './hud';

/**
 * The owner's age emblems (src/assets/ages/): a white emblem on a black seal disc. Ages
 * without one yet get a plain black seal with the age numeral in white serif type.
 */
const FILES = import.meta.glob('../assets/ages/age-*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const BY_AGE = new Map<number, string>();
for (const [path, url] of Object.entries(FILES)) {
  const m = /age-(\d+)-/.exec(path);
  if (m) BY_AGE.set(Number(m[1]), url);
}

const NUMERALS = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

export function ageEmblemUrl(age: number): string | undefined {
  return BY_AGE.get(age);
}

/** The age's seal at `size` CSS px (the emblem image, or a numeral seal). */
export function ageEmblem(age: number, size: number, cls = ''): HTMLElement {
  const url = BY_AGE.get(age);
  const style = `width:${size}px;height:${size}px`;
  if (url) {
    const img = el('img', {
      class: `age-seal ${cls}`,
      src: url,
      alt: '',
      draggable: 'false',
      style,
    });
    return img;
  }
  return el(
    'span',
    {
      class: `age-seal numeral ${cls}`,
      'aria-hidden': 'true',
      style: `${style};font-size:${Math.round(size * 0.42)}px`,
    },
    NUMERALS[age] ?? String(age),
  );
}

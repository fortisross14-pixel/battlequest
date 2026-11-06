import { Cohesion, type Side } from '../core/types';

/** World pixels per grid square. The camera scales the world to the screen. */
export const CELL = 64;

export const THEME = {
  parchment: 0xefe6cf,
  mapPaper: 0xf4ecd8,
  ink: 0x3b3226,
  grid: 0x6b5a3a,
  gridAlpha: 0.13,
  gridAlphaSelected: 0.3,
  forest: 0x9fb98a,
  forestDark: 0x6f8f5c,
  rough: 0xa89268,
  roughDark: 0x8a7348,
  water: 0x86acd0,
  waterDark: 0x5d87b0,
  fordStone: 0xcfc3a3,
  fordShallow: 0xd9e6ee,
  bridge: 0x8a6d4a,
  hillFill: 0xd6c49a,
  /** Hill fills from the foot to the top, and the soft contour line between them. */
  hillFill1: 0xece2c6,
  hillFill2: 0xe4d6b4,
  hillFill3: 0xdccba3,
  contourSoft: 0xb39c6c,
  contour: 0x9c8455,
  side: { blue: 0x2f5d9e, red: 0xb23a3a } as Record<Side, number>,
  sideDark: { blue: 0x1c3a66, red: 0x6e1f1f } as Record<Side, number>,
  sideLight: { blue: 0xc9d8ee, red: 0xf0cccc } as Record<Side, number>,
  symbol: 0xf7f1e3,
  cohesion: {
    [Cohesion.Steady]: 0x4f9d4a,
    [Cohesion.Disrupted]: 0xe2c02b,
    [Cohesion.Fragmented]: 0xe07b24,
    [Cohesion.Routed]: 0xc0392b,
  } as Record<Cohesion, number>,
  reach: 0x2f74d6,
  pullBack: 0x7d6bb0,
  charge: 0xc0392b,
  shoot: 0x3b3226,
  select: 0xd9a21b,
  damage: 0x8e1f1f,
  serif: 'Georgia, "Iowan Old Style", "Times New Roman", serif',
  sans: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
} as const;

export const COHESION_NAMES: Record<Cohesion, string> = {
  [Cohesion.Steady]: 'Steady',
  [Cohesion.Disrupted]: 'Disrupted',
  [Cohesion.Fragmented]: 'Fragmented',
  [Cohesion.Routed]: 'Routed',
};

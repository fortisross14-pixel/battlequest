import type { TerrainType } from './types';

export interface TerrainRules {
  /** Movement cost multiplier. Infinity = impassable. */
  moveCost: number;
  blocksLos: boolean;
  /** Gives the ranged cover multiplier to units standing in it. */
  cover: boolean;
  /** A unit standing here counts as at least Disrupted when it deals damage (ford). */
  countsAsDisrupted: boolean;
  /** Multiplier on the armor of a unit standing here (ford). */
  defenderArmor: number;
  /** Units may only enter, leave and fight along the bridge's axis. */
  narrow: boolean;
  /** Severity used to pick the terrain a fight happens in: the worse of the two squares wins. */
  roughness: number;
}

/** Every tunable rule constant lives here. Numbers come from GAME_DESIGN.md section 4. */
export const RULES = {
  movement: {
    orthogonalCost: 2,
    diagonalCost: 3,
    /** Any change of facing costs this much (light troops turn free). */
    turnCost: 1,
    uphillMultiplier: 1.5,
    /** RoughTerrainOK units move through rough and forest at this multiplier. */
    roughTerrainOkMultiplier: 1,
    /** Extra move cost multiplier in rough/forest for RoughTerrainBad units. */
    roughTerrainBadMultiplier: 1.5,
    /** Squares an evading unit falls back when charged. */
    evadeSquares: 2,
    /** Evade chance = base + perMp x (evader MP - charger MP), clamped to [min, max]. */
    evadeBase: 0.6,
    evadePerMp: 0.05,
    evadeMin: 0.25,
    evadeMax: 0.95,
    /** A one-square step sideways or back that keeps the facing (not inside a zone of control). */
    sidestepCost: 3,
    /** Squares a Pursue unit follows its routed opponent. */
    pursuitSquares: 2,
  },
  combat: {
    base: 30,
    randomMin: 0.85,
    randomMax: 1.15,
    flank: 1.5,
    rear: 2.0,
    /** Charge tag: impact multiplier for a charge with at least this many squares of run-up. */
    chargeMomentum: 1.2,
    chargeMomentumRunUp: 2,
    /** A unit striking back at an enemy on its flank or rear (no enemy to its front) does this much. */
    flankedStrikeBack: 0.5,
    /** Extra flank/rear multiplier against FlankVulnerable units. */
    flankVulnerable: 1.25,
    uphill: 1.2,
    coverVsRanged: 0.6,
    bracing: 0.8,
    disrupted: 0.75,
    fragmented: 0.5,
    strengthScaleMin: 0.5,
    longRange: 0.7,
    armorPiercing: 0.5,
    /** A defender that does not use its Impact stat counters a charge with Melee x this. */
    defenderMeleeOnImpact: 0.5,
    antiCavalry: {
      /** Charger impact multiplier when it hits AntiCavalry troops from the front. */
      chargerPenalty: 0.5,
      chargerPenaltyStrong: 0.4,
      /** Defender impact multiplier against a frontal cavalry charge. */
      defenderBonus: 1.75,
      defenderBonusStrong: 2.0,
      /** Melee multiplier for AntiCavalry troops fighting cavalry to their front. */
      meleeBonus: 1.5,
      /** Melee multiplier for cavalry fighting AntiCavalry troops from their front. */
      meleeCavalryPenalty: 0.75,
    },
    terrain: {
      roughCavalryImpact: 0.75,
      roughHeavyCavalryMelee: 0.8,
      forestCavalry: 0.5,
      forestLightInfantryMelee: 1.2,
    },
    /** A charge pushes the defender back when it deals at least this many times the damage it takes... */
    pushBackRatio: 2,
    /** ...and at least this much damage. */
    pushBackMinDamage: 10,
    artilleryHillRangeBonus: 1,
    /** How many 45° steps off its facing a unit may wheel into a charge (FrontOnly units: none). */
    chargeTurnSteps: 1,
    chargeTurnStepsFrontOnly: 0,
  },
  morale: {
    baseChance: 0.05,
    damageFactor: 1.5,
    flank: 0.2,
    rear: 0.35,
    adjacentRout: 0.15,
    lowStrength: 0.1,
    lowStrengthThreshold: 50,
    perMorale: 0.03,
    commandRadius: 0.15,
    maxChance: 0.9,
    autoRoutStrength: 25,
    rallyChance: 0.35,
  },
  generals: {
    /** [minimum rank, command radius] (6.1). */
    radiusByRank: [
      [1, 3],
      [4, 4],
      [8, 5],
    ] as [number, number][],
  },
  victory: {
    defaultBreakpoint: 0.5,
  },
  terrain: {
    open: {
      moveCost: 1,
      blocksLos: false,
      cover: false,
      countsAsDisrupted: false,
      defenderArmor: 1,
      narrow: false,
      roughness: 0,
    },
    rough: {
      moveCost: 1.5,
      blocksLos: false,
      cover: false,
      countsAsDisrupted: false,
      defenderArmor: 1,
      narrow: false,
      roughness: 1,
    },
    forest: {
      moveCost: 2,
      blocksLos: true,
      cover: true,
      countsAsDisrupted: false,
      defenderArmor: 1,
      narrow: false,
      roughness: 2,
    },
    river: {
      moveCost: Infinity,
      blocksLos: false,
      cover: false,
      countsAsDisrupted: false,
      defenderArmor: 1,
      narrow: false,
      roughness: 0,
    },
    ford: {
      moveCost: 3,
      blocksLos: false,
      cover: false,
      countsAsDisrupted: true,
      defenderArmor: 0.7,
      narrow: false,
      roughness: 0,
    },
    bridge: {
      moveCost: 1,
      blocksLos: false,
      cover: false,
      countsAsDisrupted: false,
      defenderArmor: 1,
      narrow: true,
      roughness: 0,
    },
  } satisfies Record<TerrainType, TerrainRules>,
} as const;

export type Rules = typeof RULES;

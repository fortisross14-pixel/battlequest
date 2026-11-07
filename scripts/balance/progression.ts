/**
 * balance-sim progression (GAME_DESIGN 7.6): a simulated player clears the campaign in
 * order from a new profile, buying packs and upgrading with a simple policy, over many
 * seeds. It uses the real meta code (shop, rewards, unlocks) and the real battle rules.
 *
 * The policy, kept simple on purpose:
 * - when an age opens, buy its first packs: 2 Recruit Packs and 1 General Pack;
 * - after every battle, upgrade the troops it fields when it can, then buy a Recruit Pack
 *   whenever it has the coins (a General Pack instead, until it holds 3 of the age's);
 * - field the strongest army the slots and army limits allow, led by its strongest general;
 * - play the main path in order (up to `tries` attempts per battle), replay the open battle
 *   with the fewest stars when a star gate blocks it, and play each optional battle once
 *   it opens (up to 2 attempts).
 */
import {
  AGES,
  BATTLE_BY_ID,
  battlesOfAge,
  optionalBattlesOf,
} from '../../src/content/campaign/battles';
import type { ArmyChoice, CampaignBattle } from '../../src/content/campaign/types';
import { cardPower, ERA_UNIT_BY_ID } from '../../src/content/eraUnits';
import { GENERAL_BY_ID } from '../../src/content/generals';
import { armyProblems, availableGenerals, generalPower, withinLimits } from '../../src/meta/army';
import { isAgeUnlocked, isBattleUnlocked } from '../../src/meta/campaign';
import { packPrice } from '../../src/meta/prices';
import {
  canUpgrade,
  newProfile,
  rankForXp,
  upgradeUnit,
  type Profile,
} from '../../src/meta/profile';
import { applyOutcome, evaluate } from '../../src/meta/rewards';
import { buyPack, firstPackPending, generalPool, shopAges } from '../../src/meta/shop';
import { playCampaignBattle } from './sim';

export interface ProgressionOptions {
  seeds: number[];
  /** Attempts per main battle before the run counts as stuck. */
  tries: number;
  /** Last age to play. */
  lastAge: number;
}

/** What the simulated player had when it reached a battle, and how its first try went. */
export interface BattleVisit {
  id: string;
  firstTryWon: boolean;
  wonEventually: boolean;
  attempts: number;
  stars: number;
  /** Owned troop cards of the battle's age, by rarity, and their average level. */
  owned: Record<string, number>;
  avgLevel: number;
  /** Best owned general of the battle's age, by rarity (or 'generic'). */
  general: string;
  army: ArmyChoice;
}

export interface AgeStart {
  age: number;
  coins: number;
  /** Could it buy 2 Recruit Packs and 1 General Pack at once? */
  affordable: boolean;
}

export interface ProgressionRun {
  seed: number;
  visits: BattleVisit[];
  ageStarts: AgeStart[];
  /** First battle it could not win in `tries` attempts, if any. */
  stuckAt: string | null;
}

/** A unit's strength for picking armies: its power tier and level. */
function troopScore(p: Profile, id: string): number {
  const def = ERA_UNIT_BY_ID[id]!;
  return cardPower(def) * (1 + 0.05 * ((p.units[id]?.level ?? 1) - 1));
}

/**
 * The strongest army the slots and limits allow: the best troop types in order, mixing in a
 * second type so the army is not all one troop when the slots allow (a simple player still
 * takes some variety: spears, shooters, horse).
 */
export function bestArmy(p: Profile, b: CampaignBattle): ArmyChoice {
  const owned = Object.keys(p.units)
    .filter((id) => ERA_UNIT_BY_ID[id] && !ERA_UNIT_BY_ID[id]!.enemyOnly)
    .sort((a, c) => troopScore(p, c) - troopScore(p, a));
  const units: { type: string; level: number }[] = [];
  // Pass 1: one of each of the best types by role (archetype), strongest first.
  const roles = new Set<string>();
  for (const id of owned) {
    if (units.length >= b.maxUnits) break;
    const role = ERA_UNIT_BY_ID[id]!.archetype;
    if (roles.has(role)) continue;
    if (!withinLimits({ units }, id)) continue;
    roles.add(role);
    units.push({ type: id, level: p.units[id]!.level });
  }
  // Keep only the strongest roles (drop weak older-age troops when better ones exist).
  units.sort((a, c) => troopScore(p, c.type) - troopScore(p, a.type));
  // Pass 2: fill with the strongest types again.
  for (let i = 0; units.length < b.maxUnits && i < owned.length * b.maxUnits; i++) {
    const id = owned[i % owned.length]!;
    if (withinLimits({ units }, id)) units.push({ type: id, level: p.units[id]!.level });
  }
  const gens = availableGenerals(p).sort(
    (a, c) =>
      generalPower(GENERAL_BY_ID[c]!.rarity, rankForXp(p.generals[c]!.xp)) +
      10 * GENERAL_BY_ID[c]!.age -
      (generalPower(GENERAL_BY_ID[a]!.rarity, rankForXp(p.generals[a]!.xp)) +
        10 * GENERAL_BY_ID[a]!.age),
  );
  const g = gens[0];
  return {
    units: units.slice(0, b.maxUnits),
    general: g ? { id: g, rank: rankForXp(p.generals[g]!.xp) } : undefined,
  };
}

function armyFor(p: Profile, b: CampaignBattle): ArmyChoice {
  if (b.fixedArmy) {
    const a = structuredClone(b.fixedArmy);
    for (const u of a.units) u.level = p.units[u.type]?.level ?? 1;
    return a;
  }
  return bestArmy(p, b);
}

/** Spends coins the simple way: upgrades for fielded troops first, then packs. */
function spend(p: Profile, fielded: string[]): void {
  for (const id of new Set(fielded)) while (canUpgrade(p, id).ok) upgradeUnit(p, id);
  const age = shopAges(p).at(-1);
  // A newly opened age's first packs are bought when the player arrives there.
  if (age === undefined || firstPackPending(p, 'recruit', age)) return;
  for (let guard = 0; guard < 50; guard++) {
    const generalsHeld = generalPool(age).filter((g) => p.generals[g.id]).length;
    const wantGeneral = generalsHeld < 3 && p.coins >= packPrice('general', age);
    if (wantGeneral) buyPack(p, 'general', age);
    else if (p.coins >= packPrice('recruit', age)) buyPack(p, 'recruit', age);
    else break;
  }
}

function snapshot(
  p: Profile,
  b: CampaignBattle,
  army: ArmyChoice,
): Omit<BattleVisit, 'firstTryWon' | 'wonEventually' | 'attempts' | 'stars'> {
  const owned: Record<string, number> = { common: 0, rare: 0, epic: 0, legendary: 0 };
  let levels = 0;
  let n = 0;
  for (const [id, u] of Object.entries(p.units)) {
    const def = ERA_UNIT_BY_ID[id];
    if (!def || def.age !== b.age) continue;
    owned[def.rarity]! += 1;
    levels += u.level;
    n += 1;
  }
  const best = Object.keys(p.generals)
    .map((id) => GENERAL_BY_ID[id]!)
    .filter(
      (g) =>
        g &&
        g.playable &&
        (g.packAge ?? g.age) === b.age &&
        g.rarity !== 'common' &&
        g.rarity !== 'uncommon',
    )
    .sort((a, c) => generalPower(c.rarity, 1) - generalPower(a.rarity, 1))[0];
  return {
    id: b.id,
    owned,
    avgLevel: n ? levels / n : 0,
    general: best?.rarity ?? 'generic',
    army,
  };
}

function play(
  p: Profile,
  b: CampaignBattle,
  seed: number,
): { won: boolean; stars: number; army: ArmyChoice } {
  const army = armyFor(p, b);
  if (armyProblems(p, b, army).length) throw new Error(`${b.id}: bad army ${JSON.stringify(army)}`);
  const state = playCampaignBattle(b, seed, army);
  const o = evaluate(b, state);
  const fielded = army.units.map((u) => u.type);
  applyOutcome(p, b, o, army.general?.id ?? null, { seed, fielded });
  spend(p, fielded);
  return { won: o.won, stars: o.stars, army };
}

export function runProgression(opts: ProgressionOptions): ProgressionRun[] {
  const runs: ProgressionRun[] = [];
  for (const seed of opts.seeds) {
    const p = newProfile(seed);
    const visits: BattleVisit[] = [];
    const ageStarts: AgeStart[] = [];
    let stuckAt: string | null = null;
    let battleSeed = seed;
    const nextSeed = () => (battleSeed = (battleSeed * 1103515245 + 12345) >>> 0);
    outer: for (const age of AGES) {
      if (age.id > opts.lastAge || !isAgeUnlocked(p, age.id)) break;
      if (age.id > 0) {
        const cost = 2 * packPrice('recruit', age.id) + packPrice('general', age.id);
        ageStarts.push({ age: age.id, coins: p.coins, affordable: p.coins >= cost });
        // The age's first packs.
        buyPack(p, 'recruit', age.id);
        buyPack(p, 'recruit', age.id);
        buyPack(p, 'general', age.id);
      }
      const optional = optionalBattlesOf(age.id);
      const playedOptional = new Set<string>();
      for (const b of battlesOfAge(age.id)) {
        // Star gate: replay the open battle with the fewest stars until this one opens.
        for (let r = 0; r < 12 && !isBattleUnlocked(p, b); r++) {
          const open = [...battlesOfAge(age.id), ...optional].filter(
            (x) => isBattleUnlocked(p, x) && (p.battles[x.id]?.stars ?? 0) < 3,
          );
          const pick = open.sort(
            (x, y) => (p.battles[x.id]?.stars ?? 0) - (p.battles[y.id]?.stars ?? 0),
          )[0];
          if (!pick) break;
          play(p, pick, nextSeed());
        }
        if (!isBattleUnlocked(p, b)) {
          stuckAt = b.id;
          break outer;
        }
        const before = snapshot(p, b, armyFor(p, b));
        let attempts = 0;
        let firstTryWon = false;
        let won = false;
        let stars = 0;
        while (attempts < opts.tries && !won) {
          const r = play(p, b, nextSeed());
          attempts += 1;
          if (attempts === 1) firstTryWon = r.won;
          won = r.won;
          stars = Math.max(stars, r.stars);
        }
        visits.push({ ...before, firstTryWon, wonEventually: won, attempts, stars });
        if (!won) {
          stuckAt = b.id;
          break outer;
        }
        // Optional battles that just opened.
        for (const ob of optional) {
          if (playedOptional.has(ob.id) || !isBattleUnlocked(p, ob)) continue;
          playedOptional.add(ob.id);
          const obBefore = snapshot(p, ob, armyFor(p, ob));
          let oa = 0;
          let ofirst = false;
          let owon = false;
          let ostars = 0;
          while (oa < 2 && !owon) {
            const r = play(p, ob, nextSeed());
            oa += 1;
            if (oa === 1) ofirst = r.won;
            owon = r.won;
            ostars = Math.max(ostars, r.stars);
          }
          visits.push({
            ...obBefore,
            firstTryWon: ofirst,
            wonEventually: owon,
            attempts: oa,
            stars: ostars,
          });
        }
      }
    }
    runs.push({ seed, visits, ageStarts, stuckAt });
  }
  return runs;
}

/** Battle ids in the order the progression meets them (main path with optionals after their parent). */
export function progressionOrder(lastAge: number): CampaignBattle[] {
  const out: CampaignBattle[] = [];
  for (const age of AGES) {
    if (age.id > lastAge) break;
    const optional = optionalBattlesOf(age.id);
    for (const b of battlesOfAge(age.id)) {
      out.push(b);
      for (const o of optional) if (o.branchesFrom === b.id) out.push(o);
    }
  }
  return out.filter((b) => BATTLE_BY_ID[b.id]);
}

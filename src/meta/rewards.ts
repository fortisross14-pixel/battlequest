import { PLAYER_SIDE } from '../content/campaign/build';
import type { CampaignBattle } from '../content/campaign/types';
import { isRouted, lostCost, armyCost } from '../core/state';
import type { BattleState } from '../core/types';
import { drawTroop, giveTroop, type TroopCard } from './cards';
import { grantFirstWinUnlocks, syncAgeUnlocks } from './campaign';
import { rankForXp, type Profile } from './profile';

export const REWARDS = {
  winBasePerAge: 100,
  perStar: 50,
  replayFactor: 0.3,
  loss: 20,
  xpWin: 100,
  xpLoss: 30,
  xpPerStar: 20,
  xpPerKill: 10,
  /** ★★ needs losses under this fraction of the army's cost. */
  lowLosses: 0.3,
  /** Troop cards for a win (GAME_DESIGN 8). A loss gives none. */
  cardsFirstWin: 2,
  cardsReplayWin: 1,
};

export interface BattleOutcome {
  won: boolean;
  stars: number;
  lostFraction: number;
  bonusMet: boolean;
  enemyBroken: number;
  generalLost: boolean;
}

export function bonusMet(b: CampaignBattle, s: BattleState): boolean {
  const c = b.bonus;
  switch (c.kind) {
    case 'winByTurn':
      return (s.result?.turn ?? s.turn) <= c.turn;
    case 'generalAlive':
      return !!s.sides[PLAYER_SIDE].general && !s.sides[PLAYER_SIDE].general!.lost;
    case 'noUnitLost':
      return lostCost(s, PLAYER_SIDE) === 0;
    case 'enemyGeneralLost':
      return !!s.sides.red.general?.lost;
  }
}

/** Stars (4.8): ★ win, ★★ win losing under 30%, ★★★ also with the bonus condition. */
export function evaluate(b: CampaignBattle, s: BattleState): BattleOutcome {
  const won = s.result?.winner === PLAYER_SIDE;
  const lostFraction = lostCost(s, PLAYER_SIDE) / Math.max(1, armyCost(s, PLAYER_SIDE));
  const bonus = bonusMet(b, s);
  let stars = 0;
  if (won) {
    stars = 1;
    if (lostFraction < REWARDS.lowLosses) stars = bonus ? 3 : 2;
  }
  const enemyBroken = s.units.filter(
    (u) => u.side !== PLAYER_SIDE && (u.status !== 'active' || isRouted(u)),
  ).length;
  return {
    won,
    stars,
    lostFraction,
    bonusMet: bonus,
    enemyBroken,
    generalLost: !!s.sides[PLAYER_SIDE].general?.lost,
  };
}

export interface Rewards {
  coins: number;
  xp: number;
  generalId: string | null;
  rankBefore: number;
  rankAfter: number;
  newStars: number;
  unlockedAge: number | null;
  firstWin: boolean;
  /** Troop cards earned. */
  cards: TroopCard[];
  /** Troops and generals the first win unlocked. */
  unlocks: { units: string[]; generals: string[] };
}

export interface OutcomeContext {
  /** The battle seed: reward cards are drawn from it, so the same battle gives the same cards. */
  seed: number;
  /** Troop types the player fielded. */
  fielded?: string[];
}

/** Applies a finished battle to the profile and returns what was earned. */
export function applyOutcome(
  p: Profile,
  b: CampaignBattle,
  o: BattleOutcome,
  generalId: string | null,
  ctx: OutcomeContext = { seed: 0 },
): Rewards {
  const rec = (p.battles[b.id] ??= { stars: 0, wins: 0, plays: 0 });
  const firstWin = o.won && rec.wins === 0;
  let coins: number;
  if (o.won) {
    const full = REWARDS.winBasePerAge * Math.max(1, b.age) + REWARDS.perStar * o.stars;
    coins = firstWin ? full : Math.round(full * REWARDS.replayFactor);
  } else {
    coins = REWARDS.loss;
  }
  const newStars = Math.max(0, o.stars - rec.stars);
  rec.plays += 1;
  if (o.won) rec.wins += 1;
  rec.stars = Math.max(rec.stars, o.stars);
  p.coins += coins;

  // First-win unlocks come before XP, so a general who joins after this battle earns it too.
  const unlocks = firstWin ? grantFirstWinUnlocks(p, b) : { units: [], generals: [] };
  // A win can complete an age, which opens the next one and grants its starter troops.
  const unlockedAge = o.won ? (syncAgeUnlocks(p)[0] ?? null) : null;
  const cards: TroopCard[] = [];
  const n = !o.won ? 0 : firstWin ? REWARDS.cardsFirstWin : REWARDS.cardsReplayWin;
  const rng = { rng: (ctx.seed ^ 0x5eed) >>> 0 };
  for (let i = 0; i < n; i++) {
    cards.push(giveTroop(p, drawTroop(p, rng, { fielded: ctx.fielded }).id));
  }

  // Generals who rested this battle are available again; the one who fell rests next time.
  for (const g of Object.values(p.generals)) g.resting = false;
  let xp = 0;
  let rankBefore = 1;
  let rankAfter = 1;
  const g = generalId ? p.generals[generalId] : undefined;
  if (g) {
    xp =
      (o.won ? REWARDS.xpWin : REWARDS.xpLoss) +
      REWARDS.xpPerStar * o.stars +
      REWARDS.xpPerKill * o.enemyBroken;
    rankBefore = rankForXp(g.xp);
    g.xp += xp;
    rankAfter = rankForXp(g.xp);
    if (o.generalLost) g.resting = true;
  }
  return {
    coins,
    xp,
    generalId: g ? generalId : null,
    rankBefore,
    rankAfter,
    newStars,
    unlockedAge,
    firstWin,
    cards,
    unlocks,
  };
}

/** Live state of the ★★★ bonus during a battle, for the objective chip. */
export type BonusStatus = 'met' | 'failed' | 'pending';

export function bonusStatus(b: CampaignBattle, s: BattleState): BonusStatus {
  const c = b.bonus;
  switch (c.kind) {
    case 'winByTurn':
      return s.turn > c.turn
        ? 'failed'
        : s.result
          ? bonusMet(b, s)
            ? 'met'
            : 'failed'
          : 'pending';
    case 'generalAlive':
      return !s.sides[PLAYER_SIDE].general || s.sides[PLAYER_SIDE].general!.lost ? 'failed' : 'met';
    case 'noUnitLost':
      return lostCost(s, PLAYER_SIDE) > 0 ? 'failed' : 'met';
    case 'enemyGeneralLost':
      return s.sides.red.general?.lost ? 'met' : 'pending';
  }
}

/** Short objective line for the battle HUD: what to do and how long is left. */
export function objectiveText(b: CampaignBattle, s: BattleState): string {
  const left = Math.max(0, s.turnLimit - s.turn + 1);
  const turns = `${left} turn${left === 1 ? '' : 's'} left`;
  return b.holdOut ? `Hold out · ${turns}` : `Break the enemy · ${turns}`;
}

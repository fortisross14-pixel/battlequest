/**
 * Balance simulator. Usage: npm run balance -- <duel|cost|scenario [battleId|ageN|all]|progression|aivsai> [--seeds N] [--points P[,P2]] [--out dir]
 * Scenario options: --army test|identical (best N copies of one troop type)|commons (the age's
 * Commons and generic general), --level L (player unit level; by default the test army's own
 * levels, or 1). Progression options: --age A (last age to play), --tries T.
 * Uses the real src/core rules and a fixed seed list, so runs are reproducible.
 */
import { fork } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { ARCHETYPES, type ArchetypeId } from '../../src/content/units';
import { ARCHETYPE_IDS, duel, DUEL_SETUPS, aiVsAi, scenarioBattle, type DuelSetup } from './sim';
import { AGE_BY_ID, BATTLE_BY_ID, CAMPAIGN, battleIndex } from '../../src/content/campaign/battles';
import type { ArmyChoice, CampaignBattle } from '../../src/content/campaign/types';
import { buildScenario } from '../../src/content/campaign/build';
import { sandboxScenario } from '../../src/content/battles/sandbox';
import type { Posture } from '../../src/ai/utility';
import type { Scenario, Side } from '../../src/core';
import { ERA_UNITS, ERA_UNIT_BY_ID, ladder } from '../../src/content/eraUnits';
import { progressionOrder, runProgression, type ProgressionRun } from './progression';

const args = process.argv.slice(2);
const mode = args[0];
const opt = (name: string, def: number) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? Number(args[i + 1]) : def;
};
const optStr = (name: string, def: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1]! : def;
};
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1]! : 'docs/balance';
const today = new Date().toISOString().slice(0, 10);

const short = (id: ArchetypeId) => ARCHETYPES[id].name;
const pct = (x: number) => `${Math.round(x * 100)}%`;

function seedList(n: number): number[] {
  return Array.from({ length: n }, (_, i) => 1000 + i * 7919);
}

function table(header: string[], rows: string[][]): string {
  return [
    `| ${header.join(' | ')} |`,
    `|${header.map(() => '---').join('|')}|`,
    ...rows.map((r) => `| ${r.join(' | ')} |`),
  ].join('\n');
}

function runDuel(seeds: number[]): string {
  const results: Record<DuelSetup, Record<string, Record<string, number>>> = {
    front: {},
    flank: {},
    charge: {},
    brace: {},
  };
  let turns = 0;
  let games = 0;
  for (const setup of DUEL_SETUPS) {
    for (const a of ARCHETYPE_IDS) {
      results[setup][a] = {};
      for (const b of ARCHETYPE_IDS) {
        let score = 0;
        for (const seed of seeds) {
          const o = duel(a, b, setup, seed);
          score += o.score;
          turns += o.turns;
          games++;
        }
        results[setup][a]![b] = score / seeds.length;
      }
    }
  }
  const out: string[] = [
    `# Balance: duel (${today})`,
    '',
    `Every archetype pair, ${seeds.length} seeds per cell, 1v1 on open ground, both sides played by the greedy script (\`src/ai/greedy.ts\`). Cells show the **attacker's** (row) win rate; draws count half. Average turns to resolve: **${(turns / games).toFixed(1)}**.`,
    '',
    "- **front**: already in melee, attacker in the defender's front arc.",
    "- **flank**: already in melee, attacker on the defender's flank.",
    '- **charge**: the attacker charges the defender frontally from 3 squares.',
    '- **brace**: as charge, but the defender is braced (Hold).',
    '',
  ];
  for (const setup of DUEL_SETUPS) {
    out.push(`## ${setup}`, '');
    out.push(
      table(
        ['Attacker \\ Defender', ...ARCHETYPE_IDS.map(short)],
        ARCHETYPE_IDS.map((a) => [
          `**${short(a)}**`,
          ...ARCHETYPE_IDS.map((b) => pct(results[setup][a]![b]!)),
        ]),
      ),
      '',
    );
  }
  // Counters from GAME_DESIGN.md 4.5 and the balance-sim targets.
  const checks: [string, boolean | null, string][] = [];
  for (const spear of ['spearmen', 'pikemen'] as const) {
    for (const cav of ['heavyCavalry', 'chariots'] as const) {
      const frontal = 1 - results.charge[cav]![spear]!;
      checks.push([
        `${short(spear)} beat a frontal ${short(cav)} charge (≥65%)`,
        frontal >= 0.65,
        pct(frontal),
      ]);
      const flank = results.flank[cav]![spear]!;
      checks.push([
        `${short(cav)} beat ${short(spear)} on the flank (≥65%)`,
        flank >= 0.65,
        pct(flank),
      ]);
    }
  }
  for (const shooter of ['archers', 'crossbowmen'] as const) {
    const r = results.charge.heavyCavalry![shooter]!;
    checks.push([`Heavy cavalry charge beats ${short(shooter)} (≥65%)`, r >= 0.65, pct(r)]);
  }
  // Evaders are meant to slip away from heavy cavalry ("but they evade"); in a 1v1 duel
  // they can kite forever, so this row is information, not a pass/fail target.
  const evade = results.charge.heavyCavalry!.skirmishers!;
  checks.push([`Heavy cavalry charge vs Skirmishers (they evade: info only)`, null, pct(evade)]);
  out.push('## Outliers and counter checks', '');
  out.push(
    table(
      ['Check', 'Result', 'Value'],
      checks.map(([c, ok, v]) => [c, ok === null ? 'info' : ok ? 'pass' : '**FAIL**', v]),
    ),
  );
  return out.join('\n') + '\n';
}

/** Plays every archetype pair in `jobs` forked processes; returns the score of A per pair. */
async function costScores(seeds: number[], points: number[], jobs: number) {
  const pairs: [ArchetypeId, ArchetypeId][] = [];
  for (let i = 0; i < ARCHETYPE_IDS.length; i++) {
    for (let j = i + 1; j < ARCHETYPE_IDS.length; j++)
      pairs.push([ARCHETYPE_IDS[i]!, ARCHETYPE_IDS[j]!]);
  }
  const shares: [ArchetypeId, ArchetypeId][][] = Array.from({ length: jobs }, () => []);
  pairs.forEach((p, k) => shares[k % jobs]!.push(p));
  const worker = fileURLToPath(new URL('./costWorker.ts', import.meta.url));
  const parts = await Promise.all(
    shares
      .filter((sh) => sh.length)
      .map(
        (sh) =>
          new Promise<{ a: ArchetypeId; b: ArchetypeId; score: number; games: number }[]>(
            (resolve, reject) => {
              const child = fork(worker);
              child.once('message', (m) => resolve(m as never));
              child.once('error', reject);
              child.send({ pairs: sh, seeds, points });
            },
          ),
      ),
  );
  return parts.flat();
}

async function runCost(seeds: number[], points: number[], jobs: number): Promise<string> {
  const score: Record<string, number> = {};
  const games: Record<string, number> = {};
  const matrix: Record<string, Record<string, number>> = {};
  for (const a of ARCHETYPE_IDS) {
    score[a] = 0;
    games[a] = 0;
    matrix[a] = {};
  }
  for (const { a, b, score: sa, games: n } of await costScores(seeds, points, jobs)) {
    {
      matrix[a]![b] = sa / n;
      matrix[b]![a] = 1 - sa / n;
      score[a]! += sa;
      score[b]! += n - sa;
      games[a]! += n;
      games[b]! += n;
    }
  }
  const rate = (id: string) => score[id]! / games[id]!;
  const sorted = [...ARCHETYPE_IDS].sort((x, y) => rate(y) - rate(x));
  const rates = ARCHETYPE_IDS.map(rate).sort((x, y) => x - y);
  const median = rates[Math.floor(rates.length / 2)]!;
  const dev = (id: string) => (median > 0 ? (rate(id) - median) / median : 0);
  const out: string[] = [
    `# Balance: cost (${today})`,
    '',
    `Equal-points armies (${points.join(' and ')} points, pooled) of a single archetype each, on open ground (16×10), ${seeds.length} seeds × both sides per pair, the utility AI (aggressive) on both sides. Because the armies cost the same, the win rate is the value per point of cost. Median win rate: **${pct(median)}**. Target: within ±15% of the median.`,
    '',
    table(
      ['Archetype', 'Cost', 'Units', 'Win rate', 'vs median'],
      sorted.map((id) => [
        short(id),
        String(ARCHETYPES[id].stats.cost),
        points.map((p) => Math.floor(p / ARCHETYPES[id].stats.cost)).join(' / '),
        pct(rate(id)),
        `${dev(id) >= 0 ? '+' : ''}${Math.round(dev(id) * 100)}%`,
      ]),
    ),
    '',
    '## Matrix (row win rate vs column)',
    '',
    table(
      ['', ...ARCHETYPE_IDS.map(short)],
      ARCHETYPE_IDS.map((a) => [
        `**${short(a)}**`,
        ...ARCHETYPE_IDS.map((b) => (a === b ? '–' : pct(matrix[a]![b]!))),
      ]),
    ),
    '',
    '## Outliers',
    '',
  ];
  const outliers = sorted.filter((id) => Math.abs(dev(id)) > 0.15);
  if (outliers.length === 0) out.push('None.');
  for (const id of outliers) {
    out.push(
      `- **${short(id)}**: ${pct(rate(id))} (${dev(id) > 0 ? '+' : ''}${Math.round(dev(id) * 100)}% vs median)`,
    );
  }
  return out.join('\n') + '\n';
}

interface ScenarioOptions {
  /**
   * 'test': the battle's test army (the expected collection at that point). 'identical': the
   * best army of N copies of one troop type. 'commons': the best army of the age's Commons.
   */
  army: 'test' | 'identical' | 'commons';
  level?: number;
}

function playScenario(b: CampaignBattle, seeds: number[], army: ArmyChoice) {
  let wins = 0;
  let turns = 0;
  let lost = 0;
  /** How many runs reached at least 1, 2 and 3 stars. */
  const atLeast = [0, 0, 0];
  for (const seed of seeds) {
    const r = scenarioBattle(b, seed, army);
    wins += r.won ? 1 : 0;
    turns += r.turns;
    lost += r.lostPct;
    for (let k = 0; k < r.stars; k++) atLeast[k]! += 1;
  }
  const n = seeds.length;
  return {
    rate: wins / n,
    turns: turns / n,
    lost: lost / n,
    starOdds: atLeast.map((c) => c / n),
  };
}

/** Expected best stars over `tries` attempts, from the odds of reaching 1, 2 and 3 stars. */
function expectedStars(starOdds: number[], tries: number): number {
  return starOdds.reduce((sum, p) => sum + 1 - (1 - p) ** tries, 0);
}

/** Armies of N identical units, one per troop type a player could own by this battle's age. */
function identicalArmies(b: CampaignBattle, level: number): ArmyChoice[] {
  return ERA_UNITS.filter((u) => !u.enemyOnly && u.age <= Math.max(b.age, 0)).map((u) => ({
    units: Array.from({ length: b.maxUnits }, () => ({ type: u.id, level })),
    general: b.testArmy.general,
  }));
}

/**
 * Armies of the age's Commons led by its generic Common general: N copies of each Common,
 * and every half-and-half mix of two Commons (the stand-in tries each and keeps the best).
 */
function commonsArmies(b: CampaignBattle, level: number): ArmyChoice[] {
  const commons = ladder(b.age).filter((u) => u.rarity === 'common');
  const gen = AGE_BY_ID[b.age]?.starterGenerals?.[0];
  const general = gen ? { id: gen, rank: 1 } : undefined;
  const out: ArmyChoice[] = [];
  const half = Math.ceil(b.maxUnits / 2);
  for (const a of commons) {
    for (const c of commons) {
      if (c.id < a.id) continue;
      out.push({
        units: Array.from({ length: b.maxUnits }, (_, i) => ({
          type: i < half ? a.id : c.id,
          level,
        })),
        general,
      });
    }
  }
  return out;
}

/**
 * Target win rate with the expected collection (GAME_DESIGN 7.6). Tutorials: Megiddo is
 * almost impossible to lose, Kadesh about 95%. In an age: battle 1 about 90% (after the
 * first packs), battles 2–4 75–90%, the last 3 battles 35–50%, the middle 60–75%.
 * Optional battles: 10–20 points harder than the main battle they branch from.
 */
export function targetBand(b: CampaignBattle): [number, number] {
  if (b.age === 0) return b.id === 'megiddo' ? [0.95, 1] : [0.85, 1];
  if (b.branchesFrom) {
    const [lo, hi] = targetBand(BATTLE_BY_ID[b.branchesFrom]!);
    return [Math.max(0, lo - 0.2), Math.max(0, hi - 0.1)];
  }
  const n = AGE_BY_ID[b.age]?.battles.length ?? 1;
  const i = battleIndex(b);
  if (i === 0) return [0.8, 1];
  if (i >= n - 3) return [0.35, 0.5];
  if (i <= 3) return [0.75, 0.9];
  return [0.6, 0.75];
}

/** Commons-only target (GAME_DESIGN 7.6): battle 1 of an age about 50–60%; none after. */
function commonsBand(b: CampaignBattle): [number, number] | null {
  if (b.age === 0) return targetBand(b);
  return battleIndex(b) === 0 ? [0.45, 0.65] : null;
}

function runScenario(id: string, seeds: number[], opts: ScenarioOptions): string {
  const battles =
    id === 'all'
      ? progressionOrder(99)
      : /^age\d+$/.test(id)
        ? progressionOrder(Number(id.slice(3))).filter((x) => x.age === Number(id.slice(3)))
        : [BATTLE_BY_ID[id]!].filter(Boolean);
  const rows: string[][] = [];
  const outliers: string[] = [];
  const route: { b: CampaignBattle; odds: number[] }[] = [];
  for (const b of battles) {
    const candidates =
      opts.army === 'identical'
        ? identicalArmies(b, opts.level ?? 1)
        : opts.army === 'commons' && !b.fixedArmy
          ? commonsArmies(b, opts.level ?? 1)
          : [
              {
                ...b.testArmy,
                units: b.testArmy.units.map((u) => ({ ...u, level: opts.level ?? u.level ?? 1 })),
              },
            ];
    let best = { rate: -1, turns: 0, lost: 0, starOdds: [0, 0, 0] };
    let bestArmy = candidates[0]!;
    for (const army of candidates) {
      const r = playScenario(b, seeds, army);
      if (r.rate > best.rate) {
        best = r;
        bestArmy = army;
      }
    }
    const rate = best.rate;
    const band = opts.army === 'commons' ? commonsBand(b) : targetBand(b);
    const ok = !band || (rate >= band[0] && rate <= band[1]);
    const target = band ? `${pct(band[0])}–${pct(band[1])}` : '—';
    if (!ok) outliers.push(`- **${b.name}**: ${pct(rate)} (target ${target})`);
    const names = [...new Set(bestArmy.units.map((u) => ERA_UNIT_BY_ID[u.type]?.name))];
    const armyText =
      opts.army === 'test' ? `${bestArmy.units.length} test units` : names.join(' + ');
    rows.push([
      b.branchesFrom ? `${b.name} (optional)` : b.name,
      String(b.age),
      `${armyText} v ${b.enemy.length}`,
      pct(rate),
      target,
      ok ? 'pass' : '**out**',
      best.turns.toFixed(1),
      pct(best.lost),
      expectedStars(best.starOdds, 1).toFixed(1),
    ]);
    route.push({ b, odds: best.starOdds });
  }
  const armyDesc =
    opts.army === 'identical'
      ? 'the best army of N identical units (every troop type a player could own by that age is tried; the best one is shown)'
      : opts.army === 'commons'
        ? "the best army of the age's Commons (every one-type and two-type mix is tried) with its generic Common general"
        : "the battle's test army (the collection the progression run expects at that point)";
  return (
    [
      `# Balance: scenario (${today}, army: ${opts.army}, level ${opts.level ?? 'per test army'})`,
      '',
      `Each battle played ${seeds.length} times per army: the utility AI plays the player with ${armyDesc} at level ${opts.level ?? 'set per unit'}, and the enemy AI plays its scenario posture. Targets (GAME_DESIGN 7.6): ${opts.army === 'commons' ? 'Commons only, battle 1 of an age 45–65%; the tutorials as for the test army' : 'Megiddo 95–100%, Kadesh 85–100%; in an age, battle 1 80–100%, battles 2–4 75–90%, the middle 60–75%, the last 3 35–50%; optional battles 10–20 points below the battle they branch from'}.`,
      '',
      table(
        [
          'Battle',
          'Age',
          'Units',
          'Player wins',
          'Target',
          'Result',
          'Avg turns',
          'Avg player losses',
          'Avg stars',
        ],
        rows,
      ),
      ...starRoute(route),
      '',
      '## Outliers',
      '',
      outliers.length ? outliers.join('\n') : 'None.',
    ].join('\n') + '\n'
  );
}

/**
 * Checks each age's star gates (prompt 04): the stars a player can expect before each
 * battle on a first pass, and with the best of 3 tries per battle (replays).
 */
function starRoute(route: { b: CampaignBattle; odds: number[] }[]): string[] {
  const out: string[] = [];
  for (const age of Object.values(AGE_BY_ID)) {
    const rows = age.battles.map((id) => route.find((r) => r.b.id === id));
    if (!rows.length || rows.some((r) => !r) || age.battles.length < 3) continue;
    let once = 0;
    let thrice = 0;
    const table_: string[][] = [];
    rows.forEach((r, i) => {
      const need = age.starThresholds[i] ?? 0;
      table_.push([
        String(i + 1),
        r!.b.name,
        String(need),
        once.toFixed(1) + (once >= need ? '' : ' ✗'),
        thrice.toFixed(1) + (thrice >= need ? '' : ' ✗'),
      ]);
      once += expectedStars(r!.odds, 1);
      thrice += expectedStars(r!.odds, 3);
    });
    out.push(
      '',
      `## Star route: ${age.name}`,
      '',
      'Expected stars earned in this age before each battle, playing the earlier battles once, or keeping the best of 3 tries. ✗ marks a gate not met on average.',
      '',
      table(['#', 'Battle', 'Stars needed', 'First pass', 'Best of 3'], table_),
      '',
      `Age total: ${once.toFixed(1)} ★ first pass, ${thrice.toFixed(1)} ★ best of 3 (max ${rows.length * 3}).`,
    );
  }
  return out;
}

function runAiVsAi(seeds: number[]): string {
  const maps: {
    name: string;
    make: (seed: number) => Scenario;
    postures: Record<Side, Posture>;
    attackTurn?: number;
  }[] = [
    {
      name: 'Sandbox',
      make: (seed) => sandboxScenario(seed),
      postures: { blue: 'aggressive', red: 'aggressive' },
    },
    ...CAMPAIGN.map((b) => ({
      name: b.name,
      make: (seed: number) => buildScenario(b, b.testArmy, seed),
      postures: {
        blue: b.testPosture ?? (b.holdOut === 'player' ? 'defensive' : 'aggressive'),
        red: b.posture,
      } as Record<Side, Posture>,
      attackTurn: b.attackTurn,
    })),
  ];
  const rows: string[][] = [];
  let score = 0;
  let games = 0;
  const idle = { new: 0, legacy: 0 };
  const missed = { new: 0, legacy: 0 };
  const unitTurns = { new: 0, legacy: 0 };
  for (const m of maps) {
    let s = 0;
    let n = 0;
    let turns = 0;
    const mi = { new: 0, legacy: 0 };
    const mm = { new: 0, legacy: 0 };
    for (const seed of seeds) {
      for (const side of ['blue', 'red'] as const) {
        const r = aiVsAi(m.make(seed), m.postures, m.attackTurn, side);
        s += r.score;
        n++;
        turns += r.turns;
        mi.new += r.idle.new;
        mi.legacy += r.idle.legacy;
        mm.new += r.missed.new;
        mm.legacy += r.missed.legacy;
        unitTurns.new += r.unitTurns.new;
        unitTurns.legacy += r.unitTurns.legacy;
      }
    }
    score += s;
    games += n;
    idle.new += mi.new;
    idle.legacy += mi.legacy;
    missed.new += mm.new;
    missed.legacy += mm.legacy;
    rows.push([
      m.name,
      String(n),
      pct(s / n),
      (turns / n).toFixed(1),
      `${mi.new} / ${mm.new}`,
      `${mi.legacy} / ${mm.legacy}`,
    ]);
  }
  const rate = score / games;
  const per100 = (k: 'new' | 'legacy') => ((100 * idle[k]) / Math.max(1, unitTurns[k])).toFixed(1);
  return (
    [
      `# Balance: new AI vs legacy AI (${today})`,
      '',
      `The utility AI (src/ai/utility.ts) plays the frozen M3 AI (src/ai/legacy.ts) on the sandbox and every campaign map, ${seeds.length} seeds × both sides each. Campaign maps use the test army for blue and the scenario army for red; both AIs get the same posture for a side. Draws count half. Target: the new AI wins more than 60%.`,
      '',
      `**New AI score: ${pct(rate)}** over ${games} games (${rate > 0.6 ? 'pass' : '**below target**'}).`,
      '',
      table(
        [
          'Map',
          'Games',
          'New AI score',
          'Avg turns',
          'Idle / missed support (new)',
          'Idle / missed support (legacy)',
        ],
        rows,
      ),
      '',
      `"Idle" counts a unit that is free to act, with a friend within 4 squares already in melee, that neither moves, charges nor shoots that side turn. "Missed support" is the subset where that unit could have charged the enemy its friend was fighting (from where it stood or after one move). Totals: idle new ${idle.new} / legacy ${idle.legacy} (per 100 unit-turns: ${per100('new')} / ${per100('legacy')}); missed support new ${missed.new} / legacy ${missed.legacy}.`,
    ].join('\n') + '\n'
  );
}

/** The progression report: coins at each age start, collection and win rates per battle. */
function progressionReport(runs: ProgressionRun[], lastAge: number): string {
  const n = runs.length;
  const ageRows: string[][] = [];
  for (const age of Object.values(AGE_BY_ID)) {
    if (age.id === 0 || age.id > lastAge) continue;
    const starts = runs.flatMap((r) => r.ageStarts.filter((s) => s.age === age.id));
    if (!starts.length) continue;
    const coins = starts.map((s) => s.coins).sort((a, c) => a - c);
    const afford = starts.filter((s) => s.affordable).length;
    ageRows.push([
      age.name,
      `${starts.length}/${n}`,
      String(Math.round(coins.reduce((a, c) => a + c, 0) / coins.length)),
      `${coins[0]}–${coins.at(-1)}`,
      `${afford}/${starts.length}`,
    ]);
  }
  const rows: string[][] = [];
  const outliers: string[] = [];
  for (const b of progressionOrder(lastAge)) {
    const visits = runs.flatMap((r) => r.visits.filter((v) => v.id === b.id));
    if (!visits.length) continue;
    const rate = visits.filter((v) => v.firstTryWon).length / visits.length;
    const avg = (f: (v: (typeof visits)[number]) => number) =>
      visits.reduce((a, v) => a + f(v), 0) / visits.length;
    const band = targetBand(b);
    const ok = rate >= band[0] && rate <= band[1];
    if (!ok) {
      outliers.push(`- **${b.name}**: ${pct(rate)} (target ${pct(band[0])}–${pct(band[1])})`);
    }
    const gens = visits.map((v) => v.general);
    const topGen =
      ['legendary', 'epic', 'rare', 'generic'].find(
        (g) => gens.filter((x) => x === g).length * 2 >= gens.length,
      ) ?? 'mixed';
    rows.push([
      b.branchesFrom ? `${b.name} (opt.)` : b.name,
      String(visits.length),
      pct(rate),
      `${pct(band[0])}–${pct(band[1])}`,
      ok ? 'pass' : '**out**',
      avg((v) => v.attempts).toFixed(1),
      avg((v) => v.stars).toFixed(1),
      [
        avg((v) => v.owned.common!),
        avg((v) => v.owned.rare!),
        avg((v) => v.owned.epic!),
        avg((v) => v.owned.legendary!),
      ]
        .map((x) => x.toFixed(1))
        .join(' / '),
      avg((v) => v.avgLevel).toFixed(1),
      topGen,
    ]);
  }
  const stuck = runs.filter((r) => r.stuckAt);
  return (
    [
      `# Balance: progression (${today}, ${n} runs, ages 0–${lastAge})`,
      '',
      'A simulated player starts a new profile and clears the campaign in order with a simple policy: buy the first packs when an age opens (2 Recruit, 1 General), then after every battle upgrade the troops it fielded and buy a pack whenever it can (General Packs until it holds 3 of the age, then Recruit Packs); field the strongest army the slots and army limits allow; replay the weakest open battle when a star gate blocks it; play every optional battle once it opens. Win rates are the **first try** at each battle, with the collection it had then. Real meta code (shop, rewards, unlocks) and real battle rules.',
      '',
      '## Coins when each age opens (after the age-unlock bonus)',
      '',
      table(
        [
          'Age',
          'Runs that reached it',
          'Average coins',
          'Range',
          'Could afford 2 Recruit + 1 General',
        ],
        ageRows,
      ),
      '',
      '## Each battle',
      '',
      'Collection = owned troop cards of that age: Common / Rare / Epic / Legendary. General = the rarest named general of that age most runs held (generic = only the generic ones).',
      '',
      table(
        [
          'Battle',
          'Runs',
          'First-try wins',
          'Target',
          'Result',
          'Avg tries',
          'Best stars',
          'Collection C/R/E/L',
          'Avg level',
          'General',
        ],
        rows,
      ),
      '',
      stuck.length
        ? `**Stuck runs** (a main battle lost every try): ${stuck.map((r) => BATTLE_BY_ID[r.stuckAt!]?.name).join(', ')}.`
        : 'No run got stuck.',
      '',
      '## Outliers',
      '',
      outliers.length ? outliers.join('\n') : 'None.',
    ].join('\n') + '\n'
  );
}

function write(name: string, body: string): void {
  mkdirSync(outDir, { recursive: true });
  const file = join(outDir, `${today}-${name}.md`);
  writeFileSync(file, body);
  console.log(body);
  console.log(`Report written to ${file}`);
}

const started = Date.now();
if (mode === 'duel') write('duel', runDuel(seedList(opt('seeds', 40))));
else if (mode === 'aivsai') write('aivsai', runAiVsAi(seedList(opt('seeds', 100))));
else if (mode === 'progression') {
  write(
    'progression',
    progressionReport(
      runProgression({
        seeds: seedList(opt('seeds', 20)),
        tries: opt('tries', 3),
        lastAge: opt('age', 2),
      }),
      opt('age', 2),
    ),
  );
} else if (mode === 'scenario') {
  const id = args[1] && !args[1].startsWith('--') ? args[1] : 'all';
  const armyArg = optStr('army', 'test');
  const army = armyArg === 'identical' || armyArg === 'commons' ? armyArg : 'test';
  const level = args.includes('--level') ? opt('level', NaN) : undefined;
  if (level !== undefined && !(level >= 1)) throw new Error('--level needs a number of 1 or more');
  const suffix = army === 'test' && level === undefined ? '' : `-${army}-lv${level ?? 1}`;
  write(`scenario-${id}${suffix}`, runScenario(id, seedList(opt('seeds', 30)), { army, level }));
} else if (mode === 'cost')
  write(
    'cost',
    await runCost(
      seedList(opt('seeds', 15)),
      optStr('points', '600,900').split(',').map(Number),
      opt('jobs', 6),
    ),
  );
else {
  console.error(
    'Usage: npm run balance -- <duel|cost|scenario [battleId|ageN|all]|progression|aivsai> [--seeds N] [--points P[,P2]] [--out dir]',
  );
  process.exit(1);
}
console.log(`Done in ${((Date.now() - started) / 1000).toFixed(1)}s`);

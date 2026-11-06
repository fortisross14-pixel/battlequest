/**
 * Balance simulator. Usage: npm run balance -- <duel|cost|scenario [battleId|all]|aivsai> [--seeds N] [--points P] [--out dir]
 * Scenario options: --army test|identical (best N copies of one troop type), --level L (player unit level).
 * Uses the real src/core rules and a fixed seed list, so runs are reproducible.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ARCHETYPES, type ArchetypeId } from '../../src/content/units';
import {
  ARCHETYPE_IDS,
  costBattle,
  duel,
  DUEL_SETUPS,
  aiVsAi,
  scenarioBattle,
  type DuelSetup,
} from './sim';
import { BATTLE_BY_ID, CAMPAIGN, finalBattleOfAge } from '../../src/content/campaign/battles';
import type { ArmyChoice, CampaignBattle } from '../../src/content/campaign/types';
import { buildScenario } from '../../src/content/campaign/build';
import { sandboxScenario } from '../../src/content/battles/sandbox';
import type { Posture } from '../../src/ai/utility';
import type { Scenario, Side } from '../../src/core';
import { ERA_UNITS, ERA_UNIT_BY_ID } from '../../src/content/eraUnits';

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

function runCost(seeds: number[], points: number): string {
  const score: Record<string, number> = {};
  const games: Record<string, number> = {};
  const matrix: Record<string, Record<string, number>> = {};
  for (const a of ARCHETYPE_IDS) {
    score[a] = 0;
    games[a] = 0;
    matrix[a] = {};
  }
  for (let i = 0; i < ARCHETYPE_IDS.length; i++) {
    for (let j = i + 1; j < ARCHETYPE_IDS.length; j++) {
      const a = ARCHETYPE_IDS[i]!;
      const b = ARCHETYPE_IDS[j]!;
      let sa = 0;
      let n = 0;
      for (const seed of seeds) {
        for (const side of ['blue', 'red'] as const) {
          sa += costBattle(a, b, side, seed, points).score;
          n++;
        }
      }
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
    `Equal-points armies (${points} points) of a single archetype each, on open ground (16×10), ${seeds.length} seeds × both sides per pair, greedy script on both sides. Because the armies cost the same, the win rate is the value per point of cost. Median win rate: **${pct(median)}**. Target: within ±15% of the median.`,
    '',
    table(
      ['Archetype', 'Cost', 'Units', 'Win rate', 'vs median'],
      sorted.map((id) => [
        short(id),
        String(ARCHETYPES[id].stats.cost),
        String(Math.floor(points / ARCHETYPES[id].stats.cost)),
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
  /** 'test': the battle's test army. 'identical': the best army of N copies of one troop type. */
  army: 'test' | 'identical';
  level: number;
}

function playScenario(b: CampaignBattle, seeds: number[], army: ArmyChoice) {
  let wins = 0;
  let turns = 0;
  let lost = 0;
  for (const seed of seeds) {
    const r = scenarioBattle(b, seed, army);
    wins += r.won ? 1 : 0;
    turns += r.turns;
    lost += r.lostPct;
  }
  return { rate: wins / seeds.length, turns: turns / seeds.length, lost: lost / seeds.length };
}

/** Armies of N identical units, one per troop type a player could own by this battle's age. */
function identicalArmies(b: CampaignBattle, level: number): ArmyChoice[] {
  return ERA_UNITS.filter((u) => !u.enemyOnly && u.age <= Math.max(b.age, 0)).map((u) => ({
    units: Array.from({ length: b.maxUnits }, () => ({ type: u.id, level })),
    general: b.testArmy.general,
  }));
}

function runScenario(id: string, seeds: number[], opts: ScenarioOptions): string {
  const battles = id === 'all' ? CAMPAIGN : [BATTLE_BY_ID[id]!].filter(Boolean);
  const rows: string[][] = [];
  const outliers: string[] = [];
  for (const b of battles) {
    const candidates =
      opts.army === 'identical'
        ? identicalArmies(b, opts.level)
        : [
            {
              ...b.testArmy,
              units: b.testArmy.units.map((u) => ({ ...u, level: opts.level })),
            },
          ];
    let best = { rate: -1, turns: 0, lost: 0 };
    let bestArmy = candidates[0]!;
    for (const army of candidates) {
      const r = playScenario(b, seeds, army);
      if (r.rate > best.rate) {
        best = r;
        bestArmy = army;
      }
    }
    const rate = best.rate;
    const final = finalBattleOfAge(b.age)?.id === b.id && b.age > 0;
    const band: [number, number] = b.tutorial ? [0.6, 1] : final ? [0.3, 0.5] : [0.6, 0.8];
    const ok = rate >= band[0] && rate <= band[1];
    const target = `${pct(band[0])}–${pct(band[1])}`;
    if (!ok) outliers.push(`- **${b.name}**: ${pct(rate)} (target ${target})`);
    const armyText =
      opts.army === 'identical'
        ? `${b.maxUnits}× ${ERA_UNIT_BY_ID[bestArmy.units[0]!.type]?.name}`
        : `${bestArmy.units.length} test units`;
    rows.push([
      b.name,
      String(b.age),
      `${armyText} v ${b.enemy.length}`,
      pct(rate),
      target,
      ok ? 'pass' : '**out**',
      best.turns.toFixed(1),
      pct(best.lost),
    ]);
  }
  const armyDesc =
    opts.army === 'identical'
      ? 'the best army of N identical units (every troop type a player could own by that age is tried; the best one is shown)'
      : "the battle's test army";
  return (
    [
      `# Balance: scenario (${today}, army: ${opts.army}, level ${opts.level})`,
      '',
      `Each battle played ${seeds.length} times per army: the utility AI plays the player with ${armyDesc} at level ${opts.level}, and the enemy AI plays its scenario posture. Targets: early battles 60–80% player wins, age-final battles 30–50%.`,
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
        ],
        rows,
      ),
      '',
      '## Outliers',
      '',
      outliers.length ? outliers.join('\n') : 'None.',
    ].join('\n') + '\n'
  );
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
else if (mode === 'scenario') {
  const id = args[1] && !args[1].startsWith('--') ? args[1] : 'all';
  const army = optStr('army', 'test') === 'identical' ? 'identical' : 'test';
  const level = opt('level', 1);
  const suffix = army === 'test' && level === 1 ? '' : `-${army}-lv${level}`;
  write(`scenario-${id}${suffix}`, runScenario(id, seedList(opt('seeds', 30)), { army, level }));
} else if (mode === 'cost') write('cost', runCost(seedList(opt('seeds', 4)), opt('points', 600)));
else {
  console.error(
    'Usage: npm run balance -- <duel|cost|scenario [battleId|all]|aivsai> [--seeds N] [--points P] [--out dir]',
  );
  process.exit(1);
}
console.log(`Done in ${((Date.now() - started) / 1000).toFixed(1)}s`);

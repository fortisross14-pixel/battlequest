/**
 * Balance simulator. Usage: npm run balance -- <duel|cost> [--seeds N] [--points P] [--out dir]
 * Uses the real src/core rules and a fixed seed list, so runs are reproducible.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ARCHETYPES, type ArchetypeId } from '../../src/content/units';
import { ARCHETYPE_IDS, costBattle, duel, DUEL_SETUPS, type DuelSetup } from './sim';

const args = process.argv.slice(2);
const mode = args[0];
const opt = (name: string, def: number) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? Number(args[i + 1]) : def;
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

function write(name: string, body: string): void {
  mkdirSync(outDir, { recursive: true });
  const file = join(outDir, `${today}-${name}.md`);
  writeFileSync(file, body);
  console.log(body);
  console.log(`Report written to ${file}`);
}

const started = Date.now();
if (mode === 'duel') write('duel', runDuel(seedList(opt('seeds', 40))));
else if (mode === 'cost') write('cost', runCost(seedList(opt('seeds', 4)), opt('points', 600)));
else {
  console.error('Usage: npm run balance -- <duel|cost> [--seeds N] [--points P] [--out dir]');
  console.error('Modes terrain, scenario and general arrive with M3/M4.');
  process.exit(1);
}
console.log(`Done in ${((Date.now() - started) / 1000).toFixed(1)}s`);

/**
 * Child process for `balance-sim cost`: plays its share of archetype pairs and sends back
 * the blue-side-agnostic score of A for each pair (fork() inherits the tsx loader).
 */
import type { ArchetypeId } from '../../src/content/units';
import { costBattle } from './sim';

interface Job {
  pairs: [ArchetypeId, ArchetypeId][];
  seeds: number[];
  /** Army sizes to play; results are pooled. */
  points: number[];
}

process.on('message', (job: Job) => {
  const results: { a: ArchetypeId; b: ArchetypeId; score: number; games: number }[] = [];
  for (const [a, b] of job.pairs) {
    let score = 0;
    let games = 0;
    for (const pts of job.points) {
      for (const seed of job.seeds) {
        for (const side of ['blue', 'red'] as const) {
          score += costBattle(a, b, side, seed, pts).score;
          games++;
        }
      }
    }
    results.push({ a, b, score, games });
  }
  process.send!(results, () => process.exit(0));
});

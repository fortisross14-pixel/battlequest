import { applyCommand, type Command } from '../core/engine';
import type { BattleState } from '../core/types';
import type { DiagramArrow } from './ceremonies';

/**
 * The victory's battle diagram (motion skill): each unit's route through the battle, one
 * point per turn, as translucent blue and red arrows in a 100 × 60 box. It replays the
 * session's commands on a copy of the starting state; the battle itself is untouched.
 */
export function battleDiagram(start: BattleState, log: Command[], max = 14): DiagramArrow[] {
  const { width: W, height: H } = start.map;
  const traces = new Map<string, { side: 'blue' | 'red'; pts: { x: number; y: number }[] }>();
  const record = (s: BattleState) => {
    for (const u of s.units) {
      const t = traces.get(u.id) ?? { side: u.side, pts: [] };
      const last = t.pts.at(-1);
      if (!last || last.x !== u.x || last.y !== u.y) t.pts.push({ x: u.x, y: u.y });
      traces.set(u.id, t);
    }
  };
  let s = start;
  record(s);
  for (const cmd of log) {
    const res = applyCommand(s, cmd);
    if (!res.ok) continue;
    s = res.state;
    if (cmd.type === 'EndTurn') record(s);
  }
  record(s);
  const box = (p: { x: number; y: number }): [number, number] => [
    +(4 + ((p.x + 0.5) / W) * 92).toFixed(1),
    +(4 + ((p.y + 0.5) / H) * 52).toFixed(1),
  ];
  const travel = (pts: { x: number; y: number }[]) =>
    pts.slice(1).reduce((d, p, i) => d + Math.hypot(p.x - pts[i]!.x, p.y - pts[i]!.y), 0);
  return [...traces.values()]
    .filter((t) => t.pts.length > 1)
    .sort((a, b) => travel(b.pts) - travel(a.pts))
    .slice(0, max)
    .map((t) => ({ side: t.side, points: t.pts.map(box) }));
}

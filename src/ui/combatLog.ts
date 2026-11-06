import type { GameEvent } from '../core/events';
import { Cohesion, type BattleState, type Side, type Unit } from '../core/types';

/**
 * Battle readability (review 1 WP6): turns core events into plain sentences, so the player
 * can see why something happened. Pure functions: no DOM.
 */

const COHESION: Record<Cohesion, string> = {
  [Cohesion.Steady]: 'Steady',
  [Cohesion.Disrupted]: 'Disrupted',
  [Cohesion.Fragmented]: 'Fragmented',
  [Cohesion.Routed]: 'Routed',
};

export type LogKind =
  'action' | 'damage' | 'test' | 'evade' | 'rout' | 'general' | 'melee' | 'info';

export interface LogEntry {
  turn: number;
  side: Side;
  kind: LogKind;
  text: string;
}

export type SideNames = Record<Side, string>;

const pct = (x: number) => `${Math.round(x * 100)}%`;

function unitName(state: BattleState, id: string, names: SideNames): string {
  const u = state.units.find((x) => x.id === id);
  return u ? `${names[u.side]} ${u.type.name}` : id;
}

/** One melee exchange of the melee phase: both units and what each lost. */
export interface MeleeResult {
  a: string;
  b: string;
  lossA: number;
  lossB: number;
}

/** Groups the melee-phase damage events into fights (one per pair of units). */
export function meleeResults(events: GameEvent[]): MeleeResult[] {
  const out: MeleeResult[] = [];
  let inMelee = false;
  for (const e of events) {
    if (e.type === 'MeleePhase') inMelee = true;
    if (!inMelee) continue;
    if (e.type === 'SideTurnEnded') break;
    if (e.type !== 'DamageDealt' || e.kind !== 'melee') continue;
    const fight = out.find(
      (f) =>
        (f.a === e.attackerId && f.b === e.targetId) ||
        (f.a === e.targetId && f.b === e.attackerId),
    );
    if (!fight) out.push({ a: e.attackerId, b: e.targetId, lossA: 0, lossB: e.amount });
    else if (fight.b === e.targetId) fight.lossB += e.amount;
    else fight.lossA += e.amount;
  }
  return out;
}

/**
 * Plain-language log lines for a batch of events. `state` is the state after the events
 * (unit names never change, so it can name every unit involved).
 */
export function describeEvents(
  events: GameEvent[],
  state: BattleState,
  names: SideNames,
): LogEntry[] {
  const out: LogEntry[] = [];
  const name = (id: string) => unitName(state, id, names);
  const sideOf = (id: string): Side =>
    state.units.find((u) => u.id === id)?.side ?? state.activeSide;
  let turn = state.turn;
  let side = state.activeSide;
  const add = (kind: LogKind, text: string, s: Side = side) =>
    out.push({ turn, side: s, kind, text });

  for (let i = 0; i < events.length; i++) {
    const e = events[i]!;
    switch (e.type) {
      case 'SideTurnStarted':
        turn = e.turn;
        side = e.side;
        break;
      case 'ChargeDeclared':
        add('action', `${name(e.unitId)} charged ${name(e.targetId)}.`, sideOf(e.unitId));
        break;
      case 'ShotFired':
        add('action', `${name(e.unitId)} shot at ${name(e.targetId)}.`, sideOf(e.unitId));
        break;
      case 'DamageDealt':
        if (e.kind === 'melee') break; // summarised per fight
        add(
          'damage',
          `${e.kind === 'impact' ? 'Impact' : 'Hit'}: ${name(e.targetId)} lost ${e.amount}${e.arc !== 'front' ? ` (${e.arc} attack)` : ''}.`,
          sideOf(e.attackerId),
        );
        break;
      case 'EvadeRoll':
        add(
          'evade',
          `${name(e.unitId)} tried to evade: ${pct(e.chance)} chance, rolled ${Math.round(e.roll * 100)} → ${e.evaded ? 'slipped away' : 'caught'}.`,
          sideOf(e.unitId),
        );
        break;
      case 'CohesionTest': {
        // A test that could not fail is noise.
        if (e.chance <= 0 && !e.dropped) break;
        // The level it fell to comes in the next CohesionChanged event for that unit.
        const next = events
          .slice(i + 1)
          .find(
            (x): x is Extract<GameEvent, { type: 'CohesionChanged' }> =>
              x.type === 'CohesionChanged' && x.unitId === e.unitId,
          );
        add(
          'test',
          `${name(e.unitId)} tested cohesion: ${pct(e.chance)} chance to waver, rolled ${Math.round(e.roll * 100)} → ${e.dropped ? `failed${next ? `, now ${COHESION[next.to]}` : ''}` : 'held'}.`,
          sideOf(e.unitId),
        );
        break;
      }
      case 'UnitRouted':
        add(
          'rout',
          `${name(e.unitId)} routed (${e.cause === 'strength' ? 'too few men left' : 'its nerve broke'})!`,
          sideOf(e.unitId),
        );
        break;
      case 'UnitDestroyed':
        add(
          'rout',
          `${name(e.unitId)} was ${e.cause === 'caught' ? 'caught and cut down' : 'destroyed'}.`,
          sideOf(e.unitId),
        );
        break;
      case 'UnitFled':
        add('rout', `${name(e.unitId)} fled the field.`, sideOf(e.unitId));
        break;
      case 'UnitRallied':
        add('test', `${name(e.unitId)} rallied: now ${COHESION[e.to]}.`, sideOf(e.unitId));
        break;
      case 'SkillUsed':
        add('general', `${e.name}!`, sideOf(e.unitId));
        break;
      case 'GeneralLost':
        add('general', `${names[e.side]}'s general ${e.name} has fallen.`, e.side);
        break;
      case 'MeleePhase': {
        const fights = meleeResults(events.slice(i));
        add('melee', `Melee: ${fights.length} fight${fights.length === 1 ? '' : 's'}.`);
        for (const f of fights) {
          add('melee', `${name(f.a)} −${f.lossA} vs ${name(f.b)} −${f.lossB}.`);
        }
        break;
      }
      case 'BattleEnded':
        add('info', 'The battle is over.');
        break;
      default:
        break;
    }
  }
  return out;
}

export interface UnitSummary {
  id: string;
  side: Side;
  name: string;
  lost: number;
  fate: 'fighting' | 'routed' | 'destroyed' | 'fled';
}

export interface BattleSummary {
  units: UnitSummary[];
  /** The first rout of the battle, e.g. "Turn 3: Red Spearmen routed (its nerve broke)!". */
  turningPoint: string | null;
}

/** Losses per unit, who broke, and the turning point (the first rout). */
export function battleSummary(
  start: BattleState,
  end: BattleState,
  log: LogEntry[],
): BattleSummary {
  const fate = (u: Unit): UnitSummary['fate'] =>
    u.status === 'destroyed'
      ? 'destroyed'
      : u.status === 'fled'
        ? 'fled'
        : u.cohesion === Cohesion.Routed
          ? 'routed'
          : 'fighting';
  const units = end.units.map((u) => {
    const before = start.units.find((x) => x.id === u.id)?.strength ?? 100;
    return {
      id: u.id,
      side: u.side,
      name: u.type.name,
      lost: Math.max(0, Math.round(before - u.strength)),
      fate: fate(u),
    };
  });
  const first = log.find((l) => l.kind === 'rout');
  return { units, turningPoint: first ? `Turn ${first.turn}: ${first.text}` : null };
}

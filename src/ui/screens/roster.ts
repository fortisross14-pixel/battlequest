import { ERA_UNITS, eraUnitType, type EraUnitDef } from '../../content/eraUnits';
import { GENERALS } from '../../content/generals';
import { commandRadiusForRank, scaled } from '../../core/generals';
import type { UnitStats } from '../../core/types';
import {
  canUpgrade,
  ECONOMY,
  rankForXp,
  upgradeCost,
  upgradeUnit,
  xpForRank,
  type Profile,
} from '../../meta/profile';
import { el, TAG_TEXT } from '../hud';
import { unitIcon } from '../icons';
import { button, html, initials, levelBadge, RARITY_LABEL, shell, type AppApi } from './common';

const fmt = (v: number) => String(+v.toFixed(1));

/** Stats that levels raise, for the "Mel 5 → 5.3" preview. */
const LEVELLED: [keyof UnitStats, string][] = [
  ['melee', 'Mel'],
  ['impact', 'Imp'],
  ['ranged', 'Rng'],
  ['morale', 'Mor'],
];

function statRow(s: UnitStats): HTMLElement {
  const cells: [string, string][] = [
    ['MP', fmt(s.mp)],
    ['Mel', fmt(s.melee)],
    ['Imp', fmt(s.impact)],
    ['Rng', s.range > 0 ? `${fmt(s.ranged)}(${s.range})` : '—'],
    ['Arm', fmt(s.armor)],
    ['Mor', fmt(s.morale)],
    ['Pts', fmt(s.cost)],
  ];
  return el(
    'div',
    { class: 'stat-row' },
    ...cells.map(([k, v]) => el('span', {}, el('small', {}, k), v)),
  );
}

/** Upgradable first, then owned, then locked; inside each group by age and name. */
function troopOrder(p: Profile, a: EraUnitDef, c: EraUnitDef): number {
  const group = (d: EraUnitDef) => (canUpgrade(p, d.id).ok ? 0 : p.units[d.id] ? 1 : 2);
  return group(a) - group(c) || a.age - c.age || a.name.localeCompare(c.name);
}

function upgradeParts(app: AppApi, def: EraUnitDef): HTMLElement[] {
  const p = app.profile;
  const owned = p.units[def.id]!;
  const level = owned.level;
  const cost = upgradeCost(def.id, level);
  if (!cost) {
    return [
      el(
        'p',
        { class: 'level' },
        `Max level. Extra cards turn into ${ECONOMY.maxLevelCardCoins} coins each.`,
      ),
    ];
  }
  const check = canUpgrade(p, def.id);
  const pct = Math.min(100, Math.round((100 * owned.cards) / cost.cards));
  const now = eraUnitType(def.id, level).stats;
  const next = eraUnitType(def.id, level + 1).stats;
  const gains = LEVELLED.filter(([k]) => next[k] !== now[k])
    .map(([k, label]) => `${label} ${fmt(now[k])} → ${fmt(next[k])}`)
    .join(' · ');
  let label = `Upgrade to Lv${level + 1} · ● ${cost.coins}`;
  if (!check.ok && check.reason === 'cards') {
    label = `Need ${check.missing} more card${check.missing === 1 ? '' : 's'}`;
  } else if (!check.ok && check.reason === 'coins') {
    label = `Need ${check.missing} more coins`;
  }
  const up = button(
    label,
    () => {
      if (!upgradeUnit(p, def.id)) return;
      app.save();
      app.roster('troops');
    },
    `btn upgrade ${check.ok ? 'primary' : ''}`,
  );
  up.disabled = !check.ok;
  return [
    el(
      'div',
      { class: 'cards-line' },
      el('span', {}, `Cards ${owned.cards}/${cost.cards}`),
      el('span', { class: 'cost' }, `Upgrade ● ${cost.coins}`),
    ),
    el(
      'div',
      { class: `bar ${owned.cards >= cost.cards ? 'full' : ''}` },
      el('i', { style: `width:${pct}%` }),
    ),
    el('p', { class: 'upgrade-preview' }, `Lv${level + 1}: ${gains}`),
    up,
  ];
}

function troopCard(app: AppApi, def: EraUnitDef): HTMLElement {
  const p = app.profile;
  const owned = p.units[def.id];
  const t = eraUnitType(def.id, owned?.level ?? 1);
  const head = el(
    'div',
    { class: 'unit-head' },
    html(unitIcon(t.symbol, 'blue', 48)),
    el(
      'div',
      {},
      el('b', {}, t.name),
      el(
        'small',
        {},
        `${RARITY_LABEL[def.rarity]} · Age ${def.age} · ${def.archetype.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
      ),
    ),
    owned ? levelBadge(owned.level, true) : '',
  );
  const ready = !!owned && canUpgrade(p, def.id).ok;
  return el(
    'div',
    { class: `unit-card ${def.rarity} ${owned ? '' : 'unowned'} ${ready ? 'ready' : ''}` },
    head,
    ...(owned ? upgradeParts(app, def) : [el('p', { class: 'level' }, '0 cards — find in packs')]),
    statRow(t.stats),
    el('p', { class: 'flavor' }, def.flavor),
    t.tags.length
      ? el('ul', { class: 'tags' }, ...t.tags.map((tag) => el('li', {}, TAG_TEXT[tag])))
      : '',
  );
}

function generalCards(p: Profile): HTMLElement[] {
  return GENERALS.filter((g) => g.inPacks).map((g) => {
    const owned = p.generals[g.id];
    if (!owned) {
      return el(
        'div',
        { class: `gen-card ${g.rarity} unowned` },
        el('span', { class: 'medallion' }, '?'),
        el('b', {}, '???'),
        el('small', {}, `${RARITY_LABEL[g.rarity]} general — find in General Packs`),
      );
    }
    const rank = rankForXp(owned.xp);
    const next = rank < ECONOMY.maxRank ? xpForRank(rank + 1) : null;
    const prev = xpForRank(rank);
    const pctTo = next ? Math.round((100 * (owned.xp - prev)) / (next - prev)) : 100;
    return el(
      'div',
      { class: `gen-card ${g.rarity}` },
      el('span', { class: 'medallion' }, initials(g.name)),
      el('b', {}, g.name),
      el(
        'small',
        {},
        `${RARITY_LABEL[g.rarity]} · ${g.era} · Rank ${rank} · command radius ${commandRadiusForRank(rank)}`,
      ),
      owned.resting
        ? el('p', { class: 'warn' }, 'Resting after falling in battle: unavailable for one battle.')
        : '',
      el('div', { class: 'bar' }, el('i', { style: `width:${pctTo}%` })),
      el(
        'small',
        {},
        next ? `${owned.xp} / ${next} XP to rank ${rank + 1}` : `${owned.xp} XP · max rank`,
      ),
      el('p', {}, el('b', {}, 'Trait: '), g.traitText),
      ...g.skills.map((s) =>
        el(
          'p',
          {},
          el('b', {}, `${s.name}: `),
          `${s.description} Cooldown ${Math.round(scaled(s.cooldown, rank))} turns.${rank < s.unlockRank ? ` Unlocks at rank ${s.unlockRank}.` : ''}`,
        ),
      ),
    );
  });
}

export function rosterScreen(app: AppApi, tab: 'troops' | 'generals'): HTMLElement {
  const p = app.profile;
  const tabs = el(
    'div',
    { class: 'tabs', role: 'tablist' },
    button('Troops', () => app.roster('troops'), `tab ${tab === 'troops' ? 'on' : ''}`),
    button('Generals', () => app.roster('generals'), `tab ${tab === 'generals' ? 'on' : ''}`),
  );
  const troops = ERA_UNITS.filter(
    (u) => !u.enemyOnly && (u.age <= p.unlockedAge || p.units[u.id]),
  ).sort((a, c) => troopOrder(p, a, c));
  const body =
    tab === 'troops'
      ? el('div', { class: 'card-grid' }, ...troops.map((def) => troopCard(app, def)))
      : el('div', { class: 'card-grid' }, ...generalCards(p));
  return shell(app, 'Army', () => app.menu(), tabs, body);
}

import { ERA_UNITS, eraUnitType, type EraUnitDef } from '../../content/eraUnits';
import { GENERALS } from '../../content/generals';
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
import { el } from '../hud';
import {
  generalDetails,
  generalHeader,
  lockedCard,
  troopDetails,
  troopHeader,
  withDetails,
} from './cards';
import { button, shell, type AppApi } from './common';

const fmt = (v: number) => String(+v.toFixed(1));

/** Stats that levels raise, for the "Mel 5 → 5.3" preview. */
const LEVELLED: [keyof UnitStats, string][] = [
  ['melee', 'Mel'],
  ['impact', 'Imp'],
  ['ranged', 'Rng'],
  ['morale', 'Mor'],
];

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
  if (!owned) return lockedCard('Troop not found yet', 'Find it in packs or battle rewards.');
  const ready = canUpgrade(p, def.id).ok;
  const card = el(
    'div',
    { class: `mini-card ${def.rarity} ${ready ? 'ready' : ''}` },
    troopHeader(def, owned.level),
    ...upgradeParts(app, def),
  );
  return withDetails(card, troopDetails(def, owned.level));
}

function generalCards(p: Profile): HTMLElement[] {
  return GENERALS.filter((g) => g.inPacks).map((g) => {
    const owned = p.generals[g.id];
    if (!owned) return lockedCard('General not found yet', 'Find generals in General Packs.');
    const rank = rankForXp(owned.xp);
    const next = rank < ECONOMY.maxRank ? xpForRank(rank + 1) : null;
    const prev = xpForRank(rank);
    const pctTo = next ? Math.round((100 * (owned.xp - prev)) / (next - prev)) : 100;
    const card = el(
      'div',
      { class: `mini-card ${g.rarity}` },
      generalHeader(g, rank),
      owned.resting ? el('small', { class: 'warn' }, 'Resting: misses the next battle.') : '',
      el('div', { class: 'bar' }, el('i', { style: `width:${pctTo}%` })),
      el(
        'small',
        {},
        next ? `${owned.xp} / ${next} XP to rank ${rank + 1}` : `${owned.xp} XP · max rank`,
      ),
    );
    return withDetails(card, generalDetails(g, rank));
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
      ? el('div', { class: 'mini-grid wide' }, ...troops.map((def) => troopCard(app, def)))
      : el('div', { class: 'mini-grid wide' }, ...generalCards(p));
  return shell(app, 'Army', () => app.back(), tabs, body);
}

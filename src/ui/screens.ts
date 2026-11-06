import { AGES, CAMPAIGN, battlesOfAge } from '../content/campaign/battles';
import { armyCost } from '../content/campaign/build';
import type { ArmyChoice, CampaignBattle } from '../content/campaign/types';
import { ERA_UNITS, ERA_UNIT_BY_ID, eraUnitType } from '../content/eraUnits';
import { GENERALS, GENERAL_BY_ID } from '../content/generals';
import { commandRadiusForRank, scaled } from '../core/generals';
import { isBattleUnlocked, nextBattle } from '../meta/campaign';
import { rankForXp, xpForRank, ECONOMY, type Profile } from '../meta/profile';
import type { BattleOutcome, Rewards } from '../meta/rewards';
import {
  buyDaily,
  buyPack,
  dailyOffer,
  packPrice,
  SHOP,
  type PackCard,
  type PackKind,
} from '../meta/shop';
import { el, TAG_TEXT } from './hud';
import { stars, unitIcon } from './icons';

/** What the screens need from the app. */
export interface AppApi {
  profile: Profile;
  save(): void;
  show(screen: HTMLElement): void;
  menu(): void;
  campaign(): void;
  briefing(b: CampaignBattle): void;
  deploy(b: CampaignBattle, army: ArmyChoice): void;
  shop(): void;
  roster(tab?: 'troops' | 'generals'): void;
  sandbox(): void;
  reset(): void;
}

const RARITY_LABEL = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
} as const;

function html(markup: string): HTMLElement {
  const t = document.createElement('template');
  t.innerHTML = markup.trim();
  return t.content.firstElementChild as HTMLElement;
}

function button(label: string, onClick: () => void, cls = 'btn'): HTMLButtonElement {
  const b = el('button', { class: cls, type: 'button' }, label);
  b.onclick = onClick;
  return b;
}

function coins(p: Profile): HTMLElement {
  return el('span', { class: 'coins', 'aria-label': `${p.coins} coins` }, `● ${p.coins}`);
}

/** Header with a back button, a title and the coin count. */
function shell(
  app: AppApi,
  title: string,
  back: (() => void) | null,
  ...body: HTMLElement[]
): HTMLElement {
  const head = el(
    'header',
    { class: 'screen-head' },
    back ? button('‹ Back', back) : el('span', {}),
    el('h1', {}, title),
    coins(app.profile),
  );
  return el('div', { class: 'screen' }, head, el('main', { class: 'screen-body' }, ...body));
}

// ---------- Main menu ----------

export function menuScreen(app: AppApi): HTMLElement {
  const p = app.profile;
  const next = nextBattle(p);
  const totalStars = Object.values(p.battles).reduce((s, b) => s + b.stars, 0);
  const main = el(
    'div',
    { class: 'menu' },
    el('h1', { class: 'logo' }, 'BattleQuest'),
    el('p', { class: 'tagline' }, 'Through the Ages'),
    next
      ? button(
          `Continue: ${next.name} (${next.year}) ›`,
          () => app.briefing(next),
          'btn primary big',
        )
      : el('p', {}, 'Every battle won — replay them for more stars.'),
    el(
      'div',
      { class: 'menu-grid' },
      button('Campaign', () => app.campaign(), 'btn big'),
      button('Army', () => app.roster('troops'), 'btn big'),
      button('Shop', () => app.shop(), 'btn big'),
      button('Hot-seat battle', () => app.sandbox(), 'btn big'),
    ),
    el(
      'p',
      { class: 'menu-stats' },
      coins(p),
      ` · ${totalStars} ★ · ${Object.keys(p.units).length} troop types · ${Object.keys(p.generals).length} generals`,
    ),
    button(
      'Reset progress',
      () => {
        if (window.confirm('Delete all progress and start again?')) app.reset();
      },
      'btn small',
    ),
  );
  return el('div', { class: 'screen menu-screen' }, main);
}

// ---------- Campaign map ----------

export function campaignScreen(app: AppApi): HTMLElement {
  const p = app.profile;
  const ages = AGES.map((age) => {
    const locked = age.id > p.unlockedAge;
    const cards = battlesOfAge(age.id).map((b) => {
      const open = isBattleUnlocked(p, b);
      const rec = p.battles[b.id];
      const card = el(
        'button',
        { class: `battle-card ${open ? '' : 'locked'} ${rec?.wins ? 'won' : ''}`, type: 'button' },
        el('span', { class: 'year' }, b.year),
        el('b', {}, b.name),
        el(
          'span',
          { class: 'size' },
          `${b.fixedArmy ? 'Fixed army' : `Up to ${b.maxUnits} units`} vs ${b.enemy.length}`,
        ),
        el('span', { class: 'stars' }, open ? stars(rec?.stars ?? 0) : '🔒'),
        el('small', {}, b.problem),
      );
      card.disabled = !open;
      card.onclick = () => app.briefing(b);
      return card;
    });
    return el(
      'section',
      { class: `age ${locked ? 'locked' : ''}` },
      el('h2', {}, `${age.id === 0 ? '' : `Age ${age.id} · `}${age.name}`),
      locked
        ? el('p', { class: 'hint' }, 'Win the final battle of the previous age to unlock.')
        : '',
      el('div', { class: 'battle-list' }, ...cards),
    );
  });
  return shell(app, 'Campaign', () => app.menu(), ...ages);
}

// ---------- Briefing and army builder ----------

export function armyPower(units: { type: string; level?: number }[]): number {
  return Math.round(
    units.reduce(
      (s, u) => s + eraUnitType(u.type, u.level).stats.cost * (1 + 0.05 * ((u.level ?? 1) - 1)),
      0,
    ),
  );
}

export function briefingScreen(app: AppApi, b: CampaignBattle): HTMLElement {
  const p = app.profile;
  const enemyPower = armyPower(b.enemy.map((e) => ({ type: e.type, level: e.level })));
  const remembered = p.lastArmy[b.id];
  const usable = (g: string) => p.generals[g] && !p.generals[g]!.resting;
  const army: ArmyChoice = structuredClone(
    b.fixedArmy ??
      (remembered && remembered.units.every((u) => p.units[u.type])
        ? remembered
        : { units: [], general: undefined }),
  );
  if (!b.fixedArmy) {
    // Refresh levels from the roster; drop a general who is resting.
    for (const u of army.units) u.level = p.units[u.type]?.level ?? 1;
    if (army.general && !usable(army.general.id)) army.general = undefined;
    if (!army.general) {
      const first = Object.keys(p.generals).find(usable);
      if (first) army.general = { id: first, rank: rankForXp(p.generals[first]!.xp), unitIndex: 0 };
    }
  }

  const info = el(
    'section',
    { class: 'briefing' },
    el('p', { class: 'year' }, `${b.year} · ${AGES.find((a) => a.id === b.age)?.name ?? ''}`),
    el('p', { class: 'problem' }, b.problem),
    el('p', {}, b.briefing),
    el(
      'ul',
      { class: 'facts' },
      el(
        'li',
        {},
        b.holdOut
          ? `Objective: hold out until the end of turn ${b.turnLimit}.`
          : `Objective: break the enemy army within ${b.turnLimit} turns.`,
      ),
      el('li', {}, `★★★: win losing under 30% of your army, and ${b.bonusText.toLowerCase()}`),
      el(
        'li',
        {},
        `Enemy: ${b.enemy.length} units${b.enemyGeneral ? `, led by ${GENERAL_BY_ID[b.enemyGeneral.id]?.name}` : ''}. Power ${enemyPower}.`,
      ),
    ),
    el(
      'div',
      { class: 'enemy-list' },
      ...b.enemy.map((e) => {
        const t = eraUnitType(e.type, e.level);
        return html(
          `<span class="mini">${unitIcon(t.symbol, 'red', 34)}<span>${t.name}${e.level && e.level > 1 ? ` Lv${e.level}` : ''}</span></span>`,
        );
      }),
    ),
  );

  const builder = el('section', { class: 'builder' });
  const deployBtn = button(
    'Deploy ›',
    () => {
      if (!b.fixedArmy) {
        p.lastArmy[b.id] = structuredClone(army);
        app.save();
      }
      app.deploy(b, army);
    },
    'btn primary big',
  );

  const render = () => {
    const cost = armyCost(army);
    const full = army.units.length >= b.maxUnits;
    const power = armyPower(army.units);
    const rows = army.units.map((u, i) => {
      const t = eraUnitType(u.type, u.level);
      const isGen = army.general?.unitIndex === i;
      const gen = button(
        isGen ? '★' : '☆',
        () => {
          if (army.general) army.general.unitIndex = i;
          render();
        },
        `btn icon ${isGen ? 'gold' : ''}`,
      );
      gen.setAttribute('aria-label', 'General rides with this unit');
      gen.disabled = !army.general || !!b.fixedArmy;
      const remove = button(
        '✕',
        () => {
          army.units.splice(i, 1);
          if (army.general && army.general.unitIndex >= army.units.length)
            army.general.unitIndex = 0;
          render();
        },
        'btn icon',
      );
      remove.setAttribute('aria-label', `Remove ${t.name}`);
      remove.disabled = !!b.fixedArmy;
      return el(
        'div',
        { class: 'army-row' },
        html(unitIcon(t.symbol, 'blue', 34)),
        el('span', {}, `${t.name}${u.level && u.level > 1 ? ` Lv${u.level}` : ''}`),
        el('small', {}, `${t.stats.cost} pts`),
        gen,
        remove,
      );
    });

    const generals = b.fixedArmy
      ? [
          el(
            'p',
            { class: 'hint' },
            `Historical army: ${GENERAL_BY_ID[army.general!.id]?.name} commands. This battle's army is fixed.`,
          ),
        ]
      : [
          el(
            'div',
            { class: 'chips' },
            ...Object.keys(p.generals).map((id) => {
              const g = GENERAL_BY_ID[id]!;
              const owned = p.generals[id]!;
              const rank = rankForXp(owned.xp);
              const chip = button(
                `${g.name} · R${rank}${owned.resting ? ' (resting)' : ''}`,
                () => {
                  army.general = {
                    id,
                    rank,
                    unitIndex: Math.min(
                      army.general?.unitIndex ?? 0,
                      Math.max(0, army.units.length - 1),
                    ),
                  };
                  render();
                },
                `chip-btn ${army.general?.id === id ? 'on' : ''} ${g.rarity}`,
              );
              chip.disabled = owned.resting;
              return chip;
            }),
            button(
              'No general',
              () => {
                army.general = undefined;
                render();
              },
              `chip-btn ${!army.general ? 'on' : ''}`,
            ),
          ),
        ];

    const troops = b.fixedArmy
      ? []
      : Object.entries(p.units)
          .map(([id, owned]) => ({
            id,
            owned,
            t: eraUnitType(id, owned.level),
            def: ERA_UNIT_BY_ID[id]!,
          }))
          .sort((a, c) => a.def.age - c.def.age || a.t.stats.cost - c.t.stats.cost)
          .map(({ id, owned, t }) => {
            const add = button(
              `+ ${t.name}${owned.level > 1 ? ` Lv${owned.level}` : ''} · ${t.stats.cost}`,
              () => {
                army.units.push({ type: id, level: owned.level });
                render();
              },
              'btn troop',
            );
            add.prepend(html(unitIcon(t.symbol, 'blue', 28)));
            add.disabled = full || cost + t.stats.cost > b.budget;
            return add;
          });

    deployBtn.disabled = army.units.length === 0 || cost > b.budget;
    builder.replaceChildren(
      el('h2', {}, 'Your army'),
      el(
        'div',
        { class: 'budget' },
        el('span', {}, `Points ${cost} / ${b.budget}`),
        el('span', {}, `Units ${army.units.length} / ${b.maxUnits}`),
        el(
          'span',
          { class: power >= enemyPower ? 'good' : 'warn' },
          `Power ${power} vs ${enemyPower}`,
        ),
      ),
      el(
        'div',
        { class: 'bar' },
        el('i', { style: `width:${Math.min(100, (100 * cost) / b.budget)}%` }),
      ),
      ...rows,
      army.units.length === 0
        ? el('p', { class: 'hint' }, 'Add troops from your roster below.')
        : '',
      el('h3', {}, 'General'),
      ...generals,
      troops.length ? el('h3', {}, 'Add troops') : '',
      troops.length ? el('div', { class: 'troops' }, ...troops) : '',
      el('div', { class: 'row' }, deployBtn),
    );
  };
  render();
  return shell(app, b.name, () => app.campaign(), el('div', { class: 'two-col' }, info, builder));
}

// ---------- Results ----------

export function resultsScreen(
  app: AppApi,
  b: CampaignBattle,
  o: BattleOutcome,
  r: Rewards,
  retry: () => void,
): HTMLElement {
  const next = nextBattle(app.profile);
  const g = r.generalId ? GENERAL_BY_ID[r.generalId] : undefined;
  const lines = [
    `Coins: +${r.coins}${r.firstWin ? ' (first victory)' : o.won ? ' (replay)' : ''}`,
    g
      ? `${g.name}: +${r.xp} XP${r.rankAfter > r.rankBefore ? ` — promoted to rank ${r.rankAfter}!` : ''}`
      : null,
    o.generalLost && g ? `${g.name} fell in battle and will rest for the next battle.` : null,
    r.newStars > 0 ? `New stars: +${r.newStars}` : null,
    r.unlockedAge !== null
      ? `New age unlocked: ${AGES.find((a) => a.id === r.unlockedAge)?.name}! Free starter troops added.`
      : null,
    o.won
      ? `Losses: ${Math.round(o.lostFraction * 100)}% of your army. Bonus (${b.bonusText.replace(/\.$/, '')}): ${o.bonusMet ? 'done' : 'missed'}.`
      : null,
  ].filter(Boolean) as string[];
  const box = el(
    'div',
    { class: `results ${o.won ? 'win' : 'loss'}` },
    el('h1', {}, o.won ? 'Victory' : 'Defeat'),
    el('p', { class: 'big-stars', 'aria-label': `${o.stars} stars` }, stars(o.stars)),
    el('ul', {}, ...lines.map((l) => el('li', {}, l))),
    el(
      'div',
      { class: 'row center' },
      button('Retry', retry),
      button('Campaign', () => app.campaign()),
      next && next.id !== b.id
        ? button(`Next: ${next.name} ›`, () => app.briefing(next), 'btn primary')
        : button('Menu', () => app.menu(), 'btn primary'),
    ),
  );
  return shell(app, b.name, null, box);
}

// ---------- Shop ----------

function cardView(c: PackCard): HTMLElement {
  if (c.kind === 'unit') {
    const t = eraUnitType(c.id);
    const note = c.isNew ? 'New!' : c.levelUp ? 'Level up!' : 'Duplicate (+1 toward next level)';
    return html(
      `<div class="reveal ${c.rarity}">${unitIcon(t.symbol, 'blue', 56)}<b>${t.name}</b><small>${RARITY_LABEL[c.rarity]}</small><span>${note}</span></div>`,
    );
  }
  const g = GENERAL_BY_ID[c.id]!;
  const note = c.isNew ? 'New general!' : `Duplicate: Medal +${c.medalXp} XP`;
  return html(
    `<div class="reveal ${c.rarity}"><span class="medallion">${initials(g.name)}</span><b>${g.name}</b><small>${RARITY_LABEL[c.rarity]}</small><span>${note}</span></div>`,
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => /^[A-Z]/.test(w))
    .map((w) => w[0])
    .join('')
    .slice(0, 2);
}

export function shopScreen(app: AppApi, revealed: PackCard[] | null = null): HTMLElement {
  const p = app.profile;
  const day = new Date().toISOString().slice(0, 10);
  const offer = dailyOffer(p, day);
  const pack = (kind: PackKind, title: string, desc: string) => {
    const price = packPrice(kind);
    const buy = button(
      `Buy · ● ${price}`,
      () => {
        const cards = buyPack(p, kind);
        if (!cards) return;
        app.save();
        app.show(shopScreen(app, cards));
      },
      'btn primary',
    );
    buy.disabled = p.coins < price;
    return el('div', { class: `pack ${kind}` }, el('h3', {}, title), el('p', {}, desc), buy);
  };
  const ot = eraUnitType(offer.unit.id);
  const dailyBtn = button(
    offer.bought ? 'Bought today' : `Buy · ● ${offer.price}`,
    () => {
      const c = buyDaily(p, day);
      if (!c) return;
      app.save();
      app.show(shopScreen(app, [c]));
    },
    'btn primary',
  );
  dailyBtn.disabled = offer.bought || p.coins < offer.price;
  const pityLeft = SHOP.generalPity - p.generalPity;
  const packs = el(
    'div',
    { class: 'packs' },
    pack(
      'recruit',
      'Recruit Pack',
      '3 troop cards from your unlocked ages, mostly the newest one.',
    ),
    pack('veteran', 'Veteran Pack', '3 troop cards, at least one Rare or better.'),
    pack(
      'general',
      'General Pack',
      `1 general. A duplicate becomes a ${ECONOMY.medalXp} XP medal. Epic or better guaranteed within ${pityLeft} pack${pityLeft === 1 ? '' : 's'}.`,
    ),
    el(
      'div',
      { class: 'pack daily' },
      el('h3', {}, 'Daily offer'),
      html(
        `<p class="offer">${unitIcon(ot.symbol, 'blue', 40)} <span><b>${ot.name}</b><br><small>${RARITY_LABEL[offer.unit.rarity]} · no randomness</small></span></p>`,
      ),
      dailyBtn,
    ),
  );
  const reveal = revealed
    ? el(
        'section',
        { class: 'reveal-box' },
        el('h2', {}, 'You got'),
        el('div', { class: 'reveal-row' }, ...revealed.map(cardView)),
        button('Show in Army', () =>
          app.roster(revealed[0]!.kind === 'general' ? 'generals' : 'troops'),
        ),
      )
    : el('span', {});
  return shell(app, 'Shop', () => app.menu(), reveal, packs);
}

// ---------- Roster: troops and generals ----------

export function rosterScreen(app: AppApi, tab: 'troops' | 'generals'): HTMLElement {
  const p = app.profile;
  const tabs = el(
    'div',
    { class: 'tabs', role: 'tablist' },
    button('Troops', () => app.roster('troops'), `tab ${tab === 'troops' ? 'on' : ''}`),
    button('Generals', () => app.roster('generals'), `tab ${tab === 'generals' ? 'on' : ''}`),
  );
  let body: HTMLElement;
  if (tab === 'troops') {
    const visible = ERA_UNITS.filter((u) => u.age <= p.unlockedAge || p.units[u.id]);
    const cards = visible.map((def) => {
      const owned = p.units[def.id];
      const t = eraUnitType(def.id, owned?.level ?? 1);
      const s = t.stats;
      const need =
        owned && owned.level < ECONOMY.maxLevel ? ECONOMY.dupesPerLevel[owned.level - 1]! : 0;
      const card = el(
        'div',
        { class: `unit-card ${def.rarity} ${owned ? '' : 'unowned'}` },
        html(
          `<div class="unit-head">${unitIcon(t.symbol, 'blue', 48)}<div><b>${t.name}</b><small>${RARITY_LABEL[def.rarity]} · Age ${def.age} · ${ERA_UNIT_BY_ID[def.id] ? t.archetype.replace(/([A-Z])/g, ' $1').toLowerCase() : ''}</small></div></div>`,
        ),
        el(
          'p',
          { class: 'level' },
          owned
            ? `Level ${owned.level}${need ? ` · ${owned.dupes}/${need} to Lv${owned.level + 1}` : ' (max)'}`
            : 'Not recruited yet — find it in packs',
        ),
        el(
          'div',
          { class: 'stat-row' },
          ...(
            [
              ['MP', s.mp],
              ['Mel', s.melee],
              ['Imp', s.impact],
              ['Rng', s.range > 0 ? `${+s.ranged.toFixed(1)}(${s.range})` : '—'],
              ['Arm', s.armor],
              ['Mor', s.morale],
              ['Pts', s.cost],
            ] as [string, number | string][]
          ).map(([k, v]) =>
            el('span', {}, el('small', {}, k), typeof v === 'number' ? String(+v.toFixed(1)) : v),
          ),
        ),
        el('p', { class: 'flavor' }, def.flavor),
        t.tags.length
          ? el('ul', { class: 'tags' }, ...t.tags.map((tag) => el('li', {}, TAG_TEXT[tag])))
          : '',
      );
      return card;
    });
    body = el('div', { class: 'card-grid' }, ...cards);
  } else {
    const cards = GENERALS.filter((g) => g.inPacks).map((g) => {
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
          ? el(
              'p',
              { class: 'warn' },
              'Resting after falling in battle: unavailable for one battle.',
            )
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
    body = el('div', { class: 'card-grid' }, ...cards);
  }
  return shell(app, 'Army', () => app.menu(), tabs, body);
}

export { CAMPAIGN };

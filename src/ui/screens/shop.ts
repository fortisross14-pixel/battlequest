import { AGE_BY_ID } from '../../content/campaign/ages';
import { eraUnitType, type EraUnitDef } from '../../content/eraUnits';
import type { Rarity } from '../../core/generals';
import { CARDS, RARITY_RANK, troopPool } from '../../meta/cards';
import { canUpgrade, ECONOMY } from '../../meta/profile';
import {
  buyDaily,
  buyPack,
  dailyOffer,
  firstPackPending,
  generalPool,
  packPrice,
  shopAges,
  SHOP,
  type PackCard,
  type PackKind,
} from '../../meta/shop';
import { packOpening } from '../ceremonies';
import { ageEmblem } from '../emblems';
import { el } from '../hud';
import { unitIcon } from '../icons';
import { gsap, reducedMotion } from '../motion';
import { PACK_ART, packArt } from '../packArt';
import { generalHeader, troopDetails, troopHeader } from './cards';
import { button, html, RARITY_LABEL, shell, type AppApi } from './common';

/** The age tab last chosen in the shop (session only). */
let lastAge: number | null = null;

const RARITY_COLOR: Record<Rarity, string> = {
  common: '#8a8a8a',
  uncommon: '#4f8a4a',
  rare: '#3f7cc2',
  epic: '#7b4fb0',
  legendary: '#c99a1e',
};

const pct = (x: number) => (x >= 0.095 ? `${Math.round(x * 100)}%` : `${+(x * 100).toFixed(1)}%`);

/** Chance per card of each rarity, from the real draw weights. */
function troopOdds(age: number): [Rarity, number][] {
  const pool = troopPool(age);
  const total = pool.reduce((s, u) => s + (CARDS.packWeight[u.rarity] ?? 1), 0);
  const by = new Map<Rarity, number>();
  for (const u of pool)
    by.set(u.rarity, (by.get(u.rarity) ?? 0) + (CARDS.packWeight[u.rarity] ?? 1));
  return [...by.entries()]
    .sort((a, b) => RARITY_RANK[a[0]] - RARITY_RANK[b[0]])
    .map(([r, w]) => [r, w / total]);
}

function generalOdds(age: number): [Rarity, number][] {
  const pool = generalPool(age);
  const w = (r: Rarity) => Math.max(1, SHOP.generalRarityWeight[r]);
  const total = pool.reduce((s, g) => s + w(g.rarity), 0);
  const by = new Map<Rarity, number>();
  for (const g of pool) by.set(g.rarity, (by.get(g.rarity) ?? 0) + w(g.rarity));
  return [...by.entries()]
    .sort((a, b) => RARITY_RANK[a[0]] - RARITY_RANK[b[0]])
    .map(([r, x]) => [r, x / total]);
}

/** A sheet over the shop (the same backdrop as the slot picker). */
function sheet(title: string, ...body: (HTMLElement | string)[]): void {
  const close = () => {
    if (reducedMotion()) {
      back.remove();
      return;
    }
    gsap.to(back, { opacity: 0, duration: 0.16, onComplete: () => back.remove() });
  };
  const back = el(
    'div',
    { class: 'picker-backdrop', role: 'dialog', 'aria-label': title },
    el(
      'div',
      { class: 'picker pack-details' },
      el('h2', {}, title),
      ...body,
      el('div', { class: 'row' }, button('Close', close, 'btn primary')),
    ),
  );
  back.addEventListener('click', (e) => {
    if (e.target === back) close();
  });
  document.body.append(back);
  if (!reducedMotion()) {
    gsap.fromTo(back, { opacity: 0 }, { opacity: 1, duration: 0.16 });
    gsap.fromTo(back.firstElementChild, { y: 14 }, { y: 0, duration: 0.3, ease: 'bq.out' });
  }
}

function oddsTable(odds: [Rarity, number][]): HTMLElement {
  return el(
    'div',
    { class: 'odds' },
    ...odds.flatMap(([r, x]) => [
      el('span', { class: `rarity-pill ${r}` }, RARITY_LABEL[r].toUpperCase()),
      el(
        'span',
        { class: 'odds-bar' },
        el('i', { style: `width:${Math.max(2, x * 100)}%;background:${RARITY_COLOR[r]}` }),
      ),
      el('b', {}, pct(x)),
    ]),
  );
}

/** Details: contents, odds, the guarantee, the ladder and the cards you could get. */
function packDetails(app: AppApi, kind: PackKind, age: number): void {
  const p = app.profile;
  const ageName = AGE_BY_ID[age]?.name ?? `Age ${age}`;
  const first = firstPackPending(p, kind, age);
  if (kind === 'general') {
    const pityLeft = SHOP.generalPity - p.generalPity;
    const pool = generalPool(age).sort(
      (a, b) => RARITY_RANK[b.rarity] - RARITY_RANK[a.rarity] || a.name.localeCompare(b.name),
    );
    sheet(
      `${PACK_ART.general.name} · ${ageName}`,
      el(
        'p',
        {},
        `1 named general from ${ageName}. A duplicate becomes a ${ECONOMY.medalXp} XP medal.`,
      ),
      el('h3', {}, 'Rarity odds'),
      oddsTable(generalOdds(age)),
      el(
        'p',
        { class: 'good' },
        first
          ? 'Guarantee: your first General Pack here holds a Rare or better.'
          : `Guarantee: Epic or better within ${pityLeft} pack${pityLeft === 1 ? '' : 's'}.`,
      ),
      el('h3', {}, 'Generals you could get'),
      el(
        'div',
        { class: 'possible' },
        ...pool.map((g) => {
          const owned = p.generals[g.id];
          const c = el('div', { class: `mini-card ${g.rarity} ${owned ? '' : 'silhouette'}` });
          c.append(generalHeader(g, 1));
          if (owned) c.append(el('small', { class: 'good' }, 'Owned'));
          return c;
        }),
      ),
    );
    return;
  }
  const n = kind === 'recruit' ? SHOP.recruitCards : SHOP.veteranCards;
  const pool = troopPool(age).sort(
    (a, b) => RARITY_RANK[b.rarity] - RARITY_RANK[a.rarity] || a.name.localeCompare(b.name),
  );
  const guarantee =
    kind === 'veteran'
      ? 'Guarantee: at least one Rare or better in every Veteran Pack.'
      : first
        ? 'Guarantee: your first Recruit Pack here holds a Rare or better.'
        : 'No guarantee: mostly Common, with a chance of Rare or better.';
  sheet(
    `${PACK_ART[kind].name} · ${ageName}`,
    el('p', {}, `${n} troop cards from the ${ageName} ladder. Spare cards level your troops up.`),
    el('h3', {}, 'Odds per card'),
    oddsTable(troopOdds(age)),
    el('p', { class: kind === 'veteran' || first ? 'good' : 'hint' }, guarantee),
    el('h3', {}, 'Troops you could get'),
    el(
      'div',
      { class: 'possible' },
      ...pool.map((d: EraUnitDef) => {
        const owned = p.units[d.id];
        const c = el('div', { class: `mini-card ${d.rarity} ${owned ? '' : 'silhouette'}` });
        c.append(troopHeader(d, owned?.level ?? 1));
        if (owned) c.append(el('small', { class: 'good' }, `Owned · Lv${owned.level}`));
        return c;
      }),
    ),
  );
}

/** A slow idle float (±3 px) that stops when the screen goes. */
function float(target: HTMLElement, shadow: HTMLElement | null, i: number): void {
  if (reducedMotion()) return;
  const dur = 1.7 + i * 0.23;
  const t = gsap.fromTo(
    target,
    { y: 3 },
    {
      y: -3,
      duration: dur,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      delay: i * 0.3,
      onRepeat: () => {
        if (!target.isConnected) {
          t.kill();
          s?.kill();
        }
      },
    },
  );
  const s = shadow
    ? gsap.fromTo(
        shadow,
        { scaleX: 1, opacity: 1 },
        {
          scaleX: 0.88,
          opacity: 0.7,
          duration: dur,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
          delay: i * 0.3,
        },
      )
    : null;
}

/**
 * The shop (UX §4 "Shop"): a pack store. Each offer is the owner's pack art with the age
 * emblem as its seal, floating on the parchment; under it the name, then Buy and Details.
 * Buy lifts the pack to the centre and plays the opening ceremony.
 */
export function shopScreen(app: AppApi, ageArg?: number): HTMLElement {
  const p = app.profile;
  const ages = shopAges(p);
  if (!ages.length) {
    return shell(
      app,
      'Shop',
      () => app.back(),
      el(
        'p',
        { class: 'empty-note' },
        'The shop opens with Antiquity. Win both Dawn of War battles to reach it.',
      ),
    );
  }
  const age = ageArg ?? (lastAge !== null && ages.includes(lastAge) ? lastAge : ages.at(-1)!);
  lastAge = age;
  const ageName = AGE_BY_ID[age]?.name ?? `Age ${age}`;
  const refresh = () => app.show(shopScreen(app, age));
  const upgradeReady = (c: PackCard) => c.kind === 'unit' && canUpgrade(p, c.id).ok;

  const tabs = el(
    'div',
    { class: 'tabs', role: 'tablist' },
    ...ages.map((a) => {
      const t = button(
        '',
        () => app.show(shopScreen(app, a)),
        `tab age-tab ${a === age ? 'on' : ''}`,
      );
      t.append(ageEmblem(a, 28), el('span', {}, AGE_BY_ID[a]?.name ?? `Age ${a}`));
      return t;
    }),
  );

  const width = window.innerHeight < 500 ? 76 : 150;
  const offer = (kind: PackKind, i: number) => {
    const price = packPrice(kind, age);
    const art = packArt(kind, age, width);
    const shelf = el(
      'button',
      { class: 'shelf', type: 'button', 'aria-label': `${PACK_ART[kind].name}: details` },
      art,
    );
    shelf.onclick = () => packDetails(app, kind, age);
    const short = price - p.coins;
    const buy = button(
      short > 0 ? `Need ${short} more ●` : `Buy · ● ${price}`,
      () => {
        const from = art.getBoundingClientRect();
        const cards = buyPack(p, kind, age);
        if (!cards) return;
        app.save();
        // The pack leaves its shelf for the ceremony.
        art.style.visibility = 'hidden';
        const c = packOpening(cards, {
          title: `${PACK_ART[kind].name} · ${ageName}`,
          pack: { kind, age, from },
          upgradeReady,
        });
        void c.done.then(refresh);
      },
      'btn primary',
    );
    buy.disabled = short > 0;
    const details = button('Details', () => packDetails(app, kind, age), 'btn details');
    const sub =
      kind === 'general'
        ? '1 named general'
        : `${kind === 'recruit' ? SHOP.recruitCards : SHOP.veteranCards} troop cards${kind === 'veteran' ? ', 1 Rare+' : firstPackPending(p, kind, age) ? ', first: Rare+' : ''}`;
    float(shelf, art.querySelector('.pack-shadow'), i);
    return el(
      'div',
      { class: `offer ${kind}` },
      shelf,
      el('h3', {}, PACK_ART[kind].name),
      el('p', { class: 'offer-sub' }, sub),
      el('div', { class: 'offer-buttons' }, buy, details),
    );
  };

  // The daily offer: the supply-sack pack, sealed with its troop's age, with Buy and Details.
  const now = new Date();
  const day = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const d = dailyOffer(p, day);
  const daily = d
    ? (() => {
        const t = eraUnitType(d.unit.id);
        const art = packArt('daily', d.unit.age, width);
        const box = el(
          'button',
          { class: 'shelf', type: 'button', 'aria-label': 'Daily offer: details' },
          art,
        );
        const short = d.price - p.coins;
        const buy = button(
          d.bought ? 'Bought today' : short > 0 ? `Need ${short} more ●` : `Buy · ● ${d.price}`,
          () => {
            const from = art.getBoundingClientRect();
            const c = buyDaily(p, day);
            if (!c) return;
            app.save();
            art.style.visibility = 'hidden';
            void packOpening([c], {
              title: 'Daily offer',
              pack: { kind: 'daily', age: d.unit.age, from },
              upgradeReady,
            }).done.then(refresh);
          },
          'btn primary',
        );
        buy.disabled = d.bought || short > 0;
        const owned = p.units[d.unit.id];
        const showDetails = () =>
          sheet(
            `Daily offer: ${d.copies} × ${t.name}`,
            el('p', {}, `${d.copies} copies of one troop, no randomness. A new offer every day.`),
            html(
              `<p>${unitIcon(t.symbol, 'blue', 40)} <span class="rarity-pill ${d.unit.rarity}">${RARITY_LABEL[d.unit.rarity].toUpperCase()}</span></p>`,
            ),
            troopDetails(d.unit, owned?.level ?? 1),
          );
        box.onclick = showDetails;
        const details = button('Details', showDetails, 'btn details');
        float(box, art.querySelector('.pack-shadow'), 3);
        return el(
          'div',
          { class: 'offer daily' },
          box,
          el('h3', {}, 'Daily offer'),
          el('p', { class: 'offer-sub' }, `${d.copies} × ${t.name}`),
          el('div', { class: 'offer-buttons' }, buy, details),
        );
      })()
    : el('span', {});

  const store = el(
    'div',
    { class: 'store' },
    offer('recruit', 0),
    offer('veteran', 1),
    offer('general', 2),
    daily,
  );
  const note = el(
    'p',
    { class: 'shop-note' },
    `${ageName} has ${troopPool(age).length} troop cards. Its Legendary troop also comes free once you hold ${Math.round(ECONOMY.legendaryRoad * 100)}% of its main-battle stars.`,
  );
  return shell(app, 'Shop', () => app.back(), tabs, store, note);
}

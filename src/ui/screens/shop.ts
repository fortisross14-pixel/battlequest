import { AGE_BY_ID } from '../../content/campaign/ages';
import { eraUnitType, ladder } from '../../content/eraUnits';
import { ECONOMY } from '../../meta/profile';
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
import { el } from '../hud';
import { unitIcon } from '../icons';
import { button, html, RARITY_LABEL, shell, type AppApi } from './common';
import { cardView } from './troopCard';

/** The age tab last chosen in the shop (session only). */
let lastAge: number | null = null;

/**
 * The shop (GAME_DESIGN 8): one tab per open age, each selling packs drawn only from that
 * age's ladder, so the player always knows what they are chasing.
 */
export function shopScreen(
  app: AppApi,
  revealed: PackCard[] | null = null,
  ageArg?: number,
): HTMLElement {
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
  // The player's local day, so the offer changes at their midnight, not UTC's.
  const now = new Date();
  const day = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const offer = dailyOffer(p, day);
  const pack = (kind: PackKind, title: string, desc: string) => {
    const price = packPrice(kind, age);
    const buy = button(
      `Buy · ● ${price}`,
      () => {
        const cards = buyPack(p, kind, age);
        if (!cards) return;
        app.save();
        app.show(shopScreen(app, cards, age));
      },
      'btn primary',
    );
    buy.disabled = p.coins < price;
    return el('div', { class: `pack ${kind}` }, el('h3', {}, title), el('p', {}, desc), buy);
  };
  const tabs = el(
    'div',
    { class: 'tabs', role: 'tablist' },
    ...ages.map((a) =>
      button(
        AGE_BY_ID[a]?.name ?? `Age ${a}`,
        () => app.show(shopScreen(app, null, a)),
        `tab ${a === age ? 'on' : ''}`,
      ),
    ),
  );
  const pityLeft = SHOP.generalPity - p.generalPity;
  const troops = ladder(age).length;
  const generals = generalPool(age).length;
  const recruitText = firstPackPending(p, 'recruit', age)
    ? `${SHOP.recruitCards} ${ageName} troop cards. Your first one here holds a Rare or better.`
    : `${SHOP.recruitCards} ${ageName} troop cards, mostly Common, with a chance of Rare or better.`;
  const generalText = firstPackPending(p, 'general', age)
    ? `1 of ${generals} named ${ageName} generals: Rare or better. A duplicate becomes a ${ECONOMY.medalXp} XP medal.`
    : `1 of ${generals} named ${ageName} generals. A duplicate becomes a ${ECONOMY.medalXp} XP medal. Epic or better within ${pityLeft} pack${pityLeft === 1 ? '' : 's'}.`;
  const daily = offer
    ? (() => {
        const ot = eraUnitType(offer.unit.id);
        const dailyBtn = button(
          offer.bought ? 'Bought today' : `Buy · ● ${offer.price}`,
          () => {
            const c = buyDaily(p, day);
            if (!c) return;
            app.save();
            app.show(shopScreen(app, [c], age));
          },
          'btn primary',
        );
        dailyBtn.disabled = offer.bought || p.coins < offer.price;
        return el(
          'div',
          { class: 'pack daily' },
          el('h3', {}, 'Daily offer'),
          html(
            `<p class="offer">${unitIcon(ot.symbol, 'blue', 40)} <span><b>${offer.copies} × ${ot.name}</b><br><small>${RARITY_LABEL[offer.unit.rarity]} · no randomness</small></span></p>`,
          ),
          dailyBtn,
        );
      })()
    : el('span', {});
  const packs = el(
    'div',
    { class: 'packs' },
    pack('recruit', 'Recruit Pack', recruitText),
    pack(
      'veteran',
      'Veteran Pack',
      `${SHOP.veteranCards} ${ageName} troop cards, at least one Rare or better.`,
    ),
    pack('general', 'General Pack', generalText),
    daily,
  );
  const note = el(
    'p',
    { class: 'shop-note' },
    `${ageName} has ${troops} troop cards. Its Legendary troop also comes free once you hold ${Math.round(ECONOMY.legendaryRoad * 100)}% of its main-battle stars.`,
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
  return shell(app, 'Shop', () => app.back(), tabs, reveal, packs, note);
}

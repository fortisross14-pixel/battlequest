import { eraUnitType } from '../../content/eraUnits';
import { ECONOMY } from '../../meta/profile';
import {
  buyDaily,
  buyPack,
  dailyOffer,
  packPrice,
  SHOP,
  type PackCard,
  type PackKind,
} from '../../meta/shop';
import { el } from '../hud';
import { unitIcon } from '../icons';
import { button, html, RARITY_LABEL, shell, type AppApi } from './common';
import { cardView } from './troopCard';

export function shopScreen(app: AppApi, revealed: PackCard[] | null = null): HTMLElement {
  const p = app.profile;
  // The player's local day, so the offer changes at their midnight, not UTC's.
  const now = new Date();
  const day = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
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
      `${SHOP.recruitCards} troop cards, mostly for troops you own — spare cards upgrade them.`,
    ),
    pack(
      'veteran',
      'Veteran Pack',
      `${SHOP.veteranCards} troop cards, at least one Rare or better.`,
    ),
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
        `<p class="offer">${unitIcon(ot.symbol, 'blue', 40)} <span><b>${offer.copies} × ${ot.name}</b><br><small>${RARITY_LABEL[offer.unit.rarity]} · no randomness</small></span></p>`,
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
  return shell(app, 'Shop', () => app.back(), reveal, packs);
}

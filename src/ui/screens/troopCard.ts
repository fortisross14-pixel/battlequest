import { eraUnitType } from '../../content/eraUnits';
import { GENERAL_BY_ID } from '../../content/generals';
import type { PackCard } from '../../meta/shop';
import { unitIcon } from '../icons';
import { html, initials, RARITY_LABEL } from './common';

/** One revealed card, for pack openings and battle rewards. */
export function cardView(c: PackCard): HTMLElement {
  if (c.kind === 'unit') {
    const t = eraUnitType(c.id);
    const copies = c.count > 1 ? ` ×${c.count}` : '';
    const note = c.isNew
      ? `New troop!${c.spare ? ` +${c.spare} spare` : ''}`
      : c.coins
        ? `Max level: +${c.coins} coins`
        : `+${c.spare} spare card${c.spare === 1 ? '' : 's'}`;
    return html(
      `<div class="reveal ${c.rarity}">${unitIcon(t.symbol, 'blue', 56)}<b>${t.name}${copies}</b><span class="rarity-pill ${c.rarity}">${RARITY_LABEL[c.rarity].toUpperCase()}</span><span>${note}</span></div>`,
    );
  }
  const g = GENERAL_BY_ID[c.id]!;
  const note = c.isNew ? 'New general!' : `Duplicate: Medal +${c.medalXp} XP`;
  return html(
    `<div class="reveal ${c.rarity}"><span class="medallion">${initials(g.name)}</span><b>${g.name}</b><span class="rarity-pill ${c.rarity}">${RARITY_LABEL[c.rarity].toUpperCase()}</span><span>${note}</span></div>`,
  );
}

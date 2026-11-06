import { AGES } from '../../content/campaign/battles';
import type { CampaignBattle } from '../../content/campaign/types';
import { ERA_UNIT_BY_ID } from '../../content/eraUnits';
import { GENERAL_BY_ID } from '../../content/generals';
import { nextBattle } from '../../meta/campaign';
import { anyUpgradeAvailable } from '../../meta/profile';
import type { BattleOutcome, Rewards } from '../../meta/rewards';
import { el } from '../hud';
import { stars } from '../icons';
import { button, shell, type AppApi } from './common';
import { cardView } from './troopCard';

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
    ...r.unlocks.units.map((id) => `New troop: ${ERA_UNIT_BY_ID[id]?.name ?? id}!`),
    ...r.unlocks.generals.map((id) => `${GENERAL_BY_ID[id]?.name ?? id} joins your generals!`),
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
      : 'No troop cards for a defeat — win to earn them.',
  ].filter(Boolean) as string[];
  const upgrade = anyUpgradeAvailable(app.profile);
  const box = el(
    'div',
    { class: `results ${o.won ? 'win' : 'loss'}` },
    el('h1', {}, o.won ? 'Victory' : 'Defeat'),
    el('p', { class: 'big-stars', 'aria-label': `${o.stars} stars` }, stars(o.stars)),
    el('ul', {}, ...lines.map((l) => el('li', {}, l))),
    r.cards.length ? el('h3', {}, 'Troop cards earned') : '',
    r.cards.length ? el('div', { class: 'reveal-row' }, ...r.cards.map(cardView)) : '',
    upgrade
      ? el(
          'p',
          { class: 'good' },
          'You can upgrade a troop now. ',
          button('Open Army', () => app.roster('troops'), 'btn small'),
        )
      : '',
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

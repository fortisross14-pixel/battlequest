import { AGES } from '../../content/campaign/battles';
import type { CampaignBattle } from '../../content/campaign/types';
import { ERA_UNIT_BY_ID } from '../../content/eraUnits';
import { GENERAL_BY_ID } from '../../content/generals';
import type { Unlocks } from '../../meta/campaign';
import { anyUpgradeAvailable } from '../../meta/profile';
import type { BattleOutcome, Rewards } from '../../meta/rewards';
import { el } from '../hud';
import { stars } from '../icons';
import { button, shell, type AppApi } from './common';
import { cardView } from './troopCard';
import type { BattleSummary } from '../combatLog';

const FATE = { fighting: 'held', routed: 'routed', destroyed: 'destroyed', fled: 'fled' } as const;

/** Losses per unit, who broke, and the turning point (review 1 WP6). */
function summaryView(s: BattleSummary): HTMLElement {
  const side = (who: 'blue' | 'red', title: string) =>
    el(
      'div',
      { class: `sum-side ${who}` },
      el('h3', {}, title),
      el(
        'ul',
        {},
        ...s.units
          .filter((u) => u.side === who)
          .map((u) =>
            el(
              'li',
              { class: u.fate },
              el('span', {}, u.name),
              el('span', {}, u.lost ? `−${u.lost}` : '—'),
              el('small', {}, FATE[u.fate]),
            ),
          ),
      ),
    );
  return el(
    'section',
    { class: 'summary' },
    s.turningPoint
      ? el('p', { class: 'turning' }, el('b', {}, 'Turning point: '), s.turningPoint)
      : '',
    el('div', { class: 'sum-cols' }, side('blue', 'Your army'), side('red', 'Enemy')),
  );
}

export function resultsScreen(
  app: AppApi,
  b: CampaignBattle,
  o: BattleOutcome,
  r: Rewards,
  summary: BattleSummary | null,
  unlocks: Unlocks,
  retry: () => void,
): HTMLElement {
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
    r.ageGrant
      ? `New age unlocked: ${AGES.find((a) => a.id === r.ageGrant!.age)?.name}! ${r.ageGrant.units.length} Common troops, ${r.ageGrant.generals.length} generals and +${r.ageGrant.coins} coins for your first packs.`
      : null,
    r.legendary
      ? `Legendary troop earned: ${ERA_UNIT_BY_ID[r.legendary]?.name ?? r.legendary}!`
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
    summary ? summaryView(summary) : '',
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
      // Back to the age map, where newly opened battles fade in.
      button(
        unlocks.battles.length || unlocks.ages.length
          ? 'Continue: new battles open ›'
          : 'Continue ›',
        () => app.afterBattle(b, unlocks),
        'btn primary',
      ),
    ),
  );
  return shell(app, b.name, null, box);
}

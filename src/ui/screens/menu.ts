import { nextBattle } from '../../meta/campaign';
import { anyUpgradeAvailable } from '../../meta/profile';
import { el } from '../hud';
import { button, coins, type AppApi } from './common';

export function menuScreen(app: AppApi): HTMLElement {
  const p = app.profile;
  const next = nextBattle(p);
  const totalStars = Object.values(p.battles).reduce((s, b) => s + b.stars, 0);
  const army = button('Army', () => app.roster('troops'), 'btn big');
  if (anyUpgradeAvailable(p)) {
    army.append(el('span', { class: 'badge', 'aria-label': 'upgrade available' }, 'Upgrade'));
  }
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
      army,
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

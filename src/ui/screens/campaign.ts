import { AGES, battlesOfAge } from '../../content/campaign/battles';
import { isBattleUnlocked } from '../../meta/campaign';
import { el } from '../hud';
import { stars } from '../icons';
import { shell, type AppApi } from './common';

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
          `${b.fixedArmy ? 'Fixed army' : `${b.maxUnits} unit slots`} vs ${b.enemy.length}`,
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

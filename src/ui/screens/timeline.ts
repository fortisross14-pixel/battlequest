import { AGES, AGE_BY_ID } from '../../content/campaign/battles';
import { ageProgress, isAgeUnlocked, newestUnlockedAge } from '../../meta/campaign';
import { el } from '../hud';
import { shell, type AppApi } from './common';
import { ageEmblem } from '../emblems';

/** Space between ages on the strip (px). */
const STEP = 230;

function yearLabel(y: number): string {
  return y < 0 ? `${-y} BC` : y < 1000 ? `AD ${y}` : String(y);
}

/**
 * The campaign timeline (GAME_DESIGN 7.1): a parchment strip with an ink line, one node
 * per age showing its progress; locked ages carry a wax seal and their requirement.
 */
export function timelineScreen(app: AppApi): HTMLElement {
  const p = app.profile;
  const strip = el('div', { class: 'timeline-strip', style: `width:${AGES.length * STEP + 80}px` });
  strip.append(el('div', { class: 'ink-line' }));
  AGES.forEach((age, i) => {
    const x = 40 + i * STEP + STEP / 2;
    const open = isAgeUnlocked(p, age.id);
    const prog = ageProgress(p, age.id);
    const prev = AGE_BY_ID[age.id - 1];
    const preparing = age.status !== 'playable';
    const requirement = preparing
      ? 'In preparation'
      : prev
        ? `Win every battle of ${prev.name}`
        : '';
    const node = el(
      'button',
      {
        class: `age-node ${open ? 'open' : 'locked'} ${preparing ? 'preparing' : ''}`,
        type: 'button',
        style: `left:${x}px`,
        'aria-label': `${age.name}, ${age.years}${open ? `, ${prog.won} of ${prog.total} battles, ${prog.stars} of ${prog.maxStars} stars` : `, locked: ${requirement}`}`,
      },
      el('span', { class: 'age-num' }, age.id === 0 ? 'Tutorial' : `Age ${age.id}`),
    );
    // The owner's age emblem (a numeral seal for ages without one yet); dim while locked.
    const icon = el('span', { class: 'age-emblem' }, ageEmblem(age.id, 56, open ? '' : 'dim'));
    node.append(
      icon,
      el('b', {}, age.name),
      el('small', { class: 'age-years' }, age.years),
      open || (!preparing && prog.won > 0)
        ? el(
            'span',
            { class: 'age-progress' },
            el('span', {}, `${prog.won}/${prog.total} battles`),
            el('span', { class: 'stars' }, `${prog.stars}/${prog.maxStars} ★`),
          )
        : el('small', { class: 'age-req' }, requirement),
    );
    node.disabled = !open;
    node.dataset.zoom = 'zoom';
    node.onclick = () => app.ageMap(age.id);
    strip.append(
      el('span', { class: 'tick', style: `left:${x}px` }),
      el('span', { class: 'tick-label', style: `left:${x}px` }, yearLabel(age.from)),
      node,
    );
  });
  const scroller = el('div', { class: 'timeline-scroll' }, strip);
  // Open on the newest unlocked age, once the screen is in the page.
  const newest = newestUnlockedAge(p);
  requestAnimationFrame(() => {
    const target = 40 + newest * STEP + STEP / 2 - scroller.clientWidth / 2;
    scroller.scrollLeft = Math.max(0, target);
  });
  return shell(app, 'Campaign', () => app.back(), scroller);
}

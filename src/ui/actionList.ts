import type { ActionId } from '../core/types';
import { ACTION_INFO, teaserActions } from './actionText';
import { el } from './hud';

/** The unit card's actions (GAME_DESIGN 4.12): icon and one line each, then greyed teasers. */
export function actionList(typeId: string, actions: ActionId[] | undefined): HTMLElement | '' {
  const own = actions ?? [];
  const teasers = teaserActions(typeId).filter((t) => !own.includes(t.action));
  if (!own.length && !teasers.length) return '';
  return el(
    'ul',
    { class: 'actions' },
    ...own.map((a) =>
      el(
        'li',
        {},
        el('span', { class: 'action-icon' }, ACTION_INFO[a].icon),
        el('b', {}, `${ACTION_INFO[a].name}: `),
        ACTION_INFO[a].text,
      ),
    ),
    ...teasers.map((t) =>
      el(
        'li',
        { class: 'teaser', title: `${t.card} has it` },
        el('span', { class: 'action-icon' }, ACTION_INFO[t.action].icon),
        el('b', {}, `${t.rarity}: ${ACTION_INFO[t.action].name}`),
        ` (${t.card})`,
      ),
    ),
  );
}

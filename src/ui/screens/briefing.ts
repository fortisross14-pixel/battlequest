import { AGES } from '../../content/campaign/battles';
import type { ArmyChoice, CampaignBattle } from '../../content/campaign/types';
import { ERA_UNIT_BY_ID, eraUnitType } from '../../content/eraUnits';
import { GENERAL_BY_ID } from '../../content/generals';
import { commandRadiusForRank, scaled, type GeneralDef } from '../../core/generals';
import {
  addTroop,
  armyPower,
  armyProblems,
  problemText,
  removeTroop,
  startingArmy,
} from '../../meta/army';
import { rankForXp } from '../../meta/profile';
import { el } from '../hud';
import { unitIcon } from '../icons';
import { button, html, levelBadge, RARITY_LABEL, shell, type AppApi } from './common';

/** Rank, trait and skills of a general, as shown in the picker. */
function generalDetails(g: GeneralDef, rank: number): HTMLElement {
  return el(
    'span',
    { class: 'gen-details' },
    el(
      'small',
      {},
      `${RARITY_LABEL[g.rarity]} · Rank ${rank} · command radius ${commandRadiusForRank(rank)}`,
    ),
    el('span', {}, g.traitText),
    ...g.skills.map((s) =>
      el(
        'span',
        { class: rank < s.unlockRank ? 'locked-skill' : '' },
        el('b', {}, s.name),
        ` (every ${Math.round(scaled(s.cooldown, rank))} turns): ${s.description}`,
        rank < s.unlockRank ? ` Unlocks at rank ${s.unlockRank}.` : '',
      ),
    ),
  );
}

function infoSection(b: CampaignBattle, enemyPower: number): HTMLElement {
  return el(
    'section',
    { class: 'briefing' },
    el('p', { class: 'year' }, `${b.year} · ${AGES.find((a) => a.id === b.age)?.name ?? ''}`),
    el('p', { class: 'problem' }, b.problem),
    el('p', {}, b.briefing),
    el(
      'ul',
      { class: 'facts' },
      el(
        'li',
        {},
        b.holdOut
          ? `Objective: hold out until the end of turn ${b.turnLimit}.`
          : `Objective: break the enemy army within ${b.turnLimit} turns.`,
      ),
      el('li', {}, `★★★: win losing under 30% of your army, and ${b.bonusText.toLowerCase()}`),
      el(
        'li',
        {},
        `Enemy: ${b.enemy.length} units${b.enemyGeneral ? `, led by ${GENERAL_BY_ID[b.enemyGeneral.id]?.name}` : ''}. Power ${enemyPower}.`,
      ),
    ),
    el(
      'div',
      { class: 'enemy-list' },
      ...b.enemy.map((e) => {
        const t = eraUnitType(e.type, e.level);
        return html(
          `<span class="mini">${unitIcon(t.symbol, 'red', 34, e.level ?? 1)}<span>${t.name}${e.level && e.level > 1 ? ` Lv${e.level}` : ''}</span></span>`,
        );
      }),
    ),
  );
}

export function briefingScreen(app: AppApi, b: CampaignBattle): HTMLElement {
  const p = app.profile;
  const fixed = !!b.fixedArmy;
  const enemyPower = armyPower(b.enemy.map((e) => ({ type: e.type, level: e.level })));
  const army: ArmyChoice = startingArmy(p, b);
  const builder = el('section', { class: 'builder' });
  const deployBtn = button(
    'Deploy ›',
    () => {
      if (armyProblems(p, b, army).length) return;
      if (!fixed) {
        p.lastArmy[b.id] = structuredClone(army);
        app.save();
      }
      app.deploy(b, army);
    },
    'btn primary big',
  );

  const render = () => {
    const power = armyPower(army.units);
    const problems = armyProblems(p, b, army);

    // Slot row: one tile per slot. Tapping a filled tile puts the general with that unit.
    const slots = el('div', { class: 'slots', role: 'list' });
    for (let i = 0; i < b.maxUnits; i++) {
      const u = army.units[i];
      if (!u) {
        slots.append(el('div', { class: 'slot empty', role: 'listitem' }, '+'));
        continue;
      }
      const t = eraUnitType(u.type, u.level);
      const rides = army.general?.unitIndex === i;
      const tile = button(
        '',
        () => {
          if (army.general && !fixed) army.general.unitIndex = i;
          render();
        },
        `slot ${rides ? 'general' : ''}`,
      );
      tile.setAttribute('role', 'listitem');
      tile.setAttribute(
        'aria-label',
        `${t.name}${rides ? ', general rides here' : army.general ? ', tap to put the general here' : ''}`,
      );
      tile.append(
        html(unitIcon(t.symbol, 'blue', 40, u.level ?? 1)),
        el('span', { class: 'slot-name' }, t.name),
        levelBadge(u.level ?? 1),
        rides ? el('span', { class: 'star' }, '★') : '',
      );
      tile.disabled = fixed || !army.general;
      slots.append(tile);
    }

    // Owned troop cards with + / − buttons.
    const full = army.units.length >= b.maxUnits;
    const troops = fixed
      ? []
      : Object.entries(p.units)
          .filter(([id]) => ERA_UNIT_BY_ID[id])
          .sort(
            ([a], [c]) =>
              ERA_UNIT_BY_ID[a]!.age - ERA_UNIT_BY_ID[c]!.age ||
              ERA_UNIT_BY_ID[a]!.name.localeCompare(ERA_UNIT_BY_ID[c]!.name),
          )
          .map(([id, owned]) => {
            const t = eraUnitType(id, owned.level);
            const count = army.units.filter((u) => u.type === id).length;
            const minus = button('−', () => removeTroop(b, army, id) && render(), 'btn icon');
            minus.setAttribute('aria-label', `Remove one ${t.name}`);
            minus.disabled = count === 0;
            const plus = button('+', () => addTroop(p, b, army, id) && render(), 'btn icon');
            plus.setAttribute('aria-label', `Add one ${t.name}`);
            plus.disabled = full;
            return el(
              'div',
              { class: `troop-row ${count ? 'picked' : ''}` },
              html(unitIcon(t.symbol, 'blue', 34, owned.level)),
              el(
                'span',
                { class: 'troop-name' },
                t.name,
                ' ',
                levelBadge(owned.level, true),
                el(
                  'small',
                  {},
                  `${ERA_UNIT_BY_ID[id]!.archetype.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
                ),
              ),
              el('b', { class: 'count' }, count ? `×${count}` : ''),
              minus,
              plus,
            );
          });

    // General picker.
    let generals: HTMLElement[];
    if (fixed) {
      const g = GENERAL_BY_ID[army.general!.id]!;
      generals = [
        el(
          'div',
          { class: 'gen-pick on fixed' },
          el('b', {}, g.name),
          generalDetails(g, army.general!.rank),
        ),
        el(
          'p',
          { class: 'hint' },
          `Historical army: ${g.name} commands${p.generals[g.id] ? '' : ' for this battle only'}. Your own troop levels apply.`,
        ),
      ];
    } else {
      generals = Object.keys(p.generals)
        .filter((id) => GENERAL_BY_ID[id])
        .map((id) => {
          const g = GENERAL_BY_ID[id]!;
          const owned = p.generals[id]!;
          const rank = rankForXp(owned.xp);
          const on = army.general?.id === id;
          const card = button(
            '',
            () => {
              army.general = {
                id,
                rank,
                unitIndex: Math.min(
                  army.general?.unitIndex ?? 0,
                  Math.max(0, army.units.length - 1),
                ),
              };
              render();
            },
            `gen-pick ${on ? 'on' : ''} ${g.rarity}`,
          );
          card.setAttribute('aria-pressed', String(on));
          card.append(
            el('b', {}, g.name, owned.resting ? ' (resting)' : ''),
            generalDetails(g, rank),
          );
          card.disabled = owned.resting;
          return card;
        });
      generals.push(
        button(
          'No general',
          () => {
            army.general = undefined;
            render();
          },
          `chip-btn ${!army.general ? 'on' : ''}`,
        ),
      );
    }

    deployBtn.disabled = problems.length > 0;
    builder.replaceChildren(
      el('h2', {}, 'Your army'),
      el(
        'div',
        { class: 'budget' },
        el('span', {}, `Slots ${army.units.length} / ${b.maxUnits}`),
        el(
          'span',
          { class: power >= enemyPower ? 'good' : 'warn', title: 'A rough guide, not a limit' },
          `Power ${power} vs ${enemyPower}`,
        ),
      ),
      slots,
      el(
        'p',
        { class: 'hint' },
        fixed
          ? 'This battle has a fixed army.'
          : army.general
            ? 'Tap a unit in the slots to choose who your general rides with (★).'
            : 'No general: your army fights without traits or skills.',
      ),
      troops.length ? el('h3', {}, 'Your troops') : '',
      troops.length ? el('div', { class: 'troops' }, ...troops) : '',
      el('h3', {}, 'General'),
      el('div', { class: 'gen-list' }, ...generals),
      problems.length ? el('p', { class: 'warn' }, problems.map(problemText).join(' ')) : '',
      el('div', { class: 'row' }, deployBtn),
    );
  };
  render();
  return shell(
    app,
    b.name,
    () => app.campaign(),
    el('div', { class: 'two-col' }, infoSection(b, enemyPower), builder),
  );
}

import { AGES } from '../../content/campaign/battles';
import type { ArmyChoice, CampaignBattle } from '../../content/campaign/types';
import { ERA_UNIT_BY_ID, eraUnitType } from '../../content/eraUnits';
import { GENERAL_BY_ID } from '../../content/generals';
import { armyPower, armyProblems, problemText, setSlot, startingArmy } from '../../meta/army';
import { rankForXp } from '../../meta/profile';
import { el } from '../hud';
import { unitIcon } from '../icons';
import { generalDetails, generalHeader, troopDetails, troopHeader, withDetails } from './cards';
import { button, html, levelBadge, shell, type AppApi } from './common';

function infoSection(b: CampaignBattle, enemyPower: number): HTMLElement {
  const enemyGen = b.enemyGeneral && GENERAL_BY_ID[b.enemyGeneral.id];
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
          : `Objective: break the enemy army, or bring down its general, within ${b.turnLimit} turns.`,
      ),
      el('li', {}, 'If your general falls, the battle is lost.'),
      el('li', {}, `★★★: win losing under 30% of your army, and ${b.bonusText.toLowerCase()}`),
      el(
        'li',
        {},
        `Enemy: ${b.enemy.length} units${enemyGen ? `, led by ${enemyGen.name}` : ''}. Power ${enemyPower}.`,
      ),
    ),
    el(
      'div',
      { class: 'mini-grid enemy' },
      ...b.enemy.map((e) => {
        const def = ERA_UNIT_BY_ID[e.type]!;
        const lv = e.level ?? 1;
        const card = el('div', { class: `mini-card ${def.rarity}` }, troopHeader(def, lv, 'red'));
        return withDetails(card, troopDetails(def, lv));
      }),
    ),
  );
}

/** Full-screen chooser for one slot: tap a troop to put it there. */
function slotPicker(
  app: AppApi,
  b: CampaignBattle,
  army: ArmyChoice,
  index: number,
  done: () => void,
): HTMLElement {
  const p = app.profile;
  const close = () => {
    sheet.remove();
    done();
  };
  const current = army.units[index];
  const owned = Object.entries(p.units)
    .filter(([id]) => ERA_UNIT_BY_ID[id])
    .sort(
      ([a], [c]) =>
        ERA_UNIT_BY_ID[a]!.age - ERA_UNIT_BY_ID[c]!.age ||
        ERA_UNIT_BY_ID[a]!.name.localeCompare(ERA_UNIT_BY_ID[c]!.name),
    );
  const cards = owned.map(([id, o]) => {
    const def = ERA_UNIT_BY_ID[id]!;
    const inArmy = army.units.filter((u) => u.type === id).length;
    const card = el(
      'button',
      {
        class: `mini-card pick ${def.rarity} ${current?.type === id ? 'on' : ''}`,
        type: 'button',
        'aria-label': `Put ${def.name} in slot ${index + 1}`,
      },
      troopHeader(def, o.level),
      inArmy ? el('small', { class: 'in-army' }, `${inArmy} in your army`) : '',
    );
    card.onclick = () => {
      setSlot(p, b, army, index, id);
      close();
    };
    return withDetails(card, troopDetails(def, o.level));
  });
  const empty = button(
    'Empty this slot',
    () => {
      setSlot(p, b, army, index, null);
      close();
    },
    'btn',
  );
  const sheet = el(
    'div',
    {
      class: 'picker-backdrop',
      role: 'dialog',
      'aria-label': `Choose a troop for slot ${index + 1}`,
    },
    el(
      'div',
      { class: 'picker' },
      el('h2', {}, `Slot ${index + 1}: choose a troop`),
      el('p', { class: 'hint' }, 'Tap a troop to place it. Long-press (or hover) for its details.'),
      el('div', { class: 'mini-grid' }, ...cards),
      el('div', { class: 'row' }, current ? empty : '', button('Close', close, 'btn primary')),
    ),
  );
  return sheet;
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

    // Slot row: tap a slot to choose its troop.
    const slots = el('div', { class: 'slots' });
    for (let i = 0; i < b.maxUnits; i++) {
      const u = army.units[i];
      const t = u && eraUnitType(u.type, u.level);
      const tile = button(
        '',
        () => builder.append(slotPicker(app, b, army, Math.min(i, army.units.length), render)),
        `slot ${u ? '' : 'empty'}`,
      );
      tile.setAttribute(
        'aria-label',
        t
          ? `Slot ${i + 1}: ${t.name}. Tap to change.`
          : `Slot ${i + 1}: empty. Tap to choose a troop.`,
      );
      if (t) {
        tile.append(
          html(unitIcon(t.symbol, 'blue', 40, u!.level ?? 1)),
          el('span', { class: 'slot-name' }, t.name),
          levelBadge(u!.level ?? 1),
        );
      } else {
        tile.append(
          el('span', { class: 'slot-plus' }, '+'),
          el('span', { class: 'slot-name' }, 'Choose'),
        );
      }
      tile.disabled = fixed;
      slots.append(tile);
    }

    // General picker: compact cards; details on long-press or hover.
    let generals: HTMLElement[];
    if (fixed) {
      const g = GENERAL_BY_ID[army.general!.id]!;
      const card = el(
        'div',
        { class: `mini-card ${g.rarity} on` },
        generalHeader(g, army.general!.rank),
      );
      generals = [
        withDetails(card, generalDetails(g, army.general!.rank)),
        el(
          'p',
          { class: 'hint' },
          `Historical army: ${g.name} commands${p.generals[g.id] ? '' : ' for this battle only'}.`,
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
              army.general = { id, rank };
              render();
            },
            `mini-card pick ${g.rarity} ${on ? 'on' : ''}`,
          );
          card.setAttribute('aria-pressed', String(on));
          card.append(generalHeader(g, rank));
          if (owned.resting) card.append(el('small', { class: 'warn' }, 'Resting this battle'));
          card.disabled = owned.resting;
          return withDetails(card, generalDetails(g, rank));
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
    const tips = b.builderTips && !p.battles[b.id]?.wins ? b.builderTips : [];
    builder.replaceChildren(
      el('h2', {}, 'Your army'),
      tips.length
        ? el('div', { class: 'builder-tips', role: 'note' }, ...tips.map((t) => el('p', {}, t)))
        : '',
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
        fixed ? 'This battle has a fixed army.' : 'Tap a slot to choose its troop.',
      ),
      el('h3', {}, 'General'),
      el(
        'p',
        { class: 'hint' },
        'Your general takes the field with a guard and stays behind your line. Units near the general fight better. Long-press a card for details.',
      ),
      el('div', { class: 'mini-grid' }, ...generals),
      problems.length ? el('p', { class: 'warn' }, problems.map(problemText).join(' ')) : '',
      el('div', { class: 'row' }, deployBtn),
    );
  };
  render();
  return shell(
    app,
    b.name,
    () => app.back(),
    el('div', { class: 'two-col' }, infoSection(b, enemyPower), builder),
  );
}

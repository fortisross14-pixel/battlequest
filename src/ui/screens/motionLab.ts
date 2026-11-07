import { ladder } from '../../content/eraUnits';
import { GENERALS, isGeneric } from '../../content/generals';
import type { Rarity } from '../../core/generals';
import type { PackCard } from '../../meta/shop';
import {
  crackLock,
  crackSeal,
  defeatCeremony,
  drawOn,
  glint,
  packOpening,
  stampIn,
  titleCard,
  victoryCeremony,
  waxSeal,
  type DiagramArrow,
} from '../ceremonies';
import { el } from '../hud';
import { EASE, gsap, MOTION, reducedMotion, sec } from '../motion';
import { button, shell, type AppApi } from './common';

/**
 * Motion lab (?debug=motion-lab): every ceremony on demand, with each rarity forced, so
 * they can be reviewed and recorded before they are wired into the real flow (prompt 09 F).
 * It uses made-up results and never touches the profile.
 */

const troop = (rarity: Rarity, isNew: boolean, i = 0): PackCard => {
  const pool = ladder(1).filter((d) => d.rarity === rarity);
  const def = pool[i % pool.length] ?? ladder(1)[0]!;
  return {
    kind: 'unit',
    id: def.id,
    rarity: def.rarity,
    count: 1,
    isNew,
    spare: isNew ? 0 : 1,
    coins: 0,
  };
};

/** A Recruit Pack of 4: three Commons, then the forced rarity last. */
export function labPack(rarity: Rarity): PackCard[] {
  return [
    troop('common', false, 0),
    troop('common', true, 1),
    troop('common', false, 2),
    troop(rarity, true),
  ];
}

export function labGeneral(rarity: Rarity): PackCard {
  const g =
    GENERALS.find((x) => x.playable && !isGeneric(x) && x.rarity === rarity) ??
    GENERALS.find((x) => x.playable && !isGeneric(x))!;
  return { kind: 'general', id: g.id, isNew: true, medalXp: 0, rarity: g.rarity };
}

/** Marathon as a battle diagram: the Greek wings close, the Persian centre breaks. */
const MARATHON: DiagramArrow[] = [
  {
    side: 'red',
    points: [
      [60, 18],
      [48, 26],
      [40, 30],
    ],
  },
  {
    side: 'blue',
    points: [
      [20, 30],
      [34, 30],
    ],
  },
  {
    side: 'blue',
    points: [
      [18, 12],
      [36, 10],
      [50, 20],
    ],
  },
  {
    side: 'blue',
    points: [
      [18, 48],
      [36, 50],
      [50, 40],
    ],
  },
  {
    side: 'red',
    points: [
      [52, 30],
      [70, 34],
      [86, 44],
    ],
  },
];

/** Unlock moments on a small mock age map (the same pieces the age map will use). */
function unlockScene(kind: 'battle' | 'age' | 'stars'): HTMLElement {
  const scene = el('div', { class: 'lab-scene' });
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 400 220');
  svg.setAttribute('preserveAspectRatio', 'none');
  const route = document.createElementNS(ns, 'path');
  route.setAttribute('class', 'route');
  route.setAttribute('d', 'M80 140 C 160 60, 240 60, 320 120');
  svg.append(route);
  const node = (x: string, y: string) => {
    const n = el('div', { class: 'lab-node', style: `left:${x};top:${y}` });
    scene.append(n);
    return n;
  };
  const from = node('20%', '64%');
  from.append(waxSeal('1'));
  const to = node('80%', '55%');
  const count = el('span', { class: 'lab-count' }, '★ 5');
  const banner = el('div', { class: 'lab-banner' }, 'Antiquity complete');
  scene.append(svg, count, banner);
  const tl = gsap.timeline({ paused: true });
  if (kind === 'battle') {
    to.append(waxSeal('2'));
    const lock = el('span', { class: 'lock' }, '🔒');
    to.append(lock);
    gsap.set(to.querySelector('.wax-seal'), { opacity: 0.35 });
    gsap.set(route, { drawSVG: '0%' });
    // Stars roll up, the lock shakes, cracks and falls, the route draws on, the node lights.
    const o = { v: 5 };
    tl.to(o, {
      v: 7,
      duration: sec(400),
      ease: EASE.out,
      onUpdate: () => (count.textContent = `★ ${Math.round(o.v)}`),
    });
    crackLock(lock, tl);
    drawOn(route, tl, 500);
    tl.to(to.querySelector('.wax-seal'), { opacity: 1, duration: sec(MOTION.quick) }, '<+0.3');
    tl.fromTo(
      to.querySelector('.wax-seal'),
      { scale: 1.3 },
      { scale: 1, duration: sec(MOTION.impact), ease: EASE.back },
      '<',
    );
  } else if (kind === 'age') {
    const seal = waxSeal('II');
    to.append(seal);
    gsap.set(route, { drawSVG: '0%' });
    // A short banner, then the next age's seal cracks, the ink line extends, a glint.
    tl.fromTo(
      banner,
      { opacity: 0, y: -8 },
      { opacity: 1, y: 0, duration: sec(MOTION.quick + 60), ease: EASE.out },
    );
    tl.to(banner, { opacity: 0, duration: sec(MOTION.quick), ease: EASE.in }, '+=0.6');
    crackSeal(seal, tl);
    drawOn(route, tl, 500);
    const lit = el(
      'div',
      { class: 'wax-seal lit' },
      el('span', { class: 'shard' }, el('b', {}, 'II')),
    );
    lit.style.position = 'absolute';
    to.append(lit);
    gsap.set(lit, { opacity: 0 });
    tl.to(lit, { opacity: 1, duration: sec(MOTION.quick) }, '>-0.1');
    tl.add(() => void glint(lit.querySelector('.shard') as HTMLElement).play());
  } else {
    to.append(waxSeal('2'));
    const stars = el(
      'div',
      { class: 'node-stars' },
      el('span', {}, '★'),
      el('span', {}, '★'),
      el('span', {}, '★'),
    );
    to.append(stars);
    gsap.set(stars.children, { opacity: 0 });
    stampIn([...stars.children], tl, 160);
  }
  scene.addEventListener('click', () => tl.progress(1));
  (scene as HTMLElement & { play?: () => void }).play = () => tl.restart();
  return scene;
}

export function motionLabScreen(app: AppApi): HTMLElement {
  const note = el(
    'p',
    { class: 'hint' },
    `Each ceremony with made-up results; your progress is untouched. Reduce motion is ${reducedMotion() ? 'on' : 'off'} (Settings in the battle menu).`,
  );
  const pack = (r: Rarity) =>
    button(
      `Recruit pack · ${r}`,
      () =>
        void packOpening(labPack(r), { title: 'Recruit Pack', pack: { kind: 'recruit', age: 1 } }),
    );
  const hero = (r: Rarity) =>
    button(
      `General pack · ${r}`,
      () =>
        void packOpening([labGeneral(r)], {
          title: 'General Pack',
          pack: { kind: 'general', age: 1 },
        }),
    );
  const victory = button(
    'Victory',
    () =>
      void victoryCeremony({
        battle: 'Marathon',
        stars: 3,
        newStars: 2,
        coinsFrom: 140,
        coinsTo: 260,
        xp: { name: 'Miltiades', from: 40, to: 95, rankUp: 2 },
        cards: [troop('rare', true), troop('common', false)],
        arrows: MARATHON,
      }),
  );
  const defeat = button(
    'Defeat',
    () =>
      void defeatCeremony(
        {
          battle: 'Thermopylae',
          tip: 'Hold the narrow pass: a fortified phalanx there cannot be pushed back.',
        },
        () => {},
        () => {},
      ),
  );
  const intro = button('Battle intro', () => {
    // The real board: a debug battle, then the title card while it inks in.
    app.sandbox('debug-actions');
    app.boardIntro(1400);
    void titleCard({ place: 'Debug: tactical actions', year: '480 BC', age: 'Antiquity' });
  });
  const scenes = (['battle', 'age', 'stars'] as const).map((k) => {
    const scene = unlockScene(k);
    const label = { battle: 'Battle unlocked', age: 'Age unlocked', stars: 'Stars earned' }[k];
    return el(
      'section',
      {},
      el('h3', {}, label),
      button(`Play: ${label}`, () => (scene as HTMLElement & { play: () => void }).play()),
      scene,
    );
  });
  return shell(
    app,
    'Motion lab',
    () => app.menu(),
    note,
    el('h2', {}, 'Battle'),
    el('div', { class: 'lab-grid' }, intro, victory, defeat),
    el('h2', {}, 'Packs'),
    el(
      'div',
      { class: 'lab-grid' },
      ...(['common', 'rare', 'epic', 'legendary'] as Rarity[]).map(pack),
      ...(['rare', 'epic', 'legendary'] as Rarity[]).map(hero),
    ),
    el('h2', {}, 'Unlock moments'),
    el('div', { class: 'lab-grid' }, ...scenes),
  );
}

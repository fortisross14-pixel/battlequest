import { ageEmblem } from '../emblems';
import { AGE_BY_ID, BATTLE_BY_ID } from '../../content/campaign/battles';
import { campaignsOfAge, type Campaign } from '../../content/campaign/campaigns';
import type { CampaignBattle } from '../../content/campaign/types';
import { ageProgress, isBattleUnlocked, lockText, type Unlocks } from '../../meta/campaign';
import { glint } from '../ceremonies';
import { el } from '../hud';
import { EASE, fastForward, gsap, MOTION, reducedMotion, sec, sfx, track } from '../motion';
import { stars } from '../icons';
import { attachGestures } from '../input';
import { shell, type AppApi } from './common';

/** Projected positions written by scripts/maps/build-age-maps.ts. */
interface MapMeta {
  width: number;
  height: number;
  battles: Record<string, [number, number]>;
  cities: { name: string; at: [number, number] }[];
  rivers: { name: string; at: [number, number] }[];
}

const SVGS = import.meta.glob('../../content/maps/age-*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;
const METAS = import.meta.glob('../../content/maps/age-*.json', {
  import: 'default',
  eager: true,
}) as Record<string, MapMeta>;

/** Minimum distance between node centres on screen, so each stays tappable (px). */
const MIN_GAP = 100;

/**
 * Spreads nodes that sit too close together (several Greek battles are a few miles apart)
 * so every node keeps a 44 pt target. `gap` is in map units.
 */
export function spreadNodes(
  points: [number, number][],
  gap: number,
  width: number,
  height: number,
): [number, number][] {
  const out = points.map(([x, y]) => [x, y] as [number, number]);
  for (let iter = 0; iter < 200; iter++) {
    let moved = false;
    for (let i = 0; i < out.length; i++) {
      for (let j = i + 1; j < out.length; j++) {
        const a = out[i]!;
        const b = out[j]!;
        let dx = b[0] - a[0];
        let dy = b[1] - a[1];
        let d = Math.hypot(dx, dy);
        if (d >= gap) continue;
        if (d < 1e-6) {
          // Same spot: push apart along a fixed diagonal.
          dx = 1;
          dy = 0.6;
          d = Math.hypot(dx, dy);
        }
        const push = (gap - d) / 2 + 0.5;
        a[0] -= (dx / d) * push;
        a[1] -= (dy / d) * push;
        b[0] += (dx / d) * push;
        b[1] += (dy / d) * push;
        moved = true;
      }
    }
    for (const p of out) {
      p[0] = Math.min(width - gap / 2, Math.max(gap / 2, p[0]));
      p[1] = Math.min(height - gap / 2, Math.max(gap / 2, p[1]));
    }
    if (!moved) break;
  }
  return out;
}

/** The campaign chosen on each age map this session. */
const chosen = new Map<number, string>();

function nodeFor(app: AppApi, b: CampaignBattle, x: number, y: number, num: number): HTMLElement {
  const p = app.profile;
  const rec = p.battles[b.id];
  const won = (rec?.wins ?? 0) > 0;
  const optional = !!b.branchesFrom;
  return el(
    'button',
    {
      class: `battle-node open ${won ? 'won' : ''} ${optional ? 'optional' : ''}`,
      type: 'button',
      'data-battle': b.id,
      'data-zoom': 'flip',
      style: `left:${x}px;top:${y}px`,
      'aria-label': `${b.name}, ${b.year}${optional ? ', side battle' : `, battle ${num}`}, ${rec?.stars ?? 0} of 3 stars`,
    },
    el('span', { class: 'node-dot' }, won ? '★' : optional ? '◆' : String(num)),
    el('span', { class: 'node-name' }, b.name),
    el('small', { class: 'node-year' }, optional ? `Side · ${b.year}` : b.year),
    el('span', { class: 'node-stars' }, stars(rec?.stars ?? 0)),
  );
}

/**
 * The age map (GAME_DESIGN 7.2), organised in campaigns (owner): a row of campaign chips
 * above the region map; the map shows the chosen campaign's open battles at their real
 * places, joined in historical order. Locked battles stay hidden until they open, and
 * campaigns appear once one of their battles does. What a result just opened appears on
 * the map: the ink route draws on to it and its seal stamps down.
 */
export function ageMapScreen(app: AppApi, ageId: number, unlocks?: Unlocks): HTMLElement {
  const p = app.profile;
  const age = AGE_BY_ID[ageId]!;
  const prog = ageProgress(p, ageId);
  const meta = METAS[`../../content/maps/age-${ageId}.json`];
  const svg = SVGS[`../../content/maps/age-${ageId}.svg`] ?? '';
  const title = `${age.name} · ${prog.won}/${prog.total} battles · ${prog.stars}/${prog.maxStars} ★`;
  const toast = el('div', { class: 'map-toast', role: 'status' });
  const viewport = el('div', { class: 'age-map' });
  const chips = el('div', {
    class: 'filter-row campaign-row',
    role: 'tablist',
    'aria-label': 'Campaigns',
  });
  const blurb = el('p', { class: 'campaign-blurb' });
  const screen = shell(app, title, () => app.back(), chips, blurb, viewport, toast);
  screen.querySelector('.screen-body')?.classList.add('map-body');
  // The age emblem in the header.
  screen.querySelector('.screen-head h1')?.prepend(ageEmblem(ageId, 36));
  if (!meta) {
    viewport.append(el('p', { class: 'hint' }, 'This map is in preparation.'));
    return screen;
  }

  const isOpen = (id: string) => {
    const b = BATTLE_BY_ID[id];
    return !!b && isBattleUnlocked(p, b);
  };
  const fresh = new Set(unlocks?.battles ?? []);
  const all = campaignsOfAge(ageId);
  const visible = all.filter((c) => c.battles.some(isOpen));
  const hidden = all.length - visible.length;
  // A campaign that only just appeared: every open battle in it is new.
  const isNewCampaign = (c: Campaign) => c.battles.filter(isOpen).every((id) => fresh.has(id));
  let current: Campaign | undefined =
    visible.find((c) => c.battles.some((id) => fresh.has(id))) ??
    visible.find((c) => c.id === chosen.get(ageId)) ??
    visible.find((c) => c.battles.some((id) => isOpen(id) && !p.battles[id]?.wins)) ??
    visible.at(-1);
  blurb.textContent = current?.blurb ?? '';

  const world = el('div', {
    class: 'map-world',
    style: `width:${meta.width}px;height:${meta.height}px`,
  });
  world.innerHTML = svg;
  const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  overlay.setAttribute('class', 'map-overlay');
  overlay.setAttribute('viewBox', `0 0 ${meta.width} ${meta.height}`);
  overlay.setAttribute('width', String(meta.width));
  overlay.setAttribute('height', String(meta.height));
  world.append(overlay);
  for (const c of meta.cities) {
    world.append(
      el('span', { class: 'city', style: `left:${c.at[0]}px;top:${c.at[1]}px` }, c.name),
    );
  }
  for (const r of meta.rivers) {
    world.append(
      el('span', { class: 'river-label', style: `left:${r.at[0]}px;top:${r.at[1]}px` }, r.name),
    );
  }

  let scale = 1;
  let minScale = 1;
  let tx = 0;
  let ty = 0;
  const nodes: HTMLElement[] = [];
  const setInv = () => {
    for (const n of nodes) n.style.setProperty('--inv', String(1 / scale));
    world.style.setProperty('--inv', String(1 / scale));
  };
  const apply = () => {
    world.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  };
  const clamp = () => {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const w = meta.width * scale;
    const h = meta.height * scale;
    tx = w <= vw ? (vw - w) / 2 : Math.min(0, Math.max(vw - w, tx));
    ty = h <= vh ? (vh - h) / 2 : Math.min(0, Math.max(vh - h, ty));
  };

  /** The chosen campaign's open battles: main ones first, in order, then side battles. */
  const shown = () => {
    const list = (current?.battles ?? []).filter(isOpen).map((id) => BATTLE_BY_ID[id]!);
    return [...list.filter((b) => !b.branchesFrom), ...list.filter((b) => b.branchesFrom)];
  };

  /** Lays out the campaign's nodes and route; `camera` frames them, `entry` animates. */
  const render = (camera: 'snap' | 'ease', entry: boolean) => {
    const battles = shown();
    const main = battles.filter((b) => !b.branchesFrom);
    const truePos: [number, number][] = battles.map(
      (b) => meta.battles[b.id] ?? [meta.width / 2, meta.height / 2],
    );
    const vw = viewport.clientWidth || 800;
    const vh = viewport.clientHeight || 500;
    minScale = Math.min(vw / meta.width, vh / meta.height);
    // Frame the campaign: its battles with room around them, at most 3× the whole map.
    let target = { scale: minScale, tx: 0, ty: 0 };
    if (truePos.length) {
      const xs = truePos.map((q) => q[0]);
      const ys = truePos.map((q) => q[1]);
      const bw = Math.max(1, Math.max(...xs) - Math.min(...xs));
      const bh = Math.max(1, Math.max(...ys) - Math.min(...ys));
      const s = Math.max(minScale, Math.min(minScale * 3, (vw - 220) / bw, (vh - 200) / bh));
      const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
      const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
      target = { scale: s, tx: vw / 2 - cx * s, ty: vh / 2 - cy * s };
    }
    // Spread close battles apart for the framed scale, so each keeps a 44 pt target.
    const spread = spreadNodes(truePos, MIN_GAP / target.scale, meta.width, meta.height);
    const at = (b: CampaignBattle) => spread[battles.indexOf(b)]!;
    const k = 1 / target.scale;
    // The route in historical order; the part that leads to a battle just opened draws on.
    let routeSvg = '';
    main.forEach((b, i) => {
      if (i === 0) return;
      const [x1, y1] = at(main[i - 1]!);
      const [x2, y2] = at(b);
      const cls = fresh.has(b.id) && entry ? 'route fresh' : 'route';
      routeSvg += `<line class="${cls}" data-to="${b.id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="${2.6 * k}" stroke-dasharray="${6 * k} ${6 * k}"/>`;
    });
    const branchSvg = battles
      .filter((b) => b.branchesFrom && battles.some((x) => x.id === b.branchesFrom))
      .map((b) => {
        const [x1, y1] = at(BATTLE_BY_ID[b.branchesFrom!]!);
        const [x2, y2] = at(b);
        const cls = fresh.has(b.id) && entry ? 'branch fresh' : 'branch';
        return `<line class="${cls}" data-to="${b.id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="${1.8 * k}" stroke-dasharray="${3 * k} ${4 * k}"/>`;
      })
      .join('');
    const leaders = spread
      .map(([x, y], i) => {
        const [ox, oy] = truePos[i]!;
        return Math.hypot(x - ox, y - oy) > 2
          ? `<line class="leader" x1="${ox}" y1="${oy}" x2="${x}" y2="${y}" stroke-width="${1.5 * k}"/><circle class="true-spot" cx="${ox}" cy="${oy}" r="${4 * k}"/>`
          : '';
      })
      .join('');
    overlay.innerHTML = `${branchSvg}${routeSvg}${leaders}`;
    nodes.forEach((n) => n.remove());
    nodes.length = 0;
    battles.forEach((b) => {
      const [x, y] = at(b);
      const n = nodeFor(app, b, x, y, main.indexOf(b) + 1);
      nodes.push(n);
      world.append(n);
    });

    // Camera: snap on entry, ease when switching campaigns.
    if (camera === 'snap' || reducedMotion()) {
      ({ scale, tx, ty } = target);
      clamp();
      setInv();
      apply();
    } else {
      const o = { scale, tx, ty };
      track(
        gsap.to(o, {
          ...target,
          duration: sec(MOTION.reveal + 150),
          ease: EASE.inOut,
          onUpdate: () => {
            ({ scale, tx, ty } = o);
            setInv();
            apply();
          },
          onComplete: () => {
            ({ scale, tx, ty } = o);
            clamp();
            setInv();
            apply();
          },
        }),
      );
    }
    if (!entry || reducedMotion()) return;

    // Entry: the open seals ink in one after another; the new ones appear last.
    const tl = gsap.timeline({ delay: sec(camera === 'ease' ? 250 : 120) });
    const old = nodes.filter((n) => !fresh.has(n.dataset.battle ?? ''));
    const neu = nodes.filter((n) => fresh.has(n.dataset.battle ?? ''));
    gsap.set(neu, { opacity: 0 });
    if (old.length) {
      tl.fromTo(
        old,
        { opacity: 0 },
        { opacity: 1, duration: sec(MOTION.quick), stagger: sec(40), ease: EASE.out },
      );
    }
    for (const n of neu) {
      const id = n.dataset.battle!;
      const line = overlay.querySelector<SVGElement>(`.fresh[data-to="${id}"]`);
      if (line) {
        // The dashed route draws on to the new battle like ink from a quill, then dashes.
        const dash = line.getAttribute('stroke-dasharray');
        line.removeAttribute('stroke-dasharray');
        tl.add(() => sfx('quill'));
        tl.fromTo(
          line,
          { drawSVG: '0%' },
          { drawSVG: '100%', duration: sec(520), ease: EASE.inOut },
          '<',
        );
        tl.add(() => {
          gsap.set(line, { clearProps: 'strokeDasharray,strokeDashoffset' });
          if (dash) line.setAttribute('stroke-dasharray', dash);
        });
      }
      const dot = n.querySelector('.node-dot');
      const ring = el('span', { class: 'appear-ring', 'aria-hidden': 'true' });
      dot?.append(ring);
      tl.to(n, { opacity: 1, duration: sec(MOTION.instant) });
      if (dot) {
        tl.fromTo(
          dot,
          { scale: 1.7, rotation: -12 },
          { scale: 1, rotation: 0, duration: sec(MOTION.impact), ease: EASE.back },
          '<',
        );
      }
      tl.add(() => sfx('stamp'), '<');
      tl.fromTo(
        ring,
        { scale: 0.8, opacity: 0.9 },
        {
          scale: 2.2,
          opacity: 0,
          duration: sec(MOTION.reveal + 150),
          ease: EASE.out,
          onComplete: () => ring.remove(),
        },
        '<+0.1',
      );
    }
    track(tl);
  };

  // Campaign chips: the name and battles won of those open; a teaser for hidden ones.
  const chipFor = (c: Campaign) => {
    const open = c.battles.filter(isOpen);
    const won = c.battles.filter((id) => (p.battles[id]?.wins ?? 0) > 0).length;
    const b = el(
      'button',
      {
        class: `filter-chip campaign-chip ${c === current ? 'on' : ''}`,
        type: 'button',
        role: 'tab',
        'aria-selected': String(c === current),
        title: c.blurb,
      },
      el('span', {}, c.name),
      el('small', {}, `${won}/${open.length}`),
    );
    b.onclick = () => {
      if (c === current) return;
      fastForward();
      current = c;
      chosen.set(ageId, c.id);
      chips.querySelectorAll('.campaign-chip').forEach((x) => {
        x.classList.toggle('on', x === b);
        x.setAttribute('aria-selected', String(x === b));
      });
      blurb.textContent = c.blurb;
      render('ease', true);
    };
    return b;
  };
  const chipEls = visible.map(chipFor);
  chips.append(...chipEls);
  if (hidden > 0) {
    chips.append(
      el(
        'span',
        {
          class: 'filter-chip campaign-teaser',
          'aria-label': `${hidden} more campaigns to discover`,
        },
        `+${hidden} campaign${hidden === 1 ? '' : 's'} to discover`,
      ),
    );
  }
  // A campaign that just appeared stamps its chip in with a glint.
  if (fresh.size && !reducedMotion()) {
    visible.forEach((c, i) => {
      if (!isNewCampaign(c)) return;
      const chip = chipEls[i]!;
      const t = gsap.timeline({ delay: 0.15 });
      t.fromTo(
        chip,
        { scale: 1.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: sec(MOTION.impact), ease: EASE.back },
      );
      glint(chip, t);
      track(t);
    });
  }

  const say = (msg: string) => {
    toast.textContent = msg;
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 2200);
  };
  const activate = (b: CampaignBattle) => {
    if (isBattleUnlocked(p, b)) {
      app.briefing(b);
      return;
    }
    say(lockText(p, b) ?? 'Locked');
  };
  // Keyboard and screen readers press the node buttons directly (a click with detail 0);
  // pointer taps go through the gesture handler below, which hit-tests the nodes.
  world.addEventListener('click', (e) => {
    if (e.detail !== 0) return;
    const t = (e.target as HTMLElement).closest('.battle-node') as HTMLElement | null;
    const b = t && BATTLE_BY_ID[t.dataset.battle ?? ''];
    if (b) activate(b);
  });

  viewport.append(world);
  requestAnimationFrame(() => render('snap', true));
  const onResize = () => render('snap', false);
  window.addEventListener('resize', onResize);
  const detach = attachGestures(viewport, {
    tap: (x, y) => {
      fastForward();
      const r = viewport.getBoundingClientRect();
      const hit = document
        .elementsFromPoint(r.left + x, r.top + y)
        .find((e) => e.classList.contains('battle-node')) as HTMLElement | undefined;
      const b = hit && BATTLE_BY_ID[hit.dataset.battle ?? ''];
      if (b) activate(b);
    },
    longPress: () => {},
    pan: (dx, dy) => {
      tx += dx;
      ty += dy;
      clamp();
      apply();
    },
    pinch: (f, cx, cy) => {
      const next = Math.max(minScale, Math.min(minScale * 4, scale * f));
      const wx = (cx - tx) / scale;
      const wy = (cy - ty) / scale;
      scale = next;
      tx = cx - wx * scale;
      ty = cy - wy * scale;
      setInv();
      clamp();
      apply();
    },
  });
  // Stop listening once the screen is replaced.
  const observer = new MutationObserver(() => {
    if (!screen.isConnected) {
      detach();
      window.removeEventListener('resize', onResize);
      observer.disconnect();
    }
  });
  requestAnimationFrame(() => {
    if (screen.parentElement) observer.observe(screen.parentElement, { childList: true });
  });
  return screen;
}

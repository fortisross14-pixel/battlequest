import { ageEmblem } from '../emblems';
import {
  AGE_BY_ID,
  BATTLE_BY_ID,
  battlesOfAge,
  optionalBattlesOf,
} from '../../content/campaign/battles';
import type { CampaignBattle } from '../../content/campaign/types';
import {
  ageProgress,
  isBattleUnlocked,
  lockText,
  starsMissing,
  type Unlocks,
} from '../../meta/campaign';
import { el } from '../hud';
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

/** Fades in what a result just opened. Kept as one hook for the unlock ceremonies later. */
export function playUnlocks(root: HTMLElement, unlocks: Unlocks | undefined): void {
  if (!unlocks) return;
  for (const id of unlocks.battles) {
    root.querySelector(`[data-battle="${id}"]`)?.classList.add('just-unlocked');
  }
}

function nodeFor(app: AppApi, b: CampaignBattle, x: number, y: number): HTMLElement {
  const p = app.profile;
  const open = isBattleUnlocked(p, b);
  const rec = p.battles[b.id];
  const won = (rec?.wins ?? 0) > 0;
  const missing = starsMissing(p, b);
  const optional = !!b.branchesFrom;
  const lock = optional ? '🔒' : `🔒 ${missing} ★`;
  const lockSay = optional
    ? `locked: win ${BATTLE_BY_ID[b.branchesFrom!]?.name} first`
    : `locked: ${missing} more stars needed`;
  const node = el(
    'button',
    {
      class: `battle-node ${open ? 'open' : 'locked'} ${won ? 'won' : ''} ${optional ? 'optional' : ''}`,
      type: 'button',
      'data-battle': b.id,
      'data-zoom': 'flip',
      style: `left:${x}px;top:${y}px`,
      'aria-label': `${b.name}, ${b.year}${optional ? ', optional battle' : ''}${open ? `, ${rec?.stars ?? 0} of 3 stars` : `, ${lockSay}`}`,
    },
    el('span', { class: 'node-dot' }, open ? (won ? '★' : '⚔') : '🔒'),
    el('span', { class: 'node-name' }, b.name),
    el('small', { class: 'node-year' }, b.year),
    open
      ? el('span', { class: 'node-stars' }, stars(rec?.stars ?? 0))
      : el('span', { class: 'node-lock' }, lock),
  );
  return node;
}

/** The age map (GAME_DESIGN 7.2): the region with each battle at its real location. */
export function ageMapScreen(app: AppApi, ageId: number, unlocks?: Unlocks): HTMLElement {
  const p = app.profile;
  const age = AGE_BY_ID[ageId]!;
  const prog = ageProgress(p, ageId);
  const meta = METAS[`../../content/maps/age-${ageId}.json`];
  const svg = SVGS[`../../content/maps/age-${ageId}.svg`] ?? '';
  const title = `${age.name} · ${prog.won}/${prog.total} battles · ${prog.stars}/${prog.maxStars} ★`;
  const toast = el('div', { class: 'map-toast', role: 'status' });
  const viewport = el('div', { class: 'age-map' });
  const screen = shell(app, title, () => app.back(), viewport, toast);
  screen.querySelector('.screen-body')?.classList.add('map-body');
  // The age emblem in the header.
  screen.querySelector('.screen-head h1')?.prepend(ageEmblem(ageId, 36));
  if (!meta) {
    viewport.append(el('p', { class: 'hint' }, 'This map is in preparation.'));
    return screen;
  }

  const world = el('div', {
    class: 'map-world',
    style: `width:${meta.width}px;height:${meta.height}px`,
  });
  world.innerHTML = svg;
  // Main battles first (they carry the route), then the optional ones that branch off them.
  const main = battlesOfAge(ageId);
  const battles = [...main, ...optionalBattlesOf(ageId)];
  const truePos: [number, number][] = battles.map(
    (b) => meta.battles[b.id] ?? [meta.width / 2, meta.height / 2],
  );

  // Route and leader lines go in their own SVG layer above the land.
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

  const nodes: HTMLElement[] = [];
  const layout = () => {
    const vw = viewport.clientWidth || 800;
    const vh = viewport.clientHeight || 500;
    minScale = Math.min(vw / meta.width, vh / meta.height);
    scale = Math.max(minScale, Math.min(scale, minScale * 4));
    // Spread nodes for the fitted scale, so they never overlap at the widest view.
    const spread = spreadNodes(truePos, MIN_GAP / minScale, meta.width, meta.height);
    // The dotted route follows the battles in order; thin leaders point to the true spot.
    const route = spread
      .slice(0, main.length)
      .map(([x, y]) => `${x},${y}`)
      .join(' ');
    // Each optional battle hangs off its main battle by a short dotted branch.
    const branches = battles
      .map((b, i) => {
        const from = b.branchesFrom ? battles.findIndex((m) => m.id === b.branchesFrom) : -1;
        if (from < 0) return '';
        const [x1, y1] = spread[from]!;
        const [x2, y2] = spread[i]!;
        return `<line class="branch" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="${1.8 / minScale}" stroke-dasharray="${3 / minScale} ${4 / minScale}"/>`;
      })
      .join('');
    overlay.innerHTML = `${branches}<polyline class="route" points="${route}" stroke-width="${2.5 / minScale}" stroke-dasharray="${6 / minScale} ${6 / minScale}"/>
${spread
  .map(([x, y], i) => {
    const [ox, oy] = truePos[i]!;
    return Math.hypot(x - ox, y - oy) > 2
      ? `<line class="leader" x1="${ox}" y1="${oy}" x2="${x}" y2="${y}" stroke-width="${1.5 / minScale}"/><circle class="true-spot" cx="${ox}" cy="${oy}" r="${4 / minScale}"/>`
      : '';
  })
  .join('')}`;
    nodes.forEach((n) => n.remove());
    nodes.length = 0;
    battles.forEach((b, i) => {
      const [x, y] = spread[i]!;
      const n = nodeFor(app, b, x, y);
      // Nodes keep their size on screen whatever the zoom.
      n.style.setProperty('--inv', String(1 / scale));
      nodes.push(n);
      world.append(n);
    });
    playUnlocks(world, unlocks);
    world.style.setProperty('--inv', String(1 / scale));
    clamp();
    apply();
  };

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
    const n = starsMissing(p, b);
    say(
      b.branchesFrom
        ? (lockText(p, b) ?? 'Locked')
        : n > 0
          ? `Need ${n} more ★ in ${age.name}`
          : 'Locked',
    );
    // Point at the battles that can still earn stars.
    for (const node of nodes) {
      const ob = BATTLE_BY_ID[node.dataset.battle!]!;
      if (isBattleUnlocked(p, ob) && (p.battles[ob.id]?.stars ?? 0) < 3) {
        node.classList.add('can-earn');
        window.setTimeout(() => node.classList.remove('can-earn'), 1800);
      }
    }
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
  requestAnimationFrame(() => {
    scale = 0;
    layout();
    scale = minScale;
    layout();
  });
  const onResize = () => layout();
  window.addEventListener('resize', onResize);
  const detach = attachGestures(viewport, {
    tap: (x, y) => {
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
      for (const n of nodes) n.style.setProperty('--inv', String(1 / scale));
      world.style.setProperty('--inv', String(1 / scale));
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

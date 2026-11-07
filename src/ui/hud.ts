import { RULES } from '../core/config';
import type { CombatPreview, SidePreview } from '../core/preview';
import { isEngaged } from '../core/state';
import { cellAt } from '../core/map';
import type { BonusStatus } from '../meta/rewards';
import type { LogEntry } from './combatLog';
import type { BattleState, Pos, Side, TerrainType, Unit, UnitTag } from '../core/types';
import { badgeSvg } from '../render/pictograms';
import { COHESION_NAMES } from '../render/theme';

type Child = Node | string | null | undefined | false;

/** Tiny DOM helper. */
const num = (v: number) => String(+v.toFixed(1));

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  for (const c of children) if (c) e.append(c);
  return e;
}

/** Terrain legend for the long-press info (GAME_DESIGN 4.7). */
export const TERRAIN_TEXT: Record<TerrainType, [string, string]> = {
  open: ['Open ground', 'No effect.'],
  rough: ['Rough ground', 'Costs 1.5× MP (more for heavy troops); cavalry charges hit softer.'],
  forest: [
    'Woods',
    'Costs 2× MP; blocks sight; cover halves missile hits; cavalry fights at half.',
  ],
  river: ['River', 'Impassable. Cross at fords and bridges.'],
  ford: ['Ford', 'Costs 3× MP; troops in it fight as Disrupted and their armor counts 0.7×.'],
  bridge: ['Bridge', 'One square wide: enter, leave and fight only along the bridge.'],
};

/** Name and effect of the ground at a square, including the hill if any. */
export function groundText(state: BattleState, p: Pos): string {
  const c = cellAt(state.map, p);
  if (!c) return '';
  const [name, effect] = TERRAIN_TEXT[c.terrain];
  const hill = 'attacking downhill hits 1.2× harder; climbing costs 1.5× MP.';
  if (c.elevation > 0 && c.terrain === 'open') return `Hill: ${hill}`;
  return `${name}${c.elevation > 0 ? ` on a hill (${hill})` : ''}: ${effect}`;
}

export const TAG_TEXT: Record<UnitTag, string> = {
  Evade: 'Evade: often slips away from charges (faster units more often).',
  LightTurn: 'Light: turns for free.',
  RoughTerrainOK: 'Moves through rough ground and woods at full speed.',
  RoughTerrainBad: 'Slowed by rough ground and woods; −20% melee on rough ground.',
  RoughTerrainVeryBad: 'Cannot enter woods; slowed by rough ground.',
  ArmorPiercing: 'Armor piercing: halves the target’s armor when shooting.',
  NoMoveAndShoot: 'Cannot move and shoot in the same turn.',
  AntiCavalry: 'Spear wall: strong against cavalry charging or fighting its front.',
  AntiCavalryStrong: 'Pike wall: very strong against cavalry to its front.',
  FrontOnly: 'Can only charge straight ahead.',
  FlankVulnerable: 'Takes extra damage on the flank and rear.',
  OneShot: 'Pila: one volley per battle.',
  Commander:
    'The general and guard: inspires units in the command radius. If it routs or dies, the battle is lost.',
  Charge: 'Shock: hits 1.2× harder at impact after a run-up of 2+ squares.',
  HitAndRun: 'Hit and run: falls back a square after the impact instead of staying in melee.',
  Pursue: 'Pursues routed enemies 1–2 squares.',
  ScaresHorses: `Horses fear them: mounted troops fight them at ×${RULES.combat.scaresHorses.horseVsElephant}, and they hit mounted troops ×${RULES.combat.scaresHorses.elephantVsHorse}.`,
  Stampede: `Stampedes when it breaks: friends next to it lose ${RULES.combat.stampedeDamage} strength.`,
  Scythed: `Scythed wheels: ×${RULES.combat.scythed} impact when charging foot troops.`,
  Reload: 'Reload: can fire every other turn.',
  RainPenalty: 'Weak in rain (not active yet).',
  Formations: 'Formations: line, column, square (not active yet).',
  HelplessInMelee: 'Helpless in melee.',
  Bounce: 'Shot bounces into the unit behind (not active yet).',
};

const SIDE_NAME: Record<Side, string> = { blue: 'Blue', red: 'Red' };
const pct = (x: number) => `${Math.round(x * 100)}%`;

export interface TopInfo {
  title: string;
  turn: number;
  turnLimit: number;
  side: Side;
  lost: Record<Side, number>;
  breakpoint: Record<Side, number>;
  names?: Record<Side, string>;
  /** Campaign battles: what to do, and the live state of the ★★★ bonus. */
  objective?: { text: string; bonus: string; status: BonusStatus };
}

export class Hud {
  readonly root = el('div', { class: 'hud' });
  private top = el('div', { class: 'topbar' });
  private chip = el('div', { class: 'chip', role: 'status' });
  private toastEl = el('div', { class: 'toast', role: 'alert' });
  private panel = el('div', { class: 'panel preview hidden' });
  private card = el('div', { class: 'panel card hidden' });
  private overlay = el('div', { class: 'overlay hidden' });
  readonly undoBtn = el(
    'button',
    { class: 'btn', type: 'button', 'aria-label': 'Undo last move' },
    '↶ Undo',
  );
  readonly nextBtn = el(
    'button',
    { class: 'btn', type: 'button', 'aria-label': 'Next unit' },
    'Next unit ›',
  );
  readonly endBtn = el('button', { class: 'btn primary', type: 'button' }, 'End turn');
  readonly skillBtn = el(
    'button',
    { class: 'btn gold hidden', type: 'button', 'aria-label': 'General skill' },
    '★ General',
  );
  readonly turnBtn = el(
    'button',
    { class: 'btn hidden', type: 'button', 'aria-label': 'Turn the selected unit' },
    '↻ Turn',
  );
  readonly speedBtn = el(
    'button',
    { class: 'btn hidden', type: 'button', 'aria-label': 'Playback speed' },
    'Speed 1×',
  );
  readonly menuBtn = el(
    'button',
    { class: 'btn menu-btn hidden', type: 'button', 'aria-label': 'Leave battle' },
    '☰',
  );
  private tutorial = el('div', { class: 'tutorial hidden', role: 'note' });
  private skills = el('div', { class: 'panel card skills hidden' });
  private toastTimer: number | undefined;

  constructor(host: HTMLElement) {
    const left = el(
      'div',
      { class: 'corner left' },
      this.undoBtn,
      this.nextBtn,
      this.turnBtn,
      this.skillBtn,
    );
    const right = el('div', { class: 'corner right' }, this.speedBtn, this.endBtn);
    this.root.append(
      this.top,
      this.menuBtn,
      this.tutorial,
      this.skills,
      this.chip,
      left,
      right,
      this.toastEl,
      this.panel,
      this.card,
      this.overlay,
    );
    host.append(this.root);
    this.mountExtras();
  }

  setTop(i: TopInfo): void {
    const N = i.names ?? SIDE_NAME;
    const army = (s: Side) =>
      el(
        'span',
        { class: `army ${s}` },
        el('b', {}, N[s]),
        ` lost ${pct(i.lost[s])} `,
        el('small', {}, `/ breaks at ${pct(i.breakpoint[s])}`),
      );
    this.top.classList.toggle('has-objective', !!i.objective);
    this.top.replaceChildren(
      el('span', { class: 'title' }, i.title),
      el(
        'span',
        { class: `turn ${i.side}` },
        `Turn ${i.turn} / ${i.turnLimit} · `,
        el('b', {}, `${N[i.side]} to move`),
      ),
      i.objective
        ? el(
            'span',
            { class: `objective ${i.objective.status}` },
            i.objective.text,
            ' · ',
            el(
              'b',
              { class: 'bonus-mark', 'aria-label': `bonus ${i.objective.status}` },
              `★${i.objective.status === 'met' ? '✓' : i.objective.status === 'failed' ? '✗' : '…'}`,
            ),
            el('small', { class: 'bonus' }, ` ${i.objective.bonus}`),
          )
        : '',
      el('span', { class: 'armies' }, army('blue'), army('red')),
    );
  }

  setButtons(b: {
    undo: boolean;
    next: boolean;
    end: boolean;
    skill?: 'none' | 'ready' | 'waiting';
    menu?: boolean;
    /** The selected unit can turn: show the Turn button. */
    turn?: boolean;
  }): void {
    this.turnBtn.classList.toggle('hidden', !b.turn);
    this.undoBtn.disabled = !b.undo;
    this.nextBtn.disabled = !b.next;
    this.endBtn.disabled = !b.end;
    const skill = b.skill ?? 'none';
    this.skillBtn.classList.toggle('hidden', skill === 'none');
    this.skillBtn.disabled = skill !== 'ready';
    this.menuBtn.classList.toggle('hidden', !b.menu);
  }

  showSpeed(on: boolean): void {
    this.speedBtn.classList.toggle('hidden', !on);
  }

  setSpeed(label: string): void {
    this.speedBtn.textContent = label;
  }

  /**
   * Shows a tutorial step. The card sits at the top of the board, or at the bottom when it
   * would cover any of `avoid` (client coordinates of the units the step is about).
   */
  setTutorial(
    text: string | null,
    progress: string,
    onSkip?: () => void,
    avoid: { x: number; y: number }[] = [],
  ): void {
    this.tutorial.classList.toggle('hidden', !text);
    this.tutorial.classList.remove('bottom');
    if (!text) return;
    const skip = el(
      'button',
      { class: 'btn small skip-tutorial', type: 'button' },
      'Skip tutorial',
    );
    if (onSkip) skip.onclick = onSkip;
    this.tutorial.replaceChildren(
      el('small', {}, `Tutorial ${progress}`),
      text,
      onSkip ? skip : '',
    );
    const r = this.tutorial.getBoundingClientRect();
    const margin = 36;
    const covered = avoid.some(
      (p) =>
        p.x > r.left - margin &&
        p.x < r.right + margin &&
        p.y > r.top - margin &&
        p.y < r.bottom + margin,
    );
    this.tutorial.classList.toggle('bottom', covered);
  }

  showSkills(
    general: string,
    list: { name: string; text: string; status: string; usable: boolean; use: () => void }[],
  ): void {
    const close = el('button', { class: 'btn', type: 'button' }, 'Close');
    close.onclick = () => this.hideSkills();
    this.skills.replaceChildren(
      el('h2', {}, `${general}: general skills`),
      ...list.map((s) => {
        const b = el('button', { class: 'btn primary', type: 'button' }, 'Use');
        b.disabled = !s.usable;
        b.onclick = s.use;
        return el(
          'div',
          { class: 'skill' },
          el('div', {}, el('b', {}, s.name), el('p', {}, s.text), el('small', {}, s.status)),
          b,
        );
      }),
      el('div', { class: 'row' }, close),
    );
    this.skills.classList.remove('hidden');
  }

  hideSkills(): void {
    this.skills.classList.add('hidden');
  }

  showConfirm(title: string, body: string, yes: string, onYes: () => void): void {
    const y = el('button', { class: 'btn primary', type: 'button' }, yes);
    const n = el('button', { class: 'btn', type: 'button' }, 'Stay');
    y.onclick = () => {
      this.overlay.classList.add('hidden');
      onYes();
    };
    n.onclick = () => this.overlay.classList.add('hidden');
    this.overlay.replaceChildren(
      el(
        'div',
        { class: 'sheet' },
        el('h1', {}, title),
        el('p', {}, body),
        el('div', { class: 'row center' }, n, y),
      ),
    );
    this.overlay.classList.remove('hidden');
  }

  // ---------- Readability: objective, melee banner, combat log (review 1 WP6) ----------

  private banner = el('div', { class: 'melee-banner hidden', role: 'status' });
  private bannerTimer: number | undefined;
  readonly logBtn = el(
    'button',
    { class: 'btn log-btn', type: 'button', 'aria-label': 'Combat log' },
    'Log',
  );
  private logPanel = el('div', { class: 'panel log-drawer hidden', role: 'log' });
  private logList = el('ol', { class: 'log-list' });
  private logOpen = false;

  private mountExtras(): void {
    const close = el('button', { class: 'btn', type: 'button' }, 'Close');
    close.onclick = () => this.toggleLog(false);
    this.logPanel.append(
      el('h2', {}, 'Combat log'),
      this.logList,
      el('div', { class: 'row' }, close),
    );
    this.logBtn.onclick = () => this.toggleLog(!this.logOpen);
    this.root.append(this.banner, this.logBtn, this.logPanel);
  }

  toggleLog(open: boolean): void {
    this.logOpen = open;
    this.logPanel.classList.toggle('hidden', !open);
    if (open) this.logList.lastElementChild?.scrollIntoView({ block: 'end' });
  }

  /** Adds lines to the combat log (newest last). */
  addLog(entries: LogEntry[]): void {
    for (const e of entries) {
      this.logList.append(
        el('li', { class: `log ${e.kind} ${e.side}` }, el('small', {}, `T${e.turn}`), ` ${e.text}`),
      );
    }
    while (this.logList.children.length > 300) this.logList.firstElementChild?.remove();
    if (this.logOpen) this.logList.lastElementChild?.scrollIntoView({ block: 'end' });
  }

  /** A short banner over the map, e.g. the melee results at the end of a turn. */
  showBanner(title: string, lines: string[], ms: number): void {
    window.clearTimeout(this.bannerTimer);
    this.banner.replaceChildren(el('b', {}, title), ...lines.map((l) => el('span', {}, l)));
    this.banner.classList.remove('hidden');
    this.bannerTimer = window.setTimeout(() => this.banner.classList.add('hidden'), ms);
  }

  destroy(): void {
    window.clearTimeout(this.bannerTimer);
    this.root.remove();
  }

  setChip(text: string | null): void {
    this.chip.textContent = text ?? '';
    this.chip.classList.toggle('hidden', !text);
  }

  toast(msg: string): void {
    this.toastEl.textContent = msg;
    this.toastEl.classList.add('show');
    if (this.toastTimer !== undefined) window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => this.toastEl.classList.remove('show'), 2200);
  }

  // ---------- Combat preview ----------

  showPreview(
    p: CombatPreview,
    att: Unit,
    def: Unit,
    actions: { confirm: () => void; cancel: () => void; alt?: { label: string; run: () => void } },
  ): void {
    const verb = p.kind === 'charge' ? 'Charge' : 'Shoot';
    const col = (u: Unit, s: SidePreview, role: string) =>
      el(
        'div',
        { class: `col ${u.side}` },
        el('div', { class: 'who' }, el('small', {}, role), u.type.name),
        el('div', { class: 'big' }, s.expectedLoss > 0 ? `−${Math.round(s.expectedLoss)}` : '—'),
        el(
          'div',
          { class: 'sub' },
          `strength ${Math.round(u.strength)} → ${Math.max(0, Math.round(u.strength - s.expectedLoss))}`,
        ),
        el('div', { class: 'sub' }, `Cohesion drop: ${pct(s.cohesionDropChance)}`),
        el('div', { class: 'sub' }, `Rout: ${pct(s.routChance)}`),
        s.modifiers.length
          ? el(
              'ul',
              { class: 'mods' },
              ...s.modifiers.map((m) => el('li', {}, `${m.label} ×${+m.value.toFixed(2)}`)),
            )
          : null,
      );
    const note =
      p.outcome === 'mayEvade'
        ? `${def.type.name} may evade (${pct(p.evadeChance)}). If caught:`
        : p.outcome === 'catchRouter'
          ? 'The routed unit will be caught and destroyed.'
          : p.kind === 'charge'
            ? 'Impact, then melee at the end of the turn.'
            : 'Expected losses (±15%).';
    // Plain labels for what decides this fight (review 1 WP6).
    const tags: string[] = [];
    if (p.kind === 'charge' && p.outcome !== 'catchRouter') {
      const arc = p.defender.modifiers.find(
        (m) => m.label === 'Flank attack' || m.label === 'Rear attack',
      );
      tags.push(arc ? `${arc.label.replace(' attack', '')} ×${arc.value}` : 'Frontal');
      const half = p.attacker.modifiers.some((m) => m.label === 'Struck in the flank');
      const none = p.attacker.expectedLoss <= 0;
      tags.push(none ? 'Cannot strike back' : half ? 'Strikes back at half' : 'Can strike back');
      tags.push(
        `Impact −${Math.round(p.defender.impactLoss)}, melee −${Math.round(p.defender.meleeLoss)}`,
      );
    }
    if (p.outcome === 'mayEvade') tags.push(`Evade chance ${pct(p.evadeChance)}`);
    const confirm = el(
      'button',
      { class: 'btn primary', type: 'button' },
      `Confirm ${verb.toLowerCase()}`,
    );
    const cancel = el('button', { class: 'btn', type: 'button' }, 'Cancel');
    confirm.onclick = actions.confirm;
    cancel.onclick = actions.cancel;
    const buttons = el('div', { class: 'row' }, cancel);
    if (actions.alt) {
      const alt = el('button', { class: 'btn', type: 'button' }, actions.alt.label);
      alt.onclick = actions.alt.run;
      buttons.append(alt);
    }
    buttons.append(confirm);
    this.panel.replaceChildren(
      el('h2', {}, `${verb}: ${att.type.name} → ${def.type.name}`),
      el('p', { class: 'note' }, note),
      tags.length
        ? el('div', { class: 'preview-tags' }, ...tags.map((t) => el('span', {}, t)))
        : '',
      el(
        'div',
        { class: 'cols' },
        col(att, p.attacker, 'Attacker'),
        col(def, p.defender, 'Target'),
      ),
      buttons,
    );
    this.panel.classList.remove('hidden');
  }

  hidePreview(): void {
    this.panel.classList.add('hidden');
  }

  get previewOpen(): boolean {
    return !this.panel.classList.contains('hidden');
  }

  // ---------- Unit card ----------

  showUnitCard(u: Unit, state: BattleState): void {
    const s = u.type.stats;
    const stat = (k: string, v: string) =>
      el('div', { class: 'stat' }, el('small', {}, k), el('b', {}, v));
    const close = el('button', { class: 'btn', type: 'button' }, 'Close');
    close.onclick = () => this.hideUnitCard();
    const status =
      u.status !== 'active'
        ? u.status === 'fled'
          ? 'Fled the field'
          : 'Destroyed'
        : COHESION_NAMES[u.cohesion];
    const flags = [
      isEngaged(state, u.id) ? 'In melee' : null,
      u.bracing ? 'Braced (Hold)' : null,
      u.side === state.activeSide ? (u.hasActed ? 'Action used' : 'Action ready') : null,
    ].filter(Boolean);
    const badge = el('span', { class: 'card-badge' });
    badge.innerHTML = badgeSvg(u.type.symbol, u.side, 34, u.type.level ?? 1);
    this.card.replaceChildren(
      el('h2', { class: u.side }, badge, `${SIDE_NAME[u.side]} ${u.type.name}`),
      el(
        'div',
        { class: 'state' },
        `Strength ${Math.round(u.strength)} · ${status}`,
        u.side === state.activeSide ? ` · MP ${+u.mpLeft.toFixed(1)}/${s.mp}` : '',
        flags.length ? ` · ${flags.join(' · ')}` : '',
      ),
      el(
        'div',
        { class: 'stats' },
        stat('MP', String(s.mp)),
        stat('Melee', num(s.melee)),
        stat('Impact', num(s.impact)),
        stat('Ranged', s.range > 0 ? `${num(s.ranged)} (${s.range})` : '—'),
        stat('Armor', num(s.armor)),
        stat('Morale', num(s.morale)),
        stat('Cost', String(s.cost)),
      ),
      u.type.tags.length
        ? el('ul', { class: 'tags' }, ...u.type.tags.map((t) => el('li', {}, TAG_TEXT[t])))
        : '',
      u.status === 'active'
        ? el('p', { class: 'ground' }, el('b', {}, 'Ground: '), groundText(state, u))
        : '',
      el('div', { class: 'row' }, close),
    );
    this.card.classList.remove('hidden');
  }

  /** Long-press on an empty square: what the ground there does. */
  showTerrainCard(p: Pos, state: BattleState): void {
    const close = el('button', { class: 'btn', type: 'button' }, 'Close');
    close.onclick = () => this.hideUnitCard();
    this.card.replaceChildren(
      el('h2', {}, 'Terrain'),
      el('p', { class: 'ground' }, groundText(state, p)),
      el('div', { class: 'row' }, close),
    );
    this.card.classList.remove('hidden');
  }

  hideUnitCard(): void {
    this.card.classList.add('hidden');
  }

  // ---------- Full-screen overlay (hand-off, result) ----------

  showOverlay(title: string, body: string, button: string, onClose: () => void, side?: Side): void {
    const b = el('button', { class: 'btn primary', type: 'button' }, button);
    b.onclick = () => {
      this.overlay.classList.add('hidden');
      onClose();
    };
    this.overlay.replaceChildren(
      el('div', { class: `sheet ${side ?? ''}` }, el('h1', {}, title), el('p', {}, body), b),
    );
    this.overlay.classList.remove('hidden');
  }

  get overlayOpen(): boolean {
    return !this.overlay.classList.contains('hidden');
  }
}

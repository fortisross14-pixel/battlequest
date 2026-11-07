import { RULES } from '../core/config';
import { layout } from './layout';
import { actionList } from './actionList';
import { EASE, gsap, MOTION, reducedMotion, sec, track } from './motion';
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

/** The general medallion (UX §1): seal, rank pips and the skill's cooldown ring. */
export interface MedallionInfo {
  name: string;
  initials: string;
  rank: number;
  /** ready: tap to use; cooldown: turns left shown on the ring; blocked: why not now. */
  skill: 'ready' | 'cooldown' | 'blocked' | 'none';
  /** 0–1, how much of the cooldown has passed. */
  progress: number;
  label: string;
}

export interface PreviewMode {
  label: string;
  on: boolean;
  run: () => void;
}

export interface MenuItem {
  label: string;
  run: () => void;
  danger?: boolean;
  /** A short line under the label. */
  note?: string;
}

/** Names of the reserved HUD zones registered with the layout manager. */
const ZONES = ['topbar', 'guide', 'medallion', 'corner-right'] as const;

export class Hud {
  readonly root = el('div', { class: 'hud' });
  private top = el('div', { class: 'topbar' });
  private topInfo = el('div', { class: 'top-info' });
  /** Guidance strip (UX §1): tutorial steps and hints dock here, never over the map. */
  private guide = el('div', { class: 'guide', role: 'status' });
  private guideText = el('span', { class: 'guide-text' });
  private guideExtra = el('span', { class: 'guide-extra' });
  /** Ink leader lines from the strip to what a step points at. */
  private leaders = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  private leaderTarget: { x: number; y: number } | null = null;
  private tutorialOn = false;
  private hint: string | null = null;
  private toasts = el('div', { class: 'toasts', role: 'status', 'aria-live': 'polite' });
  private panel = el('div', { class: 'panel preview hidden' });
  private card = el('div', { class: 'panel card hidden' });
  private overlay = el('div', { class: 'overlay hidden' });
  private sheet = el('div', { class: 'battle-sheet hidden', role: 'dialog' });
  readonly endBtn = el('button', { class: 'btn primary end-turn', type: 'button' }, 'End turn');
  /** "2 waiting": cycles through the units that haven't acted (replaces Next unit). */
  readonly waitingBtn = el(
    'button',
    { class: 'chip-btn waiting hidden', type: 'button', 'aria-label': 'Next waiting unit' },
    '',
  );
  /** The general medallion: tap it to use the general's skill. */
  readonly medallionBtn = el(
    'button',
    { class: 'medallion hidden', type: 'button', 'aria-label': 'General skill' },
    '',
  );
  readonly speedBtn = el(
    'button',
    { class: 'chip-btn speed hidden', type: 'button', 'aria-label': 'Playback speed' },
    'Speed 1×',
  );
  readonly menuBtn = el(
    'button',
    { class: 'btn icon menu-btn', type: 'button', 'aria-label': 'Battle menu' },
    '☰',
  );
  private corner = el('div', { class: 'corner right' }, this.waitingBtn, this.endBtn);
  private skills = el('div', { class: 'panel card skills hidden' });
  private menuBtnShown = true;

  constructor(host: HTMLElement) {
    this.leaders.setAttribute('class', 'leaders');
    this.guide.append(this.guideText, this.guideExtra);
    this.top.append(this.menuBtn, this.topInfo, this.speedBtn);
    this.root.append(
      this.leaders,
      this.top,
      this.guide,
      this.skills,
      this.medallionBtn,
      this.corner,
      this.toasts,
      this.panel,
      this.card,
      this.overlay,
      this.sheet,
    );
    host.append(this.root);
    this.mountExtras();
    // Reserved HUD zones (UX §1): the camera fits the map into what is left.
    layout.register('topbar', this.top);
    layout.register('guide', this.guide);
    layout.register('medallion', this.medallionBtn);
    layout.register('corner-right', this.corner);
    this.renderGuide();
    window.addEventListener('resize', this.onResize);
  }

  private onResize = () => this.drawLeader();

  setTop(i: TopInfo): void {
    const N = i.names ?? SIDE_NAME;
    const meter = (s: Side) => {
      const fill = Math.min(1, i.lost[s] / Math.max(0.01, i.breakpoint[s]));
      return el(
        'span',
        {
          class: `meter ${s} ${fill >= 0.75 ? 'danger' : ''}`,
          title: `${N[s]} lost ${pct(i.lost[s])}; breaks at ${pct(i.breakpoint[s])}`,
          'aria-label': `${N[s]} lost ${pct(i.lost[s])} of ${pct(i.breakpoint[s])} before it breaks`,
        },
        el('b', {}, N[s]),
        el('i', { class: 'bar' }, el('i', { style: `transform:scaleX(${fill.toFixed(3)})` })),
        el('small', {}, pct(i.lost[s])),
      );
    };
    const objective = i.objective
      ? (() => {
          const o = i.objective;
          const b = el(
            'button',
            {
              class: `objective ${o.status}`,
              type: 'button',
              'aria-label': `Objective: ${o.text}. Bonus: ${o.bonus}, ${o.status}`,
            },
            el('span', { class: 'obj-text' }, o.text),
            el(
              'b',
              { class: 'bonus-mark' },
              `★${o.status === 'met' ? '✓' : o.status === 'failed' ? '✗' : '…'}`,
            ),
          );
          b.onclick = () =>
            this.showSheet(
              'Objective',
              el(
                'div',
                {},
                el('p', {}, el('b', {}, o.text)),
                el(
                  'p',
                  {},
                  `★★★: win losing under 30% of your army, and ${o.bonus.toLowerCase()}. `,
                  el(
                    'b',
                    {},
                    o.status === 'met'
                      ? 'On track.'
                      : o.status === 'failed'
                        ? 'Missed.'
                        : 'Not yet.',
                  ),
                ),
              ),
            );
          return b;
        })()
      : '';
    this.topInfo.replaceChildren(
      this.logBtn,
      el(
        'span',
        { class: 'title' },
        el('span', { class: 'name' }, i.title),
        el('span', { class: `turn ${i.side}` }, ` · Turn ${i.turn}/${i.turnLimit}`),
      ),
      objective,
      el('span', { class: 'meters' }, meter('blue'), meter('red')),
    );
  }

  setButtons(b: { end: boolean; menu?: boolean }): void {
    this.endBtn.disabled = !b.end;
    this.menuBtnShown = b.menu ?? true;
    this.menuBtn.classList.toggle('hidden', !this.menuBtnShown);
  }

  /** The "N waiting" chip next to End turn. */
  setWaiting(n: number): void {
    this.waitingBtn.textContent = `${n} waiting`;
    this.waitingBtn.classList.toggle('hidden', n <= 0);
  }

  setMedallion(m: MedallionInfo | null): void {
    this.medallionBtn.classList.toggle('hidden', !m);
    layout.changed();
    if (!m) return;
    const ring = Math.round(Math.max(0, Math.min(1, m.progress)) * 360);
    this.medallionBtn.className = `medallion ${m.skill}`;
    this.medallionBtn.setAttribute('aria-label', `${m.name}, rank ${m.rank}. ${m.label}`);
    this.medallionBtn.disabled = m.skill !== 'ready';
    this.medallionBtn.replaceChildren(
      el('span', { class: 'ring', style: `--ring:${ring}deg` }),
      el('span', { class: 'seal' }, m.initials),
      el('span', { class: 'pips' }, '•'.repeat(Math.min(10, m.rank))),
      el('small', { class: 'label' }, m.label),
    );
  }

  showSpeed(on: boolean): void {
    this.speedBtn.classList.toggle('hidden', !on);
  }

  setSpeed(label: string): void {
    this.speedBtn.textContent = label;
  }

  // ---------- Guidance strip ----------

  /**
   * Shows a tutorial step in the guidance strip, with an ink leader line to `target` (client
   * coordinates of what the step points at). The strip never covers the map (UX §1).
   */
  setTutorial(
    text: string | null,
    progress: string,
    onSkip?: () => void,
    target: { x: number; y: number } | null = null,
  ): void {
    this.tutorialOn = !!text;
    this.leaderTarget = text ? target : null;
    if (text) {
      const skip = el('button', { class: 'chip-btn skip-tutorial', type: 'button' }, 'Skip');
      if (onSkip) skip.onclick = onSkip;
      this.guideText.replaceChildren(el('small', { class: 'step' }, `Tutorial ${progress}`), text);
      this.guideExtra.replaceChildren(onSkip ? skip : '');
    }
    this.renderGuide();
  }

  /** A one-line hint (what is selected, what a tap will do). */
  setChip(text: string | null): void {
    this.hint = text;
    this.renderGuide();
  }

  private renderGuide(): void {
    this.guide.classList.toggle('tutorial', this.tutorialOn);
    if (!this.tutorialOn) {
      this.guideText.replaceChildren(this.hint ?? '');
      this.guideExtra.replaceChildren();
    }
    this.guide.classList.toggle('empty', !this.tutorialOn && !this.hint);
    this.drawLeader();
  }

  /** Moves the leader line's end (the target moved or the camera changed). */
  setLeaderTarget(target: { x: number; y: number } | null): void {
    this.leaderTarget = this.tutorialOn ? target : null;
    this.drawLeader();
  }

  private drawLeader(): void {
    const t = this.leaderTarget;
    if (!t || !this.tutorialOn) {
      this.leaders.replaceChildren();
      return;
    }
    const r = this.guide.getBoundingClientRect();
    const x0 = Math.min(Math.max(t.x, r.left + 24), r.right - 24);
    const y0 = r.bottom;
    // A gentle ink curve from the strip down to just above the target.
    const y1 = t.y - 26;
    const mid = (y0 + y1) / 2;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${x0} ${y0} C ${x0} ${mid}, ${t.x} ${mid}, ${t.x} ${y1}`);
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', String(x0));
    dot.setAttribute('cy', String(y0));
    dot.setAttribute('r', '3.5');
    this.leaders.replaceChildren(path, dot);
  }

  // ---------- Sheets: skills, battle menu, objectives, settings, help ----------

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

  /** The battle menu (UX §6): a parchment sheet sliding from the left. */
  showMenu(items: MenuItem[]): void {
    const list = el(
      'div',
      { class: 'menu-list' },
      ...items.map((it) => {
        const b = el(
          'button',
          { class: `menu-item ${it.danger ? 'danger' : ''}`, type: 'button' },
          el('b', {}, it.label),
          it.note ? el('small', {}, it.note) : '',
        );
        b.onclick = () => {
          this.hideSheet();
          it.run();
        };
        return b;
      }),
    );
    this.openSheet('menu', el('h2', {}, 'Battle'), list);
  }

  /** A titled sheet (objectives, settings, how to play) with a Close button. */
  showSheet(title: string, body: HTMLElement): void {
    const close = el('button', { class: 'btn', type: 'button' }, 'Close');
    close.onclick = () => this.hideSheet();
    this.openSheet('page', el('h2', {}, title), body, el('div', { class: 'row' }, close));
  }

  private openSheet(kind: string, ...children: HTMLElement[]): void {
    this.sheet.className = `battle-sheet ${kind}`;
    this.sheet.replaceChildren(el('div', { class: 'sheet-body' }, ...children));
    this.sheet.onclick = (e) => {
      if (e.target === this.sheet) this.hideSheet();
    };
    this.sheet.classList.remove('hidden');
    const body = this.sheet.firstElementChild as HTMLElement;
    if (!reducedMotion()) {
      gsap.fromTo(
        body,
        { x: -40, opacity: 0 },
        { x: 0, opacity: 1, duration: sec(MOTION.quick + 60), ease: EASE.out },
      );
    }
  }

  hideSheet(): void {
    this.sheet.classList.add('hidden');
  }

  get sheetOpen(): boolean {
    return !this.sheet.classList.contains('hidden');
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

  // ---------- Readability: combat log, results (review 1 WP6) ----------

  readonly logBtn = el(
    'button',
    { class: 'btn icon log-btn', type: 'button', 'aria-label': 'Combat log' },
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
    this.root.append(this.logPanel);
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

  /** Combat results (e.g. the melee phase) as a toast in the stack above End turn. */
  showBanner(title: string, lines: string[], ms: number): void {
    this.pushToast(el('div', {}, el('b', {}, title), ...lines.map((l) => el('span', {}, l))), ms);
  }

  destroy(): void {
    for (const n of ZONES) layout.unregister(n);
    window.removeEventListener('resize', this.onResize);
    this.root.remove();
  }

  /** A short message in the toast stack; `action` adds a button ("Moved · Undo"). */
  toast(msg: string, action?: { label: string; run: () => void }, ms = 2200): void {
    const body = el('div', { class: 'toast-row' }, el('span', {}, msg));
    if (action) {
      const b = el('button', { class: 'chip-btn', type: 'button' }, action.label);
      b.onclick = () => {
        item.remove();
        action.run();
      };
      body.append(b);
    }
    const item = this.pushToast(body, ms);
  }

  private pushToast(content: HTMLElement, ms: number): HTMLElement {
    const item = el('div', { class: 'toast' }, content);
    this.toasts.append(item);
    // At most three at once: the oldest goes.
    while (this.toasts.children.length > 3) this.toasts.firstElementChild?.remove();
    if (!reducedMotion()) {
      gsap.fromTo(
        item,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: sec(MOTION.quick), ease: EASE.out },
      );
    }
    window.setTimeout(() => {
      if (!item.isConnected) return;
      if (reducedMotion()) item.remove();
      else
        gsap.to(item, {
          opacity: 0,
          y: -6,
          duration: sec(MOTION.quick),
          ease: EASE.in,
          onComplete: () => item.remove(),
        });
    }, ms);
    return item;
  }

  /** Removes the toasts whose text starts with `prefix` (e.g. an Undo that no longer applies). */
  clearToasts(): void {
    this.toasts.replaceChildren();
  }

  // ---------- Combat preview ----------

  showPreview(
    p: CombatPreview,
    att: Unit,
    def: Unit,
    actions: {
      confirm: () => void;
      cancel: () => void;
      alt?: { label: string; run: () => void };
      /** Attack-mode tabs (GAME_DESIGN 4.12): Shoot | Volley, Engage | Full charge… */
      modes?: PreviewMode[];
      /** A block under the tags (the breakthrough chance, the retreat square…). */
      extra?: HTMLElement;
      /** Why the attack can't be confirmed in this mode. */
      blocked?: string;
      confirmLabel?: string;
    },
    /** Client positions of the two units: the panel docks where it covers neither. */
    units: { x: number; y: number }[] = [],
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
      actions.confirmLabel ?? `Confirm ${verb.toLowerCase()}`,
    );
    if (actions.blocked) confirm.disabled = true;
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
      actions.modes ? this.modeTabs(actions.modes) : '',
      el('h2', {}, `${verb}: ${att.type.name} → ${def.type.name}`),
      el('p', { class: 'note' }, note),
      actions.extra ?? '',
      actions.blocked ? el('p', { class: 'warn' }, actions.blocked) : '',
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
    // Dock away from the attacker and the target, so the fight stays in view: measure the
    // panel, then pick the end of the screen that covers neither (or fewer) of them.
    this.dockPanel(units);
  }

  /** Shows the preview panel where it covers neither unit of the fight (or fewer). */
  private dockPanel(units: { x: number; y: number }[]): void {
    this.panel.classList.remove('hidden');
    const margin = 36;
    const hits = (dock: string) => {
      this.panel.classList.remove('dock-top', 'dock-left', 'dock-right');
      if (dock) this.panel.classList.add(dock);
      const r = this.panel.getBoundingClientRect();
      return units.filter(
        (u) =>
          u.x + margin > r.left &&
          u.x - margin < r.right &&
          u.y + margin > r.top &&
          u.y - margin < r.bottom,
      ).length;
    };
    const docks = ['', 'dock-top', 'dock-right', 'dock-left'];
    let best = docks[0]!;
    let bestHits = Infinity;
    for (const d of docks) {
      const h = hits(d);
      if (h < bestHits) {
        best = d;
        bestHits = h;
      }
      if (h === 0) break;
    }
    hits(best);
  }

  private modeTabs(modes: PreviewMode[]): HTMLElement {
    return el(
      'div',
      { class: 'mode-tabs', role: 'tablist' },
      ...modes.map((m) => {
        const b = el(
          'button',
          { class: `mode-tab ${m.on ? 'on' : ''}`, type: 'button', role: 'tab' },
          m.label,
        );
        b.setAttribute('aria-selected', String(m.on));
        b.onclick = m.run;
        return b;
      }),
    );
  }

  /** The Volley preview: losses for each unit in the frame and the total (GAME_DESIGN 4.12). */
  showVolleyPreview(
    att: Unit,
    rows: { name: string; side: Side; loss: number; drop: number }[],
    total: number,
    actions: { confirm: () => void; cancel: () => void; modes: PreviewMode[]; blocked?: string },
    units: { x: number; y: number }[] = [],
  ): void {
    const confirm = el('button', { class: 'btn primary', type: 'button' }, 'Fire volley');
    confirm.disabled = !!actions.blocked;
    confirm.onclick = actions.confirm;
    const cancel = el('button', { class: 'btn', type: 'button' }, 'Cancel');
    cancel.onclick = actions.cancel;
    this.panel.replaceChildren(
      this.modeTabs(actions.modes),
      el('h2', {}, `Volley: ${att.type.name}`),
      el(
        'p',
        { class: 'note' },
        'Tap a square on the map to move the 2×2 frame. Every enemy inside is hit.',
      ),
      rows.length
        ? el(
            'ul',
            { class: 'volley-rows' },
            ...rows.map((r) =>
              el(
                'li',
                { class: r.side },
                el('span', {}, r.name),
                el('b', {}, `−${Math.round(r.loss)}`),
                el('small', {}, `waver ${pct(r.drop)}`),
              ),
            ),
            el(
              'li',
              { class: 'total' },
              el('span', {}, 'Total'),
              el('b', {}, `−${Math.round(total)}`),
            ),
          )
        : '',
      actions.blocked ? el('p', { class: 'warn' }, actions.blocked) : '',
      el('div', { class: 'row' }, cancel, confirm),
    );
    this.dockPanel(units);
  }

  hidePreview(): void {
    this.panel.classList.add('hidden');
  }

  get previewOpen(): boolean {
    return !this.panel.classList.contains('hidden');
  }

  // ---------- Unit card ----------

  /** Where the open unit card grew from (it shrinks back there). */
  private cardFrom: { x: number; y: number } | null = null;

  /**
   * Info (UX §3): the card grows out of the unit (a FLIP from the block to the sheet) and
   * its content is already in place: one entrance for the container, no second stagger.
   */
  showUnitCard(u: Unit, state: BattleState, from?: { x: number; y: number }): void {
    this.fillUnitCard(u, state);
    this.cardFrom = from ?? null;
    if (!from || reducedMotion()) {
      if (!reducedMotion()) return;
      gsap.fromTo(this.card, { opacity: 0 }, { opacity: 1, duration: sec(MOTION.reducedFade) });
      return;
    }
    gsap.killTweensOf(this.card);
    gsap.set(this.card, { xPercent: -50, x: 0, y: 0, scale: 1, opacity: 1 });
    const r = this.card.getBoundingClientRect();
    track(
      gsap.fromTo(
        this.card,
        {
          xPercent: -50,
          x: from.x - (r.left + r.width / 2),
          y: from.y - (r.top + r.height / 2),
          scale: 0.12,
          opacity: 0.2,
          transformOrigin: '50% 50%',
        },
        { x: 0, y: 0, scale: 1, opacity: 1, duration: sec(MOTION.reveal), ease: EASE.out },
      ),
    );
  }

  private fillUnitCard(u: Unit, state: BattleState): void {
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
      actionList(u.type.id, u.type.actions),
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
    if (this.card.classList.contains('hidden')) return;
    const from = this.cardFrom;
    this.cardFrom = null;
    if (!from || reducedMotion()) {
      this.card.classList.add('hidden');
      gsap.set(this.card, { clearProps: 'transform,opacity' });
      return;
    }
    // Shrinks back into the unit, faster than it grew.
    const r = this.card.getBoundingClientRect();
    gsap.to(this.card, {
      x: `+=${from.x - (r.left + r.width / 2)}`,
      y: `+=${from.y - (r.top + r.height / 2)}`,
      scale: 0.12,
      opacity: 0,
      duration: sec(MOTION.quick + 60),
      ease: EASE.in,
      onComplete: () => {
        this.card.classList.add('hidden');
        gsap.set(this.card, { clearProps: 'transform,opacity' });
      },
    });
  }

  /** The turn banner (UX §3): a thin ink banner sweeps across the guidance strip. */
  turnBanner(text: string): void {
    const b = el('div', { class: 'turn-banner', role: 'status' }, text);
    this.root.append(b);
    const r = this.guide.getBoundingClientRect();
    b.style.top = `${r.top}px`;
    b.style.left = `${r.left}px`;
    b.style.width = `${r.width}px`;
    b.style.height = `${r.height}px`;
    if (reducedMotion()) {
      gsap.fromTo(b, { opacity: 0 }, { opacity: 1, duration: sec(MOTION.reducedFade), yoyo: true, repeat: 1, repeatDelay: 0.4, onComplete: () => b.remove() });
      return;
    }
    const tl = gsap.timeline({ onComplete: () => b.remove() });
    tl.fromTo(b, { clipPath: 'inset(0 100% 0 0)', opacity: 1 }, { clipPath: 'inset(0 0% 0 0)', duration: sec(260), ease: EASE.out })
      .to(b, { opacity: 0, duration: sec(180), ease: EASE.in }, sec(500));
    track(tl);
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

import type { CombatPreview, SidePreview } from '../core/preview';
import { isEngaged } from '../core/state';
import type { BattleState, Side, Unit, UnitTag } from '../core/types';
import { COHESION_NAMES } from '../render/theme';

type Child = Node | string | null | undefined | false;

/** Tiny DOM helper. */
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
  Charge: 'Shock cavalry.',
  Pursue: 'Pursues routed enemies 1–2 squares.',
  ScaresHorses: 'Scares horses (not active yet).',
  Stampede: 'Stampedes when routed (not active yet).',
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
  private toastTimer: number | undefined;

  constructor(host: HTMLElement) {
    const left = el('div', { class: 'corner left' }, this.undoBtn, this.nextBtn);
    const right = el('div', { class: 'corner right' }, this.endBtn);
    this.root.append(
      this.top,
      this.chip,
      left,
      right,
      this.toastEl,
      this.panel,
      this.card,
      this.overlay,
    );
    host.append(this.root);
  }

  setTop(i: TopInfo): void {
    const army = (s: Side) =>
      el(
        'span',
        { class: `army ${s}` },
        el('b', {}, SIDE_NAME[s]),
        ` lost ${pct(i.lost[s])} `,
        el('small', {}, `/ breaks at ${pct(i.breakpoint[s])}`),
      );
    this.top.replaceChildren(
      el('span', { class: 'title' }, i.title),
      el(
        'span',
        { class: `turn ${i.side}` },
        `Turn ${i.turn} / ${i.turnLimit} · `,
        el('b', {}, `${SIDE_NAME[i.side]} to move`),
      ),
      el('span', { class: 'armies' }, army('blue'), army('red')),
    );
  }

  setButtons(b: { undo: boolean; next: boolean; end: boolean }): void {
    this.undoBtn.disabled = !b.undo;
    this.nextBtn.disabled = !b.next;
    this.endBtn.disabled = !b.end;
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
    this.card.replaceChildren(
      el('h2', { class: u.side }, `${SIDE_NAME[u.side]} ${u.type.name}`),
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
        stat('Melee', String(s.melee)),
        stat('Impact', String(s.impact)),
        stat('Ranged', s.range > 0 ? `${s.ranged} (${s.range})` : '—'),
        stat('Armor', String(s.armor)),
        stat('Morale', String(s.morale)),
        stat('Cost', String(s.cost)),
      ),
      u.type.tags.length
        ? el('ul', { class: 'tags' }, ...u.type.tags.map((t) => el('li', {}, TAG_TEXT[t])))
        : '',
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

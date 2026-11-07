import { AiPlayer } from '../ai/utility';
import { layout } from './layout';
import { BATTLES } from '../content/battles';
import { buildScenario, defaultPlacement, deploymentSquares } from '../content/campaign/build';
import type { ArmyChoice, CampaignBattle } from '../content/campaign/types';
import { startBattle } from '../core/engine';
import { samePos } from '../core/geometry';
import { BattleSession } from '../core/session';
import { unitAt } from '../core/state';
import type { BattleState, Pos } from '../core/types';
import { newlyUnlocked, type Unlocks } from '../meta/campaign';
import { cloneProfile } from '../meta/profile';
import { applyOutcome, bonusStatus, evaluate, objectiveText } from '../meta/rewards';
import { newProfile, type Profile } from '../meta/profile';
import type { SaveStore } from '../meta/saveStore';
import type { BattleView } from '../render/battleView';
import type { BattleSummary } from './combatLog';
import { Controller } from './controller';
import { defeatCeremony, titleCard, victoryCeremony } from './ceremonies';
import { battleDiagram } from './diagram';
import { GENERAL_BY_ID } from '../content/generals';
import { AGES } from '../content/campaign/ages';
import type { Command } from '../core/engine';
import { canUpgrade, rankForXp, xpForRank } from '../meta/profile';
import type { BattleOutcome, Rewards } from '../meta/rewards';
import { hideDetails } from './screens/cards';
import { el, Hud } from './hud';
import { EASE, gsap, MOTION, reducedMotion, sec } from './motion';
import type { GestureHandlers } from './input';
import {
  briefingScreen,
  ageMapScreen,
  timelineScreen,
  menuScreen,
  motionLabScreen,
  resultsScreen,
  rosterScreen,
  shopScreen,
  type AppApi,
} from './screens';

const randomSeed = () => Math.floor(Math.random() * 2 ** 31);

/** How a screen arrives (UX §4 transitions). */
interface Transition {
  /** 1 forward, -1 back. */
  dir?: 1 | -1;
  kind: 'slide' | 'zoom' | 'flip';
  from?: { rect: DOMRect; at: number };
}

/**
 * The whole game: menus and screens in HTML, battles on the shared Pixi view.
 * Gestures on the canvas go to whichever battle phase is active.
 */
export class App implements AppApi {
  profile: Profile;
  private screenHost = el('div', { class: 'screens' });
  private hud: Hud | null = null;
  private gestures: Partial<GestureHandlers> = {};
  /** The battle being played, so leaving it stops its AI and animations. */
  private controller: Controller | null = null;
  /**
   * Screen stack (menu → timeline → age map → briefing …). Each entry re-renders its
   * screen, so Back always shows fresh progress.
   */
  private stack: { key: string; render: () => HTMLElement }[] = [];

  constructor(
    private store: SaveStore,
    private view: BattleView,
  ) {
    this.profile = store.load() ?? newProfile(randomSeed());
    document.body.append(this.screenHost);
    // Remembers what was tapped, for the zoom (age node) and flip (battle seal) transitions.
    this.screenHost.addEventListener(
      'pointerdown',
      (e) => {
        const z = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-zoom]');
        this.tapped = z
          ? {
              rect: z.getBoundingClientRect(),
              at: Date.now(),
              kind: z.dataset.zoom === 'flip' ? 'flip' : 'zoom',
            }
          : null;
      },
      true,
    );
  }

  /** Handlers wired to the canvas once; they forward to the active battle phase. */
  readonly canvasGestures: GestureHandlers = {
    tap: (x, y) => this.gestures.tap?.(x, y),
    longPress: (x, y) => this.gestures.longPress?.(x, y),
    pan: (dx, dy) => this.view.pan(dx, dy),
    pinch: (f, cx, cy) => this.view.zoomAt(f, cx, cy),
  };

  save(): void {
    this.store.save(this.profile);
  }

  /**
   * Shows a screen. With a transition (UX §4): the old screen fades out in place while the
   * new one fades in and slides 8 px in the direction of travel, or grows out of the tapped
   * element (an age node zooms into its map; a battle seal flips into its briefing).
   * Without one (a refresh of the same screen) it swaps at once.
   */
  show(screen: HTMLElement, how?: Transition): void {
    const wasHidden = this.screenHost.classList.contains('hidden');
    hideDetails();
    this.endBattleUi();
    const old = this.screenHost.firstElementChild as HTMLElement | null;
    const scrolled = this.screenHost.scrollTop;
    gsap.killTweensOf(this.screenHost.children);
    this.screenHost.replaceChildren(screen);
    this.screenHost.classList.remove('hidden');
    // The host is the element that scrolls (screens.css), so a new screen opens at the top.
    this.screenHost.scrollTop = 0;
    if (!how || wasHidden) return;
    const reduced = reducedMotion();
    if (old && !reduced) {
      // The old screen stays where it was for the crossfade, then goes.
      old.classList.add('leaving');
      old.style.top = `${-scrolled}px`;
      this.screenHost.prepend(old);
      gsap.to(old, {
        opacity: 0,
        duration: sec(MOTION.quick),
        ease: EASE.in,
        onComplete: () => old.remove(),
      });
    }
    if (reduced) {
      gsap.fromTo(screen, { opacity: 0 }, { opacity: 1, duration: sec(MOTION.reducedFade) });
      return;
    }
    const from = how.from && Date.now() - how.from.at < 1500 ? how.from.rect : null;
    if (from && how.kind !== 'slide') {
      // Grows out of the tapped element: a zoom for an age, a flip for a battle seal.
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const ox = from.left + from.width / 2;
      const oy = from.top + from.height / 2;
      gsap.fromTo(
        screen,
        {
          opacity: 0,
          scale: Math.max(0.2, Math.min(from.width / vw, from.height / vh)),
          rotationY: how.kind === 'flip' ? -70 : 0,
          transformPerspective: 900,
          transformOrigin: `${(ox / vw) * 100}% ${(oy / vh) * 100}%`,
        },
        {
          opacity: 1,
          scale: 1,
          rotationY: 0,
          duration: sec(MOTION.reveal),
          ease: EASE.out,
          clearProps: 'transform,opacity',
        },
      );
      return;
    }
    gsap.fromTo(
      screen,
      { opacity: 0, x: 8 * (how.dir ?? 1) },
      { opacity: 1, x: 0, duration: sec(220), ease: EASE.out, clearProps: 'transform,opacity' },
    );
  }

  /** The element tapped last (for the zoom and flip transitions). */
  private tapped: { rect: DOMRect; at: number; kind: 'zoom' | 'flip' } | null = null;

  /** Pushes a screen (or replaces the top one if it is the same screen) and shows it. */
  private go(key: string, render: () => HTMLElement, first?: HTMLElement): void {
    const top = this.stack.at(-1);
    const same = top?.key === key;
    if (same) this.stack[this.stack.length - 1] = { key, render };
    else this.stack.push({ key, render });
    const t = this.tapped;
    this.tapped = null;
    this.show(
      first ?? render(),
      same ? undefined : { dir: 1, kind: t?.kind ?? 'slide', from: t ?? undefined },
    );
  }

  back(): void {
    if (this.stack.length > 1) this.stack.pop();
    const top = this.stack.at(-1);
    if (top) this.show(top.render(), { dir: -1, kind: 'slide' });
    else this.menu();
  }

  menu(): void {
    const fromScreen = this.stack.length > 0;
    this.stack = [{ key: 'menu', render: () => menuScreen(this) }];
    this.show(menuScreen(this), fromScreen ? { dir: -1, kind: 'slide' } : undefined);
  }

  campaign(): void {
    this.go('timeline', () => timelineScreen(this));
  }

  ageMap(ageId: number, unlocks?: Unlocks): void {
    const render = () => ageMapScreen(this, ageId);
    this.go(`age-${ageId}`, render, ageMapScreen(this, ageId, unlocks));
  }

  afterBattle(b: CampaignBattle, unlocks: Unlocks): void {
    this.stack = [
      { key: 'menu', render: () => menuScreen(this) },
      { key: 'timeline', render: () => timelineScreen(this) },
    ];
    this.ageMap(b.age, unlocks);
  }

  briefing(b: CampaignBattle): void {
    this.go(`briefing-${b.id}`, () => briefingScreen(this, b));
  }

  shop(): void {
    this.go('shop', () => shopScreen(this));
  }

  roster(tab: 'troops' | 'generals' = 'troops'): void {
    this.go('roster', () => rosterScreen(this, tab));
  }

  reset(): void {
    this.store.clear();
    this.profile = newProfile(randomSeed());
    this.save();
    this.menu();
  }

  private stopLayout: (() => void) | null = null;

  private endBattleUi(): void {
    this.stopLayout?.();
    this.stopLayout = null;
    this.controller?.dispose();
    this.controller = null;
    this.hud?.destroy();
    this.hud = null;
    this.gestures = {};
  }

  private enterBattleUi(state: BattleState): Hud {
    this.endBattleUi();
    this.screenHost.classList.add('hidden');
    this.view.loadMap(state);
    this.view.sync(state);
    this.hud = new Hud(document.body);
    // The camera uses the play area the HUD leaves (UX §1), and refits when it changes.
    const canvas = this.view.canvas;
    this.view.insets = () => {
      const r = canvas.getBoundingClientRect();
      return layout.insets({ x: r.left, y: r.top, w: r.width, h: r.height });
    };
    const focus = state.units.find((u) => u.side === 'blue');
    this.view.fit(focus);
    let last = '';
    this.stopLayout?.();
    this.stopLayout = layout.onChange(() => {
      const key = JSON.stringify(this.view.insets?.());
      if (key === last) return;
      last = key;
      this.view.fit(focus);
    });
    return this.hud;
  }

  // ---------- Deployment ----------

  deploy(b: CampaignBattle, army: ArmyChoice, intro = true): void {
    const seed = randomSeed();
    const zone = deploymentSquares(b);
    // One square per unit, then the general's own unit behind the line.
    const placement: Pos[] = defaultPlacement(b, army);
    // A fixed army with set starting squares (the Megiddo tutorial) is already placed for
    // its lesson: straight into battle.
    if (b.fixedArmy && b.startAt) {
      this.fight(b, army, placement, seed);
      if (intro) this.battleIntro(b);
      return;
    }
    let state = startBattle(buildScenario(b, army, seed, placement));
    const hud = this.enterBattleUi(state);
    if (intro) this.battleIntro(b);
    let selected: number | null = null;
    /** Two-tap placement (CLAUDE.md): the first tap on a square previews, the second places. */
    let pending: Pos | null = null;
    const highlight = () =>
      this.view.setHighlights({
        selected: selected !== null ? placement[selected]! : null,
        reach: zone.map((pos) => ({ pos, kind: 'move' as const })),
        charge: [],
        shoot: [],
      });
    const rebuild = () => {
      state = startBattle(buildScenario(b, army, seed, placement));
      this.view.sync(state);
      highlight();
    };
    hud.setTop({
      title: `${b.name} — deployment`,
      turn: 1,
      turnLimit: b.turnLimit,
      side: 'blue',
      lost: { blue: 0, red: 0 },
      breakpoint: { blue: 0.5, red: 0.5 },
      names: { blue: 'You', red: 'Enemy' },
    });
    hud.setChip(
      'Deployment: tap a unit (your general too), then a shaded square twice to move it there or swap. Then Start battle.',
    );
    hud.endBtn.textContent = 'Start battle';
    hud.setButtons({ end: true, menu: true });
    hud.menuBtn.onclick = () => this.back();
    hud.endBtn.onclick = () => this.fight(b, army, placement, seed);
    highlight();
    this.gestures.tap = (x, y) => {
      const cell = this.view.screenToCell(x, y);
      if (!cell) return;
      const idx = placement.findIndex((p) => samePos(p, cell));
      if (selected === null) {
        if (idx >= 0) selected = idx;
      } else if (idx === selected) {
        selected = null;
      } else if (zone.some((z) => samePos(z, cell))) {
        if (!pending || !samePos(pending, cell)) {
          pending = cell;
          const u = unitAt(state, placement[selected]!);
          if (u) this.view.showGhost(u, [placement[selected]!, cell], u.facing);
          hud.setChip(
            idx >= 0 ? 'Tap again to swap these units.' : 'Tap again to place the unit here.',
          );
          return;
        }
        if (idx >= 0) placement[idx] = placement[selected]!;
        placement[selected] = cell;
        selected = null;
        pending = null;
        this.view.clearGhost();
        hud.setChip('Placed. Tap another unit to move it, or Start battle.');
        rebuild();
        return;
      } else {
        selected = idx >= 0 ? idx : null;
      }
      pending = null;
      this.view.clearGhost();
      highlight();
    };
    this.gestures.longPress = (x, y) => {
      const cell = this.view.screenToCell(x, y);
      const u = cell && unitAt(state, cell);
      if (u) hud.showUnitCard(u, state);
    };
  }

  // ---------- Battle against the AI ----------

  private fight(b: CampaignBattle, army: ArmyChoice, placement: Pos[], seed: number): void {
    const state = startBattle(buildScenario(b, army, seed, placement));
    const session = new BattleSession(state);
    const hud = this.enterBattleUi(state);
    // A battle pays out once: a retreat, or the end-of-battle timer, whichever comes first.
    let finished = false;
    const finish = (final: BattleState, summary: BattleSummary | null) => {
      if (finished) return;
      finished = true;
      controller.dispose();
      const outcome = evaluate(b, final);
      const before = cloneProfile(this.profile);
      const rewards = applyOutcome(this.profile, b, outcome, army.general?.id ?? null, {
        seed,
        fielded: army.units.map((u) => u.type),
      });
      this.save();
      const unlocks = newlyUnlocked(before, this.profile);
      const retry = () => this.briefing(b);
      this.show(resultsScreen(this, b, outcome, rewards, summary, unlocks, retry));
      // The ceremony plays over the results page (motion skill: victory or defeat).
      this.resultCeremony(b, outcome, rewards, before, state, session.log, () =>
        this.afterBattle(b, unlocks),
      );
    };
    const controller = new Controller(session, this.view, hud, {
      title: b.name,
      sideNames: { blue: 'You', red: 'Enemy' },
      ai: {
        side: 'red',
        player: new AiPlayer('red', { posture: b.posture, attackTurn: b.attackTurn }),
      },
      // Tutorial steps until the battle has been won once.
      tutorial: b.tutorial && !this.profile.battles[b.id]?.wins ? b.tutorial : undefined,
      objective: (s) => ({
        text: objectiveText(b, s),
        bonus: b.bonusText.replace(/\.$/, ''),
        status: bonusStatus(b, s),
      }),
      onEnd: (final, summary) => window.setTimeout(() => finish(final, summary), 900),
      // Restart (UX §6): back to deployment with the same army and a fresh seed; no defeat.
      onRestart: () => this.deploy(b, army, false),
      onExit: (summary) => {
        // Retreating is a defeat, through the rules like any other command.
        if (!session.state.result) session.apply({ type: 'Concede', side: 'blue' });
        finish(session.state, summary);
      },
    });
    this.controller = controller;
    this.gestures = {
      tap: (x, y) => controller.tap(x, y),
      longPress: (x, y) => controller.longPress(x, y),
    };
  }

  /** The battle title card over the board, which inks in beneath it (motion skill). */
  private battleIntro(b: CampaignBattle): void {
    const age = AGES.find((a) => a.id === b.age);
    void titleCard({ place: b.name, year: b.year, age: age?.name ?? '' });
    this.view.intro(1400);
  }

  /** Victory or defeat over the results page; both are skippable with a tap. */
  private resultCeremony(
    b: CampaignBattle,
    o: BattleOutcome,
    r: Rewards,
    before: Profile,
    start: BattleState,
    log: Command[],
    toMap: () => void,
  ): void {
    if (!o.won) {
      const g = r.generalId ? GENERAL_BY_ID[r.generalId] : undefined;
      const tip =
        o.generalLost && g
          ? `${g.name} fell. Keep your general behind the line, where nearby units fight better.`
          : `The key to ${b.name}: ${b.problem.charAt(0).toLowerCase()}${b.problem.slice(1).replace(/\.$/, '')}.`;
      void defeatCeremony({ battle: b.name, tip }, () => this.briefing(b), toMap);
      return;
    }
    const g = r.generalId ? GENERAL_BY_ID[r.generalId] : undefined;
    const progress = (xp: number) => {
      const rank = rankForXp(xp);
      const lo = xpForRank(rank);
      const hi = xpForRank(rank + 1);
      return hi > lo ? Math.round((100 * (xp - lo)) / (hi - lo)) : 100;
    };
    const xpBefore = g ? (before.generals[g.id]?.xp ?? 0) : 0;
    const xpAfter = g ? (this.profile.generals[g.id]?.xp ?? 0) : 0;
    const rankUp = r.rankAfter > r.rankBefore;
    void victoryCeremony({
      battle: b.name,
      stars: o.stars,
      newStars: r.newStars,
      coinsFrom: before.coins,
      coinsTo: this.profile.coins,
      xp: g
        ? {
            name: g.name,
            from: progress(xpBefore),
            to: rankUp ? 100 : progress(xpAfter),
            rankUp: rankUp ? r.rankAfter : undefined,
          }
        : undefined,
      cards: r.cards,
      arrows: battleDiagram(start, log),
      upgradeReady: (c) => c.kind === 'unit' && canUpgrade(this.profile, c.id).ok,
    });
  }

  // ---------- Hot-seat ----------

  boardIntro(delayMs = 0): void {
    this.view.intro(delayMs);
  }

  motionLab(): void {
    this.go('motion-lab', () => motionLabScreen(this));
  }

  sandbox(id = 'sandbox', seed = randomSeed()): void {
    const make = BATTLES[id] ?? BATTLES.sandbox!;
    const scenario = make(seed);
    const session = new BattleSession(startBattle(scenario));
    const hud = this.enterBattleUi(session.state);
    const controller = new Controller(session, this.view, hud, {
      title: scenario.name,
      onExit: () => this.menu(),
      onRestart: () => this.sandbox(id),
    });
    this.controller = controller;
    this.gestures = {
      tap: (x, y) => controller.tap(x, y),
      longPress: (x, y) => controller.longPress(x, y),
    };
  }
}

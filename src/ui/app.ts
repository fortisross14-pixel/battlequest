import { AiPlayer } from '../ai/utility';
import { BATTLES } from '../content/battles';
import { buildScenario, deploymentSquares } from '../content/campaign/build';
import { MEGIDDO_TUTORIAL } from '../content/campaign/tutorial';
import type { ArmyChoice, CampaignBattle } from '../content/campaign/types';
import { startBattle } from '../core/engine';
import { samePos } from '../core/geometry';
import { BattleSession } from '../core/session';
import { unitAt } from '../core/state';
import type { BattleState, Pos } from '../core/types';
import { applyOutcome, evaluate } from '../meta/rewards';
import { newProfile, type Profile } from '../meta/profile';
import type { SaveStore } from '../meta/saveStore';
import type { BattleView } from '../render/battleView';
import { Controller } from './controller';
import { el, Hud } from './hud';
import type { GestureHandlers } from './input';
import {
  briefingScreen,
  campaignScreen,
  menuScreen,
  resultsScreen,
  rosterScreen,
  shopScreen,
  type AppApi,
} from './screens';

const randomSeed = () => Math.floor(Math.random() * 2 ** 31);

/**
 * The whole game: menus and screens in HTML, battles on the shared Pixi view.
 * Gestures on the canvas go to whichever battle phase is active.
 */
export class App implements AppApi {
  profile: Profile;
  private screenHost = el('div', { class: 'screens' });
  private hud: Hud | null = null;
  private gestures: Partial<GestureHandlers> = {};

  constructor(
    private store: SaveStore,
    private view: BattleView,
  ) {
    this.profile = store.load() ?? newProfile(randomSeed());
    document.body.append(this.screenHost);
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

  show(screen: HTMLElement): void {
    this.endBattleUi();
    this.screenHost.replaceChildren(screen);
    this.screenHost.classList.remove('hidden');
    // The host is the element that scrolls (screens.css), so a new screen opens at the top.
    this.screenHost.scrollTop = 0;
  }

  menu(): void {
    this.show(menuScreen(this));
  }

  campaign(): void {
    this.show(campaignScreen(this));
  }

  briefing(b: CampaignBattle): void {
    this.show(briefingScreen(this, b));
  }

  shop(): void {
    this.show(shopScreen(this));
  }

  roster(tab: 'troops' | 'generals' = 'troops'): void {
    this.show(rosterScreen(this, tab));
  }

  reset(): void {
    this.store.clear();
    this.profile = newProfile(randomSeed());
    this.save();
    this.menu();
  }

  private endBattleUi(): void {
    this.hud?.destroy();
    this.hud = null;
    this.gestures = {};
  }

  private enterBattleUi(state: BattleState): Hud {
    this.endBattleUi();
    this.screenHost.classList.add('hidden');
    this.view.loadMap(state);
    this.view.sync(state);
    this.view.fit(state.units.find((u) => u.side === 'blue'));
    this.hud = new Hud(document.body);
    return this.hud;
  }

  // ---------- Deployment ----------

  deploy(b: CampaignBattle, army: ArmyChoice): void {
    const seed = randomSeed();
    const zone = deploymentSquares(b);
    const placement: Pos[] = army.units.map((_, i) => zone[i]!);
    let state = startBattle(buildScenario(b, army, seed, placement));
    const hud = this.enterBattleUi(state);
    let selected: number | null = null;
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
      'Deployment: tap one of your units, then a shaded square to move it there (or swap). Then Start battle.',
    );
    hud.undoBtn.classList.add('hidden');
    hud.nextBtn.classList.add('hidden');
    hud.endBtn.textContent = 'Start battle';
    hud.setButtons({ undo: false, next: false, end: true, menu: true });
    hud.menuBtn.onclick = () => this.briefing(b);
    hud.endBtn.onclick = () => this.fight(b, army, placement, seed);
    highlight();
    this.gestures.tap = (x, y) => {
      const cell = this.view.screenToCell(x, y);
      if (!cell) return;
      const idx = placement.findIndex((p) => samePos(p, cell));
      if (selected === null) {
        if (idx >= 0) selected = idx;
      } else if (zone.some((z) => samePos(z, cell))) {
        if (idx >= 0) placement[idx] = placement[selected]!;
        placement[selected] = cell;
        selected = null;
        rebuild();
        return;
      } else {
        selected = idx >= 0 ? idx : null;
      }
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
    const finish = (final: BattleState) => {
      const outcome = evaluate(b, final);
      const rewards = applyOutcome(this.profile, b, outcome, army.general?.id ?? null, {
        seed,
        fielded: army.units.map((u) => u.type),
      });
      this.save();
      this.show(resultsScreen(this, b, outcome, rewards, () => this.briefing(b)));
    };
    const controller = new Controller(session, this.view, hud, {
      title: b.name,
      sideNames: { blue: 'You', red: 'Enemy' },
      ai: {
        side: 'red',
        player: new AiPlayer('red', { posture: b.posture, attackTurn: b.attackTurn }),
      },
      tutorial: b.tutorial ? MEGIDDO_TUTORIAL : undefined,
      onEnd: (final) => window.setTimeout(() => finish(final), 900),
      onExit: () => {
        // Retreating is a defeat.
        const final = structuredClone(session.state);
        final.result = { winner: 'red', reason: 'armyBroken', turn: final.turn, broken: ['blue'] };
        finish(final);
      },
    });
    this.gestures = {
      tap: (x, y) => controller.tap(x, y),
      longPress: (x, y) => controller.longPress(x, y),
    };
  }

  // ---------- Hot-seat ----------

  sandbox(id = 'sandbox', seed = randomSeed()): void {
    const make = BATTLES[id] ?? BATTLES.sandbox!;
    const scenario = make(seed);
    const session = new BattleSession(startBattle(scenario));
    const hud = this.enterBattleUi(session.state);
    const controller = new Controller(session, this.view, hud, {
      title: scenario.name,
      onExit: () => this.menu(),
    });
    this.gestures = {
      tap: (x, y) => controller.tap(x, y),
      longPress: (x, y) => controller.longPress(x, y),
    };
  }
}

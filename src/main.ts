import { BATTLES } from './content/battles';
import { startBattle } from './core/engine';
import { BattleSession } from './core/session';
import { BattleView } from './render/battleView';
import { Controller } from './ui/controller';
import { Hud } from './ui/hud';
import { attachGestures } from './ui/input';

/**
 * Entry point. URL parameters:
 * - scenario: battle id (default "sandbox"; "debug-states" shows every unit state)
 * - seed: RNG seed (default random, so every game rolls differently)
 */
async function start(): Promise<void> {
  const host = document.getElementById('app');
  if (!host) throw new Error('#app missing');
  const params = new URLSearchParams(window.location.search);
  const make = BATTLES[params.get('scenario') ?? 'sandbox'] ?? BATTLES.sandbox!;
  const seedParam = params.get('seed');
  const seed = seedParam !== null ? Number(seedParam) : Math.floor(Math.random() * 2 ** 31);
  const scenario = make(seed);

  const session = new BattleSession(startBattle(scenario));
  const view = await BattleView.create(host);
  view.loadMap(session.state);
  view.sync(session.state);
  const hud = new Hud(document.body);
  const layout = () => {
    const phone = window.innerHeight < 500;
    view.padding = phone
      ? { top: 44, bottom: 60, left: 8, right: 8 }
      : { top: 56, bottom: 76, left: 12, right: 12 };
  };
  layout();
  const firstUnit = session.state.units.find((u) => u.side === session.state.activeSide);
  view.fit(firstUnit);
  const controller = new Controller(session, view, hud, scenario.name);
  attachGestures(view.canvas, {
    tap: (x, y) => controller.tap(x, y),
    longPress: (x, y) => controller.longPress(x, y),
    pan: (dx, dy) => view.pan(dx, dy),
    pinch: (f, cx, cy) => view.zoomAt(f, cx, cy),
  });
  window.addEventListener('resize', () => {
    layout();
    // Let Pixi pick up the new size first.
    requestAnimationFrame(() => view.fit(firstUnit));
  });

  // Hooks for scripts/visual-check.mjs (dev server only).
  if (import.meta.env.DEV) {
    (window as unknown as { __bq: unknown }).__bq = {
      state: () => session.state,
      cellToScreen: (x: number, y: number) => view.cellToScreen({ x, y }),
    };
  }
}

void start();

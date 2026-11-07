import { LocalSaveStore } from './meta/saveStore';
import { isAnimating } from './ui/motion';
import { BattleView } from './render/battleView';
import { App } from './ui/app';
import { attachGestures } from './ui/input';

/**
 * Entry point. Without parameters the game opens on the main menu.
 * URL parameters (for testing and scripts/visual-check.mjs):
 * - scenario: open a hot-seat battle directly ("sandbox", "debug-states", "debug-endgame")
 * - seed: RNG seed for that battle
 */
async function start(): Promise<void> {
  const host = document.getElementById('app');
  if (!host) throw new Error('#app missing');
  const view = await BattleView.create(host);
  const app = new App(new LocalSaveStore(), view);
  const layout = () => {
    const phone = window.innerHeight < 500;
    view.padding = phone
      ? { top: 44, bottom: 60, left: 8, right: 8 }
      : { top: 56, bottom: 76, left: 12, right: 12 };
  };
  layout();
  attachGestures(view.canvas, app.canvasGestures);
  window.addEventListener('resize', () => {
    layout();
    requestAnimationFrame(() => view.fit());
  });

  const params = new URLSearchParams(window.location.search);
  const scenario = params.get('scenario');
  if (scenario) {
    const seed = params.get('seed');
    app.sandbox(scenario, seed !== null ? Number(seed) : undefined);
  } else {
    app.menu();
  }

  // Hooks for scripts/visual-check.mjs (dev server only).
  if (import.meta.env.DEV) {
    (window as unknown as { __bq: unknown }).__bq = {
      app,
      cellToScreen: (x: number, y: number) => view.cellToScreen({ x, y }),
      animating: () => isAnimating(),
    };
  }
}

void start();

import { Application, Graphics } from 'pixi.js';

// M0 placeholder: an empty parchment map with a subtle grid.
async function start(): Promise<void> {
  const host = document.getElementById('app');
  if (!host) throw new Error('#app missing');
  const app = new Application();
  await app.init({ resizeTo: host, background: 0xefe6cf, antialias: true });
  host.appendChild(app.canvas);
  const cols = 16;
  const rows = 10;
  const size = 56;
  const grid = new Graphics();
  for (let x = 0; x <= cols; x++) grid.moveTo(x * size, 0).lineTo(x * size, rows * size);
  for (let y = 0; y <= rows; y++) grid.moveTo(0, y * size).lineTo(cols * size, y * size);
  grid.stroke({ width: 1, color: 0x6b5a3a, alpha: 0.25 });
  grid.position.set(20, 20);
  app.stage.addChild(grid);
}

void start();

// Visual check: screenshots the running game at tablet and phone sizes.
// Usage: node scripts/visual-check.mjs [--url http://localhost:5173] [--label name]
// Needs the dev server running (npm run dev). Uses the pre-installed Playwright browsers.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const arg = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const base = arg('url', 'http://localhost:5173');
const label = arg('label', 'check');
const outDir = join('screenshots', `${new Date().toISOString().slice(0, 10)}-${label}`);
mkdirSync(outDir, { recursive: true });

const SIZES = [
  { name: 'tablet', width: 1024, height: 768 },
  { name: 'phone', width: 812, height: 375 },
];

async function open(page, query) {
  await page.goto(`${base}/?${query}`);
  await page.waitForFunction(() => window.__bq !== undefined);
  await page.waitForTimeout(300);
}

async function screen(page, x, y) {
  return page.evaluate(([cx, cy]) => window.__bq.cellToScreen(cx, cy), [x, y]);
}

async function tapCell(page, x, y) {
  const p = await screen(page, x, y);
  await page.touchscreen.tap(p.x, p.y);
  await page.waitForTimeout(250);
}

/** Taps a point next to a cell (for facing-ring handles). */
async function tapNear(page, x, y, dx, dy) {
  const p = await screen(page, x, y);
  await page.touchscreen.tap(p.x + dx, p.y + dy);
  await page.waitForTimeout(500);
}

async function longPress(page, x, y) {
  const p = await screen(page, x, y);
  // Pointer events with a hold (a mouse pointer drives the same code path as touch).
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  await page.waitForTimeout(700);
  await page.mouse.up();
  await page.waitForTimeout(200);
}

/** Taps End turn, and confirms if the game asks about units that haven't moved. */
async function endTurn(page, size, label) {
  await page.locator('.hud .corner.right .btn.primary').tap();
  await page.waitForTimeout(300);
  const sheet = page.locator('.overlay:not(.hidden) .sheet');
  if (await sheet.isVisible()) {
    if (label) await shot(page, size, label);
    await sheet.getByRole('button', { name: 'End turn' }).tap();
  }
}

async function shot(page, size, name) {
  const file = join(outDir, `${size.name}-${name}.png`);
  await page.screenshot({ path: file });
  console.log(file);
}

async function smallTargets(page) {
  // Every visible button must be at least 44x44 CSS px.
  return page.evaluate(() =>
    [...document.querySelectorAll('button')]
      .filter((b) => b.offsetParent !== null)
      .map((b) => {
        const r = b.getBoundingClientRect();
        return { text: b.textContent, w: Math.round(r.width), h: Math.round(r.height) };
      })
      .filter((b) => b.w < 44 || b.h < 44),
  );
}

/** A save from version 1 of the game, after winning Megiddo. */
const V1_SAVE = {
  version: 1,
  coins: 400,
  units: {
    egyptianSpearmen: { level: 1, dupes: 2 },
    egyptianArchers: { level: 1, dupes: 0 },
    egyptianChariots: { level: 1, dupes: 1 },
    hittiteSpearmen: { level: 1, dupes: 0 },
  },
  generals: { captain: { xp: 140, resting: false } },
  battles: { megiddo: { stars: 2, wins: 1, plays: 1 } },
  unlockedAge: 1,
  generalPity: 0,
  rng: 99,
  dailyBought: null,
  lastArmy: {},
};

const browser = await chromium.launch();
const problems = [];
for (const size of SIZES) {
  const ctx = await browser.newContext({
    viewport: { width: size.width, height: size.height },
    deviceScaleFactor: 1,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => problems.push(`${size.name}: page error ${e.message}`));
  page.on(
    'console',
    (m) => m.type() === 'error' && problems.push(`${size.name}: console ${m.text()}`),
  );

  // Sandbox: initial board, selection, ghost, facing ring, hand-off.
  await open(page, 'scenario=sandbox&seed=1');
  await shot(page, size, '01-initial');
  await tapCell(page, 5, 4); // b-legion1
  await shot(page, size, '02-selected');
  await tapCell(page, 7, 3);
  await shot(page, size, '03-ghost');
  await tapCell(page, 7, 3);
  await page.waitForTimeout(700);
  await shot(page, size, '04-facing-ring');
  await tapNear(page, 7, 3, 0, -60); // pick a handle (north-ish)
  await shot(page, size, '05-after-ring');
  const small = await smallTargets(page);
  if (small.length) problems.push(`${size.name}: small buttons ${JSON.stringify(small)}`);

  // Debug scenario: every cohesion state, a charge preview and a shot preview.
  await open(page, 'scenario=debug-states&seed=3');
  await shot(page, size, '06-states');
  await tapCell(page, 3, 3); // b-knights
  await shot(page, size, '07-knights-selected');
  await tapCell(page, 6, 3); // r-archers
  await shot(page, size, '08-charge-preview');
  const confirm = page.getByRole('button', { name: /Confirm charge/ });
  await confirm.tap();
  await page.waitForTimeout(2200);
  await shot(page, size, '09-after-charge');
  await tapCell(page, 3, 5); // b-archers
  await tapCell(page, 6, 5); // r-spear
  await shot(page, size, '10-shoot-preview');
  await page.getByRole('button', { name: 'Cancel' }).tap();
  await longPress(page, 9, 4); // elephants
  await shot(page, size, '11-unit-card');
  await page.getByRole('button', { name: 'Close' }).tap();
  await endTurn(page, size, '11b-end-turn-confirm');
  await page.waitForTimeout(2500);
  await shot(page, size, '12-handoff');
  await page.getByRole('button', { name: 'Start turn' }).tap();
  await page.waitForTimeout(400);
  await shot(page, size, '13-red-turn');

  // Endgame: one charge breaks the red army and the result screen appears.
  await open(page, 'scenario=debug-endgame&seed=1');
  await tapCell(page, 3, 3);
  await tapCell(page, 6, 3);
  await page.getByRole('button', { name: /Confirm charge/ }).tap();
  await page.waitForTimeout(2500);
  await shot(page, size, '14-result');
  if (!(await page.getByRole('button', { name: 'Back to menu' }).isVisible())) {
    problems.push(`${size.name}: no result screen after the endgame charge`);
  }

  // Campaign flow from a fresh profile.
  await page.goto(`${base}/`);
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${base}/`);
  await page.waitForFunction(() => window.__bq !== undefined);
  await page.waitForTimeout(300);
  await shot(page, size, '20-menu');
  await page.getByRole('button', { name: /Continue: Megiddo/ }).tap();
  await page.waitForTimeout(300);
  await shot(page, size, '21-briefing');
  await page.getByRole('button', { name: /Deploy/ }).tap();
  await page.waitForTimeout(500);
  await shot(page, size, '22-deployment');
  await page.getByRole('button', { name: 'Start battle' }).tap();
  await page.waitForTimeout(600);
  await shot(page, size, '23-battle-tutorial');
  const cs = await smallTargets(page);
  if (cs.length) problems.push(`${size.name} (battle): small buttons ${JSON.stringify(cs)}`);
  // Let the enemy AI play a turn, with the speed control visible.
  await endTurn(page, size, '23a-end-turn-confirm');
  await page.waitForTimeout(700);
  await shot(page, size, '23b-enemy-turn');
  await page.waitForFunction(
    () => window.__bq.app && !document.querySelector('.hud .btn.primary')?.disabled,
    null,
    { timeout: 30000 },
  );
  await shot(page, size, '23c-after-enemy-turn');
  await page.getByRole('button', { name: 'Leave battle' }).tap();
  await page.getByRole('button', { name: 'Leave', exact: true }).tap();
  await page.waitForTimeout(1200);
  await shot(page, size, '24-results');
  await page.getByRole('button', { name: 'Campaign' }).tap();
  await page.waitForTimeout(300);
  await shot(page, size, '25-campaign');
  await page.getByRole('button', { name: /Back/ }).tap();
  await page.getByRole('button', { name: 'Shop' }).tap();
  await page.waitForTimeout(300);
  await page
    .getByRole('button', { name: /Buy · ● 120/ })
    .first()
    .tap();
  await page.waitForTimeout(900);
  await shot(page, size, '26-shop-reveal');
  await page.getByRole('button', { name: 'Show in Army' }).tap();
  await page.waitForTimeout(300);
  await shot(page, size, '27-troops');
  await page.getByRole('button', { name: 'Generals' }).tap();
  await page.waitForTimeout(300);
  await shot(page, size, '28-generals');
  const ms = await smallTargets(page);
  if (ms.length) problems.push(`${size.name} (screens): small buttons ${JSON.stringify(ms)}`);

  // Army builder after Megiddo, loaded from an old v1 save (checks the migration too).
  await page.evaluate((save) => {
    localStorage.setItem('battlequest.profile.v1', JSON.stringify(save));
  }, V1_SAVE);
  await page.goto(`${base}/`);
  await page.waitForFunction(() => window.__bq !== undefined);
  await page.waitForTimeout(300);
  await shot(page, size, '30-menu-old-save');
  await page.getByRole('button', { name: /Continue: Kadesh/ }).tap();
  await page.waitForTimeout(300);
  await shot(page, size, '31-kadesh-briefing');
  await page.evaluate(() => document.querySelector('.builder')?.scrollIntoView());
  await page.waitForTimeout(200);
  await shot(page, size, '32-builder');
  for (let i = 0; i < 3; i++) {
    for (const b of await page.getByRole('button', { name: /^Remove one/ }).all()) {
      if (await b.isEnabled()) await b.tap();
    }
  }
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: 'Add one Egyptian chariots' }).tap();
  }
  await page.evaluate(() => document.querySelector('.builder')?.scrollIntoView());
  await page.waitForTimeout(200);
  await shot(page, size, '33-three-chariots');
  if (!(await page.getByRole('button', { name: /Deploy/ }).isEnabled())) {
    problems.push(`${size.name}: 3 chariots at Kadesh can't deploy`);
  }
  const bs = await smallTargets(page);
  if (bs.length) problems.push(`${size.name} (builder): small buttons ${JSON.stringify(bs)}`);
  await page.getByRole('button', { name: /Back/ }).tap();
  await page.getByRole('button', { name: /Back/ }).tap();
  await page.getByRole('button', { name: /^Army/ }).tap();
  await page.waitForTimeout(300);
  await shot(page, size, '34-troops-upgrade');
  await page
    .getByRole('button', { name: /^Upgrade to Lv2/ })
    .first()
    .tap();
  await page.waitForTimeout(300);
  await shot(page, size, '35-after-upgrade');
  await ctx.close();
}
await browser.close();
if (problems.length) {
  console.log('\nProblems:');
  for (const p of problems) console.log(` - ${p}`);
  process.exitCode = 1;
} else {
  console.log('\nNo page errors; all visible buttons are at least 44x44 px.');
}

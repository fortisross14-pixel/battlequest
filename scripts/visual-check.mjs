// Visual check: screenshots the running game at tablet and phone sizes.
// Usage: node scripts/visual-check.mjs [--url http://localhost:5173] [--label name]
// Needs the dev server running (npm run dev). Uses the pre-installed Playwright browsers.
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/** The project's Playwright, or a globally installed one. Never downloads browsers. */
function loadPlaywright() {
  try {
    return require('playwright');
  } catch {
    const root = execSync('npm root -g').toString().trim();
    return createRequire(join(root, 'noop.js'))('playwright');
  }
}

/**
 * A pre-installed Chromium to launch, if Playwright's own revision isn't present:
 * $BQ_CHROMIUM, or the newest chromium-* under $PLAYWRIGHT_BROWSERS_PATH or /opt/pw-browsers.
 */
function findChromium() {
  if (process.env.BQ_CHROMIUM && existsSync(process.env.BQ_CHROMIUM)) {
    return process.env.BQ_CHROMIUM;
  }
  for (const dir of [process.env.PLAYWRIGHT_BROWSERS_PATH, '/opt/pw-browsers']) {
    if (!dir || !existsSync(dir)) continue;
    const builds = readdirSync(dir)
      .filter((d) => /^chromium-\d+$/.test(d))
      .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]));
    for (const b of builds) {
      for (const exe of ['chrome-linux64/chrome', 'chrome-linux/chrome', 'chrome-win/chrome.exe']) {
        const p = join(dir, b, exe);
        if (existsSync(p)) return p;
      }
    }
  }
  return undefined;
}

const { chromium } = loadPlaywright();

async function launch() {
  try {
    return await chromium.launch();
  } catch (e) {
    const executablePath = findChromium();
    if (!executablePath) throw e;
    console.log(`Playwright's browser is missing; using ${executablePath}`);
    return chromium.launch({ executablePath });
  }
}

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

const browser = await launch();
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
  // Archers: the Turn button and the missile range area.
  await tapCell(page, 4, 5); // b-archers
  await shot(page, size, '05a-archer-range');
  await page.getByRole('button', { name: 'Turn the selected unit' }).tap();
  await page.waitForTimeout(400);
  await shot(page, size, '05a2-turn-ring');
  await tapCell(page, 0, 9);
  await longPress(page, 13, 4); // empty hill square: terrain card
  await shot(page, size, '05b-terrain-card');
  await page.getByRole('button', { name: 'Close' }).tap();
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
  await page.waitForTimeout(900);
  await shot(page, size, '23-battle-tutorial');
  // Step 1 marks the spearmen; selecting them moves the gold ring to the square to move to.
  {
    const p = await screen(page, 3, 3);
    await page.touchscreen.tap(p.x, p.y);
    await page.waitForTimeout(400);
    await shot(page, size, '23e-tutorial-move-square');
    const q = await screen(page, 4, 3);
    await page.touchscreen.tap(q.x, q.y);
    await page.waitForTimeout(300);
    await page.touchscreen.tap(q.x, q.y);
    await page.waitForTimeout(700);
    // Keep the facing (tap elsewhere): the next step marks the spearmen and the north enemy.
    const r = await screen(page, 1, 7);
    await page.touchscreen.tap(r.x, r.y);
    await page.waitForTimeout(400);
    await shot(page, size, '23f-tutorial-charge-targets');
    // Charge with the spearmen (select, tap the enemy, confirm): the next step marks the
    // north chariots, so the card moves off them.
    const sp = await screen(page, 4, 3);
    await page.touchscreen.tap(sp.x, sp.y);
    await page.waitForTimeout(300);
    const en = await screen(page, 6, 3);
    await page.touchscreen.tap(en.x, en.y);
    await page.waitForTimeout(400);
    await page.getByRole('button', { name: 'Confirm charge' }).tap();
    await page.waitForTimeout(1500);
    await shot(page, size, '23g-tutorial-flank-step');
  }
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
  await page.getByRole('button', { name: 'Combat log' }).tap();
  await page.waitForTimeout(300);
  await shot(page, size, '23d-combat-log');
  await page.locator('.log-drawer').getByRole('button', { name: 'Close' }).tap();
  await page.getByRole('button', { name: 'Leave battle' }).tap();
  await page.getByRole('button', { name: 'Leave', exact: true }).tap();
  await page.waitForTimeout(1200);
  await shot(page, size, '24-results');
  // Results continue to the age map; Back goes to the timeline, then the menu.
  await page.getByRole('button', { name: /^Continue/ }).tap();
  await page.waitForTimeout(700);
  await shot(page, size, '25-age-map');
  await page.getByRole('button', { name: /Back/ }).tap();
  await page.waitForTimeout(400);
  await shot(page, size, '25b-timeline');
  await page.getByRole('button', { name: /Back/ }).tap();
  await page.getByRole('button', { name: 'Shop' }).tap();
  await page.waitForTimeout(300);
  await shot(page, size, '26-shop-age0');
  await page.getByRole('button', { name: /Back/ }).tap();
  await page.getByRole('button', { name: /^Army/ }).tap();
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
  // Slot picker: put Bronze Age chariots in all four slots (copies are allowed).
  for (let i = 1; i <= 4; i++) {
    await page.getByRole('button', { name: new RegExp(`^Slot ${i}:`) }).tap();
    await page.waitForTimeout(200);
    if (i === 1) await shot(page, size, '32b-slot-picker');
    await page.getByRole('button', { name: `Put Bronze Age chariots in slot ${i}` }).tap();
    await page.waitForTimeout(150);
  }
  // Long-press a general card for its details.
  const gen = page.locator('.builder .mini-card.pick').first();
  const gb = await gen.boundingBox();
  if (gb) {
    await page.mouse.move(gb.x + 30, gb.y + 20);
    await page.waitForTimeout(400);
    await shot(page, size, '32c-general-details');
    await page.mouse.move(2, 2);
    // Builder step 2: tap the general.
    await gen.tap();
    await page.waitForTimeout(200);
  }
  await page.evaluate(() => document.querySelector('.builder')?.scrollIntoView());
  await page.waitForTimeout(200);
  await shot(page, size, '33-four-chariots');
  if (!(await page.getByRole('button', { name: /Deploy/ }).isEnabled())) {
    problems.push(`${size.name}: 4 chariots at Kadesh can't deploy`);
  }
  const bs = await smallTargets(page);
  if (bs.length) problems.push(`${size.name} (builder): small buttons ${JSON.stringify(bs)}`);
  // The briefing was opened from the menu: one Back returns there.
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

  // Kadesh: the second tutorial battle (shooting and a general skill).
  await page.getByRole('button', { name: /Back/ }).tap();
  await page.evaluate(async () => {
    const mod = await import('/src/content/campaign/battles.ts');
    const b = mod.BATTLE_BY_ID.kadesh;
    window.__bq.app.deploy(b, b.testArmy);
  });
  await page.waitForTimeout(500);
  await shot(page, size, '35b-kadesh-deployment');
  await page.getByRole('button', { name: 'Start battle' }).tap();
  await page.waitForTimeout(600);
  await shot(page, size, '36-kadesh-tutorial');
  // Select the archers: the next step marks the enemies in range.
  {
    // The test army's third unit is the archers; it starts on its default square.
    const archer = await page.evaluate(async () => {
      const battles = await import('/src/content/campaign/battles.ts');
      const build = await import('/src/content/campaign/build.ts');
      const k = battles.BATTLE_BY_ID.kadesh;
      return build.defaultPlacement(k, k.testArmy)[2];
    });
    if (archer) {
      const p = await screen(page, archer.x, archer.y);
      await page.touchscreen.tap(p.x, p.y);
      await page.waitForTimeout(400);
      await shot(page, size, '36b-kadesh-shoot-targets');
    }
  }
  await page.getByRole('button', { name: 'Leave battle' }).tap();
  await page.getByRole('button', { name: 'Leave', exact: true }).tap();
  await page.waitForTimeout(1200);

  // Timeline after Age 0, and the Antiquity map with starred and locked nodes.
  await page.evaluate(() => {
    const app = window.__bq.app;
    const won = (stars) => ({ stars, wins: 1, plays: 1 });
    Object.assign(app.profile.battles, {
      megiddo: won(3),
      kadesh: won(2),
      qarqar: won(2),
      marathon: won(1),
    });
  });
  // Opening Antiquity grants its Commons, generic generals and the age-unlock bonus.
  await page.evaluate(async () => {
    const mod = await import('/src/meta/campaign.ts');
    const app = window.__bq.app;
    mod.syncAgeUnlocks(app.profile);
    app.save();
    app.campaign();
  });
  await page.waitForTimeout(600);
  await shot(page, size, '37-timeline-after-age0');
  await page.getByRole('button', { name: /^Antiquity/ }).tap();
  await page.waitForTimeout(800);
  await shot(page, size, '38-antiquity-map');
  const locked = page.locator('.battle-node.locked').first();
  if (await locked.count()) {
    const lb = await locked.boundingBox();
    if (lb) await page.touchscreen.tap(lb.x + lb.width / 2, lb.y + 22);
    await page.waitForTimeout(300);
    await shot(page, size, '39-locked-tap');
  }
  const ns = await smallTargets(page);
  if (ns.length) problems.push(`${size.name} (age map): small buttons ${JSON.stringify(ns)}`);

  // The Antiquity shop tab: first Recruit Pack (a Rare guaranteed) and first General Pack.
  await page.evaluate(() => window.__bq.app.shop());
  await page.waitForTimeout(400);
  await shot(page, size, '41-shop-antiquity');
  await page
    .getByRole('button', { name: /Buy · ● 120/ })
    .first()
    .tap();
  await page.waitForTimeout(900);
  await shot(page, size, '42-recruit-reveal');
  await page
    .getByRole('button', { name: /Buy · ● 250/ })
    .first()
    .tap();
  await page.waitForTimeout(900);
  await shot(page, size, '42b-general-reveal');
  const ss = await smallTargets(page);
  if (ss.length) problems.push(`${size.name} (shop): small buttons ${JSON.stringify(ss)}`);

  // Army limits in the slot picker: one Legendary per army, two of each Epic.
  await page.evaluate(async () => {
    const app = window.__bq.app;
    app.profile.units.companionCavalry = { level: 1, cards: 0 };
    app.profile.units.thebanSacredBand = { level: 1, cards: 0 };
    app.profile.lastArmy.thermopylae = {
      units: [
        { type: 'companionCavalry' },
        { type: 'thebanSacredBand' },
        { type: 'thebanSacredBand' },
      ],
    };
    app.save();
    const mod = await import('/src/content/campaign/battles.ts');
    app.briefing(mod.BATTLE_BY_ID.thermopylae);
  });
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: /^Slot 2:/ }).tap();
  await page.waitForTimeout(300);
  await shot(page, size, '43-picker-limits');
  await page.locator('.picker').getByRole('button', { name: 'Close' }).tap();

  // New Antiquity battlefields: scythed chariots at Gaugamela, elephants at Hydaspes.
  // Classical Empires: every Antiquity main battle won opens it; some battles starred.
  await page.evaluate(async () => {
    const app = window.__bq.app;
    const ages = await import('/src/content/campaign/ages.ts');
    const won = (stars) => ({ stars, wins: 1, plays: 1 });
    for (const id of ages.AGES[1].battles) app.profile.battles[id] ??= won(2);
    Object.assign(app.profile.battles, { heraclea: won(3), trebia: won(2), bagradas: won(1) });
    const mod = await import('/src/meta/campaign.ts');
    mod.syncAgeUnlocks(app.profile);
    app.save();
    app.campaign();
  });
  await page.waitForTimeout(600);
  await shot(page, size, '44-timeline-classical');
  await page.getByRole('button', { name: /^Classical Empires/ }).tap();
  await page.waitForTimeout(800);
  await shot(page, size, '44b-classical-map');
  const cs2 = await smallTargets(page);
  if (cs2.length)
    problems.push(`${size.name} (classical map): small buttons ${JSON.stringify(cs2)}`);

  // New battlefields: Gaugamela, Hydaspes, Lake Trasimene and the Teutoburg Forest.
  for (const id of ['gaugamela', 'hydaspes', 'lakeTrasimene', 'teutoburgForest']) {
    await page.evaluate(async (battleId) => {
      const mod = await import('/src/content/campaign/battles.ts');
      const b = mod.BATTLE_BY_ID[battleId];
      window.__bq.app.menu();
      window.__bq.app.deploy(b, b.testArmy);
    }, id);
    await page.waitForTimeout(800);
    const start = page.getByRole('button', { name: 'Start battle' });
    if (!(await start.isVisible())) {
      await shot(page, size, `40-${id}-no-start`);
      problems.push(`${size.name}: ${id} did not reach deployment`);
      continue;
    }
    await start.evaluate((el) => el.click());
    await page.waitForTimeout(600);
    await shot(page, size, `40-${id}`);
    await page.evaluate(() => window.__bq.app.menu());
    await page.waitForTimeout(600);
  }
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

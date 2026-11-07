// Motion check (motion-check skill): records animations as contact sheets, measures fps with
// 4× CPU throttling, and runs the skip and reduced-motion checks.
// Usage: node scripts/motion-check.mjs [--url http://localhost:5173] [--size tablet|phone|both] [--only name,name]
// Needs the dev server running. Uses the pre-installed Playwright browsers; never downloads.
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
function loadPlaywright() {
  try {
    return require('playwright');
  } catch {
    const root = execSync('npm root -g').toString().trim();
    return createRequire(join(root, 'noop.js'))('playwright');
  }
}
function findChromium() {
  if (process.env.BQ_CHROMIUM && existsSync(process.env.BQ_CHROMIUM))
    return process.env.BQ_CHROMIUM;
  for (const dir of [process.env.PLAYWRIGHT_BROWSERS_PATH, '/opt/pw-browsers']) {
    if (!dir || !existsSync(dir)) continue;
    for (const b of readdirSync(dir)
      .filter((d) => /^chromium-\d+$/.test(d))
      .sort()
      .reverse()) {
      for (const exe of ['chrome-linux64/chrome', 'chrome-linux/chrome', 'chrome-win/chrome.exe']) {
        if (existsSync(join(dir, b, exe))) return join(dir, b, exe);
      }
    }
  }
  return undefined;
}
const { chromium } = loadPlaywright();

const args = process.argv.slice(2);
const arg = (n, d) => (args.includes(`--${n}`) ? args[args.indexOf(`--${n}`) + 1] : d);
const base = arg('url', 'http://localhost:5173');
const sizeArg = arg('size', 'tablet');
const only = arg('only', '')?.split(',').filter(Boolean) ?? [];
const outDir = join('screenshots', `${new Date().toISOString().slice(0, 10)}-motion`);
mkdirSync(outDir, { recursive: true });
const SIZES = [
  { name: 'tablet', width: 1024, height: 768 },
  { name: 'phone', width: 812, height: 375 },
].filter((s) => sizeArg === 'both' || s.name === sizeArg);

async function open(page, query) {
  // A fresh page each time (the same URL twice may not reload).
  await page.goto('about:blank');
  await page.goto(`${base}/?${query}`);
  await page.waitForFunction(() => window.__bq !== undefined);
  await page.waitForTimeout(400);
}
async function cell(page, x, y) {
  return page.evaluate(([cx, cy]) => window.__bq.cellToScreen(cx, cy), [x, y]);
}
async function tapCell(page, x, y) {
  const p = await cell(page, x, y);
  await page.touchscreen.tap(p.x, p.y);
  await page.waitForTimeout(450);
}

/** Measures frame rate while `start()` plays, with no screenshots in the way. */
async function measure(page, start, ms) {
  await page.evaluate(() => {
    window.__frames = [];
    const tick = (t) => {
      window.__frames.push(t);
      if (window.__frames.length < 5000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await start();
  await page.waitForTimeout(ms);
  const ts = await page.evaluate(() => window.__frames);
  const gaps = ts.slice(1).map((t, i) => t - ts[i]);
  return {
    avg: gaps.length ? Math.round(1000 / (gaps.reduce((a, b) => a + b, 0) / gaps.length)) : 0,
    worst: gaps.length ? Math.round(1000 / Math.max(...gaps)) : 0,
  };
}

/** Captures frames for `ms` after `start()` runs; returns [{t, png}]. */
async function record(page, cdp, start, ms = 1200, every = 100) {
  // The screencast streams every painted frame with its time: sample one per  ms.
  const all = [];
  const onFrame = (f) => {
    all.push({ ts: f.metadata.timestamp * 1000, data: f.data });
    void cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
  };
  cdp.on('Page.screencastFrame', onFrame);
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 70, everyNthFrame: 1 });
  await page.waitForTimeout(150);
  const t0 = Date.now();
  await start();
  await page.waitForTimeout(ms);
  await cdp.send('Page.stopScreencast');
  cdp.off('Page.screencastFrame', onFrame);
  const begin = all.find((f) => f.ts >= t0)?.ts ?? all[0]?.ts ?? t0;
  const frames = [];
  for (let t = 0; t <= ms; t += every) {
    const f = [...all].reverse().find((x) => x.ts - begin <= t) ?? all[0];
    if (f) frames.push({ t, png: Buffer.from(f.data, 'base64'), jpeg: true });
  }
  return { frames };
}

/** Tiles frames into one contact sheet, rendered by the browser. */
async function contactSheet(browser, frames, file, title) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 800 } });
  const tiles = frames
    .map(
      (f) =>
        `<figure><img src="data:image/${f.jpeg ? 'jpeg' : 'png'};base64,${f.png.toString('base64')}"><figcaption>${f.t} ms</figcaption></figure>`,
    )
    .join('');
  await page.setContent(
    `<html><body style="margin:0;background:#2b2620;font:12px sans-serif;color:#eee"><h3 style="margin:8px">${title}</h3><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:6px">${tiles}</div><style>figure{margin:0}img{width:100%;display:block}figcaption{padding:2px 4px}</style></body></html>`,
  );
  await page.screenshot({ path: file, fullPage: true });
  await page.close();
}

/** Recording length per sequence (ms), when longer than the default. */
const LENGTH = { breakthrough: 2400, charge: 2000, volley: 1800 };

/** Sequences: each sets up, then returns the action to record. */
const SEQUENCES = {
  bubble: async (page) => {
    await open(page, 'scenario=sandbox&seed=1');
    return () => tapCell(page, 5, 4);
  },
  ghost: async (page) => {
    await open(page, 'scenario=sandbox&seed=1');
    await tapCell(page, 5, 4);
    return () => tapCell(page, 7, 3);
  },
  volley: async (page) => {
    await open(page, 'scenario=debug-actions&seed=1');
    await tapCell(page, 3, 1);
    await tapCell(page, 6, 1);
    await page.getByRole('tab', { name: /^Volley/ }).tap();
    await page.waitForTimeout(300);
    return () => page.getByRole('button', { name: 'Fire volley' }).evaluate((b) => b.click());
  },
  fortify: async (page) => {
    await open(page, 'scenario=debug-actions&seed=1');
    await tapCell(page, 4, 6);
    await page.waitForTimeout(300);
    return () => page.locator('.petal.hold').tap();
  },
  breakthrough: async (page) => {
    // Seed 1 breaks through (75% chance).
    await open(page, 'scenario=debug-actions&seed=1');
    await tapCell(page, 2, 4);
    await tapCell(page, 6, 4);
    await page.getByRole('tab', { name: /^Full charge/ }).tap();
    await page.waitForTimeout(300);
    return () =>
      page.getByRole('button', { name: 'Full charge', exact: true }).evaluate((b) => b.click());
  },
  move: async (page) => {
    await open(page, 'scenario=sandbox&seed=1');
    await tapCell(page, 5, 4);
    await tapCell(page, 7, 3);
    return () => tapCell(page, 7, 3);
  },
  charge: async (page) => {
    await open(page, 'scenario=debug-states&seed=3');
    await tapCell(page, 3, 3);
    await tapCell(page, 6, 3);
    return () => page.getByRole('button', { name: /Confirm charge/ }).evaluate((b) => b.click());
  },
};

// Use the real GPU: headless software WebGL runs the board at about 3 fps and hides real timing.
const GPU_ARGS = ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'];
const browser = await chromium
  .launch({ args: GPU_ARGS })
  .catch(() => chromium.launch({ args: GPU_ARGS, executablePath: findChromium() }));
const report = [];
for (const size of SIZES) {
  for (const reduce of [false, true]) {
    const ctx = await browser.newContext({
      viewport: { width: size.width, height: size.height },
      deviceScaleFactor: 1,
      hasTouch: true,
      reducedMotion: reduce ? 'reduce' : 'no-preference',
    });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(arg('throttle', '4')) });
    for (const [name, setup] of Object.entries(SEQUENCES)) {
      if (only.length && !only.includes(name)) continue;
      try {
        const action = await setup(page);
        const ms = reduce ? 600 : (LENGTH[name] ?? 1400);
        const { frames } = await record(page, cdp, action, ms, ms > 1600 ? 200 : 100);
        const fps = await measure(page, await setup(page), ms);
        const tag = `${size.name}-${name}${reduce ? '-reduced' : ''}`;
        await contactSheet(
          browser,
          frames,
          join(outDir, `${tag}.png`),
          `${tag} · avg ${fps.avg} fps, worst ${fps.worst} fps (4× CPU)`,
        );
        // Skip test: run the action again and tap 300 ms in; nothing may still animate a frame later.
        const again = await setup(page);
        await again();
        await page.waitForTimeout(300);
        // Tap the guidance strip: an inert spot, so the tap only skips.
        await page.touchscreen.tap(size.width / 2, size.name === 'phone' ? 62 : 78);
        await page.waitForTimeout(40);
        const still = await page.evaluate(() => window.__bq.animating?.() ?? false);
        report.push({ tag, ...fps, skipOk: !still, errors: errors.splice(0) });
      } catch (e) {
        const tag = `${size.name}-${name}${reduce ? '-reduced' : ''}`;
        await page.screenshot({ path: join(outDir, `${tag}-FAILED.png`) }).catch(() => {});
        report.push({ tag, avg: 0, worst: 0, skipOk: false, errors: [String(e).split('\n')[0]] });
      }
    }
    await ctx.close();
  }
}
await browser.close();
writeFileSync(join(outDir, 'report.json'), JSON.stringify(report, null, 2));
for (const r of report) {
  console.log(
    `${r.tag}: avg ${r.avg} fps, worst ${r.worst} fps, skip ${r.skipOk ? 'ok' : 'FAILED'}${r.errors.length ? `, errors ${r.errors.join('; ')}` : ''}`,
  );
}
console.log(`Contact sheets in ${outDir}`);

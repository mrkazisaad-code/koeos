// Screenshots at the spec widths. Usage: node qa/shots.mjs [--reduced] [--nojs] [--full]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const args = process.argv.slice(2);
const reduced = args.includes('--reduced');
const nojs = args.includes('--nojs');
const widths = (args.find((a) => a.startsWith('--w='))?.slice(4).split(',').map(Number)) ?? [360, 768, 1024, 1440, 1920];
const out = new URL('./out/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 768 ? 780 : 900 }, reducedMotion: reduced ? 'reduce' : 'no-preference', javaScriptEnabled: !nojs, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  page.on('pageerror', (e) => errs.push(String(e)));
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  // Scroll through to trigger scenes, then back to top
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 300) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(nojs || reduced ? 20 : 120);
  }
  await page.waitForTimeout(nojs || reduced ? 200 : 4500);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const tag = `${w}${reduced ? '-rm' : ''}${nojs ? '-nojs' : ''}`;
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  if (args.includes('--full')) await page.screenshot({ path: `${out}${tag}-full.png`, fullPage: true });
  if (!nojs) await page.addStyleTag({ content: '.site-header,.skip-link{visibility:hidden!important}' });
  const ids = ['top', 'why', 'what', 'how', 'base', 'where', 'europe', 'who', 'engage', 'record', 'contact'];
  for (const id of ids) {
    const el = page.locator(`#${id}`);
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(nojs || reduced ? 50 : 300);
    await el.screenshot({ path: `${out}${tag}-${id}.png` });
  }
  await page.locator('footer').screenshot({ path: `${out}${tag}-footer.png` });
  console.log(tag, 'overflowX', overflow, errs.length ? 'ERRORS ' + errs.join(' | ') : '');
  await ctx.close();
}
await browser.close();

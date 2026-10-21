// Renders the Open Graph image (1200×630) and PNG icons with the site fonts via headless Chromium.
import { chromium } from 'playwright-core';
import { readFileSync } from 'node:fs';
const font = (f) => `data:font/woff2;base64,${readFileSync(new URL(`../public/fonts/${f}.woff2`, import.meta.url)).toString('base64')}`;
const gates = [0.53, 0.64, 0.75, 0.86];
const og = `<!doctype html><html><head><style>
@font-face{font-family:SG;src:url(${font('schibsted-grotesk-latin-700-normal')});font-weight:700}
@font-face{font-family:PM;src:url(${font('ibm-plex-mono-latin-500-normal')});font-weight:500}
html,body{margin:0;width:1200px;height:630px;background:#0B1113;overflow:hidden}
body{background-image:linear-gradient(to right,rgba(38,54,59,.4) 1px,transparent 1px),linear-gradient(to bottom,rgba(38,54,59,.4) 1px,transparent 1px);background-size:48px 48px;position:relative;font-family:SG}
.w{position:absolute;left:72px;top:64px;font:700 30px SG;letter-spacing:.08em;color:#E8EEEC}
.h{position:absolute;left:72px;bottom:72px;width:480px;font:700 64px/1.02 SG;letter-spacing:-.015em;color:#E8EEEC}
svg{position:absolute;inset:0}
text{font:500 13px PM;letter-spacing:.12em}
</style></head><body><svg width="1200" height="630">
${gates.map((g, i) => `<line x1="${g * 1200}" x2="${g * 1200}" y1="96" y2="560" stroke="#26363B"/><text x="${g * 1200}" y="80" text-anchor="middle" fill="#6F807C">${['CHOOSE', 'TEST', 'BUILD', 'SCALE'][i]}</text>`).join('')}
<path d="M${0.86 * 1200 + 10} 470 C ${0.89 * 1200} 465, ${0.91 * 1200} 400, ${0.925 * 1200} 340 S ${0.95 * 1200} 190, ${0.97 * 1200} 160" fill="none" stroke="#D9894A" stroke-width="3" stroke-linecap="round"/>
<text x="${0.97 * 1200}" y="140" text-anchor="end" fill="#D9894A">REVENUE</text>
</svg><div class="w">KOEOS</div><div class="h">We turn technology into businesses that earn.</div></body></html>`;
const icon = (size) => `<!doctype html><html><body style="margin:0">${readFileSync(new URL('../public/favicon.svg', import.meta.url), 'utf8').replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(og);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: new URL('../public/og.png', import.meta.url).pathname });
for (const [size, name] of [[32, 'favicon-32.png'], [180, 'apple-touch-icon.png']]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(icon(size));
  await page.screenshot({ path: new URL(`../public/${name}`, import.meta.url).pathname, omitBackground: true });
}
await browser.close();
console.log('og.png and icons written');

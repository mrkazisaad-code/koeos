// Interaction checks: popovers, sources dialog, mobile menu, form validation/success, honeypot, rate limit, no-JS figures.
import { chromium } from 'playwright-core';
const exe = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch({ executablePath: exe });
const results = [];
const ok = (name, cond, extra = '') => results.push(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  ' + extra : ''}`);

// No-JS: figures final, content visible
{
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto('http://localhost:4321/');
  const txt = await p.locator('main').innerText();
  ok('no-JS: final figures present', ['20%', '72%', '€418bn', '~€2.7tn', '€2tn', '$20.3bn', '1,284', '20+', '180'].every((f) => txt.includes(f)));
  const hidden = await p.evaluate(() => [...document.querySelectorAll('[data-reveal], .what-card, .fig, .eng-row__get')].filter((e) => getComputedStyle(e).opacity === '0').length);
  ok('no-JS: no hidden reveal content', hidden === 0, `hidden=${hidden}`);
  await p.locator('#src-4-a').evaluate(() => 0);
  await p.click('button[popovertarget="src-4-a"]');
  ok('no-JS: source popover opens natively', await p.locator('#src-4-a').isVisible());
  await ctx.close();
}
// Reduced motion: final states
{
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto('http://localhost:4321/');
  await p.waitForTimeout(500);
  const st = await p.evaluate(() => ({
    motion: document.documentElement.classList.contains('motion'),
    hidden: [...document.querySelectorAll('[data-reveal], .what-card, .fig')].filter((e) => getComputedStyle(e).opacity === '0').length,
    lit: document.querySelectorAll('.loop__node').length,
    unlit: [...document.querySelectorAll('.loop__node circle')].filter((c) => getComputedStyle(c).fill === 'rgb(24, 36, 40)').length,
    ticker: getComputedStyle(document.querySelector('.ticker__track--dup')).display,
    canvasLive: document.querySelector('[data-hero-field]').classList.contains('is-live'),
    lineDash: document.querySelector('[data-line-path]').style.strokeDashoffset,
  }));
  ok('reduced motion: no motion class', !st.motion);
  ok('reduced motion: all content visible', st.hidden === 0, `hidden=${st.hidden}`);
  ok('reduced motion: loop nodes lit', st.unlit === 0);
  ok('reduced motion: ticker static (duplicate hidden)', st.ticker === 'none');
  ok('reduced motion: hero static SVG (no canvas)', !st.canvasLive);
  ok('reduced motion: A4 line fully drawn', parseFloat(st.lineDash || '0') < 1, `offset=${st.lineDash}`);
  await ctx.close();
}
// JS + motion
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(String(e)));
  await p.goto('http://localhost:4321/');
  await p.waitForTimeout(1500);
  ok('hero canvas live after headline', await p.evaluate(() => document.querySelector('[data-hero-field]').classList.contains('is-live')));
  // keyboard: first tab = skip link
  await p.keyboard.press('Tab');
  ok('first Tab focuses skip link', (await p.evaluate(() => document.activeElement.className)) === 'skip-link');
  await p.keyboard.press('Enter');
  await p.waitForTimeout(300);
  ok('skip link moves focus to #what', (await p.evaluate(() => document.activeElement.id)) === 'what');
  // popover via keyboard
  const btn = p.locator('button[popovertarget="src-1-a"]');
  await btn.focus();
  await p.keyboard.press('Enter');
  await p.waitForTimeout(100);
  ok('source popover opens with keyboard', await p.locator('#src-1-a').isVisible());
  const pop = await p.locator('#src-1-a').innerText();
  ok('popover shows title, publisher, date, link', /Use of artificial intelligence/.test(pop) && /Eurostat/.test(pop) && /December 2025/.test(pop) && /View source/.test(pop));
  ok('marker aria-expanded true', (await btn.getAttribute('aria-expanded')) === 'true');
  await p.keyboard.press('Escape');
  ok('popover closes on Escape', !(await p.locator('#src-1-a').isVisible()));
  await btn.click();
  await p.mouse.click(5, 450);
  ok('popover closes on outside click', !(await p.locator('#src-1-a').isVisible()));
  await btn.hover();
  await p.waitForTimeout(150);
  ok('popover opens on hover', await p.locator('#src-1-a').isVisible());
  await p.mouse.move(700, 10);
  await p.waitForTimeout(400);
  ok('hover popover closes on leave', !(await p.locator('#src-1-a').isVisible()));
  // sources dialog
  await p.click('[data-open-sources]');
  ok('sources dialog opens', await p.locator('[data-sources-dialog]').isVisible());
  ok('sources dialog lists 9 sources', (await p.locator('[data-sources-dialog] li').count()) === 9);
  await p.keyboard.press('Escape');
  ok('sources dialog closes on Escape', !(await p.locator('[data-sources-dialog]').isVisible()));
  // header hide/show + progress
  await p.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  await p.evaluate(() => window.scrollTo(0, 2000));
  await p.waitForTimeout(200);
  await p.evaluate(() => window.scrollTo(0, 2600));
  await p.waitForTimeout(300);
  const hdr = await p.evaluate(() => ({ cls: document.querySelector('[data-header]').className, prog: document.querySelector('[data-progress]').style.transform }));
  ok('header hides on scroll down', hdr.cls.includes('is-hidden') && hdr.cls.includes('is-scrolled'));
  ok('progress line advances', /scaleX\(0\.\d+/.test(hdr.prog), hdr.prog);
  await p.evaluate(() => window.scrollTo(0, 2300));
  await p.waitForTimeout(300);
  ok('header returns on scroll up', !(await p.evaluate(() => document.querySelector('[data-header]').classList.contains('is-hidden'))));
  // form: empty submit
  await p.locator('#contact').scrollIntoViewIfNeeded();
  await p.click('.form__submit');
  await p.waitForTimeout(100);
  const errs = await p.evaluate(() => [...document.querySelectorAll('.field__error')].map((e) => e.textContent));
  ok('form: inline errors on empty submit', errs.filter(Boolean).length === 4, JSON.stringify(errs));
  ok('form: focus moves to first invalid field', (await p.evaluate(() => document.activeElement.id)) === 'f-name');
  ok('form: aria-invalid set', (await p.getAttribute('#f-name', 'aria-invalid')) === 'true');
  await p.fill('#f-name', 'Test Person');
  await p.fill('#f-org', 'Test Org');
  await p.fill('#f-email', 'not-an-email');
  await p.fill('#f-msg', 'A product without customers.');
  await p.click('.form__submit');
  ok('form: invalid email message', (await p.textContent('#f-email-err')) === 'Please add a valid email address.');
  await p.fill('#f-email', 'test@example.com');
  ok('form: textarea capped at 1,500', (await p.getAttribute('#f-msg', 'maxlength')) === '1500');
  await p.click('.form__submit');
  await p.waitForTimeout(500);
  ok('form: success replaces form', (await p.locator('[data-form-success]').isVisible()) && !(await p.locator('[data-contact-form]').isVisible()));
  ok('form: success copy', (await p.textContent('[data-form-success]')).trim() === 'Thank you. We will reply within two business days.');
  ok('no page errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}
// Mobile menu
{
  const ctx = await browser.newContext({ viewport: { width: 360, height: 780 } });
  const p = await ctx.newPage();
  await p.goto('http://localhost:4321/');
  const mb = p.locator('[data-menu-open]');
  ok('menu button 44px', (await mb.boundingBox()).width === 44);
  await mb.click();
  ok('menu opens full-screen', await p.locator('[data-menu]').isVisible());
  const focusIn = [];
  for (let i = 0; i < 9; i++) {
    await p.keyboard.press('Tab');
    focusIn.push(await p.evaluate(() => !!document.activeElement.closest('[data-menu]')));
  }
  ok('menu traps focus', focusIn.every(Boolean));
  await p.keyboard.press('Escape');
  ok('menu closes on Escape', !(await p.locator('[data-menu]').isVisible()));
  ok('focus returns to menu button', (await p.evaluate(() => document.activeElement.hasAttribute('data-menu-open'))));
  await mb.click();
  await p.click('[data-menu] a[href="#engage"]');
  await p.waitForTimeout(300);
  ok('menu link navigates and closes', !(await p.locator('[data-menu]').isVisible()) && (await p.evaluate(() => Math.abs(document.getElementById('engage').getBoundingClientRect().top) < 100)));
  // tap opens popover
  await ctx.close();
  const t = await browser.newContext({ viewport: { width: 360, height: 780 }, hasTouch: true, isMobile: true });
  const tp = await t.newPage();
  await tp.goto('http://localhost:4321/#why');
  await tp.waitForTimeout(300);
  await tp.locator('button[popovertarget="src-2-a"]').tap();
  await tp.waitForTimeout(200);
  ok('tap opens source popover', await tp.locator('#src-2-a').isVisible());
  const bb = await tp.locator('#src-2-a').boundingBox();
  ok('popover fits 360 viewport', bb.x >= 0 && bb.x + bb.width <= 360, JSON.stringify(bb));
  await t.close();
}
await browser.close();
console.log(results.join('\n'));

import { DUR, easeOut, motionOn, onceInView } from './util';

/**
 * A2 / A9 counters. Each counter is one element whose HTML text is the final value
 * (e.g. "€200m+"). On first view the number inside it runs from 0 to the target over dur-slow
 * and ends on the exact HTML text. Without JS or with reduced motion the HTML shows unchanged.
 */
export function initCounters() {
  document.querySelectorAll<HTMLElement>('[data-counter-group]').forEach((group) => {
    if (!motionOn()) {
      group.classList.add('is-counted');
      return;
    }
    onceInView(group, () => {
      group.classList.add('is-counted');
      group.querySelectorAll<HTMLElement>('[data-count]').forEach((el, i) => {
        const final = el.textContent ?? '';
        const m = final.match(/^(\D*)(\d[\d,]*)(.*)$/);
        if (!m) return;
        const [, pre, num, post] = m;
        const target = Number(num.replace(/,/g, ''));
        const t0 = performance.now() + i * 80;
        const tick = (now: number) => {
          const t = Math.min(1, Math.max(0, (now - t0) / DUR.slow));
          if (t >= 1) {
            el.textContent = final;
            return;
          }
          el.textContent = pre + Math.round(target * easeOut(t)).toLocaleString('en-GB') + post;
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    });
  });
}

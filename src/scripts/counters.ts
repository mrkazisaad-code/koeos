import { DUR, easeOut, fmt, motionOn, onceInView } from './util';

/**
 * A2 / A9 counters. The HTML already holds the final value; when the group enters view the
 * visible (aria-hidden) copy runs from 60% of the value up to the final value over dur-slow.
 */
export function initCounters() {
  const groups = document.querySelectorAll<HTMLElement>('[data-counter-group]');
  groups.forEach((group) => {
    if (!motionOn()) {
      group.classList.add('is-counted');
      return;
    }
    onceInView(group, () => {
      group.classList.add('is-counted');
      group.querySelectorAll<HTMLElement>('[data-count]').forEach((el, i) => {
        const target = Number(el.dataset.count);
        const suffix = el.dataset.suffix ?? '';
        const from = target * 0.6;
        const delay = i * 80;
        const t0 = performance.now() + delay;
        el.textContent = fmt(Math.round(from)) + suffix;
        const tick = (now: number) => {
          const t = Math.min(1, Math.max(0, (now - t0) / DUR.slow));
          el.textContent = fmt(Math.round(from + (target - from) * easeOut(t))) + suffix;
          if (t < 1) requestAnimationFrame(tick);
          else el.textContent = fmt(target) + suffix;
        };
        requestAnimationFrame(tick);
      });
    });
  });
}

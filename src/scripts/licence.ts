import { motionOn, onceInView, watchVisible } from './util';

/**
 * A3 Licence to outcome. Seats (LICENCE · € / SEAT / MONTH) dissolve and the card turns into a
 * per-outcome price unit that cycles every 2.2s (claim, file, tender, asset) while on screen and
 * the tab is visible. Reduced motion or no JS: the first unit, static.
 */
export function initLicence() {
  const svg = document.querySelector<SVGSVGElement>('[data-licence]');
  if (!svg || !motionOn()) return;
  const units = Array.from(svg.querySelectorAll<SVGTextElement>('[data-licence-unit]'));
  let index = 0;
  let timer = 0;
  let visible = false;
  let started = false;

  svg.classList.add('is-seats');
  const run = () => {
    clearInterval(timer);
    if (started && visible && !document.hidden) {
      timer = window.setInterval(() => {
        units[index].classList.remove('is-active');
        index = (index + 1) % units.length;
        units[index].classList.add('is-active');
      }, 2200);
    }
  };
  onceInView(svg, () => {
    // Let the seats register before they dissolve
    setTimeout(() => {
      svg.classList.remove('is-seats');
      setTimeout(() => {
        started = true;
        run();
      }, 900);
    }, 400);
  });
  watchVisible(svg, (v) => {
    visible = v;
    run();
  });
  document.addEventListener('visibilitychange', run);
}

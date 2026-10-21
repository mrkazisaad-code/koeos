import { fmt, motionOn, onceInView, watchVisible } from './util';

/**
 * A3 Licence to outcome. Seats dissolve and reassemble into an outcomes counter that ticks
 * up once every 1.6s from 1,284 while on screen and the tab is visible.
 */
export function initLicence() {
  const svg = document.querySelector<SVGSVGElement>('[data-licence]');
  if (!svg || !motionOn()) return;
  const num = svg.querySelector<SVGTextElement>('[data-licence-count]')!;
  let value = 1284;
  let timer = 0;
  let visible = false;
  let started = false;

  svg.classList.add('is-seats');
  const run = () => {
    clearInterval(timer);
    if (started && visible && !document.hidden) {
      timer = window.setInterval(() => {
        value += 1;
        num.textContent = fmt(value);
      }, 1600);
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

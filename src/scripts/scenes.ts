import { motionOn, onceInView, watchVisible } from './util';

/** CSS-driven scenes (A6, A7, A8): add .is-play once, when 30% is in view. */
export function initScenes() {
  document.querySelectorAll<HTMLElement>('[data-scene]').forEach((el) => {
    if (!motionOn()) {
      el.classList.add('is-play');
      return;
    }
    onceInView(el, () => el.classList.add('is-play'));
  });
  // A7 pulse continues only while the map is in view.
  const europe = document.querySelector<HTMLElement>('[data-scene="europe"]');
  if (europe && motionOn()) watchVisible(europe, (v) => europe.classList.toggle('is-visible', v));
}

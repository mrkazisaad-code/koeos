import { onceInView } from './util';

/** Default reveal: opacity 0 → 1, translateY 16px → 0, staggered by --i. */
export function initReveal() {
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    onceInView(el, () => el.classList.add('is-in'));
  });
}

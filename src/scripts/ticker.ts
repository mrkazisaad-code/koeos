import { motionOn, watchVisible } from './util';

/** Hero ticker: 40px per second, pauses on hover/focus, has a pause control, stops off-screen. */
export function initTicker() {
  const ticker = document.querySelector<HTMLElement>('[data-ticker]');
  if (!ticker || !motionOn()) return;
  const track = ticker.querySelector<HTMLElement>('.ticker__track');
  const toggle = ticker.querySelector<HTMLButtonElement>('[data-ticker-toggle]');
  const setDur = () => {
    if (track) ticker.style.setProperty('--ticker-dur', `${(track.scrollWidth / 40).toFixed(2)}s`);
  };
  setDur();
  document.fonts?.ready.then(setDur);
  if (toggle) {
    toggle.hidden = false;
    const label = toggle.querySelector('.sr-only')!;
    toggle.addEventListener('click', () => {
      const paused = ticker.classList.toggle('is-paused');
      toggle.setAttribute('aria-pressed', String(paused));
      label.textContent = paused ? 'Play moving list' : 'Pause moving list';
    });
  }
  watchVisible(ticker, (v) => ticker.classList.toggle('is-offscreen', !v));
}

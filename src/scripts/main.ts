import { initHeader } from './header';
import { initReveal } from './reveal';
import { initCounters } from './counters';
import { initPopovers } from './popovers';
import { initSourcesDialog } from './sources-dialog';
import { initTicker } from './ticker';
import { initHeroField } from './hero-field';
import { initLicence } from './licence';
import { initLineThrough } from './line-through';
import { initLoop } from './loop';
import { initScenes } from './scenes';
import { initForm } from './form';

const run = (fn: () => void) => {
  try {
    fn();
  } catch (err) {
    // A failed enhancement must never hide content: fall back to the final, static state.
    document.documentElement.classList.remove('motion');
    console.error(err);
  }
};

[initHeader, initReveal, initCounters, initPopovers, initSourcesDialog, initTicker, initHeroField, initLicence, initLineThrough, initLoop, initScenes, initForm].forEach(run);

// If the user switches reduced motion on mid-visit, drop to final states.
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (m) => {
  if (m.matches) document.documentElement.classList.remove('motion');
});

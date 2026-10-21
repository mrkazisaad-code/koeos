/**
 * Source markers use the native Popover API (works without JS for click/tap/keyboard,
 * closes on Escape and outside click). JS adds positioning next to the marker and
 * opens on pointer hover.
 */
export function initPopovers() {
  const supports = typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype;
  if (!supports) return;
  const buttons = document.querySelectorAll<HTMLButtonElement>('button[data-src]');
  const GAP = 8;

  const place = (btn: HTMLElement, pop: HTMLElement) => {
    const r = btn.getBoundingClientRect();
    const w = pop.offsetWidth;
    const h = pop.offsetHeight;
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    let left = r.left + r.width / 2 - w / 2;
    left = Math.max(16, Math.min(left, vw - w - 16));
    let top = r.bottom + GAP;
    if (top + h > vh - 16 && r.top - GAP - h > 16) top = r.top - GAP - h;
    pop.style.left = `${Math.round(left)}px`;
    pop.style.top = `${Math.round(Math.max(16, top))}px`;
  };

  buttons.forEach((btn) => {
    const pop = document.getElementById(btn.dataset.src!);
    if (!pop) return;
    pop.dataset.positioned = '';
    btn.setAttribute('aria-expanded', 'false');
    pop.addEventListener('beforetoggle', (e) => {
      if ((e as ToggleEvent).newState === 'open') {
        pop.style.visibility = 'hidden';
        requestAnimationFrame(() => {
          place(btn, pop);
          pop.style.visibility = '';
        });
      }
    });
    pop.addEventListener('toggle', (e) => {
      btn.setAttribute('aria-expanded', String((e as ToggleEvent).newState === 'open'));
    });

    // Hover (mouse and pen only); touch uses the native tap behaviour.
    let closeTimer = 0;
    let openedByHover = false;
    const open = () => {
      clearTimeout(closeTimer);
      if (!pop.matches(':popover-open')) {
        openedByHover = true;
        pop.showPopover();
      }
    };
    const scheduleClose = () => {
      if (!openedByHover) return;
      clearTimeout(closeTimer);
      closeTimer = window.setTimeout(() => {
        if (pop.matches(':popover-open') && !pop.matches(':hover') && !pop.contains(document.activeElement)) pop.hidePopover();
        openedByHover = false;
      }, 220);
    };
    btn.addEventListener('pointerenter', (e) => e.pointerType !== 'touch' && open());
    btn.addEventListener('pointerleave', (e) => e.pointerType !== 'touch' && scheduleClose());
    pop.addEventListener('pointerenter', () => clearTimeout(closeTimer));
    pop.addEventListener('pointerleave', (e) => e.pointerType !== 'touch' && scheduleClose());
    // A click while hover-opened pins it open instead of toggling it closed.
    btn.addEventListener('click', (e) => {
      if (openedByHover && pop.matches(':popover-open')) {
        e.preventDefault();
        openedByHover = false;
      }
    });
  });

  // Keep an open popover attached to its marker while the page scrolls or resizes.
  let raf = 0;
  const follow = () => {
    raf = 0;
    buttons.forEach((btn) => {
      const pop = document.getElementById(btn.dataset.src!);
      if (pop?.matches(':popover-open')) place(btn, pop);
    });
  };
  const schedule = () => (raf ||= requestAnimationFrame(follow));
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
}

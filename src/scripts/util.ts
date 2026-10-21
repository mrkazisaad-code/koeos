export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const motionOn = () => document.documentElement.classList.contains('motion') && !reducedMotion();

/** Spec timing tokens, mirrored from CSS. */
export const DUR = { fast: 180, base: 420, slow: 900, scene: 2400 };
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3.2);
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/**
 * Fires once when 30% of the element is in view (or, for elements taller than the
 * viewport, when it covers 30% of the viewport).
 */
export function onceInView(el: Element, cb: () => void, ratio = 0.3) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const vh = window.innerHeight;
        if (e.intersectionRatio >= ratio || e.intersectionRect.height >= vh * ratio) {
          io.disconnect();
          cb();
        }
      }
    },
    { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5] },
  );
  io.observe(el);
  return io;
}

/** Tracks whether an element is on screen; used by the looping scenes to pause. */
export function watchVisible(el: Element, cb: (visible: boolean) => void, rootMargin = '0px') {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => cb(e.isIntersecting)), { rootMargin });
  io.observe(el);
  return io;
}

export const fmt = (n: number) => n.toLocaleString('en-GB');

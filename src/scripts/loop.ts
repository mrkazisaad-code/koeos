import { DUR, clamp, motionOn } from './util';

/**
 * A5 The loop. As the reader scrolls through the section a copper marker travels the loop
 * once, lighting each node and flashing PROCEED / RESHAPE / STOP beside it. After node 4 it
 * exits along the copper SCALE tangent, and a faint second marker starts again at Choose.
 */
export function initLoop() {
  const svg = document.querySelector<SVGSVGElement>('[data-loop]');
  if (!svg || !motionOn()) return;
  const path = svg.querySelector<SVGPathElement>('[data-loop-path]')!;
  const tangent = svg.querySelector<SVGPathElement>('[data-loop-tangent]')!;
  const marker = svg.querySelector<SVGCircleElement>('[data-loop-marker]')!;
  const ghost = svg.querySelector<SVGCircleElement>('[data-loop-ghost]')!;
  const nodes = Array.from(svg.querySelectorAll<SVGGElement>('[data-loop-node]'));
  const section = document.getElementById('how')!;
  const loopLen = path.getTotalLength();
  const tanLen = tangent.getTotalLength();
  // Node positions along the loop (start of path is node 1 at the top)
  const nodeAt = [0, 0.25, 0.5, 0.75];
  // Overall progress: 0–0.82 travels the loop (plus the last side up to the corner), 0.82–1 the tangent
  const LOOP_END = 0.82;
  const cornerFrac = 0.75 + (54 / loopLen); // left side from node 4 to the top-left corner start
  let shown = 0;
  let target = 0;
  let lit = 0;

  const point = (p: number) => {
    if (p <= LOOP_END) {
      const f = (p / LOOP_END) * cornerFrac;
      return { pt: path.getPointAtLength(f * loopLen), f, tan: 0 };
    }
    const t = (p - LOOP_END) / (1 - LOOP_END);
    return { pt: tangent.getPointAtLength(t * tanLen), f: cornerFrac, tan: t };
  };

  const render = () => {
    svg.classList.add('is-active');
    const { pt, f, tan } = point(shown);
    marker.setAttribute('cx', pt.x.toFixed(2));
    marker.setAttribute('cy', pt.y.toFixed(2));
    while (lit < 4 && f >= nodeAt[lit] - 0.001) {
      const node = nodes[lit];
      node.classList.add('is-lit', 'is-flash');
      setTimeout(() => node.classList.remove('is-flash'), 620);
      lit++;
    }
    svg.style.setProperty('--tan', String(1 - tan));
    if (shown >= 1 && !svg.classList.contains('is-exited')) {
      svg.classList.add('is-exited');
      marker.style.opacity = '0';
      startGhost();
    }
  };

  // Faint second marker: begins the next loop at Choose, travels it once, and fades.
  const startGhost = () => {
    svg.classList.add('is-ghost');
    const t0 = performance.now();
    const dur = DUR.scene * 2;
    const step = (now: number) => {
      const t = clamp((now - t0) / dur);
      const p = path.getPointAtLength(t * loopLen);
      ghost.setAttribute('cx', p.x.toFixed(2));
      ghost.setAttribute('cy', p.y.toFixed(2));
      ghost.style.opacity = String(0.35 * (t < 0.1 ? t / 0.1 : t > 0.85 ? (1 - t) / 0.15 : 1));
      if (t < 1) requestAnimationFrame(step);
      else svg.classList.remove('is-ghost');
    };
    requestAnimationFrame(step);
  };

  const measure = () => {
    const r = svg.getBoundingClientRect();
    const vh = window.innerHeight;
    // Starts as the loop's top reaches 75% of the viewport; completes as its centre passes 35%
    const p = (vh * 0.75 - r.top) / (vh * 0.4 + r.height / 2);
    target = Math.max(target, clamp(p));
  };

  let raf = 0;
  let last = 0;
  const tick = (now: number) => {
    raf = 0;
    const dt = last ? now - last : 16;
    last = now;
    if (shown < target) {
      shown = Math.min(target, shown + dt / DUR.scene);
      render();
      raf = requestAnimationFrame(tick);
    } else last = 0;
  };
  const onScroll = () => {
    if (shown >= 1) return;
    measure();
    if (!raf && shown < target) raf = requestAnimationFrame(tick);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  void section;
  onScroll();
}

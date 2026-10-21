import { DUR, clamp, motionOn } from './util';

/**
 * A4 One line through four cards. A single 2px teal line enters from the section's left edge,
 * passes behind each card number 01 → 04 and ends in a copper dot. Drawing follows scroll
 * progress through the section (never faster than dur-scene for the whole path, never undrawn).
 */
export function initLineThrough() {
  const section = document.getElementById('what');
  const svg = section?.querySelector<SVGSVGElement>('[data-line-svg]');
  const path = svg?.querySelector<SVGPathElement>('[data-line-path]');
  const dot = svg?.querySelector<SVGCircleElement>('[data-line-dot]');
  const cards = Array.from(section?.querySelectorAll<HTMLElement>('[data-line-card]') ?? []);
  if (!section || !svg || !path || !dot || cards.length !== 4) return;
  const motion = motionOn();

  let total = 1;
  let stops: number[] = []; // path length at which each card number is reached
  let shown = motion ? 0 : 1;
  let target = shown;

  const R = 10;
  // Orthogonal polyline with rounded corners
  const toPath = (pts: [number, number][]) => {
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[i + 1];
      const r = Math.min(R, Math.hypot(x1 - x0, y1 - y0) / 2, Math.hypot(x2 - x1, y2 - y1) / 2);
      const ax = x1 - Math.sign(x1 - x0) * r;
      const ay = y1 - Math.sign(y1 - y0) * r;
      const bx = x1 + Math.sign(x2 - x1) * r;
      const by = y1 + Math.sign(y2 - y1) * r;
      d += `L${ax} ${ay}Q${x1} ${y1} ${bx} ${by}`;
    }
    const last = pts[pts.length - 1];
    return d + `L${last[0]} ${last[1]}`;
  };

  const layout = () => {
    const s = section.getBoundingClientRect();
    const rel = (r: DOMRect) => ({ l: r.left - s.left, t: r.top - s.top, r: r.right - s.left, b: r.bottom - s.top });
    const c = cards.map((el) => rel(el.getBoundingClientRect()));
    const n = cards.map((el) => {
      const r = rel(el.querySelector('[data-line-num]')!.getBoundingClientRect());
      return { x: (r.l + r.r) / 2, y: (r.t + r.b) / 2, l: r.l, r: r.r };
    });
    svg.setAttribute('viewBox', `0 0 ${s.width} ${s.height}`);
    const twoCol = Math.abs(c[0].t - c[1].t) < 2;
    const entryY = Math.round(c[0].t - 20);
    let pts: [number, number][];
    let marks: [number, number][];
    let end: [number, number];
    if (twoCol) {
      const gapY = (c[0].b + c[2].t) / 2;
      const pad = 16;
      pts = [
        [0, entryY],
        [n[0].x, entryY],
        [n[0].x, n[0].y],
        [c[1].r - pad, n[1].y],
        [c[1].r - pad, gapY],
        [n[2].x, gapY],
        [n[2].x, n[2].y],
        [c[3].r + 20, n[3].y],
      ];
      // Fix row 1 horizontal (n0.y equals n1.y in a 2-column grid)
      pts[3][1] = n[0].y;
      pts[4][1] = gapY;
      pts[7][1] = n[2].y;
      marks = [[n[0].x, n[0].y], [n[1].x, n[0].y], [n[2].x, n[2].y], [n[3].x, n[2].y]];
      end = pts[7];
    } else {
      const last = c[3].b + 28;
      pts = [
        [0, entryY],
        [n[0].x, entryY],
        [n[0].x, last],
      ];
      marks = n.map((p) => [n[0].x, p.y] as [number, number]);
      end = [n[0].x, last];
    }
    path.setAttribute('d', toPath(pts));
    total = path.getTotalLength();
    // Fraction of the path at each card number, measured on the polyline (corner rounding is negligible)
    const seg: number[] = [0];
    for (let i = 1; i < pts.length; i++) seg.push(seg[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const poly = seg[seg.length - 1] || 1;
    stops = marks.map(([mx, my]) => {
      let best = 0;
      let bestD = Infinity;
      for (let i = 1; i < pts.length; i++) {
        const [ax, ay] = pts[i - 1];
        const [bx, by] = pts[i];
        const len = seg[i] - seg[i - 1] || 1;
        const t = clamp(((mx - ax) * (bx - ax) + (my - ay) * (by - ay)) / (len * len));
        const d = Math.hypot(ax + (bx - ax) * t - mx, ay + (by - ay) * t - my);
        if (d < bestD) {
          bestD = d;
          best = seg[i - 1] + len * t;
        }
      }
      return best / poly;
    });
    dot.setAttribute('cx', String(end[0]));
    dot.setAttribute('cy', String(end[1]));
    path.style.strokeDasharray = `${total}`;
    render();
  };

  const render = () => {
    path.style.strokeDashoffset = `${total * (1 - shown)}`;
    cards.forEach((card, i) => {
      if (shown >= stops[i] - 0.02) card.classList.add('is-in');
    });
    svg.classList.toggle('is-done', shown >= 0.999);
  };

  const measureTarget = () => {
    const grid = section.querySelector<HTMLElement>('[data-line-cards]')!.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0 when the cards' top is at 85% of the viewport, 1 when their bottom reaches 75%
    const p = (vh * 0.85 - grid.top) / (grid.height + vh * 0.1);
    target = Math.max(target, clamp(p));
  };

  let raf = 0;
  let last = 0;
  const loop = (now: number) => {
    raf = 0;
    const dt = last ? now - last : 16;
    last = now;
    if (shown < target) {
      shown = Math.min(target, shown + dt / DUR.scene);
      render();
    }
    if (shown < target) raf = requestAnimationFrame(loop);
    else last = 0;
  };
  const onScroll = () => {
    measureTarget();
    if (!raf && shown < target) raf = requestAnimationFrame(loop);
  };

  layout();
  if (!motion) return void window.addEventListener('resize', layout);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    layout();
    onScroll();
  });
  document.fonts?.ready.then(layout);
  onScroll();
}

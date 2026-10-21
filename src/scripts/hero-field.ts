import { motionOn, watchVisible } from './util';

/**
 * A1 Conversion field (single 2D canvas).
 * Ideas (dots) drift in from the left third, meet four gates (CHOOSE, TEST, BUILD, SCALE);
 * about a third of the arrivals stop at each gate, fade to 15% and sink. Survivors turn
 * text-500 → teal-300 → copper-400 and, after the last gate, settle into a rising REVENUE line.
 * 9s cycle with a 1.2s cross-fade, pauses off-screen and on hidden tabs, 30fps cap on mobile.
 */

type Dot = {
  x0: number; // spawn x (fraction of width)
  y0: number; // spawn y (fraction of height)
  delay: number; // spawn time (s)
  speed: number; // fraction of width per second
  size: number;
  stopAt: number; // gate index where it stops, or 4 if it survives
  slot: number; // position on the revenue line (survivors only)
  wobble: number;
  px: number; // pointer offset
  py: number;
};

const C = {
  t500: [111, 128, 124],
  teal: [111, 195, 184],
  copper: [217, 137, 74],
  line: '#26363B',
};
const CYCLE = 9;
const FADE = 1.2;

const mix = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const smooth = (t: number) => t * t * (3 - 2 * t);
// Deterministic pseudo-random so every cycle has the same calm composition
const rng = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

export function initHeroField() {
  const wrap = document.querySelector<HTMLElement>('[data-hero-field]');
  const canvas = wrap?.querySelector<HTMLCanvasElement>('canvas');
  if (!wrap || !canvas || !motionOn()) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const narrowMQ = window.matchMedia('(max-width: 767px)');
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let W = 0;
  let H = 0;
  let dpr = 1;
  let gates: number[] = [];
  let dots: Dot[] = [];
  let lineStart = 0.8;
  let firstArrival = 4;

  const build = () => {
    const narrow = narrowMQ.matches;
    const n = narrow ? 70 : 140;
    gates = (wrap.dataset[narrow || window.innerWidth < 1024 ? 'gatesNarrow' : 'gatesWide'] ?? '0.34,0.48,0.62,0.76')
      .split(',')
      .map(Number);
    lineStart = gates[3] + 0.015;
    const r = rng(7);
    // Fates: roughly a third of the arrivals stop at each gate
    const fates: number[] = [];
    let alive = n;
    for (let g = 0; g < 4; g++) {
      const stop = Math.round(alive / 3);
      for (let k = 0; k < stop; k++) fates.push(g);
      alive -= stop;
    }
    for (let k = 0; k < alive; k++) fates.push(4);
    for (let i = fates.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [fates[i], fates[j]] = [fates[j], fates[i]];
    }
    dots = fates.map((stopAt) => ({
      x0: r() * (gates[0] - 0.06),
      y0: 0.22 + r() * 0.62,
      delay: r() * 1.8,
      speed: 0.2 + r() * 0.1,
      size: 2 + r(),
      stopAt,
      slot: 0,
      wobble: r() * Math.PI * 2,
      px: 0,
      py: 0,
    }));
    // Survivors take line slots in order of arrival at the last gate
    const surv = dots
      .filter((d) => d.stopAt === 4)
      .sort((a, b) => arrival(a, 3) - arrival(b, 3));
    surv.forEach((d, i) => (d.slot = surv.length > 1 ? i / (surv.length - 1) : 1));
    firstArrival = surv.length ? arrival(surv[0], 3) : 4;
  };
  const arrival = (d: Dot, g: number) => d.delay + (gates[g] - d.x0) / d.speed;

  const resize = () => {
    const rect = wrap.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width;
    H = rect.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    build();
  };

  // Revenue line in field fractions: rises from lower-left to upper-right after the last gate
  const lineY = (s: number) => 0.76 - 0.47 * (s * s * (1.4 - 0.4 * s));
  const lineX = (s: number) => lineStart + s * (0.955 - lineStart);

  let pointer: { x: number; y: number } | null = null;

  const drawStatic = () => {
    ctx.save();
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1;
    ctx.font = '500 11px "IBM Plex Mono", "Plex Mono Fallback", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgb(111,128,124)';
    const labels = ['CHOOSE', 'TEST', 'BUILD', 'SCALE'];
    gates.forEach((g, i) => {
      const x = Math.round(g * W) + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, 56);
      ctx.lineTo(x, H * 0.92);
      ctx.stroke();
      // letter-spacing 12%
      ctx.save();
      (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '1.3px';
      ctx.fillText(labels[i], x, 40);
      ctx.restore();
    });
    ctx.restore();
  };

  // Draw one cycle at local time t (s), with overall alpha a
  const drawCycle = (t: number, a: number) => {
    const settleStart = firstArrival + 0.4;
    const lineT = Math.min(1, Math.max(0, (t - settleStart) / 1.8));
    // The rising line itself, drawn as survivors settle
    if (lineT > 0) {
      ctx.save();
      ctx.globalAlpha = a * lineT;
      ctx.strokeStyle = 'rgb(217,137,74)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      const steps = 40;
      for (let i = 0; i <= steps * lineT; i++) {
        const s = i / steps;
        const x = lineX(s) * W;
        const y = lineY(s) * H;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      if (lineT >= 1) {
        ctx.font = '500 11px "IBM Plex Mono", "Plex Mono Fallback", monospace';
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgb(217,137,74)';
        (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '1.3px';
        ctx.fillText('REVENUE', 0.955 * W, lineY(1) * H - 14);
      }
      ctx.restore();
    }

    for (const d of dots) {
      const age = t - d.delay;
      if (age < 0) continue;
      let x = d.x0 + age * d.speed;
      let y = d.y0 + Math.sin(d.wobble + t * 0.9) * 0.008;
      let alpha = Math.min(1, age / 0.6);
      let passed = 0;
      for (let g = 0; g < 4; g++) if (x >= gates[g]) passed = g + 1;
      let col = C.t500;

      if (d.stopAt < 4 && x >= gates[d.stopAt] - 0.004) {
        // Stopped at a gate: hold just before it, fade to 15% and sink slowly
        const since = t - arrival(d, d.stopAt);
        x = gates[d.stopAt] - 0.006;
        alpha *= Math.max(0.15, 1 - since / 0.9 * 0.85);
        y += Math.min(0.12, since * 0.03);
        passed = d.stopAt;
      }
      if (d.stopAt === 4 && x >= gates[3]) {
        // Survivor: glide onto its slot on the revenue line
        const since = t - arrival(d, 3);
        const k = smooth(Math.min(1, since / 1.3));
        const tx = lineX(d.slot);
        const ty = lineY(d.slot);
        const freeX = gates[3] + since * d.speed * 0.6;
        x = freeX + (tx - freeX) * k;
        y = y + (ty - y) * k;
        passed = 4;
      }
      // Colour by gates passed: text-500 → teal-300 (2 gates) → copper-400 (4 gates)
      if (passed >= 1) col = passed <= 2 ? mix(C.t500, C.teal, passed / 2) : mix(C.teal, C.copper, (passed - 2) / 2);

      let px = x * W;
      let py = y * H;
      // Pointer: push dots within 80px away by up to 12px (desktop only)
      let ox = 0;
      let oy = 0;
      if (pointer) {
        const dx = px - pointer.x;
        const dy = py - pointer.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 80 && dist > 0.01) {
          const f = 12 * (1 - dist / 80);
          ox = (dx / dist) * f;
          oy = (dy / dist) * f;
        }
      }
      d.px += (ox - d.px) * 0.2;
      d.py += (oy - d.py) * 0.2;
      px += d.px;
      py += d.py;

      ctx.globalAlpha = a * alpha;
      ctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
      ctx.beginPath();
      ctx.arc(px, py, d.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  let running = false;
  let visible = false;
  let raf = 0;
  let clock = 0; // field time in seconds (only advances while running)
  let lastNow = 0;
  let lastDraw = 0;
  const frameMin = narrowMQ.matches || coarse ? 1000 / 30 : 0;

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    if (frameMin && now - lastDraw < frameMin - 1) return;
    lastDraw = now;
    const dt = Math.min(0.1, (now - (lastNow || now)) / 1000);
    lastNow = now;
    clock += dt;
    const t = clock % CYCLE;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    drawStatic();
    // Cross-fade: the ending cycle fades out over the last 1.2s while the next begins
    if (t > CYCLE - FADE) {
      drawCycle(t, (CYCLE - t) / FADE);
      drawCycle(t - CYCLE, 1);
    } else {
      drawCycle(t, 1);
    }
  };
  const start = () => {
    if (running || !visible || document.hidden) return;
    running = true;
    lastNow = 0;
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };
  const sync = () => (visible && !document.hidden ? start() : stop());

  resize();
  let rT = 0;
  window.addEventListener('resize', () => {
    clearTimeout(rT);
    rT = window.setTimeout(resize, 120);
  });
  if (finePointer.matches) {
    wrap.parentElement!.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
    });
    wrap.parentElement!.addEventListener('pointerleave', () => (pointer = null));
  }

  // The field starts after the headline finishes (7 words × 60ms + 420ms)
  const headlineDone = 7 * 60 + 420;
  const begin = () => {
    wrap.classList.add('is-live');
    watchVisible(wrap, (v) => {
      visible = v;
      sync();
    });
    document.addEventListener('visibilitychange', sync);
  };
  const wait = Math.max(0, headlineDone - performance.now());
  const fontsReady = document.fonts ? document.fonts.load('500 11px "IBM Plex Mono"').catch(() => undefined) : Promise.resolve();
  fontsReady.then(() => setTimeout(begin, wait));
}

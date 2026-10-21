/* ==========================================================================
   KOEOES — Main JavaScript
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // NAVIGATION — scroll state + mobile menu
  // ==========================================================================
  const nav         = document.querySelector('.nav');
  const hamburger   = document.querySelector('.nav__hamburger');
  const mobileNav   = document.querySelector('.nav__mobile');
  const mobileClose = document.querySelector('.nav__mobile-close');

  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 20);
    updateActiveNav();
  }, { passive: true });

  hamburger?.addEventListener('click', () => {
    mobileNav?.classList.add('open');
    document.body.style.overflow = 'hidden';
  });

  mobileClose?.addEventListener('click', closeMobileNav);

  document.querySelectorAll('.nav__mobile-link, .nav__mobile-cta').forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  function closeMobileNav() {
    mobileNav?.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Active section highlighting via Intersection Observer
  const navSections = document.querySelectorAll('section[id]');
  const navLinks    = document.querySelectorAll('.nav__link');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  navSections.forEach(s => sectionObserver.observe(s));

  function updateActiveNav() {
    // Handled by IntersectionObserver above
  }

  // ==========================================================================
  // HERO CANVAS — vivid trace network: particles · bezier traces · glow · streaks
  // ==========================================================================
  function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = canvas.offsetWidth  || window.innerWidth;
      canvas.height = canvas.offsetHeight || window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });
    setTimeout(() => canvas.classList.add('visible'), 400);

    // ── Helpers ───────────────────────────────────────────────────────────
    function cubic(p0, p1, p2, p3, t) {
      const m = 1 - t;
      return m*m*m*p0 + 3*m*m*t*p1 + 3*m*t*t*p2 + t*t*t*p3;
    }
    function hexRGB(h) {
      return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
    }
    function lerpColor(c0, c1, f) {
      return c0.map((v, i) => Math.round(v + (c1[i] - v) * f));
    }

    // ── Particle field ─────────────────────────────────────────────────────
    const PARTICLE_COUNT = 140;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x:     Math.random(),
      y:     Math.random(),
      r:     0.6 + Math.random() * 2.0,
      vy:    -(0.03 + Math.random() * 0.13),
      vx:    (Math.random() - 0.5) * 0.018,
      alpha: 0.12 + Math.random() * 0.52,
    }));

    // ── Neural trace lines ─────────────────────────────────────────────────
    const PALETTE = [
      ['#FF6B00', '#28B5B5', '#7B2CBF'],
      ['#28B5B5', '#00D4FF', '#FF6B00'],
      ['#7B2CBF', '#28B5B5', '#00D4FF'],
      ['#00D4FF', '#FF6B00', '#28B5B5'],
      ['#FF6B00', '#7B2CBF', '#00D4FF'],
    ];

    function makeTrace(scatter) {
      const colors   = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      const fromBot  = Math.random() < 0.65;
      const fromLeft = !fromBot && Math.random() < 0.5;
      return {
        x0:  fromBot  ? 0.05 + Math.random() * 0.90 : (fromLeft ? -0.05 : 1.05),
        y0:  fromBot  ? 1.05                         : 0.1 + Math.random() * 0.75,
        cx1: 0.05 + Math.random() * 0.90,
        cy1: 0.05 + Math.random() * 0.90,
        cx2: 0.05 + Math.random() * 0.90,
        cy2: 0.05 + Math.random() * 0.90,
        x1:  fromBot  ? 0.05 + Math.random() * 0.90 : (fromLeft ? 1.05 : -0.05),
        y1:  fromBot  ? (Math.random() < 0.70 ? -0.05 : 0.1 + Math.random() * 0.55)
                       : (Math.random() < 0.50 ? -0.05 : 1.05),
        progress: scatter ? Math.random() * 0.85 : 0,
        speed:    0.0007 + Math.random() * 0.0016,
        width:    0.9 + Math.random() * 2.3,
        maxAlpha: 0.50 + Math.random() * 0.48,
        glow:     Math.random() > 0.25,
        colors,
      };
    }

    const TRACE_COUNT = 8;
    const traces = Array.from({ length: TRACE_COUNT }, () => makeTrace(true));

    // ── Pixel nodes ────────────────────────────────────────────────────────
    const NODES = 20;
    const nodes = Array.from({ length: NODES }, () => ({
      x:     Math.random(),
      y:     Math.random(),
      phase: Math.random() * Math.PI * 2,
      freq:  0.7 + Math.random() * 2.5,
      alpha: 0.25 + Math.random() * 0.55,
      size:  1.5 + Math.random() * 2.0,
      color: Math.random() < 0.55 ? [40,181,181] : Math.random() < 0.5 ? [255,107,0] : [123,44,191],
    }));

    // ── Speed streaks ──────────────────────────────────────────────────────
    const STREAK_COUNT = 55;
    function makeStreak(scatter) {
      return {
        x:     scatter ? Math.random() * (window.innerWidth + 600) - 300 : -(70 + Math.random() * 450),
        y:     Math.random(),
        speed: 3.5 + Math.random() * 11,
        len:   40  + Math.random() * 210,
        alpha: 0.20 + Math.random() * 0.40,
        lw:    0.3  + Math.random() * 1.3,
      };
    }
    const streaks = Array.from({ length: STREAK_COUNT }, () => makeStreak(true));

    // ── Scan line ──────────────────────────────────────────────────────────
    let scanX = -100, scanTimer = 5.0;  // start first scan immediately

    // ── Draw loop ──────────────────────────────────────────────────────────
    let lastT = 0;
    function draw(now) {
      const dt = Math.min((now - lastT) * 0.001, 0.05);
      lastT = now;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // — Particles —
      particles.forEach(p => {
        p.y += p.vy * dt;
        p.x += p.vx * dt;
        if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
        if (p.x < -0.02) p.x = 1.02;
        if (p.x > 1.02)  p.x = -0.02;
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(160,210,255,${p.alpha})`;
        ctx.fill();
      });

      // — Neural trace lines —
      traces.forEach(tr => {
        tr.progress += tr.speed;
        if (tr.progress > 1.08) {
          Object.assign(tr, makeTrace(false));
          return;
        }
        const prog = Math.min(tr.progress, 1.0);
        if (prog < 0.01) return;

        const x0  = tr.x0  * W, y0  = tr.y0  * H;
        const cx1 = tr.cx1 * W, cy1 = tr.cy1 * H;
        const cx2 = tr.cx2 * W, cy2 = tr.cy2 * H;
        const x1  = tr.x1  * W, y1  = tr.y1  * H;

        // Fade envelope
        let env;
        if      (prog < 0.12) env = prog / 0.12;
        else if (prog > 0.82) env = (1 - prog) / 0.18;
        else                  env = 1;
        const alpha = tr.maxAlpha * env;

        const rgb0 = hexRGB(tr.colors[0]);
        const rgb1 = hexRGB(tr.colors[1]);
        const rgb2 = hexRGB(tr.colors[2]);

        const STEPS = 64;
        ctx.save();
        ctx.lineWidth = tr.width;
        ctx.lineCap   = 'round';

        for (let i = 0; i < STEPS - 1; i++) {
          const t0 = (i       / STEPS) * prog;
          const t1 = ((i + 1) / STEPS) * prog;
          const f  = i / (STEPS - 1);
          const px0 = cubic(x0, cx1, cx2, x1, t0);
          const py0 = cubic(y0, cy1, cy2, y1, t0);
          const px1 = cubic(x0, cx1, cx2, x1, t1);
          const py1 = cubic(y0, cy1, cy2, y1, t1);

          const rgb = f < 0.5
            ? lerpColor(rgb0, rgb1, f * 2)
            : lerpColor(rgb1, rgb2, (f - 0.5) * 2);

          if (tr.glow) {
            ctx.shadowBlur  = 7;
            ctx.shadowColor = `rgba(${rgb.join(',')},0.8)`;
          }
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${rgb.join(',')},${alpha})`;
          ctx.moveTo(px0, py0);
          ctx.lineTo(px1, py1);
          ctx.stroke();
        }

        // Glowing seed dot at leading edge
        if (prog > 0.04 && prog < 0.97) {
          const fx = cubic(x0, cx1, cx2, x1, prog);
          const fy = cubic(y0, cy1, cy2, y1, prog);
          ctx.shadowBlur  = 16;
          ctx.shadowColor = `rgba(${rgb0.join(',')},1)`;
          ctx.beginPath();
          ctx.arc(fx, fy, 2.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${alpha})`;
          ctx.fill();
        }
        ctx.restore();
      });

      // — Pixel nodes —
      nodes.forEach(n => {
        n.phase += n.freq * dt;
        const s = n.size * (0.88 + Math.sin(n.phase) * 0.14);
        const a = n.alpha * (0.65 + Math.sin(n.phase) * 0.35);
        ctx.fillStyle = `rgba(${n.color.join(',')},${a})`;
        ctx.fillRect(n.x * W - s, n.y * H - s, s * 2, s * 2);
      });

      // — Speed streaks —
      streaks.forEach(s => {
        const y = s.y * H;
        const grd = ctx.createLinearGradient(s.x, y, s.x + s.len, y);
        grd.addColorStop(0,    `rgba(40,181,181,0)`);
        grd.addColorStop(0.25, `rgba(40,181,181,${s.alpha})`);
        grd.addColorStop(0.70, `rgba(200,245,255,${s.alpha * 0.75})`);
        grd.addColorStop(1,    `rgba(255,255,255,0)`);
        ctx.beginPath();
        ctx.strokeStyle = grd;
        ctx.lineWidth   = s.lw;
        ctx.moveTo(s.x, y);
        ctx.lineTo(s.x + s.len, y);
        ctx.stroke();
        s.x += s.speed;
        if (s.x > W + s.len) Object.assign(s, makeStreak(false));
      });

      // — Scan line sweep (every ~5s) —
      scanTimer += dt;
      if (scanTimer > 5.0) { scanTimer = 0; scanX = -40; }
      if (scanX < W + 40) {
        scanX += W * 0.30 * dt;
        const sg = ctx.createLinearGradient(scanX - 40, 0, scanX + 2, 0);
        sg.addColorStop(0,   'rgba(255,255,255,0)');
        sg.addColorStop(0.7, 'rgba(255,255,255,0.045)');
        sg.addColorStop(1,   'rgba(255,255,255,0.02)');
        ctx.fillStyle = sg;
        ctx.fillRect(scanX - 40, 0, 42, H);
      }

      requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
  }

  initHeroCanvas();

  // ==========================================================================
  // HERO — staggered entrance animations
  // ==========================================================================
  const heroItems = [
    { el: '.hero__bg',          delay: 0 },
    { el: '.hero__eyebrow',     delay: 100 },
    { el: '.hero__headline',    delay: 300 },
    { el: '.hero__subheadline', delay: 500 },
    { el: '.hero__ctas',        delay: 700 },
    { el: '.hero__scroll',      delay: 1100 },
  ];

  heroItems.forEach(({ el, delay }) => {
    const node = document.querySelector(el);
    if (node) {
      setTimeout(() => node.classList.add('visible'), delay);
    }
  });

  // ==========================================================================
  // SCROLL REVEAL — generic reveal for .reveal elements
  // ==========================================================================
  const revealEls = Array.from(document.querySelectorAll('.reveal'));

  function revealEl(el) {
    el.classList.add('visible');
    revealObserver.unobserve(el);
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) revealEl(entry.target);
    });
  }, { threshold: 0, rootMargin: '0px 0px 200px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  // Immediately reveal anything already in (or near) the viewport on load
  function revealVisible() {
    revealEls.forEach(el => {
      if (el.classList.contains('visible')) return;
      if (el.getBoundingClientRect().top < window.innerHeight + 200) revealEl(el);
    });
  }
  revealVisible();

  // Fallback for fast scrolling — catch elements the observer may have missed
  window.addEventListener('scroll', revealVisible, { passive: true });

  // ==========================================================================
  // COUNT-UP ANIMATION — for stat numbers
  // ==========================================================================
  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function animateCount(el, options) {
    const { target, prefix = '', suffix = '', decimals = 0, duration = 1500 } = options;
    const startTime = performance.now();

    function tick(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutExpo(progress);
      const value    = target * eased;
      const display  = decimals > 0 ? value.toFixed(decimals) : Math.round(value);

      el.textContent = `${prefix}${display}${suffix}`;

      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = `${prefix}${decimals > 0 ? target.toFixed(decimals) : target}${suffix}`;
    }

    requestAnimationFrame(tick);
  }

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        animateCount(el, {
          target:   parseFloat(el.dataset.count),
          prefix:   el.dataset.prefix  || '',
          suffix:   el.dataset.suffix  || '',
          decimals: parseInt(el.dataset.decimals || '0'),
        });
        countObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

  // ==========================================================================
  // ARCHITECTURE DIAGRAM — animate on scroll into view
  // ==========================================================================
  const archDiagram = document.querySelector('.arch-diagram');
  if (archDiagram) {
    const archObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          archDiagram.classList.add('animate');
          archObserver.unobserve(archDiagram);
        }
      });
    }, { threshold: 0.3 });
    archObserver.observe(archDiagram);
  }

  // ==========================================================================
  // SMOOTH SCROLL — internal anchor links
  // ==========================================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ==========================================================================
  // CONTACT FORM — simple submit feedback
  // ==========================================================================
  const form = document.querySelector('.contact-form form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('.form-submit');
      btn.textContent = 'Sent — we\'ll be in touch.';
      btn.disabled = true;
      btn.style.opacity = '0.7';
      setTimeout(() => {
        btn.textContent = 'Send message';
        btn.disabled = false;
        btn.style.opacity = '';
        form.reset();
      }, 4000);
    });
  }

});

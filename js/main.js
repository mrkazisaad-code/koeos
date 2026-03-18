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
  // HERO CANVAS — wave + speed-streak animation
  // ==========================================================================
  function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let raf;

    function resize() {
      canvas.width  = canvas.offsetWidth  || window.innerWidth;
      canvas.height = canvas.offsetHeight || window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Fade canvas in
    setTimeout(() => canvas.classList.add('visible'), 600);

    // ── Wave lines ─────────────────────────────────────────────────────────
    const WAVE_COUNT = 10;
    const waves = Array.from({ length: WAVE_COUNT }, (_, i) => ({
      yBase:      0.12 + (i / (WAVE_COUNT - 1)) * 0.76,   // spread top→bottom
      amplitude:  8  + Math.random() * 32,
      wavelength: 0.005 + Math.random() * 0.009,
      speed:      0.25 + Math.random() * 0.75,             // radians / simulated-sec
      phase:      Math.random() * Math.PI * 2,
      opacity:    0.04 + Math.random() * 0.10,
      lineWidth:  0.4  + Math.random() * 1.1,
    }));

    // ── Speed streaks ───────────────────────────────────────────────────────
    const STREAK_COUNT = 70;

    function makeStreak(scatterX) {
      return {
        x:     scatterX
               ? Math.random() * (window.innerWidth + 600) - 300   // scatter on init
               : -(60 + Math.random() * 600),                       // enter from left
        y:     Math.random(),
        speed: 2.5 + Math.random() * 8.5,
        len:   45  + Math.random() * 230,
        alpha: 0.06 + Math.random() * 0.22,
        lw:    0.35 + Math.random() * 1.1,
      };
    }

    const streaks = Array.from({ length: STREAK_COUNT }, () => makeStreak(true));

    let t = 0;

    function draw() {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Draw wave lines
      waves.forEach(w => {
        const yBase = w.yBase * H;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(40,181,181,${w.opacity})`;
        ctx.lineWidth   = w.lineWidth;
        let first = true;
        for (let x = 0; x <= W; x += 3) {
          const y = yBase + Math.sin(x * w.wavelength + t * w.speed + w.phase) * w.amplitude;
          if (first) { ctx.moveTo(x, y); first = false; }
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // Draw and advance speed streaks
      streaks.forEach(s => {
        const y  = s.y * H;
        const x0 = s.x;
        const x1 = s.x + s.len;

        // Teal → bright-white trailing gradient
        const grd = ctx.createLinearGradient(x0, y, x1, y);
        grd.addColorStop(0,    `rgba(40,181,181,0)`);
        grd.addColorStop(0.25, `rgba(40,181,181,${s.alpha})`);
        grd.addColorStop(0.72, `rgba(210,248,248,${s.alpha * 0.65})`);
        grd.addColorStop(1,    `rgba(255,255,255,0)`);

        ctx.beginPath();
        ctx.strokeStyle = grd;
        ctx.lineWidth   = s.lw;
        ctx.moveTo(x0, y);
        ctx.lineTo(x1, y);
        ctx.stroke();

        // Advance; reset when fully off-screen right
        s.x += s.speed;
        if (s.x > W + s.len) Object.assign(s, makeStreak(false));
      });

      t  += 0.016;
      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
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
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

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

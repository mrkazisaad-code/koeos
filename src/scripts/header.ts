/**
 * Sticky header: transparent over the hero, solid after 80px, hides on scroll down and
 * returns on scroll up; reading-progress line; active section link; mobile menu.
 */
export function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;
  const progress = header.querySelector<HTMLElement>('[data-progress]');
  let lastY = window.scrollY;
  let ticking = false;
  let menuOpen = false;

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 80);
    const delta = y - lastY;
    const focusInside = header.contains(document.activeElement);
    if (menuOpen || focusInside || y < 80) header.classList.remove('is-hidden');
    else if (delta > 4) header.classList.add('is-hidden');
    else if (delta < -4) header.classList.remove('is-hidden');
    lastY = y;
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    }
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
  update();

  // Active section link
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]'));
  const navOrder = ['what', 'how', 'base', 'where', 'europe', 'who', 'engage', 'record', 'contact'];
  // Sections without their own link light the nearest preceding link.
  const owner: Record<string, string | null> = {
    top: null, why: null, what: 'what', how: 'how', base: 'how', where: 'where', europe: 'where',
    who: 'where', engage: 'engage', record: 'record', contact: null,
  };
  const setActive = (id: string | null) =>
    links.forEach((a) => (a.hash.slice(1) === id ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
  const sections = ['top', 'why', ...navOrder]
    .map((id) => document.getElementById(id))
    .filter((s): s is HTMLElement => !!s);
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) setActive(owner[e.target.id] ?? null);
      });
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  sections.forEach((s) => io.observe(s));

  // Mobile menu: modal dialog (inert background), focus trapped, Escape closes.
  const menu = document.querySelector<HTMLDialogElement>('[data-menu]');
  const openBtn = header.querySelector<HTMLButtonElement>('[data-menu-open]');
  if (menu && openBtn && typeof menu.showModal === 'function') {
    openBtn.hidden = false;
    const close = () => menu.open && menu.close();
    openBtn.addEventListener('click', () => {
      menu.showModal();
      menuOpen = true;
      openBtn.setAttribute('aria-expanded', 'true');
      document.documentElement.style.overflow = 'hidden';
      menu.querySelector<HTMLElement>('[data-menu-link]')?.focus();
    });
    let navTarget: HTMLElement | null = null;
    menu.addEventListener('close', () => {
      menuOpen = false;
      openBtn.setAttribute('aria-expanded', 'false');
      document.documentElement.style.overflow = '';
      if (navTarget) {
        const t = navTarget;
        navTarget = null;
        if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1');
        t.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
        t.focus({ preventScroll: true });
      } else openBtn.focus();
    });
    menu.querySelector('[data-menu-close]')?.addEventListener('click', close);
    menu.querySelectorAll<HTMLAnchorElement>('[data-menu-link]').forEach((a) =>
      a.addEventListener('click', (e) => {
        const target = document.querySelector<HTMLElement>(a.hash);
        if (!target) return;
        e.preventDefault();
        navTarget = target;
        history.pushState(null, '', a.hash);
        menu.close();
      }),
    );
    // Explicit trap so Tab never leaves the panel for the browser chrome.
    menu.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const f = Array.from(menu.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (m) => m.matches && close());
  }
}

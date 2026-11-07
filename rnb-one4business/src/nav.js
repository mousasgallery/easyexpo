/** Header, μενού κινητού, ενεργή ενότητα και εσωτερικοί σύνδεσμοι. */
export function initNav(reducedMotion) {
  const menu = document.querySelector('[data-menu]');
  const openBtn = document.querySelector('[data-menu-open]');
  const closeBtn = document.querySelector('[data-menu-close]');
  let lastFocus = null;

  const focusables = () => [...menu.querySelectorAll('a[href], button:not([disabled])')];
  function open() {
    lastFocus = document.activeElement;
    menu.hidden = false;
    openBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    focusables()[1]?.focus();
  }
  function close({ restore = true } = {}) {
    if (menu.hidden) return;
    menu.hidden = true;
    openBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (restore) (lastFocus && document.contains(lastFocus) ? lastFocus : openBtn).focus();
  }
  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', () => close());
  menu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    const f = focusables(); const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) close({ restore: false }); });
  window.matchMedia('(min-width: 981px)').addEventListener('change', (e) => e.matches && close({ restore: false }));

  // Εσωτερικοί σύνδεσμοι: φυσική κύλιση και μεταφορά εστίασης στην επικεφαλίδα της ενότητας.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.classList.contains('skip-link')) return;
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const behavior = reducedMotion.matches ? 'auto' : 'smooth';
    if (id === 'arxi') window.scrollTo({ top: 0, behavior });
    else target.scrollIntoView({ behavior, block: 'start' });
    history.replaceState(null, '', `#${id}`);
    const heading = id === 'arxi' ? document.getElementById('hero-title') : target.querySelector('h2') || target;
    if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  });

  // Ενεργή ενότητα στο μενού desktop.
  const links = [...document.querySelectorAll('[data-desktop-nav] a')];
  const sections = links.map((a) => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((l) => l.toggleAttribute('aria-current', l.getAttribute('href') === `#${en.target.id}`));
      links.forEach((l) => l.hasAttribute('aria-current') && l.setAttribute('aria-current', 'true'));
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach((s) => io.observe(s));
}

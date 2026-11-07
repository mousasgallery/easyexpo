/** Μενού κινητού (Escape, focus trap, επιστροφή εστίασης, κλείσιμο μετά από επιλογή) και εσωτερικοί σύνδεσμοι. */
export function initNav(reducedMotion) {
  const menu = document.querySelector('[data-menu]');
  const openBtn = document.querySelector('[data-menu-open]');
  const closeBtn = document.querySelector('[data-menu-close]');
  let last = null;
  const focusables = () => [...menu.querySelectorAll('a[href], button:not([disabled])')];
  function open() { last = document.activeElement; menu.hidden = false; openBtn.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; focusables()[1]?.focus(); }
  function close({ restore = true } = {}) {
    if (menu.hidden) return;
    menu.hidden = true; openBtn.setAttribute('aria-expanded', 'false'); document.body.style.overflow = '';
    if (restore) (last && document.contains(last) ? last : openBtn).focus();
  }
  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', () => close());
  menu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    const f = focusables(), first = f[0], lastEl = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
    else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
  });
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) close({ restore: false }); });
  window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => e.matches && close({ restore: false }));

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.classList.contains('skip-link')) return;
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const behavior = reducedMotion.matches ? 'auto' : 'smooth';
    if (id === 'top') window.scrollTo({ top: 0, behavior }); else target.scrollIntoView({ behavior, block: 'start' });
    history.replaceState(null, '', `#${id}`);
    const focusEl = target.matches('[data-demo]') ? target : target.querySelector('h1, h2') || target;
    if (!focusEl.hasAttribute('tabindex')) focusEl.setAttribute('tabindex', '-1');
    focusEl.focus({ preventScroll: true });
  });
}

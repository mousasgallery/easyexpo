import './tokens.css';
import './styles.css';
import { initRain } from './rain.js';
import { initDemo } from './demo.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- Header: σκιά κατά την κύλιση ---------- */
function initHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;
  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

/* ---------- Μενού κινητού ---------- */
function initMobileNav() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const panel = document.querySelector('[data-nav-panel]');
  if (!toggle || !panel) return;
  const label = toggle.querySelector('.nav-toggle-label');
  const mq = window.matchMedia('(max-width: 860px)');

  const setOpen = (open, { focusToggle = false } = {}) => {
    toggle.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('is-open', open);
    if (label) label.textContent = open ? 'Κλείσιμο' : 'Μενού';
    if (open) panel.querySelector('a')?.focus();
    else if (focusToggle) toggle.focus();
  };

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  panel.addEventListener('click', (e) => {
    if (e.target.closest('a') && mq.matches) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setOpen(false, { focusToggle: true });
  });
  document.addEventListener('click', (e) => {
    if (mq.matches && toggle.getAttribute('aria-expanded') === 'true' && !e.target.closest('.site-nav')) setOpen(false);
  });
  // Όταν η εστίαση φεύγει από το ανοιχτό μενού με Tab, κλείνει.
  panel.addEventListener('focusout', (e) => {
    if (mq.matches && e.relatedTarget && !e.target.closest('.site-nav')?.contains(e.relatedTarget)) setOpen(false);
  });
  mq.addEventListener('change', () => setOpen(false));
}

/* ---------- Ενεργή ενότητα στο μενού ---------- */
function initActiveSection() {
  const links = [...document.querySelectorAll('.nav-list a[href^="#"]')];
  const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const sections = [...map.keys()].map((id) => document.getElementById(id)).filter(Boolean);
  if (!('IntersectionObserver' in window) || !sections.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.removeAttribute('aria-current'));
        map.get(entry.target.id)?.setAttribute('aria-current', 'true');
      });
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  sections.forEach((s) => io.observe(s));
}

/* ---------- Εσωτερικοί σύνδεσμοι: μεταφορά εστίασης στην ενότητα ---------- */
function initInPageLinks() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const target = id === 'top' ? document.getElementById('top') : document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const behavior = reducedMotion.matches ? 'auto' : 'smooth';
    if (id === 'top') window.scrollTo({ top: 0, behavior });
    else target.scrollIntoView({ behavior, block: 'start' });
    history.replaceState(null, '', id === 'top' ? location.pathname + location.search : `#${id}`);
    const focusTarget = target.querySelector('h1, h2') || target;
    if (!focusTarget.hasAttribute('tabindex')) focusTarget.setAttribute('tabindex', '-1');
    focusTarget.focus({ preventScroll: true });
  });
}

document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = String(new Date().getFullYear());
});

initHeader();
initMobileNav();
initActiveSection();
initInPageLinks();
initDemo(document.querySelector('[data-demo]'));
initRain(document.querySelector('[data-rain]'), reducedMotion);

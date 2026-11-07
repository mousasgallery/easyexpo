import './fonts.css';
import './tokens.css';
import './styles.css';
import { initNav } from './nav.js';
import { initStory } from './story.js';
import { initDemo } from './demo.js';
import { initForm } from './form.js';

const config = JSON.parse(document.getElementById('rnb-config')?.textContent || '{}');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

initNav(reducedMotion);
initStory({ root: document.querySelector('[data-story]'), config, reducedMotion });
initDemo(document.querySelector('[data-demo]'));
initForm(document.querySelector('[data-form]'), config);

// Άμεση φόρτωση /#demo ή /#epideixi: σωστή θέση μετά τη διάταξη της σκηνής.
if (location.hash.length > 1) {
  const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (el) requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }));
}

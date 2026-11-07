import './fonts.css';
import './tokens.css';
import './styles.css';
import { TYPING } from './content/copy.js';
import { initNav } from './nav.js';
import { initTerminal } from './typing.js';
import { initCinema } from './cinema.js';
import { initDemo } from './demo.js';

const config = JSON.parse(document.getElementById('rnb-config')?.textContent || '{}');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

initNav(reducedMotion);
initTerminal(document.querySelector('[data-terminal]'), TYPING, reducedMotion);
initCinema(document.querySelector('[data-cinema]'), config.MEDIA, reducedMotion);
initDemo(document.querySelector('[data-demo]'));

// Άμεση φόρτωση με hash (/#example κ.λπ.): σωστή θέση αφού σταθεροποιηθεί η διάταξη (γραμματοσειρές).
if (location.hash.length > 1) {
  const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (el) {
    const go = () => el.scrollIntoView({ block: 'start', behavior: 'instant' });
    go();
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(go));
  }
}

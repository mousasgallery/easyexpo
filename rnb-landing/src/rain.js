/**
 * Αργή ψηφιακή βροχή στο φόντο του hero.
 * - Πρωτότυποι χαρακτήρες: ελληνικά γράμματα και ψηφία.
 * - Πίσω από το περιεχόμενο (z-index, pointer-events: none, aria-hidden).
 * - Με reduced motion: ένα στατικό καρέ.
 * - Σταματά όταν το hero δεν είναι ορατό ή η καρτέλα είναι κρυφή.
 * - Χαμηλό κόστος: ~16 καρέ/δευτ., όριο DPR, λιγότερες στήλες σε κινητό.
 */
const GLYPHS = 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθλμξπσφψω0123456789';

function cssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export function initRain(canvas, reducedMotionMQ) {
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  const colors = {
    bg: cssVar('--c-near-black', '#0D0208'),
    glyph: cssVar('--rain-glyph', '#008F11'),
    deep: cssVar('--c-deep-green', '#003B00'),
    head: cssVar('--rain-head', '#00FF41'),
  };

  const FRAME_MS = 1000 / 16;
  let w = 0, h = 0, dpr = 1, fontSize = 16, columns = [], raf = 0, last = 0;
  let visible = true, running = false;

  const pick = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = Math.max(1, Math.floor(rect.width));
    h = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    fontSize = w < 600 ? 15 : 18;
    const gap = w < 600 ? 2.2 : 1.7; // αραιές στήλες = χαμηλή ένταση
    const count = Math.ceil(w / (fontSize * gap));
    columns = Array.from({ length: count }, (_, i) => ({
      x: Math.round(i * fontSize * gap),
      y: Math.random() * (h + 22 * fontSize), // ήδη γεμάτη οθόνη από την αρχή
      speed: 0.35 + Math.random() * 0.55, // σε γραμμές ανά καρέ ×0.1 → αργή
      len: 8 + ((Math.random() * 14) | 0),
      chars: Array.from({ length: 24 }, pick),
    }));
    ctx.font = `${fontSize}px ui-monospace, Menlo, Consolas, monospace`;
    ctx.textBaseline = 'top';
    drawFrame(true);
  }

  function drawFrame(full) {
    ctx.globalAlpha = 1;
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, w, h);
    for (const col of columns) {
      for (let j = 0; j < col.len; j++) {
        const y = col.y - j * fontSize;
        if (y < -fontSize || y > h) continue;
        const ch = col.chars[j % col.chars.length];
        if (j === 0) {
          ctx.fillStyle = colors.head;
          ctx.globalAlpha = 0.55;
        } else {
          ctx.fillStyle = j > col.len * 0.6 ? colors.deep : colors.glyph;
          ctx.globalAlpha = Math.max(0.12, 0.7 * (1 - j / col.len));
        }
        ctx.fillText(ch, col.x, y);
      }
      if (!full) {
        col.y += col.speed * fontSize * 0.18;
        if (Math.random() < 0.04) col.chars[(Math.random() * col.chars.length) | 0] = pick();
        if (col.y - col.len * fontSize > h) {
          col.y = Math.random() * -h * 0.5;
          col.speed = 0.35 + Math.random() * 0.55;
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  function loop(t) {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    if (t - last < FRAME_MS) return;
    last = t;
    drawFrame(false);
  }

  function start() {
    if (running || reducedMotionMQ.matches || !visible || document.hidden) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(loop);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }
  function staticFrame() {
    // Στατικό καρέ: στήλες σε τυχαίες θέσεις μέσα στο hero
    columns.forEach((c) => { c.y = Math.random() * (h + c.len * fontSize); });
    drawFrame(true);
  }

  resize();
  if (reducedMotionMQ.matches) staticFrame();

  let resizeTimer = 0;
  new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      if (reducedMotionMQ.matches) staticFrame();
    }, 120);
  }).observe(canvas);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      visible ? start() : stop();
    }).observe(canvas);
  }
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  reducedMotionMQ.addEventListener('change', () => {
    if (reducedMotionMQ.matches) { stop(); staticFrame(); } else start();
  });

  // Για έλεγχο ποιότητας (QA): κατάσταση κίνησης
  canvas.dataset.state = 'ready';
  Object.defineProperty(canvas, 'rainRunning', { get: () => running });

  start();
}

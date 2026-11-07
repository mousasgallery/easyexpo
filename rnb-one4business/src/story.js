/**
 * Κινηματογραφική αρχή (#arxi) — story renderer.
 *
 * Δύο τρόποι απόδοσης στην ίδια pinned σκηνή:
 *  1. Αλληλουχία frames (Higgsfield), όταν STORY_SEQUENCE.enabled και υπάρχει manifest.
 *     Επιλέγεται ΜΟΝΟ η κατάλληλη εκδοχή (mobile ή desktop) πριν από οποιοδήποτε request.
 *  2. Πρωτότυπο procedural fallback σε canvas (τρία γεωμετρικά αντικείμενα → πράσινο σήμα →
 *     πλαίσιο εργασίας → απόφαση). Δηλώνεται ως fallback, όχι ως ολοκληρωμένη κινηματογραφική έκδοση.
 *
 * Το κείμενο, τα κουμπιά και το τερματικό είναι πραγματικό HTML. Native scroll, χωρίς παγίδευση.
 * Reduced motion: στατική σύνθεση σε κανονική ροή, χωρίς λήψη frames.
 */
import { FrameSequence } from './sequence.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p, a, b) => clamp((p - a) / (b - a));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;

/** Χρονοδιάγραμμα αφήγησης σε τμήματα του ενεργού scroll travel (0..1). */
const BEATS = {
  scene1End: 0.2,      // 01 — Η καθημερινότητα (τίτλος + CTA)
  signalStart: 0.2,    // 02 — Η σύνδεση (μόνο το σήμα, χωρίς κείμενο)
  signalEnd: 0.46,
  taskStart: 0.47,     // 03 — Η εργασία αποκτά δομή (τερματικό)
  typeStart: 0.5,
  typeEnd: 0.7,
  taskEnd: 0.76,
  decisionStart: 0.78, // 04 — Η απόφαση παραμένει δική σου
};

export function initStory({ root, config, reducedMotion }) {
  if (!root) return null;
  const stage = root.querySelector('[data-stage]');
  const canvas = root.querySelector('[data-story-canvas]');
  const ctx = canvas.getContext('2d');
  const chapters = [...root.querySelectorAll('[data-chapter]')];
  const progressBar = root.querySelector('[data-progress]');
  const terminal = root.querySelector('[data-terminal]');
  const lines = prepareTerminal(root.querySelector('[data-terminal-body]'));
  const seqCfg = config.STORY_SEQUENCE || {};
  const mobileMQ = window.matchMedia(seqCfg.mobileQuery || '(max-width: 760px)');

  let W = 0, H = 0, DPR = 1, travel = 1, target = 0, current = 0;
  let lastDrawn = -1, lastPaint = 0;
  let raf = 0, visible = true, staticMode = false, sequence = null, sequenceKind = null;
  const t0 = performance.now();

  /* ---------- Μέγεθος & travel ---------- */
  function measure() {
    const r = stage.getBoundingClientRect();
    // Λογικό DPR: λιγότερα pixels σε κινητό για σταθερό ρυθμό καρέ.
    DPR = Math.min(window.devicePixelRatio || 1, mobileMQ.matches ? 1.25 : 1.5);
    Q = mobileMQ.matches ? 0.5 : 1;
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    travel = Math.max(1, root.offsetHeight - stage.offsetHeight);
  }

  function readProgress() {
    if (staticMode) return 0;
    // 0 όταν η σκηνή «καρφώνεται» κάτω από το header, 1 στο τέλος του ενεργού travel.
    const headerOffset = parseFloat(getComputedStyle(stage).top) || 0;
    return clamp((headerOffset - root.getBoundingClientRect().top) / travel);
  }

  /* ---------- Κεφάλαια HTML ---------- */
  function setChapter(el, active, leaving = false) {
    el.classList.toggle('is-active', active);
    el.classList.toggle('is-leaving', leaving);
    // Ανενεργά στρώματα δεν δέχονται κλικ ούτε εστίαση πληκτρολογίου.
    if (active) el.removeAttribute('inert'); else el.setAttribute('inert', '');
  }

  function updateHtml(p) {
    const [c1, c3, c4] = chapters;
    setChapter(c1, p < BEATS.scene1End, p >= BEATS.scene1End);
    setChapter(c3, p >= BEATS.taskStart && p < BEATS.taskEnd);
    setChapter(c4, p >= BEATS.decisionStart);
    if (progressBar) progressBar.style.transform = `scaleX(${p.toFixed(4)})`;
    typeTerminal(lines, seg(p, BEATS.typeStart, BEATS.typeEnd));
  }

  /* ---------- Απόδοση canvas ---------- */
  function render(p, now) {
    ctx.clearRect(0, 0, W, H);
    if (sequence && sequence.ready) {
      const n = sequence.count;
      const idx = Math.round(p * (n - 1));
      sequence.request(idx);
      const bmp = sequence.get(idx);
      if (bmp) { drawCover(ctx, bmp, W, H); return; }
      if (sequence.poster) { drawCover(ctx, sequence.poster, W, H); return; }
    }
    drawProcedural(ctx, W, H, p, (now - t0) / 1000, mobileMQ.matches, terminalRect());
  }

  function terminalRect() {
    if (!terminal) return null;
    const s = stage.getBoundingClientRect();
    const r = terminal.getBoundingClientRect();
    if (!r.width) return null;
    return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height };
  }

  function frame(now) {
    raf = 0;
    target = readProgress();
    current = Math.abs(target - current) < 0.0005 ? target : lerp(current, target, 0.18);
    const moving = current !== lastDrawn;
    // Όταν η κύλιση ηρεμεί, η ατμοσφαιρική κίνηση αποδίδεται σε ~20 fps.
    if (moving || now - lastPaint > 50) {
      updateHtml(current);
      render(current, now);
      lastDrawn = current; lastPaint = now;
    }
    if (visible && !document.hidden) raf = requestAnimationFrame(frame);
  }
  const start = () => { if (!raf && !staticMode) raf = requestAnimationFrame(frame); };
  const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };

  /* ---------- Αλληλουχία frames ---------- */
  async function chooseSequence() {
    if (!seqCfg.enabled || staticMode) { releaseSequence(); return; }
    const kind = mobileMQ.matches ? 'mobile' : 'desktop';
    if (kind === sequenceKind && sequence) return;
    releaseSequence();
    sequenceKind = kind;
    const seq = new FrameSequence(seqCfg[kind], { maxDecoded: kind === 'mobile' ? 24 : 36, concurrency: 4 });
    sequence = seq;
    try {
      await seq.init();
      root.dataset.storyMode = `sequence-${kind}`;
    } catch (err) {
      if (sequence === seq) { releaseSequence(); root.dataset.storyMode = 'procedural-fallback'; }
    }
  }
  function releaseSequence() {
    if (sequence) sequence.destroy();
    sequence = null; sequenceKind = null;
  }

  /* ---------- Στατική λειτουργία (reduced motion) ---------- */
  function applyMode() {
    staticMode = reducedMotion.matches;
    root.classList.toggle('is-static', staticMode);
    chapters.forEach((c) => (staticMode ? (c.classList.add('is-active'), c.removeAttribute('inert')) : null));
    measure();
    if (staticMode) {
      stop();
      releaseSequence();
      typeTerminal(lines, 1);
      root.dataset.storyMode = 'static';
      drawProcedural(ctx, W, H, 0.08, 0, mobileMQ.matches, null);
    } else {
      root.dataset.storyMode = seqCfg.enabled ? 'sequence-pending' : 'procedural-fallback';
      chooseSequence();
      start();
    }
  }

  applyMode();
  window.addEventListener('scroll', start, { passive: true });
  new ResizeObserver(() => { measure(); if (staticMode) drawProcedural(ctx, W, H, 0.08, 0, mobileMQ.matches, null); else start(); }).observe(stage);
  mobileMQ.addEventListener('change', () => { measure(); chooseSequence(); start(); });
  reducedMotion.addEventListener('change', applyMode);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); }, { rootMargin: '-72px 0px 0px 0px' }).observe(root);

  // Για τον έλεγχο ποιότητας: τρέχουσα κατάσταση της σκηνής.
  root.__story = { get progress() { return current; }, get running() { return !!raf; }, get mode() { return root.dataset.storyMode; }, BEATS };
  return root.__story;
}

/* ================= Τερματικό: πληκτρολόγηση ανάλογα με το scroll ================= */
function prepareTerminal(body) {
  if (!body) return [];
  return [...body.querySelectorAll('.t-line')].map((line) => {
    const cursor = line.querySelector('.t-cursor');
    const clip = document.createElement('span');
    clip.className = 't-clip';
    while (line.firstChild && line.firstChild !== cursor) clip.appendChild(line.firstChild);
    if (cursor) { while (cursor.nextSibling) clip.appendChild(cursor.nextSibling); }
    line.insertBefore(clip, cursor || null);
    return { line, clip, len: clip.textContent.length };
  });
}

function typeTerminal(lines, t) {
  if (!lines.length) return;
  const total = lines.reduce((s, l) => s + l.len, 0);
  let chars = Math.round(total * t);
  let typingSet = false;
  for (const l of lines) {
    const n = Math.max(0, Math.min(l.len, chars));
    chars -= n;
    l.clip.style.maxWidth = n >= l.len ? 'none' : `${n}ch`;
    l.line.style.visibility = n === 0 && !(t > 0 && !typingSet) ? 'hidden' : 'visible';
    const typing = !typingSet && n < l.len && t > 0;
    l.line.classList.toggle('is-typing', typing);
    if (typing) typingSet = true;
  }
  if (t === 0) { lines[0].line.style.visibility = 'visible'; lines[0].line.classList.add('is-typing'); }
}

/* ================= Βοηθητικά σχεδίασης ================= */
function drawCover(ctx, img, W, H) {
  const iw = img.width, ih = img.height;
  const s = Math.max(W / iw, H / ih);
  const w = iw * s, h = ih * s;
  ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
}

let Q = 1; // ποιότητα σκιών/λάμψης (μειωμένη σε κινητό)
const C = { stage: '#000000', bg: '#0D0208', surface: '#003B00', mid: '#008F11', accent: '#00FF41', text: '#F2FFF5' };

/**
 * Procedural fallback: πρωτότυπη αφηρημένη σύνθεση. Τρία γεωμετρικά αντικείμενα
 * (μήνυμα, εργασία, παραγγελία) → φωτεινή διαδρομή → πλαίσιο εργασίας → απόφαση.
 */
function drawProcedural(ctx, W, H, p, time, mobile, termRect) {
  ctx.fillStyle = C.stage;
  ctx.fillRect(0, 0, W, H);

  // Βάθος: διακριτική πράσινη ομίχλη
  const fog = ctx.createRadialGradient(W * (mobile ? 0.5 : 0.7), H * (mobile ? 0.35 : 0.45), 0, W * 0.6, H * 0.45, Math.max(W, H) * 0.7);
  fog.addColorStop(0, 'rgba(0,59,0,0.55)');
  fog.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = fog;
  ctx.fillRect(0, 0, W, H);

  drawGrid(ctx, W, H, p, mobile);
  drawRainBand(ctx, W, H, time, mobile, 1 - seg(p, 0.15, 0.35));

  const s1 = 1 - ease(seg(p, BEATS.signalStart, BEATS.signalStart + 0.14));      // αντικείμενα ορατά
  const sig = ease(seg(p, BEATS.signalStart + 0.04, BEATS.signalEnd));            // διαδρομή σήματος
  const task = ease(seg(p, BEATS.taskStart, BEATS.taskStart + 0.08));             // πλαίσιο εργασίας
  const dec = ease(seg(p, BEATS.decisionStart, Math.min(1, BEATS.decisionStart + 0.12)));

  // Θέσεις αντικειμένων
  const base = mobile
    ? [{ x: 0.24, y: 0.13 }, { x: 0.74, y: 0.1 }, { x: 0.52, y: 0.27 }]
    : [{ x: 0.6, y: 0.3 }, { x: 0.82, y: 0.24 }, { x: 0.72, y: 0.62 }];
  const meet = mobile ? { x: 0.5, y: 0.18 } : { x: 0.7, y: 0.42 };
  const size = Math.min(W, H) * (mobile ? 0.1 : 0.11);

  if (s1 > 0.01) {
    base.forEach((b, i) => {
      const bob = Math.sin(time * 0.7 + i * 2.1) * size * 0.06 * s1;
      const conv = 1 - s1;
      const x = lerp(b.x, meet.x, conv) * W;
      const y = lerp(b.y, meet.y, conv) * H + bob;
      drawToken(ctx, i, x, y, size * lerp(1, 0.35, conv), s1, time + i);
    });
  }

  // Διαδρομή σήματος
  const end = termRect && task > 0
    ? { x: termRect.x - 12, y: termRect.y + termRect.h * 0.5 }
    : mobile ? { x: W * 0.5, y: H * 0.62 } : { x: W * 0.62, y: H * 0.5 };
  const startPt = { x: meet.x * W, y: meet.y * H };
  if (sig > 0) {
    // Μία συνεχής, ήπια καμπύλη από το σημείο σύγκλισης προς το πλαίσιο εργασίας.
    const pts = mobile
      ? [startPt, { x: W * 0.1, y: H * 0.35 }, { x: W * 0.92, y: H * 0.5 }, end]
      : [startPt, { x: W * 0.58, y: H * 0.88 }, { x: Math.max(W * 0.2, end.x - W * 0.25), y: end.y + H * 0.05 }, end];
    drawSignal(ctx, pts, sig, 1 - 0.8 * dec, time);
  }

  // Πλαίσιο εργασίας γύρω από το πραγματικό HTML τερματικό
  if (task > 0 && termRect && dec < 1) {
    ctx.save();
    ctx.globalAlpha = task * (1 - dec);
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = C.accent;
    ctx.shadowBlur = 28 * Q;
    roundRect(ctx, termRect.x - 8, termRect.y - 8, termRect.w + 16, termRect.h + 16, 18);
    ctx.stroke();
    ctx.restore();
  }

  // Απόφαση: ήρεμη επιφάνεια με δύο κόμβους (προσχέδιο → έγκριση)
  if (dec > 0) {
    const cx = mobile ? W * 0.5 : W * 0.72, cy = mobile ? H * 0.3 : H * 0.48;
    const pw = Math.min(W * (mobile ? 0.8 : 0.34), 460), ph = pw * 0.56;
    ctx.save();
    ctx.globalAlpha = dec;
    const g = ctx.createLinearGradient(cx - pw / 2, cy - ph / 2, cx + pw / 2, cy + ph / 2);
    g.addColorStop(0, 'rgba(0,59,0,0.55)');
    g.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = g;
    roundRect(ctx, cx - pw / 2, cy - ph / 2, pw, ph, 20);
    ctx.fill();
    ctx.strokeStyle = C.mid; ctx.lineWidth = 1; ctx.stroke();
    // γραμμές προσχεδίου
    ctx.fillStyle = 'rgba(183,201,188,0.35)';
    for (let i = 0; i < 3; i++) roundRect(ctx, cx - pw * 0.38, cy - ph * 0.26 + i * ph * 0.16, pw * (i === 2 ? 0.4 : 0.62), ph * 0.06, 4), ctx.fill();
    // κόμβος απόφασης
    const nx = cx + pw * 0.3, ny = cy + ph * 0.18, r = ph * 0.16;
    ctx.shadowColor = C.accent; ctx.shadowBlur = 24 * Q * dec;
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(nx, ny, r, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(nx - r * 0.45, ny); ctx.lineTo(nx - r * 0.1, ny + r * 0.35); ctx.lineTo(nx + r * 0.5, ny - r * 0.35); ctx.stroke();
    ctx.restore();
  }
}

function drawGrid(ctx, W, H, p, mobile) {
  ctx.save();
  ctx.strokeStyle = 'rgba(0,143,17,0.10)';
  ctx.lineWidth = 1;
  const horizon = H * (mobile ? 0.62 : 0.66);
  const shift = (p * 120) % 40;
  for (let i = 0; i < 14; i++) {
    const y = horizon + Math.pow(i / 14, 2) * (H - horizon) + shift * (i / 14);
    ctx.globalAlpha = 0.25 + i / 20;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  for (let i = -10; i <= 10; i++) {
    ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.moveTo(W / 2 + i * 30, horizon); ctx.lineTo(W / 2 + i * W * 0.18, H); ctx.stroke();
  }
  ctx.restore();
}

const GLYPHS = 'ΑΒΓΔΕΖΗΘΛΞΠΣΦΨΩ0123456789';
function drawRainBand(ctx, W, H, time, mobile, alpha) {
  if (alpha <= 0.01) return;
  // Χαμηλής έντασης digital rain μόνο σε περιορισμένη επιφάνεια (brief §5)
  const x0 = mobile ? W * 0.08 : W * 0.48, x1 = mobile ? W * 0.92 : W * 0.98;
  const y1 = H * (mobile ? 0.5 : 0.72);
  ctx.save();
  ctx.font = `${mobile ? 12 : 14}px 'JetBrains Mono', ui-monospace, monospace`;
  ctx.textBaseline = 'top';
  const step = mobile ? 26 : 30;
  for (let x = x0, k = 0; x < x1; x += step, k++) {
    const speed = 22 + ((k * 37) % 17);
    const head = ((time * speed + k * 97) % (y1 + 200)) - 100;
    for (let j = 0; j < 9; j++) {
      const y = head - j * 18;
      if (y < 0 || y > y1) continue;
      ctx.globalAlpha = alpha * (j === 0 ? 0.32 : 0.16 * (1 - j / 9));
      ctx.fillStyle = j === 0 ? C.accent : C.mid;
      ctx.fillText(GLYPHS[(k * 7 + j * 3 + Math.floor(time * 2)) % GLYPHS.length], x, y);
    }
  }
  ctx.restore();
}

function drawToken(ctx, kind, x, y, s, alpha, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(t * 0.4) * 0.08);
  ctx.globalAlpha = alpha;
  const body = ctx.createLinearGradient(-s, -s, s, s);
  body.addColorStop(0, 'rgba(0,59,0,0.85)');
  body.addColorStop(0.55, 'rgba(0,10,4,0.95)');
  body.addColorStop(1, 'rgba(0,0,0,1)');
  ctx.fillStyle = body;
  ctx.strokeStyle = C.mid;
  ctx.lineWidth = 1.2;
  ctx.shadowColor = 'rgba(0,255,65,0.35)';
  ctx.shadowBlur = 30 * Q;
  ctx.beginPath();
  if (kind === 0) { // μήνυμα: γυάλινο παραλληλόγραμμο με αναδίπλωση
    roundRect(ctx, -s, -s * 0.66, s * 2, s * 1.32, s * 0.18);
  } else if (kind === 1) { // εργασία: κύκλος
    ctx.arc(0, 0, s * 0.82, 0, Math.PI * 2);
  } else { // παραγγελία: εξάγωνο
    for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i + Math.PI / 6; ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * s * 0.9, Math.sin(a) * s * 0.9); }
    ctx.closePath();
  }
  ctx.fill();
  ctx.shadowBlur = 0 * Q;
  ctx.stroke();
  // φωτεινή ακμή
  ctx.strokeStyle = C.accent;
  ctx.globalAlpha = alpha * 0.85;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  if (kind === 0) { ctx.moveTo(-s * 0.85, -s * 0.5); ctx.lineTo(0, s * 0.08); ctx.lineTo(s * 0.85, -s * 0.5); }
  else if (kind === 1) { ctx.arc(0, 0, s * 0.82, -2.4, -0.9); }
  else { ctx.moveTo(-s * 0.78, -s * 0.45); ctx.lineTo(0, -s * 0.9); ctx.lineTo(s * 0.78, -s * 0.45); }
  ctx.stroke();
  ctx.restore();
}

function cubic(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

function drawSignal(ctx, pts, head, alpha, time) {
  const [a, b, c, d] = pts;
  const N = 90;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.globalAlpha = alpha;
  // ίχνος
  ctx.strokeStyle = 'rgba(0,143,17,0.85)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= N * head; i++) { const q = cubic(a, b, c, d, i / N); i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); }
  ctx.stroke();
  // φωτεινή κεφαλή
  const hp = cubic(a, b, c, d, head);
  ctx.shadowColor = C.accent;
  ctx.shadowBlur = 26 * Q;
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  const tail = Math.max(0, head - 0.2);
  for (let i = Math.floor(tail * N); i <= N * head; i++) { const q = cubic(a, b, c, d, i / N); i === Math.floor(tail * N) ? ctx.moveTo(q.x, q.y) : ctx.lineTo(q.x, q.y); }
  ctx.stroke();
  ctx.fillStyle = C.text;
  ctx.beginPath(); ctx.arc(hp.x, hp.y, 3.5 + Math.sin(time * 4) * 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

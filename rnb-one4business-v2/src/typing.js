/**
 * Terminal του hero: πραγματική αποκάλυψη ανά χαρακτήρα (grapheme), μία φορά ανά φόρτωση.
 *
 * - Unicode-safe: Intl.Segmenter (graphemes), ώστε τονισμένα ελληνικά και σύνθετοι χαρακτήρες να μη σπάνε.
 * - Χωρίς layout shift: όλοι οι χαρακτήρες υπάρχουν από την αρχή (visibility: hidden) και απλώς αποκαλύπτονται.
 * - Cursor αμέσως μετά τον τελευταίο χαρακτήρα, χωρίς να πιάνει χώρο.
 * - Ξεκινά όταν το terminal γίνει ορατό. Παύει offscreen, σε κρυφή καρτέλα και στο pagehide (bfcache),
 *   και συνεχίζει από το ίδιο σημείο.
 * - «Εμφάνιση όλου» ολοκληρώνει αμέσως. Reduced motion: όλο το κείμενο, χωρίς blinking.
 * - Screen readers: το πλήρες κείμενο μία φορά (sr-only)· το οπτικό στρώμα είναι aria-hidden, χωρίς aria-live.
 * - Χωρίς JavaScript το HTML δείχνει ήδη όλο το κείμενο.
 */
export function initTerminal(root, { charMs = 45, hookPauseMs = 900, startDelayMs = 350 } = {}, reducedMotion) {
  if (!root) return null;
  const lines = root.querySelector('[data-terminal-lines]');
  const skip = root.querySelector('[data-terminal-skip]');
  const hookEls = [...lines.querySelectorAll('.hook')];
  const texts = hookEls.map((el) => el.textContent.trim());

  // Πλήρες κείμενο για screen readers, μία φορά.
  const sr = document.createElement('div');
  sr.className = 'sr-only';
  texts.forEach((t) => { const p = document.createElement('p'); p.textContent = t; sr.appendChild(p); });
  lines.before(sr);
  lines.setAttribute('aria-hidden', 'true');

  // Χαρακτήρες ως spans (textContent, ποτέ HTML).
  const seg = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter('el', { granularity: 'grapheme' }) : null;
  const graphemes = (s) => (seg ? [...seg.segment(s)].map((x) => x.segment) : Array.from(s));
  const chars = hookEls.map((el, i) => {
    el.textContent = '';
    return graphemes(texts[i]).map((g) => {
      const span = document.createElement('span');
      span.className = 'ch';
      span.textContent = g;
      el.appendChild(span);
      return span;
    });
  });
  const total = chars.reduce((n, a) => n + a.length, 0);

  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  cursor.setAttribute('aria-hidden', 'true');

  const state = { hook: 0, index: 0, revealed: 0, done: false, running: false, started: false, visible: false, pausedReason: 'not-started' };
  let timer = 0;

  function placeCursor() {
    const arr = chars[state.hook];
    if (state.index === 0) hookEls[state.hook].prepend(cursor);
    else arr[state.index - 1].after(cursor);
  }

  function finish() {
    clearTimeout(timer);
    chars.flat().forEach((c) => c.classList.add('on'));
    state.hook = chars.length - 1;
    state.index = chars[state.hook].length;
    state.revealed = total;
    state.done = true;
    state.running = false;
    state.pausedReason = 'done';
    placeCursor();
    root.classList.remove('is-typing');
    root.classList.add('is-done');
    if (skip) {
      const hadFocus = document.activeElement === skip;
      skip.hidden = true;
      if (hadFocus) { root.setAttribute('tabindex', '-1'); root.focus({ preventScroll: true }); }
    }
  }

  function tick() {
    timer = 0;
    if (!canRun()) { state.running = false; return; }
    const arr = chars[state.hook];
    if (state.index < arr.length) {
      arr[state.index].classList.add('on');
      state.index += 1;
      state.revealed += 1;
      placeCursor();
      schedule(charMs);
    } else if (state.hook < chars.length - 1) {
      state.hook += 1;
      state.index = 0;
      placeCursor();
      schedule(hookPauseMs);
    } else {
      finish();
    }
  }

  function schedule(ms) { clearTimeout(timer); timer = setTimeout(tick, ms); state.running = true; state.pausedReason = ''; }
  const canRun = () => !state.done && state.visible && !document.hidden && !pagehidden;
  let pagehidden = false;

  function resume() {
    if (state.done || timer || !canRun()) return;
    if (!state.started) { state.started = true; placeCursor(); schedule(startDelayMs); return; }
    schedule(state.index === 0 && state.hook > 0 ? hookPauseMs : charMs);
  }
  function pause(reason) {
    if (timer) { clearTimeout(timer); timer = 0; }
    state.running = false;
    if (!state.done) state.pausedReason = reason;
  }

  if (reducedMotion.matches) {
    root.classList.add('is-reduced');
    finish();
  } else {
    root.classList.add('is-typing');
    if (skip) { skip.hidden = false; skip.addEventListener('click', finish); }
    new IntersectionObserver(([e]) => {
      state.visible = e.isIntersecting;
      state.visible ? resume() : pause('offscreen');
    }, { threshold: 0.35 }).observe(root);
    document.addEventListener('visibilitychange', () => (document.hidden ? pause('hidden-tab') : resume()));
    window.addEventListener('pagehide', () => { pagehidden = true; pause('pagehide'); });
    window.addEventListener('pageshow', () => { pagehidden = false; resume(); });
    reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) { root.classList.add('is-reduced'); finish(); } });
  }

  root.__typing = {
    get state() { return { ...state, total, hookCount: chars.length } },
    get text() { return chars.map((a) => a.filter((c) => c.classList.contains('on')).map((c) => c.textContent).join('')); },
    cursorAfter() { const p = cursor.previousSibling; return p ? p.textContent : null; },
  };
  return root.__typing;
}

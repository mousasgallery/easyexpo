/**
 * Σύντομη κινηματογραφική αφήγηση στην αρχή του #example (Cinema assets Higgsfield).
 * Διάσπαρτες κάρτες → οργανωμένη διάταξη → κεντρική κάρτα → κύκλος ελέγχου.
 *
 * - Φυσική κύλιση: η θέση στο scroll ορίζει τη στιγμή του video (εμπρός/πίσω), χωρίς hijacking.
 * - Lazy: τίποτα δεν κατεβαίνει πριν πλησιάσει η ενότητα. Επιλέγεται ΜΟΝΟ η desktop ή η mobile πηγή.
 * - Αλλαγή breakpoint: απελευθέρωση της προηγούμενης πηγής, φόρτωση της σωστής.
 * - Αποτυχία video → poster. Αποτυχία poster → συμπαγές φόντο (CSS).
 * - Reduced motion: στατική τελική εικόνα, χωρίς pinned travel, χωρίς λήψη video.
 */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const BEATS = [0, 0.22, 0.5, 0.78]; // αρχή κάθε σκηνής στο progress

export function initCinema(root, media, reducedMotion) {
  if (!root) return null;
  const stage = root.querySelector('[data-cinema-stage]');
  const video = root.querySelector('[data-cinema-video]');
  const bar = root.querySelector('[data-cinema-progress]');
  const beats = [...root.querySelectorAll('[data-beat]')];
  const status = root.querySelector('[data-media-status]');
  if (!media) { root.classList.add('is-static', 'no-media'); return null; }
  const mq = window.matchMedia(media.mobileQuery);

  const st = { kind: null, near: false, visible: false, progress: 0, beat: 0, failed: false, requested: [], raf: 0, static: false };

  function setBeat(i) {
    if (i === st.beat && beats[i].classList.contains('is-on')) return;
    st.beat = i;
    beats.forEach((b, k) => { b.classList.toggle('is-on', k === i); b.classList.toggle('is-past', k < i); });
  }

  function progress() {
    const travel = Math.max(1, root.offsetHeight - stage.offsetHeight);
    const top = parseFloat(getComputedStyle(stage).top) || 0;
    return clamp((top - root.getBoundingClientRect().top) / travel);
  }

  function frame() {
    st.raf = 0;
    const p = progress();
    st.progress = p;
    if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
    let b = 0; BEATS.forEach((s, i) => { if (p >= s) b = i; });
    setBeat(b);
    if (!st.failed && video.readyState >= 1 && video.duration) {
      const t = p * (video.duration - 0.05);
      if (Math.abs(video.currentTime - t) > 1 / 30) video.currentTime = t;
    }
  }
  const request = () => { if (!st.raf && st.visible && !st.static) st.raf = requestAnimationFrame(frame); };

  function load() {
    if (st.static || !st.near) return;
    const kind = mq.matches ? 'mobile' : 'desktop';
    if (kind === st.kind) return;
    release();
    st.kind = kind;
    st.failed = false;
    root.dataset.media = `loading-${kind}`;
    video.poster = media[kind].poster;
    video.preload = 'auto';
    video.src = media[kind].video;
    st.requested.push(media[kind].video);
    video.load();
  }
  function release() {
    if (!video.getAttribute('src')) return;
    video.pause();
    video.removeAttribute('src');
    video.load(); // απελευθερώνει buffer της προηγούμενης πηγής
  }

  video.addEventListener('loadedmetadata', () => { root.dataset.media = `ready-${st.kind}`; request(); });
  video.addEventListener('error', () => {
    if (!video.getAttribute('src')) return;
    st.failed = true;
    root.dataset.media = 'failed';
    root.classList.add('media-failed');
    if (status) status.textContent = 'Το βίντεο δεν φορτώθηκε. Εμφανίζεται στατική εικόνα.';
  });

  function applyMode() {
    st.static = reducedMotion.matches;
    root.classList.toggle('is-static', st.static);
    if (st.static) {
      release();
      st.kind = null;
      const kind = mq.matches ? 'mobile' : 'desktop';
      video.preload = 'none';
      video.poster = media[kind].end; // στατική τελική σύνθεση: κύκλος ελέγχου
      root.dataset.media = 'static';
      beats.forEach((b) => b.classList.add('is-on'));
    } else {
      beats.forEach((b) => b.classList.remove('is-on'));
      setBeat(0);
      load();
      request();
    }
  }

  new IntersectionObserver(([e]) => { st.near = st.near || e.isIntersecting; if (e.isIntersecting) load(); }, { rootMargin: '120% 0px' }).observe(root);
  new IntersectionObserver(([e]) => { st.visible = e.isIntersecting; if (st.visible) request(); else if (st.raf) { cancelAnimationFrame(st.raf); st.raf = 0; } }).observe(root);
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  mq.addEventListener('change', () => { if (st.static) applyMode(); else { load(); request(); } });
  reducedMotion.addEventListener('change', applyMode);
  window.addEventListener('pageshow', (e) => { if (e.persisted) request(); });
  applyMode();

  root.__cinema = { get state() { return { ...st, raf: !!st.raf, currentTime: video.currentTime, src: video.currentSrc, poster: video.poster }; } };
  return root.__cinema;
}

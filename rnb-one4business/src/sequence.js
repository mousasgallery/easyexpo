/**
 * Φόρτωση αλληλουχίας frames με όρια μνήμης (brief v1.2 §5, §9).
 * - Manifest: { count, width, height, pattern: "frame-%04d.webp", poster: "poster.webp", fps }
 * - Προτεραιότητα στο frame που χρειάζεται τώρα και στα γειτονικά.
 * - Περιορισμένα ταυτόχρονα requests, ακύρωση άχρηστων (AbortController).
 * - LRU cache αποκωδικοποιημένων εικόνων με close() κατά την εκκαθάριση.
 * - Περιορισμένες επαναλήψεις για frames που λείπουν.
 */
export class FrameSequence {
  constructor(manifestUrl, { maxDecoded = 30, concurrency = 4, window: win = 8, retries = 1 } = {}) {
    this.manifestUrl = manifestUrl;
    this.maxDecoded = maxDecoded;
    this.concurrency = concurrency;
    this.win = win;
    this.retries = retries;
    this.cache = new Map();      // index → ImageBitmap (σειρά = LRU)
    this.inflight = new Map();   // index → AbortController
    this.failed = new Map();     // index → αριθμός αποτυχιών
    this.ready = false;
    this.destroyed = false;
    this.poster = null;
    this.ctrl = new AbortController();
  }

  async init() {
    const res = await fetch(this.manifestUrl, { signal: this.ctrl.signal });
    if (!res.ok) throw new Error(`manifest ${res.status}`);
    const m = await res.json();
    if (!m.count || !m.pattern) throw new Error('μη έγκυρο manifest');
    this.count = m.count;
    this.base = new URL('.', new URL(this.manifestUrl, location.href)).href;
    this.pattern = m.pattern;
    if (m.poster) {
      try { this.poster = await this.#decode(this.base + m.poster, this.ctrl.signal); } catch { /* συνέχεια χωρίς poster */ }
    }
    if (this.destroyed) throw new Error('destroyed');
    this.ready = true;
  }

  url(i) {
    return this.base + this.pattern.replace(/%0(\d)d/, (_, w) => String(i).padStart(Number(w), '0'));
  }

  async #decode(url, signal) {
    const r = await fetch(url, { signal });
    if (!r.ok) throw new Error(String(r.status));
    const blob = await r.blob();
    return createImageBitmap(blob);
  }

  /** Ζητά το frame i και τα γειτονικά. Ακυρώνει ό,τι βρίσκεται μακριά. */
  request(i) {
    if (!this.ready || this.destroyed) return;
    this.focus = i;
    for (const [k, c] of this.inflight) if (Math.abs(k - i) > this.win * 2) { c.abort(); this.inflight.delete(k); }
    const wanted = [];
    for (let d = 0; d <= this.win; d++) { wanted.push(i + d); if (d) wanted.push(i - d); }
    for (const k of wanted) {
      if (this.inflight.size >= this.concurrency) break;
      if (k < 0 || k >= this.count || this.cache.has(k) || this.inflight.has(k)) continue;
      if ((this.failed.get(k) || 0) > this.retries) continue;
      this.#load(k);
    }
  }

  #load(k) {
    const c = new AbortController();
    this.inflight.set(k, c);
    this.#decode(this.url(k), c.signal)
      .then((bmp) => {
        if (this.destroyed) { bmp.close?.(); return; }
        this.cache.set(k, bmp);
        this.#evict();
      })
      .catch((e) => { if (e.name !== 'AbortError') this.failed.set(k, (this.failed.get(k) || 0) + 1); })
      .finally(() => { this.inflight.delete(k); if (!this.destroyed && this.focus != null) this.request(this.focus); });
  }

  #evict() {
    while (this.cache.size > this.maxDecoded) {
      // Απομακρύνει το frame που απέχει περισσότερο από την τρέχουσα θέση.
      let far = null, farD = -1;
      for (const k of this.cache.keys()) { const d = Math.abs(k - (this.focus ?? 0)); if (d > farD) { farD = d; far = k; } }
      this.cache.get(far)?.close?.();
      this.cache.delete(far);
    }
  }

  /** Επιστρέφει το ζητούμενο ή το πλησιέστερο διαθέσιμο frame. */
  get(i) {
    if (this.cache.has(i)) { const b = this.cache.get(i); this.cache.delete(i); this.cache.set(i, b); return b; }
    for (let d = 1; d < this.win * 2; d++) {
      if (this.cache.has(i - d)) return this.cache.get(i - d);
      if (this.cache.has(i + d)) return this.cache.get(i + d);
    }
    return null;
  }

  destroy() {
    this.destroyed = true;
    this.ctrl.abort();
    for (const c of this.inflight.values()) c.abort();
    this.inflight.clear();
    for (const b of this.cache.values()) b.close?.();
    this.cache.clear();
    this.poster?.close?.();
    this.poster = null;
  }
}

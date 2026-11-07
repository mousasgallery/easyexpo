// Έλεγχος ποιότητας στην πραγματικά αποδομένη σελίδα (Playwright/Chromium).
// Χρήση: npm run build && npm run preview (σε άλλο τερματικό) && npm run qa
// Προαιρετικά: QA_URL=http://... QA_OUT=φάκελος-για-screenshots
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const { chromium, devices } = createRequire(import.meta.url)('playwright');
const BASE = process.env.QA_URL || 'http://localhost:4173/';
const OUT = process.env.QA_OUT || 'qa';
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};

/* ---------- Αντίθεση (WCAG 2.x) ---------- */
const hex = (h) => h.replace('#', '').match(/../g).map((x) => parseInt(x, 16));
const lum = (rgb) => {
  const [r, g, b] = rgb.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

const browser = await chromium.launch();
const consoleErrors = [];

async function open(viewport, opts = {}) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: opts.dsf || 1, reducedMotion: opts.reducedMotion || 'no-preference', ...(opts.device || {}) });
  const page = await ctx.newPage();
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
  page.on('pageerror', (e) => consoleErrors.push(String(e)));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  return { ctx, page };
}

/* ---------- 1. Πλάτη, υπερχείλιση, screenshots ---------- */
for (const w of [360, 390, 768, 1440]) {
  const { ctx, page } = await open({ width: w, height: w < 800 ? 800 : 900 }, { dsf: 2 });
  await page.waitForTimeout(800);
  const ov = await page.evaluate(() => ({
    doc: document.documentElement.scrollWidth - window.innerWidth,
    offenders: [...document.querySelectorAll('body *')]
      .filter((el) => { const r = el.getBoundingClientRect(); return r.width && (r.right > window.innerWidth + 1 || r.left < -1) && !el.closest('.rain, .console-body, .step-label'); })
      .slice(0, 5).map((el) => el.className || el.tagName),
  }));
  check(`${w}px: χωρίς οριζόντια υπερχείλιση`, ov.doc <= 0 && ov.offenders.length === 0, ov.offenders.join(', '));
  await page.screenshot({ path: path.join(OUT, `hero-${w}.png`) });
  await page.screenshot({ path: path.join(OUT, `full-${w}.png`), fullPage: true });

  // Μέγεθος περιοχών αφής (κινητό)
  if (w <= 390) {
    const small = await page.evaluate(() => [...document.querySelectorAll('a, button, summary')]
      .filter((el) => el.offsetParent && !el.closest('.wordmark') && !el.classList.contains('skip-link'))
      .map((el) => ({ t: el.textContent.trim().slice(0, 24), h: el.getBoundingClientRect().height }))
      .filter((x) => x.h < 40));
    check(`${w}px: στόχοι αφής ≥ 40px`, small.length === 0, small.map((s) => `${s.t}:${Math.round(s.h)}`).join(', '));
  }
  await ctx.close();
}

/* ---------- 2. Δομή, metadata, ευρετηρίαση ---------- */
{
  const { ctx, page } = await open({ width: 1440, height: 900 });
  const meta = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    h1: document.querySelectorAll('h1').length,
    title: document.title,
    desc: document.querySelector('meta[name="description"]')?.content,
    robots: document.querySelector('meta[name="robots"]')?.content,
    og: ['og:title', 'og:description', 'og:image', 'og:locale', 'og:url'].map((p) => [p, document.querySelector(`meta[property="${p}"]`)?.content]),
    tw: document.querySelector('meta[name="twitter:card"]')?.content,
    appLinks: [...document.querySelectorAll('[data-app-link]')].map((a) => a.href),
    brokenAnchors: [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href')).filter((h) => h.length > 1 && !document.getElementById(h.slice(1))),
    headingOrder: [...document.querySelectorAll('h1,h2,h3')].map((h) => +h.tagName[1]),
    matrixWord: /matrix/i.test(document.body.innerText),
    imgNoAlt: [...document.querySelectorAll('img:not([alt])')].length,
  }));
  check('lang="el"', meta.lang === 'el');
  check('Ακριβώς μία H1', meta.h1 === 1, `βρέθηκαν ${meta.h1}`);
  check('Ελληνικός τίτλος & περιγραφή', /[Α-ω]/.test(meta.title) && /[Α-ω]/.test(meta.desc || ''));
  check('noindex στην προεπισκόπηση', /noindex/.test(meta.robots || ''), meta.robots);
  check('Social preview (OG + Twitter)', meta.og.every(([, v]) => v) && meta.tw === 'summary_large_image', meta.og.map(([k, v]) => `${k}=${v}`).join(' | '));
  check('«Σύνδεση» δείχνει στο κεντρικό appUrl', meta.appLinks.length === 3 && new Set(meta.appLinks).size === 1, meta.appLinks[0]);
  check('Όλοι οι εσωτερικοί σύνδεσμοι έχουν στόχο', meta.brokenAnchors.length === 0, meta.brokenAnchors.join(','));
  const jumps = meta.headingOrder.some((l, i) => i && l - meta.headingOrder[i - 1] > 1);
  check('Ιεραρχία επικεφαλίδων χωρίς άλματα', !jumps, meta.headingOrder.join(''));
  check('Χωρίς τη λέξη «Matrix» στο ορατό κείμενο', !meta.matrixWord);

  const robots = await (await fetch(new URL('robots.txt', BASE))).text();
  check('robots.txt: Disallow /', /Disallow: \//.test(robots));
  const og = await fetch(new URL('og-image.png', BASE));
  check('og-image.png σερβίρεται', og.ok && og.headers.get('content-type')?.includes('png'));

  /* ---------- 3. Σύνδεσμοι ενοτήτων (desktop) ---------- */
  for (const href of ['#paradeigma', '#xriseis', '#elegxos', '#erotiseis']) {
    await page.click(`.nav-list a[href="${href}"]`);
    await page.waitForTimeout(900);
    const top = await page.evaluate((h) => document.querySelector(h).getBoundingClientRect().top, href);
    check(`Σύνδεσμος ${href} φέρνει την ενότητα στην οθόνη`, top >= 0 && top < 140, `top=${Math.round(top)}`);
  }
  await page.click('.site-header .wordmark');
  await page.waitForFunction(() => scrollY < 5, null, { timeout: 4000 }).catch(() => {});
  check('Wordmark επιστρέφει στην αρχή', (await page.evaluate(() => scrollY)) < 5);

  /* ---------- 4. Διαδραστικό παράδειγμα ---------- */
  const visiblePanels = await page.locator('.demo-panel:visible').count();
  check('Παράδειγμα: ορατό μόνο ένα βήμα', visiblePanels === 1, `ορατά=${visiblePanels}`);
  check('Παράδειγμα: ένδειξη «Ενδεικτικό παράδειγμα — δεν εκτελεί πραγματικές εργασίες»',
    await page.locator('.demo-disclaimer', { hasText: 'Ενδεικτικό παράδειγμα — δεν εκτελεί πραγματικές εργασίες' }).isVisible());
  for (let i = 2; i <= 4; i++) {
    await page.click('[data-demo-next]');
    check(`Παράδειγμα: «Επόμενο» → βήμα ${i}`, await page.locator(`#panel-${i}`).isVisible());
  }
  const draftVal = await page.inputValue('[data-review-text]');
  check('Παράδειγμα: το προσχέδιο φτάνει στον έλεγχο', draftVal.includes('Με εκτίμηση,\nΓιώργος'));
  await page.click('[data-review="edit"]');
  check('Παράδειγμα: «Αλλαγή κειμένου» ενεργοποιεί επεξεργασία', !(await page.locator('[data-review-text]').getAttribute('readonly') !== null));
  await page.fill('[data-review-text]', draftVal + '\nΥ.Γ. Δοκιμή');
  await page.click('[data-review="approve"]');
  const res = await page.textContent('[data-review-result]');
  check('Παράδειγμα: «Έγκριση» δηλώνει ότι δεν στέλνεται τίποτα', /δεν αποστέλλεται τίποτα/.test(res), res);
  await page.click('[data-review="reject"]');
  check('Παράδειγμα: «Απόρριψη»', /μπήκε στην άκρη/.test(await page.textContent('[data-review-result]')));
  await page.click('[data-demo-next]');
  check('Παράδειγμα: «Από την αρχή» επαναφέρει', await page.locator('#panel-1').isVisible() && !(await page.inputValue('[data-review-text]')).includes('Δοκιμή'));
  await page.focus('#tab-1');
  await page.keyboard.press('ArrowRight');
  check('Παράδειγμα: βέλη πληκτρολογίου στα βήματα', await page.evaluate(() => document.activeElement.id === 'tab-2') && await page.locator('#panel-2').isVisible());
  await page.keyboard.press('End');
  check('Παράδειγμα: End → τελευταίο βήμα', await page.locator('#panel-4').isVisible());

  /* ---------- 5. FAQ ---------- */
  await page.locator('.faq summary').first().focus();
  await page.keyboard.press('Enter');
  check('FAQ ανοίγει με πληκτρολόγιο', await page.locator('.faq details').first().evaluate((d) => d.open));
  await ctx.close();
}

/* ---------- 6. Πληκτρολόγιο & ορατό focus ---------- */
{
  const { ctx, page } = await open({ width: 1440, height: 900 });
  const stops = [];
  for (let i = 0; i < 16; i++) {
    await page.keyboard.press('Tab');
    stops.push(await page.evaluate(() => {
      const el = document.activeElement;
      const cs = getComputedStyle(el);
      return { t: (el.getAttribute('aria-label') || el.textContent).trim().replace(/\s+/g, ' ').slice(0, 28), outline: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2, color: cs.outlineColor };
    }));
  }
  check('Πρώτο Tab: «Μετάβαση στο περιεχόμενο»', stops[0].t.startsWith('Μετάβαση'));
  const noFocus = stops.filter((s) => !s.outline);
  check('Ορατό focus (outline ≥2px) σε κάθε στάση Tab', noFocus.length === 0, noFocus.map((s) => s.t).join(', ') || `${stops.length} στάσεις: ` + stops.map((s) => s.t).join(' → '));
  await page.keyboard.press('Shift+Tab');
  await page.screenshot({ path: path.join(OUT, 'focus-1440.png') });
  await ctx.close();
}

/* ---------- 7. Μενού κινητού ---------- */
{
  const { ctx, page } = await open({ width: 360, height: 780 });
  check('Κινητό: το μενού ξεκινά κλειστό', !(await page.locator('#nav-panel').isVisible()));
  await page.click('[data-nav-toggle]');
  check('Κινητό: άνοιγμα μενού + aria-expanded', (await page.locator('#nav-panel').isVisible()) && (await page.getAttribute('[data-nav-toggle]', 'aria-expanded')) === 'true');
  check('Κινητό: η εστίαση πάει στον 1ο σύνδεσμο', await page.evaluate(() => document.activeElement.getAttribute('href') === '#paradeigma'));
  await page.screenshot({ path: path.join(OUT, 'menu-open-360.png') });
  await page.keyboard.press('Escape');
  check('Κινητό: Escape κλείνει και επιστρέφει εστίαση', !(await page.locator('#nav-panel').isVisible()) && await page.evaluate(() => document.activeElement.matches('[data-nav-toggle]')));
  for (const href of ['#paradeigma', '#xriseis', '#elegxos', '#erotiseis']) {
    await page.click('[data-nav-toggle]');
    await page.click(`.nav-list a[href="${href}"]`);
    await page.waitForTimeout(900);
    const st = await page.evaluate((h) => ({ top: document.querySelector(h).getBoundingClientRect().top, open: document.querySelector('#nav-panel').classList.contains('is-open') }), href);
    check(`Κινητό: ${href} κλείνει μενού & δείχνει ενότητα`, !st.open && st.top >= 0 && st.top < 140, `top=${Math.round(st.top)}`);
  }
  await page.click('[data-nav-toggle]');
  const loginHref = await page.getAttribute('#nav-panel [data-app-link]', 'href');
  check('Κινητό: «Σύνδεση» μέσα στο μενού', !!loginHref && (await page.locator('#nav-panel [data-app-link]').isVisible()), loginHref);
  await ctx.close();
}

/* ---------- 8. Ψηφιακή βροχή: κίνηση, παύση, reduced motion, πατήματα ---------- */
{
  const { ctx, page } = await open({ width: 390, height: 800 });
  const pe = await page.evaluate(() => {
    const c = document.querySelector('[data-rain]');
    const r = document.querySelector('.hero h1').getBoundingClientRect();
    const top = document.elementFromPoint(r.left + 10, r.top + 10);
    return { pe: getComputedStyle(c).pointerEvents, hidden: c.getAttribute('aria-hidden'), z: getComputedStyle(c).zIndex, topIsText: !!top.closest('h1') };
  });
  check('Βροχή: pointer-events none, aria-hidden, πίσω από το κείμενο', pe.pe === 'none' && pe.hidden === 'true' && pe.topIsText, JSON.stringify(pe));
  const snap = () => page.evaluate(() => document.querySelector('[data-rain]').toDataURL().length + ':' + document.querySelector('[data-rain]').rainRunning);
  check('Βροχή: τρέχει όταν το hero είναι ορατό', (await page.evaluate(() => document.querySelector('[data-rain]').rainRunning)) === true);
  await page.evaluate(() => document.getElementById('erotiseis').scrollIntoView());
  await page.waitForTimeout(500);
  check('Βροχή: σταματά όταν δεν είναι ορατή', (await page.evaluate(() => document.querySelector('[data-rain]').rainRunning)) === false);

  // Κόστος: χρόνος εκτέλεσης ανά καρέ με 4× CPU throttling (προσομοίωση κινητού)
  await page.evaluate(() => scrollTo(0, 0));
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.waitForTimeout(300);
  const perf = await page.evaluate(() => new Promise((res) => {
    const t = []; let last = performance.now(); let long = 0;
    const po = new PerformanceObserver((l) => { long += l.getEntries().length; });
    try { po.observe({ type: 'longtask', buffered: false }); } catch {}
    const tick = (now) => { t.push(now - last); last = now; if (t.length < 120) requestAnimationFrame(tick); else { po.disconnect(); t.sort((a, b) => a - b); res({ p95: t[Math.floor(t.length * 0.95)], long }); } };
    requestAnimationFrame(tick);
  }));
  check('Απόδοση κινητού (4× CPU): χωρίς long tasks, p95 καρέ < 50ms', perf.long === 0 && perf.p95 < 50, `p95=${perf.p95.toFixed(1)}ms, longtasks=${perf.long}`);
  await ctx.close();

  const rm = await open({ width: 390, height: 800 }, { reducedMotion: 'reduce' });
  await rm.page.waitForTimeout(300);
  const a = await rm.page.evaluate(() => document.querySelector('[data-rain]').toDataURL());
  await rm.page.waitForTimeout(1200);
  const b = await rm.page.evaluate(() => document.querySelector('[data-rain]').toDataURL());
  const running = await rm.page.evaluate(() => document.querySelector('[data-rain]').rainRunning);
  const caret = await rm.page.evaluate(() => getComputedStyle(document.querySelector('.caret')).animationName);
  check('Reduced motion: στατική βροχή (ίδιο καρέ, χωρίς loop)', a === b && running === false && a.length > 5000, `bytes=${a.length}`);
  check('Reduced motion: χωρίς κινούμενο cursor', caret === 'none');
  await rm.page.screenshot({ path: path.join(OUT, 'reduced-motion-390.png') });
  await rm.ctx.close();
}

/* ---------- 9. Αντίθεση πραγματικών συνδυασμών ---------- */
{
  const { ctx, page } = await open({ width: 1440, height: 900 });
  // Υπολογισμένα χρώματα από τα αποδομένα στοιχεία
  const pairs = await page.evaluate(() => {
    const toHex = (c) => { const m = c.match(/\d+(\.\d+)?/g).map(Number); return '#' + m.slice(0, 3).map((v) => v.toString(16).padStart(2, '0')).join(''); };
    const bgOf = (el) => { while (el) { const b = getComputedStyle(el).backgroundColor; const m = b.match(/[\d.]+/g); if (m && (m.length < 4 || +m[3] === 1)) return toHex(b); el = el.parentElement; } return '#0d0208'; };
    const sel = { 'Κύριο κείμενο (body)': '.lead', 'H1': '.hero h1', 'H1 πράσινο': '.h1-accent', 'Κουμπί πράσινο': '.btn-primary', 'Κουμπί ghost': '.btn-ghost', 'Μενού': '.nav-list a', 'Kicker': '.kicker', 'Ένδειξη παραδείγματος': '.demo-disclaimer', 'Μήνυμα Trinity': '.msg-trinity p', 'Μήνυμα ιδιοκτήτη': '.msg-owner p', 'Υπότιτλος παραθύρου': '.demo-sub', 'Ετικέτα σεναρίου': '.use-tag', 'Κείμενο κάρτας': '.use-get', 'Βήμα επιλεγμένο (αριθμός)': '.demo-step[aria-selected=true] .step-num', 'Βήμα ανενεργό': '.demo-step[aria-selected=false]', 'FAQ ερώτηση': '.faq summary', 'Footer': '.footer-inner p', 'Κονσόλα (διακοσμητικό)': '.c-dim' };
    return Object.entries(sel).map(([k, s]) => { const el = document.querySelector(s); if (!el) return [k, null]; const cs = getComputedStyle(el); return [k, toHex(cs.color), bgOf(el), parseFloat(cs.fontSize), +cs.fontWeight]; });
  });
  for (const [name, fg, bg, size, weight] of pairs) {
    if (!fg) { check(`Αντίθεση: ${name}`, false, 'δεν βρέθηκε'); continue; }
    const r = ratio(hex(fg), hex(bg));
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const decorative = name.includes('διακοσμητικό');
    const min = decorative ? 3 : large ? 3 : 4.5;
    check(`Αντίθεση: ${name} ${fg} σε ${bg}`, r >= min, `${r.toFixed(2)}:1 (ελάχ. ${min}${decorative ? ', aria-hidden' : ''})`);
  }
  // Focus ring σε όλα τα φόντα
  for (const bg of ['#0D0208', '#000000', '#003B00']) check(`Focus #00FF41 πάνω σε ${bg} ≥ 3:1`, ratio(hex('#00FF41'), hex(bg)) >= 3, ratio(hex('#00FF41'), hex(bg)).toFixed(2) + ':1');

  await ctx.close();
}

/* ---------- 9β. Αναγνωσιμότητα πάνω από τα εφέ (πραγματικό σύνθετο φόντο από screenshot) ---------- */
{
  // Αποκωδικοποίηση PNG μέσα στον browser (χωρίς εξαρτήσεις): επιστρέφει το φωτεινότερο pixel.
  const maxLuminancePixel = (page, buf) => page.evaluate(async (b64) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const c = new OffscreenCanvas(img.width, img.height);
    const x = c.getContext('2d');
    x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, img.width, img.height).data;
    let best = [0, 0, 0], bl = -1;
    for (let i = 0; i < d.length; i += 4) { const l = d[i] * 0.2126 + d[i + 1] * 0.7152 + d[i + 2] * 0.0722; if (l > bl) { bl = l; best = [d[i], d[i + 1], d[i + 2]]; } }
    return best;
  }, buf.toString('base64'));
  for (const w of [390, 1440]) {
    const { ctx, page } = await open({ width: w, height: w < 800 ? 800 : 900 });
    await page.waitForTimeout(2500);
    const results9 = [];
    for (const sel of ['.lead', '.hero h1']) {
      const box = await page.locator(sel).boundingBox();
      await page.addStyleTag({ content: `${sel}, ${sel} * { color: transparent !important; text-shadow: none !important; }` });
      const buf = await page.screenshot({ clip: box, animations: 'disabled' });
      const max = await maxLuminancePixel(page, buf);
      results9.push([sel, max]);
    }
    for (const [sel, rgb] of results9) {
      const fg = sel === '.lead' ? '#B7C9BC' : '#00FF41'; // H1: το πράσινο τμήμα είναι η χειρότερη περίπτωση
      const r = ratio(hex(fg), rgb);
      check(`${w}px: ${sel} πάνω από βροχή (χειρότερο pixel)`, r >= 4.5, `${r.toFixed(2)}:1 σε rgb(${rgb})`);
    }
    await ctx.close();
  }
}

/* ---------- 10. Πραγματική συσκευή (emulation) ---------- */
{
  const { ctx, page } = await open(undefined, { device: devices['iPhone 13'] });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, 'iphone13-hero.png') });
  await page.evaluate(() => document.getElementById('paradeigma').scrollIntoView());
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, 'iphone13-demo.png') });
  check('iPhone 13: χωρίς υπερχείλιση', (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0);
  await ctx.close();
}

check('Χωρίς σφάλματα κονσόλας', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

await browser.close();
const failed = results.filter((r) => !r.ok);
fs.writeFileSync(path.join(OUT, 'qa-results.json'), JSON.stringify(results, null, 2));
console.log(`\n${results.length - failed.length}/${results.length} πέρασαν`);
process.exit(failed.length ? 1 : 0);

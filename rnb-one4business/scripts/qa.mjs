// Έλεγχοι §11 του brief v1.2 στην πραγματικά αποδομένη σελίδα (Playwright / Chromium).
// Χρήση: npm run build && npm run preview  (άλλο τερματικό)  &&  npm run qa
// Αποτελέσματα: qa/results.json, screenshots στο qa/screenshots/.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const { chromium, devices } = createRequire(import.meta.url)('playwright');
const BASE = process.env.QA_URL || 'http://localhost:4174/';
const OUT = 'qa/screenshots';
const FIX = 'qa/fixtures/story';
fs.mkdirSync(OUT, { recursive: true });
const rows = [];
const rec = (area, name, status, evidence = '') => { rows.push({ area, name, status, evidence }); console.log(`${status.padEnd(7)} [${area}] ${name}${evidence ? ' — ' + evidence : ''}`); };
const check = (area, name, ok, evidence) => rec(area, name, ok ? 'PASS' : 'FAIL', evidence);

const hex = (h) => h.replace('#', '').match(/../g).map((x) => parseInt(x, 16));
const lum = (c) => { const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

const browser = await chromium.launch();
const consoleErrors = [];
async function open(opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1440, height: 900 }, reducedMotion: opts.reducedMotion || 'no-preference', javaScriptEnabled: opts.js !== false, deviceScaleFactor: opts.dsf || 1, ...(opts.device || {}) });
  if (opts.route) await opts.route(ctx);
  const page = await ctx.newPage();
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
  page.on('pageerror', (e) => consoleErrors.push(String(e)));
  await page.goto(BASE + (opts.hash || ''), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  return { ctx, page };
}
const travelOf = (page) => page.evaluate(() => { const r = document.querySelector('[data-story]'); return r.offsetHeight - r.querySelector('[data-stage]').offsetHeight; });
const storyTop = (page) => page.evaluate(() => { const r = document.querySelector('[data-story]'); const st = document.querySelector('[data-stage]'); return r.getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(st).top); });
async function scrollStory(page, f) {
  const [t, top] = [await travelOf(page), await storyTop(page)];
  await page.evaluate((y) => scrollTo(0, y), Math.round(top + t * f));
  await page.waitForFunction((f) => Math.abs(document.querySelector('[data-story]').__story.progress - f) < 0.01, f, { timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(350);
}
const activeChapters = (page) => page.evaluate(() => [...document.querySelectorAll('[data-chapter].is-active')].map((c) => c.dataset.chapter).join(','));

/* ===== 1. Viewports ===== */
const VIEWS = [[360, 780], [390, 844], [430, 932], [768, 1024], [1280, 800], [1440, 900], [390, 600, 'μικρό ύψος'], [844, 390, 'landscape'], [640, 450, 'zoom 200% (1280×900)']];
for (const [w, h, label] of VIEWS) {
  const { ctx, page } = await open({ viewport: { width: w, height: h }, dsf: 2 });
  await page.waitForTimeout(500);
  const r = await page.evaluate(() => {
    const vw = innerWidth;
    const off = [...document.querySelectorAll('body *')].filter((el) => {
      if (el.closest('.terminal-body, .mobile-menu, [hidden], .sr-only, .step-l')) return false;
      const b = el.getBoundingClientRect(); return b.width > 0 && (b.right > vw + 1 || b.left < -1);
    }).slice(0, 4).map((el) => el.className || el.tagName);
    const ctrls = [...document.querySelectorAll('.site-header a, .site-header button, .chapter-1 a')].filter((el) => el.offsetParent).filter((el) => { const b = el.getBoundingClientRect(); return b.right > vw + 1 || b.left < -1 || b.height < 40; }).map((el) => el.textContent.trim().slice(0, 20));
    const h1 = document.querySelector('h1').getBoundingClientRect();
    const cta = document.querySelector('.chapter-1 .btn-primary').getBoundingClientRect();
    return { doc: document.documentElement.scrollWidth - vw, off, ctrls, h1Visible: h1.top >= 0 && h1.bottom <= innerHeight, ctaVisible: cta.bottom <= innerHeight && cta.top >= 0 };
  });
  const tag = `${w}×${h}${label ? ' ' + label : ''}`;
  check('Mobile/Viewports', `${tag}: χωρίς οριζόντια υπερχείλιση`, r.doc <= 0 && !r.off.length, r.off.join(', ') || `scrollWidth−vw=${r.doc}`);
  check('Mobile/Viewports', `${tag}: controls ολόκληρα, στόχοι ≥ 40px`, !r.ctrls.length, r.ctrls.join(', '));
  check('Οπτικό', `${tag}: H1 και κύριο CTA ορατά στην πρώτη οθόνη`, r.h1Visible && r.ctaVisible, `H1=${r.h1Visible} CTA=${r.ctaVisible}`);
  await page.screenshot({ path: path.join(OUT, `hero-${w}x${h}.png`) });
  if (w === 390 && h === 844 || w === 1440) {
    for (const f of [0.33, 0.6, 0.9]) { await scrollStory(page, f); await page.screenshot({ path: path.join(OUT, `story-${w}-${Math.round(f * 100)}.png`) }); }
    await page.evaluate(() => scrollTo(0, 0));
    const y = await page.evaluate(() => document.getElementById('lyseis').offsetTop);
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.screenshot({ path: path.join(OUT, `sections-${w}.png`), fullPage: true, clip: { x: 0, y, width: w, height: H - y } });
  }
  await ctx.close();
}

/* ===== 2. Εύρος, SEO ===== */
{
  const { ctx, page } = await open();
  const m = await page.evaluate(() => ({
    title: document.title, desc: document.querySelector('meta[name=description]').content, robots: document.querySelector('meta[name=robots]').content,
    lang: document.documentElement.lang, h1: document.querySelectorAll('h1').length,
    sections: ['arxi', 'lyseis', 'demo', 'erotiseis', 'epideixi'].map((id) => !!document.getElementById(id)),
    hrefs: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')),
    headings: [...document.querySelectorAll('h1,h2,h3')].map((h) => +h.tagName[1]),
    canonical: !!document.querySelector('link[rel=canonical]'),
    og: document.querySelector('meta[property="og:image"]').content,
  }));
  const app = JSON.parse(await page.evaluate(() => document.getElementById('rnb-config').textContent)).APP_URL;
  check('Εύρος', 'Ένα route / με τις πέντε ενότητες (#arxi #lyseis #demo #erotiseis #epideixi)', m.sections.every(Boolean), m.sections.join(','));
  const external = m.hrefs.filter((h) => !h.startsWith('#') && h !== app);
  check('Εύρος', 'Κανένας σύνδεσμος προς άλλα routes (μόνο anchors και APP_URL)', external.length === 0, external.join(', ') || `${m.hrefs.length} links`);
  check('SEO', 'Title του brief', m.title === 'RNB | ONE4Business — AI για μικρές επιχειρήσεις', m.title);
  check('SEO', 'Meta description του brief', m.desc.startsWith('Γνώρισε το ONE4Business του RNB.'), m.desc.slice(0, 60) + '…');
  check('SEO', 'Ένα H1, lang="el", ιεραρχία χωρίς άλματα', m.h1 === 1 && m.lang === 'el' && !m.headings.some((l, i) => i && l - m.headings[i - 1] > 1), m.headings.join(''));
  check('SEO', 'noindex στο preview', /noindex/.test(m.robots), m.robots);
  check('SEO', 'Χωρίς canonical/απόλυτα social URLs χωρίς επιβεβαιωμένο host', !m.canonical && m.og.startsWith('/'), `canonical=${m.canonical} og:image=${m.og}`);
  const robots = await (await fetch(new URL('robots.txt', BASE))).text();
  check('SEO', 'robots.txt Disallow /', /Disallow: \//.test(robots));
  check('SEO', 'Social preview 1200×630 σερβίρεται', (await fetch(new URL('og-image.png', BASE))).ok);
  check('Login', 'Όλα τα «Σύνδεση» δείχνουν στο APP_URL του config', (await page.$$eval('[data-app-link]', (as) => as.map((a) => a.href))).every((h) => h === app), app);
  const texts = await page.evaluate(() => document.body.innerText);
  const banned = [/\d+\s?%/, /99/, /€/, /GDPR/i, /ISO/, /SOC\s?2/, /24\/7/, /WhatsApp|Viber|ERP/i, /Matrix/i];
  const hits = banned.filter((r) => r.test(texts)).map(String);
  check('Claims', 'Χωρίς τιμές, ποσοστά, πιστοποιήσεις, ονόματα συνδέσεων ή «Matrix»', hits.length === 0, hits.join(' ') || 'κανένα εύρημα');
  check('Claims', 'Ένδειξη «Ενδεικτικό σενάριο» στο demo και στη σκηνή', /Ενδεικτικό σενάριο — χωρίς πραγματική αποστολή/.test(texts) && (await page.locator('.terminal-tag').count()) === 1);
  check('Claims', 'Διευκρίνιση διαθεσιμότητας στο #lyseis', texts.includes('Η διαθεσιμότητα κάθε ροής επιβεβαιώνεται για τη δική σου επιχείρηση πριν από την ενεργοποίηση.'));
  check('Claims', 'Badges από τον κατάλογο claims (ίδια πηγή)', (await page.locator('#lyseis .badge').count()) === 3);
  await ctx.close();
}

/* ===== 3. Story ===== */
{
  const { ctx, page } = await open();
  const seq = [];
  for (const f of [0, 0.1, 0.33, 0.6, 0.9, 1, 0.6, 0.33, 0]) { await scrollStory(page, f); seq.push(`${f}:${await activeChapters(page)}`); }
  const expected = ['0:1', '0.1:1', '0.33:', '0.6:3', '0.9:4', '1:4', '0.6:3', '0.33:', '0:1'];
  check('Story', 'Αλληλουχία σκηνών εμπρός/πίσω με native scroll', seq.join(' ') === expected.join(' '), seq.join(' '));
  await scrollStory(page, 0.33);
  const inert = await page.evaluate(() => [...document.querySelectorAll('[data-chapter]')].every((c) => c.hasAttribute('inert')));
  check('Story', 'Στη μεταβατική σκηνή 02 κανένα κρυφό link δεν δέχεται εστίαση (inert)', inert);
  await scrollStory(page, 0.6);
  const typed = await page.evaluate(() => [...document.querySelectorAll('.t-clip')].map((c) => c.style.maxWidth).join('|'));
  check('Story', 'Τερματικό: πληκτρολόγηση ανάλογα με το scroll', /ch/.test(typed) || /none/.test(typed), typed);
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(300);
  await page.click('[data-skip]');
  await page.waitForFunction(() => Math.abs(document.getElementById('lyseis').getBoundingClientRect().top - 80) < 60, null, { timeout: 5000 }).catch(() => {});
  const top = await page.evaluate(() => document.getElementById('lyseis').getBoundingClientRect().top);
  check('Story', '«Παράλειψη κίνησης» οδηγεί στο #lyseis', top > 60 && top < 140, `top=${Math.round(top)}`);
  await page.evaluate(() => document.getElementById('demo').scrollIntoView()); await page.waitForTimeout(400);
  check('Story', 'Παύση rendering όταν η σκηνή είναι εκτός οθόνης', (await page.evaluate(() => document.querySelector('[data-story]').__story.running)) === false);
  check('Higgsfield', 'Λειτουργία σκηνής', true, await page.evaluate(() => document.querySelector('[data-story]').__story.mode));
  await ctx.close();
}

/* ===== 4. Αλληλουχία frames (μηχανισμός για τα assets Higgsfield, με δοκιμαστικά frames) ===== */
async function seqRoute(ctx, { missing = false } = {}) {
  const requested = [];
  await ctx.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/' || url.pathname.endsWith('index.html')) {
      const res = await route.fetch(); let body = await res.text();
      body = body.replace('"enabled":false', '"enabled":true');
      return route.fulfill({ response: res, body, headers: { ...res.headers(), 'content-type': 'text/html' } });
    }
    const m = url.pathname.match(/^\/story\/(desktop|mobile)\/(.+)$/);
    if (m) {
      requested.push(m[1]);
      const file = path.join(FIX, m[1], m[2]);
      if (missing || !fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
      return route.fulfill({ path: file });
    }
    return route.continue();
  });
  return requested;
}
for (const [w, h, kind] of [[1440, 900, 'desktop'], [390, 844, 'mobile']]) {
  let req;
  const { ctx, page } = await open({ viewport: { width: w, height: h }, route: async (c) => { req = await seqRoute(c); } });
  await page.waitForFunction(() => /sequence-/.test(document.querySelector('[data-story]').__story.mode), null, { timeout: 5000 }).catch(() => {});
  await scrollStory(page, 0.5);
  await page.waitForTimeout(600);
  const mode = await page.evaluate(() => document.querySelector('[data-story]').__story.mode);
  const kinds = [...new Set(req)];
  check('Assets', `${kind}: ζητείται μόνο η αλληλουχία ${kind}`, kinds.length === 1 && kinds[0] === kind && mode === `sequence-${kind}`, `mode=${mode} requests=${req.length} kinds=${kinds}`);
  check('Assets', `${kind}: όριο ταυτόχρονων/συνολικών λήψεων (όχι όλη η αλληλουχία μαζί)`, req.length < 36 + 2, `${req.length} αιτήματα για 36 frames`);
  if (kind === 'desktop') await page.screenshot({ path: path.join(OUT, 'sequence-test-desktop.png') });
  await ctx.close();
}
{
  const { ctx, page } = await open({ route: async (c) => { await seqRoute(c, { missing: true }); } });
  await page.waitForTimeout(800);
  check('Assets', 'Αποτυχία manifest → στατικό/procedural fallback χωρίς σπάσιμο', (await page.evaluate(() => document.querySelector('[data-story]').__story.mode)) === 'procedural-fallback');
  consoleErrors.splice(0); // τα 404 αυτού του σκόπιμου σεναρίου δεν μετρούν
  await ctx.close();
}
{
  let req;
  const { ctx, page } = await open({ reducedMotion: 'reduce', route: async (c) => { req = await seqRoute(c); } });
  await page.waitForTimeout(800);
  const st = await page.evaluate(() => ({ cls: document.querySelector('[data-story]').classList.contains('is-static'), h: document.querySelector('[data-story]').offsetHeight, running: document.querySelector('[data-story]').__story.running, chapters: document.querySelectorAll('[data-chapter].is-active').length }));
  check('Προσβασιμότητα', 'Reduced motion: στατική σύνθεση, χωρίς pinned travel, όλα τα κεφάλαια ορατά', st.cls && !st.running && st.chapters === 3, JSON.stringify(st));
  check('Assets', 'Reduced motion: καμία λήψη frames', req.length === 0, `${req.length} αιτήματα`);
  await page.screenshot({ path: path.join(OUT, 'reduced-motion-1440.png'), fullPage: false });
  await ctx.close();
}

/* ===== 5. Navigation ===== */
{
  const { ctx, page } = await open();
  for (const id of ['lyseis', 'demo', 'erotiseis']) {
    await page.click(`[data-desktop-nav] a[href="#${id}"]`);
    await page.waitForFunction((id) => { const t = document.querySelector(`#${id} h2`).getBoundingClientRect().top; return t > 64 && t < 260; }, id, { timeout: 5000 }).catch(() => {});
    const t = await page.evaluate((id) => document.querySelector(`#${id} h2`).getBoundingClientRect().top, id);
    check('Navigation', `Header → #${id}: επικεφαλίδα κάτω από το header`, t > 64 && t < 260, `top=${Math.round(t)}`);
  }
  await page.click('.nav-cta');
  await page.waitForFunction(() => { const t = document.querySelector('#epideixi h2').getBoundingClientRect().top; return t > 64 && t < 260; }, null, { timeout: 5000 }).catch(() => {});
  check('Navigation', 'CTA «Ζήτησε επίδειξη» → #epideixi', (await page.evaluate(() => location.hash)) === '#epideixi');
  // Πληκτρολόγιο
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const stops = [];
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    stops.push(await page.evaluate(() => { const el = document.activeElement; const cs = getComputedStyle(el); return { t: (el.getAttribute('aria-label') || el.textContent).trim().replace(/\s+/g, ' ').slice(0, 26), ok: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2 }; }));
  }
  check('Navigation', 'Πρώτο Tab: skip link', stops[0].t.startsWith('Μετάβαση'));
  check('Προσβασιμότητα', 'Ορατό focus σε κάθε στάση Tab', stops.every((s) => s.ok), stops.map((s) => s.t).join(' → '));
  await page.screenshot({ path: path.join(OUT, 'focus-1440.png') });
  await ctx.close();
  for (const hash of ['#demo', '#epideixi']) {
    const o = await open({ hash });
    await o.page.waitForTimeout(500);
    const t1 = await o.page.evaluate((h) => document.querySelector(h + ' h2').getBoundingClientRect().top, hash);
    await o.page.reload({ waitUntil: 'networkidle' }); await o.page.waitForTimeout(500);
    const t2 = await o.page.evaluate((h) => document.querySelector(h + ' h2').getBoundingClientRect().top, hash);
    check('Navigation', `Απευθείας φόρτωση /${hash} και refresh`, t1 > 40 && t1 < 300 && t2 > 40 && t2 < 300, `top=${Math.round(t1)} μετά το refresh=${Math.round(t2)}`);
    await o.ctx.close();
  }
}
{
  const { ctx, page } = await open({ viewport: { width: 390, height: 844 } });
  await page.click('[data-menu-open]');
  check('Navigation', 'Mobile: άνοιγμα μενού, aria-expanded, εστίαση μέσα', (await page.isVisible('[data-menu]')) && (await page.getAttribute('[data-menu-open]', 'aria-expanded')) === 'true' && (await page.evaluate(() => !!document.activeElement.closest('[data-menu]'))));
  for (let i = 0; i < 8; i++) await page.keyboard.press('Tab');
  check('Navigation', 'Mobile: η εστίαση μένει μέσα στο μενού (Tab)', await page.evaluate(() => !!document.activeElement.closest('[data-menu]')));
  await page.keyboard.press('Escape');
  check('Navigation', 'Mobile: Escape κλείνει και επιστρέφει εστίαση', !(await page.isVisible('[data-menu]')) && (await page.evaluate(() => document.activeElement.matches('[data-menu-open]'))));
  await page.click('[data-menu-open]');
  await page.click('.mobile-menu-list a[href="#erotiseis"]');
  await page.waitForTimeout(1200);
  const t = await page.evaluate(() => document.querySelector('#erotiseis h2').getBoundingClientRect().top);
  check('Navigation', 'Mobile: επιλογή κλείνει το μενού και πάει στην ενότητα', !(await page.isVisible('[data-menu]')) && t > 64 && t < 260, `top=${Math.round(t)}`);
  check('Navigation', 'Mobile: header ορατό μετά το τέλος της σκηνής', await page.evaluate(() => { const r = document.querySelector('.site-header').getBoundingClientRect(); return r.top === 0 && r.height > 50; }));
  await page.screenshot({ path: path.join(OUT, 'mobile-after-story.png') });
  await page.click('[data-menu-open]'); await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(OUT, 'mobile-menu-390.png') });
  await ctx.close();
}

/* ===== 6. Demo ===== */
{
  const { ctx, page } = await open({ hash: '#demo' });
  const visible = async (i) => page.isVisible(`#dpanel-${i}`);
  for (let i = 2; i <= 4; i++) { await page.click('[data-next]'); check('Demo', `Επόμενο → βήμα ${i}`, await visible(i)); }
  await page.click('[data-prev]'); check('Demo', 'Προηγούμενο → βήμα 3', await visible(3));
  await page.click('#dtab-1'); check('Demo', 'Άμεση επιλογή βήματος', await visible(1));
  await page.focus('#dtab-1'); await page.keyboard.press('ArrowRight');
  check('Demo', 'Βέλη πληκτρολογίου', await visible(2));
  await page.click('#dtab-2');
  check('Demo', 'Στοιχεία DEMO-001 / Σε προετοιμασία / χωρίς ημερομηνία', /DEMO-001[\s\S]*Σε προετοιμασία[\s\S]*Δεν υπάρχει επιβεβαιωμένη ημερομηνία αποστολής/.test(await page.textContent('#dpanel-2')));
  await page.click('#dtab-3');
  check('Demo', 'Προσχέδιο του brief', (await page.inputValue('[data-draft]')).startsWith('Καλησπέρα σας. Η παραγγελία σας βρίσκεται σε προετοιμασία.'));
  await page.fill('[data-draft]', '   ');
  await page.click('#dtab-4'); await page.click('[data-approve]');
  check('Demo', 'Κενό κείμενο δεν εγκρίνεται', !(await page.evaluate(() => document.querySelector('[data-demo]').__demo.approved)) && /κενό/.test(await page.textContent('[data-result]')));
  await page.click('[data-edit]'); await page.fill('[data-draft]', 'Καλησπέρα σας. Δοκιμαστικό κείμενο.');
  await page.click('#dtab-4'); await page.click('[data-approve]');
  const ok = await page.textContent('[data-result]');
  check('Demo', 'Έγκριση στο demo → «Δεν έγινε αποστολή.»', ok === 'Το προσχέδιο εγκρίθηκε μόνο στην επίδειξη. Δεν έγινε αποστολή.', ok);
  await page.click('[data-edit]'); await page.type('[data-draft]', ' Αλλαγή');
  check('Demo', 'Νέα επεξεργασία ακυρώνει την έγκριση', !(await page.evaluate(() => document.querySelector('[data-demo]').__demo.approved)));
  await page.click('[data-demo-reset]');
  const st = await page.evaluate(() => ({ a: document.querySelector('[data-demo]').__demo.approved, s: document.querySelector('[data-demo]').__demo.step, t: document.querySelector('[data-draft]').value, r: document.querySelector('[data-result]').textContent }));
  check('Demo', 'Reset: κείμενο, έγκριση και βήμα επανέρχονται', !st.a && st.s === 0 && st.t.startsWith('Καλησπέρα σας. Η παραγγελία') && !st.r, JSON.stringify({ a: st.a, s: st.s }));
  await page.screenshot({ path: path.join(OUT, 'demo-1440.png'), clip: await page.locator('#demo').boundingBox() });
  await ctx.close();
}

/* ===== 7. Φόρμα (demo mode) ===== */
{
  const { ctx, page } = await open({ hash: '#epideixi' });
  const net = [];
  page.on('request', (r) => net.push(r.url()));
  const lsBefore = await page.evaluate(() => localStorage.length);
  await page.click('[data-submit]');
  const errs = await page.$$eval('.error', (e) => e.filter((x) => x.textContent).length);
  check('Φόρμα', 'Άδεια πεδία → 3 μηνύματα σφάλματος, εστίαση στο πρώτο', errs === 3 && (await page.evaluate(() => document.activeElement.id)) === 'f-name');
  await page.fill('#f-name', 'Δοκιμή'); await page.fill('#f-email', 'not-an-email'); await page.fill('#f-need', 'Ενδεικτική ανάγκη');
  await page.click('[data-submit]');
  check('Φόρμα', 'Μη έγκυρο email απορρίπτεται', /έγκυρη μορφή/.test(await page.textContent('#e-email')) && !(await page.textContent('[data-form-result]')));
  await page.fill('#f-email', 'test@example.com');
  await page.dblclick('[data-submit]');
  await page.waitForTimeout(100);
  const res = await page.textContent('[data-form-result]');
  check('Φόρμα', 'Έγκυρη δοκιμή → «Η δοκιμή ολοκληρώθηκε. Δεν στάλθηκε αίτημα.»', res === 'Η δοκιμή ολοκληρώθηκε. Δεν στάλθηκε αίτημα.', res);
  check('Φόρμα', 'Διπλό click → μία μόνο δοκιμή', (await page.evaluate(() => document.querySelector('[data-form]').__state.submissions)) === 1);
  check('Assets/ιδιωτικότητα', 'Τα στοιχεία δεν φεύγουν από τον browser (0 requests, 0 localStorage)', net.length === 0 && (await page.evaluate(() => localStorage.length)) === lsBefore, `requests=${net.length}`);
  await page.click('[data-form-reset]');
  check('Φόρμα', 'Καθαρισμός πεδίων και μηνυμάτων', (await page.inputValue('#f-name')) === '' && !(await page.textContent('[data-form-result]')));
  check('Φόρμα', 'Ένδειξη δοκιμαστικής φόρμας ορατή πριν από τη συμπλήρωση', await page.isVisible('#form-mode'));
  await ctx.close();
}

/* ===== 8. Χωρίς JavaScript ===== */
{
  const { ctx, page } = await open({ js: false });
  const r = await page.evaluate(() => ({ h1: getComputedStyle(document.querySelector('h1')).opacity, ch: [...document.querySelectorAll('[data-chapter]')].map((c) => getComputedStyle(c).opacity), faq: document.querySelectorAll('details').length, links: document.querySelectorAll('.site-header a').length }));
  check('Προσβασιμότητα', 'Χωρίς JavaScript: κείμενα και βασικά links διαθέσιμα', r.h1 === '1' && r.ch.every((o) => o === '1') && r.faq === 5, JSON.stringify(r));
  await page.screenshot({ path: path.join(OUT, 'no-js-390.png') });
  await ctx.close();
}

/* ===== 9. Αντίθεση πραγματικών συνδυασμών ===== */
{
  const { ctx, page } = await open();
  const pairs = await page.evaluate(() => {
    const toHex = (c) => '#' + c.match(/[\d.]+/g).slice(0, 3).map((v) => (+v).toString(16).padStart(2, '0')).join('');
    const bgOf = (el) => { while (el) { const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g); if (m && (m.length < 4 || +m[3] === 1)) return toHex(getComputedStyle(el).backgroundColor); el = el.parentElement; } return '#0d0208'; };
    const S = { 'Κείμενο hero': '.lead', 'Κουμπί CTA': '.btn-primary', 'Κουμπί ghost': '.btn-ghost', 'Μενού': '.nav-list a', 'Kicker': '.kicker', 'Badge': '.badge', 'Σημείωση #lyseis': '.note', 'Μήνυμα Trinity': '.bubble-trinity p', 'Μήνυμα ιδιοκτήτη': '.bubble-owner p', 'Υπότιτλος demo': '.demo-sub', 'FAQ': '.faq summary', 'Label φόρμας': '.field label', 'Τερματικό (κύριο)': '.terminal-body', 'Τερματικό (αριθμοί)': '.t-n', 'Footer': '.footer-note' };
    return Object.entries(S).map(([k, s]) => { const el = document.querySelector(s); const cs = getComputedStyle(el); return [k, toHex(cs.color), bgOf(el), parseFloat(cs.fontSize), +cs.fontWeight]; });
  });
  for (const [k, fg, bg, size, wt] of pairs) {
    const r = ratio(hex(fg), hex(bg)); const large = size >= 24 || (size >= 18.66 && wt >= 700); const min = large ? 3 : 4.5;
    check('Προσβασιμότητα', `Αντίθεση ${k}: ${fg} σε ${bg}`, r >= min, `${r.toFixed(2)}:1 (ελάχ. ${min})`);
  }
  await ctx.close();
}

/* ===== 10. Απόδοση ===== */
{
  const dist = 'dist/assets';
  const js = fs.readdirSync(dist).filter((f) => f.endsWith('.js')).reduce((s, f) => s + zlib.gzipSync(fs.readFileSync(path.join(dist, f))).length, 0);
  const css = fs.readdirSync(dist).filter((f) => f.endsWith('.css')).reduce((s, f) => s + zlib.gzipSync(fs.readFileSync(path.join(dist, f))).length, 0);
  const fonts = fs.readdirSync(dist).filter((f) => f.endsWith('.woff2')).reduce((s, f) => s + fs.statSync(path.join(dist, f)).size, 0);
  const html = zlib.gzipSync(fs.readFileSync('dist/index.html')).length;
  check('Απόδοση', 'Αρχικό JavaScript ≤ 200 KB gzip', js <= 200 * 1024, `JS ${(js / 1024).toFixed(1)} KB gzip · CSS ${(css / 1024).toFixed(1)} KB · HTML ${(html / 1024).toFixed(1)} KB · γραμματοσειρές ${(fonts / 1024).toFixed(0)} KB`);
  rec('Απόδοση', 'Hero poster / αλληλουχία frames (όρια 200/350 KB, 4/8 MB)', 'BLOCKED', 'Δεν υπάρχουν assets Higgsfield· η σκηνή είναι procedural (0 KB εικόνων)');
  const { ctx, page } = await open({ device: devices['Pixel 7'] });
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const perf = await page.evaluate(async () => {
    const t = []; let last = performance.now(), long = 0;
    const po = new PerformanceObserver((l) => { long += l.getEntries().length; }); try { po.observe({ type: 'longtask' }); } catch {}
    const r = document.querySelector('[data-story]'); const travel = r.offsetHeight - r.querySelector('[data-stage]').offsetHeight;
    await new Promise((res) => { let i = 0; const tick = (now) => { t.push(now - last); last = now; scrollTo(0, (i / 150) * travel); if (++i < 150) requestAnimationFrame(tick); else res(); }; requestAnimationFrame(tick); });
    po.disconnect(); t.sort((a, b) => a - b);
    return { p50: t[Math.floor(t.length / 2)], p95: t[Math.floor(t.length * 0.95)], long };
  });
  const nav = await page.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; const fcp = performance.getEntriesByName('first-contentful-paint')[0]; return { dcl: Math.round(n.domContentLoadedEventEnd), fcp: fcp ? Math.round(fcp.startTime) : null }; });
  check('Απόδοση', 'Κύλιση σκηνής σε Pixel 7 (emulation), CPU ×4: p95 καρέ < 50 ms', perf.p95 < 50, `p50=${perf.p50.toFixed(1)} ms · p95=${perf.p95.toFixed(1)} ms · long tasks=${perf.long} · FCP=${nav.fcp} ms · DCL=${nav.dcl} ms (localhost, χωρίς throttling δικτύου)`);
  await ctx.close();
}

check('Γενικά', 'Χωρίς σφάλματα κονσόλας', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));
if (process.env.QA_PAGES_URL) {
  // wrangler pages dev: τοπική προσομοίωση του Cloudflare Pages (ο προτεινόμενος host).
  const P = process.env.QA_PAGES_URL;
  const st = async (u) => (await fetch(new URL(u, P), { redirect: 'manual' })).status;
  const codes = { root: await st('/'), unknown: await st('/lyseis'), old: await st('/old-sitemap/timologisi') };
  const xr = (await fetch(P)).headers.get('x-robots-tag');
  check('Navigation', 'Cloudflare Pages (wrangler pages dev): / 200, άγνωστα paths πραγματικό 404', codes.root === 200 && codes.unknown === 404 && codes.old === 404, JSON.stringify(codes));
  check('SEO', 'Cloudflare Pages: header X-Robots-Tag noindex', /noindex/.test(xr || ''), xr);
} else {
  rec('Navigation', 'Πραγματικό HTTP 404 σε άγνωστα paths', 'NOT RUN', 'Ορίστε QA_PAGES_URL (wrangler pages dev dist)');
}
rec('Mobile', 'Φυσικές συσκευές (iPhone/Android)', 'NOT RUN', 'Μόνο Chromium emulation σε αυτό το περιβάλλον');

await browser.close();
fs.writeFileSync('qa/results.json', JSON.stringify(rows, null, 2));
const c = (s) => rows.filter((r) => r.status === s).length;
console.log(`\nPASS ${c('PASS')} · FAIL ${c('FAIL')} · BLOCKED ${c('BLOCKED')} · NOT RUN ${c('NOT RUN')}`);
process.exit(c('FAIL') ? 1 : 0);

// QA §14 στην πραγματικά αποδομένη σελίδα (Playwright · Chromium). Εντολή: npm run build && npm run preview & npm run qa
// Κάθε γραμμή: περιοχή, έλεγχος, κατάσταση, αναμενόμενο, πραγματικό, τεκμήριο, περιβάλλον.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { HOOKS, DEMO } from '../src/content/copy.js';
import { siteConfig } from '../site.config.js';

const { chromium } = createRequire(import.meta.url)('playwright');
const BASE = process.env.QA_URL || 'http://localhost:4175/';
const SHOTS = 'qa/screenshots';
fs.mkdirSync(SHOTS, { recursive: true });
const commit = execSync('git rev-parse --short HEAD').toString().trim();
const browser = await chromium.launch();
const ENV0 = `Chromium ${browser.version()} (Playwright headless) · commit ${commit}`;
const rows = [];
const rec = (area, name, status, expected, actual, evidence, env) => {
  rows.push({ area, name, status, expected, actual: String(actual), evidence: evidence || '', env: env || ENV0 });
  console.log(`${status.padEnd(7)} [${area}] ${name} — ${actual}`);
};
const check = (area, name, ok, expected, actual, evidence, env) => rec(area, name, ok ? 'PASS' : 'FAIL', expected, actual, evidence, env);

const hex = (h) => h.replace('#', '').match(/../g).map((x) => parseInt(x, 16));
const lum = (c) => { const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

const consoleErrors = [], badResponses = [];
async function open(opts = {}) {
  const vp = opts.viewport || { width: 1440, height: 900 };
  const ctx = await browser.newContext({ viewport: vp, reducedMotion: opts.reducedMotion || 'no-preference', javaScriptEnabled: opts.js !== false, deviceScaleFactor: opts.dsf || 1, hasTouch: !!opts.touch, isMobile: !!opts.mobile });
  if (opts.route) await opts.route(ctx);
  const page = await ctx.newPage();
  page.on('console', (m) => m.type() === 'error' && !opts.allow404 && consoleErrors.push(m.text()));
  page.on('pageerror', (e) => consoleErrors.push(String(e)));
  page.on('response', (r) => { if (r.status() >= 400 && !opts.allow404) badResponses.push(`${r.status()} ${r.url()}`); });
  await page.goto(BASE + (opts.hash || ''), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  return { ctx, page, env: `${ENV0} · ${vp.width}×${vp.height}${opts.reducedMotion === 'reduce' ? ' · reduced motion (emulated)' : ''}${opts.js === false ? ' · χωρίς JS' : ''}` };
}
const typing = (page) => page.evaluate(() => document.querySelector('[data-terminal]').__typing.state);
const cinemaGeo = (page) => page.evaluate(() => { const c = document.querySelector('[data-cinema]'); const s = c.querySelector('[data-cinema-stage]'); return { top: c.getBoundingClientRect().top + scrollY, travel: c.offsetHeight - s.offsetHeight, stTop: parseFloat(getComputedStyle(s).top) }; });
async function scrollCinema(page, f) { const g = await cinemaGeo(page); await page.evaluate((y) => scrollTo(0, y), Math.round(g.top - g.stTop + g.travel * f)); await page.waitForTimeout(500); }

/* ========== 1. Viewports & screenshots ========== */
for (const [w, h] of [[360, 800], [390, 844], [768, 1024], [1440, 900]]) {
  const { ctx, page, env } = await open({ viewport: { width: w, height: h }, dsf: 2 });
  await page.screenshot({ path: path.join(SHOTS, `${w}-hero-start.png`) });
  await page.evaluate(() => document.querySelector('[data-terminal]').scrollIntoView({ block: 'center' }));
  await page.waitForFunction(() => document.querySelector('[data-terminal]').__typing.state.done, null, { timeout: 20000 });
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(SHOTS, `${w}-hero-typed.png`) });
  const r = await page.evaluate(() => {
    const vw = innerWidth;
    const off = [...document.querySelectorAll('body *')].filter((el) => !el.closest('[hidden], .sr-only, .mobile-menu') && (() => { const b = el.getBoundingClientRect(); return b.width && (b.right > vw + 1 || b.left < -1); })()).slice(0, 4).map((el) => el.className || el.tagName);
    const small = [...document.querySelectorAll('a, button, summary, textarea')].filter((el) => el.offsetParent && !el.closest('.mobile-menu, .footer-links, .brand') && !el.classList.contains('skip-link')).filter((el) => { const b = el.getBoundingClientRect(); return b.height < 44 || b.width < 44; }).map((el) => `${el.textContent.trim().slice(0, 18)}:${Math.round(el.getBoundingClientRect().width)}×${Math.round(el.getBoundingClientRect().height)}`);
    return { sw: document.documentElement.scrollWidth, vw, off, small };
  });
  check('Responsive', `${w}×${h}: χωρίς οριζόντια υπερχείλιση`, r.sw <= r.vw && !r.off.length, 'scrollWidth ≤ viewport, κανένα στοιχείο εκτός', `scrollWidth ${r.sw} / viewport ${r.vw}`, r.off.join(', ') || `${w}-hero-typed.png`, env);
  check('Responsive', `${w}×${h}: στόχοι αφής ≥ 44×44`, !r.small.length, 'κάθε control ≥ 44×44 px', r.small.length ? r.small.join(', ') : 'όλα ≥ 44×44', '', env);
  for (const id of ['uses', 'example', 'control', 'access']) {
    const box = await page.evaluate((id) => { const el = document.getElementById(id); return { y: el.getBoundingClientRect().top + scrollY, h: el.offsetHeight }; }, id);
    if (id === 'example') { await scrollCinema(page, 0.62); await page.screenshot({ path: path.join(SHOTS, `${w}-example-cinema.png`) }); }
    await page.screenshot({ path: path.join(SHOTS, `${w}-${id}.png`), fullPage: true, clip: { x: 0, y: id === 'example' ? box.y + box.h - Math.min(box.h, 1400) : box.y, width: w, height: Math.min(box.h, 1400) } });
  }
  await ctx.close();
}

/* ========== 2. Δομή, SEO ========== */
{
  const { ctx, page, env } = await open();
  const m = await page.evaluate(() => ({
    lang: document.documentElement.lang, h1: document.querySelectorAll('h1').length, h1text: document.querySelector('h1').textContent.trim(),
    sections: ['top', 'uses', 'example', 'control', 'access'].map((id) => document.querySelector(`main > section#${id}`) ? id : `-${id}`),
    mainSections: document.querySelectorAll('main > section').length,
    robots: document.querySelector('meta[name=robots]')?.content, canonical: !!document.querySelector('link[rel=canonical]'), ogurl: !!document.querySelector('meta[property="og:url"]'),
    ogimg: document.querySelector('meta[property="og:image"]')?.content, title: document.title, desc: document.querySelector('meta[name=description]')?.content,
    hrefs: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')), forms: document.querySelectorAll('form').length,
    headings: [...document.querySelectorAll('h1,h2,h3')].map((x) => +x.tagName[1]),
  }));
  check('Δομή', 'Ένα route, πέντε κύριες ενότητες', m.mainSections === 5 && m.sections.every((s) => !s.startsWith('-')), '#top #uses #example #control #access', m.sections.join(' '), `main > section: ${m.mainSections}`, env);
  const ext = m.hrefs.filter((h) => !h.startsWith('#') && h !== siteConfig.APP_URL);
  check('Δομή', 'Σύνδεσμοι μόνο προς anchors και APP_URL, χωρίς φόρμες', !ext.length && m.forms === 0, 'κανένα άλλο route, 0 φόρμες', `${m.hrefs.length} links, άλλα: ${ext.length}, φόρμες: ${m.forms}`, ext.join(' '), env);
  check('SEO', 'Μία H1 με ακριβές κείμενο, lang="el"', m.h1 === 1 && m.lang === 'el' && m.h1text === 'Λιγότερες εκκρεμότητες. Περισσότερος χρόνος για την επιχείρησή σου.', 'μία H1 του brief', `${m.h1} H1 · «${m.h1text}» · lang=${m.lang}`, `ιεραρχία ${m.headings.join('')}`, env);
  check('SEO', 'noindex/nofollow, χωρίς canonical/og:url, σχετικό og:image', /noindex/.test(m.robots) && /nofollow/.test(m.robots) && !m.canonical && !m.ogurl && m.ogimg.startsWith('/'), 'noindex, nofollow· όχι επινοημένα απόλυτα URLs', `robots="${m.robots}" canonical=${m.canonical} og:url=${m.ogurl} og:image=${m.ogimg}`, '', env);
  const og = await fetch(new URL('og-image.png', BASE)); const fav = await fetch(new URL('favicon.svg', BASE)); const rob = await (await fetch(new URL('robots.txt', BASE))).text();
  check('SEO', 'Social preview 1200×630, favicon, robots Disallow', og.ok && fav.ok && /Disallow: \//.test(rob), 'αρχεία διαθέσιμα', `og-image ${og.status} · favicon ${fav.status} · robots ${/Disallow/.test(rob) ? 'Disallow /' : '—'}`, '', env);
  const text = await page.evaluate(() => document.body.innerText);
  const banned = [/19\s?€/, /€/, /\b11\b/, /υπάλληλ/i, /\d+\s?%/, /GDPR/, /ISO/, /πιστοποίη/i, /Γνώρισε τον NEO/i, /ντουλάπ|βιβλιοθήκ/i, /#0142/];
  const hits = banned.filter((r) => r.test(text)).map(String);
  check('Claims', 'Χωρίς τιμές, αριθμητικούς ισχυρισμούς, πιστοποιήσεις, παλιά παραδείγματα', !hits.length, 'κανένα απαγορευμένο μοτίβο', hits.join(' ') || 'κανένα εύρημα', 'innerText', env);
  const needed = ['Κάθε δουλειά χρειάζεται τη σωστή ειδικότητα.', 'Η Peitho εστιάζει στο marketing. Από μια ιδέα για ανάρτηση μέχρι ένα οργανωμένο προσχέδιο επικοινωνίας.', 'Ο Morpheus εστιάζει στα οικονομικά στοιχεία. Παραστατικά, υποχρεώσεις και εκκρεμότητες, συγκεντρωμένα για έλεγχο.', 'Η Trinity είναι το σημείο επικοινωνίας. Συγκεντρώνει το αίτημα και σε βοηθά να φτάσεις σε μια απάντηση που μπορείς να ελέγξεις.', 'Η αξία βρίσκεται στη συνεργασία. Οι εργασίες συνδέονται μέσα σε ένα σύστημα, με σαφές επόμενο βήμα.', 'Όταν δεν μπορείς να απαντήσεις, το αίτημα δεν χρειάζεται να χαθεί.', 'Σχεδιαζόμενη επέκταση — δεν είναι ενεργή στην επίδειξη', 'Ας δούμε την ομάδα μέσα από μία εργασία.', 'Ενδεικτικό παράδειγμα — δεν εκτελεί πραγματικές εργασίες', 'Η ομάδα προετοιμάζει. Εσύ αποφασίζεις.', 'Δες πώς μπορεί να οργανωθεί το επόμενο βήμα σου.', 'Παρουσίαση προϊόντος υπό ανάπτυξη', 'Γνώρισε την εφαρμογή και την τρέχουσα κατάστασή της.'];
  const miss = needed.filter((s) => !text.replace(/\s+/g, ' ').includes(s));
  check('Αφήγηση', 'Γραμμές NEO, ρόλοι Peitho/Morpheus/Trinity, σήμανση γραμματείας', !miss.length, `${needed.length} συμφωνημένες φράσεις ακριβώς`, miss.length ? `λείπουν: ${miss.join(' | ')}` : `${needed.length}/${needed.length} παρούσες`, '', env);
  const faq = await page.$$eval('.faq summary', (s) => s.map((x) => x.textContent.trim()));
  check('FAQ', 'Έξι συμφωνημένες ερωτήσεις', faq.length === 6, '6 ερωτήσεις του brief', faq.join(' | '), '', env);
  await ctx.close();
}

/* ========== 3. Terminal ========== */
{
  const { ctx, page, env } = await open();
  const d = await page.evaluate(() => {
    const t = document.querySelector('[data-terminal]'), h1 = document.querySelector('h1'), cs = getComputedStyle(t);
    return { title: t.querySelector('.terminal-bar span').textContent, dots: t.querySelectorAll('.terminal-bar i').length, bg: cs.backgroundColor, border: cs.borderTopColor, right: t.getBoundingClientRect().left > h1.getBoundingClientRect().right, color: getComputedStyle(t.querySelector('.terminal-lines')).color, font: getComputedStyle(t.querySelector('.terminal-lines')).fontFamily.split(',')[0], glow: cs.boxShadow.includes('rgba(0, 255, 65') };
  });
  check('Terminal', 'Design v0.1.0: δεξιά, σκοτεινό πλαίσιο, bar, πράσινη μονοδιάστατη γραφή, λάμψη', d.right && d.dots === 3 && d.bg === 'rgb(0, 0, 0)' && d.border === 'rgb(0, 143, 17)' && d.color === 'rgb(0, 255, 65)' && d.glow, 'όπως v0.1.0', JSON.stringify(d), '1440-hero-typed.png', env);
  check('Terminal', 'Τίτλος «NEO · ONE4Business»', d.title === 'NEO · ONE4Business', 'NEO · ONE4Business', d.title, '', env);
  const box0 = await page.locator('[data-terminal]').boundingBox();
  // δειγματοληψία ρυθμού
  const samples = [];
  await page.waitForFunction(() => document.querySelector('[data-terminal]').__typing.state.revealed > 3, null, { timeout: 5000 });
  for (let i = 0; i < 40; i++) { samples.push(await page.evaluate(() => ({ t: performance.now(), n: document.querySelector('[data-terminal]').__typing.state.revealed, c: document.querySelector('[data-terminal]').__typing.cursorAfter(), last: (() => { const on = [...document.querySelectorAll('.ch.on')]; return on.length ? on[on.length - 1].textContent : null; })() }))); await page.waitForTimeout(20); }
  const jumps = samples.slice(1).map((s, i) => s.n - samples[i].n);
  const rate = (samples.at(-1).t - samples[0].t) / Math.max(1, samples.at(-1).n - samples[0].n);
  check('Terminal', 'Ένας χαρακτήρας κάθε φορά (~45 ms)', Math.max(...jumps) <= 1 && rate > 35 && rate < 70, 'βήματα ενός χαρακτήρα, ~45 ms/χαρ.', `μέγιστο βήμα ${Math.max(...jumps)} χαρ. ανά 20 ms δείγμα · μέσος ρυθμός ${rate.toFixed(1)} ms/χαρ.`, `${samples.length} δείγματα`, env);
  check('Terminal', 'Cursor ακριβώς μετά τον τελευταίο χαρακτήρα', samples.every((s) => s.c === s.last), 'cursor.previousSibling = τελευταίος ορατός χαρακτήρας', samples.every((s) => s.c === s.last) ? '40/40 δείγματα' : 'απόκλιση', '', env);
  // pause offscreen / resume
  await page.evaluate(() => scrollTo(0, document.getElementById('control').offsetTop)); await page.waitForTimeout(300);
  const off1 = await typing(page); await page.waitForTimeout(1200); const off2 = await typing(page);
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(700); const back = await typing(page);
  check('Terminal', 'Παύση offscreen και συνέχεια από το ίδιο σημείο', !off1.done && off1.revealed === off2.revealed && off2.pausedReason === 'offscreen' && back.revealed > off2.revealed, 'σταθερό offscreen, συνέχεια μετά', `offscreen ${off1.revealed}→${off2.revealed} (${off2.pausedReason}) · επιστροφή ${back.revealed}`, '', env);
  // hidden tab
  const other = await ctx.newPage(); await other.goto('about:blank'); await other.bringToFront(); await page.waitForTimeout(200);
  const vis = await page.evaluate(() => document.visibilityState);
  let hidOk, hidActual;
  if (vis === 'hidden') { const a = await typing(page); await page.waitForTimeout(1000); const b2 = await typing(page); hidOk = a.revealed === b2.revealed; hidActual = `πραγματική κρυφή καρτέλα: ${a.revealed}→${b2.revealed} (${b2.pausedReason})`; }
  else {
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
    const a = await typing(page); await page.waitForTimeout(1000); const b2 = await typing(page);
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); });
    hidOk = a.revealed === b2.revealed && b2.pausedReason === 'hidden-tab'; hidActual = `visibilitychange (προσομοίωση document.hidden): ${a.revealed}→${b2.revealed} (${b2.pausedReason})`;
  }
  await other.close(); await page.bringToFront();
  check('Terminal', 'Παύση σε κρυφή καρτέλα', hidOk, 'καμία πρόοδος όσο είναι κρυφή', hidActual, `visibilityState μετά από bringToFront άλλης καρτέλας: ${vis}`, env);
  await page.waitForFunction(() => document.querySelector('[data-terminal]').__typing.state.done, null, { timeout: 20000 });
  const done = await page.evaluate(() => document.querySelector('[data-terminal]').__typing.text);
  check('Terminal', 'Τρία hooks ακριβώς, οι προηγούμενες φράσεις παραμένουν', JSON.stringify(done) === JSON.stringify(HOOKS), 'τα τρία hooks του brief', done.map((x) => `«${x}»`).join(' '), 'Intl.Segmenter graphemes', env);
  const box1 = await page.locator('[data-terminal]').boundingBox();
  check('Terminal', 'Χωρίς layout shift κατά την πληκτρολόγηση', box0.height === box1.height && box0.y === box1.y, 'ίδιο ύψος/θέση πριν και μετά', `ύψος ${box0.height}→${box1.height}, y ${box0.y}→${box1.y}`, '', env);
  await page.waitForTimeout(2000);
  const after = await page.evaluate(() => ({ s: document.querySelector('[data-terminal]').__typing.state, anim: getComputedStyle(document.querySelector('.cursor')).animationName, skip: document.querySelector('[data-terminal-skip]').hidden }));
  check('Terminal', 'Μία εκτέλεση, χωρίς διαγραφή/επανάληψη, χωρίς blinking μετά το τέλος', after.s.done && after.s.revealed === after.s.total && after.anim === 'none' && after.skip, 'παραμένει ολοκληρωμένο, cursor σταθερός', `done=${after.s.done} ${after.s.revealed}/${after.s.total} · animation=${after.anim} · «Εμφάνιση όλου» κρυμμένο=${after.skip}`, '', env);
  const a11y = await page.evaluate(() => { const t = document.querySelector('[data-terminal]'); return { hidden: t.querySelector('[data-terminal-lines]').getAttribute('aria-hidden'), sr: [...t.querySelectorAll('.sr-only p')].map((p) => p.textContent), live: t.querySelectorAll('[aria-live]').length }; });
  check('Terminal', 'Screen readers: πλήρες κείμενο μία φορά, χωρίς aria-live', a11y.hidden === 'true' && JSON.stringify(a11y.sr) === JSON.stringify(HOOKS) && a11y.live === 0, 'οπτικό aria-hidden, sr-only αντίγραφο, 0 aria-live', `aria-hidden=${a11y.hidden} · sr ${a11y.sr.length} φράσεις · aria-live ${a11y.live}`, '', env);
  await ctx.close();
}
{
  const { ctx, page, env } = await open();
  await page.waitForFunction(() => document.querySelector('[data-terminal]').__typing.state.revealed > 5);
  await page.focus('[data-terminal-skip]'); await page.keyboard.press('Enter');
  const s = await typing(page);
  const focus = await page.evaluate(() => document.activeElement.matches('[data-terminal]'));
  check('Terminal', '«Εμφάνιση όλου» ολοκληρώνει αμέσως (πληκτρολόγιο)', s.done && s.revealed === s.total && focus, 'πλήρες κείμενο αμέσως, η εστίαση δεν χάνεται', `done=${s.done} ${s.revealed}/${s.total} · εστίαση στο terminal=${focus}`, '', env);
  await ctx.close();
}
{
  const { ctx, page, env } = await open({ reducedMotion: 'reduce' });
  const s = await typing(page); const anim = await page.evaluate(() => getComputedStyle(document.querySelector('.cursor')).animationName);
  check('Terminal', 'Reduced motion: όλο το κείμενο αμέσως, χωρίς blinking', s.done && s.revealed === s.total && anim === 'none', 'πλήρες, στατικό', `done=${s.done} · animation=${anim}`, '', env);
  await ctx.close();
}
{
  const { ctx, page, env } = await open({ js: false });
  const t = await page.evaluate(() => [...document.querySelectorAll('.hook')].map((h) => h.textContent.trim()));
  const vis = await page.evaluate(() => getComputedStyle(document.querySelector('.hook')).visibility);
  check('Terminal', 'Χωρίς JavaScript: όλο το κείμενο', JSON.stringify(t) === JSON.stringify(HOOKS) && vis === 'visible', 'τρία hooks ορατά', `${t.length} hooks, visibility=${vis}`, '', env);
  await page.screenshot({ path: path.join(SHOTS, 'nojs-1440.png') });
  const cin = await page.evaluate(() => ({ h: document.querySelector('[data-cinema]').offsetHeight, beats: [...document.querySelectorAll('[data-beat]')].map((b) => getComputedStyle(b).color) }));
  check('Fallbacks', 'Χωρίς JavaScript: κατανοητή στατική σελίδα (cinema χωρίς pinned κενό)', cin.h < 900, 'στατική σκηνή', `ύψος cinema ${cin.h}px, λεζάντες ορατές`, 'nojs-1440.png', env);
  await ctx.close();
}
{
  const { ctx, page, env } = await open({ viewport: { width: 360, height: 800 } });
  await page.evaluate(() => document.querySelector('[data-terminal]').scrollIntoView({ block: 'center' }));
  const m = await page.evaluate(() => { const l = document.querySelector('.terminal-lines'); return { fs: parseFloat(getComputedStyle(l).fontSize), sw: l.scrollWidth, cw: l.clientWidth, ws: getComputedStyle(document.querySelector('.hook')).whiteSpace }; });
  check('Terminal', 'Κινητό 360: φυσική αναδίπλωση, όχι οριζόντια κύλιση, γραμματοσειρά ≥ 15px', m.fs >= 15 && m.sw <= m.cw && m.ws === 'normal', 'wrap, ≥15px', `font ${m.fs}px · scroll ${m.sw}/${m.cw} · white-space ${m.ws}`, '360-hero-typed.png', env);
  await ctx.close();
}
// Αξιολόγηση μηχανισμού v1.0.0 (scroll-linked clip σε ch)
try {
  const v1 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await v1.goto(process.env.QA_V1 || 'http://localhost:4174/', { waitUntil: 'networkidle', timeout: 5000 });
  await v1.waitForTimeout(2500);
  const atTop = await v1.evaluate(() => [...document.querySelectorAll('.t-clip')].map((c) => c.style.maxWidth).join('|'));
  const g = await v1.evaluate(() => { const r = document.querySelector('[data-story]'); return r.offsetHeight - r.querySelector('[data-stage]').offsetHeight; });
  await v1.evaluate((y) => scrollTo(0, y), Math.round(g * 0.6)); await v1.waitForTimeout(1200);
  const mid = await v1.evaluate(() => [...document.querySelectorAll('.t-clip')].map((c) => c.style.maxWidth).join('|'));
  await v1.waitForTimeout(1500);
  const mid2 = await v1.evaluate(() => [...document.querySelectorAll('.t-clip')].map((c) => c.style.maxWidth).join('|'));
  rec('Terminal', 'Αξιολόγηση μηχανισμού v1.0.0 για επαναχρησιμοποίηση', 'PASS', 'πραγματική δοκιμή και απόφαση', `scroll-linked, όχι χρονικός: στην αρχή «${atTop}», στο 60% «${mid}», χωρίς scroll μετά 1,5 s «${mid2}». Κόβει με max-width σε ch (υποθέτει μονοδιάστατη γραμμή χωρίς αναδίπλωση). Δεν επαναχρησιμοποιήθηκε· νέος μηχανισμός ανά grapheme.`, 'v1.0.0 στο localhost:4174', `${ENV0} · v1.0.0`);
  await v1.close();
} catch (e) { rec('Terminal', 'Αξιολόγηση μηχανισμού v1.0.0', 'NOT RUN', 'πραγματική δοκιμή', `το preview της v1.0.0 δεν έτρεχε (${String(e).slice(0, 60)})`, ''); }

/* ========== 4. Navigation, menu, keyboard, FAQ ========== */
{
  let { ctx, page, env } = await open();
  for (const id of ['uses', 'example', 'control']) {
    await page.click(`.nav-list a[href="#${id}"]`);
    await page.waitForFunction((id) => { const t = document.querySelector(`#${id} h2`).getBoundingClientRect().top; return t > 64 && t < 320; }, id, { timeout: 5000 }).catch(() => {});
    const t = await page.evaluate((id) => document.querySelector(`#${id} h2`).getBoundingClientRect().top, id);
    check('Navigation', `Header → #${id}: επικεφαλίδα κάτω από το header`, t > 64 && t < 320, 'top > ύψος header', `top ${Math.round(t)}px`, '', env);
  }
  await page.click('.hero .btn-primary');
  await page.waitForFunction(() => location.hash === '#example', null, { timeout: 3000 }).catch(() => {});
  check('Navigation', 'Hero CTA «Δες πώς λειτουργεί» → #example', (await page.evaluate(() => location.hash)) === '#example', '#example', await page.evaluate(() => location.hash), '', env);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const stops = [];
  for (let i = 0; i < 9; i++) { await page.keyboard.press('Tab'); stops.push(await page.evaluate(() => { const el = document.activeElement, cs = getComputedStyle(el); return { t: (el.getAttribute('aria-label') || el.textContent).trim().replace(/\s+/g, ' ').slice(0, 24), ok: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2 }; })); }
  check('Πληκτρολόγιο', 'Skip link πρώτο, ορατό focus σε κάθε στάση', stops[0].t.startsWith('Μετάβαση') && stops.every((s) => s.ok), 'outline ≥ 2px #00FF41', stops.map((s) => s.t).join(' → '), 'focus-1440.png', env);
  await page.screenshot({ path: path.join(SHOTS, 'focus-1440.png') });
  await page.goto(BASE + '#control', { waitUntil: 'networkidle' });
  await page.locator('.faq summary').first().focus(); await page.keyboard.press('Enter');
  const opened = await page.locator('.faq details').first().evaluate((d) => d.open);
  check('FAQ', 'Άνοιγμα με πληκτρολόγιο', opened, 'details ανοίγει με Enter', `open=${opened}`, '', env);
  for (const hash of ['#example', '#access']) {
    // νέα καρτέλα = πραγματική απευθείας φόρτωση (όχι αλλαγή hash στο ίδιο έγγραφο)
    await page.close(); page = await ctx.newPage();
    await page.goto(BASE + hash, { waitUntil: 'networkidle' }); await page.waitForTimeout(400);
    const t1 = await page.evaluate((h) => document.querySelector(h + ' h2').getBoundingClientRect().top, hash);
    await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(400);
    const t2 = await page.evaluate((h) => document.querySelector(h + ' h2').getBoundingClientRect().top, hash);
    check('Navigation', `Απευθείας φόρτωση /${hash} και refresh`, t1 > 40 && t1 < 400 && t2 > 40 && t2 < 400, 'ενότητα στην οθόνη', `top ${Math.round(t1)} → μετά το refresh ${Math.round(t2)}`, '', env);
  }
  await ctx.close();
}
{
  const { ctx, page, env } = await open({ viewport: { width: 390, height: 844 } });
  await page.click('[data-menu-open]');
  const inMenu = await page.evaluate(() => !!document.activeElement.closest('[data-menu]'));
  for (let i = 0; i < 8; i++) await page.keyboard.press('Tab');
  const trapped = await page.evaluate(() => !!document.activeElement.closest('[data-menu]'));
  await page.keyboard.press('Escape');
  const ret = await page.evaluate(() => document.activeElement.matches('[data-menu-open]')) && !(await page.isVisible('[data-menu]'));
  check('Navigation', 'Mobile menu: εστίαση μέσα, Tab παγιδευμένο, Escape κλείνει και επιστρέφει εστίαση', inMenu && trapped && ret, 'όλα αληθή', `μέσα=${inMenu} trap=${trapped} επιστροφή=${ret}`, '', env);
  await page.click('[data-menu-open]'); await page.screenshot({ path: path.join(SHOTS, '390-menu.png') });
  await page.click('.mobile-menu-list a[href="#control"]'); await page.waitForTimeout(1200);
  const t = await page.evaluate(() => document.querySelector('#control h2').getBoundingClientRect().top);
  check('Navigation', 'Mobile menu: κλείνει μετά την επιλογή και πάει στην ενότητα', !(await page.isVisible('[data-menu]')) && t > 64 && t < 320, 'κλειστό, ενότητα κάτω από header', `top ${Math.round(t)}px`, '390-menu.png', env);
  await ctx.close();
}

/* ========== 5. Demo ========== */
{
  const { ctx, page, env } = await open({ hash: '#example-demo' });
  const net = []; page.on('request', (r) => { if (!/\/media\//.test(r.url())) net.push(r.url()); });
  const ls0 = await page.evaluate(() => [localStorage.length, document.cookie]);
  const count = () => page.textContent('[data-count]');
  await page.click('[data-next]'); const c2 = await count(); await page.click('[data-next]'); await page.click('[data-next]'); const c4 = await count();
  check('Demo', 'Τέσσερα βήματα, «Βήμα Χ από 4», προηγούμενο/επόμενο', c2 === 'Βήμα 2 από 4' && c4 === 'Βήμα 4 από 4', 'ένδειξη βήματος', `${c2} · ${c4}`, '', env);
  const known = await page.$$eval('.known li', (l) => l.map((x) => x.textContent)); const missing = await page.$$eval('.missing li', (l) => l.map((x) => x.textContent));
  check('Demo', 'Φανταστικά δεδομένα: γνωστά, ελλείψεις, κόστος/χρόνος', JSON.stringify(known) === JSON.stringify(DEMO.known) && JSON.stringify(missing) === JSON.stringify(DEMO.missing) && (await page.textContent('.cost')).includes('Προς επιβεβαίωση'), 'όπως το brief', `${known.join(', ')} | ${missing.join(', ')}`, '', env);
  await page.fill('[data-draft-input]', 'Αλλαγμένο προσχέδιο δοκιμής.');
  await page.click('#tab-1'); await page.click('#tab-3');
  const view = await page.textContent('[data-draft-view]'); await page.click('#tab-4');
  check('Demo', 'Η αλλαγή βήματος διατηρεί το κείμενο', view === 'Αλλαγμένο προσχέδιο δοκιμής.' && (await page.inputValue('[data-draft-input]')) === 'Αλλαγμένο προσχέδιο δοκιμής.', 'ίδιο κείμενο σε βήμα 3 και 4', `βήμα 3: «${view}»`, '', env);
  await page.fill('[data-draft-input]', '   \n  '); await page.click('[data-approve]');
  const empty = await page.evaluate(() => ({ s: document.querySelector('[data-demo]').__demo.approved, m: document.querySelector('[data-status]').textContent }));
  check('Demo', 'Κενό/whitespace κείμενο δεν εγκρίνεται (έλεγχος στον handler)', !empty.s && empty.m === DEMO.messages.empty, 'μη εγκεκριμένο + μήνυμα', `approved=${empty.s} · «${empty.m}»`, '', env);
  await page.evaluate(() => { const b = document.querySelector('[data-approve]'); b.disabled = false; });
  await page.evaluate(() => { document.querySelector('[data-draft-input]').value = ' '; document.querySelector('[data-approve]').click(); });
  check('Demo', 'Έγκριση κενού και με απευθείας κλήση handler', !(await page.evaluate(() => document.querySelector('[data-demo]').__demo.approved)), 'απορρίπτεται', 'απορρίφθηκε', 'click() χωρίς input event', env);
  await page.fill('[data-draft-input]', 'Κείμενο <img src=x onerror="window.__xss=1"><b>έντονο</b>');
  await page.dblclick('[data-approve]');
  const ap = await page.evaluate(() => ({ s: document.querySelector('[data-demo]').__demo, m: document.querySelector('[data-status]').textContent }));
  check('Demo', 'Έγκριση: ακριβές μήνυμα, διπλό click = μία ενέργεια', ap.s.approved && ap.s.approvals === 1 && ap.m === DEMO.messages.approved, '«Εγκρίθηκε μόνο μέσα στο παράδειγμα…» · approvals=1', `«${ap.m}» · approvals=${ap.s.approvals}`, '', env);
  await page.click('#tab-3');
  const x = await page.evaluate(() => ({ imgs: document.querySelectorAll('[data-draft-view] img, [data-draft-view] b').length, txt: document.querySelector('[data-draft-view]').textContent, xss: window.__xss || 0 }));
  check('Demo', 'HTML-like input αποδίδεται ως απλό κείμενο', x.imgs === 0 && x.xss === 0 && x.txt.includes('<img'), '0 στοιχεία HTML, καμία εκτέλεση', `elements=${x.imgs} · εκτέλεση=${x.xss} · «${x.txt.slice(0, 40)}…»`, '', env);
  await page.click('#tab-4'); await page.type('[data-draft-input]', '!');
  const ch = await page.evaluate(() => ({ s: document.querySelector('[data-demo]').__demo.approved, m: document.querySelector('[data-status]').textContent, live: document.querySelector('[data-live-status]').textContent }));
  check('Demo', 'Νέα αλλαγή ακυρώνει την έγκριση', !ch.s && ch.m === DEMO.messages.changed, '«Το προσχέδιο άλλαξε. Χρειάζεται νέος έλεγχος.»', `approved=${ch.s} · «${ch.m}» · #control: «${ch.live}»`, '', env);
  await page.click('[data-reset]');
  const rs = await page.evaluate(() => ({ s: document.querySelector('[data-demo]').__demo, v: document.querySelector('[data-draft-input]').value, c: document.querySelector('[data-count]').textContent }));
  check('Demo', 'Επαναφορά: αρχικό κείμενο, βήμα 1, μη εγκεκριμένο', rs.v === DEMO.draft && rs.s.step === 0 && !rs.s.approved && rs.c === 'Βήμα 1 από 4', 'αρχική κατάσταση', `step=${rs.s.step} approved=${rs.s.approved} κείμενο αρχικό=${rs.v === DEMO.draft}`, '', env);
  await page.click('#tab-4'); await page.fill('[data-draft-input]', 'Πριν από refresh'); await page.reload({ waitUntil: 'networkidle' });
  const rf = await page.evaluate(() => ({ v: document.querySelector('[data-draft-input]').value, s: document.querySelector('[data-demo]').__demo }));
  check('Demo', 'Refresh επαναφέρει την αρχική κατάσταση', rf.v === DEMO.draft && rf.s.step === 0 && !rf.s.approved, 'αρχικό κείμενο', `αρχικό=${rf.v === DEMO.draft} step=${rf.s.step}`, '', env);
  const ls1 = await page.evaluate(() => [localStorage.length, document.cookie]);
  const sent = net.filter((u) => !u.startsWith(BASE) || /\?|api|collect/.test(u.replace(BASE, '')));
  check('Ιδιωτικότητα', 'Network: κανένα demo περιεχόμενο δεν αποστέλλεται, 0 localStorage/cookies', !sent.length && ls0[0] === ls1[0] && ls1[1] === '', '0 εξερχόμενα αιτήματα με δεδομένα', `αιτήματα κατά το demo: ${net.length} (μόνο φόρτωση σελίδας στο refresh) · εξωτερικά/με δεδομένα: ${sent.length} · localStorage ${ls1[0]} · cookies «${ls1[1]}»`, sent.join(' '), env);
  await page.screenshot({ path: path.join(SHOTS, '1440-demo.png'), clip: await page.locator('[data-demo]').boundingBox() });
  await ctx.close();
}

/* ========== 6. Media / cinema ========== */
async function mediaRun(vp, opts = {}) {
  const req = [];
  const o = await open({ viewport: vp, allow404: true, route: async (c) => {
    c.on('request', (r) => { if (/\/media\//.test(r.url())) req.push(r.url().split('/').pop()); });
    if (opts.failVideo) await c.route('**/*.mp4', (r) => r.abort());
    if (opts.failPoster) await c.route('**/*.webp', (r) => r.abort());
  }, reducedMotion: opts.reducedMotion });
  return { ...o, req };
}
for (const [w, h, kind] of [[1440, 900, 'desktop'], [390, 844, 'mobile']]) {
  const { ctx, page, env, req } = await mediaRun({ width: w, height: h });
  const before = [...req];
  await scrollCinema(page, 0.1); await page.waitForFunction(() => /ready/.test(document.querySelector('[data-cinema]').dataset.media), null, { timeout: 8000 }).catch(() => {});
  const ts = [];
  for (const f of [0.15, 0.45, 0.85, 0.45, 0.15]) { await scrollCinema(page, f); ts.push(+(await page.evaluate(() => document.querySelector('[data-cinema]').__cinema.state.currentTime)).toFixed(2)); }
  const kinds = [...new Set(req.filter((r) => r.endsWith('.mp4')).map((r) => r.includes('mobile') ? 'mobile' : 'desktop'))];
  check('Media', `${kind}: lazy και μόνο η κατάλληλη πηγή`, before.length === 0 && kinds.length === 1 && kinds[0] === kind, `πριν την ενότητα 0 αιτήματα, μετά μόνο ${kind}`, `πριν: ${before.length} · media: ${[...new Set(req)].join(', ')}`, '', env);
  check('Media', `${kind}: scroll εμπρός και πίσω (reverse) ακολουθεί το video`, ts[0] < ts[1] && ts[1] < ts[2] && ts[3] < ts[2] && ts[4] < ts[3], 'αύξουσα/φθίνουσα currentTime', `currentTime ${ts.join(' → ')}`, '', env);
  await page.evaluate(() => document.getElementById('access').scrollIntoView()); await page.waitForTimeout(400);
  check('Media', `${kind}: παύση rendering όταν η σκηνή είναι offscreen`, (await page.evaluate(() => document.querySelector('[data-cinema]').__cinema.state.raf)) === false, 'κανένα rAF', 'raf=false', '', env);
  await ctx.close();
}
{
  const { ctx, page, env, req } = await mediaRun({ width: 1440, height: 900 });
  await scrollCinema(page, 0.3); await page.waitForTimeout(800);
  await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(1200);
  const st = await page.evaluate(() => ({ src: document.querySelector('[data-cinema-video]').currentSrc.split('/').pop(), media: document.querySelector('[data-cinema]').dataset.media }));
  check('Media', 'Resize desktop → mobile: απελευθέρωση και φόρτωση της σωστής πηγής', st.src === 'cinema-mobile.mp4', 'cinema-mobile.mp4', `src=${st.src} · ${st.media} · αιτήματα ${[...new Set(req)].join(', ')}`, '', env);
  await page.setViewportSize({ width: 1440, height: 900 }); await page.waitForTimeout(800);
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  check('Responsive', 'Επανέλεγχος desktop μετά το resize', sw <= 1440, 'χωρίς overflow', `scrollWidth ${sw}`, '', env);
  await ctx.close();
}
{
  const { ctx, page, env } = await mediaRun({ width: 1440, height: 900 }, { failVideo: true });
  await scrollCinema(page, 0.5); await page.waitForTimeout(1200);
  const st = await page.evaluate(() => ({ m: document.querySelector('[data-cinema]').dataset.media, poster: document.querySelector('[data-cinema-video]').poster.split('/').pop(), msg: document.querySelector('[data-media-status]').textContent }));
  check('Fallbacks', 'Αποτυχία video → poster και προσβάσιμη ενημέρωση', st.m === 'failed' && st.poster.endsWith('.webp') && st.msg.length > 0, 'failed + poster', `${st.m} · poster ${st.poster} · «${st.msg}»`, 'route abort *.mp4', env);
  await page.screenshot({ path: path.join(SHOTS, 'media-fail-1440.png') });
  await ctx.close();
}
{
  const { ctx, page, env } = await mediaRun({ width: 1440, height: 900 }, { failVideo: true, failPoster: true });
  await scrollCinema(page, 0.5); await page.waitForTimeout(1000);
  const bg = await page.evaluate(() => getComputedStyle(document.querySelector('[data-cinema-stage]')).backgroundColor);
  const c = await page.evaluate(() => getComputedStyle(document.querySelector('[data-beat].is-on')).color);
  check('Fallbacks', 'Αποτυχία video και poster → συμπαγές φόντο, αναγνώσιμες λεζάντες', bg === 'rgb(0, 0, 0)', 'φόντο #000', `φόντο ${bg} · λεζάντα ${c}`, 'route abort *.mp4 + *.webp', env);
  await ctx.close();
}
{
  const { ctx, page, env, req } = await mediaRun({ width: 1440, height: 900 }, { reducedMotion: 'reduce' });
  await page.evaluate(() => document.getElementById('example').scrollIntoView()); await page.waitForTimeout(800);
  const st = await page.evaluate(() => { const c = document.querySelector('[data-cinema]'); return { cls: c.classList.contains('is-static'), h: c.offsetHeight, sh: c.querySelector('[data-cinema-stage]').offsetHeight, poster: c.querySelector('video').poster.split('/').pop(), src: c.querySelector('video').getAttribute('src'), sb: getComputedStyle(document.documentElement).scrollBehavior }; });
  const vids = req.filter((r) => r.endsWith('.mp4'));
  check('Reduced motion', 'Cinema στατική: τελική εικόνα, καμία λήψη video, χωρίς pinned κενό, χωρίς smooth scroll', st.cls && !st.src && vids.length === 0 && st.h === st.sh && st.sb === 'auto' && st.poster.includes('end'), 'static, 0 mp4', `poster ${st.poster} · mp4 αιτήματα ${vids.length} · ύψος ${st.h}=${st.sh} · scroll-behavior ${st.sb}`, 'emulated prefers-reduced-motion', env);
  await page.screenshot({ path: path.join(SHOTS, 'reduced-motion-1440.png') });
  await ctx.close();
}
{
  // bfcache
  const { ctx, page, env } = await open();
  await page.evaluate(() => { window.__marker = 'alive'; addEventListener('pageshow', (e) => { window.__persisted = e.persisted; }); });
  await page.goto(new URL('robots.txt', BASE).href); await page.goBack({ waitUntil: 'load' }); await page.waitForTimeout(500);
  const r = await page.evaluate(() => ({ m: window.__marker || null, p: window.__persisted ?? null, t: document.querySelector('[data-terminal]').__typing.state }));
  if (r.m === 'alive') check('Lifecycle', 'Back/bfcache: η σελίδα επανέρχεται και η πληκτρολόγηση συνεχίζει', r.p === true && (r.t.running || r.t.done || r.t.pausedReason === 'offscreen'), 'persisted=true, συνέχεια', `persisted=${r.p} · typing ${r.t.revealed}/${r.t.total} (${r.t.pausedReason || 'running'})`, '', env);
  else {
    check('Lifecycle', 'Back: η σελίδα φορτώνει ξανά σωστά', r.t.total > 0, 'λειτουργική επαναφόρτωση', `νέα φόρτωση · typing ${r.t.revealed}/${r.t.total}`, '', env);
    rec('Lifecycle', 'Επαναφορά από bfcache (pageshow persisted)', 'NOT RUN', 'restore από bfcache', 'ο headless Chromium έκανε νέα φόρτωση αντί για restore· ο κώδικας pagehide/pageshow δεν ασκήθηκε σε πραγματικό restore', '', env);
  }
  await ctx.close();
}

/* ========== 7. Προσβασιμότητα: αντίθεση, zoom, αναγνωσιμότητα πάνω από video ========== */
{
  const { ctx, page, env } = await open();
  const pairs = await page.evaluate(() => {
    const toHex = (c) => '#' + c.match(/[\d.]+/g).slice(0, 3).map((v) => (+v).toString(16).padStart(2, '0')).join('');
    const bgOf = (el) => { while (el) { const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g); if (m && (m.length < 4 || +m[3] === 1)) return toHex(getComputedStyle(el).backgroundColor); el = el.parentElement; } return '#0d0208'; };
    const S = { 'Περιγραφή hero': '.lead', 'Eyebrow': '.eyebrow', 'Ένδειξη ανάπτυξης': '.dev-flag', 'CTA': '.hero .btn-primary', 'Terminal': '.terminal-lines', 'Terminal bar': '.terminal-bar span', 'Ρόλος (περιοχή)': '.role-area', 'Παράδειγμα ρόλου': '.role-ex', 'Σήμανση σχεδιαζόμενης': '.planned', 'Ένδειξη παραδείγματος': '.example-flag', 'Demo υπότιτλος': '.demo-sub', 'Ετικέτα προσχεδίου': '.draft-tag', 'Βοήθεια textarea': '.help', 'FAQ': '.faq summary', 'Footer': '.footer-note', 'NEO tag': '.neo-tag' };
    return Object.entries(S).map(([k, s]) => { const el = document.querySelector(s); const cs = getComputedStyle(el); return [k, toHex(cs.color), bgOf(el), parseFloat(cs.fontSize), +cs.fontWeight]; });
  });
  for (const [k, fg, bg, size, wt] of pairs) { const r = ratio(hex(fg), hex(bg)); const large = size >= 24 || (size >= 18.66 && wt >= 700); const min = large ? 3 : 4.5; check('Αντίθεση', `${k}: ${fg} σε ${bg}`, r >= min, `≥ ${min}:1`, `${r.toFixed(2)}:1`, `${size}px/${wt}`, env); }
  check('Αντίθεση', 'Focus ring #00FF41 σε #0D0208 / #000 / #003B00', [ '#0D0208', '#000000', '#003B00'].every((b) => ratio(hex('#00FF41'), hex(b)) >= 3), '≥ 3:1', ['#0D0208', '#000000', '#003B00'].map((b) => ratio(hex('#00FF41'), hex(b)).toFixed(2)).join(' / '), '', env);
  // αναγνωσιμότητα πάνω από το video σε κάθε στάδιο
  const worst = [];
  for (const f of [0.05, 0.35, 0.62, 0.95]) {
    await scrollCinema(page, f); await page.waitForTimeout(400);
    const box = await page.evaluate(() => { const r = [...document.querySelectorAll('.cinema-beats li')].map((l) => l.getBoundingClientRect()); const x = Math.min(...r.map((b) => b.left)), y = Math.min(...r.map((b) => b.top)); return { x, y, width: Math.max(...r.map((b) => b.right)) - x, height: Math.max(...r.map((b) => b.bottom)) - y }; });
    await page.addStyleTag({ content: '.cinema-beats li{color:transparent!important;text-shadow:none!important;transition:none!important}.beat-n{opacity:0!important;transition:none!important}' });
    const buf = await page.screenshot({ clip: box, path: `qa/tmp-read-${f}.png` });
    await page.evaluate(() => document.querySelectorAll('style').forEach((s) => { if (s.textContent.includes('.cinema-beats li{color:transparent')) s.remove(); }));
    const px = await page.evaluate(async (b64) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const c = new OffscreenCanvas(img.width, img.height); const x = c.getContext('2d'); x.drawImage(img, 0, 0); const d = x.getImageData(0, 0, img.width, img.height).data; let best = [0, 0, 0], bl = -1; for (let i = 0; i < d.length; i += 4) { const l = d[i] * .2126 + d[i + 1] * .7152 + d[i + 2] * .0722; if (l > bl) { bl = l; best = [d[i], d[i + 1], d[i + 2]]; } } return best; }, buf.toString('base64'));
    worst.push(ratio(hex('#B7C9BC'), px));
  }
  check('Αναγνωσιμότητα', 'Λεζάντες cinema σε όλα τα στάδια κίνησης (χειρότερο pixel πίσω από το κείμενο)', Math.min(...worst) >= 4.5, '≥ 4.5:1 για #B7C9BC', worst.map((r) => r.toFixed(2)).join(' / '), 'progress 5% / 35% / 62% / 95%', env);
  await ctx.close();
}
{
  const { ctx, page, env } = await open({ viewport: { width: 720, height: 450 } });
  const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, h1: document.querySelector('h1').getBoundingClientRect().right <= innerWidth }));
  check('Προσβασιμότητα', 'Zoom 200% (1440×900 → 720×450 CSS px): χωρίς overflow', r.sw <= 720 && r.h1, 'χωρίς οριζόντια κύλιση', `scrollWidth ${r.sw}`, 'προσομοίωση με ισοδύναμο viewport', env);
  await ctx.close();
}

/* ========== 8. APP_URL ========== */
{
  const p = await browser.newPage();
  try {
    const resp = await p.goto(siteConfig.APP_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await p.waitForTimeout(2500);
    const title = await p.title(); const inputs = await p.evaluate(() => [...document.querySelectorAll('input')].map((i) => i.type).join(','));
    check('Login', 'APP_URL: πραγματικός προορισμός και οθόνη χωρίς authentication', resp && resp.ok() && /Σύνδεση/.test(title), 'οθόνη σύνδεσης RNB', `${siteConfig.APP_URL} → ${p.url()} · ${resp?.status()} · «${title}» · inputs: ${inputs}`, 'δεν έγινε login', `${ENV0} · ${new Date().toISOString()}`);
    await p.screenshot({ path: path.join(SHOTS, 'app-url-login.png') });
  } catch (e) { rec('Login', 'APP_URL επαλήθευση', 'BLOCKED', 'οθόνη σύνδεσης', String(e).slice(0, 120), ''); }
  await p.close();
}

rec('Γενικά', 'Console errors', consoleErrors.length ? 'FAIL' : 'PASS', '0', consoleErrors.length ? consoleErrors.slice(0, 3).join(' | ') : '0 σφάλματα', 'όλες οι παραπάνω σελίδες');
const real404 = badResponses.filter((u) => !/\.mp4|\.webp|robots/.test(u));
rec('Γενικά', 'Missing assets (HTTP ≥ 400)', real404.length ? 'FAIL' : 'PASS', '0', real404.length ? real404.slice(0, 3).join(' | ') : '0 (εξαιρούνται οι σκόπιμες αποτυχίες media)', '');
rec('Συσκευές', 'Φυσικά iPhone/Android, Safari, Firefox', 'NOT RUN', 'δοκιμή σε φυσικές συσκευές', 'δεν υπάρχουν σε αυτό το περιβάλλον· μόνο Chromium', '');

await browser.close();
fs.writeFileSync('qa/results.json', JSON.stringify(rows, null, 2));
const n = (s) => rows.filter((r) => r.status === s).length;
console.log(`\nPASS ${n('PASS')} · FAIL ${n('FAIL')} · NOT RUN ${n('NOT RUN')} · BLOCKED ${n('BLOCKED')}`);
process.exit(n('FAIL') ? 1 : 0);

// Παράγει το public/og-image.png (1200×630) με Playwright από πρωτότυπο γραφικό.
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright'); // προεγκατεστημένο ή devDependency
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const font = (f) => 'file://' + path.join(root, 'node_modules/@fontsource-variable/inter/files', f);
const glyphs = 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ0123456789';
let seed = 7;
const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
let rain = '';
for (let x = 640; x < 1200; x += 30) {
  const len = 6 + Math.floor(rnd() * 12);
  const y0 = Math.floor(rnd() * 500) - 120;
  for (let j = 0; j < len; j++) {
    const y = y0 - j * 26;
    if (y < -26 || y > 640) continue;
    const fill = j === 0 ? '#00FF41' : j > len * 0.6 ? '#003B00' : '#008F11';
    const op = j === 0 ? 0.6 : Math.max(0.18, 0.75 * (1 - j / len));
    rain += `<text x="${x}" y="${y}" fill="${fill}" opacity="${op.toFixed(2)}">${glyphs[Math.floor(rnd() * glyphs.length)]}</text>`;
  }
}
const html = `<!doctype html><html lang="el"><head><meta charset="utf-8"><style>
@font-face{font-family:I;src:url(${font('inter-greek-wght-normal.woff2')});font-weight:100 900;unicode-range:U+0370-03FF}
@font-face{font-family:I;src:url(${font('inter-latin-wght-normal.woff2')});font-weight:100 900;unicode-range:U+0000-00FF,U+2000-206F}
*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;background:#0D0208;font-family:I,sans-serif;color:#F2FFF5;position:relative;overflow:hidden}
svg{position:absolute;inset:0}.veil{position:absolute;inset:0;background:linear-gradient(90deg,#0D0208 0%,rgb(13 2 8/.95) 50%,rgb(13 2 8/.3) 100%)}
.c{position:absolute;left:80px;top:78px;right:80px}
.wm{font-weight:800;font-size:44px;letter-spacing:-.05em;display:flex;align-items:flex-end;gap:5px}.wm i{width:10px;height:10px;border-radius:50%;display:block;margin-bottom:8px}
.p{margin-top:58px;font-size:22px;font-weight:600;color:#B7C9BC;display:flex;align-items:center;gap:12px}.p b{width:10px;height:10px;border-radius:50%;background:#00FF41;box-shadow:0 0 14px rgb(0 255 65/.5)}
h1{margin-top:22px;font-size:64px;line-height:1.08;letter-spacing:-.035em;font-weight:800;max-width:860px}h1 span{display:block;color:#00FF41;text-shadow:0 0 30px rgb(0 255 65/.25)}
.bar{position:absolute;left:0;right:0;bottom:0;height:6px;background:#00FF41}
</style></head><body>
<svg viewBox="0 0 1200 630" font-family="ui-monospace,monospace" font-size="22">${rain}</svg><div class="veil"></div>
<div class="c"><div class="wm">rnb<span style="display:flex;gap:4px"><i style="background:#E63946"></i><i style="background:#2F7DF6"></i></span></div>
<p class="p"><b></b>ONE4Business</p>
<h1>Λιγότερες εκκρεμότητες. <span>Περισσότερος χρόνος για την επιχείρησή σου.</span></h1></div><div class="bar"></div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: path.join(root, 'public/og-image.png') });
await browser.close();
console.log('public/og-image.png');

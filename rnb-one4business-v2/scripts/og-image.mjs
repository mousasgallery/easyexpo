// public/og-image.png 1200×630: logo RNB, H1 και terminal με τα hooks (πρωτότυπο γραφικό).
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { HOOKS } from '../src/content/copy.js';
const { chromium } = createRequire(import.meta.url)('playwright');
const f = (p) => 'file://' + path.resolve('node_modules', p);
const logo = fs.readFileSync('public/brand/rnb-logo.svg', 'utf8');
const html = `<!doctype html><html lang="el"><head><meta charset="utf-8"><style>
@font-face{font-family:I;src:url(${f('@fontsource-variable/inter/files/inter-greek-wght-normal.woff2')});font-weight:100 900;unicode-range:U+0370-03FF}
@font-face{font-family:I;src:url(${f('@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')});font-weight:100 900;unicode-range:U+0000-00FF,U+2000-206F}
@font-face{font-family:M;src:url(${f('@fontsource/jetbrains-mono/files/jetbrains-mono-greek-400-normal.woff2')});unicode-range:U+0370-03FF}
@font-face{font-family:M;src:url(${f('@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2')});unicode-range:U+0000-00FF,U+2000-206F}
*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;background:#0D0208;color:#F2FFF5;font-family:I;position:relative;overflow:hidden}
.g{position:absolute;inset:0;background:radial-gradient(60% 80% at 82% 45%,rgba(0,59,0,.55),transparent 70%)}
.top{position:absolute;left:64px;top:56px;display:flex;align-items:center;gap:16px}.top svg{height:40px;width:auto}.top b{font-size:24px;border-left:2px solid #008F11;padding-left:16px}
h1{position:absolute;left:64px;top:160px;width:560px;font-size:56px;line-height:1.08;letter-spacing:-.035em;font-weight:800}
.t{position:absolute;right:56px;top:150px;width:470px;background:#000;border:1px solid #008F11;border-radius:14px;box-shadow:0 0 34px rgba(0,255,65,.2)}
.bar{display:flex;gap:6px;align-items:center;padding:10px 14px;border-bottom:1px solid #003B00;font:12px M;color:#B7C9BC}.bar i{width:9px;height:9px;border:1px solid #008F11;border-radius:50%}.bar span{margin-left:auto}
.b{padding:22px 24px;font:17px/1.7 M;color:#00FF41;text-shadow:0 0 8px rgba(0,255,65,.4);display:grid;gap:12px}.c{display:inline-block;width:.6em;height:1.1em;background:#00FF41;vertical-align:-.2em}
.f{position:absolute;left:64px;bottom:52px;color:#B7C9BC;font-size:20px}
</style></head><body><div class="g"></div><div class="top">${logo}<b>ONE4Business</b></div>
<h1>Λιγότερες εκκρεμότητες. Περισσότερος χρόνος για την επιχείρησή σου.</h1>
<div class="t"><div class="bar"><i></i><i></i><i></i><span>NEO · ONE4Business</span></div><div class="b">${HOOKS.map((h, i) => `<p>${h}${i === 2 ? '<span class="c"></span>' : ''}</p>`).join('')}</div></div>
<p class="f">Παρουσίαση προϊόντος υπό ανάπτυξη</p></body></html>`;
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(html, { waitUntil: 'load' }); await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: 'public/og-image.png' }); await b.close();
console.log('og-image.png', fs.statSync('public/og-image.png').size);

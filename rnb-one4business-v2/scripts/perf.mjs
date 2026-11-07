// Απόδοση κινητού: Lighthouse 12.6 (devtools throttling: CPU ×4, ~1,6 Mbps, RTT 150 ms) + bytes media με throttling στο Playwright.
// Προσθέτει γραμμές στο qa/results.json. Εργαστηριακά δεδομένα, όχι field.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const BASE = process.env.QA_URL || 'http://localhost:4175/';
const chrome = execSync("find /opt/pw-browsers -path '*chromium-*' -name chrome -type f | head -1").toString().trim();
fs.mkdirSync('qa/lighthouse', { recursive: true });
execSync(`npx -y lighthouse@12.6.0 ${BASE} --form-factor=mobile --throttling-method=devtools --only-categories=performance --chrome-flags="--headless=new --no-sandbox" --output=json --output-path=qa/lighthouse/mobile-devtools.json --quiet`, { env: { ...process.env, CHROME_PATH: chrome }, stdio: 'inherit' });
const r = JSON.parse(fs.readFileSync('qa/lighthouse/mobile-devtools.json', 'utf8'));
const a = r.audits, v = (k) => a[k].numericValue;
const items = a['network-requests'].details.items;
const bytes = items.reduce((s, i) => s + (i.transferSize || 0), 0);
const media = items.filter((i) => /\/media\//.test(i.url)).length;
const commit = execSync('git rev-parse --short HEAD').toString().trim();
const env = `Lighthouse 12.6.0 · ${r.environment.hostUserAgent.match(/HeadlessChrome\/[\d.]+/)[0]} · mobile 412×823 DPR 1.75 · devtools throttling CPU ×4, ${Math.round(r.configSettings.throttling.downloadThroughputKbps)} kbps, RTT ${r.configSettings.throttling.rttMs} ms · localhost · commit ${commit}`;
const rows = JSON.parse(fs.readFileSync('qa/results.json', 'utf8')).filter((x) => x.area !== 'Απόδοση');
const add = (name, ok, exp, act, ev) => rows.push({ area: 'Απόδοση', name, status: ok ? 'PASS' : 'FAIL', expected: exp, actual: act, evidence: ev, env });
add('LCP (εργαστήριο, κινητό)', v('largest-contentful-paint') <= 2500, '≤ 2,5 s', `${(v('largest-contentful-paint') / 1000).toFixed(2)} s (στοιχείο: H1)`, 'qa/lighthouse/mobile-devtools.json');
add('CLS (εργαστήριο, κινητό)', v('cumulative-layout-shift') <= 0.1, '≤ 0,1', v('cumulative-layout-shift').toFixed(3), 'qa/lighthouse/mobile-devtools.json');
add('TBT (εργαστήριο, κινητό)', v('total-blocking-time') <= 200, '≤ 200 ms', `${Math.round(v('total-blocking-time'))} ms`, 'qa/lighthouse/mobile-devtools.json');
add('Αρχική μεταφορά και media requests στη φόρτωση', media === 0, 'καμία λήψη media πριν την ενότητα', `${items.length} αιτήματα · ${(bytes / 1024).toFixed(1)} KB · media: ${media}`, 'network-requests');

// Bytes media όταν ο επισκέπτης φτάσει στο #example, με throttling (Pixel-like 412×823)
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 412, height: 823 }, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await cdp.send('Network.enable');
await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1474560 / 8, uploadThroughput: 675000 / 8 });
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
const sizes = {};
cdp.on('Network.loadingFinished', (e) => { sizes[e.requestId] = e.encodedDataLength; });
const urls = {};
cdp.on('Network.requestWillBeSent', (e) => { urls[e.requestId] = e.request.url; });
await p.goto(BASE, { waitUntil: 'networkidle' });
await p.evaluate(() => document.getElementById('example').scrollIntoView());
await p.waitForFunction(() => /ready/.test(document.querySelector('[data-cinema]').dataset.media), null, { timeout: 30000 });
await p.waitForTimeout(3000);
const m = Object.entries(urls).filter(([, u]) => /\/media\//.test(u)).map(([id, u]) => `${u.split('/').pop()} ${((sizes[id] || 0) / 1024).toFixed(0)} KB`);
const desk = Object.values(urls).some((u) => /desktop/.test(u));
add('Media στο #example (κινητό, throttling)', !desk && m.length > 0, 'μόνο mobile video + poster', m.join(' · '), 'CDP Network', );
rows.at(-1).env = `Chromium ${b.version()} · 412×823 isMobile · CDP: CPU ×4, 1,47 Mbps, latency 150 ms · commit ${commit}`;
await b.close();
fs.writeFileSync('qa/results.json', JSON.stringify(rows, null, 2));
rows.filter((x) => x.area === 'Απόδοση').forEach((x) => console.log(x.status, x.name, '—', x.actual));

// Καταγραφή οθόνης της πραγματικής πληκτρολόγησης των hooks (desktop 1440×900 και κινητό 390×844).
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const BASE = process.env.QA_URL || 'http://localhost:4175/';
fs.mkdirSync('qa/recordings', { recursive: true });
const b = await chromium.launch();
for (const [w, h, name] of [[1440, 900, 'desktop'], [390, 844, 'mobile']]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, recordVideo: { dir: 'qa/recordings/tmp', size: { width: w, height: h } } });
  const p = await ctx.newPage();
  await p.goto(BASE, { waitUntil: 'networkidle' });
  if (name === 'mobile') await p.evaluate(() => document.querySelector('[data-terminal]').scrollIntoView({ block: 'center', behavior: 'instant' }));
  await p.waitForFunction(() => document.querySelector('[data-terminal]').__typing.state.done, null, { timeout: 30000 });
  await p.waitForTimeout(1500);
  const vid = await p.video().path();
  await ctx.close();
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', vid, '-c:v', 'libx264', '-crf', '28', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `qa/recordings/typing-${name}-${w}x${h}.mp4`]);
  console.log(`qa/recordings/typing-${name}-${w}x${h}.mp4`, fs.statSync(`qa/recordings/typing-${name}-${w}x${h}.mp4`).size);
}
fs.rmSync('qa/recordings/tmp', { recursive: true, force: true });
await b.close();

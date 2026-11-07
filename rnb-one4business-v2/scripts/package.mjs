// release/: source ZIP (git archive του commit, χωρίς node_modules/μυστικά) + MANIFEST.json με SHA-256 όλων των παραδοτέων.
import { execSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
const commit = execSync('git rev-parse --short HEAD').toString().trim();
const name = `rnb-one4business-v2_${commit}`;
fs.mkdirSync('release', { recursive: true });
execSync(`git archive --format=zip --prefix=${name}/ -o release/${name}-source.zip HEAD:rnb-one4business-v2`, { cwd: '.' });
const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const files = [`release/${name}-source.zip`, ...['dist-single/index.html', 'dist-drive/index.html'].filter(fs.existsSync),
  ...fs.readdirSync('qa/screenshots').map((f) => `qa/screenshots/${f}`), ...fs.readdirSync('qa/recordings').map((f) => `qa/recordings/${f}`),
  'qa/results.json', 'qa/lighthouse/mobile-devtools.json', 'docs/QA-REPORT.md', 'docs/STORYBOARD.md', 'docs/storyboard.html', 'docs/style-tile.html', 'docs/ASSETS.md', 'docs/ROLLBACK.md', 'docs/RNB-004_RNB-010_entry.md', 'README.md',
  ...fs.readdirSync('media-src').map((f) => `media-src/${f}`), ...fs.readdirSync('public/media').map((f) => `public/media/${f}`)];
const zipList = execSync(`unzip -Z1 release/${name}-source.zip`).toString().split('\n').filter(Boolean);
const bad = zipList.filter((f) => /node_modules|\.env|secret|token/i.test(f));
const manifest = { name, commit, created: new Date().toISOString(), branch: 'claude/rnb-landing-page-matrix-5e5lxa', zipEntries: zipList.length, zipForbidden: bad, files: files.map((f) => ({ path: f, bytes: fs.statSync(f).size, sha256: sha(f) })) };
fs.writeFileSync('release/MANIFEST.json', JSON.stringify(manifest, null, 2));
console.log(name, 'zip entries', zipList.length, 'forbidden', bad.length, 'files', files.length);

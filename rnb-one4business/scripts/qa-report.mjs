// Μετατρέπει το qa/results.json σε docs/QA-REPORT.md.
import fs from 'node:fs';
const rows = JSON.parse(fs.readFileSync('qa/results.json', 'utf8'));
const count = (s) => rows.filter((r) => r.status === s).length;
const env = process.env.QA_ENV || 'Chromium (Playwright), localhost';
let md = `# QA · RNB ONE4Business landing v1.0.0\n\nΗμερομηνία: ${new Date().toLocaleDateString('el-GR')} · Περιβάλλον: ${env}\n\n`;
md += `**PASS ${count('PASS')} · FAIL ${count('FAIL')} · BLOCKED ${count('BLOCKED')} · NOT RUN ${count('NOT RUN')}**\n\n`;
md += 'Μέθοδος: `npm run build && npm run preview` και `QA_PAGES_URL=… npm run qa` (για τον έλεγχο Cloudflare: `wrangler pages dev dist`). Όλες οι μετρήσεις viewport είναι προσομοιώσεις Chromium, όχι φυσικές συσκευές.\n\n';
const areas = [...new Set(rows.map((r) => r.area))];
for (const a of areas) {
  md += `## ${a}\n\n| Κατάσταση | Έλεγχος | Τεκμήριο |\n|---|---|---|\n`;
  for (const r of rows.filter((x) => x.area === a)) md += `| ${r.status} | ${r.name.replace(/\|/g, '/')} | ${String(r.evidence || '').replace(/\|/g, '/').slice(0, 220)} |\n`;
  md += '\n';
}
fs.writeFileSync('docs/QA-REPORT.md', md);
console.log('docs/QA-REPORT.md', rows.length);

// qa/results.json → docs/QA-REPORT.md
import fs from 'node:fs';
const rows = JSON.parse(fs.readFileSync('qa/results.json', 'utf8'));
const n = (s) => rows.filter((r) => r.status === s).length;
const esc = (s) => String(s ?? '').replace(/\|/g, '/').replace(/\n/g, ' ');
let md = `# QA · ONE4Business landing v2\n\nΗμερομηνία: ${new Date().toISOString().slice(0, 10)} · Μέθοδος: Playwright (Chromium, headless) σε vite preview (localhost), Lighthouse 12.6 για την απόδοση. Εργαστηριακά αποτελέσματα, όχι field δεδομένα. Οι έλεγχοι αντίθεσης δεν αποτελούν πιστοποίηση WCAG.\n\n**PASS ${n('PASS')} · FAIL ${n('FAIL')} · NOT RUN ${n('NOT RUN')} · BLOCKED ${n('BLOCKED')}**\n\n`;
for (const a of [...new Set(rows.map((r) => r.area))]) {
  md += `## ${a}\n\n| Κατάσταση | Έλεγχος | Αναμενόμενο | Πραγματικό | Τεκμήριο | Περιβάλλον |\n|---|---|---|---|---|---|\n`;
  for (const r of rows.filter((x) => x.area === a)) md += `| ${r.status} | ${esc(r.name)} | ${esc(r.expected)} | ${esc(r.actual).slice(0, 260)} | ${esc(r.evidence).slice(0, 120)} | ${esc(r.env)} |\n`;
  md += '\n';
}
fs.writeFileSync('docs/QA-REPORT.md', md);
console.log('docs/QA-REPORT.md', rows.length, `PASS ${n('PASS')} FAIL ${n('FAIL')} NOT RUN ${n('NOT RUN')} BLOCKED ${n('BLOCKED')}`);

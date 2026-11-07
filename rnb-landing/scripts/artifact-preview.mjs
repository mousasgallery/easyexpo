// Μετατρέπει το dist-single/index.html σε σελίδα για ιδιωτικό Artifact preview
// (ο host προσθέτει δικό του doctype/head/body, οπότε τα αφαιρούμε).
import fs from 'node:fs';
const [, , out = 'dist-single/artifact.html'] = process.argv;
let html = fs.readFileSync('dist-single/index.html', 'utf8');
html = html
  .replace(/<!doctype html>/i, '')
  .replace(/<\/?html[^>]*>/gi, '')
  .replace(/<\/?head>/gi, '')
  .replace(/<body>/i, '')
  .replace(/<\/body>/i, '')
  .replace(/<meta charset="utf-8" \/>\s*/i, '')
  .replace(/<meta name="viewport"[^>]*>\s*/i, '')
  .replace(/<title>[^<]*<\/title>/, '<title>rnb ONE4Business</title>\n<script>document.documentElement.lang = "el";</script>');
fs.writeFileSync(out, html.trim() + '\n');
console.log(out, (html.length / 1024).toFixed(0) + ' KB');

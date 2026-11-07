import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import fs from 'node:fs';
import { siteConfig } from './site.config.js';
import { HOOKS, TERMINAL_TITLE, DEMO } from './src/content/copy.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const logo = () => fs.readFileSync('public/brand/rnb-logo.svg', 'utf8').replace('<svg ', '<svg focusable="false" ').replace(' role="img" aria-label="RNB"', '');

/** Εισάγει config, logo και κείμενα από το src/content/copy.js στο HTML (μία πηγή, διαθέσιμο και χωρίς JS). */
function siteHtml(mode) {
  const c = siteConfig;
  const publicConfig = { APP_URL: c.APP_URL, SITE_MODE: c.SITE_MODE, ENABLE_ANALYTICS: c.ENABLE_ANALYTICS, MEDIA: c.MEDIA };
  if (mode === 'drive') publicConfig.MEDIA = null; // το αντίγραφο Drive δεν έχει τα αρχεία video δίπλα του
  if (mode === 'single') publicConfig.MEDIA = JSON.parse(JSON.stringify(c.MEDIA).replaceAll('"/media/', '"media/')); // σχετικά paths για ιδιωτικό preview
  const li = (arr) => arr.map((x) => `<li>${esc(x)}</li>`).join('');
  return {
    name: 'rnb-site-html',
    transformIndexHtml(html) {
      return html
        .replaceAll('{{APP_URL}}', esc(c.APP_URL))
        .replaceAll('{{LOGO}}', logo())
        .replace('{{TERMINAL_TITLE}}', esc(TERMINAL_TITLE))
        .replace('{{HOOKS_HTML}}', HOOKS.map((h) => `<p class="hook">${esc(h)}</p>`).join('\n              '))
        .replaceAll('{{DEMO_BUSINESS}}', esc(DEMO.business))
        .replaceAll('{{DEMO_CUSTOMER}}', esc(DEMO.customer))
        .replace('{{DEMO_REQUEST}}', esc(DEMO.request))
        .replace('{{DEMO_KNOWN}}', li(DEMO.known))
        .replace('{{DEMO_MISSING}}', li(DEMO.missing))
        .replace('{{DEMO_COSTTIME}}', esc(DEMO.costTime))
        .replaceAll('{{DEMO_DRAFT}}', esc(DEMO.draft))
        .replace('{{CONFIG_JSON}}', JSON.stringify(publicConfig).replace(/</g, '\\u003c'));
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: '# Preview: εκτός ευρετηρίασης\nUser-agent: *\nDisallow: /\n' });
    },
  };
}

/** Αντίγραφο Google Drive: γραμματοσειρές από Google Fonts (μικρό αρχείο), χωρίς video. */
function driveFonts() {
  return {
    name: 'rnb-drive-fonts', enforce: 'pre',
    transform(code, id) { if (id.endsWith('fonts.css')) return ''; },
    transformIndexHtml(html) {
      return html.replace(/<link rel="icon"[^>]*>/, '<link rel="preconnect" href="https://fonts.googleapis.com" />\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400..800&amp;family=JetBrains+Mono&amp;display=swap" />');
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [siteHtml(mode), ...(mode === 'drive' ? [driveFonts()] : []), ...(mode === 'single' || mode === 'drive' ? [viteSingleFile()] : [])],
  build: {
    outDir: mode === 'single' ? 'dist-single' : mode === 'drive' ? 'dist-drive' : 'dist',
    assetsInlineLimit: mode === 'single' ? 100_000_000 : 4096,
    copyPublicDir: mode !== 'single' && mode !== 'drive',
  },
}));

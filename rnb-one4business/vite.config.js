import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { siteConfig } from './site.config.js';
import { claimById, STATUS_LABELS } from './src/content/claims.js';
import pkg from './package.json' with { type: 'json' };

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const logo = () => fs.readFileSync('public/brand/rnb-logo.svg', 'utf8').replace(/<svg /, '<svg focusable="false" ').replace(/ role="img" aria-label="RNB"/, '');

/** Ενσωματώνει configuration, logo και badges ισχυρισμών στο HTML κατά το build. */
function siteHtml(mode) {
  const c = siteConfig;
  const publicConfig = {
    BRAND_NAME: c.BRAND_NAME, PRODUCT_NAME: c.PRODUCT_NAME, APP_URL: c.APP_URL,
    SITE_MODE: c.SITE_MODE, CONTACT_MODE: c.CONTACT_MODE, ENABLE_ANALYTICS: c.ENABLE_ANALYTICS,
    STORY_SEQUENCE: { ...c.STORY_SEQUENCE, enabled: mode === 'single' || mode === 'drive' ? false : c.STORY_SEQUENCE.enabled },
  };
  return {
    name: 'rnb-site-html',
    transformIndexHtml(html) {
      return html
        .replace(/\{\{CLAIM:([\w-]+)\}\}/g, (m, id) => {
          const claim = claimById[id];
          if (!claim) throw new Error(`Άγνωστος ισχυρισμός: ${id}`);
          return `<p class="badge badge-${claim.status}">${esc(STATUS_LABELS[claim.status])}</p>`;
        })
        .replaceAll('{{APP_URL}}', esc(c.APP_URL))
        .replaceAll('{{LOGO}}', logo())
        .replace('{{ROBOTS}}', c.SITE_MODE === 'production' ? 'index, follow' : 'noindex, nofollow, noarchive')
        .replace('{{CANONICAL}}', c.SITE_URL ? `<link rel="canonical" href="${esc(c.SITE_URL)}/" />\n  <meta property="og:url" content="${esc(c.SITE_URL)}/" />` : '<!-- canonical: ορίζεται μόνο για επιβεβαιωμένο τελικό host (SITE_URL) -->')
        .replace('{{OG_IMAGE}}', c.SITE_URL ? `${esc(c.SITE_URL)}/og-image.png` : '/og-image.png')
        .replace('{{CONFIG_JSON}}', JSON.stringify(publicConfig).replace(/</g, '\\u003c'));
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: c.SITE_MODE === 'production' ? 'User-agent: *\nAllow: /\n' : '# Preview: εκτός ευρετηρίασης\nUser-agent: *\nDisallow: /\n' });
    },
  };
}

const git = (cmd) => { try { return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { return '—'; } };

/** Αντίγραφο Google Drive: αυτόνομο HTML + ενότητα τεκμηρίωσης (παλέτα, ρυθμίσεις, έλεγχοι). */
function driveCopy() {
  const vars = {
    version: pkg.version,
    date: new Date().toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    commit: git('git rev-parse --short HEAD'),
    branch: git('git rev-parse --abbrev-ref HEAD'),
    appUrl: siteConfig.APP_URL,
  };
  return {
    name: 'rnb-drive-copy',
    enforce: 'pre',
    transform(code, id) {
      if (id.endsWith('fonts.css')) return '';
    },
    transformIndexHtml(html) {
      const docs = fs.readFileSync('docs/drive-section.html', 'utf8').replace('{{logo}}', logo()).replace(/\{\{(\w+)\}\}/g, (m, k) => (k in vars ? esc(vars[k]) : m));
      const fonts = '<link rel="preconnect" href="https://fonts.googleapis.com" />\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400..800&amp;family=JetBrains+Mono&amp;display=swap" />';
      return html.replace(/<link rel="icon"[^>]*>/, fonts).replace('</footer>', '</footer>\n' + docs);
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [siteHtml(mode), ...(mode === 'drive' ? [driveCopy()] : []), ...(mode === 'single' || mode === 'drive' ? [viteSingleFile()] : [])],
  build: {
    outDir: mode === 'single' ? 'dist-single' : mode === 'drive' ? 'dist-drive' : 'dist',
    assetsInlineLimit: mode === 'single' ? 100_000_000 : 4096,
    copyPublicDir: mode !== 'single' && mode !== 'drive',
  },
}));

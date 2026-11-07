import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import { siteConfig } from './site.config.js';
import pkg from './package.json' with { type: 'json' };

/** Εισάγει τιμές του site.config.js στο index.html ({{appUrl}}, {{siteUrl}}, {{robots}}). */
function siteConfigHtml() {
  const values = {
    appUrl: siteConfig.appUrl,
    siteUrl: siteConfig.siteUrl,
    robots: siteConfig.indexable ? 'index, follow' : 'noindex, nofollow, noarchive',
  };
  return {
    name: 'rnb-site-config',
    transformIndexHtml(html) {
      return html.replace(/\{\{(\w+)\}\}/g, (m, key) => (key in values ? values[key] : m));
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: siteConfig.indexable
          ? `User-agent: *\nAllow: /\n`
          : `# Προεπισκόπηση: εκτός ευρετηρίασης μέχρι τη δημόσια διάθεση\nUser-agent: *\nDisallow: /\n`,
      });
    },
  };
}

const git = (cmd, fallback) => { try { return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { return fallback; } };

/**
 * Αντίγραφο για το Google Drive (mode "drive"): ένα αυτόνομο, αναγνώσιμο HTML
 * με την ενότητα εσωτερικής τεκμηρίωσης (παλέτα, τυπογραφία, ρυθμίσεις, έλεγχοι).
 * Η Inter φορτώνεται από Google Fonts ώστε το αρχείο να μένει μικρό.
 */
function driveCopy() {
  const vars = {
    version: pkg.version,
    date: new Date().toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    commit: git('git rev-parse --short HEAD', '—'),
    branch: git('git rev-parse --abbrev-ref HEAD', '—'),
    appUrl: siteConfig.appUrl,
    siteUrl: siteConfig.siteUrl,
    indexing: siteConfig.indexable ? 'Ενεργή' : 'Ανενεργή (noindex) μέχρι τη δημόσια διάθεση',
  };
  return {
    name: 'rnb-drive-copy',
    enforce: 'pre',
    transform(code, id) {
      if (id.endsWith('styles.css')) return code.replace(/@font-face\s*\{[^}]*\}/g, '');
    },
    transformIndexHtml(html) {
      const docs = fs.readFileSync('drive/docs-section.html', 'utf8').replace(/\{\{(\w+)\}\}/g, (m, k) => (k in vars ? vars[k] : m));
      const fonts = '<link rel="preconnect" href="https://fonts.googleapis.com" />\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400..800&amp;display=swap" />\n';
      return html
        .replace(/<link rel="icon"[^>]*>\s*/, fonts)
        .replace('</footer>', '</footer>\n' + docs);
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [
    siteConfigHtml(),
    ...(mode === 'drive' ? [driveCopy()] : []),
    ...(mode === 'single' || mode === 'drive' ? [viteSingleFile()] : []),
  ],
  build: {
    outDir: mode === 'single' ? 'dist-single' : mode === 'drive' ? 'dist-drive' : 'dist',
    assetsInlineLimit: mode === 'single' ? 100_000_000 : 4096,
    copyPublicDir: mode !== 'drive',
  },
}));

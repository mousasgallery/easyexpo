import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { siteConfig } from './site.config.js';

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

export default defineConfig(({ mode }) => ({
  plugins: [siteConfigHtml(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  build: {
    outDir: mode === 'single' ? 'dist-single' : 'dist',
    assetsInlineLimit: mode === 'single' ? 100_000_000 : 4096,
  },
}));

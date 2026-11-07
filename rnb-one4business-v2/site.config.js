/**
 * Κεντρικό configuration. Κανένα μυστικό: ό,τι μπαίνει εδώ καταλήγει στο δημόσιο bundle.
 * APP_URL: επαληθεύεται σε κάθε QA (scripts/qa.mjs) χωρίς authentication.
 */
const env = (typeof process !== 'undefined' && process.env) || {};
export const siteConfig = {
  BRAND_NAME: 'RNB',
  PRODUCT_NAME: 'ONE4Business',
  APP_URL: env.RNB_APP_URL || 'https://rnb-alpha.lovable.app/login',
  /** Κενό: δεν υπάρχει επιβεβαιωμένος δημόσιος host → χωρίς canonical / og:url / απόλυτα asset URLs. */
  SITE_URL: '',
  SITE_MODE: 'preview', // noindex
  ENABLE_ANALYTICS: false,
  /** Cinema assets (Higgsfield jobs b7a0ea6d… / 2245cbee…), επανακωδικοποιημένα χωρίς upscale. */
  MEDIA: {
    mobileQuery: '(max-width: 760px)',
    desktop: { video: '/media/cinema-desktop.mp4', poster: '/media/cinema-desktop-start.webp', end: '/media/cinema-desktop-end.webp' },
    mobile: { video: '/media/cinema-mobile.mp4', poster: '/media/cinema-mobile-start.webp', end: '/media/cinema-mobile-end.webp' },
  },
};

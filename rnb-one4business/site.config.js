/**
 * Κεντρικό configuration (brief v1.2 §8). Όλα τα URLs και οι διακόπτες ορίζονται ΜΟΝΟ εδώ.
 * Παράκαμψη χωρίς αλλαγή κώδικα με μεταβλητές περιβάλλοντος κατά το build.
 * Κανένα secret σε αυτό το αρχείο: ό,τι μπαίνει εδώ καταλήγει στο δημόσιο bundle.
 */
const env = (typeof process !== 'undefined' && process.env) || {};

export const siteConfig = {
  BRAND_NAME: 'RNB',
  PRODUCT_NAME: 'ONE4Business',
  /** Επαληθεύτηκε 07/11/2026: 302 → https://rnb.gr/login (200, «Σύνδεση · rnb»). Χωρίς login. */
  APP_URL: env.RNB_APP_URL || 'https://rnb-alpha.lovable.app/login',
  /** Κενό μέχρι να επιβεβαιωθεί ο τελικός host: τότε μόνο μπαίνουν canonical και απόλυτα social URLs. */
  SITE_URL: (env.RNB_SITE_URL || '').replace(/\/$/, ''),
  /** preview → noindex. production μόνο μετά από έγκριση δημοσίευσης. */
  SITE_MODE: env.RNB_SITE_MODE === 'production' ? 'production' : 'preview',
  /** demo: η φόρμα δεν στέλνει τίποτα. Αλλάζει μόνο με επιβεβαιωμένο CONTACT_ENDPOINT. */
  CONTACT_MODE: 'demo',
  CONTACT_ENDPOINT: '',
  ENABLE_ANALYTICS: false,
  /**
   * Κινηματογραφική αλληλουχία frames (Higgsfield). BLOCKED στις 07/11/2026:
   * το περιβάλλον δεν εκθέτει εργαλείο παραγωγής. Όταν υπάρξουν ελεγμένα frames,
   * enabled: true και manifests στα παρακάτω paths.
   */
  STORY_SEQUENCE: {
    enabled: false,
    desktop: '/story/desktop/manifest.json',
    mobile: '/story/mobile/manifest.json',
    mobileQuery: '(max-width: 760px)',
  },
};

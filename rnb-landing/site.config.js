/**
 * Κεντρικό configuration της landing page.
 *
 * Όλες οι διευθύνσεις και οι διακόπτες δημοσίευσης ορίζονται ΜΟΝΟ εδώ.
 * Μπορούν να αλλάξουν χωρίς αλλαγή κώδικα μέσω μεταβλητών περιβάλλοντος:
 *   RNB_APP_URL   διεύθυνση της εφαρμογής (κουμπί «Σύνδεση»)
 *   RNB_SITE_URL  δημόσια διεύθυνση της landing (canonical, social preview)
 *   RNB_INDEXABLE "true" μόνο όταν αποφασιστεί η δημόσια διάθεση
 */
const env = (typeof process !== 'undefined' && process.env) || {};

export const siteConfig = {
  /** Η υπάρχουσα εφαρμογή (rnb-alpha). Προτεινόμενο τελικό domain: app.rnb.gr */
  appUrl: env.RNB_APP_URL || 'https://app.rnb.gr',
  /** Η δημόσια παρουσίαση. Προτεινόμενο τελικό domain: rnb.gr */
  siteUrl: (env.RNB_SITE_URL || 'https://rnb.gr').replace(/\/$/, ''),
  /** Μέχρι τη δημόσια διάθεση η σελίδα μένει εκτός ευρετηρίασης. */
  indexable: env.RNB_INDEXABLE === 'true',
  brand: 'rnb',
  product: 'ONE4Business',
  lang: 'el',
};

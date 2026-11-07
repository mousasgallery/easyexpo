/**
 * Εσωτερικός κατάλογος ισχυρισμών (brief v1.2 §3).
 * Τα badges της σελίδας παράγονται από εδώ κατά το build: κείμενο και κατάσταση έχουν μία πηγή.
 * Κατάσταση: 'verified' | 'pilot' | 'planned' | 'unknown'.
 * Δεν εμφανίζονται IDs ή εσωτερικές σημειώσεις στο εμπορικό UI.
 */
export const STATUS_LABELS = {
  verified: 'Επαληθευμένη διαθεσιμότητα',
  pilot: 'Πιλοτική',
  planned: 'Σχεδιαζόμενη',
  unknown: 'Διαθεσιμότητα υπό επιβεβαίωση',
};

export const claims = [
  {
    id: 'email-pelates',
    text: 'Email και πελάτες: ταξινόμηση αιτήματος, διαθέσιμες πληροφορίες και προσχέδιο απάντησης.',
    rnbId: 'RNB-004',
    source: 'Brief v1.2, §7.2 (07/11/2026)',
    status: 'unknown',
    evidence: 'Καμία πραγματική δοκιμή ροής σε αυτή την εργασία.',
    sections: ['#lyseis'],
  },
  {
    id: 'poliseis-paraggelies',
    text: 'Πωλήσεις και παραγγελίες: εικόνα της εκκρεμότητας και του επόμενου συμφωνημένου βήματος.',
    rnbId: 'RNB-004',
    source: 'Brief v1.2, §7.2 (07/11/2026)',
    status: 'unknown',
    evidence: 'Καμία πραγματική δοκιμή ροής σε αυτή την εργασία.',
    sections: ['#lyseis'],
  },
  {
    id: 'kathimerines-ergasies',
    text: 'Καθημερινές εργασίες: τι είναι ανοιχτό, τι λείπει και τι περιμένει απόφαση.',
    rnbId: 'RNB-004',
    source: 'Brief v1.2, §7.2 (07/11/2026)',
    status: 'unknown',
    evidence: 'Καμία πραγματική δοκιμή ροής σε αυτή την εργασία.',
    sections: ['#lyseis'],
  },
  {
    id: 'trinity-epikoinonia',
    text: 'Η Trinity είναι το σημείο επικοινωνίας του επιχειρηματία.',
    rnbId: 'RNB-010',
    source: 'Brief v1.2, §2 (07/11/2026)',
    status: 'unknown',
    evidence: 'Περιγραφή ρόλου, όχι δοκιμή λειτουργίας.',
    sections: ['#arxi', '#lyseis', '#erotiseis'],
  },
];

export const claimById = Object.fromEntries(claims.map((c) => [c.id, c]));

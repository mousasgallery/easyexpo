# RNB · ONE4Business — landing page (brief v1.2)

Μία ελληνόφωνη, responsive landing page στο route `/`, με πέντε ενότητες (anchors):
`#arxi` κινηματογραφική αρχή · `#lyseis` προϊόν · `#demo` διαδραστικό demo · `#erotiseis` έλεγχος/FAQ · `#epideixi` αίτημα επίδειξης.

Ανεξάρτητο project. Δεν αγγίζει κώδικα, βάση, authentication ή deployment του rnb-alpha. Η προηγούμενη landing (`../rnb-landing/`) και τα previews της μένουν ως έχουν.

## Εκτέλεση

```bash
npm ci
npm run dev            # ανάπτυξη
npm run build          # dist/ (στατικά αρχεία, Cloudflare Pages)
npm run preview        # http://localhost:4174
npm run qa             # έλεγχοι §11 (θέλει preview ανοιχτό)· QA_PAGES_URL για 404/headers
npm run og             # social preview 1200×630
npm run build:single   # ένα αυτόνομο HTML (ιδιωτικό preview)
npm run build:drive    # αυτόνομο HTML + τεκμηρίωση για το Google Drive
```

Τα `qa` και `og` χρησιμοποιούν Playwright/Chromium. Ο έλεγχος 404 χρησιμοποιεί `npx wrangler pages dev dist`.

## Configuration (`site.config.js`)

| Πεδίο | Τιμή | Σημείωση |
|---|---|---|
| `BRAND_NAME` / `PRODUCT_NAME` | RNB / ONE4Business | |
| `APP_URL` | `https://rnb-alpha.lovable.app/login` | Επαληθεύτηκε 07/11: 302 → `https://rnb.gr/login` (200, «Σύνδεση · rnb»). Χωρίς login |
| `SITE_URL` | κενό | Canonical/απόλυτα social URLs μόνο για επιβεβαιωμένο host |
| `SITE_MODE` | `preview` | noindex (meta, robots.txt, `_headers`) |
| `CONTACT_MODE` | `demo` | Η φόρμα δεν στέλνει τίποτα |
| `ENABLE_ANALYTICS` | `false` | Κανένας tracker |
| `STORY_SEQUENCE.enabled` | `false` | Frames Higgsfield: BLOCKED |

**Προσοχή:** το `rnb.gr` σερβίρει σήμερα την εφαρμογή (το `rnb-alpha.lovable.app` ανακατευθύνει εκεί), ενώ το `app.rnb.gr` δεν απαντά. Η πρόταση «rnb.gr = δημόσιο site» προϋποθέτει πρώτα μεταφορά της εφαρμογής σε άλλο domain. Δεν έγινε καμία αλλαγή DNS.

## Δομή

```
site.config.js          κεντρικό configuration
index.html              όλο το περιεχόμενο σε HTML (SEO, χωρίς JS)
src/content/claims.js   κατάλογος ισχυρισμών → badges (μία πηγή)
src/tokens.css          παλέτα & tokens · src/styles.css · src/fonts.css
src/story.js            story renderer (pinned σκηνή, procedural fallback, τερματικό)
src/sequence.js         loader αλληλουχίας frames (Higgsfield, όταν υπάρξουν)
src/demo.js · src/form.js · src/nav.js
public/                 logo, favicon, og-image, _headers, 404.html
docs/                   Visual Story, Higgsfield, assets, QA, επαναφορά
qa/                     screenshots, results.json, fixtures δοκιμών
```

## Επεξεργασία κειμένων

Τα κείμενα βρίσκονται στο `index.html`, οργανωμένα ανά ενότητα. Οι καταστάσεις διαθεσιμότητας αλλάζουν μόνο στο `src/content/claims.js`. Μετά από κάθε αλλαγή τρέχουν πάλι `npm run build` και `npm run qa`.

## Επαναφορά

Βλ. `docs/ROLLBACK.md`.

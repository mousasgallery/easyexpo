# rnb.gr · Landing page για το ONE4Business

Ανεξάρτητη, στατική δημόσια παρουσίαση. Δεν μοιράζεται κώδικα, βάση ή authentication με την εφαρμογή **rnb-alpha**, η οποία συνεχίζει χωριστά.

| | Διεύθυνση (προτεινόμενη) | Κατάσταση |
|---|---|---|
| Δημόσια παρουσίαση | `rnb.gr` | Αυτό το project. Δεν έχει δημοσιευτεί. |
| Εφαρμογή | `app.rnb.gr` | Υπάρχον project. Δεν άλλαξε. |

Η σύνδεση γίνεται μόνο με το κουμπί «Σύνδεση». Domains και DNS δεν άλλαξαν.

## Κεντρικό configuration

Όλα σε [`site.config.js`](site.config.js). Αλλάζουν και με μεταβλητές περιβάλλοντος κατά το build:

| Μεταβλητή | Προεπιλογή | Τι κάνει |
|---|---|---|
| `RNB_APP_URL` | `https://app.rnb.gr` | Προορισμός όλων των κουμπιών «Σύνδεση» |
| `RNB_SITE_URL` | `https://rnb.gr` | canonical, `og:url`, `og:image` |
| `RNB_INDEXABLE` | (κενό → `false`) | `true` μόνο στη δημόσια διάθεση |

Π.χ. αν η εφαρμογή μένει προσωρινά σε άλλη διεύθυνση:

```bash
RNB_APP_URL=https://η-τρέχουσα-διεύθυνση npm run build
```

Όσο `RNB_INDEXABLE` δεν είναι `true`: `<meta name="robots" content="noindex, nofollow, noarchive">`, `robots.txt` με `Disallow: /` και header `X-Robots-Tag` στο `public/_headers` (Netlify / Cloudflare Pages). Στη δημόσια διάθεση: `RNB_INDEXABLE=true` **και** αφαίρεση της γραμμής `X-Robots-Tag` από το `public/_headers`.

## Εντολές

```bash
npm install
npm run dev          # τοπική ανάπτυξη
npm run build        # dist/ για hosting (στατικά αρχεία)
npm run preview      # σερβίρει το dist/ στο :4173
npm run qa           # αυτόματοι έλεγχοι στην αποδομένη σελίδα (θέλει preview ανοιχτό)
npm run og           # ξαναφτιάχνει το public/og-image.png
npm run build:single # ένα αυτόνομο HTML (dist-single/) για ιδιωτικό preview
```

Τα `qa` και `og` χρησιμοποιούν Playwright/Chromium (`require('playwright')`). Σε μηχάνημα χωρίς Playwright: `npm i -D playwright && npx playwright install chromium`.

## Φιλοξενία: Cloudflare Pages (αρχική επιλογή)

Δεν έχει γίνει ακόμη deploy. Όταν εγκριθεί το preview:

1. Cloudflare → Workers & Pages → Create → Pages → σύνδεση με το repo `mousasgallery/easyexpo`.
2. Root directory: `rnb-landing` · Build command: `npm run build` · Output: `dist`.
3. Environment variables (Production): `RNB_APP_URL`, `RNB_SITE_URL` όπως χρειάζεται. Το `RNB_INDEXABLE` μένει κενό μέχρι τη δημόσια διάθεση.
4. Το `public/_headers` εφαρμόζεται αυτόματα από το Cloudflare Pages (noindex header).
5. Custom domain `rnb.gr` μόνο μετά τον τελικό έλεγχο.

Εναλλακτικά από τερματικό, με το `wrangler.toml` του project:

```bash
npm run build && npx wrangler pages deploy dist
```

## Δομή

```
site.config.js         κεντρικό configuration
index.html             περιεχόμενο & metadata (ελληνικά, μία H1)
src/tokens.css         design tokens: παλέτα, ουδέτερα, τυπογραφία, κενά
src/styles.css         διάταξη & components
src/rain.js            ψηφιακή βροχή (canvas)
src/demo.js            διαδραστικό, ενδεικτικό παράδειγμα
scripts/qa.mjs         έλεγχοι ποιότητας
scripts/og-image.mjs   social preview 1200×630
qa/screenshots/        screenshots & αποτελέσματα του τελευταίου ελέγχου
```

## Χρώματα (design tokens)

Παλέτα «Matrix Code Green» από [schemecolor.com](https://www.schemecolor.com/matrix-code-green.php). Είναι δημοσιευμένη παλέτα, όχι επίσημο brand guide τρίτου.

| Token | HEX | Χρήση |
|---|---|---|
| `--c-near-black` | `#0D0208` | Βασικό φόντο |
| `--c-deep-green` | `#003B00` | Σκούρες επιφάνειες, διακόσμηση |
| `--c-mid-green` | `#008F11` | Δευτερεύουσες γραμμές, ψηφιακοί χαρακτήρες |
| `--c-bright-green` | `#00FF41` | Κύρια κουμπιά, ενεργά στοιχεία, focus |
| `--c-black` | `#000000` | Βαθύτερα φόντα, κείμενο πράσινων κουμπιών |
| `--c-text` | `#F2FFF5` | Κύριο κείμενο |
| `--c-text-muted` | `#B7C9BC` | Δευτερεύον κείμενο |
| `--rnb-dot-red` / `--rnb-dot-blue` | `#E63946` / `#2F7DF6` | Οι δύο κουκκίδες του wordmark rnb. **Προσωρινές τιμές:** χρειάζονται τα επίσημα HEX της ταυτότητας rnb. |

Τα σκούρα πράσινα δεν χρησιμοποιούνται για μικρό κείμενο. Το φωτεινό πράσινο έχει πάντα μαύρο κείμενο.

## Περιεχόμενο και ακρίβεια

- Τιμή στο FAQ: «50 € τον μήνα για κάθε agent, συν ΦΠΑ» (απόφαση 07/11/2026). Δεν υπάρχουν πελάτες, αξιολογήσεις, ποσοστά ή πιστοποιήσεις.
- Δεν αναφέρονται συνδέσεις, αυτόματες αποστολές ή εφαρμογές συσκευών.
- Οι πρακτικές χρήσεις σημειώνονται ως «Ενδεικτικό σενάριο».
- Το παράδειγμα έχει την ένδειξη «Ενδεικτικό παράδειγμα — δεν εκτελεί πραγματικές εργασίες». Χρησιμοποιεί φανταστική επιχείρηση. Δεν κάνει κλήσεις δικτύου.
- Η Trinity είναι η συνομιλήτρια του επιχειρηματία. Η εσωτερική αρχιτεκτονική των agents δεν παρουσιάζεται.
- Η λέξη «Matrix» δεν εμφανίζεται στο ορατό κείμενο. Τα γραφικά είναι πρωτότυπα και η βροχή χρησιμοποιεί ελληνικά γράμματα και ψηφία.
- Δεν υπάρχουν φόρμες.

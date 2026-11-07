# ONE4Business από τη RNB · landing v2 (αφηγητής NEO)

Μία ελληνική landing στο `/`, με πέντε ενότητες: `#top` · `#uses` · `#example` · `#control` · `#access`. Ανεξάρτητο project: δεν αγγίζει το rnb-alpha ούτε τις προηγούμενες landing (`../rnb-landing`, `../rnb-one4business`), ούτε βάση, auth ή domains.

## Εκτέλεση (localhost preview)

```bash
npm ci
npm run build
npm run preview          # http://localhost:4175
```

Ανάπτυξη με hot reload: `npm run dev`.

## Έλεγχοι

Με ανοιχτό το `npm run preview`:

```bash
npm run qa               # §14: viewports, terminal, demo, media, προσβασιμότητα, APP_URL → qa/results.json
node scripts/perf.mjs    # Lighthouse κινητού με throttling + bytes media → προσθέτει γραμμές στο qa/results.json
npm run record           # καταγραφή πληκτρολόγησης → qa/recordings/*.mp4
node scripts/qa-report.mjs   # docs/QA-REPORT.md
npm run package          # source ZIP + MANIFEST με SHA-256 → release/
```

Η σύγκριση με τον μηχανισμό της v1.0.0 χρειάζεται και το preview της v1.0.0 (`cd ../rnb-one4business && npx vite preview --port 4174`).

## Πού αλλάζει τι

| Θέμα | Αρχείο |
|---|---|
| APP_URL, media, noindex | `site.config.js` |
| Τρία hooks, ρυθμός πληκτρολόγησης, δεδομένα και μηνύματα demo | `src/content/copy.js` (μία πηγή για HTML και JS) |
| Υπόλοιπα κείμενα (NEO, ρόλοι, FAQ) | `index.html` |
| Χρώματα, τυπογραφία | `src/tokens.css`, `src/fonts.css` |
| Terminal / πληκτρολόγηση | `src/typing.js` |
| Cinema (scroll video) | `src/cinema.js`, `scripts/media.mjs`, `media-src/` (πρωτότυπα) |
| Demo | `src/demo.js` |
| Μενού και anchors | `src/nav.js` |

Μετά από κάθε αλλαγή κειμένων: `npm run build && npm run qa`.

## Παραδοτέα

- `docs/QA-REPORT.md`: QA με αναμενόμενο, πραγματικό αποτέλεσμα, τεκμήριο και περιβάλλον ανά γραμμή.
- `docs/STORYBOARD.md` και `docs/storyboard.html`, `docs/style-tile.html`: βοηθητικά αρχεία.
- `docs/ASSETS.md`: προέλευση και άδειες.
- `docs/ROLLBACK.md`: σημεία επαναφοράς.
- `docs/RNB-004_RNB-010_entry.md`: έτοιμη καταχώριση για το μητρώο.
- `qa/screenshots/`: 360, 390, 768 και 1440 px.
- `qa/recordings/`: καταγραφή πληκτρολόγησης.
- `qa/lighthouse/`: μετρήσεις απόδοσης.

# QA · RNB ONE4Business landing v1.0.0

Ημερομηνία: 7/11/2026 · Περιβάλλον: Chromium (Playwright) σε Linux container, vite preview και wrangler pages dev, χωρίς throttling δικτύου

**PASS 107 · FAIL 0 · BLOCKED 1 · NOT RUN 1**

Μέθοδος: `npm run build && npm run preview` και `QA_PAGES_URL=… npm run qa` (για τον έλεγχο Cloudflare: `wrangler pages dev dist`). Όλες οι μετρήσεις viewport είναι προσομοιώσεις Chromium, όχι φυσικές συσκευές.

## Mobile/Viewports

| Κατάσταση | Έλεγχος | Τεκμήριο |
|---|---|---|
| PASS | 360×780: χωρίς οριζόντια υπερχείλιση | scrollWidth−vw=0 |
| PASS | 360×780: controls ολόκληρα, στόχοι ≥ 40px |  |
| PASS | 390×844: χωρίς οριζόντια υπερχείλιση | scrollWidth−vw=0 |
| PASS | 390×844: controls ολόκληρα, στόχοι ≥ 40px |  |
| PASS | 430×932: χωρίς οριζόντια υπερχείλιση | scrollWidth−vw=0 |
| PASS | 430×932: controls ολόκληρα, στόχοι ≥ 40px |  |
| PASS | 768×1024: χωρίς οριζόντια υπερχείλιση | scrollWidth−vw=0 |
| PASS | 768×1024: controls ολόκληρα, στόχοι ≥ 40px |  |
| PASS | 1280×800: χωρίς οριζόντια υπερχείλιση | scrollWidth−vw=0 |
| PASS | 1280×800: controls ολόκληρα, στόχοι ≥ 40px |  |
| PASS | 1440×900: χωρίς οριζόντια υπερχείλιση | scrollWidth−vw=0 |
| PASS | 1440×900: controls ολόκληρα, στόχοι ≥ 40px |  |
| PASS | 390×600 μικρό ύψος: χωρίς οριζόντια υπερχείλιση | scrollWidth−vw=0 |
| PASS | 390×600 μικρό ύψος: controls ολόκληρα, στόχοι ≥ 40px |  |
| PASS | 844×390 landscape: χωρίς οριζόντια υπερχείλιση | scrollWidth−vw=0 |
| PASS | 844×390 landscape: controls ολόκληρα, στόχοι ≥ 40px |  |
| PASS | 640×450 zoom 200% (1280×900): χωρίς οριζόντια υπερχείλιση | scrollWidth−vw=0 |
| PASS | 640×450 zoom 200% (1280×900): controls ολόκληρα, στόχοι ≥ 40px |  |

## Οπτικό

| Κατάσταση | Έλεγχος | Τεκμήριο |
|---|---|---|
| PASS | 360×780: H1 και κύριο CTA ορατά στην πρώτη οθόνη | H1=true CTA=true |
| PASS | 390×844: H1 και κύριο CTA ορατά στην πρώτη οθόνη | H1=true CTA=true |
| PASS | 430×932: H1 και κύριο CTA ορατά στην πρώτη οθόνη | H1=true CTA=true |
| PASS | 768×1024: H1 και κύριο CTA ορατά στην πρώτη οθόνη | H1=true CTA=true |
| PASS | 1280×800: H1 και κύριο CTA ορατά στην πρώτη οθόνη | H1=true CTA=true |
| PASS | 1440×900: H1 και κύριο CTA ορατά στην πρώτη οθόνη | H1=true CTA=true |
| PASS | 390×600 μικρό ύψος: H1 και κύριο CTA ορατά στην πρώτη οθόνη | H1=true CTA=true |
| PASS | 844×390 landscape: H1 και κύριο CTA ορατά στην πρώτη οθόνη | H1=true CTA=true |
| PASS | 640×450 zoom 200% (1280×900): H1 και κύριο CTA ορατά στην πρώτη οθόνη | H1=true CTA=true |

## Εύρος

| Κατάσταση | Έλεγχος | Τεκμήριο |
|---|---|---|
| PASS | Ένα route / με τις πέντε ενότητες (#arxi #lyseis #demo #erotiseis #epideixi) | true,true,true,true,true |
| PASS | Κανένας σύνδεσμος προς άλλα routes (μόνο anchors και APP_URL) | 22 links |

## SEO

| Κατάσταση | Έλεγχος | Τεκμήριο |
|---|---|---|
| PASS | Title του brief | RNB / ONE4Business — AI για μικρές επιχειρήσεις |
| PASS | Meta description του brief | Γνώρισε το ONE4Business του RNB. Δες ενδεικτικές ροές για em… |
| PASS | Ένα H1, lang="el", ιεραρχία χωρίς άλματα | 123333222 |
| PASS | noindex στο preview | noindex, nofollow, noarchive |
| PASS | Χωρίς canonical/απόλυτα social URLs χωρίς επιβεβαιωμένο host | canonical=false og:image=/og-image.png |
| PASS | robots.txt Disallow / |  |
| PASS | Social preview 1200×630 σερβίρεται |  |
| PASS | Cloudflare Pages: header X-Robots-Tag noindex | noindex, nofollow, noarchive |

## Login

| Κατάσταση | Έλεγχος | Τεκμήριο |
|---|---|---|
| PASS | Όλα τα «Σύνδεση» δείχνουν στο APP_URL του config | https://rnb-alpha.lovable.app/login |

## Claims

| Κατάσταση | Έλεγχος | Τεκμήριο |
|---|---|---|
| PASS | Χωρίς τιμές, ποσοστά, πιστοποιήσεις, ονόματα συνδέσεων ή «Matrix» | κανένα εύρημα |
| PASS | Ένδειξη «Ενδεικτικό σενάριο» στο demo και στη σκηνή |  |
| PASS | Διευκρίνιση διαθεσιμότητας στο #lyseis |  |
| PASS | Badges από τον κατάλογο claims (ίδια πηγή) |  |

## Story

| Κατάσταση | Έλεγχος | Τεκμήριο |
|---|---|---|
| PASS | Αλληλουχία σκηνών εμπρός/πίσω με native scroll | 0:1 0.1:1 0.33: 0.6:3 0.9:4 1:4 0.6:3 0.33: 0:1 |
| PASS | Στη μεταβατική σκηνή 02 κανένα κρυφό link δεν δέχεται εστίαση (inert) |  |
| PASS | Τερματικό: πληκτρολόγηση ανάλογα με το scroll | none/none/7ch/0ch/0ch |
| PASS | «Παράλειψη κίνησης» οδηγεί στο #lyseis | top=130 |
| PASS | Παύση rendering όταν η σκηνή είναι εκτός οθόνης |  |

## Higgsfield

| Κατάσταση | Έλεγχος | Τεκμήριο |
|---|---|---|
| PASS | Λειτουργία σκηνής | procedural-fallback |

## Assets

| Κατάσταση | Έλεγχος | Τεκμήριο |
|---|---|---|
| PASS | desktop: ζητείται μόνο η αλληλουχία desktop | mode=sequence-desktop requests=29 kinds=desktop |
| PASS | desktop: όριο ταυτόχρονων/συνολικών λήψεων (όχι όλη η αλληλουχία μαζί) | 29 αιτήματα για 36 frames |
| PASS | mobile: ζητείται μόνο η αλληλουχία mobile | mode=sequence-mobile requests=29 kinds=mobile |
| PASS | mobile: όριο ταυτόχρονων/συνολικών λήψεων (όχι όλη η αλληλουχία μαζί) | 29 αιτήματα για 36 frames |
| PASS | Αποτυχία manifest → στατικό/procedural fallback χωρίς σπάσιμο |  |
| PASS | Reduced motion: καμία λήψη frames | 0 αιτήματα |

## Προσβασιμότητα

| Κατάσταση | Έλεγχος | Τεκμήριο |
|---|---|---|
| PASS | Reduced motion: στατική σύνθεση, χωρίς pinned travel, όλα τα κεφάλαια ορατά | {"cls":true,"h":1449,"running":false,"chapters":3} |
| PASS | Ορατό focus σε κάθε στάση Tab | Μετάβαση στο περιεχόμενο → RNB ONE4Business, αρχή σελ → Το προϊόν → Πώς λειτουργεί → Ερωτήσεις → Σύνδεση → Ζήτησε επίδειξη → Ζήτησε επίδειξη → Δες πώς λειτουργεί → Παράλειψη κίνησης ↓ → 1Αίτημα στην TrinityΑίτημα → Επανα |
| PASS | Χωρίς JavaScript: κείμενα και βασικά links διαθέσιμα | {"h1":"1","ch":["1","1","1"],"faq":5,"links":11} |
| PASS | Αντίθεση Κείμενο hero: #b7c9bc σε #000000 | 12.09:1 (ελάχ. 4.5) |
| PASS | Αντίθεση Κουμπί CTA: #000000 σε #00ff41 | 15.38:1 (ελάχ. 4.5) |
| PASS | Αντίθεση Κουμπί ghost: #f2fff5 σε #000000 | 20.40:1 (ελάχ. 4.5) |
| PASS | Αντίθεση Μενού: #b7c9bc σε #0d0208 | 11.75:1 (ελάχ. 4.5) |
| PASS | Αντίθεση Kicker: #00ff41 σε #0d0208 | 14.94:1 (ελάχ. 4.5) |
| PASS | Αντίθεση Badge: #b7c9bc σε #000000 | 12.09:1 (ελάχ. 4.5) |
| PASS | Αντίθεση Σημείωση #lyseis: #f2fff5 σε #003b00 | 12.55:1 (ελάχ. 4.5) |
| PASS | Αντίθεση Μήνυμα Trinity: #f2fff5 σε #003b00 | 12.55:1 (ελάχ. 4.5) |
| PASS | Αντίθεση Μήνυμα ιδιοκτήτη: #000000 σε #00ff41 | 15.38:1 (ελάχ. 4.5) |
| PASS | Αντίθεση Υπότιτλος demo: #b7c9bc σε #003b00 | 7.44:1 (ελάχ. 4.5) |
| PASS | Αντίθεση FAQ: #f2fff5 σε #0d0208 | 19.82:1 (ελάχ. 4.5) |
| PASS | Αντίθεση Label φόρμας: #f2fff5 σε #0d0208 | 19.82:1 (ελάχ. 4.5) |
| PASS | Αντίθεση Τερματικό (κύριο): #00ff41 σε #000000 | 15.38:1 (ελάχ. 4.5) |
| PASS | Αντίθεση Τερματικό (αριθμοί): #008f11 σε #000000 | 4.94:1 (ελάχ. 4.5) |
| PASS | Αντίθεση Footer: #b7c9bc σε #0d0208 | 11.75:1 (ελάχ. 4.5) |

## Navigation

| Κατάσταση | Έλεγχος | Τεκμήριο |
|---|---|---|
| PASS | Header → #lyseis: επικεφαλίδα κάτω από το header | top=254 |
| PASS | Header → #demo: επικεφαλίδα κάτω από το header | top=254 |
| PASS | Header → #erotiseis: επικεφαλίδα κάτω από το header | top=257 |
| PASS | CTA «Ζήτησε επίδειξη» → #epideixi |  |
| PASS | Πρώτο Tab: skip link |  |
| PASS | Απευθείας φόρτωση /#demo και refresh | top=229 μετά το refresh=229 |
| PASS | Απευθείας φόρτωση /#epideixi και refresh | top=230 μετά το refresh=230 |
| PASS | Mobile: άνοιγμα μενού, aria-expanded, εστίαση μέσα |  |
| PASS | Mobile: η εστίαση μένει μέσα στο μενού (Tab) |  |
| PASS | Mobile: Escape κλείνει και επιστρέφει εστίαση |  |
| PASS | Mobile: επιλογή κλείνει το μενού και πάει στην ενότητα | top=185 |
| PASS | Mobile: header ορατό μετά το τέλος της σκηνής |  |
| PASS | Cloudflare Pages (wrangler pages dev): / 200, άγνωστα paths πραγματικό 404 | {"root":200,"unknown":404,"old":404} |

## Demo

| Κατάσταση | Έλεγχος | Τεκμήριο |
|---|---|---|
| PASS | Επόμενο → βήμα 2 |  |
| PASS | Επόμενο → βήμα 3 |  |
| PASS | Επόμενο → βήμα 4 |  |
| PASS | Προηγούμενο → βήμα 3 |  |
| PASS | Άμεση επιλογή βήματος |  |
| PASS | Βέλη πληκτρολογίου |  |
| PASS | Στοιχεία DEMO-001 / Σε προετοιμασία / χωρίς ημερομηνία |  |
| PASS | Προσχέδιο του brief |  |
| PASS | Κενό κείμενο δεν εγκρίνεται |  |
| PASS | Έγκριση στο demo → «Δεν έγινε αποστολή.» | Το προσχέδιο εγκρίθηκε μόνο στην επίδειξη. Δεν έγινε αποστολή. |
| PASS | Νέα επεξεργασία ακυρώνει την έγκριση |  |
| PASS | Reset: κείμενο, έγκριση και βήμα επανέρχονται | {"a":false,"s":0} |

## Φόρμα

| Κατάσταση | Έλεγχος | Τεκμήριο |
|---|---|---|
| PASS | Άδεια πεδία → 3 μηνύματα σφάλματος, εστίαση στο πρώτο |  |
| PASS | Μη έγκυρο email απορρίπτεται |  |
| PASS | Έγκυρη δοκιμή → «Η δοκιμή ολοκληρώθηκε. Δεν στάλθηκε αίτημα.» | Η δοκιμή ολοκληρώθηκε. Δεν στάλθηκε αίτημα. |
| PASS | Διπλό click → μία μόνο δοκιμή |  |
| PASS | Καθαρισμός πεδίων και μηνυμάτων |  |
| PASS | Ένδειξη δοκιμαστικής φόρμας ορατή πριν από τη συμπλήρωση |  |

## Assets/ιδιωτικότητα

| Κατάσταση | Έλεγχος | Τεκμήριο |
|---|---|---|
| PASS | Τα στοιχεία δεν φεύγουν από τον browser (0 requests, 0 localStorage) | requests=0 |

## Απόδοση

| Κατάσταση | Έλεγχος | Τεκμήριο |
|---|---|---|
| PASS | Αρχικό JavaScript ≤ 200 KB gzip | JS 7.4 KB gzip · CSS 5.9 KB · HTML 7.5 KB · γραμματοσειρές 90 KB |
| BLOCKED | Hero poster / αλληλουχία frames (όρια 200/350 KB, 4/8 MB) | Δεν υπάρχουν assets Higgsfield· η σκηνή είναι procedural (0 KB εικόνων) |
| PASS | Κύλιση σκηνής σε Pixel 7 (emulation), CPU ×4: p95 καρέ < 50 ms | p50=16.7 ms · p95=33.3 ms · long tasks=0 · FCP=128 ms · DCL=99 ms (localhost, χωρίς throttling δικτύου) |

## Γενικά

| Κατάσταση | Έλεγχος | Τεκμήριο |
|---|---|---|
| PASS | Χωρίς σφάλματα κονσόλας |  |

## Mobile

| Κατάσταση | Έλεγχος | Τεκμήριο |
|---|---|---|
| NOT RUN | Φυσικές συσκευές (iPhone/Android) | Μόνο Chromium emulation σε αυτό το περιβάλλον |


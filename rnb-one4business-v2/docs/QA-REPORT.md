# QA · ONE4Business landing v2

Ημερομηνία: 2026-11-07 · Μέθοδος: Playwright (Chromium, headless) σε vite preview (localhost), Lighthouse 12.6 για την απόδοση. Εργαστηριακά αποτελέσματα, όχι field δεδομένα. Οι έλεγχοι αντίθεσης δεν αποτελούν πιστοποίηση WCAG.

**PASS 92 · FAIL 0 · NOT RUN 2 · BLOCKED 0**

## Responsive

| Κατάσταση | Έλεγχος | Αναμενόμενο | Πραγματικό | Τεκμήριο | Περιβάλλον |
|---|---|---|---|---|---|
| PASS | 360×800: χωρίς οριζόντια υπερχείλιση | scrollWidth ≤ viewport, κανένα στοιχείο εκτός | scrollWidth 360 / viewport 360 | 360-hero-typed.png | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 360×800 |
| PASS | 360×800: στόχοι αφής ≥ 44×44 | κάθε control ≥ 44×44 px | όλα ≥ 44×44 |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 360×800 |
| PASS | 390×844: χωρίς οριζόντια υπερχείλιση | scrollWidth ≤ viewport, κανένα στοιχείο εκτός | scrollWidth 390 / viewport 390 | 390-hero-typed.png | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 390×844 |
| PASS | 390×844: στόχοι αφής ≥ 44×44 | κάθε control ≥ 44×44 px | όλα ≥ 44×44 |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 390×844 |
| PASS | 768×1024: χωρίς οριζόντια υπερχείλιση | scrollWidth ≤ viewport, κανένα στοιχείο εκτός | scrollWidth 768 / viewport 768 | 768-hero-typed.png | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 768×1024 |
| PASS | 768×1024: στόχοι αφής ≥ 44×44 | κάθε control ≥ 44×44 px | όλα ≥ 44×44 |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 768×1024 |
| PASS | 1440×900: χωρίς οριζόντια υπερχείλιση | scrollWidth ≤ viewport, κανένα στοιχείο εκτός | scrollWidth 1440 / viewport 1440 | 1440-hero-typed.png | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | 1440×900: στόχοι αφής ≥ 44×44 | κάθε control ≥ 44×44 px | όλα ≥ 44×44 |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Επανέλεγχος desktop μετά το resize | χωρίς overflow | scrollWidth 1440 |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |

## Δομή

| Κατάσταση | Έλεγχος | Αναμενόμενο | Πραγματικό | Τεκμήριο | Περιβάλλον |
|---|---|---|---|---|---|
| PASS | Ένα route, πέντε κύριες ενότητες | #top #uses #example #control #access | top uses example control access | main > section: 5 | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Σύνδεσμοι μόνο προς anchors και APP_URL, χωρίς φόρμες | κανένα άλλο route, 0 φόρμες | 20 links, άλλα: 0, φόρμες: 0 |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |

## SEO

| Κατάσταση | Έλεγχος | Αναμενόμενο | Πραγματικό | Τεκμήριο | Περιβάλλον |
|---|---|---|---|---|---|
| PASS | Μία H1 με ακριβές κείμενο, lang="el" | μία H1 του brief | 1 H1 · «Λιγότερες εκκρεμότητες. Περισσότερος χρόνος για την επιχείρησή σου.» · lang=el | ιεραρχία 12333323323333332 | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | noindex/nofollow, χωρίς canonical/og:url, σχετικό og:image | noindex, nofollow· όχι επινοημένα απόλυτα URLs | robots="noindex, nofollow, noarchive" canonical=false og:url=false og:image=/og-image.png |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Social preview 1200×630, favicon, robots Disallow | αρχεία διαθέσιμα | og-image 200 · favicon 200 · robots Disallow / |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |

## Claims

| Κατάσταση | Έλεγχος | Αναμενόμενο | Πραγματικό | Τεκμήριο | Περιβάλλον |
|---|---|---|---|---|---|
| PASS | Χωρίς τιμές, αριθμητικούς ισχυρισμούς, πιστοποιήσεις, παλιά παραδείγματα | κανένα απαγορευμένο μοτίβο | κανένα εύρημα | innerText | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |

## Αφήγηση

| Κατάσταση | Έλεγχος | Αναμενόμενο | Πραγματικό | Τεκμήριο | Περιβάλλον |
|---|---|---|---|---|---|
| PASS | Γραμμές NEO, ρόλοι Peitho/Morpheus/Trinity, σήμανση γραμματείας | 13 συμφωνημένες φράσεις ακριβώς | 13/13 παρούσες |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |

## FAQ

| Κατάσταση | Έλεγχος | Αναμενόμενο | Πραγματικό | Τεκμήριο | Περιβάλλον |
|---|---|---|---|---|---|
| PASS | Έξι συμφωνημένες ερωτήσεις | 6 ερωτήσεις του brief | Τι είναι το ONE4Business; / Πώς συνεργάζονται οι διαφορετικοί ρόλοι; / Γιατί επικοινωνώ με την Trinity; / Στέλνει κάτι αυτή η επίδειξη; / Είναι διαθέσιμη η AI τηλεφωνική γραμματεία; / Ποιες συνδέσεις υποστηρίζονται σήμερα; |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Άνοιγμα με πληκτρολόγιο | details ανοίγει με Enter | open=true |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |

## Terminal

| Κατάσταση | Έλεγχος | Αναμενόμενο | Πραγματικό | Τεκμήριο | Περιβάλλον |
|---|---|---|---|---|---|
| PASS | Design v0.1.0: δεξιά, σκοτεινό πλαίσιο, bar, πράσινη μονοδιάστατη γραφή, λάμψη | όπως v0.1.0 | {"title":"NEO · ONE4Business","dots":3,"bg":"rgb(0, 0, 0)","border":"rgb(0, 143, 17)","right":true,"color":"rgb(0, 255, 65)","font":"\"JetBrains Mono\"","glow":true} | 1440-hero-typed.png | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Τίτλος «NEO · ONE4Business» | NEO · ONE4Business | NEO · ONE4Business |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Ένας χαρακτήρας κάθε φορά (~45 ms) | βήματα ενός χαρακτήρα, ~45 ms/χαρ. | μέγιστο βήμα 1 χαρ. ανά 20 ms δείγμα · μέσος ρυθμός 45.9 ms/χαρ. | 40 δείγματα | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Cursor ακριβώς μετά τον τελευταίο χαρακτήρα | cursor.previousSibling = τελευταίος ορατός χαρακτήρας | 40/40 δείγματα |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Παύση offscreen και συνέχεια από το ίδιο σημείο | σταθερό offscreen, συνέχεια μετά | offscreen 29→29 (offscreen) · επιστροφή 46 |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Παύση σε κρυφή καρτέλα | καμία πρόοδος όσο είναι κρυφή | visibilitychange (προσομοίωση document.hidden): 46→46 (hidden-tab) | visibilityState μετά από bringToFront άλλης καρτέλας: visible | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Τρία hooks ακριβώς, οι προηγούμενες φράσεις παραμένουν | τα τρία hooks του brief | «Μια ομάδα AI. Πολλές ειδικότητες. Ένα σύστημα.» «Λιγότερος χρόνος στις επαναλαμβανόμενες δουλειές. Περισσότερη οργάνωση στην επιχείρησή σου.» «Μίλα στην Trinity. Γνώρισε τι μπορεί να αναλάβει η ομάδα.» | Intl.Segmenter graphemes | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Χωρίς layout shift κατά την πληκτρολόγηση | ίδιο ύψος/θέση πριν και μετά | ύψος 382.421875→382.421875, y 320.53125→320.53125 |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Μία εκτέλεση, χωρίς διαγραφή/επανάληψη, χωρίς blinking μετά το τέλος | παραμένει ολοκληρωμένο, cursor σταθερός | done=true 194/194 · animation=none · «Εμφάνιση όλου» κρυμμένο=true |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Screen readers: πλήρες κείμενο μία φορά, χωρίς aria-live | οπτικό aria-hidden, sr-only αντίγραφο, 0 aria-live | aria-hidden=true · sr 3 φράσεις · aria-live 0 |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | «Εμφάνιση όλου» ολοκληρώνει αμέσως (πληκτρολόγιο) | πλήρες κείμενο αμέσως, η εστίαση δεν χάνεται | done=true 194/194 · εστίαση στο terminal=true |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Reduced motion: όλο το κείμενο αμέσως, χωρίς blinking | πλήρες, στατικό | done=true · animation=none |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 · reduced motion (emulated) |
| PASS | Χωρίς JavaScript: όλο το κείμενο | τρία hooks ορατά | 3 hooks, visibility=visible |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 · χωρίς JS |
| PASS | Κινητό 360: φυσική αναδίπλωση, όχι οριζόντια κύλιση, γραμματοσειρά ≥ 15px | wrap, ≥15px | font 16px · scroll 289/289 · white-space normal | 360-hero-typed.png | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 360×800 |
| PASS | Αξιολόγηση μηχανισμού v1.0.0 για επαναχρησιμοποίηση | πραγματική δοκιμή και απόφαση | scroll-linked, όχι χρονικός: στην αρχή «0ch/0ch/0ch/0ch/0ch», στο 60% «none/none/7ch/0ch/0ch», χωρίς scroll μετά 1,5 s «none/none/7ch/0ch/0ch». Κόβει με max-width σε ch (υποθέτει μονοδιάστατη γραμμή χωρίς αναδίπλωση). Δεν επαναχρησιμοποιήθηκε· νέος μηχανισμός  | v1.0.0 στο localhost:4174 | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · v1.0.0 |

## Fallbacks

| Κατάσταση | Έλεγχος | Αναμενόμενο | Πραγματικό | Τεκμήριο | Περιβάλλον |
|---|---|---|---|---|---|
| PASS | Χωρίς JavaScript: κατανοητή στατική σελίδα (cinema χωρίς pinned κενό) | στατική σκηνή | ύψος cinema 640px, λεζάντες ορατές | nojs-1440.png | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 · χωρίς JS |
| PASS | Αποτυχία video → poster και προσβάσιμη ενημέρωση | failed + poster | failed · poster cinema-desktop-start.webp · «Το βίντεο δεν φορτώθηκε. Εμφανίζεται στατική εικόνα.» | route abort *.mp4 | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Αποτυχία video και poster → συμπαγές φόντο, αναγνώσιμες λεζάντες | φόντο #000 | φόντο rgb(0, 0, 0) · λεζάντα rgb(242, 255, 245) | route abort *.mp4 + *.webp | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |

## Navigation

| Κατάσταση | Έλεγχος | Αναμενόμενο | Πραγματικό | Τεκμήριο | Περιβάλλον |
|---|---|---|---|---|---|
| PASS | Header → #uses: επικεφαλίδα κάτω από το header | top > ύψος header | top 313px |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Header → #example: επικεφαλίδα κάτω από το header | top > ύψος header | top 312px |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Header → #control: επικεφαλίδα κάτω από το header | top > ύψος header | top 316px |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Hero CTA «Δες πώς λειτουργεί» → #example | #example | #example |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Απευθείας φόρτωση /#example και refresh | ενότητα στην οθόνη | top 188 → μετά το refresh 188 |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Απευθείας φόρτωση /#access και refresh | ενότητα στην οθόνη | top 315 → μετά το refresh 315 |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Mobile menu: εστίαση μέσα, Tab παγιδευμένο, Escape κλείνει και επιστρέφει εστίαση | όλα αληθή | μέσα=true trap=true επιστροφή=true |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 390×844 |
| PASS | Mobile menu: κλείνει μετά την επιλογή και πάει στην ενότητα | κλειστό, ενότητα κάτω από header | top 158px | 390-menu.png | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 390×844 |

## Πληκτρολόγιο

| Κατάσταση | Έλεγχος | Αναμενόμενο | Πραγματικό | Τεκμήριο | Περιβάλλον |
|---|---|---|---|---|---|
| PASS | Skip link πρώτο, ορατό focus σε κάθε στάση | outline ≥ 2px #00FF41 | Μετάβαση στο περιεχόμενο → RNB ONE4Business, αρχή σ → Ειδικότητες → Παράδειγμα → Έλεγχος → Πρόσβαση στην εφαρμογή → Δες πώς λειτουργεί → Εμφάνιση όλου → Παράλειψη ιστορίας | focus-1440.png | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |

## Demo

| Κατάσταση | Έλεγχος | Αναμενόμενο | Πραγματικό | Τεκμήριο | Περιβάλλον |
|---|---|---|---|---|---|
| PASS | Τέσσερα βήματα, «Βήμα Χ από 4», προηγούμενο/επόμενο | ένδειξη βήματος | Βήμα 2 από 4 · Βήμα 4 από 4 |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Φανταστικά δεδομένα: γνωστά, ελλείψεις, κόστος/χρόνος | όπως το brief | Επισκευή τεσσάρων καρεκλών, Αίτημα εκτίμησης / Φωτογραφίες, Περιγραφή ζημιάς, Περιοχή παραλαβής |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Η αλλαγή βήματος διατηρεί το κείμενο | ίδιο κείμενο σε βήμα 3 και 4 | βήμα 3: «Αλλαγμένο προσχέδιο δοκιμής.» |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Κενό/whitespace κείμενο δεν εγκρίνεται (έλεγχος στον handler) | μη εγκεκριμένο + μήνυμα | approved=false · «Το κείμενο είναι κενό. Γράψε το προσχέδιο πριν από την έγκριση.» |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Έγκριση κενού και με απευθείας κλήση handler | απορρίπτεται | απορρίφθηκε | click() χωρίς input event | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Έγκριση: ακριβές μήνυμα, διπλό click = μία ενέργεια | «Εγκρίθηκε μόνο μέσα στο παράδειγμα…» · approvals=1 | «Εγκρίθηκε μόνο μέσα στο παράδειγμα. Κανένα μήνυμα δεν στάλθηκε.» · approvals=1 |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | HTML-like input αποδίδεται ως απλό κείμενο | 0 στοιχεία HTML, καμία εκτέλεση | elements=0 · εκτέλεση=0 · «Κείμενο <img src=x onerror="window.__xss…» |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Νέα αλλαγή ακυρώνει την έγκριση | «Το προσχέδιο άλλαξε. Χρειάζεται νέος έλεγχος.» | approved=false · «Το προσχέδιο άλλαξε. Χρειάζεται νέος έλεγχος.» · #control: «Χρειάζεται νέος έλεγχος» |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Επαναφορά: αρχικό κείμενο, βήμα 1, μη εγκεκριμένο | αρχική κατάσταση | step=0 approved=false κείμενο αρχικό=true |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Refresh επαναφέρει την αρχική κατάσταση | αρχικό κείμενο | αρχικό=true step=0 |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |

## Ιδιωτικότητα

| Κατάσταση | Έλεγχος | Αναμενόμενο | Πραγματικό | Τεκμήριο | Περιβάλλον |
|---|---|---|---|---|---|
| PASS | Network: κανένα demo περιεχόμενο δεν αποστέλλεται, 0 localStorage/cookies | 0 εξερχόμενα αιτήματα με δεδομένα | αιτήματα κατά το demo: 7 (μόνο φόρτωση σελίδας στο refresh) · εξωτερικά/με δεδομένα: 0 · localStorage 0 · cookies «» |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |

## Media

| Κατάσταση | Έλεγχος | Αναμενόμενο | Πραγματικό | Τεκμήριο | Περιβάλλον |
|---|---|---|---|---|---|
| PASS | desktop: lazy και μόνο η κατάλληλη πηγή | πριν την ενότητα 0 αιτήματα, μετά μόνο desktop | πριν: 0 · media: cinema-desktop-start.webp, cinema-desktop.mp4 |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | desktop: scroll εμπρός και πίσω (reverse) ακολουθεί το video | αύξουσα/φθίνουσα currentTime | currentTime 0.89 → 2.68 → 5.07 → 2.72 → 0.91 |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | desktop: παύση rendering όταν η σκηνή είναι offscreen | κανένα rAF | raf=false |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | mobile: lazy και μόνο η κατάλληλη πηγή | πριν την ενότητα 0 αιτήματα, μετά μόνο mobile | πριν: 0 · media: cinema-mobile-start.webp, cinema-mobile.mp4 |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 390×844 |
| PASS | mobile: scroll εμπρός και πίσω (reverse) ακολουθεί το video | αύξουσα/φθίνουσα currentTime | currentTime 0.88 → 2.67 → 5.09 → 2.7 → 0.93 |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 390×844 |
| PASS | mobile: παύση rendering όταν η σκηνή είναι offscreen | κανένα rAF | raf=false |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 390×844 |
| PASS | Resize desktop → mobile: απελευθέρωση και φόρτωση της σωστής πηγής | cinema-mobile.mp4 | src=cinema-mobile.mp4 · ready-mobile · αιτήματα cinema-desktop-start.webp, cinema-desktop.mp4, cinema-mobile-start.webp, cinema-mobile.mp4 |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |

## Reduced motion

| Κατάσταση | Έλεγχος | Αναμενόμενο | Πραγματικό | Τεκμήριο | Περιβάλλον |
|---|---|---|---|---|---|
| PASS | Cinema στατική: τελική εικόνα, καμία λήψη video, χωρίς pinned κενό, χωρίς smooth scroll | static, 0 mp4 | poster cinema-desktop-end.webp · mp4 αιτήματα 0 · ύψος 640=640 · scroll-behavior auto | emulated prefers-reduced-motion | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 · reduced motion (emulated) |

## Lifecycle

| Κατάσταση | Έλεγχος | Αναμενόμενο | Πραγματικό | Τεκμήριο | Περιβάλλον |
|---|---|---|---|---|---|
| PASS | Back: η σελίδα φορτώνει ξανά σωστά | λειτουργική επαναφόρτωση | νέα φόρτωση · typing 4/194 |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| NOT RUN | Επαναφορά από bfcache (pageshow persisted) | restore από bfcache | ο headless Chromium έκανε νέα φόρτωση αντί για restore· ο κώδικας pagehide/pageshow δεν ασκήθηκε σε πραγματικό restore |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |

## Αντίθεση

| Κατάσταση | Έλεγχος | Αναμενόμενο | Πραγματικό | Τεκμήριο | Περιβάλλον |
|---|---|---|---|---|---|
| PASS | Περιγραφή hero: #b7c9bc σε #0d0208 | ≥ 4.5:1 | 11.75:1 | 20px/400 | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Eyebrow: #00ff41 σε #0d0208 | ≥ 4.5:1 | 14.94:1 | 16px/650 | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Ένδειξη ανάπτυξης: #b7c9bc σε #0d0208 | ≥ 4.5:1 | 11.75:1 | 15px/400 | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | CTA: #000000 σε #00ff41 | ≥ 4.5:1 | 15.38:1 | 17px/650 | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Terminal: #00ff41 σε #000000 | ≥ 4.5:1 | 15.38:1 | 17px/400 | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Terminal bar: #b7c9bc σε #000000 | ≥ 4.5:1 | 12.09:1 | 12px/400 | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Ρόλος (περιοχή): #b7c9bc σε #0d0208 | ≥ 4.5:1 | 11.75:1 | 18px/400 | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Παράδειγμα ρόλου: #b7c9bc σε #0d0208 | ≥ 4.5:1 | 11.75:1 | 18px/400 | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Σήμανση σχεδιαζόμενης: #f2fff5 σε #003b00 | ≥ 4.5:1 | 12.55:1 | 14px/650 | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Ένδειξη παραδείγματος: #f2fff5 σε #000000 | ≥ 4.5:1 | 20.40:1 | 14px/650 | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Demo υπότιτλος: #b7c9bc σε #003b00 | ≥ 4.5:1 | 7.44:1 | 14px/400 | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Ετικέτα προσχεδίου: #000000 σε #00ff41 | ≥ 4.5:1 | 15.38:1 | 14px/700 | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Βοήθεια textarea: #b7c9bc σε #0d0208 | ≥ 4.5:1 | 11.75:1 | 15px/400 | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | FAQ: #f2fff5 σε #0d0208 | ≥ 4.5:1 | 19.82:1 | 18px/650 | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Footer: #b7c9bc σε #0d0208 | ≥ 4.5:1 | 11.75:1 | 14px/400 | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | NEO tag: #00ff41 σε #0d0208 | ≥ 4.5:1 | 14.94:1 | 13px/700 | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |
| PASS | Focus ring #00FF41 σε #0D0208 / #000 / #003B00 | ≥ 3:1 | 14.94 / 15.38 / 9.46 |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |

## Αναγνωσιμότητα

| Κατάσταση | Έλεγχος | Αναμενόμενο | Πραγματικό | Τεκμήριο | Περιβάλλον |
|---|---|---|---|---|---|
| PASS | Λεζάντες cinema σε όλα τα στάδια κίνησης (χειρότερο pixel πίσω από το κείμενο) | ≥ 4.5:1 για #B7C9BC | 12.09 / 12.09 / 12.09 / 12.09 | progress 5% / 35% / 62% / 95% | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 1440×900 |

## Προσβασιμότητα

| Κατάσταση | Έλεγχος | Αναμενόμενο | Πραγματικό | Τεκμήριο | Περιβάλλον |
|---|---|---|---|---|---|
| PASS | Zoom 200% (1440×900 → 720×450 CSS px): χωρίς overflow | χωρίς οριζόντια κύλιση | scrollWidth 720 | προσομοίωση με ισοδύναμο viewport | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 720×450 |

## Login

| Κατάσταση | Έλεγχος | Αναμενόμενο | Πραγματικό | Τεκμήριο | Περιβάλλον |
|---|---|---|---|---|---|
| PASS | APP_URL: πραγματικός προορισμός και οθόνη χωρίς authentication | οθόνη σύνδεσης RNB | https://rnb-alpha.lovable.app/login → https://rnb.gr/login · 200 · «Σύνδεση · rnb» · inputs: email | δεν έγινε login | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 · 2026-11-07T23:01:08.100Z |

## Γενικά

| Κατάσταση | Έλεγχος | Αναμενόμενο | Πραγματικό | Τεκμήριο | Περιβάλλον |
|---|---|---|---|---|---|
| PASS | Console errors | 0 | 0 σφάλματα | όλες οι παραπάνω σελίδες | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 |
| PASS | Missing assets (HTTP ≥ 400) | 0 | 0 (εξαιρούνται οι σκόπιμες αποτυχίες media) |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 |

## Συσκευές

| Κατάσταση | Έλεγχος | Αναμενόμενο | Πραγματικό | Τεκμήριο | Περιβάλλον |
|---|---|---|---|---|---|
| NOT RUN | Φυσικά iPhone/Android, Safari, Firefox | δοκιμή σε φυσικές συσκευές | δεν υπάρχουν σε αυτό το περιβάλλον· μόνο Chromium |  | Chromium 153.0.8010.12 (Playwright headless) · commit 4f3bfb2 |

## Απόδοση

| Κατάσταση | Έλεγχος | Αναμενόμενο | Πραγματικό | Τεκμήριο | Περιβάλλον |
|---|---|---|---|---|---|
| PASS | LCP (εργαστήριο, κινητό) | ≤ 2,5 s | 1.48 s (στοιχείο: H1) | qa/lighthouse/mobile-devtools.json | Lighthouse 12.6.0 · HeadlessChrome/153.0.0.0 · mobile 412×823 DPR 1.75 · devtools throttling CPU ×4, 1475 kbps, RTT 150 ms · localhost · commit 4f3bfb2 |
| PASS | CLS (εργαστήριο, κινητό) | ≤ 0,1 | 0.018 | qa/lighthouse/mobile-devtools.json | Lighthouse 12.6.0 · HeadlessChrome/153.0.0.0 · mobile 412×823 DPR 1.75 · devtools throttling CPU ×4, 1475 kbps, RTT 150 ms · localhost · commit 4f3bfb2 |
| PASS | TBT (εργαστήριο, κινητό) | ≤ 200 ms | 51 ms | qa/lighthouse/mobile-devtools.json | Lighthouse 12.6.0 · HeadlessChrome/153.0.0.0 · mobile 412×823 DPR 1.75 · devtools throttling CPU ×4, 1475 kbps, RTT 150 ms · localhost · commit 4f3bfb2 |
| PASS | Αρχική μεταφορά και media requests στη φόρτωση | καμία λήψη media πριν την ενότητα | 8 αιτήματα · 112.0 KB · media: 0 | network-requests | Lighthouse 12.6.0 · HeadlessChrome/153.0.0.0 · mobile 412×823 DPR 1.75 · devtools throttling CPU ×4, 1475 kbps, RTT 150 ms · localhost · commit 4f3bfb2 |
| PASS | Media στο #example (κινητό, throttling) | μόνο mobile video + poster | cinema-mobile-start.webp 6 KB · cinema-mobile.mp4 396 KB | CDP Network | Chromium 153.0.8010.12 · 412×823 isMobile · CDP: CPU ×4, 1,47 Mbps, latency 150 ms · commit 4f3bfb2 |


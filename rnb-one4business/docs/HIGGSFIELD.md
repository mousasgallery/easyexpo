# Higgsfield · κατάσταση και πλάνο παραγωγής

## Έλεγχος σύνδεσης (07/11/2026, σε αυτό το περιβάλλον Claude)

| Έλεγχος | Αποτέλεσμα |
| --- | --- |
| Σύνδεση λογαριασμού (`list_workspaces`) | PASS: 1 ιδιωτικό workspace |
| Υπόλοιπο (`balance`) | PASS: 2.925,5 credits, πλάνο Ultra (χωρίς δαπάνη) |
| Κατάλογος μοντέλων (`models_list`, `models_get`) | PASS: εικόνα και βίντεο (π.χ. Cinema Studio Image 2.5, Seedance 2.0, Cinema Studio Video 3.0) |
| Ιστορικό εργασιών (`show_generations`) | Διαθέσιμο εργαλείο ανάγνωσης |
| **Παραγωγή εικόνας/βίντεο** | **BLOCKED**: ο connector δηλώνει ότι «δεν μπορεί να παράγει media». Δεν εκτίθεται εργαλείο `generate_*` |
| Κόστος ανά παραγωγή | Δεν εκτίθεται στον κατάλογο. Δεν έγινε δοκιμαστική παραγωγή επί πληρωμή |

**Ενέργεια που χρειάζεται:** σύνδεση του Higgsfield MCP με δυνατότητα παραγωγής (image/video generation) σε αυτό το περιβάλλον του Claude, και έγκριση ορίου credits για το site.

## Συγκεντρωτικό πλάνο assets (προς έγκριση, δεν έχει εκτελεστεί)

| # | Asset | Μοντέλο (πρόταση) | Μορφή | Διάρκεια |
| --- | --- | --- | --- | --- |
| 1 | Key still «σκηνή 01» | Cinema Studio Image 2.5 · 2k | 16:9 | — |
| 2 | Key still «σκηνή 04» (τελικό πλαίσιο) | ίδιο, ίδιες αναφορές | 16:9 | — |
| 3 | Clip A: σκηνές 01→02 (σύγκλιση, σήμα) | Seedance 2.0 · std · 1080p · χωρίς ήχο · start_image=#1 | 16:9 | 6 s |
| 4 | Clip B: σκηνές 03→04 (πλαίσιο, ηρεμία) | ίδιο · start_image = τελευταίο frame του A · end_image=#2 | 16:9 | 6 s |
| 5–8 | Τα ίδια για mobile, νέα σύνθεση (όχι crop) | ίδια μοντέλα | 9:16 | 2 × 6 s |

Σύνολο: 4 stills, 4 clips (24 s βίντεο). Εξαγωγή: WebP, ~18 fps, 1280 px (desktop) / 720×1280 (mobile), στόχοι ≤ 8 MB / ≤ 4 MB. Εκτίμηση credits: **δεν μπορεί να υπολογιστεί από εδώ**. Προτείνεται ανώτατο όριο έγκρισης, π.χ. 400 credits, με έλεγχο υπολοίπου πριν και μετά.

Prompts: τα briefs desktop/mobile του §5 του brief v1.2, αυτούσια.

## Ενσωμάτωση όταν υπάρξουν assets

1. Frames στο `public/story/desktop/` και `public/story/mobile/` με `manifest.json` (`count`, `width`, `height`, `pattern`, `poster`, `fps`).
2. `STORY_SEQUENCE.enabled: true` στο `site.config.js`.
3. Ο renderer (`src/story.js`, `src/sequence.js`) ήδη επιλέγει μόνο τη σωστή εκδοχή πριν από κάθε request. Περιορίζει τις λήψεις και τη μνήμη, ακυρώνει όσες δεν χρειάζονται, δείχνει poster και πέφτει σε fallback αν αποτύχει. Με reduced motion δεν κατεβάζει τίποτα. Δοκιμάστηκε με δοκιμαστικά frames (`qa/fixtures`).
4. Καταγραφή job IDs, prompts και αδειών στο `docs/ASSETS.md`.

Μέχρι τότε: πρωτότυπο procedural fallback σε canvas. **Δεν αποτελεί ολοκληρωμένη κινηματογραφική έκδοση.**

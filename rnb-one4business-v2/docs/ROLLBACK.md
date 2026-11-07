# Checkpoints και επαναφορά

Branch: `claude/rnb-landing-page-matrix-5e5lxa` (GitHub mousasgallery/easyexpo). Κάθε checkpoint επαληθεύτηκε με `git ls-remote` μετά το push.

| Checkpoint | Commit | Περιεχόμενο |
|---|---|---|
| Πριν από τη v2 | `7cd4a5d` | rnb-landing + rnb-one4business (v1.0.0), χωρίς v2 |
| Πρώτη υλοποίηση v2 | `4f3bfb2` | rnb-one4business-v2, πριν από τις διορθώσεις του QA |
| Παράδοση v2 | βλ. `release/MANIFEST.json` (`commit`) | διορθώσεις QA, τεκμηρίωση, πακέτο |

Επαναφορά χωρίς destructive reset:

```bash
git fetch origin claude/rnb-landing-page-matrix-5e5lxa
git switch -c rollback-check 7cd4a5d
```

Η v2 είναι αυτόνομος φάκελος. Η αφαίρεσή της δεν επηρεάζει τις προηγούμενες εκδοχές ούτε το rnb-alpha. Δεν υπάρχει deploy προς αναίρεση: δεν έγινε δημοσίευση.

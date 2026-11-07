# Επαναφορά

| Σημείο | Ref | Επαλήθευση |
|---|---|---|
| Πριν από αυτό το project | tag `restore/2026-11-07-pre-one4business-v1` (commit `ccd414d`) | push στο origin (07/11/2026) |
| Μετά την παράδοση v1.0.0 | tag `restore/2026-11-07-one4business-v1.0.0` | βλ. τελική αναφορά |

Επιστροφή του branch σε προηγούμενο σημείο χωρίς απώλεια ιστορικού:

```bash
git fetch origin --tags
git switch -c rollback-check restore/2026-11-07-pre-one4business-v1
```

Το project είναι αυτόνομος φάκελος (`rnb-one4business/`). Η αφαίρεσή του δεν επηρεάζει το `rnb-landing/` ούτε το rnb-alpha. Δεν υπάρχει deploy προς αναίρεση: δεν έγινε δημοσίευση ούτε αλλαγή domain.

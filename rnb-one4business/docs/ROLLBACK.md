# Επαναφορά

Επαληθευμένα σημεία επαναφοράς: commits του branch `claude/rnb-landing-page-matrix-5e5lxa`, ελεγμένα στο GitHub μέσω API (07/11/2026).

| Σημείο | Commit | Περιεχόμενο |
|---|---|---|
| Πριν από αυτό το project | `ccd414d922d8b846af5b9e3968642d3f725b0bdf` | μόνο το `rnb-landing/` (προηγούμενη landing) |
| Παράδοση v1.0.0 | `db8100f417ac6dd7777816b9658dd6869701d632` | + `rnb-one4business/` |

Υπάρχουν και τοπικά tags `restore/2026-11-07-pre-one4business-v1` και `restore/2026-11-07-one4business-v1.0.0`. Ο git proxy της συνεδρίας δεν επέτρεψε push tags, άρα **δεν** υπάρχουν στο GitHub. Αξιόπιστα σημεία είναι τα commits.

Επιστροφή χωρίς απώλεια ιστορικού:

```bash
git fetch origin claude/rnb-landing-page-matrix-5e5lxa
git switch -c rollback-check ccd414d922d8b846af5b9e3968642d3f725b0bdf
```

Το project είναι αυτόνομος φάκελος (`rnb-one4business/`). Η αφαίρεσή του δεν επηρεάζει το `rnb-landing/` ούτε το rnb-alpha. Δεν υπάρχει deploy προς αναίρεση: δεν έγινε δημοσίευση ούτε αλλαγή domain.

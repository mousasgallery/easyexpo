/**
 * Διαδραστικό demo (#demo) — brief v1.2 §7.3.
 * Τέσσερα βήματα, προηγούμενο/επόμενο, άμεση επιλογή, επεξεργασία, τοπική έγκριση, reset.
 * Κανόνες: κενό κείμενο δεν εγκρίνεται · νέα επεξεργασία ακυρώνει την έγκριση · reset καθαρίζει τα πάντα.
 * Καμία εξωτερική κλήση, καμία αποθήκευση (ούτε localStorage), καμία πραγματική αποστολή.
 */
export const DEMO_DRAFT = 'Καλησπέρα σας. Η παραγγελία σας βρίσκεται σε προετοιμασία. Θα σας ενημερώσουμε μόλις επιβεβαιωθεί η ημερομηνία αποστολής.';
const MSG = {
  approved: 'Το προσχέδιο εγκρίθηκε μόνο στην επίδειξη. Δεν έγινε αποστολή.',
  empty: 'Το προσχέδιο είναι κενό. Γράψε κείμενο στο βήμα 3 πριν από την έγκριση.',
  invalidated: 'Το κείμενο άλλαξε μετά την έγκριση. Χρειάζεται νέα έγκριση στο demo.',
};

export function initDemo(root) {
  if (!root) return null;
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
  const $ = (s) => root.querySelector(s);
  const draft = $('[data-draft]'), finalText = $('[data-final-text]'), result = $('[data-result]');
  const approveBtn = $('[data-approve]'), prev = $('[data-prev]'), next = $('[data-next]'), count = $('[data-count]');
  const hint = $('[data-draft-hint]');
  const state = { step: 0, approved: false };

  function renderFinal() {
    const text = draft.value.trim();
    finalText.textContent = text || 'Κενό προσχέδιο';
    finalText.classList.toggle('is-empty', !text);
  }

  function select(i, { focus = false } = {}) {
    state.step = Math.max(0, Math.min(tabs.length - 1, i));
    tabs.forEach((t, k) => {
      const on = k === state.step;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      t.classList.toggle('is-done', k < state.step);
      panels[k].hidden = !on;
    });
    if (state.step === 3) renderFinal();
    prev.disabled = state.step === 0;
    next.disabled = state.step === tabs.length - 1;
    count.textContent = `${state.step + 1} / ${tabs.length}`;
    if (focus) tabs[state.step].focus();
  }

  function setResult(text, error = false) {
    result.textContent = text;
    result.classList.toggle('is-error', error);
  }

  function reset() {
    draft.value = DEMO_DRAFT;
    state.approved = false;
    setResult('');
    hint.textContent = 'Οι αλλαγές μένουν μόνο σε αυτή τη σελίδα.';
    select(0);
  }

  tabs.forEach((t, k) => {
    t.addEventListener('click', () => select(k));
    t.addEventListener('keydown', (e) => {
      const map = { ArrowRight: k + 1, ArrowDown: k + 1, ArrowLeft: k - 1, ArrowUp: k - 1, Home: 0, End: tabs.length - 1 };
      if (!(e.key in map)) return;
      e.preventDefault();
      select((map[e.key] + tabs.length) % tabs.length, { focus: true });
    });
  });
  prev.addEventListener('click', () => select(state.step - 1));
  next.addEventListener('click', () => select(state.step + 1));

  draft.addEventListener('input', () => {
    if (state.approved) {
      state.approved = false;
      setResult(MSG.invalidated, true);
      hint.textContent = MSG.invalidated;
    }
  });

  approveBtn.addEventListener('click', () => {
    renderFinal();
    if (!draft.value.trim()) { state.approved = false; setResult(MSG.empty, true); return; }
    state.approved = true;
    setResult(MSG.approved);
  });
  $('[data-edit]').addEventListener('click', () => { select(2); draft.focus(); });
  $('[data-demo-reset]').addEventListener('click', () => { reset(); tabs[0].focus(); });

  reset();
  root.__demo = state;
  return state;
}

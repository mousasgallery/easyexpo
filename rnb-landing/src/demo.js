/**
 * Διαδραστικό, ενδεικτικό παράδειγμα (φανταστικά δεδομένα).
 * Δεν καλεί κανένα δίκτυο και δεν εκτελεί πραγματικές εργασίες.
 */
export function initDemo(root) {
  if (!root) return;
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
  const prev = root.querySelector('[data-demo-prev]');
  const next = root.querySelector('[data-demo-next]');
  const progress = root.querySelector('[data-demo-progress]');
  const reviewText = root.querySelector('[data-review-text]');
  const reviewResult = root.querySelector('[data-review-result]');
  const reviewHint = root.querySelector('[data-review-hint]');
  const draft = root.querySelector('[data-draft-text]');
  const editBtn = root.querySelector('[data-review="edit"]');
  const decisionBtns = [...root.querySelectorAll('[data-review]')];

  const draftText = () =>
    [...draft.querySelectorAll('p')]
      .map((p) => {
        // Το panel είναι κρυφό, άρα το innerText δεν είναι αξιόπιστο: μετατρέπουμε <br> σε αλλαγή γραμμής.
        const clone = p.cloneNode(true);
        clone.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
        return clone.textContent.replace(/[ \t]+\n/g, '\n').replace(/\s+$/g, '').trim();
      })
      .join('\n\n');

  let current = 0;

  function resetReview() {
    reviewText.value = draftText();
    reviewText.readOnly = true;
    editBtn.setAttribute('aria-pressed', 'false');
    editBtn.textContent = 'Αλλαγή κειμένου';
    reviewResult.textContent = '';
    reviewHint.textContent = 'Διάλεξε τι θα γίνει με το προσχέδιο.';
    decisionBtns.forEach((b) => (b.disabled = false));
  }

  function select(index, { focusTab = false } = {}) {
    current = Math.max(0, Math.min(tabs.length - 1, index));
    tabs.forEach((tab, i) => {
      const on = i === current;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      tab.classList.toggle('is-done', i < current);
      panels[i].hidden = !on;
    });
    if (focusTab) tabs[current].focus();
    prev.disabled = current === 0;
    const last = current === tabs.length - 1;
    next.textContent = last ? 'Από την αρχή ↺' : 'Επόμενο →';
    progress.textContent = `${current + 1} / ${tabs.length}`;
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', (e) => {
      const keys = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 };
      if (!(e.key in keys)) return;
      e.preventDefault();
      select((keys[e.key] + tabs.length) % tabs.length, { focusTab: true });
    });
  });

  prev.addEventListener('click', () => select(current - 1));
  next.addEventListener('click', () => {
    if (current === tabs.length - 1) {
      resetReview();
      select(0);
      tabs[0].focus();
    } else {
      select(current + 1);
    }
  });

  root.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-review]');
    if (!btn) return;
    const action = btn.dataset.review;
    if (action === 'edit') {
      const editing = reviewText.readOnly;
      reviewText.readOnly = !editing;
      btn.setAttribute('aria-pressed', String(editing));
      if (editing) {
        btn.textContent = 'Τέλος αλλαγών';
        reviewHint.textContent = 'Άλλαξε ελεύθερα το κείμενο. Μετά πάτησε «Έγκριση» ή «Τέλος αλλαγών».';
        reviewResult.textContent = '';
        reviewText.focus();
      } else {
        btn.textContent = 'Αλλαγή κειμένου';
        reviewHint.textContent = 'Διάλεξε τι θα γίνει με το προσχέδιο.';
        reviewResult.textContent = 'Οι αλλαγές σου κρατήθηκαν στο προσχέδιο. Δεν στάλθηκε τίποτα.';
      }
      return;
    }
    reviewText.readOnly = true;
    editBtn.setAttribute('aria-pressed', 'false');
    editBtn.textContent = 'Αλλαγή κειμένου';
    if (action === 'approve') {
      reviewResult.textContent = 'Εγκρίθηκε από εσένα. Σε αυτό το παράδειγμα δεν αποστέλλεται τίποτα.';
    } else if (action === 'reject') {
      reviewResult.textContent = 'Το προσχέδιο μπήκε στην άκρη. Σε αυτό το παράδειγμα δεν γίνεται καμία άλλη ενέργεια.';
    }
    reviewHint.textContent = 'Μπορείς να ξαναδείς το παράδειγμα από την αρχή.';
  });

  resetReview();
  select(0);
}

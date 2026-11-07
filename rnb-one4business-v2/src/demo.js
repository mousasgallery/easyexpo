/**
 * Διαδραστικό παράδειγμα (#example): αίτημα → στοιχεία → προσχέδιο → έλεγχος.
 * Κανόνες: το κείμενο διατηρείται στην αλλαγή βήματος · κενό/whitespace δεν εγκρίνεται (έλεγχος στον handler)
 * · κάθε αλλαγή ακυρώνει την έγκριση · reset επαναφέρει κείμενο, βήμα 1 και μη εγκεκριμένη κατάσταση
 * · διπλό click δεν προσθέτει ενέργεια · κείμενο μόνο ως textContent/value · καμία αποθήκευση ή αποστολή.
 */
import { DEMO } from './content/copy.js';

export function initDemo(root) {
  if (!root) return null;
  const $ = (s) => root.querySelector(s);
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
  const input = $('[data-draft-input]'), view = $('[data-draft-view]'), status = $('[data-status]');
  const count = $('[data-count]'), prev = $('[data-prev]'), next = $('[data-next]');
  const approveBtn = $('[data-approve]'), resetBtn = $('[data-reset]');
  const live = document.querySelector('[data-live-status]');
  const M = DEMO.messages;
  const state = { step: 0, text: DEMO.draft, approved: false, changed: false, approvals: 0 };

  function emit() {
    const label = state.approved ? M.statusApproved : state.changed ? M.statusChanged : M.statusIdle;
    if (live) live.textContent = label;
    root.dataset.state = state.approved ? 'approved' : state.changed ? 'changed' : 'idle';
  }
  function say(msg, kind = 'info') { status.textContent = msg; status.dataset.kind = kind; }

  function select(i, { focus = false } = {}) {
    state.step = Math.max(0, Math.min(tabs.length - 1, i));
    tabs.forEach((t, k) => {
      const on = k === state.step;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      t.classList.toggle('is-done', k < state.step);
      panels[k].hidden = !on;
    });
    view.textContent = state.text;          // πάντα ως κείμενο
    if (input.value !== state.text) input.value = state.text;
    count.textContent = `Βήμα ${state.step + 1} από ${tabs.length}`;
    prev.disabled = state.step === 0;
    next.disabled = state.step === tabs.length - 1;
    if (focus) tabs[state.step].focus();
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

  input.addEventListener('input', () => {
    state.text = input.value;
    if (state.approved) { state.approved = false; state.changed = true; say(M.changed, 'warn'); }
    emit();
  });

  approveBtn.addEventListener('click', () => {
    const text = input.value;
    if (!text.trim()) { state.approved = false; say(M.empty, 'error'); input.focus(); emit(); return; }
    if (state.approved) return;            // διπλό click: καμία πρόσθετη ενέργεια
    state.text = text;
    state.approved = true;
    state.changed = false;
    state.approvals += 1;
    say(M.approved, 'ok');
    emit();
  });

  resetBtn.addEventListener('click', () => {
    state.text = DEMO.draft;
    state.approved = false;
    state.changed = false;
    input.value = DEMO.draft;
    select(0);
    say(M.reset);
    emit();
    tabs[0].focus();
  });

  input.value = state.text;
  select(0);
  emit();
  root.__demo = state;
  return state;
}

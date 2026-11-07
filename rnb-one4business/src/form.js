/**
 * Φόρμα αιτήματος επίδειξης (#epideixi) — CONTACT_MODE=demo (brief v1.2 §7.5).
 * Δεν στέλνει τίποτα: χωρίς fetch, χωρίς localStorage, χωρίς logs ή analytics.
 * Τα δεδομένα μένουν μόνο στα πεδία της σελίδας μέχρι τον καθαρισμό ή το κλείσιμο.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ERR = {
  name: 'Συμπλήρωσε όνομα.',
  emailEmpty: 'Συμπλήρωσε επαγγελματικό email.',
  emailBad: 'Το email δεν έχει έγκυρη μορφή (π.χ. onoma@epixeirisi.gr).',
  need: 'Γράψε σύντομα την ανάγκη σου.',
};
const DONE = 'Η δοκιμή ολοκληρώθηκε. Δεν στάλθηκε αίτημα.';

export function initForm(form, config) {
  if (!form) return null;
  if (config.CONTACT_MODE !== 'demo') {
    // Πραγματική υποβολή απαιτεί επιβεβαιωμένο endpoint, server-side έλεγχο και δοκιμή παραλαβής.
    console.warn('CONTACT_MODE δεν είναι demo, αλλά δεν υπάρχει υλοποίηση πραγματικής αποστολής.');
  }
  const result = form.querySelector('[data-form-result]');
  const submit = form.querySelector('[data-submit]');
  const fields = { name: form.elements.name, email: form.elements.email, need: form.elements.need };
  let busy = false;
  const state = { submissions: 0 };

  function setError(name, msg) {
    const el = form.querySelector(`[data-error-for="${name}"]`);
    el.textContent = msg || '';
    fields[name].setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  function validate() {
    const v = { name: fields.name.value.trim(), email: fields.email.value.trim(), need: fields.need.value.trim() };
    const errors = {
      name: v.name ? '' : ERR.name,
      email: !v.email ? ERR.emailEmpty : EMAIL.test(v.email) ? '' : ERR.emailBad,
      need: v.need ? '' : ERR.need,
    };
    Object.entries(errors).forEach(([k, m]) => setError(k, m));
    const first = Object.keys(errors).find((k) => errors[k]);
    return { ok: !first, first };
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (busy) return;                    // προστασία διπλού click
    result.textContent = '';
    const { ok, first } = validate();
    if (!ok) { fields[first].focus(); return; }
    busy = true;
    submit.disabled = true;
    // Demo mode: καμία κλήση δικτύου. Μόνο τοπικό μήνυμα.
    state.submissions += 1;
    result.textContent = DONE;
    setTimeout(() => { busy = false; submit.disabled = false; }, 600);
  });

  Object.entries(fields).forEach(([k, el]) => el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') setError(k, ''); }));

  form.addEventListener('reset', () => {
    Object.keys(fields).forEach((k) => setError(k, ''));
    result.textContent = '';
    busy = false;
    submit.disabled = false;
  });

  form.__state = state;
  return state;
}

import { CONTACT_EMAIL } from '../config/site';
import { validateContact, type ContactField } from '../../server/contact/validate';

/**
 * Contact form: inline validation (errors announced via aria-live), async submission to the
 * configured endpoint, success state that replaces the form. Without JS the form posts natively.
 */
export function initForm() {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  const success = document.querySelector<HTMLElement>('[data-form-success]');
  if (!form || !success) return;
  const status = form.querySelector<HTMLElement>('[data-form-status]')!;
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const msg = form.querySelector<HTMLTextAreaElement>('#f-msg')!;
  const countNow = form.querySelector<HTMLElement>('[data-count-now]')!;
  const fieldIds: Record<ContactField, string> = {
    name: 'f-name',
    organisation: 'f-org',
    email: 'f-email',
    message: 'f-msg',
  };
  const touched = new Set<ContactField>();

  const values = () => {
    const fd = new FormData(form);
    return Object.fromEntries(Array.from(fd.entries()).map(([k, v]) => [k, String(v)])) as Record<string, string>;
  };

  const show = (errors: Partial<Record<ContactField, string>>, only?: ContactField) => {
    (Object.keys(fieldIds) as ContactField[]).forEach((f) => {
      if (only && f !== only) return;
      const input = document.getElementById(fieldIds[f])!;
      const err = document.getElementById(`${fieldIds[f]}-err`)!;
      const text = errors[f] ?? '';
      if (err.textContent !== text) err.textContent = text;
      if (text) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    });
  };

  msg.addEventListener('input', () => {
    countNow.textContent = msg.value.length.toLocaleString('en-GB');
  });
  (Object.keys(fieldIds) as ContactField[]).forEach((f) => {
    const input = document.getElementById(fieldIds[f])!;
    input.addEventListener('blur', () => {
      if (!(input as HTMLInputElement).value && !touched.has(f)) return;
      touched.add(f);
      show(validateContact(values()).errors, f);
    });
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') show(validateContact(values()).errors, f);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';
    const data = values();
    const { errors, ok } = validateContact(data);
    show(errors);
    if (!ok) {
      const first = (Object.keys(fieldIds) as ContactField[]).find((f) => errors[f]);
      if (first) document.getElementById(fieldIds[first])!.focus();
      return;
    }
    submit.setAttribute('aria-busy', 'true');
    submit.disabled = true;
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.ok) {
        form.hidden = true;
        success.hidden = false;
        success.focus();
        return;
      }
      if (res.status === 422 && body.errors) {
        show(body.errors);
        return;
      }
      status.textContent =
        res.status === 429
          ? `Too many messages from this connection. Please try again later, or email ${CONTACT_EMAIL}.`
          : `The message could not be sent. Please try again, or email ${CONTACT_EMAIL}.`;
    } catch {
      status.textContent = `The message could not be sent. Please try again, or email ${CONTACT_EMAIL}.`;
    } finally {
      submit.removeAttribute('aria-busy');
      submit.disabled = false;
    }
  });
}

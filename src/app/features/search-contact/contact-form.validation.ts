/**
 * PWEB-25: pure Contact-form validation, kept free of `HttpClient`/DOM/signals so it is trivially
 * unit-testable (mirrors this app's other pure-logic modules, e.g. `notice.models.ts`,
 * `contact-idempotency.ts`). Returns translation KEYS, not rendered strings, so
 * `contact-form.component.html` can run them through `TranslatePipe` for bilingual error text.
 */
export interface ContactFormValues {
  readonly name: string;
  readonly email: string;
  readonly subject: string;
  readonly message: string;
}

export interface ContactFormErrors {
  readonly name?: string;
  readonly email?: string;
  readonly subject?: string;
  readonly message?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_MESSAGE_LENGTH = 10;

export function validateContactForm(values: ContactFormValues): ContactFormErrors {
  const errors: { -readonly [K in keyof ContactFormErrors]?: string } = {};

  if (!values.name.trim()) {
    errors.name = 'contact.errors.nameRequired';
  }

  const email = values.email.trim();
  if (!email) {
    errors.email = 'contact.errors.emailRequired';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'contact.errors.emailInvalid';
  }

  if (!values.subject.trim()) {
    errors.subject = 'contact.errors.subjectRequired';
  }

  const message = values.message.trim();
  if (!message) {
    errors.message = 'contact.errors.messageRequired';
  } else if (message.length < MIN_MESSAGE_LENGTH) {
    errors.message = 'contact.errors.messageTooShort';
  }

  return errors;
}

export function isContactFormValid(errors: ContactFormErrors): boolean {
  return Object.keys(errors).length === 0;
}

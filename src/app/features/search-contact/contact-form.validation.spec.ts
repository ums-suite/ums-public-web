import { isContactFormValid, validateContactForm } from './contact-form.validation';

const VALID = {
  name: 'Ada Rahman',
  email: 'ada@example.edu',
  subject: 'Admission question',
  message: 'I would like to know more about the program.',
};

describe('validateContactForm', () => {
  it('returns no errors for fully valid input', () => {
    expect(validateContactForm(VALID)).toEqual({});
  });

  it('requires a non-blank name', () => {
    expect(validateContactForm({ ...VALID, name: '   ' }).name).toBe('contact.errors.nameRequired');
  });

  it('requires an email', () => {
    expect(validateContactForm({ ...VALID, email: '' }).email).toBe('contact.errors.emailRequired');
  });

  it('rejects a malformed email', () => {
    expect(validateContactForm({ ...VALID, email: 'not-an-email' }).email).toBe(
      'contact.errors.emailInvalid',
    );
  });

  it('requires a non-blank subject', () => {
    expect(validateContactForm({ ...VALID, subject: '' }).subject).toBe(
      'contact.errors.subjectRequired',
    );
  });

  it('requires a message', () => {
    expect(validateContactForm({ ...VALID, message: '' }).message).toBe(
      'contact.errors.messageRequired',
    );
  });

  it('rejects a message that is too short', () => {
    expect(validateContactForm({ ...VALID, message: 'hi' }).message).toBe(
      'contact.errors.messageTooShort',
    );
  });
});

describe('isContactFormValid', () => {
  it('is true for an empty error object', () => {
    expect(isContactFormValid({})).toBeTrue();
  });

  it('is false when any field has an error', () => {
    expect(isContactFormValid({ email: 'contact.errors.emailRequired' })).toBeFalse();
  });
});

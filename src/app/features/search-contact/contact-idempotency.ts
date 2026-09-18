/**
 * design-decisions.md "Contact-Form Submission Idempotency": pure idempotency-key logic for the
 * Contact form (PWEB-25) -- kept DOM/storage-free so it is exhaustively unit-testable, adapting
 * `ums-admission-web`'s `payment-idempotency.ts`'s `generateIdempotencyKey` fallback pattern to
 * this app's own lowest-stakes anonymous mutation. `contact-form.component.ts` owns the actual
 * `sessionStorage` read/write (mirrors this repo's "pure logic lives outside the component"
 * convention, e.g. `registration-form.validation.ts`) and calls into these functions to decide
 * what to do with what it read.
 *
 * `edge-cases.md`'s "Contact-Form Submission Retried by an Impatient Visitor or a Network
 * Timeout...": "disable-on-click alone doesn't survive a page reload or a genuine network-level
 * retry that outlives the disabled-button state" -- the in-memory disabled-button guard is reset
 * by a reload, but `sessionStorage` is not, so the SAME key survives a reload of an attempt whose
 * outcome was never recorded (`status: 'pending'`) and is reused verbatim for the retry. Once an
 * outcome DOES land (`markAttemptTerminal`), the attempt is over -- the visitor's next submission
 * (a genuinely new inquiry, or a corrected resubmission) mints a fresh key.
 */
export interface PersistedContactAttempt {
  readonly key: string;
  readonly status: 'pending' | 'terminal';
}

/** A fresh idempotency key for a brand-new contact-form attempt. */
export function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `contact-idempotency-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Given whatever was found in storage (`null` if nothing, or a corrupt/unparsable value the
 * caller already normalized to `null`), decides the key/status to use for THIS submit attempt --
 * a still-`pending` prior attempt is reused verbatim (the reload/retry case above); anything else
 * (no prior attempt, or a prior attempt that already reached a `terminal` outcome) mints a fresh
 * one.
 */
export function resolveAttempt(stored: PersistedContactAttempt | null): PersistedContactAttempt {
  if (stored && stored.status === 'pending') {
    return stored;
  }
  return { key: generateIdempotencyKey(), status: 'pending' };
}

/** Marks the given attempt as done -- the next call to {@link resolveAttempt} will mint a new key. */
export function markAttemptTerminal(current: PersistedContactAttempt): PersistedContactAttempt {
  return { ...current, status: 'terminal' };
}

import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { UmsButtonComponent, UmsInputComponent, UmsTextareaComponent } from '@ums/design-system';
import { NotificationsApiService } from '../../core/http/notifications-api.service';
import type { SubmitInquiryOutcome } from '../../core/http/notifications-api.models';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import {
  markAttemptTerminal,
  resolveAttempt,
  type PersistedContactAttempt,
} from './contact-idempotency';
import {
  isContactFormValid,
  validateContactForm,
  type ContactFormErrors,
} from './contact-form.validation';

const STORAGE_KEY = 'pweb-contact-attempt';

/**
 * PWEB-25: Contact/inquiry form -- the app's ONE anonymous write (requirement-spec.md §3.7).
 *
 * Implements design-decisions.md's "Contact-Form Submission Idempotency" in full:
 * - **Disable-on-click**: {@link submitting} disables the submit button for the duration of the
 *   in-flight request, guarding against a fast double-click.
 * - **A client-generated, short-lived, per-attempt idempotency token**, persisted to
 *   `sessionStorage` (not just an in-memory signal) so it survives exactly the failure mode
 *   disable-on-click alone cannot: a page reload after a slow/timed-out request whose outcome the
 *   visitor never saw. See `contact-idempotency.ts`'s doc comment for the full mechanism.
 *
 * Handles the interim `NotificationsApiService.submitInquiry` contract's every documented outcome
 * gracefully (accepted/rateLimited/captchaRequired/invalid/unavailable) -- `'unavailable'` is
 * today's actual reality (the interim endpoint doesn't exist yet server-side, per
 * `notifications-api.models.ts`'s doc comment), rendered as an honest "can't submit right now,
 * please email us directly" state rather than a silent failure or a fabricated success.
 */
@Component({
  selector: 'pweb-contact-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UmsInputComponent, UmsTextareaComponent, UmsButtonComponent, TranslatePipe],
  host: { class: 'pweb-contact-form' },
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss',
})
export class ContactFormComponent {
  private readonly notificationsApi = inject(NotificationsApiService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly subject = signal('');
  protected readonly message = signal('');
  protected readonly errors = signal<ContactFormErrors>({});
  protected readonly submitting = signal(false);
  protected readonly outcome = signal<SubmitInquiryOutcome | null>(null);

  private attempt: PersistedContactAttempt;

  constructor() {
    this.attempt = this.loadOrCreateAttempt();
  }

  protected onSubmit(): void {
    // Disable-on-click: a second click while a request is already in flight is a no-op, not a
    // second submission.
    if (this.submitting()) {
      return;
    }

    const values = {
      name: this.name(),
      email: this.email(),
      subject: this.subject(),
      message: this.message(),
    };
    const errors = validateContactForm(values);
    this.errors.set(errors);
    if (!isContactFormValid(errors)) {
      return;
    }

    this.submitting.set(true);
    this.notificationsApi.submitInquiry(values, this.attempt.key).subscribe((result) => {
      this.submitting.set(false);
      this.outcome.set(result);
      this.attempt = markAttemptTerminal(this.attempt);
      this.persistAttempt(this.attempt);

      if (result.kind === 'accepted') {
        this.resetForm();
      }
    });
  }

  /** Starting a fresh inquiry after a terminal outcome mints a new attempt (new idempotency key). */
  protected startNewInquiry(): void {
    this.outcome.set(null);
    this.errors.set({});
    this.attempt = resolveAttempt(null);
    this.persistAttempt(this.attempt);
  }

  private resetForm(): void {
    this.name.set('');
    this.email.set('');
    this.subject.set('');
    this.message.set('');
  }

  private loadOrCreateAttempt(): PersistedContactAttempt {
    if (!isPlatformBrowser(this.platformId)) {
      // SSR shell only -- no real submission ever happens server-side; the client-side hydrated
      // instance re-resolves against sessionStorage the moment it runs for real.
      return resolveAttempt(null);
    }

    const stored = this.readStoredAttempt();
    const attempt = resolveAttempt(stored);
    this.persistAttempt(attempt);
    return attempt;
  }

  private readStoredAttempt(): PersistedContactAttempt | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as PersistedContactAttempt) : null;
    } catch {
      // Corrupt storage value or storage-restricted browser setting -- treat as "no prior attempt".
      return null;
    }
  }

  private persistAttempt(attempt: PersistedContactAttempt): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attempt));
    } catch {
      // Best-effort only -- matches LocaleService's own storage-write fallback posture.
    }
  }
}

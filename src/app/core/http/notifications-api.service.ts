import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { toUmsApiError } from '@ums/shared';
import { PublicApiBase } from './public-api.base';
import type { ContactInquiryRequest, SubmitInquiryOutcome } from './notifications-api.models';

/**
 * `Notifications` public inquiry-intake client (PWEB-25). Calls the interim, **not-yet-built**
 * `POST /api/v1/notifications/public/inquiries` contract documented in
 * `notifications-api.models.ts` -- see that file's doc comment for the full, source-confirmed
 * explanation of why no real anonymous endpoint exists yet.
 *
 * Never throws: every failure mode requirement-spec.md §5/§25's edge-cases document call for --
 * rate-limited (429), CAPTCHA-required, validation failure, or the endpoint simply not existing
 * yet (404) -- resolves to its own typed {@link SubmitInquiryOutcome}, so `contact-form.component.ts`
 * never special-cases a thrown error versus a "the server said no" outcome.
 */
@Injectable({ providedIn: 'root' })
export class NotificationsApiService extends PublicApiBase {
  submitInquiry(
    request: ContactInquiryRequest,
    idempotencyKey: string,
  ): Observable<SubmitInquiryOutcome> {
    return this.http
      .post<unknown>(this.apiUrl('notifications/public/inquiries'), request, {
        headers: new HttpHeaders({ 'Idempotency-Key': idempotencyKey }),
      })
      .pipe(
        map((): SubmitInquiryOutcome => ({ kind: 'accepted' })),
        catchError((error: unknown) => of(this.toOutcome(error))),
      );
  }

  private toOutcome(error: unknown): SubmitInquiryOutcome {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 429) {
        const retryAfterHeader = error.headers.get('Retry-After');
        const retryAfterSeconds = retryAfterHeader ? Number.parseInt(retryAfterHeader, 10) : NaN;
        return {
          kind: 'rateLimited',
          retryAfterSeconds: Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : null,
        };
      }

      const apiError = toUmsApiError(error);
      if (error.status === 400 && apiError.code === 'notification.captcha_required') {
        return { kind: 'captchaRequired' };
      }
      if (error.status === 400 || error.status === 422) {
        return { kind: 'invalid', message: apiError.message };
      }
    }

    // 404 (the route doesn't exist yet -- today's reality) and any network-level failure both
    // degrade to the same honest "can't submit right now" outcome.
    return { kind: 'unavailable' };
  }
}

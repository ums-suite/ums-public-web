/**
 * `Notifications` public inquiry-intake contract (PWEB-25).
 *
 * **CONFIRMED GAP, not a guess** (PWEB-25 research, read directly against `ums-core`'s
 * `Notifications` module source): there is NO public HTTP endpoint anywhere in the `Notifications`
 * module that accepts an anonymous inquiry. The module's own real submission path,
 * `INotificationRequestIntake`/`SubmitNotificationRequestService`, is an **in-process-only**
 * interface -- confirmed by `IOtpRateLimiter`'s own doc comment ("the in-process
 * `INotificationRequestIntake` path ... not an inbound HTTP request") and by every one of its
 * callers being another backend module's own application service, never an HTTP endpoint. The
 * ONE HTTP route that touches it (`DevOnlyTestEndpoints.cs`'s `POST /_dev/test-submit`) is
 * explicitly dev-only and requires a `RecipientId` (`Guid`) the caller must already know -- an
 * anonymous public-website visitor has no such id and no legitimate way to obtain one.
 *
 * This DTO/outcome shape is the documented, proposed interim contract this app is built against --
 * modeled on `SubmitNotificationRequestCommand`'s own real shape (`sourceModule`/`eventType`/
 * `payloadJson`), reduced to the minimal anonymous-safe fields a future
 * `POST /api/v1/notifications/public/inquiries` would need. `NotificationsApiService.submitInquiry`
 * calls this exact interim path and resolves to `{ kind: 'unavailable' }` on a 404 (today's
 * reality, since the route doesn't exist) -- same posture as `AdmissionApiService`'s degrade-to-
 * null for its own documented gap. Flagged prominently in this app's PR as a blocking cross-team
 * backend gap.
 */
export interface ContactInquiryRequest {
  readonly name: string;
  readonly email: string;
  readonly subject: string;
  readonly message: string;
}

/**
 * design-decisions.md "Contact-Form Submission Idempotency": every submission carries this
 * client-generated, short-lived, per-attempt token as an `Idempotency-Key` request header. A
 * retried request (page reload, network-level retry, or an impatient re-click before
 * disable-on-click has visibly taken effect) reuses the SAME token for the SAME attempt, so a
 * dedup-capable backend can collapse it to one accepted request/one fan-out email -- never
 * generated fresh per HTTP call, only per NEW attempt (`contact-idempotency.ts`).
 */
export type SubmitInquiryOutcome =
  | { readonly kind: 'accepted' }
  /** requirement-spec.md §5: rate-limited server-side; `retryAfterSeconds` is best-effort from a `Retry-After` header. */
  | { readonly kind: 'rateLimited'; readonly retryAfterSeconds: number | null }
  /** requirement-spec.md §5: CAPTCHA/abuse-protected server-side -- this app never implements CAPTCHA itself, only handles the server's refusal gracefully. */
  | { readonly kind: 'captchaRequired' }
  | { readonly kind: 'invalid'; readonly message: string }
  /** The interim endpoint doesn't exist yet (404) or a network-level failure occurred -- the documented gap above, at request time. */
  | { readonly kind: 'unavailable' };

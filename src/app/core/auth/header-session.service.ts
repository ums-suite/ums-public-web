import { Injectable, computed, inject } from '@angular/core';
import { CurrentUserService } from '@ums/shared';

/**
 * PWEB-6: SSO-aware header state, BFF pattern (ADR-0005) -- reflects a visitor who is ALSO
 * signed in elsewhere in the platform (`ums-student-web`/`ums-faculty-web`/`ums-alumni-web`/
 * `ums-admin-web`), browsing this public site anonymously.
 *
 * Wraps `@ums/shared`'s `CurrentUserService` (the same primitive `ums-admission-web`/
 * `ums-student-web` use) rather than reinventing session detection -- but exposes only identity/
 * role metadata, deliberately never anything resembling a domain-data fetch. This is the one
 * concrete implementation surface for Domain Invariant #1 ("no page ever presents personalized or
 * authenticated data") on the header: `SiteHeaderComponent` may say "Signed in as Student" and
 * link out to the right portal, but must never call an authenticated endpoint or render any
 * fetched personal record here.
 */
@Injectable({ providedIn: 'root' })
export class HeaderSessionService {
  private readonly currentUser = inject(CurrentUserService);

  readonly isAuthenticated = computed(() => this.currentUser.userId() !== null);
  readonly primaryRole = computed<string | null>(() => this.currentUser.roles()[0] ?? null);
}

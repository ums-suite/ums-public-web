import { DOCUMENT } from '@angular/common';
import { Injectable, PLATFORM_ID, REQUEST, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { buildLocaleCookie, LOCALE_COOKIE_NAME, readCookieValue } from './locale-cookie.util';
import { PWEB_DEFAULT_LOCALE, PwebLocale, isPwebLocale } from './locale.types';

/**
 * PWEB-3: this app's own locale mechanism -- deliberately NOT `@ums/shared`'s `LocaleService`.
 *
 * `@ums/shared`'s `LocaleService` persists to `localStorage`, which is unreadable during SSR --
 * every server-rendered response would silently default to English regardless of a returning
 * visitor's actual choice, then flip to their real language only once the client bundle hydrates
 * and reads `localStorage`. That is exactly the "client-only language flash before hydration"
 * requirement-spec.md §2's i18n row and Domain Invariant #3 rule out for this app specifically
 * (the other apps' client-only switching is fine for them precisely because they're CSR-only/
 * authenticated -- this app's whole reason for SSR is defeated by a locale that isn't known until
 * hydration).
 *
 * Resolution order for the initial value:
 * 1. Server render (`REQUEST` present, `RenderMode.Server` only): parse the incoming `Cookie`
 *    header -- this is what makes the *first* server-rendered byte already correct for a
 *    returning visitor, deep-linked or not.
 * 2. Client (`REQUEST` absent, running in the browser): read `document.cookie` directly, so a
 *    page reload / non-SSR navigation still resolves correctly before this service's own signal
 *    is ever touched.
 * 3. Neither (first-ever visit, OR a `RenderMode.Prerender` route -- PWEB-21 -- where there is no
 *    real visitor/request at all): {@link PWEB_DEFAULT_LOCALE}, per ADR-0011. `document.cookie` is
 *    deliberately never read outside the browser: `@angular/ssr` only provides `REQUEST` under
 *    `RenderMode.Server` (confirmed against its own source, see `app.routes.server.ts`'s doc
 *    comment), and a bare Prerender build has no real `document.cookie` to read at all -- the
 *    server's own DOM shim throws rather than returning an empty string, so this MUST be gated by
 *    `isPlatformBrowser` rather than merely "`REQUEST` is falsy".
 */
@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly request = inject(REQUEST, { optional: true });

  readonly locale = signal<PwebLocale>(this.readInitialLocale());

  constructor() {
    this.document.documentElement.lang = this.locale();
  }

  setLocale(locale: PwebLocale): void {
    this.locale.set(locale);
    this.document.documentElement.lang = locale;
    this.writeClientCookie(locale);
  }

  private readInitialLocale(): PwebLocale {
    if (this.request) {
      const stored = readCookieValue(this.request.headers.get('cookie'), LOCALE_COOKIE_NAME);
      return isPwebLocale(stored) ? stored : PWEB_DEFAULT_LOCALE;
    }

    if (!isPlatformBrowser(this.platformId)) {
      // A RenderMode.Prerender route (PWEB-21): no REQUEST, no real visitor, and no real
      // document.cookie to read -- the default is correct here, not a fallback of last resort.
      return PWEB_DEFAULT_LOCALE;
    }

    const stored = readCookieValue(this.document.cookie, LOCALE_COOKIE_NAME);
    return isPwebLocale(stored) ? stored : PWEB_DEFAULT_LOCALE;
  }

  private writeClientCookie(locale: PwebLocale): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      this.document.cookie = buildLocaleCookie(locale);
    } catch {
      // Cookie writes can throw under storage-restricted browser settings -- best-effort only,
      // matching @ums/shared's/design-system's own persistence services' fallback posture.
    }
  }
}

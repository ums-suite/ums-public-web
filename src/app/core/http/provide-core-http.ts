import { EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor, correlationIdInterceptor, UMS_AUTH_CONFIG } from '@ums/shared';
import { APP_CONFIG } from '../config/app-config';
import { environment } from '../../../environments/environment';
import { localeApiInterceptor } from './locale-api.interceptor';

/**
 * Wires this app's entire HTTP/API-client layer (PWEB-4, requirement-spec.md §2/§6).
 *
 * Interceptor order:
 * 1. {@link correlationIdInterceptor} (`@ums/shared`) first, so every request -- including one
 *    that never reaches a real backend concept yet (see `AdmissionApiService`) -- still carries
 *    `X-Correlation-Id` for PWEB-8's observability wiring.
 * 2. {@link localeApiInterceptor} (this app's own, PWEB-3) next, so it's always applied regardless
 *    of what happens further down the chain.
 * 3. `@ums/shared`'s {@link authInterceptor} last -- this app is almost entirely anonymous
 *    (Domain Invariant #1), but a visitor who also holds a session from `ums-student-web`/
 *    `ums-admin-web`/etc. (shared-domain SSO, PWEB-6) should have it attached automatically to
 *    any call that happens to need it, without this app's own code branching on auth state.
 *    `authInterceptor` itself is a no-op when no session/token is present.
 *
 * `APP_CONFIG` is provided directly from `environment.ts` (not injected from a deferred source)
 * because every one of this app's own `PublicApiBase` subclasses reads it synchronously at
 * construction time.
 */
export function provideCoreHttp(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: APP_CONFIG,
      useValue: {
        apiBaseUrl: environment.apiBaseUrl,
        admissionWebUrl: environment.admissionWebUrl,
      },
    },
    provideHttpClient(
      withInterceptors([correlationIdInterceptor, localeApiInterceptor, authInterceptor]),
    ),
    {
      provide: UMS_AUTH_CONFIG,
      useFactory: () => ({ baseUrl: inject(APP_CONFIG).apiBaseUrl }),
    },
  ]);
}

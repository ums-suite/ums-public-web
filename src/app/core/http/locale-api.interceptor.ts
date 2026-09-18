import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LocaleService } from '../i18n/locale.service';

/**
 * Propagates this app's own {@link LocaleService} locale to every outgoing `ums-core` request
 * (PWEB-3/PWEB-4), covering both language-resolution conventions confirmed against the real
 * source (PWEB-4 research): `Organization`'s endpoints read a `?lang=` query parameter;
 * `Content`'s endpoints read the standard `Accept-Language` header instead. Sending both
 * unconditionally is safe -- a module that reads one simply ignores the other.
 *
 * Skips a request that already carries an explicit `lang` query parameter (a caller intentionally
 * requesting a specific language for one call, overriding the ambient locale) -- mirrors
 * `@ums/shared`'s own `localeInterceptor` convention, kept independent of it here because this
 * app's `LocaleService` (SSR-cookie-backed, PWEB-3) is a different token than `@ums/shared`'s
 * (`localStorage`-backed).
 */
export const localeApiInterceptor: HttpInterceptorFn = (req, next) => {
  const locale = inject(LocaleService).locale();

  if (req.params.has('lang')) {
    return next(req);
  }

  return next(
    req.clone({
      params: req.params.set('lang', locale),
      setHeaders: { 'Accept-Language': locale },
    }),
  );
};

import { LOCALE_COOKIE_NAME } from './locale-cookie.util';

/**
 * Test-only helper. Karma's `@angular/build:unit-test` runner has no supported "global setup
 * file" hook (`setupFiles` is a Vitest-only option -- confirmed: Karma logs "does not support the
 * setupFiles option" and silently ignores it), so there is no single-file way to reset browser
 * state after every spec platform-wide. Karma also runs every `*.spec.ts` in one shared browser
 * page, so a real `document.cookie` written by `LocaleService.setLocale` (PWEB-3) -- directly, or
 * indirectly via a component like `SiteHeaderComponent`'s locale toggle -- persists into every
 * OTHER spec file that runs afterward in the same session.
 *
 * Every spec file that exercises `setLocale` (directly or indirectly) MUST call this in its own
 * `afterEach`.
 */
export function clearLocaleCookieForTest(): void {
  document.cookie = `${LOCALE_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

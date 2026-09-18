import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Server render-mode map (PWEB-1, requirement-spec.md §2 Rendering row).
 *
 * Every route this app serves is SSR-mandatory -- unlike `ums-admission-web`'s pre-login/
 * authenticated-funnel split, this app has no CSR-only section at all (it is almost entirely
 * anonymous and read-only, §1). `RenderMode.Server` (not `RenderMode.Prerender`) is used for
 * every dynamic, data-backed route below because:
 *
 * - Domain Invariant #2/#3 (publish-window-accurate content, SSR-readable locale cookie) both
 *   depend on `REQUEST`/`RESPONSE_INIT` being available per-request (only true under
 *   `RenderMode.Server` -- Angular only provides these two tokens for that render mode, verified
 *   directly against `@angular/ssr`'s own source), which `RenderMode.Prerender`'s build-time
 *   render cannot offer.
 * - PWEB-5's per-route `Cache-Control` header wiring (`core/cache/response-cache.service.ts`)
 *   likewise needs a live `RESPONSE_INIT` per request.
 *
 * `RenderMode.Prerender` is reserved for §2's fully-static tier (About, Campus Information --
 * PWEB-21, not yet built) -- genuinely content-that-almost-never-changes pages with no
 * publish-window/locale-cookie concerns, which is a materially different bar than "cacheable for
 * a few minutes." Add those paths here as their own `RenderMode.Prerender` entries when PWEB-21
 * lands; don't retrofit today's dynamic routes to Prerender to "look" faster.
 */
export const serverRoutes: ServerRoute[] = [
  {
    // PWEB-21: genuinely static content with no publish-window/locale-cookie/per-request
    // dependency -- the exact bar this file's own class doc reserves `RenderMode.Prerender` for.
    path: 'campus-information',
    renderMode: RenderMode.Prerender,
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];

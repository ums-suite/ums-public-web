/**
 * PWEB-5: named `Cache-Control` policies a route opts into via its `data.cacheControl` field,
 * resolved server-side by {@link ResponseCacheService}.
 *
 * requirement-spec.md §2 (Caching row) calls for "full-page CDN cache for anonymous,
 * non-personalized routes" with §9's backstop -- "a short max-age... so a correction is never
 * invisible for more than a few minutes" -- reconciled against Domain Invariant #2 (publish-state
 * accuracy at read time) by design-decisions.md's SSR/Hydration Freshness Policy, which handles
 * the *residual* staleness within that backstop window rather than by shortening the backstop
 * itself for every route.
 */
export type RouteCachePolicyName = 'editorial-page' | 'no-store';

export interface RouteCachePolicy {
  readonly headerValue: string;
}

const EDITORIAL_PAGE: RouteCachePolicy = {
  headerValue: 'public, max-age=180, stale-while-revalidate=300',
};

/** Reserved for the contact form's CSR-shelled piece (PWEB-25) and any route that must never be cached. */
const NO_STORE: RouteCachePolicy = {
  headerValue: 'no-store',
};

export const ROUTE_CACHE_POLICIES: Readonly<Record<RouteCachePolicyName, RouteCachePolicy>> = {
  'editorial-page': EDITORIAL_PAGE,
  'no-store': NO_STORE,
};

import { Injectable, RESPONSE_INIT, inject } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { ROUTE_CACHE_POLICIES, type RouteCachePolicyName } from './route-cache-policy';

function deepestCacheControlPolicy(root: ActivatedRouteSnapshot): RouteCachePolicyName | undefined {
  let current: ActivatedRouteSnapshot | null = root;
  let resolved: RouteCachePolicyName | undefined;

  while (current) {
    const candidate = current.data['cacheControl'] as RouteCachePolicyName | undefined;
    if (candidate) {
      resolved = candidate;
    }
    current = current.firstChild;
  }

  return resolved;
}

/**
 * PWEB-5: sets a real `Cache-Control` response header from the SSR server for the currently
 * activated route, per {@link ROUTE_CACHE_POLICIES}. A no-op in the browser and in any render
 * mode where Angular does not provide `RESPONSE_INIT` (only `RenderMode.Server` gets a live,
 * per-request value -- verified directly against `@angular/ssr`'s own source, see
 * `app.routes.server.ts`'s doc comment).
 *
 * Deepest-route-wins: a leaf route's own `data.cacheControl` overrides an ancestor's, so a
 * future route needing a different policy than its parent's default can simply declare its own.
 * A route with no `cacheControl` data at all gets no explicit header from this app (falls back to
 * whatever the CDN/hosting layer's own default is) rather than a guessed default.
 */
@Injectable({ providedIn: 'root' })
export class ResponseCacheService {
  private readonly responseInit = inject(RESPONSE_INIT, { optional: true });
  private readonly router = inject(Router);

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.applyForCurrentRoute();
    });
  }

  private applyForCurrentRoute(): void {
    if (!this.responseInit) {
      return;
    }

    const policyName = deepestCacheControlPolicy(this.router.routerState.snapshot.root);
    if (!policyName) {
      return;
    }

    const policy = ROUTE_CACHE_POLICIES[policyName];
    this.responseInit.headers = new Headers(this.responseInit.headers);
    this.responseInit.headers.set('Cache-Control', policy.headerValue);
  }
}

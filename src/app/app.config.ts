import {
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
  provideEnvironmentInitializer,
} from '@angular/core';
import { provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { ResponseCacheService } from './core/cache/response-cache.service';
import { provideCoreHttp } from './core/http/provide-core-http';
import { provideObservability } from './core/observability/provide-observability';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    // design-decisions.md "Cache-Lifetime Segmentation for Invariant-Critical UI Fragments":
    // the Apply Now CTA's own campaign-window read is excluded from the SSR->client TransferState
    // cache so it is never silently reused as a stale value across the hydration boundary -- every
    // render (server AND the client's own post-hydration freshness re-check) issues a genuinely
    // fresh request. See `shared/ui/cta/apply-now-cta.component.ts` and
    // `core/http/admission-api.service.ts`.
    provideClientHydration(
      withHttpTransferCacheOptions({
        filter: (req) => !req.url.includes('/admission/campaigns'),
      }),
    ),
    provideCoreHttp(),
    provideObservability(),
    // Forces ResponseCacheService's constructor (and its Router.events subscription) to run at
    // bootstrap rather than waiting for some other injection point to first request it (PWEB-5).
    provideEnvironmentInitializer(() => inject(ResponseCacheService)),
  ],
};

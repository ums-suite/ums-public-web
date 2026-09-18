import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ErrorHandler, Injectable, PLATFORM_ID, inject } from '@angular/core';
import { generateCorrelationId } from './correlation.util';

export interface RouteErrorReport {
  readonly correlationId: string;
  readonly path: string;
  readonly message: string;
}

export type RouteErrorReporter = (report: RouteErrorReport) => void;

export const consoleRouteErrorReporter: RouteErrorReporter = (report) => {
  console.error('[route-error]', report);
};

/**
 * PWEB-8: route-level error logging, correlated via a fresh {@link generateCorrelationId} the
 * same way `@ums/shared`'s `correlationIdInterceptor` correlates an HTTP request -- logged
 * alongside the current path so an error report is traceable back to the page a visitor was on,
 * without ever including any personal/authenticated data (Domain Invariant #1: this app's
 * anonymous-by-default posture applies to its own diagnostics too).
 */
@Injectable({ providedIn: 'root' })
export class PwebErrorHandler implements ErrorHandler {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly reporter: RouteErrorReporter = consoleRouteErrorReporter;

  handleError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    const path = isPlatformBrowser(this.platformId)
      ? (this.document.location?.pathname ?? '/')
      : 'ssr';

    this.reporter({ correlationId: generateCorrelationId(), path, message });
  }
}

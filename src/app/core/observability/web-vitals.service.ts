import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { generateCorrelationId } from './correlation.util';
import {
  accumulateClsValue,
  consoleWebVitalReporter,
  type WebVitalReporter,
} from './web-vitals.types';

/**
 * PWEB-8: Core Web Vitals collection (requirement-spec.md §2 Observability row / §4's Lighthouse
 * NFR). Browser-only (`PerformanceObserver` has no server-side meaning); a no-op during SSR.
 *
 * Each metric gets its own `correlationId` (PWEB-8) rather than sharing one across a whole page
 * view -- LCP/CLS/INP settle at different points in a page's lifecycle (LCP shortly after paint,
 * CLS/INP only once the visitor leaves), so a shared id would imply a false simultaneity these
 * measurements never actually have.
 */
@Injectable({ providedIn: 'root' })
export class WebVitalsService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private reporter: WebVitalReporter = consoleWebVitalReporter;
  private clsValue = 0;

  init(reporter: WebVitalReporter = consoleWebVitalReporter): void {
    if (!isPlatformBrowser(this.platformId) || typeof PerformanceObserver === 'undefined') {
      return;
    }
    this.reporter = reporter;

    this.observeLargestContentfulPaint();
    this.observeCumulativeLayoutShift();
    this.observeFirstInputDelayAsInp();
  }

  private get path(): string {
    return this.document.location?.pathname ?? '/';
  }

  private report(metric: 'LCP' | 'CLS' | 'INP', value: number): void {
    this.reporter({ metric, value, path: this.path, correlationId: generateCorrelationId() });
  }

  private observeLargestContentfulPaint(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries.at(-1);
        if (last) {
          this.report('LCP', last.startTime);
        }
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
      // Unsupported entry type in this browser -- degrade silently, never block rendering.
    }
  }

  private observeCumulativeLayoutShift(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & {
          value: number;
          hadRecentInput: boolean;
        })[]) {
          this.clsValue = accumulateClsValue(this.clsValue, entry);
        }
        this.report('CLS', this.clsValue);
      });
      observer.observe({ type: 'layout-shift', buffered: true });
    } catch {
      // Unsupported entry type in this browser -- degrade silently.
    }
  }

  private observeFirstInputDelayAsInp(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & {
          processingStart: number;
        })[]) {
          this.report('INP', entry.processingStart - entry.startTime);
        }
      });
      observer.observe({ type: 'first-input', buffered: true });
    } catch {
      // Unsupported entry type in this browser -- degrade silently.
    }
  }
}

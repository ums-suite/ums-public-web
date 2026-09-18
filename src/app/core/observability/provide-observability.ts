import {
  ErrorHandler,
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { PwebErrorHandler } from './pweb-error-handler';
import { WebVitalsService } from './web-vitals.service';

/** PWEB-8: wires route-level error logging and Core Web Vitals collection at bootstrap. */
export function provideObservability(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: ErrorHandler, useClass: PwebErrorHandler },
    provideEnvironmentInitializer(() => inject(WebVitalsService).init()),
  ]);
}

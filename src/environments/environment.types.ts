/**
 * Shared shape for `environment.ts`/`environment.development.ts`. Deliberately its own file
 * (neither of the two swapped via `angular.json`'s `fileReplacements`) -- `environment.ts` is
 * replaced wholesale by `environment.development.ts`'s content in the `development`
 * configuration, so if `environment.development.ts` imported this type FROM `./environment`
 * instead, the replacement would make it import from itself.
 */
export interface Environment {
  readonly production: boolean;
  /** `ums-core`'s base origin -- every hand-rolled public API client (PWEB-4) is built off this. */
  readonly apiBaseUrl: string;
  /** Base origin `ums-admission-web` is deployed at -- the "Apply Now" CTA deep-links here (§1). */
  readonly admissionWebUrl: string;
}

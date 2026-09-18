import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { toUmsApiError, type UmsApiError } from '@ums/shared';
import { APP_CONFIG } from '../config/app-config';

/**
 * Base for this app's hand-rolled public `ums-core` data-access clients (PWEB-4).
 *
 * `@ums/shared`'s generated OpenAPI client is a stale one-time snapshot covering only Identity/
 * Audit/Organization (~41 paths, confirmed: `ums-shared/README.md` "Status") -- and even its
 * `OrganizationApiService` types every response as bare `Observable<{}>`, useless for a real
 * consumer. Every one of this app's own public data-access services extends this class instead,
 * built against routes/DTOs read directly from `ums-core`'s C# source (PWEB-4 research), not
 * guessed and not trusted from the generated client's shape:
 *
 * - shares the exact same base URL and interceptor chain (correlation id, locale) as everything
 *   else in this app (`provide-core-http.ts`);
 * - normalizes every failure through `toUmsApiError`, so a feature never special-cases "hand-
 *   rolled client" error handling versus "generated client" error handling;
 * - swapping a concrete subclass for a real generated equivalent later (once `ums-shared`
 *   refreshes its OpenAPI snapshot) is a mechanical class swap, not a rewrite.
 *
 * Each concrete subclass's own doc comment names the exact endpoint path(s) it assumes and
 * whether they were directly confirmed against `ums-core`'s source or are a documented,
 * flagged-as-unconfirmed interim contract (see `admission-api.service.ts` for the one case of the
 * latter in this app).
 */
export abstract class PublicApiBase {
  protected readonly http = inject(HttpClient);
  private readonly appConfig = inject(APP_CONFIG);

  protected get baseUrl(): string {
    return this.appConfig.apiBaseUrl;
  }

  /** Builds `{baseUrl}/api/v1/{path}}`, matching `ums-core`'s own route convention exactly. */
  protected apiUrl(path: string): string {
    const trimmed = path.startsWith('/') ? path.slice(1) : path;
    return `${this.baseUrl}/api/v1/${trimmed}`;
  }

  /** Drops `undefined`/`null` entries so optional query params are never sent as the string `"undefined"`. */
  protected buildParams(
    params: Readonly<Record<string, string | number | boolean | undefined | null>>,
  ): HttpParams {
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return httpParams;
  }

  protected normalizeErrors<T>(source$: Observable<T>): Observable<T> {
    return source$.pipe(
      catchError((error: unknown) => throwError(() => toUmsApiError(error) satisfies UmsApiError)),
    );
  }
}

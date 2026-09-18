import { Injectable, inject } from '@angular/core';
import { Observable, Subject, forkJoin, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { ContentApiService } from '../../core/http/content-api.service';
import { OrganizationApiService } from '../../core/http/organization-api.service';
import {
  EMPTY_SEARCH_RESULTS,
  STATIC_SEARCH_PAGES,
  matchesQuery,
  type EventSearchResult,
  type NoticeSearchResult,
  type PageSearchResult,
  type ProgramSearchResult,
  type SiteSearchResults,
} from './site-search.models';

/** As-you-type debounce -- long enough to avoid a request per keystroke, short enough to still feel "instant" (requirement-spec.md §7). */
export const SEARCH_DEBOUNCE_MS = 250;
/** A pragmatic bound on how much of each real list this client-side search scans -- mirrors `ProgramCatalogStore`'s own `CATALOG_PAGE_SIZE` reasoning. */
const SEARCH_POOL_SIZE = 200;

/**
 * PWEB-24: site-wide search aggregation.
 *
 * Implements design-decisions.md's "Search-Overlay Request Concurrency Control -- Cancellation on
 * Supersession" (`edge-cases.md`'s "A Debounced Search Re-Type Racing Its Own Prior Request..."):
 * every call to {@link search} pushes onto {@link query$}, piped through `switchMap` -- RxJS's own
 * cancellation-on-supersession operator. The instant a newer query arrives, `switchMap`
 * unsubscribes the still-in-flight previous `forkJoin` (and, transitively, every HTTP request
 * inside it -- Angular's `HttpClient` observables abort their underlying request on unsubscribe),
 * so a stale "bio" response can never race ahead of and overwrite a newer "biotech" one, and the
 * backend is never left doing wasted work for a result that will never be shown.
 *
 * No dedicated backend search endpoint exists anywhere in `Organization`/`Content`/`Faculty`
 * (confirmed: no `q`/`search` query parameter on any real list endpoint, PWEB-24 research) --
 * every group here is a client-side substring filter over a bounded, already-paginated real list,
 * the same "instant client-side re-filter on already-fetched data" posture `ProgramCatalogStore`
 * (PWEB-12) already established for this exact class of backend limitation. `Faculty` is omitted
 * entirely (see `site-search.models.ts`'s doc comment) rather than searched against nothing.
 */
@Injectable({ providedIn: 'root' })
export class SiteSearchService {
  private readonly organizationApi = inject(OrganizationApiService);
  private readonly contentApi = inject(ContentApiService);

  private readonly query$ = new Subject<string>();

  readonly results$: Observable<SiteSearchResults> = this.query$.pipe(
    debounceTime(SEARCH_DEBOUNCE_MS),
    distinctUntilChanged(),
    switchMap((query) => this.runSearch(query)),
  );

  /** Pushes a new query -- the live, as-you-type entry point (debounced + cancellation-on-supersession, see class doc). */
  search(query: string): void {
    this.query$.next(query);
  }

  /**
   * The SSR-crawlable entry point (`search-page.component.ts`): a direct, un-debounced search for
   * a URL's own `?q=` value -- a server-rendered response for a specific query string must not
   * wait out a client-only debounce window that exists purely to smooth live keystrokes.
   */
  searchImmediate(query: string): Observable<SiteSearchResults> {
    return this.runSearch(query);
  }

  private runSearch(query: string): Observable<SiteSearchResults> {
    const trimmed = query.trim();
    if (!trimmed) {
      return of(EMPTY_SEARCH_RESULTS);
    }

    return forkJoin({
      programs: this.searchPrograms(trimmed),
      notices: this.searchNotices(trimmed),
      events: this.searchEvents(trimmed),
      pages: of(this.searchPages(trimmed)),
    });
  }

  private searchPrograms(query: string): Observable<readonly ProgramSearchResult[]> {
    return this.organizationApi.listPrograms({ take: SEARCH_POOL_SIZE }).pipe(
      map((page) =>
        page.items
          .filter((program) => matchesQuery(program.localizedName || program.name, query))
          .map((program) => ({ id: program.id, title: program.localizedName || program.name })),
      ),
      catchError(() => of([])),
    );
  }

  private searchNotices(query: string): Observable<readonly NoticeSearchResult[]> {
    return this.contentApi.listNotices({ skip: 0, take: SEARCH_POOL_SIZE }).pipe(
      map((page) =>
        page.items
          .filter((notice) => matchesQuery(notice.title, query))
          .map((notice) => ({ id: notice.id, title: notice.title })),
      ),
      catchError(() => of([])),
    );
  }

  private searchEvents(query: string): Observable<readonly EventSearchResult[]> {
    return this.contentApi
      .listEvents({ skip: 0, take: SEARCH_POOL_SIZE, from: new Date().toISOString() })
      .pipe(
        map((page) =>
          page.items
            .filter((event) => matchesQuery(event.title, query))
            .map((event) => ({ id: event.id, title: event.title, startAt: event.startAt })),
        ),
        catchError(() => of([])),
      );
  }

  private searchPages(query: string): readonly PageSearchResult[] {
    return STATIC_SEARCH_PAGES.filter((page) => matchesQuery(page.title, query));
  }
}

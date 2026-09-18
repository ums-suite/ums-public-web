import { AsyncPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import {
  EMPTY_SEARCH_RESULTS,
  hasAnySearchResults,
  type SiteSearchResults,
} from './site-search.models';
import { SiteSearchService } from './site-search.service';

/**
 * PWEB-24: the SSR-crawlable half of site-wide search -- `/search?q=...` renders real results for
 * a specific query string on first server-rendered response (`SiteSearchService.searchImmediate`,
 * un-debounced), matching requirement-spec.md §2's "SSR for the top query patterns search engines
 * crawl" row. `withComponentInputBinding()` (`app.config.ts`) binds this route's own `?q=` query
 * param straight to {@link q} with no manual `ActivatedRoute` wiring needed.
 */
@Component({
  selector: 'pweb-search-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, DatePipe, RouterLink, TranslatePipe],
  host: { class: 'pweb-search-page' },
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss',
})
export class SearchPageComponent {
  readonly q = input<string>('');

  private readonly searchService = inject(SiteSearchService);

  protected readonly results$ = signal<Observable<SiteSearchResults>>(of(EMPTY_SEARCH_RESULTS));

  constructor() {
    effect(() => {
      const query = this.q();
      this.results$.set(this.searchService.searchImmediate(query));
    });
  }

  protected hasResults(results: SiteSearchResults): boolean {
    return hasAnySearchResults(results);
  }
}

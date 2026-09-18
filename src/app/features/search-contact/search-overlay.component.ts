import { AsyncPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { hasAnySearchResults } from './site-search.models';
import { SiteSearchService } from './site-search.service';

/**
 * PWEB-24: the header's search entry point, expanded to a full-width overlay (requirement-spec.md
 * §7 Key Screens "Search") -- live, as-you-type, CSR-refined results (`SiteSearchService.search`,
 * debounced + cancellation-on-supersession, see that service's own doc comment), typed groupings,
 * and a designed zero-results state (never a bare "no results" line, `edge-cases.md`).
 *
 * "View all results" deep-links to `/search?q=...`, the SSR-crawlable, shareable version of the
 * same search (`search-page.component.ts`) -- this overlay itself is never the crawlable surface.
 */
@Component({
  selector: 'pweb-search-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, DatePipe, RouterLink, TranslatePipe],
  host: {
    class: 'pweb-search-overlay',
    role: 'dialog',
    'aria-modal': 'true',
    '(keydown.escape)': 'close()',
  },
  templateUrl: './search-overlay.component.html',
  styleUrl: './search-overlay.component.scss',
})
export class SearchOverlayComponent {
  readonly closed = output();

  private readonly searchService = inject(SiteSearchService);
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  protected readonly query = signal('');
  protected readonly results$ = this.searchService.results$;
  protected readonly hasAnySearchResults = hasAnySearchResults;

  constructor() {
    afterNextRender(() => this.searchInput()?.nativeElement.focus());
  }

  protected onQueryInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    this.searchService.search(value);
  }

  protected close(): void {
    this.closed.emit();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}

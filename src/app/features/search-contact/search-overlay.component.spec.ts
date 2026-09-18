import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import type { SiteSearchResults } from './site-search.models';
import { EMPTY_SEARCH_RESULTS } from './site-search.models';
import { SiteSearchService } from './site-search.service';
import { SearchOverlayComponent } from './search-overlay.component';

describe('SearchOverlayComponent', () => {
  let fixture: ComponentFixture<SearchOverlayComponent>;
  let searchServiceSpy: jasmine.SpyObj<SiteSearchService>;
  let results$: Subject<SiteSearchResults>;

  function setUp(): void {
    TestBed.configureTestingModule({
      imports: [SearchOverlayComponent],
      providers: [provideRouter([]), { provide: SiteSearchService, useValue: searchServiceSpy }],
    });
    fixture = TestBed.createComponent(SearchOverlayComponent);
    fixture.detectChanges();
  }

  beforeEach(() => {
    results$ = new Subject<SiteSearchResults>();
    searchServiceSpy = jasmine.createSpyObj<SiteSearchService>('SiteSearchService', [
      'search',
      'searchImmediate',
    ]);
    (searchServiceSpy as unknown as { results$: Subject<SiteSearchResults> }).results$ = results$;
  });

  it('calls SiteSearchService.search on every input event', () => {
    setUp();
    const input = fixture.nativeElement.querySelector(
      '.pweb-search-overlay__input',
    ) as HTMLInputElement;
    input.value = 'engineering';
    input.dispatchEvent(new Event('input'));

    expect(searchServiceSpy.search).toHaveBeenCalledWith('engineering');
  });

  it('shows the "start typing" hint before any query is entered', () => {
    setUp();
    expect(fixture.nativeElement.querySelector('.pweb-search-overlay__hint')).not.toBeNull();
  });

  it('renders a designed zero-results empty state for a query with no matches', () => {
    setUp();
    const input = fixture.nativeElement.querySelector(
      '.pweb-search-overlay__input',
    ) as HTMLInputElement;
    input.value = 'zzzznothing';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges(); // renders the @if(query()) branch so the async pipe actually subscribes
    results$.next(EMPTY_SEARCH_RESULTS);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.pweb-search-overlay__empty')).not.toBeNull();
  });

  it('renders typed result groups and a "view all results" link carrying the query', () => {
    setUp();
    const input = fixture.nativeElement.querySelector(
      '.pweb-search-overlay__input',
    ) as HTMLInputElement;
    input.value = 'downloads';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges(); // renders the @if(query()) branch so the async pipe actually subscribes
    results$.next({ ...EMPTY_SEARCH_RESULTS, pages: [{ path: '/downloads', title: 'Downloads' }] });
    fixture.detectChanges();

    const viewAll = fixture.nativeElement.querySelector(
      '.pweb-search-overlay__view-all',
    ) as HTMLAnchorElement;
    expect(viewAll.getAttribute('href')).toBe('/search?q=downloads');
  });

  it('emits closed on Escape', () => {
    setUp();
    const closedSpy = jasmine.createSpy('closed');
    fixture.componentInstance.closed.subscribe(closedSpy);

    fixture.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(closedSpy).toHaveBeenCalled();
  });

  it('emits closed on a backdrop click but not a click inside the panel', () => {
    setUp();
    const closedSpy = jasmine.createSpy('closed');
    fixture.componentInstance.closed.subscribe(closedSpy);

    fixture.nativeElement.querySelector('.pweb-search-overlay__panel').click();
    expect(closedSpy).not.toHaveBeenCalled();

    fixture.nativeElement.querySelector('.pweb-search-overlay__backdrop').click();
    expect(closedSpy).toHaveBeenCalled();
  });
});

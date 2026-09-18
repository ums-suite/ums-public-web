import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { EMPTY_SEARCH_RESULTS } from './site-search.models';
import { SiteSearchService } from './site-search.service';
import { SearchPageComponent } from './search-page.component';

describe('SearchPageComponent', () => {
  let fixture: ComponentFixture<SearchPageComponent>;
  let searchServiceSpy: jasmine.SpyObj<SiteSearchService>;

  function setUp(): void {
    TestBed.configureTestingModule({
      imports: [SearchPageComponent],
      providers: [provideRouter([]), { provide: SiteSearchService, useValue: searchServiceSpy }],
    });
    fixture = TestBed.createComponent(SearchPageComponent);
  }

  beforeEach(() => {
    searchServiceSpy = jasmine.createSpyObj<SiteSearchService>('SiteSearchService', [
      'searchImmediate',
      'search',
    ]);
  });

  it('calls searchImmediate (not the debounced path) with the bound q query param', () => {
    searchServiceSpy.searchImmediate.and.returnValue(of(EMPTY_SEARCH_RESULTS));
    setUp();
    fixture.componentRef.setInput('q', 'engineering');
    fixture.detectChanges();

    expect(searchServiceSpy.searchImmediate).toHaveBeenCalledWith('engineering');
  });

  it('shows the "start typing" prompt when there is no query yet', () => {
    searchServiceSpy.searchImmediate.and.returnValue(of(EMPTY_SEARCH_RESULTS));
    setUp();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Start typing');
  });

  it('renders a designed zero-results empty state, never a bare "no results" line', () => {
    searchServiceSpy.searchImmediate.and.returnValue(of(EMPTY_SEARCH_RESULTS));
    setUp();
    fixture.componentRef.setInput('q', 'zzzznothingmatches');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.pweb-search-page__empty')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('No results found');
  });

  it('renders typed result groups with real links', () => {
    searchServiceSpy.searchImmediate.and.returnValue(
      of({
        ...EMPTY_SEARCH_RESULTS,
        programs: [{ id: 'p1', title: 'BSc Computer Science' }],
        pages: [{ path: '/downloads', title: 'Downloads' }],
      }),
    );
    setUp();
    fixture.componentRef.setInput('q', 'computer');
    fixture.detectChanges();

    const programLink = fixture.nativeElement.querySelector('a[href="/programs/p1"]');
    const pageLink = fixture.nativeElement.querySelector('a[href="/downloads"]');
    expect(programLink?.textContent).toContain('BSc Computer Science');
    expect(pageLink?.textContent).toContain('Downloads');
  });
});

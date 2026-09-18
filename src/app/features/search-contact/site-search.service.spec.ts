import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { ContentApiService } from '../../core/http/content-api.service';
import type { ListPage, ProgramDto } from '../../core/http/organization-api.models';
import { OrganizationApiService } from '../../core/http/organization-api.service';
import type { SiteSearchResults } from './site-search.models';
import { SEARCH_DEBOUNCE_MS, SiteSearchService } from './site-search.service';

type ProgramListPageLike = ListPage<ProgramDto>;

/**
 * This app is zoneless (no `zone.js/testing` present) -- `fakeAsync`/`tick` are unavailable, so
 * `debounceTime`'s real timer is waited out with an actual (short) delay instead, matching this
 * repo's existing convention of never relying on virtual-time test helpers (see
 * `apply-now-cta.component.spec.ts`, which likewise never fakes its own `interval` timer).
 */
function afterDebounce(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, SEARCH_DEBOUNCE_MS + 50));
}

describe('SiteSearchService', () => {
  let service: SiteSearchService;
  let organizationApiSpy: jasmine.SpyObj<OrganizationApiService>;
  let contentApiSpy: jasmine.SpyObj<ContentApiService>;

  const emptyPage = { items: [], totalCount: 0, skip: 0, take: 200 };

  beforeEach(() => {
    organizationApiSpy = jasmine.createSpyObj<OrganizationApiService>('OrganizationApiService', [
      'listPrograms',
    ]);
    contentApiSpy = jasmine.createSpyObj<ContentApiService>('ContentApiService', [
      'listNotices',
      'listEvents',
    ]);
    contentApiSpy.listNotices.and.returnValue(of(emptyPage));
    contentApiSpy.listEvents.and.returnValue(of(emptyPage));

    TestBed.configureTestingModule({
      providers: [
        { provide: OrganizationApiService, useValue: organizationApiSpy },
        { provide: ContentApiService, useValue: contentApiSpy },
      ],
    });
    service = TestBed.inject(SiteSearchService);
  });

  it('emits EMPTY_SEARCH_RESULTS for a blank query without calling any API', async () => {
    const emissions: SiteSearchResults[] = [];
    service.results$.subscribe((r) => emissions.push(r));

    service.search('   ');
    await afterDebounce();

    expect(emissions.length).toBe(1);
    expect(emissions[0].programs).toEqual([]);
    expect(organizationApiSpy.listPrograms).not.toHaveBeenCalled();
  });

  it('debounces rapid keystrokes into a single search', async () => {
    let callCount = 0;
    organizationApiSpy.listPrograms.and.callFake(() => {
      callCount++;
      return of(emptyPage);
    });

    service.results$.subscribe();
    service.search('b');
    service.search('bi');
    service.search('bio');
    await afterDebounce();

    expect(callCount).toBe(1);
  });

  it('cancellation on supersession: a stale in-flight query never overwrites a newer one', async () => {
    const bioSubject = new Subject<ProgramListPageLike>();
    const biotechSubject = new Subject<ProgramListPageLike>();
    organizationApiSpy.listPrograms.and.returnValues(bioSubject as never, biotechSubject as never);

    const emissions: SiteSearchResults[] = [];
    service.results$.subscribe((r) => emissions.push(r));

    service.search('bio');
    await afterDebounce();
    service.search('biotech');
    await afterDebounce();

    // The stale "bio" response arrives late -- switchMap already unsubscribed it, so this must
    // never reach the subscriber.
    bioSubject.next({
      items: [
        {
          id: 'p-bio',
          departmentId: 'd1',
          name: 'Biology',
          localizedName: '',
          status: 'Active',
          createdAt: '',
          version: 1,
        },
      ],
      totalCount: 1,
      skip: 0,
      take: 200,
    });
    bioSubject.complete();

    expect(emissions.length).toBe(0);

    biotechSubject.next({
      items: [
        {
          id: 'p-biotech',
          departmentId: 'd1',
          name: 'Biotechnology',
          localizedName: '',
          status: 'Active',
          createdAt: '',
          version: 1,
        },
      ],
      totalCount: 1,
      skip: 0,
      take: 200,
    });
    biotechSubject.complete();

    expect(emissions.length).toBe(1);
    expect(emissions[0].programs).toEqual([{ id: 'p-biotech', title: 'Biotechnology' }]);
  });

  it('filters programs/notices/events client-side by substring match', async () => {
    organizationApiSpy.listPrograms.and.returnValue(
      of({
        items: [
          {
            id: 'p1',
            departmentId: 'd1',
            name: 'BSc Computer Science',
            localizedName: '',
            status: 'Active',
            createdAt: '',
            version: 1,
          },
          {
            id: 'p2',
            departmentId: 'd1',
            name: 'BA History',
            localizedName: '',
            status: 'Active',
            createdAt: '',
            version: 1,
          },
        ],
        totalCount: 2,
        skip: 0,
        take: 200,
      }),
    );
    contentApiSpy.listNotices.and.returnValue(
      of({
        items: [
          {
            id: 'n1',
            title: 'Computer lab maintenance',
            body: '',
            languageCode: 'en',
            audience: ['Public'],
            organizationNodeId: null,
            isUrgent: false,
            status: 'Published',
            publishAt: null,
            expireAt: null,
            publishedAt: '2026-01-01T00:00:00Z',
            archivedAt: null,
            hasBengaliTranslation: false,
          },
        ],
        totalCount: 1,
        skip: 0,
        take: 200,
      }),
    );

    const emissions: SiteSearchResults[] = [];
    service.results$.subscribe((r) => emissions.push(r));

    service.search('computer');
    await afterDebounce();

    expect(emissions[0].programs).toEqual([{ id: 'p1', title: 'BSc Computer Science' }]);
    expect(emissions[0].notices).toEqual([{ id: 'n1', title: 'Computer lab maintenance' }]);
  });

  it('includes matching static Pages results', async () => {
    organizationApiSpy.listPrograms.and.returnValue(of(emptyPage));

    const emissions: SiteSearchResults[] = [];
    service.results$.subscribe((r) => emissions.push(r));

    service.search('downloads');
    await afterDebounce();

    expect(emissions[0].pages).toEqual([{ path: '/downloads', title: 'Downloads' }]);
  });

  it('degrades a single failing group to empty rather than breaking the whole search', async () => {
    organizationApiSpy.listPrograms.and.returnValue(throwError(() => new Error('network')));

    const emissions: SiteSearchResults[] = [];
    service.results$.subscribe((r) => emissions.push(r));

    service.search('anything');
    await afterDebounce();

    expect(emissions[0].programs).toEqual([]);
  });

  it('searchImmediate bypasses the debounce for the SSR-crawlable query-string entry point', () => {
    organizationApiSpy.listPrograms.and.returnValue(of(emptyPage));
    let result: SiteSearchResults | undefined;

    service.searchImmediate('downloads').subscribe((r) => (result = r));

    expect(result?.pages).toEqual([{ path: '/downloads', title: 'Downloads' }]);
  });
});

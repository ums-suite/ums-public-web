import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ResearchApiService } from '../../core/http/research-api.service';
import { ResearchShowcaseComponent } from './research-showcase.component';

describe('ResearchShowcaseComponent', () => {
  let fixture: ComponentFixture<ResearchShowcaseComponent>;
  let researchApiSpy: jasmine.SpyObj<ResearchApiService>;

  function setUp(): void {
    TestBed.configureTestingModule({
      imports: [ResearchShowcaseComponent],
      providers: [{ provide: ResearchApiService, useValue: researchApiSpy }],
    });
    fixture = TestBed.createComponent(ResearchShowcaseComponent);
  }

  beforeEach(() => {
    researchApiSpy = jasmine.createSpyObj<ResearchApiService>('ResearchApiService', [
      'listPublications',
      'listGrants',
      'listRepositoryEntries',
    ]);
  });

  it('renders a publication with its real author name, including the no-photo initials avatar', () => {
    researchApiSpy.listPublications.and.returnValue(
      of({
        items: [
          {
            id: 'p1',
            title: 'A study of things',
            authors: [
              {
                order: 1,
                facultyMemberId: null,
                name: 'Dr. Ada Rahman',
                affiliation: null,
                isCorrespondingAuthor: true,
              },
            ],
            venue: { type: 'journal', name: 'Journal of Things', publisher: null },
            citation: { doi: null, publicationDate: '2026-01-01', citationCount: null },
            isPubliclyVisible: true,
          },
        ],
        skip: 0,
        take: 20,
      }),
    );
    researchApiSpy.listGrants.and.returnValue(of({ items: [], skip: 0, take: 20 }));
    researchApiSpy.listRepositoryEntries.and.returnValue(of({ items: [], skip: 0, take: 20 }));
    setUp();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('A study of things');
    expect(fixture.nativeElement.textContent).toContain('Dr. Ada Rahman');
    const avatar = fixture.nativeElement.querySelector('ums-avatar');
    expect(avatar).not.toBeNull();
  });

  it('never renders a raw investigator GUID for a grant -- only title/funding/status', () => {
    researchApiSpy.listPublications.and.returnValue(of({ items: [], skip: 0, take: 20 }));
    researchApiSpy.listGrants.and.returnValue(
      of({
        items: [
          {
            id: 'g1',
            title: 'Climate Research Grant',
            description: 'Studying climate patterns.',
            fundingAmount: 50000,
            currency: 'USD',
            fundingPeriodStart: '2026-01-01',
            fundingPeriodEnd: '2027-01-01',
            status: 'Active',
            awardDate: null,
            principalInvestigatorFacultyMemberId: '11111111-1111-1111-1111-111111111111',
            investigators: [
              {
                facultyMemberId: '11111111-1111-1111-1111-111111111111',
                role: 'PI',
                addedAt: '2026-01-01',
              },
            ],
          },
        ],
        skip: 0,
        take: 20,
      }),
    );
    researchApiSpy.listRepositoryEntries.and.returnValue(of({ items: [], skip: 0, take: 20 }));
    setUp();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Climate Research Grant');
    expect(fixture.nativeElement.textContent).not.toContain('11111111-1111-1111-1111-111111111111');
  });

  it('renders a repository entry with its real depositor name', () => {
    researchApiSpy.listPublications.and.returnValue(of({ items: [], skip: 0, take: 20 }));
    researchApiSpy.listGrants.and.returnValue(of({ items: [], skip: 0, take: 20 }));
    researchApiSpy.listRepositoryEntries.and.returnValue(
      of({
        items: [
          {
            id: 'r1',
            title: 'Thesis on Things',
            workType: 'Thesis',
            depositor: { name: 'Ada Rahman', facultyMemberId: null },
            supervisingFacultyMemberId: null,
            depositDate: '2026-01-01',
            embargo: { isEmbargoed: false, embargoEndDate: null, accessLevel: 'Public' },
          },
        ],
        skip: 0,
        take: 20,
      }),
    );
    setUp();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Thesis on Things');
    expect(fixture.nativeElement.textContent).toContain('Ada Rahman');
  });

  it('does not render a department filter control -- there is no real data source for one', () => {
    researchApiSpy.listPublications.and.returnValue(of({ items: [], skip: 0, take: 20 }));
    researchApiSpy.listGrants.and.returnValue(of({ items: [], skip: 0, take: 20 }));
    researchApiSpy.listRepositoryEntries.and.returnValue(of({ items: [], skip: 0, take: 20 }));
    setUp();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('select')).toBeNull();
  });

  it('degrades every section to empty (never throws) when a request fails', () => {
    researchApiSpy.listPublications.and.returnValue(throwError(() => new Error('network')));
    researchApiSpy.listGrants.and.returnValue(throwError(() => new Error('network')));
    researchApiSpy.listRepositoryEntries.and.returnValue(throwError(() => new Error('network')));
    setUp();

    expect(() => fixture.detectChanges()).not.toThrow();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { OrganizationApiService } from '../../core/http/organization-api.service';
import { ProgramCatalogComponent } from './program-catalog.component';

describe('ProgramCatalogComponent', () => {
  let api: jasmine.SpyObj<OrganizationApiService>;

  function createFixture(): ComponentFixture<ProgramCatalogComponent> {
    TestBed.configureTestingModule({
      imports: [ProgramCatalogComponent],
      providers: [provideRouter([]), { provide: OrganizationApiService, useValue: api }],
    });
    return TestBed.createComponent(ProgramCatalogComponent);
  }

  beforeEach(() => {
    api = jasmine.createSpyObj<OrganizationApiService>('OrganizationApiService', [
      'listFaculties',
      'listDepartments',
      'listPrograms',
    ]);
    api.listFaculties.and.returnValue(
      of({
        items: [
          {
            id: 'f1',
            campusId: 'c1',
            name: 'Science',
            localizedName: 'Science',
            status: 'Active',
            createdAt: '',
            version: 1,
          },
        ],
        totalCount: 1,
        skip: 0,
        take: 200,
      }),
    );
  });

  it('loads faculties and the unfiltered program list on init, rendering result cards', () => {
    api.listPrograms.and.returnValue(
      of({
        items: [
          {
            id: 'p1',
            departmentId: 'd1',
            name: 'BSc CS',
            localizedName: 'BSc CS',
            status: 'Active',
            createdAt: '',
            version: 1,
          },
        ],
        totalCount: 1,
        skip: 0,
        take: 200,
      }),
    );
    const fixture = createFixture();

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('BSc CS');
    expect(fixture.nativeElement.querySelectorAll('.pweb-program-catalog__card').length).toBe(1);
  });

  it('shows the designed empty state when a facet yields no programs', () => {
    api.listPrograms.and.returnValue(of({ items: [], totalCount: 0, skip: 0, take: 200 }));
    const fixture = createFixture();

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No programs match these filters yet');
  });
});

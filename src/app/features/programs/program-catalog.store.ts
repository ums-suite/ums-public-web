import { Injectable, inject, signal } from '@angular/core';
import { forkJoin, type Observable } from 'rxjs';
import { OrganizationApiService } from '../../core/http/organization-api.service';
import type {
  DepartmentDto,
  FacultyDto,
  ListPage,
  ProgramDto,
} from '../../core/http/organization-api.models';

/** Large enough to cover a real university's catalog in one page for each facet -- see class doc. */
const CATALOG_PAGE_SIZE = 200;

/**
 * PWEB-12: faceted browse/filter state for the Program Catalog -- "instant client-side re-filter
 * on already-fetched data, re-fetch only for facet combinations not yet cached"
 * (requirement-spec.md §7 Key Screens).
 *
 * `Organization`'s `GET /organization/programs` only supports filtering by `departmentId`
 * (confirmed, PWEB-4 research) -- there is no `facultyId` param, since a Program's only direct
 * parent is a Department. Filtering by Faculty alone (no Department chosen) is therefore
 * implemented here as: fetch every Department under that Faculty, then fetch and merge Programs
 * for each -- cached as one unit under a `faculty:{id}` key so re-selecting the same Faculty
 * later never re-issues those calls. `dept:{id}` and the unfiltered `all` facet are each their own
 * single cached fetch. Every facet result is capped at {@link CATALOG_PAGE_SIZE} programs -- a
 * pragmatic bound for a university catalog's realistic size, not true unbounded pagination.
 */
@Injectable({ providedIn: 'root' })
export class ProgramCatalogStore {
  private readonly organizationApi = inject(OrganizationApiService);

  readonly faculties = signal<readonly FacultyDto[]>([]);
  readonly departments = signal<readonly DepartmentDto[]>([]);
  readonly programs = signal<readonly ProgramDto[]>([]);
  readonly selectedFacultyId = signal<string | null>(null);
  readonly selectedDepartmentId = signal<string | null>(null);
  readonly loading = signal(false);

  private readonly programCache = new Map<string, readonly ProgramDto[]>();
  private readonly departmentCache = new Map<string, readonly DepartmentDto[]>();

  /** Fetch-call counter, exposed only for tests to assert the cache actually prevents re-fetching. */
  fetchCount = 0;

  loadFaculties(): void {
    this.organizationApi.listFaculties({ take: CATALOG_PAGE_SIZE }).subscribe({
      next: (page) => this.faculties.set(page.items),
      error: () => this.faculties.set([]),
    });
    this.loadProgramsForFacet('all', () =>
      this.organizationApi.listPrograms({ take: CATALOG_PAGE_SIZE }),
    );
  }

  selectFaculty(facultyId: string | null): void {
    this.selectedFacultyId.set(facultyId);
    this.selectedDepartmentId.set(null);

    if (!facultyId) {
      this.departments.set([]);
      this.loadProgramsForFacet('all', () =>
        this.organizationApi.listPrograms({ take: CATALOG_PAGE_SIZE }),
      );
      return;
    }
    this.loadDepartments(facultyId);
  }

  selectDepartment(departmentId: string | null): void {
    this.selectedDepartmentId.set(departmentId);

    if (departmentId) {
      this.loadProgramsForFacet(`dept:${departmentId}`, () =>
        this.organizationApi.listPrograms({ departmentId, take: CATALOG_PAGE_SIZE }),
      );
      return;
    }

    const facultyId = this.selectedFacultyId();
    if (facultyId) {
      this.loadProgramsForFaculty(facultyId);
    } else {
      this.loadProgramsForFacet('all', () =>
        this.organizationApi.listPrograms({ take: CATALOG_PAGE_SIZE }),
      );
    }
  }

  private loadDepartments(facultyId: string): void {
    const cached = this.departmentCache.get(facultyId);
    if (cached) {
      this.departments.set(cached);
      this.loadProgramsForFaculty(facultyId);
      return;
    }

    this.loading.set(true);
    this.organizationApi.listDepartments({ facultyId, take: CATALOG_PAGE_SIZE }).subscribe({
      next: (page) => {
        this.departmentCache.set(facultyId, page.items);
        this.departments.set(page.items);
        this.loadProgramsForFaculty(facultyId);
      },
      error: () => {
        this.departments.set([]);
        this.programs.set([]);
        this.loading.set(false);
      },
    });
  }

  private loadProgramsForFaculty(facultyId: string): void {
    const key = `faculty:${facultyId}`;
    const cached = this.programCache.get(key);
    if (cached) {
      this.programs.set(cached);
      return;
    }

    const departmentIds = (this.departmentCache.get(facultyId) ?? this.departments()).map(
      (d) => d.id,
    );
    if (departmentIds.length === 0) {
      this.programCache.set(key, []);
      this.programs.set([]);
      return;
    }

    this.loading.set(true);
    this.fetchCount += 1;
    forkJoin(
      departmentIds.map((id) =>
        this.organizationApi.listPrograms({ departmentId: id, take: CATALOG_PAGE_SIZE }),
      ),
    ).subscribe({
      next: (pages) => {
        const merged = pages.flatMap((page) => page.items);
        this.programCache.set(key, merged);
        this.programs.set(merged);
        this.loading.set(false);
      },
      error: () => {
        this.programs.set([]);
        this.loading.set(false);
      },
    });
  }

  private loadProgramsForFacet(key: string, fetch: () => Observable<ListPage<ProgramDto>>): void {
    const cached = this.programCache.get(key);
    if (cached) {
      this.programs.set(cached);
      return;
    }

    this.loading.set(true);
    this.fetchCount += 1;
    fetch().subscribe({
      next: (page) => {
        this.programCache.set(key, page.items);
        this.programs.set(page.items);
        this.loading.set(false);
      },
      error: () => {
        this.programs.set([]);
        this.loading.set(false);
      },
    });
  }
}

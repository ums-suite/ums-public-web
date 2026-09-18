import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { OrganizationApiService } from '../../core/http/organization-api.service';
import type {
  DepartmentDto,
  FacultyDto,
  ProgramDto,
} from '../../core/http/organization-api.models';
import { ProgramCatalogStore } from './program-catalog.store';

function program(id: string, departmentId: string): ProgramDto {
  return {
    id,
    departmentId,
    name: id,
    localizedName: id,
    status: 'Active',
    createdAt: '',
    version: 1,
  };
}

function department(id: string, facultyId: string): DepartmentDto {
  return {
    id,
    facultyId,
    name: id,
    localizedName: id,
    status: 'Active',
    createdAt: '',
    version: 1,
  };
}

function faculty(id: string): FacultyDto {
  return {
    id,
    campusId: 'c1',
    name: id,
    localizedName: id,
    status: 'Active',
    createdAt: '',
    version: 1,
  };
}

describe('ProgramCatalogStore', () => {
  let store: ProgramCatalogStore;
  let api: jasmine.SpyObj<OrganizationApiService>;

  beforeEach(() => {
    api = jasmine.createSpyObj<OrganizationApiService>('OrganizationApiService', [
      'listFaculties',
      'listDepartments',
      'listPrograms',
    ]);
    TestBed.configureTestingModule({
      providers: [{ provide: OrganizationApiService, useValue: api }],
    });
    store = TestBed.inject(ProgramCatalogStore);
  });

  it('loads the unfiltered catalog and the faculty facet list on init', () => {
    api.listFaculties.and.returnValue(
      of({ items: [faculty('f1')], totalCount: 1, skip: 0, take: 200 }),
    );
    api.listPrograms.and.returnValue(
      of({ items: [program('p1', 'd1')], totalCount: 1, skip: 0, take: 200 }),
    );

    store.loadFaculties();

    expect(store.faculties()).toEqual([faculty('f1')]);
    expect(store.programs()).toEqual([program('p1', 'd1')]);
    expect(api.listPrograms).toHaveBeenCalledTimes(1);
  });

  it('re-selecting a department already fetched reuses the cache instead of re-fetching', () => {
    api.listPrograms.and.returnValue(
      of({ items: [program('p1', 'd1')], totalCount: 1, skip: 0, take: 200 }),
    );

    store.selectDepartment('d1');
    expect(api.listPrograms).toHaveBeenCalledTimes(1);

    store.selectDepartment('d2');
    store.selectDepartment('d1');

    // Only the genuinely new facet (d2) should have triggered a second real fetch -- reselecting
    // d1 (already cached) must not issue a third call.
    expect(api.listPrograms).toHaveBeenCalledTimes(2);
    expect(store.programs()).toEqual([program('p1', 'd1')]);
  });

  it('selecting a faculty with no department chosen merges programs across all its departments', () => {
    api.listDepartments.and.returnValue(
      of({
        items: [department('d1', 'f1'), department('d2', 'f1')],
        totalCount: 2,
        skip: 0,
        take: 200,
      }),
    );
    api.listPrograms.and.callFake((options) =>
      of({
        items: options?.departmentId === 'd1' ? [program('p1', 'd1')] : [program('p2', 'd2')],
        totalCount: 1,
        skip: 0,
        take: 200,
      }),
    );

    store.selectFaculty('f1');

    expect(store.departments()).toEqual([department('d1', 'f1'), department('d2', 'f1')]);
    expect(store.programs()).toEqual([program('p1', 'd1'), program('p2', 'd2')]);
  });

  it('reselecting the same faculty reuses the cached department list and merged programs (no re-fetch)', () => {
    api.listDepartments.and.returnValue(
      of({ items: [department('d1', 'f1')], totalCount: 1, skip: 0, take: 200 }),
    );
    api.listPrograms.and.returnValue(
      of({ items: [program('p1', 'd1')], totalCount: 1, skip: 0, take: 200 }),
    );

    store.selectFaculty('f1');
    store.selectFaculty(null);
    store.selectFaculty('f1');

    expect(api.listDepartments).toHaveBeenCalledTimes(1);
  });

  it('clears the selected department when switching faculties', () => {
    api.listDepartments.and.returnValue(of({ items: [], totalCount: 0, skip: 0, take: 200 }));
    api.listPrograms.and.returnValue(of({ items: [], totalCount: 0, skip: 0, take: 200 }));

    store.selectDepartment('d1');
    store.selectFaculty('f1');

    expect(store.selectedDepartmentId()).toBeNull();
  });

  it('degrades to an empty program list (never throws) when a facet fetch fails', () => {
    api.listPrograms.and.returnValue(throwError(() => new Error('network')));

    expect(() => store.selectDepartment('d1')).not.toThrow();
    expect(store.programs()).toEqual([]);
    expect(store.loading()).toBeFalse();
  });
});

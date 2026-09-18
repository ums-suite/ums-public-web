import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PublicApiBase } from './public-api.base';
import type {
  AncestorNodeDto,
  DepartmentDto,
  FacultyDto,
  ListPage,
  ProgramDto,
} from './organization-api.models';

/**
 * `Organization` module public read client (PWEB-4/PWEB-12/PWEB-13/PWEB-14). Every route below
 * was confirmed anonymous-accessible directly against `ums-core`'s `FacultyEndpoints.cs`/
 * `DepartmentEndpoints.cs`/`ProgramEndpoints.cs`/`HierarchyEndpoints.cs`.
 */
@Injectable({ providedIn: 'root' })
export class OrganizationApiService extends PublicApiBase {
  listFaculties(
    options: { readonly campusId?: string; readonly skip?: number; readonly take?: number } = {},
  ): Observable<ListPage<FacultyDto>> {
    return this.normalizeErrors(
      this.http.get<ListPage<FacultyDto>>(this.apiUrl('organization/faculties'), {
        params: this.buildParams({
          campusId: options.campusId,
          skip: options.skip,
          take: options.take,
        }),
      }),
    );
  }

  getFaculty(id: string): Observable<FacultyDto> {
    return this.normalizeErrors(
      this.http.get<FacultyDto>(this.apiUrl(`organization/faculties/${id}`)),
    );
  }

  listDepartments(
    options: { readonly facultyId?: string; readonly skip?: number; readonly take?: number } = {},
  ): Observable<ListPage<DepartmentDto>> {
    return this.normalizeErrors(
      this.http.get<ListPage<DepartmentDto>>(this.apiUrl('organization/departments'), {
        params: this.buildParams({
          facultyId: options.facultyId,
          skip: options.skip,
          take: options.take,
        }),
      }),
    );
  }

  getDepartment(id: string): Observable<DepartmentDto> {
    return this.normalizeErrors(
      this.http.get<DepartmentDto>(this.apiUrl(`organization/departments/${id}`)),
    );
  }

  listPrograms(
    options: {
      readonly departmentId?: string;
      readonly skip?: number;
      readonly take?: number;
    } = {},
  ): Observable<ListPage<ProgramDto>> {
    return this.normalizeErrors(
      this.http.get<ListPage<ProgramDto>>(this.apiUrl('organization/programs'), {
        params: this.buildParams({
          departmentId: options.departmentId,
          skip: options.skip,
          take: options.take,
        }),
      }),
    );
  }

  getProgram(id: string): Observable<ProgramDto> {
    return this.normalizeErrors(
      this.http.get<ProgramDto>(this.apiUrl(`organization/programs/${id}`)),
    );
  }

  /** Root-first ancestor chain (e.g. University → Campus → Faculty → Department) for breadcrumbs. */
  getNodeAncestors(id: string): Observable<readonly AncestorNodeDto[]> {
    return this.normalizeErrors(
      this.http.get<readonly AncestorNodeDto[]>(this.apiUrl(`organization/nodes/${id}/ancestors`)),
    );
  }
}

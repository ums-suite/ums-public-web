/**
 * `Organization` module DTOs -- hand-authored against `ums-core`'s real `*Dto`/`*ListPage` C#
 * types (`FacultyEndpoints.cs`, `DepartmentEndpoints.cs`, `ProgramEndpoints.cs`,
 * `HierarchyEndpoints.cs`), confirmed anonymous-accessible, PWEB-4 research.
 *
 * Deliberately thin: `ProgramDto` here carries NO degree-level/duration/curriculum/eligibility/
 * fee-summary fields, because `ums-core`'s Organization module's own `Program` entity has none of
 * those -- confirmed directly against source, not an oversight. `EligibilityRule` exists only as
 * an Admission-module write-only request shape with no anonymous read path; a curriculum concept
 * exists only in the Academic module, fully gated (`RequireLiveSession`). Flagged as a real
 * cross-team gap against requirement-spec.md §3.2's expectations in this repo's PR description --
 * `program-catalog.component.ts`/`program-detail.component.ts` render only what is real.
 */
export interface ListPage<T> {
  readonly items: readonly T[];
  readonly totalCount: number;
  readonly skip: number;
  readonly take: number;
}

export interface FacultyDto {
  readonly id: string;
  readonly campusId: string;
  readonly name: string;
  readonly localizedName: string;
  readonly status: string;
  readonly createdAt: string;
  readonly version: number;
}

export interface DepartmentDto {
  readonly id: string;
  readonly facultyId: string;
  readonly name: string;
  readonly localizedName: string;
  readonly status: string;
  readonly createdAt: string;
  readonly version: number;
}

export interface ProgramDto {
  readonly id: string;
  readonly departmentId: string;
  readonly name: string;
  readonly localizedName: string;
  readonly status: string;
  readonly createdAt: string;
  readonly version: number;
}

export interface AncestorNodeDto {
  readonly id: string;
  readonly nodeType: string;
  readonly name: string;
}

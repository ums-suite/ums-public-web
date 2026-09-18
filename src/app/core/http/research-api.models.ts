/**
 * `Research` module's public showcase (PWEB-20), hand-authored against
 * `PublicShowcaseEndpoints.cs`/`PublicationDto.cs`/`GrantDto.cs`/`InstitutionalRepositoryEntryDto.cs`.
 *
 * This is a genuinely real, confirmed-anonymous surface -- a SEPARATE module from `Faculty`'s own
 * (permission-gated) `FacultyMember` directory (PWEB-15/16 research), never routed through
 * `Content` (which does not own this data). `.AllowAnonymous()` with no permission check at all,
 * confirmed directly against `ResearchModule.cs`'s own doc comment.
 *
 * **Confirmed gap, not built here:** requirement-spec.md §3.5 asks for the showcase to be
 * "filterable by department" -- none of `PublicationDto`/`GrantDto`/`InstitutionalRepositoryEntryDto`
 * carries a department (or even a resolvable-to-department `FacultyMemberId`, since `Faculty`'s own
 * member-lookup is itself permission-gated, PWEB-15/16). `research-showcase.component.ts`
 * deliberately does NOT render a department filter control -- a fake facet with nothing behind it
 * would be worse than omitting it -- flagged in this app's PR as a cross-team gap.
 */
export interface AuthorEntryDto {
  readonly order: number;
  readonly facultyMemberId: string | null;
  readonly name: string;
  readonly affiliation: string | null;
  readonly isCorrespondingAuthor: boolean;
}

export interface VenueDto {
  readonly type: string;
  readonly name: string;
  readonly publisher: string | null;
}

export interface CitationMetadataDto {
  readonly doi: string | null;
  readonly publicationDate: string;
  readonly citationCount: number | null;
}

export interface PublicationDto {
  readonly id: string;
  readonly title: string;
  readonly authors: readonly AuthorEntryDto[];
  readonly venue: VenueDto;
  readonly citation: CitationMetadataDto;
  readonly isPubliclyVisible: boolean;
}

export interface GrantInvestigatorDto {
  readonly facultyMemberId: string;
  readonly role: string;
  readonly addedAt: string;
}

export interface GrantDto {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly fundingAmount: number;
  readonly currency: string;
  readonly fundingPeriodStart: string;
  readonly fundingPeriodEnd: string;
  readonly status: string;
  readonly awardDate: string | null;
  readonly principalInvestigatorFacultyMemberId: string | null;
  readonly investigators: readonly GrantInvestigatorDto[];
}

export interface ContributorDto {
  readonly name: string;
  readonly facultyMemberId: string | null;
}

export interface EmbargoPolicyDto {
  readonly isEmbargoed: boolean;
  readonly embargoEndDate: string | null;
  readonly accessLevel: string;
}

export interface InstitutionalRepositoryEntryDto {
  readonly id: string;
  readonly title: string;
  readonly workType: string;
  readonly depositor: ContributorDto;
  readonly supervisingFacultyMemberId: string | null;
  readonly depositDate: string;
  readonly embargo: EmbargoPolicyDto;
}

/**
 * Deliberately NOT this app's usual `ListPage<T>` shape (`{items, totalCount, skip, take}`) --
 * `Research`'s own three list pages (`PublicationListPage`/`GrantListPage`/
 * `InstitutionalRepositoryEntryListPage`, confirmed against source) carry no `TotalCount` field at
 * all, only `Items`/`Skip`/`Take`. Modeled as its own type rather than force-fitting the other
 * shape with a fabricated count.
 */
export interface ResearchListPage<T> {
  readonly items: readonly T[];
  readonly skip: number;
  readonly take: number;
}

export type PublicationListPage = ResearchListPage<PublicationDto>;
export type GrantListPage = ResearchListPage<GrantDto>;
export type RepositoryEntryListPage = ResearchListPage<InstitutionalRepositoryEntryDto>;

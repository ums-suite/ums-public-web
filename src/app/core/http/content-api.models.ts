import type { ListPage } from './organization-api.models';

/**
 * `Content` module DTOs (PWEB-4/PWEB-9/PWEB-10), hand-authored against `ums-core`'s
 * `NoticeEndpoints.cs`/`EventEndpoints.cs`/`BannerEndpoints.cs`/`HomepageSectionEndpoints.cs`
 * (PWEB-4 research). Confirmed gaps versus requirement-spec.md §3.1/§3.4, not built here:
 * `NoticeDto` has no `category` field and no attachments array; there is no separate News/media
 * DTO distinct from Notice/Event.
 */
export interface BannerDto {
  readonly id: string;
  readonly headline: string;
  readonly imageUrl: string;
  readonly linkUrl: string | null;
  readonly sortOrder: number;
  readonly status: string;
  readonly publishAt: string | null;
  readonly expireAt: string | null;
}

export interface HomepageSectionDto {
  readonly id: string;
  readonly sectionKey: string;
  readonly title: string;
  readonly sortOrder: number;
  readonly isEnabled: boolean;
  readonly referenceOrganizationNodeId: string | null;
  readonly referenceAvailable: boolean | null;
}

export interface NoticeDto {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly languageCode: string;
  readonly audience: readonly string[];
  readonly organizationNodeId: string | null;
  readonly isUrgent: boolean;
  readonly status: string;
  readonly publishAt: string | null;
  readonly expireAt: string | null;
  readonly publishedAt: string | null;
  readonly archivedAt: string | null;
  readonly hasBengaliTranslation: boolean;
}

export interface EventDto {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly locationLabel: string | null;
  readonly languageCode: string;
  readonly audience: readonly string[];
  readonly organizationNodeId: string | null;
  readonly startAt: string;
  readonly endAt: string;
}

export type NoticeListPage = ListPage<NoticeDto>;
export type EventListPage = ListPage<EventDto>;

/**
 * `Content`'s `DownloadResource` (PWEB-22), hand-authored against
 * `DownloadResourceEndpoints.cs`/`DownloadResourceDto.cs`. `category` is a real, server-filterable
 * string field (confirmed) -- `ListPublishedAsync(category, skip, take)` is what makes PWEB-22's
 * "grouped by category, not a flat list" genuinely real rather than a client-side-only illusion.
 *
 * **Confirmed gap, not built here:** `artifactId` references a `Documents`-module upload, and
 * `Documents` has NO anonymous-accessible endpoint anywhere that resolves an artifact id to an
 * actual downloadable file (`UploadEndpoints.cs`'s `GET /uploads/{id}` and every route in
 * `GenerationEndpoints.cs` require `RequireLiveSession`/a specific permission -- confirmed against
 * source, PWEB-22 research). This app can list/group real download metadata but cannot produce a
 * working file link for an anonymous visitor -- `downloads.component.ts` surfaces this honestly
 * (a disabled/explained action, never a fabricated href) and it is flagged in this app's PR as a
 * blocking cross-team gap.
 */
export interface DownloadResourceDto {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly artifactId: string;
  readonly status: string;
  readonly publishAt: string | null;
  readonly expireAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: number;
}

export type DownloadResourceListPage = ListPage<DownloadResourceDto>;

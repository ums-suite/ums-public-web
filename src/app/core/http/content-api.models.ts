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

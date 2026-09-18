import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PublicApiBase } from './public-api.base';
import type {
  BannerDto,
  EventListPage,
  HomepageSectionDto,
  NoticeListPage,
} from './content-api.models';

/**
 * `Content` module public read client (PWEB-4/PWEB-9/PWEB-10). Every route confirmed
 * anonymous-accessible against `ums-core`'s `NoticeEndpoints.cs`/`EventEndpoints.cs`/
 * `BannerEndpoints.cs`/`HomepageSectionEndpoints.cs` (PWEB-4 research). `audience` is omitted from
 * every call here -- omitting it (rather than passing `'public'` explicitly) takes the same
 * anonymous branch server-side and matches what an unauthenticated visitor is allowed to pass.
 */
@Injectable({ providedIn: 'root' })
export class ContentApiService extends PublicApiBase {
  /** Bare array response (no pagination wrapper) -- matches `BannerEndpoints.cs`'s `ListActiveAsync`. */
  listBanners(): Observable<readonly BannerDto[]> {
    return this.normalizeErrors(
      this.http.get<readonly BannerDto[]>(this.apiUrl('content/banners')),
    );
  }

  /** Bare array response -- matches `HomepageSectionEndpoints.cs`'s `ListEnabledAsync`. */
  listHomepageSections(): Observable<readonly HomepageSectionDto[]> {
    return this.normalizeErrors(
      this.http.get<readonly HomepageSectionDto[]>(this.apiUrl('content/homepage-sections')),
    );
  }

  listNotices(options: {
    readonly skip: number;
    readonly take: number;
  }): Observable<NoticeListPage> {
    return this.normalizeErrors(
      this.http.get<NoticeListPage>(this.apiUrl('content/notices'), {
        params: this.buildParams({ skip: options.skip, take: options.take }),
      }),
    );
  }

  listEvents(options: {
    readonly skip: number;
    readonly take: number;
    readonly from?: string;
    readonly to?: string;
  }): Observable<EventListPage> {
    return this.normalizeErrors(
      this.http.get<EventListPage>(this.apiUrl('content/events'), {
        params: this.buildParams({
          skip: options.skip,
          take: options.take,
          from: options.from,
          to: options.to,
        }),
      }),
    );
  }
}

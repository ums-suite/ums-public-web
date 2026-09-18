import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ContentApiService } from '../../core/http/content-api.service';
import type { EventDto, NoticeDto } from '../../core/http/content-api.models';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

const FEED_SIZE = 5;

/**
 * PWEB-10: rolling latest-Notice/upcoming-Event feed, editorial card treatment (requirement-spec.md
 * §7 "never a bare `<ul>` styled as a table"). `Content`'s `GET /content/notices`/`GET
 * /content/events` are already publish/expiry-window-filtered server-side (PWEB-4 research) --
 * this component trusts that at render time and doesn't re-filter client-side.
 *
 * Each item deliberately does NOT link to its own detail page yet: Notice/Event detail routes are
 * PWEB-17/PWEB-18 (not in this build pass) -- rendering a link to a route that doesn't exist would
 * be a real dead link, not a cosmetic gap, so these render as plain (non-navigable) editorial
 * cards until that ticket lands.
 */
@Component({
  selector: 'pweb-notice-event-feed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, TranslatePipe],
  host: { class: 'pweb-notice-event-feed' },
  templateUrl: './notice-event-feed.component.html',
  styleUrl: './notice-event-feed.component.scss',
})
export class NoticeEventFeedComponent {
  private readonly contentApi = inject(ContentApiService);

  protected readonly notices = signal<readonly NoticeDto[]>([]);
  protected readonly events = signal<readonly EventDto[]>([]);

  constructor() {
    this.contentApi.listNotices({ skip: 0, take: FEED_SIZE }).subscribe({
      next: (page) => this.notices.set(page.items),
      error: () => this.notices.set([]),
    });
    this.contentApi
      .listEvents({ skip: 0, take: FEED_SIZE, from: new Date().toISOString() })
      .subscribe({
        next: (page) => this.events.set(page.items),
        error: () => this.events.set([]),
      });
  }
}

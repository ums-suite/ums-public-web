import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentApiService } from '../../core/http/content-api.service';
import type { NoticeDto } from '../../core/http/content-api.models';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { matchesNoticeFacet, type NoticeFacet } from './notice.models';

const PAGE_SIZE = 50;

/**
 * PWEB-17: Notice list -- category filtering (see `notice.models.ts`'s doc comment for why the
 * facet is Urgent/All rather than a fabricated category taxonomy `NoticeDto` doesn't have),
 * publish/expiry-aware visibility (the public `/content/notices` list route is already
 * Published-only server-side, per `NoticeService.ListPublicAsync`), timeline-forward editorial
 * cards (requirement-spec.md §7 Key Screens).
 */
@Component({
  selector: 'pweb-notice-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, TranslatePipe],
  host: { class: 'pweb-notice-list' },
  templateUrl: './notice-list.component.html',
  styleUrl: './notice-list.component.scss',
})
export class NoticeListComponent {
  private readonly contentApi = inject(ContentApiService);

  protected readonly notices = signal<readonly NoticeDto[]>([]);
  protected readonly loading = signal(true);
  protected readonly facet = signal<NoticeFacet>('all');

  protected readonly visibleNotices = computed(() =>
    this.notices().filter((notice) => matchesNoticeFacet(notice.isUrgent, this.facet())),
  );

  constructor() {
    this.contentApi.listNotices({ skip: 0, take: PAGE_SIZE }).subscribe({
      next: (page) => {
        this.notices.set(page.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected setFacet(facet: NoticeFacet): void {
    this.facet.set(facet);
  }
}

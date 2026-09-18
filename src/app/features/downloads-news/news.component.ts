import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { UmsEmptyStateComponent } from '@ums/design-system';
import { ContentApiService } from '../../core/http/content-api.service';
import type { BannerDto } from '../../core/http/content-api.models';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { ResponsiveImageComponent } from '../../shared/ui/image/responsive-image.component';

/**
 * PWEB-23: News/media, distinct from Notices.
 *
 * **Confirmed gap, not built here:** `ums-core`'s `Content` module has no distinct News/press/
 * media entity at all -- no category or tag field exists on `Notice`/`Event` either (confirmed
 * against source, `content-api.models.ts`'s doc comment), so there is no real way to derive a
 * "press coverage" feed even as a filtered subset of an existing type. The one genuinely real,
 * photographic Content data this app has is `Banner` (already used for the homepage hero,
 * PWEB-9) -- reused here, honestly labeled "Campus highlights" (not fabricated as "News"), as the
 * campus-life photo gallery half of this ticket. "Press coverage" renders its own honest
 * coming-soon state rather than inventing a fictional content type client-side. Flagged in this
 * app's PR as a blocking cross-team gap (Content needs a real News/press entity before this
 * ticket's press-coverage half can be genuinely built).
 */
@Component({
  selector: 'pweb-news',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResponsiveImageComponent, UmsEmptyStateComponent, TranslatePipe],
  host: { class: 'pweb-news' },
  templateUrl: './news.component.html',
  styleUrl: './news.component.scss',
})
export class NewsComponent {
  private readonly contentApi = inject(ContentApiService);

  protected readonly banners = signal<readonly BannerDto[]>([]);
  protected readonly loading = signal(true);

  constructor() {
    this.contentApi.listBanners().subscribe({
      next: (banners) => {
        this.banners.set(banners);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MotionService } from '@ums/design-system';
import { ContentApiService } from '../../core/http/content-api.service';
import type { BannerDto } from '../../core/http/content-api.models';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { ResponsiveImageComponent } from '../../shared/ui/image/responsive-image.component';

/**
 * PWEB-9: full-bleed hero, driven by `Content`'s `Banner` (already publish/expiry-window
 * filtered server-side, PWEB-4 research: `GET /content/banners` returns only
 * `ListActiveAsync()`'s result). Falls back to a text-only, still on-brand hero when no banner is
 * currently active -- never a blank section (Domain Invariant #5).
 *
 * Ambient motion (a slow scale, requirement-spec.md §7 "slow ambient motion... never an
 * aggressive auto-advancing carousel") is gated behind `MotionService.prefersReducedMotion` --
 * applied as a CSS class, not merely documented, so the media query is genuinely respected.
 */
@Component({
  selector: 'pweb-hero-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResponsiveImageComponent, RouterLink, TranslatePipe],
  host: {
    class: 'pweb-hero-banner',
    '[class.pweb-hero-banner--ambient-motion]': '!motion.prefersReducedMotion()',
  },
  templateUrl: './hero-banner.component.html',
  styleUrl: './hero-banner.component.scss',
})
export class HeroBannerComponent {
  private readonly contentApi = inject(ContentApiService);
  protected readonly motion = inject(MotionService);

  protected readonly banner = signal<BannerDto | null>(null);

  constructor() {
    this.contentApi.listBanners().subscribe({
      next: (banners) => {
        const [first] = [...banners].sort((a, b) => a.sortOrder - b.sortOrder);
        this.banner.set(first ?? null);
      },
      error: () => this.banner.set(null),
    });
  }
}

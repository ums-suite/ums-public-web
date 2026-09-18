import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  inject,
  input,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdmissionApiService } from '../../../core/http/admission-api.service';
import {
  computeCampaignWindowState,
  type CampaignWindowState,
} from '../../../core/http/admission-api.models';
import { APP_CONFIG } from '../../../core/config/app-config';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

/** While mounted client-side, re-checks the campaign window this often (design-decisions.md's Cache-Lifetime Segmentation). */
const CLIENT_RECHECK_INTERVAL_MS = 60_000;

/**
 * PWEB-11 (reused by PWEB-13's persistent scroll-anchored CTA): "Apply Now", shown ONLY for a
 * genuinely open `AdmissionCampaign` window (Domain Invariant #4).
 *
 * design-decisions.md "Cache-Lifetime Segmentation for Invariant-Critical UI Fragments": this
 * component's own campaign-window read is excluded from Angular's HTTP TransferState cache
 * (`app.config.ts`'s `withHttpTransferCacheOptions filter`), so every render -- server AND the
 * client's own post-hydration read -- issues a genuinely fresh request, never a value reused
 * across the SSR/hydration boundary or served from a page-level cache. On top of that, once
 * mounted in the browser it re-checks on a short interval so a campaign closing while a visitor
 * is already looking at the page still flips this CTA live, rather than only on next navigation.
 *
 * `AdmissionApiService.getPublicCampaignWindow` calls a documented, currently-unbuilt `ums-core`
 * endpoint (see that service's doc comment) and resolves to `null` on any failure -- which
 * {@link computeCampaignWindowState} maps to `'unknown'`, rendered identically to `'closed'`: the
 * safe default is to never show Apply Now when the state can't be confirmed.
 */
@Component({
  selector: 'pweb-apply-now-cta',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  host: { class: 'pweb-apply-now-cta' },
  templateUrl: './apply-now-cta.component.html',
  styleUrl: './apply-now-cta.component.scss',
})
export class ApplyNowCtaComponent {
  readonly programId = input<string | undefined>(undefined);

  private readonly admissionApi = inject(AdmissionApiService);
  private readonly appConfig = inject(APP_CONFIG);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly state = signal<CampaignWindowState>({ kind: 'unknown' });

  constructor() {
    this.refresh();

    afterNextRender(() => {
      // The SSR/Hydration Freshness Policy pattern (design-decisions.md), applied to the CTA's
      // own cache-segmentation requirement: re-check the instant the app becomes interactive,
      // then on a short recurring interval for as long as this CTA stays mounted.
      this.refresh();
      if (isPlatformBrowser(this.platformId)) {
        interval(CLIENT_RECHECK_INTERVAL_MS)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.refresh());
      }
    });
  }

  protected get applyHref(): string {
    return `${this.appConfig.admissionWebUrl}/app/register`;
  }

  protected formattedOpenDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private refresh(): void {
    this.admissionApi.getPublicCampaignWindow(this.programId()).subscribe((dto) => {
      this.state.set(computeCampaignWindowState(dto, new Date()));
    });
  }
}

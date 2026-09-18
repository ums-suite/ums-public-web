import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import type { UmsApiError } from '@ums/shared';
import { ContentApiService } from '../../core/http/content-api.service';
import type { NoticeDto } from '../../core/http/content-api.models';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import {
  isNoticeCurrentlyVisible,
  noticeErrorToState,
  type NoticeDetailState,
} from './notice.models';

/**
 * PWEB-17: Notice detail.
 *
 * Implements design-decisions.md's SSR/Hydration Freshness Policy exactly like
 * `program-detail.component.ts` -- {@link recheckFreshness} fires once, immediately after
 * hydration completes, re-reading the notice's own publish-state rather than trusting the
 * SSR-transferred value for the page's whole lifetime.
 *
 * Handles the "expired but still-linked" edge case honestly: a real Archived notice's content is
 * unconditionally withheld server-side (410 Gone, `notice.models.ts`'s doc comment) -- this
 * component still resolves the route (never a blank/broken page) and renders a designed
 * "Archived" notice instead of fabricating content the backend no longer serves.
 *
 * **Confirmed gap, not built here:** "downloadable attachments" (requirement-spec.md §3.4) has no
 * backing field at all on the real `NoticeDto` (confirmed against source, `content-api.models.ts`'s
 * doc comment) -- no attachments section is rendered, rather than an empty/fake one.
 */
@Component({
  selector: 'pweb-notice-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, TranslatePipe],
  host: { class: 'pweb-notice-detail' },
  templateUrl: './notice-detail.component.html',
  styleUrl: './notice-detail.component.scss',
})
export class NoticeDetailComponent {
  readonly noticeId = input.required<string>();

  private readonly contentApi = inject(ContentApiService);

  protected readonly notice = signal<NoticeDto | null>(null);
  protected readonly state = signal<NoticeDetailState>({ kind: 'loading' });
  protected readonly noLongerCurrent = computed(() => {
    const current = this.state();
    return current.kind === 'found' && current.noLongerCurrent;
  });

  constructor() {
    effect(() => {
      const id = this.noticeId();
      untracked(() => this.load(id));
    });
    afterNextRender(() => this.recheckFreshness());
  }

  private load(id: string): void {
    this.state.set({ kind: 'loading' });
    this.contentApi.getNotice(id).subscribe({
      next: (dto) => {
        this.notice.set(dto);
        this.state.set({ kind: 'found', noLongerCurrent: !isNoticeCurrentlyVisible(dto.status) });
      },
      error: (error: UmsApiError) => this.state.set(noticeErrorToState(error)),
    });
  }

  /** design-decisions.md's SSR/Hydration Freshness Policy -- see class doc. */
  protected recheckFreshness(): void {
    if (this.state().kind !== 'found') {
      return;
    }

    this.contentApi.getNotice(this.noticeId()).subscribe({
      next: (fresh) => {
        this.notice.set(fresh);
        this.state.set({ kind: 'found', noLongerCurrent: !isNoticeCurrentlyVisible(fresh.status) });
      },
      error: (error: UmsApiError) => {
        // A 410 discovered only at the freshness re-check (archived between SSR flush and
        // hydration) still must flip the page -- Domain Invariant #2 applies here just as much as
        // at initial load. Any other failure never breaks an otherwise-fine, already-rendered page.
        if (error.status === 410) {
          this.state.set({ kind: 'archived' });
        }
      },
    });
  }
}

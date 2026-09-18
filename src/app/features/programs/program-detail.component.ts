import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  REQUEST,
  afterNextRender,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrganizationApiService } from '../../core/http/organization-api.service';
import type {
  DepartmentDto,
  FacultyDto,
  ProgramDto,
} from '../../core/http/organization-api.models';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { ApplyNowCtaComponent } from '../../shared/ui/cta/apply-now-cta.component';
import { isProgramCurrentlyVisible } from './program-detail.models';
import { ProgramSeoService } from './program-seo.service';

/**
 * PWEB-13: Program detail -- editorial long-form layout, sticky-on-scroll quick facts (CSS
 * `position: sticky`, no JS scroll-listener needed), and the persistent Apply Now/closed-campaign
 * CTA (reusing {@link ApplyNowCtaComponent} from PWEB-11) anchored inside that same sticky panel
 * so it stays visible through the scroll, not just at the top.
 *
 * "Related faculty callouts" (requirement-spec.md §3.2) are deliberately NOT built here:
 * `Faculty`'s `FacultyMember` list endpoint is permission-gated (`faculty.profile.read`), not
 * anonymous (confirmed, PWEB-4 research) -- there is no public way for this page to discover which
 * faculty members belong to a department at all. Rendering an empty/fake section would be worse
 * than omitting it; flagged as a cross-team gap in this app's PR.
 *
 * Implements design-decisions.md's SSR/Hydration Freshness Policy: {@link recheckPublishState}
 * fires once, immediately after hydration completes (`afterNextRender`, which never runs during
 * SSR), re-reading the program's own `status` rather than trusting the SSR-transferred value for
 * the page's whole lifetime -- if it's no longer `Active`, the page swaps to a "no longer
 * available" notice instead of silently continuing to show stale content.
 */
@Component({
  selector: 'pweb-program-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ApplyNowCtaComponent, TranslatePipe],
  host: { class: 'pweb-program-detail' },
  templateUrl: './program-detail.component.html',
  styleUrl: './program-detail.component.scss',
})
export class ProgramDetailComponent {
  readonly programId = input.required<string>();

  private readonly organizationApi = inject(OrganizationApiService);
  private readonly seo = inject(ProgramSeoService);
  private readonly document = inject(DOCUMENT);
  private readonly request = inject(REQUEST, { optional: true });

  protected readonly program = signal<ProgramDto | null>(null);
  protected readonly department = signal<DepartmentDto | null>(null);
  protected readonly faculty = signal<FacultyDto | null>(null);
  protected readonly notFound = signal(false);
  protected readonly unavailable = signal(false);

  constructor() {
    effect(() => {
      const id = this.programId();
      untracked(() => this.loadProgram(id));
    });

    afterNextRender(() => this.recheckPublishState());
  }

  private loadProgram(id: string): void {
    this.notFound.set(false);
    this.unavailable.set(false);
    this.department.set(null);
    this.faculty.set(null);

    this.organizationApi.getProgram(id).subscribe({
      next: (dto) => {
        this.program.set(dto);
        this.unavailable.set(!isProgramCurrentlyVisible(dto.status));
        this.seo.apply(dto, this.canonicalUrl(), 'University Management Suite');
        this.loadBreadcrumb(dto.departmentId);
      },
      error: () => this.notFound.set(true),
    });
  }

  private loadBreadcrumb(departmentId: string): void {
    this.organizationApi.getDepartment(departmentId).subscribe({
      next: (department) => {
        this.department.set(department);
        this.organizationApi.getFaculty(department.facultyId).subscribe({
          next: (faculty) => this.faculty.set(faculty),
          error: () => this.faculty.set(null),
        });
      },
      error: () => this.department.set(null),
    });
  }

  /** design-decisions.md's SSR/Hydration Freshness Policy -- see class doc. */
  protected recheckPublishState(): void {
    const current = this.program();
    if (!current) {
      return;
    }

    this.organizationApi.getProgram(current.id).subscribe({
      next: (fresh) => {
        this.program.set(fresh);
        this.unavailable.set(!isProgramCurrentlyVisible(fresh.status));
      },
      // A failed freshness check must never break an otherwise-fine, already-rendered page.
      error: () => undefined,
    });
  }

  private canonicalUrl(): string {
    if (this.request) {
      return this.request.url;
    }
    return this.document.location?.href ?? '';
  }
}

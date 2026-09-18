import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { UmsAvatarComponent } from '@ums/design-system';
import { ResearchApiService } from '../../core/http/research-api.service';
import type {
  GrantDto,
  InstitutionalRepositoryEntryDto,
  PublicationDto,
} from '../../core/http/research-api.models';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

const PAGE_SIZE = 20;

/**
 * PWEB-20: aggregated `ResearchProfile`-adjacent showcase (publications, grants, non-embargoed
 * repository entries) via `Research`'s own genuinely public `/public/...` surface -- a SEPARATE,
 * confirmed-real module surface from `Faculty`'s own gated `FacultyMember` directory (PWEB-15/16).
 *
 * **Confirmed gap, not built here:** requirement-spec.md §3.5 asks for this to be "filterable by
 * department" -- no department facet is rendered at all (see `research-api.models.ts`'s doc
 * comment for the full explanation: none of the three DTOs carry a department, and there is no
 * anonymous way to resolve a `FacultyMemberId` to one via the gated `Faculty` module).
 *
 * A related, narrower gap surfaces per-section: `PublicationDto.authors` carries a real `name`
 * string per author (rendered here, including the "no photo" edge case via
 * `<ums-avatar [name]="...">` with no `imageUrl` -- `@ums/design-system`'s own tested initials-
 * fallback), but `GrantDto`'s investigators are only bare `facultyMemberId` `Guid`s with no name at
 * all (confirmed against source) -- rendering a raw GUID would be worse than omitting it, so grant
 * cards show funding/status only, never an investigator identity. `InstitutionalRepositoryEntryDto`
 * DOES carry a real `depositor.name`, so that section renders it.
 */
@Component({
  selector: 'pweb-research-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe, UmsAvatarComponent, TranslatePipe],
  host: { class: 'pweb-research-showcase' },
  templateUrl: './research-showcase.component.html',
  styleUrl: './research-showcase.component.scss',
})
export class ResearchShowcaseComponent {
  private readonly researchApi = inject(ResearchApiService);

  protected readonly publications = signal<readonly PublicationDto[]>([]);
  protected readonly grants = signal<readonly GrantDto[]>([]);
  protected readonly repositoryEntries = signal<readonly InstitutionalRepositoryEntryDto[]>([]);
  protected readonly loading = signal(true);

  constructor() {
    this.researchApi.listPublications({ skip: 0, take: PAGE_SIZE }).subscribe({
      next: (page) => this.publications.set(page.items),
      error: () => this.publications.set([]),
    });
    this.researchApi.listGrants({ skip: 0, take: PAGE_SIZE }).subscribe({
      next: (page) => this.grants.set(page.items),
      error: () => this.grants.set([]),
    });
    this.researchApi.listRepositoryEntries({ skip: 0, take: PAGE_SIZE }).subscribe({
      next: (page) => {
        this.repositoryEntries.set(page.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}

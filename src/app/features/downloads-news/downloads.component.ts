import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ContentApiService } from '../../core/http/content-api.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { groupDownloadsByCategory, type DownloadCategoryGroup } from './downloads.models';

const PAGE_SIZE = 200;

/**
 * PWEB-22: structured downloads section, grouped by `DownloadResourceDto`'s real `category` field
 * (`downloads.models.ts`).
 *
 * **Confirmed gap, not built here:** `DownloadResourceDto.artifactId` references a `Documents`-
 * module upload, and `Documents` has NO anonymous-accessible endpoint anywhere that resolves an
 * artifact id to an actual downloadable file (`UploadEndpoints.cs`/`GenerationEndpoints.cs`, both
 * confirmed `RequireLiveSession`/permission-gated). Every item therefore renders its title/category
 * with an honest "download link not yet available" state rather than a fabricated `href` that
 * would 404 or worse silently point nowhere -- flagged in this app's PR as a blocking cross-team
 * gap (Documents needs a public, artifact-scoped file-read endpoint before this ticket's actual
 * "download" action can be wired up for real).
 */
@Component({
  selector: 'pweb-downloads',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  host: { class: 'pweb-downloads' },
  templateUrl: './downloads.component.html',
  styleUrl: './downloads.component.scss',
})
export class DownloadsComponent {
  private readonly contentApi = inject(ContentApiService);

  protected readonly groups = signal<readonly DownloadCategoryGroup[]>([]);
  protected readonly loading = signal(true);

  constructor() {
    this.contentApi.listDownloads({ skip: 0, take: PAGE_SIZE }).subscribe({
      next: (page) => {
        this.groups.set(groupDownloadsByCategory(page.items));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}

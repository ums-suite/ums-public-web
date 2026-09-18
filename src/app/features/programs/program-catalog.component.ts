import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { ProgramCatalogStore } from './program-catalog.store';

/**
 * PWEB-12: Program Catalog -- faceted browse (Faculty → Department) as rich cards, instant
 * client-side re-filter backed by {@link ProgramCatalogStore}'s facet cache.
 *
 * Cards render only what `Organization`'s real `ProgramDto` actually has (name, status) -- no
 * degree-level, duration, or one-line hook, since none of those fields exist server-side
 * (confirmed, PWEB-4 research; flagged prominently in this app's PR as a cross-team gap against
 * requirement-spec.md §3.2/§7's expectations). The "degree level" facet named in the spec is
 * likewise omitted entirely rather than faked -- only the two facets that map to a real field
 * (Faculty, Department) are offered.
 */
@Component({
  selector: 'pweb-program-catalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe],
  host: { class: 'pweb-program-catalog' },
  templateUrl: './program-catalog.component.html',
  styleUrl: './program-catalog.component.scss',
})
export class ProgramCatalogComponent {
  protected readonly store = inject(ProgramCatalogStore);

  protected readonly resultCount = computed(() => this.store.programs().length);

  constructor() {
    this.store.loadFaculties();
  }

  protected onFacultyChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.store.selectFaculty(value || null);
  }

  protected onDepartmentChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.store.selectDepartment(value || null);
  }
}

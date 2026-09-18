import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentApiService } from '../../core/http/content-api.service';
import type { EventDto } from '../../core/http/content-api.models';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

const PAGE_SIZE = 50;

/** PWEB-18: upcoming Event list -- date-forward editorial cards (requirement-spec.md §7 Key Screens). */
@Component({
  selector: 'pweb-event-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, TranslatePipe],
  host: { class: 'pweb-event-list' },
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.scss',
})
export class EventListComponent {
  private readonly contentApi = inject(ContentApiService);

  protected readonly events = signal<readonly EventDto[]>([]);
  protected readonly loading = signal(true);

  constructor() {
    this.contentApi
      .listEvents({ skip: 0, take: PAGE_SIZE, from: new Date().toISOString() })
      .subscribe({
        next: (page) => {
          this.events.set(page.items);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}

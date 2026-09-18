import { DatePipe, DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentApiService } from '../../core/http/content-api.service';
import type { EventDto } from '../../core/http/content-api.models';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { buildIcsContent, buildIcsFilename } from './ics-export.util';

/**
 * PWEB-18: Event detail -- date/location plus a real "add to calendar" `.ics` export, generated
 * entirely client-side (no backend endpoint needed, per this batch's brief). The download itself
 * only runs in the browser (`isPlatformBrowser`) -- `Blob`/`URL.createObjectURL` don't exist during
 * SSR, and there is nothing to download before the visitor actually clicks the button anyway.
 */
@Component({
  selector: 'pweb-event-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, TranslatePipe],
  host: { class: 'pweb-event-detail' },
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.scss',
})
export class EventDetailComponent {
  readonly eventId = input.required<string>();

  private readonly contentApi = inject(ContentApiService);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly event = signal<EventDto | null>(null);
  protected readonly notFound = signal(false);

  constructor() {
    effect(() => {
      const id = this.eventId();
      untracked(() => this.load(id));
    });
  }

  private load(id: string): void {
    this.contentApi.getEvent(id).subscribe({
      next: (dto) => this.event.set(dto),
      error: () => this.notFound.set(true),
    });
  }

  protected downloadIcs(): void {
    const event = this.event();
    if (!event || !isPlatformBrowser(this.platformId)) {
      return;
    }

    const content = buildIcsContent({
      id: event.id,
      title: event.title,
      description: event.body,
      location: event.locationLabel,
      startAt: event.startAt,
      endAt: event.endAt,
    });

    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = this.document.createElement('a');
    anchor.href = url;
    anchor.download = buildIcsFilename(event.title);
    anchor.click();
    URL.revokeObjectURL(url);
  }
}

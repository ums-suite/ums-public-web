import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ContentApiService } from '../../core/http/content-api.service';
import type { EventDto } from '../../core/http/content-api.models';
import { EventDetailComponent } from './event-detail.component';

describe('EventDetailComponent', () => {
  let fixture: ComponentFixture<EventDetailComponent>;
  let contentApiSpy: jasmine.SpyObj<ContentApiService>;

  const event: EventDto = {
    id: 'e1',
    title: 'Open Day',
    body: 'Come tour the campus.',
    locationLabel: 'Main Auditorium',
    languageCode: 'en',
    audience: ['public'],
    organizationNodeId: null,
    startAt: '2026-03-15T09:00:00.000Z',
    endAt: '2026-03-15T12:00:00.000Z',
  };

  function setUp(platformId: object | string = 'browser'): void {
    TestBed.configureTestingModule({
      imports: [EventDetailComponent],
      providers: [
        provideRouter([]),
        { provide: ContentApiService, useValue: contentApiSpy },
        { provide: PLATFORM_ID, useValue: platformId },
      ],
    });
    fixture = TestBed.createComponent(EventDetailComponent);
    fixture.componentRef.setInput('eventId', 'e1');
  }

  beforeEach(() => {
    contentApiSpy = jasmine.createSpyObj<ContentApiService>('ContentApiService', ['getEvent']);
  });

  it('renders the event title, date, and location once loaded', () => {
    contentApiSpy.getEvent.and.returnValue(of(event));
    setUp();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Open Day');
    expect(fixture.nativeElement.textContent).toContain('Main Auditorium');
  });

  it('renders a not-found state when the event cannot be fetched', () => {
    contentApiSpy.getEvent.and.returnValue(throwError(() => new Error('404')));
    setUp();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('could not be found');
  });

  it('downloads a real .ics file via a Blob/object-URL anchor click, in the browser', () => {
    contentApiSpy.getEvent.and.returnValue(of(event));
    setUp('browser');
    fixture.detectChanges();

    const createObjectURLSpy = spyOn(URL, 'createObjectURL').and.returnValue('blob:mock-url');
    const revokeObjectURLSpy = spyOn(URL, 'revokeObjectURL');
    const anchor = document.createElement('a');
    const clickSpy = spyOn(anchor, 'click');
    spyOn(document, 'createElement').and.returnValue(anchor);

    fixture.nativeElement.querySelector('.pweb-event-detail__ics-button').click();

    expect(createObjectURLSpy).toHaveBeenCalled();
    const blobArg = createObjectURLSpy.calls.mostRecent().args[0] as Blob;
    expect(blobArg.type).toBe('text/calendar;charset=utf-8');
    expect(anchor.download).toBe('open-day.ics');
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
  });

  it('does nothing when downloadIcs is invoked on the server platform', () => {
    contentApiSpy.getEvent.and.returnValue(of(event));
    setUp('server');
    fixture.detectChanges();

    const createObjectURLSpy = spyOn(URL, 'createObjectURL');
    fixture.componentInstance['downloadIcs']();

    expect(createObjectURLSpy).not.toHaveBeenCalled();
  });
});

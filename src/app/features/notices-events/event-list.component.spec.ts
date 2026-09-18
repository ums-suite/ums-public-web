import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ContentApiService } from '../../core/http/content-api.service';
import { EventListComponent } from './event-list.component';

describe('EventListComponent', () => {
  let fixture: ComponentFixture<EventListComponent>;
  let contentApiSpy: jasmine.SpyObj<ContentApiService>;

  function setUp(): void {
    TestBed.configureTestingModule({
      imports: [EventListComponent],
      providers: [provideRouter([]), { provide: ContentApiService, useValue: contentApiSpy }],
    });
    fixture = TestBed.createComponent(EventListComponent);
  }

  beforeEach(() => {
    contentApiSpy = jasmine.createSpyObj<ContentApiService>('ContentApiService', ['listEvents']);
  });

  it('requests events from the current instant onward (upcoming only)', () => {
    contentApiSpy.listEvents.and.returnValue(of({ items: [], totalCount: 0, skip: 0, take: 50 }));
    setUp();
    fixture.detectChanges();

    expect(contentApiSpy.listEvents).toHaveBeenCalledWith(
      jasmine.objectContaining({ skip: 0, take: 50, from: jasmine.any(String) }),
    );
  });

  it('renders each event with a link to its detail page', () => {
    contentApiSpy.listEvents.and.returnValue(
      of({
        items: [
          {
            id: 'e1',
            title: 'Open Day',
            body: '',
            locationLabel: 'Main Campus',
            languageCode: 'en',
            audience: ['public'],
            organizationNodeId: null,
            startAt: '2026-03-01T00:00:00Z',
            endAt: '2026-03-01T04:00:00Z',
          },
        ],
        totalCount: 1,
        skip: 0,
        take: 50,
      }),
    );
    setUp();
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('a.pweb-event-list__card');
    expect(link.getAttribute('href')).toBe('/events/e1');
    expect(link.textContent).toContain('Open Day');
    expect(link.textContent).toContain('Main Campus');
  });

  it('shows the empty state when there are no upcoming events', () => {
    contentApiSpy.listEvents.and.returnValue(of({ items: [], totalCount: 0, skip: 0, take: 50 }));
    setUp();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.pweb-event-list__status')).not.toBeNull();
  });

  it('degrades to the empty state (never throws) when the request fails', () => {
    contentApiSpy.listEvents.and.returnValue(throwError(() => new Error('network')));
    setUp();

    expect(() => fixture.detectChanges()).not.toThrow();
  });
});

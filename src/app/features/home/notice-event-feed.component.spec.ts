import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ContentApiService } from '../../core/http/content-api.service';
import { NoticeEventFeedComponent } from './notice-event-feed.component';

describe('NoticeEventFeedComponent', () => {
  let fixture: ComponentFixture<NoticeEventFeedComponent>;
  let contentApiSpy: jasmine.SpyObj<ContentApiService>;

  function setUp(): void {
    TestBed.configureTestingModule({
      imports: [NoticeEventFeedComponent],
      providers: [provideRouter([]), { provide: ContentApiService, useValue: contentApiSpy }],
    });
    fixture = TestBed.createComponent(NoticeEventFeedComponent);
  }

  beforeEach(() => {
    contentApiSpy = jasmine.createSpyObj<ContentApiService>('ContentApiService', [
      'listNotices',
      'listEvents',
    ]);
  });

  it('renders fetched notices and events as editorial cards', () => {
    contentApiSpy.listNotices.and.returnValue(
      of({
        items: [
          {
            id: 'n1',
            title: 'Exam schedule published',
            body: '',
            languageCode: 'en',
            audience: ['public'],
            organizationNodeId: null,
            isUrgent: true,
            status: 'Published',
            publishAt: null,
            expireAt: null,
            publishedAt: '2026-01-01T00:00:00Z',
            archivedAt: null,
            hasBengaliTranslation: false,
          },
        ],
        totalCount: 1,
        skip: 0,
        take: 5,
      }),
    );
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
        take: 5,
      }),
    );
    setUp();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Exam schedule published');
    expect(fixture.nativeElement.textContent).toContain('Open Day');
    expect(fixture.nativeElement.textContent).toContain('Main Campus');
  });

  it('renders a designed empty state (not a blank list) when there are no notices/events', () => {
    contentApiSpy.listNotices.and.returnValue(of({ items: [], totalCount: 0, skip: 0, take: 5 }));
    contentApiSpy.listEvents.and.returnValue(of({ items: [], totalCount: 0, skip: 0, take: 5 }));
    setUp();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No notices right now');
    expect(fixture.nativeElement.textContent).toContain('No upcoming events right now');
  });

  it('degrades to the empty state (never throws) when a feed request fails', () => {
    contentApiSpy.listNotices.and.returnValue(throwError(() => new Error('network')));
    contentApiSpy.listEvents.and.returnValue(throwError(() => new Error('network')));
    setUp();

    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.nativeElement.textContent).toContain('No notices right now');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ContentApiService } from '../../core/http/content-api.service';
import { NoticeListComponent } from './notice-list.component';

describe('NoticeListComponent', () => {
  let fixture: ComponentFixture<NoticeListComponent>;
  let contentApiSpy: jasmine.SpyObj<ContentApiService>;

  const notices = [
    { id: 'n1', title: 'General notice', isUrgent: false, publishedAt: '2026-01-01T00:00:00Z' },
    { id: 'n2', title: 'Urgent notice', isUrgent: true, publishedAt: '2026-01-02T00:00:00Z' },
  ];

  function setUp(): void {
    TestBed.configureTestingModule({
      imports: [NoticeListComponent],
      providers: [provideRouter([]), { provide: ContentApiService, useValue: contentApiSpy }],
    });
    fixture = TestBed.createComponent(NoticeListComponent);
  }

  beforeEach(() => {
    contentApiSpy = jasmine.createSpyObj<ContentApiService>('ContentApiService', ['listNotices']);
  });

  it('renders every returned notice under the "all" facet by default', () => {
    contentApiSpy.listNotices.and.returnValue(
      of({ items: notices as never, totalCount: 2, skip: 0, take: 50 }),
    );
    setUp();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('li').length).toBe(2);
  });

  it('narrows to only isUrgent notices under the "urgent" facet, client-side', () => {
    contentApiSpy.listNotices.and.returnValue(
      of({ items: notices as never, totalCount: 2, skip: 0, take: 50 }),
    );
    setUp();
    fixture.detectChanges();

    fixture.componentInstance['setFacet']('urgent');
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('li');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('Urgent notice');
  });

  it('shows the empty state, not a broken list, when there are no notices', () => {
    contentApiSpy.listNotices.and.returnValue(of({ items: [], totalCount: 0, skip: 0, take: 50 }));
    setUp();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.pweb-notice-list__status')).not.toBeNull();
  });

  it('degrades to the empty state (never throws) when the request fails', () => {
    contentApiSpy.listNotices.and.returnValue(throwError(() => new Error('network')));
    setUp();

    expect(() => fixture.detectChanges()).not.toThrow();
  });
});

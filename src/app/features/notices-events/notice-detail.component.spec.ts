import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import type { UmsApiError } from '@ums/shared';
import { ContentApiService } from '../../core/http/content-api.service';
import type { NoticeDto } from '../../core/http/content-api.models';
import { NoticeDetailComponent } from './notice-detail.component';

describe('NoticeDetailComponent', () => {
  let fixture: ComponentFixture<NoticeDetailComponent>;
  let contentApiSpy: jasmine.SpyObj<ContentApiService>;

  const publishedNotice: NoticeDto = {
    id: 'n1',
    title: 'Semester begins',
    body: 'Classes resume on Monday.',
    languageCode: 'en',
    audience: ['Public'],
    organizationNodeId: null,
    isUrgent: false,
    status: 'Published',
    publishAt: null,
    expireAt: null,
    publishedAt: '2026-01-01T00:00:00Z',
    archivedAt: null,
    hasBengaliTranslation: false,
  };

  function setUp(): void {
    TestBed.configureTestingModule({
      imports: [NoticeDetailComponent],
      providers: [provideRouter([]), { provide: ContentApiService, useValue: contentApiSpy }],
    });
    fixture = TestBed.createComponent(NoticeDetailComponent);
    fixture.componentRef.setInput('noticeId', 'n1');
  }

  beforeEach(() => {
    contentApiSpy = jasmine.createSpyObj<ContentApiService>('ContentApiService', ['getNotice']);
  });

  it('renders the notice title and body once loaded', () => {
    contentApiSpy.getNotice.and.returnValue(of(publishedNotice));
    setUp();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Semester begins');
    expect(fixture.nativeElement.textContent).toContain('Classes resume on Monday.');
  });

  it('renders the designed Archived state (not a broken page) on an initial 410', () => {
    const error: UmsApiError = { status: 410, message: 'Gone' };
    contentApiSpy.getNotice.and.returnValue(throwError(() => error));
    setUp();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.pweb-notice-detail__archived')).not.toBeNull();
  });

  it('renders a not-found state for a genuine 404', () => {
    const error: UmsApiError = { status: 404, message: 'Not Found' };
    contentApiSpy.getNotice.and.returnValue(throwError(() => error));
    setUp();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('could not be found');
  });

  it('SSR/Hydration Freshness Policy: flips to Archived once a post-hydration recheck finds a 410', () => {
    contentApiSpy.getNotice.and.returnValue(of(publishedNotice));
    setUp();
    fixture.detectChanges();
    expect(fixture.componentInstance['state']().kind).toBe('found');

    const error: UmsApiError = { status: 410, message: 'Gone' };
    contentApiSpy.getNotice.and.returnValue(throwError(() => error));
    fixture.componentInstance['recheckFreshness']();
    fixture.detectChanges();

    expect(fixture.componentInstance['state']().kind).toBe('archived');
    expect(fixture.nativeElement.querySelector('.pweb-notice-detail__archived')).not.toBeNull();
  });

  it('a freshness recheck failure other than 410 never breaks the already-rendered page', () => {
    contentApiSpy.getNotice.and.returnValue(of(publishedNotice));
    setUp();
    fixture.detectChanges();

    const error: UmsApiError = { status: 0, message: 'network' };
    contentApiSpy.getNotice.and.returnValue(throwError(() => error));
    expect(() => fixture.componentInstance['recheckFreshness']()).not.toThrow();
    expect(fixture.componentInstance['state']().kind).toBe('found');
  });

  it('does not re-check freshness while the initial load has not resolved to "found" yet', () => {
    contentApiSpy.getNotice.and.returnValue(
      throwError(() => ({ status: 404, message: 'Not Found' })),
    );
    setUp();
    fixture.detectChanges();

    contentApiSpy.getNotice.calls.reset();
    fixture.componentInstance['recheckFreshness']();

    expect(contentApiSpy.getNotice).not.toHaveBeenCalled();
  });
});

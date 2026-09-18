import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ContentApiService } from '../../core/http/content-api.service';
import { NewsComponent } from './news.component';

describe('NewsComponent', () => {
  let fixture: ComponentFixture<NewsComponent>;
  let contentApiSpy: jasmine.SpyObj<ContentApiService>;

  function setUp(): void {
    TestBed.configureTestingModule({
      imports: [NewsComponent],
      providers: [{ provide: ContentApiService, useValue: contentApiSpy }],
    });
    fixture = TestBed.createComponent(NewsComponent);
  }

  beforeEach(() => {
    contentApiSpy = jasmine.createSpyObj<ContentApiService>('ContentApiService', ['listBanners']);
  });

  it('renders active banners as the campus-highlights gallery via ResponsiveImageComponent', () => {
    contentApiSpy.listBanners.and.returnValue(
      of([
        {
          id: 'b1',
          headline: 'Graduation Day',
          imageUrl: 'grad.jpg',
          linkUrl: null,
          sortOrder: 1,
          status: 'Active',
          publishAt: null,
          expireAt: null,
        },
      ]),
    );
    setUp();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('pweb-responsive-image')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Graduation Day');
  });

  it('always renders an honest coming-soon state for press coverage -- no fabricated content type', () => {
    contentApiSpy.listBanners.and.returnValue(of([]));
    setUp();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('ums-empty-state')).not.toBeNull();
  });

  it('shows the gallery empty state when there are no active banners', () => {
    contentApiSpy.listBanners.and.returnValue(of([]));
    setUp();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.pweb-news__status')).not.toBeNull();
  });

  it('degrades to the empty state (never throws) when the request fails', () => {
    contentApiSpy.listBanners.and.returnValue(throwError(() => new Error('network')));
    setUp();

    expect(() => fixture.detectChanges()).not.toThrow();
  });
});

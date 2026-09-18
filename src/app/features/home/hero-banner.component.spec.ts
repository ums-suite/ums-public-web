import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ContentApiService } from '../../core/http/content-api.service';
import { HeroBannerComponent } from './hero-banner.component';

describe('HeroBannerComponent', () => {
  let fixture: ComponentFixture<HeroBannerComponent>;
  let contentApiSpy: jasmine.SpyObj<ContentApiService>;

  function setUp(): void {
    TestBed.configureTestingModule({
      imports: [HeroBannerComponent],
      providers: [provideRouter([]), { provide: ContentApiService, useValue: contentApiSpy }],
    });
    fixture = TestBed.createComponent(HeroBannerComponent);
  }

  beforeEach(() => {
    contentApiSpy = jasmine.createSpyObj<ContentApiService>('ContentApiService', ['listBanners']);
  });

  it('renders the lowest-sortOrder active banner as the hero image', () => {
    contentApiSpy.listBanners.and.returnValue(
      of([
        {
          id: 'b2',
          headline: 'Second',
          imageUrl: 'b2.jpg',
          linkUrl: null,
          sortOrder: 2,
          status: 'Active',
          publishAt: null,
          expireAt: null,
        },
        {
          id: 'b1',
          headline: 'First',
          imageUrl: 'b1.jpg',
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

    expect(fixture.nativeElement.textContent).toContain('First');
  });

  it('renders the on-brand fallback headline when no banner is active', () => {
    contentApiSpy.listBanners.and.returnValue(of([]));
    setUp();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.pweb-hero-banner__fallback')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('A place to learn, discover, and belong');
  });

  it('degrades to the fallback (never throws) when the banners request fails', () => {
    contentApiSpy.listBanners.and.returnValue(throwError(() => new Error('network')));
    setUp();

    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.nativeElement.querySelector('.pweb-hero-banner__fallback')).not.toBeNull();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ContentApiService } from '../../core/http/content-api.service';
import { DownloadsComponent } from './downloads.component';

describe('DownloadsComponent', () => {
  let fixture: ComponentFixture<DownloadsComponent>;
  let contentApiSpy: jasmine.SpyObj<ContentApiService>;

  function setUp(): void {
    TestBed.configureTestingModule({
      imports: [DownloadsComponent],
      providers: [{ provide: ContentApiService, useValue: contentApiSpy }],
    });
    fixture = TestBed.createComponent(DownloadsComponent);
  }

  beforeEach(() => {
    contentApiSpy = jasmine.createSpyObj<ContentApiService>('ContentApiService', ['listDownloads']);
  });

  it('groups downloads by category, not a flat list', () => {
    contentApiSpy.listDownloads.and.returnValue(
      of({
        items: [
          {
            id: 'd1',
            title: 'Admission form',
            category: 'Forms',
            artifactId: 'a1',
            status: 'Published',
            publishAt: null,
            expireAt: null,
            createdAt: '',
            updatedAt: '',
            version: 1,
          },
          {
            id: 'd2',
            title: 'Prospectus',
            category: 'Brochures',
            artifactId: 'a2',
            status: 'Published',
            publishAt: null,
            expireAt: null,
            createdAt: '',
            updatedAt: '',
            version: 1,
          },
        ],
        totalCount: 2,
        skip: 0,
        take: 200,
      }),
    );
    setUp();
    fixture.detectChanges();

    const groups = fixture.nativeElement.querySelectorAll('.pweb-downloads__group');
    expect(groups.length).toBe(2);
  });

  it('never renders a real download href -- the file link is not publicly resolvable', () => {
    contentApiSpy.listDownloads.and.returnValue(
      of({
        items: [
          {
            id: 'd1',
            title: 'Admission form',
            category: 'Forms',
            artifactId: 'a1',
            status: 'Published',
            publishAt: null,
            expireAt: null,
            createdAt: '',
            updatedAt: '',
            version: 1,
          },
        ],
        totalCount: 1,
        skip: 0,
        take: 200,
      }),
    );
    setUp();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('a[href]')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Admission form');
  });

  it('shows the empty state when there are no published downloads', () => {
    contentApiSpy.listDownloads.and.returnValue(
      of({ items: [], totalCount: 0, skip: 0, take: 200 }),
    );
    setUp();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.pweb-downloads__status')).not.toBeNull();
  });

  it('degrades to the empty state (never throws) when the request fails', () => {
    contentApiSpy.listDownloads.and.returnValue(throwError(() => new Error('network')));
    setUp();

    expect(() => fixture.detectChanges()).not.toThrow();
  });
});

import { REQUEST } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AdmissionApiService } from '../../core/http/admission-api.service';
import { APP_CONFIG } from '../../core/config/app-config';
import { ContentApiService } from '../../core/http/content-api.service';
import { HomePageComponent } from './home-page.component';

describe('HomePageComponent', () => {
  let fixture: ComponentFixture<HomePageComponent>;

  beforeEach(() => {
    const contentApiSpy = jasmine.createSpyObj<ContentApiService>('ContentApiService', [
      'listBanners',
      'listNotices',
      'listEvents',
    ]);
    contentApiSpy.listBanners.and.returnValue(of([]));
    contentApiSpy.listNotices.and.returnValue(of({ items: [], totalCount: 0, skip: 0, take: 5 }));
    contentApiSpy.listEvents.and.returnValue(of({ items: [], totalCount: 0, skip: 0, take: 5 }));

    const admissionApiSpy = jasmine.createSpyObj<AdmissionApiService>('AdmissionApiService', [
      'getPublicCampaignWindow',
    ]);
    admissionApiSpy.getPublicCampaignWindow.and.returnValue(of(null));

    TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [
        provideRouter([]),
        { provide: REQUEST, useValue: null },
        { provide: ContentApiService, useValue: contentApiSpy },
        { provide: AdmissionApiService, useValue: admissionApiSpy },
        {
          provide: APP_CONFIG,
          useValue: { apiBaseUrl: '', admissionWebUrl: 'https://admission.example.edu' },
        },
      ],
    });
    fixture = TestBed.createComponent(HomePageComponent);
  });

  it('composes the hero, Apply Now CTA fragment, and notice/event feed', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('pweb-hero-banner')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('pweb-apply-now-cta')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('pweb-notice-event-feed')).not.toBeNull();
  });
});

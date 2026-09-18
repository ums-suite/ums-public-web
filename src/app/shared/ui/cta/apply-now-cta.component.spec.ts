import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { REQUEST } from '@angular/core';
import { AdmissionApiService } from '../../../core/http/admission-api.service';
import { APP_CONFIG } from '../../../core/config/app-config';
import type { PublicCampaignWindowDto } from '../../../core/http/admission-api.models';
import { ApplyNowCtaComponent } from './apply-now-cta.component';

describe('ApplyNowCtaComponent', () => {
  let fixture: ComponentFixture<ApplyNowCtaComponent>;
  let admissionApiSpy: jasmine.SpyObj<AdmissionApiService>;

  function setUp(dto: PublicCampaignWindowDto | null): void {
    admissionApiSpy = jasmine.createSpyObj<AdmissionApiService>('AdmissionApiService', [
      'getPublicCampaignWindow',
    ]);
    admissionApiSpy.getPublicCampaignWindow.and.returnValue(of(dto));

    TestBed.configureTestingModule({
      imports: [ApplyNowCtaComponent],
      providers: [
        { provide: REQUEST, useValue: null },
        { provide: AdmissionApiService, useValue: admissionApiSpy },
        {
          provide: APP_CONFIG,
          useValue: { apiBaseUrl: '', admissionWebUrl: 'https://admission.ums.example.edu' },
        },
      ],
    });
    fixture = TestBed.createComponent(ApplyNowCtaComponent);
  }

  it('renders an Apply Now link to ums-admission-web for a genuinely open campaign', () => {
    setUp({
      campaignId: 'c1',
      campaignName: 'Fall 2026',
      programId: 'p1',
      opensAt: '2020-01-01T00:00:00Z',
      closesAt: '2999-01-01T00:00:00Z',
    });
    fixture.componentRef.setInput('programId', 'p1');
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector(
      'a.pweb-apply-now-cta__button',
    ) as HTMLAnchorElement;
    expect(link).not.toBeNull();
    expect(link.href).toBe('https://admission.ums.example.edu/app/register');
    expect(admissionApiSpy.getPublicCampaignWindow).toHaveBeenCalledWith('p1');
  });

  it('renders an "admission opens" notice, never a button, for an upcoming campaign', () => {
    setUp({
      campaignId: 'c1',
      campaignName: 'Fall 2026',
      programId: 'p1',
      opensAt: '2999-01-01T00:00:00Z',
      closesAt: '2999-06-01T00:00:00Z',
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('a.pweb-apply-now-cta__button')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Admission opens');
  });

  it('renders "applications currently closed" and no button for a closed campaign', () => {
    setUp({
      campaignId: 'c1',
      campaignName: 'Fall 2025',
      programId: 'p1',
      opensAt: '2020-01-01T00:00:00Z',
      closesAt: '2020-06-01T00:00:00Z',
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('a.pweb-apply-now-cta__button')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Applications currently closed');
  });

  it('renders the safe closed-equivalent state (never a button) when the campaign endpoint yields nothing', () => {
    setUp(null);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('a.pweb-apply-now-cta__button')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Applications currently closed');
  });
});

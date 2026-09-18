import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';
import { AdmissionApiService } from './admission-api.service';

describe('AdmissionApiService', () => {
  let service: AdmissionApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: APP_CONFIG,
          useValue: { apiBaseUrl: 'http://localhost:8080', admissionWebUrl: '' },
        },
      ],
    });
    TestBed.inject(HttpClient);
    service = TestBed.inject(AdmissionApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('resolves the DTO on success', async () => {
    const promise = firstValueFrom(service.getPublicCampaignWindow('p1'));

    const req = httpMock.expectOne(
      (r) =>
        r.url === 'http://localhost:8080/api/v1/admission/campaigns/public' &&
        r.params.get('programId') === 'p1',
    );
    req.flush({
      campaignId: 'c1',
      campaignName: 'Fall 2026',
      programId: 'p1',
      opensAt: '2026-01-01T00:00:00Z',
      closesAt: '2026-02-01T00:00:00Z',
    });

    await expectAsync(promise).toBeResolvedTo(jasmine.objectContaining({ campaignId: 'c1' }));
  });

  it('degrades to null (never throws) when the endpoint fails -- it does not exist yet server-side', async () => {
    const promise = firstValueFrom(service.getPublicCampaignWindow('p1'));

    const req = httpMock.expectOne(
      (r) => r.url === 'http://localhost:8080/api/v1/admission/campaigns/public',
    );
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });

    await expectAsync(promise).toBeResolvedTo(null);
  });
});

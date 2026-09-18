import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../config/app-config';
import { ResearchApiService } from './research-api.service';

describe('ResearchApiService', () => {
  let service: ResearchApiService;
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
    service = TestBed.inject(ResearchApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists publicly visible publications from the public showcase route', () => {
    service.listPublications({ skip: 0, take: 20 }).subscribe();
    const req = httpMock.expectOne(
      (r) =>
        r.url === 'http://localhost:8080/api/v1/research/public/publications' &&
        r.params.get('skip') === '0' &&
        r.params.get('take') === '20',
    );
    expect(req.request.method).toBe('GET');
    req.flush({ items: [], skip: 0, take: 20 });
  });

  it('lists publicly visible grants', () => {
    service.listGrants({ skip: 0, take: 20 }).subscribe();
    const req = httpMock.expectOne(
      'http://localhost:8080/api/v1/research/public/grants?skip=0&take=20',
    );
    expect(req.request.method).toBe('GET');
    req.flush({ items: [], skip: 0, take: 20 });
  });

  it('lists non-embargoed repository entries', () => {
    service.listRepositoryEntries({ skip: 0, take: 20 }).subscribe();
    const req = httpMock.expectOne(
      'http://localhost:8080/api/v1/research/public/repository-entries?skip=0&take=20',
    );
    expect(req.request.method).toBe('GET');
    req.flush({ items: [], skip: 0, take: 20 });
  });
});

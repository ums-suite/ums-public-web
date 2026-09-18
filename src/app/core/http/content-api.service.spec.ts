import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../config/app-config';
import { ContentApiService } from './content-api.service';

describe('ContentApiService', () => {
  let service: ContentApiService;
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
    service = TestBed.inject(ContentApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists active banners as a bare array', () => {
    service.listBanners().subscribe();
    const req = httpMock.expectOne('http://localhost:8080/api/v1/content/banners');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 'b1' }]);
  });

  it('lists enabled homepage sections as a bare array', () => {
    service.listHomepageSections().subscribe();
    const req = httpMock.expectOne('http://localhost:8080/api/v1/content/homepage-sections');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 's1' }]);
  });

  it('lists notices with pagination params, never sending an audience override', () => {
    service.listNotices({ skip: 0, take: 5 }).subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === 'http://localhost:8080/api/v1/content/notices' &&
        r.params.get('skip') === '0' &&
        r.params.get('take') === '5',
    );
    expect(req.request.params.has('audience')).toBeFalse();
    req.flush({ items: [], totalCount: 0, skip: 0, take: 5 });
  });

  it('lists events with an optional date range', () => {
    service.listEvents({ skip: 0, take: 5, from: '2026-01-01' }).subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === 'http://localhost:8080/api/v1/content/events' &&
        r.params.get('from') === '2026-01-01',
    );
    expect(req.request.method).toBe('GET');
    req.flush({ items: [], totalCount: 0, skip: 0, take: 5 });
  });

  it('fetches a single notice by id', () => {
    service.getNotice('n1').subscribe();
    const req = httpMock.expectOne('http://localhost:8080/api/v1/content/notices/n1');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'n1' });
  });

  it('surfaces the bare 410 an Archived notice returns, preserving the status code', async () => {
    let caught: unknown;
    service.getNotice('n1').subscribe({ error: (error: unknown) => (caught = error) });

    const req = httpMock.expectOne('http://localhost:8080/api/v1/content/notices/n1');
    req.flush('Gone', { status: 410, statusText: 'Gone' });

    expect((caught as { status: number }).status).toBe(410);
  });

  it('fetches a single event by id', () => {
    service.getEvent('e1').subscribe();
    const req = httpMock.expectOne('http://localhost:8080/api/v1/content/events/e1');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'e1' });
  });

  it('lists downloads with an optional category facet', () => {
    service.listDownloads({ category: 'Forms', skip: 0, take: 20 }).subscribe();
    const req = httpMock.expectOne(
      (r) =>
        r.url === 'http://localhost:8080/api/v1/content/downloads' &&
        r.params.get('category') === 'Forms' &&
        r.params.get('skip') === '0' &&
        r.params.get('take') === '20',
    );
    expect(req.request.method).toBe('GET');
    req.flush({ items: [], totalCount: 0, skip: 0, take: 20 });
  });

  it('lists downloads with no category param sent when omitted', () => {
    service.listDownloads({ skip: 0, take: 20 }).subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === 'http://localhost:8080/api/v1/content/downloads',
    );
    expect(req.request.params.has('category')).toBeFalse();
    req.flush({ items: [], totalCount: 0, skip: 0, take: 20 });
  });
});

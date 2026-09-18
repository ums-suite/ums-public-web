import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { REQUEST } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { clearLocaleCookieForTest } from '../i18n/locale-test-cleanup.util';
import { LocaleService } from '../i18n/locale.service';
import { localeApiInterceptor } from './locale-api.interceptor';

describe('localeApiInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: REQUEST, useValue: null },
        provideHttpClient(withInterceptors([localeApiInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    clearLocaleCookieForTest();
  });

  it('adds ?lang= and Accept-Language for the current locale', () => {
    TestBed.inject(LocaleService).setLocale('bn');

    httpClient.get('/api/v1/organization/programs').subscribe();

    const req = httpMock.expectOne((r) => r.url === '/api/v1/organization/programs');
    expect(req.request.params.get('lang')).toBe('bn');
    expect(req.request.headers.get('Accept-Language')).toBe('bn');
    req.flush({});
  });

  it('leaves an explicit lang param untouched', () => {
    httpClient.get('/api/v1/organization/programs', { params: { lang: 'en' } }).subscribe();

    const req = httpMock.expectOne((r) => r.url === '/api/v1/organization/programs');
    expect(req.request.params.get('lang')).toBe('en');
    req.flush({});
  });
});

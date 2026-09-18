import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';
import { NotificationsApiService } from './notifications-api.service';

describe('NotificationsApiService', () => {
  let service: NotificationsApiService;
  let httpMock: HttpTestingController;

  const request = { name: 'Ada', email: 'ada@example.edu', subject: 'Hi', message: 'Hello there' };

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
    service = TestBed.inject(NotificationsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('sends the idempotency key as a request header and resolves accepted on success', async () => {
    const promise = firstValueFrom(service.submitInquiry(request, 'key-1'));

    const req = httpMock.expectOne('http://localhost:8080/api/v1/notifications/public/inquiries');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Idempotency-Key')).toBe('key-1');
    req.flush(null);

    await expectAsync(promise).toBeResolvedTo({ kind: 'accepted' });
  });

  it('degrades to unavailable -- never throws -- when the interim endpoint does not exist yet (404)', async () => {
    const promise = firstValueFrom(service.submitInquiry(request, 'key-1'));

    const req = httpMock.expectOne('http://localhost:8080/api/v1/notifications/public/inquiries');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });

    await expectAsync(promise).toBeResolvedTo({ kind: 'unavailable' });
  });

  it('degrades to unavailable on a network-level failure', async () => {
    const promise = firstValueFrom(service.submitInquiry(request, 'key-1'));

    const req = httpMock.expectOne('http://localhost:8080/api/v1/notifications/public/inquiries');
    req.error(new ProgressEvent('error'));

    await expectAsync(promise).toBeResolvedTo({ kind: 'unavailable' });
  });

  it('reports rateLimited with a parsed Retry-After header', async () => {
    const promise = firstValueFrom(service.submitInquiry(request, 'key-1'));

    const req = httpMock.expectOne('http://localhost:8080/api/v1/notifications/public/inquiries');
    req.flush('Too Many Requests', {
      status: 429,
      statusText: 'Too Many Requests',
      headers: { 'Retry-After': '30' },
    });

    await expectAsync(promise).toBeResolvedTo({ kind: 'rateLimited', retryAfterSeconds: 30 });
  });

  it('reports rateLimited with a null retryAfterSeconds when no header is present', async () => {
    const promise = firstValueFrom(service.submitInquiry(request, 'key-1'));

    const req = httpMock.expectOne('http://localhost:8080/api/v1/notifications/public/inquiries');
    req.flush('Too Many Requests', { status: 429, statusText: 'Too Many Requests' });

    await expectAsync(promise).toBeResolvedTo({ kind: 'rateLimited', retryAfterSeconds: null });
  });

  it('reports captchaRequired for the documented captcha error code', async () => {
    const promise = firstValueFrom(service.submitInquiry(request, 'key-1'));

    const req = httpMock.expectOne('http://localhost:8080/api/v1/notifications/public/inquiries');
    req.flush(
      { code: 'notification.captcha_required', title: 'Captcha required' },
      { status: 400, statusText: 'Bad Request' },
    );

    await expectAsync(promise).toBeResolvedTo({ kind: 'captchaRequired' });
  });

  it('reports invalid with the server message for an ordinary validation failure', async () => {
    const promise = firstValueFrom(service.submitInquiry(request, 'key-1'));

    const req = httpMock.expectOne('http://localhost:8080/api/v1/notifications/public/inquiries');
    req.flush(
      { code: 'inquiry.invalid', title: 'Email is invalid' },
      { status: 400, statusText: 'Bad Request' },
    );

    await expectAsync(promise).toBeResolvedTo({ kind: 'invalid', message: 'Email is invalid' });
  });
});

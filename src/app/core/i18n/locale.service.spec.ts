import { DOCUMENT } from '@angular/common';
import { REQUEST } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LOCALE_COOKIE_NAME } from './locale-cookie.util';
import { clearLocaleCookieForTest } from './locale-test-cleanup.util';
import { LocaleService } from './locale.service';

/**
 * A real browser `Request`/`Headers` refuses to ever carry a `Cookie` header at all (it's on the
 * Fetch spec's "forbidden header name" list, stripped silently even from `new Request(url,
 * {headers})`) -- so exercising {@link LocaleService}'s server-render branch needs a minimal fake
 * shaped like the one property it actually reads, not a real `Request` instance. In real SSR,
 * `@angular/ssr` hands the app the genuine incoming `Request` from Node's HTTP layer, which is
 * never subject to this same-origin browser restriction.
 */
function fakeServerRequest(cookieHeader: string): Request {
  return {
    headers: { get: (name: string) => (name.toLowerCase() === 'cookie' ? cookieHeader : null) },
  } as unknown as Request;
}

describe('LocaleService', () => {
  afterEach(() => {
    clearLocaleCookieForTest();
  });

  it('defaults to English when neither a request cookie header nor a document cookie is present', () => {
    clearLocaleCookieForTest();
    TestBed.configureTestingModule({ providers: [{ provide: REQUEST, useValue: null }] });

    const service = TestBed.inject(LocaleService);

    expect(service.locale()).toBe('en');
  });

  it('resolves the initial locale from the REQUEST cookie header when rendering on the server', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: REQUEST, useValue: fakeServerRequest(`${LOCALE_COOKIE_NAME}=bn`) }],
    });

    const service = TestBed.inject(LocaleService);

    expect(service.locale()).toBe('bn');
  });

  it('ignores an unsupported locale value and falls back to English', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: REQUEST, useValue: fakeServerRequest(`${LOCALE_COOKIE_NAME}=fr`) }],
    });

    const service = TestBed.inject(LocaleService);

    expect(service.locale()).toBe('en');
  });

  it('resolves the initial locale from document.cookie when no REQUEST is present (client render)', () => {
    document.cookie = `${LOCALE_COOKIE_NAME}=bn; path=/`;
    TestBed.configureTestingModule({ providers: [{ provide: REQUEST, useValue: null }] });

    const service = TestBed.inject(LocaleService);

    expect(service.locale()).toBe('bn');
  });

  it('setLocale updates the signal and persists a cookie for the next SSR request to read', () => {
    TestBed.configureTestingModule({ providers: [{ provide: REQUEST, useValue: null }] });
    const service = TestBed.inject(LocaleService);
    const doc = TestBed.inject(DOCUMENT);

    service.setLocale('bn');

    expect(service.locale()).toBe('bn');
    expect(doc.cookie).toContain(`${LOCALE_COOKIE_NAME}=bn`);
  });
});

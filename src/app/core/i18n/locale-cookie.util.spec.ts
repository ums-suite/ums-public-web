import { buildLocaleCookie, LOCALE_COOKIE_NAME, readCookieValue } from './locale-cookie.util';

describe('locale-cookie.util', () => {
  describe('readCookieValue', () => {
    it('returns null for a null/undefined header', () => {
      expect(readCookieValue(null, LOCALE_COOKIE_NAME)).toBeNull();
      expect(readCookieValue(undefined, LOCALE_COOKIE_NAME)).toBeNull();
    });

    it('extracts the named cookie from a multi-cookie header', () => {
      const header = `theme=dark; ${LOCALE_COOKIE_NAME}=bn; other=1`;
      expect(readCookieValue(header, LOCALE_COOKIE_NAME)).toBe('bn');
    });

    it('returns null when the cookie is absent', () => {
      expect(readCookieValue('theme=dark', LOCALE_COOKIE_NAME)).toBeNull();
    });

    it('decodes a URI-encoded value', () => {
      const header = `${LOCALE_COOKIE_NAME}=${encodeURIComponent('bn')}`;
      expect(readCookieValue(header, LOCALE_COOKIE_NAME)).toBe('bn');
    });
  });

  describe('buildLocaleCookie', () => {
    it('produces a Path=/, SameSite=Lax cookie string carrying the given value', () => {
      const cookie = buildLocaleCookie('bn');
      expect(cookie).toContain(`${LOCALE_COOKIE_NAME}=bn`);
      expect(cookie).toContain('path=/');
      expect(cookie).toContain('SameSite=Lax');
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { TokenStorageService } from '@ums/shared';
import { HeaderSessionService } from './header-session.service';

describe('HeaderSessionService', () => {
  afterEach(() => localStorage.clear());

  it('reports not authenticated and no role when no session exists', () => {
    const service = TestBed.inject(HeaderSessionService);

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.primaryRole()).toBeNull();
  });

  it('reports authenticated and the first role once a session token is present', () => {
    // A JWT whose payload is {"sub":"u1","roles":["Student"]} -- CurrentUserService decodes claims
    // straight off the stored access token (no network call), matching Domain Invariant #1's
    // "identity/role metadata only" boundary this service exists to preserve.
    const payload = { sub: 'u1', roles: ['Student'] };
    const encodedPayload = btoa(JSON.stringify(payload));
    const accessToken = `header.${encodedPayload}.signature`;

    TestBed.inject(TokenStorageService).setTokens({
      accessToken,
      accessTokenExpiresAt: '2099-01-01T00:00:00Z',
      refreshToken: 'refresh',
      refreshTokenExpiresAt: '2099-01-08T00:00:00Z',
      sessionId: 'session-1',
    });

    const service = TestBed.inject(HeaderSessionService);

    expect(service.isAuthenticated()).toBeTrue();
    expect(service.primaryRole()).toBe('Student');
  });
});

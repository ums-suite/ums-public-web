import { REQUEST } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { TokenStorageService } from '@ums/shared';
import { clearLocaleCookieForTest } from '../../../core/i18n/locale-test-cleanup.util';
import { ContentApiService } from '../../../core/http/content-api.service';
import { OrganizationApiService } from '../../../core/http/organization-api.service';
import { SiteHeaderComponent } from './site-header.component';

describe('SiteHeaderComponent', () => {
  let fixture: ComponentFixture<SiteHeaderComponent>;

  beforeEach(() => {
    localStorage.clear();
    const organizationApiSpy = jasmine.createSpyObj<OrganizationApiService>(
      'OrganizationApiService',
      ['listPrograms'],
    );
    organizationApiSpy.listPrograms.and.returnValue(
      of({ items: [], totalCount: 0, skip: 0, take: 200 }),
    );
    const contentApiSpy = jasmine.createSpyObj<ContentApiService>('ContentApiService', [
      'listNotices',
      'listEvents',
    ]);
    contentApiSpy.listNotices.and.returnValue(of({ items: [], totalCount: 0, skip: 0, take: 200 }));
    contentApiSpy.listEvents.and.returnValue(of({ items: [], totalCount: 0, skip: 0, take: 200 }));

    TestBed.configureTestingModule({
      imports: [SiteHeaderComponent],
      providers: [
        provideRouter([]),
        { provide: REQUEST, useValue: null },
        { provide: OrganizationApiService, useValue: organizationApiSpy },
        { provide: ContentApiService, useValue: contentApiSpy },
      ],
    });
    fixture = TestBed.createComponent(SiteHeaderComponent);
  });

  afterEach(() => {
    localStorage.clear();
    clearLocaleCookieForTest();
  });

  it('shows no account chip at all for an anonymous visitor', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.pweb-site-header__account')).toBeNull();
  });

  it('shows a read-only "Signed in as {role}" chip for a visitor with an existing session (PWEB-6)', () => {
    const payload = { sub: 'u1', roles: ['Student'] };
    const accessToken = `h.${btoa(JSON.stringify(payload))}.s`;
    TestBed.inject(TokenStorageService).setTokens({
      accessToken,
      accessTokenExpiresAt: '2099-01-01T00:00:00Z',
      refreshToken: 'r',
      refreshTokenExpiresAt: '2099-01-08T00:00:00Z',
      sessionId: 'session-1',
    });

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.pweb-site-header__account').textContent).toContain(
      'Student',
    );
  });

  it('toggles the locale between English and Bengali on click', () => {
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelectorAll(
      '.pweb-site-header__control',
    )[0] as HTMLButtonElement;

    button.click();
    fixture.detectChanges();

    expect(fixture.componentInstance['locale'].locale()).toBe('bn');
  });

  it('opens the search overlay when the search button is clicked, and closes it on (closed)', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('pweb-search-overlay')).toBeNull();

    (
      fixture.nativeElement.querySelector('.pweb-site-header__search-button') as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('pweb-search-overlay')).not.toBeNull();

    fixture.componentInstance['closeSearch']();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('pweb-search-overlay')).toBeNull();
  });

  it('toggles the resolved theme between light and dark on click', () => {
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('.pweb-site-header__control');
    const themeButton = buttons[1] as HTMLButtonElement;
    const before = fixture.componentInstance['theme'].resolvedTheme();

    themeButton.click();
    fixture.detectChanges();

    expect(fixture.componentInstance['theme'].resolvedTheme()).not.toBe(before);
  });
});

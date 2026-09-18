import { REQUEST } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ThemeService } from '@ums/design-system';
import { App } from './app';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), { provide: REQUEST, useValue: null }],
    });
  });

  afterEach(() => localStorage.clear());

  it('creates the app and renders the header/footer shell', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('pweb-site-header')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('pweb-site-footer')).not.toBeNull();
  });

  it('coerces the design system\'s default "system" theme mode to "light" (requirement-spec.md §7)', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(TestBed.inject(ThemeService).mode()).toBe('light');
  });
});

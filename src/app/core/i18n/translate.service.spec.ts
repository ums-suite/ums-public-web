import { REQUEST } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { clearLocaleCookieForTest } from './locale-test-cleanup.util';
import { LocaleService } from './locale.service';
import { TranslateService } from './translate.service';

describe('TranslateService', () => {
  let service: TranslateService;
  let locale: LocaleService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: REQUEST, useValue: null }] });
    service = TestBed.inject(TranslateService);
    locale = TestBed.inject(LocaleService);
  });

  afterEach(() => clearLocaleCookieForTest());

  it('translates a key in the active English locale', () => {
    expect(service.translate('home.viewAll')).toBe('View all');
  });

  it('re-resolves against the new locale once it changes', () => {
    locale.setLocale('bn');
    expect(service.translate('home.viewAll')).toBe('সব দেখুন');
  });

  it('falls back to English when the Bengali dictionary is missing a key (ADR-0011)', () => {
    locale.setLocale('bn');
    expect(service.translate('cta.checking')).toBe('Checking admission status…');
  });

  it('falls back to the raw key when neither dictionary has it', () => {
    expect(service.translate('does.not.exist')).toBe('does.not.exist');
  });

  it('interpolates named parameters', () => {
    expect(service.translate('cta.admissionOpensOn', { date: '12 Dec' })).toBe(
      'Admission opens 12 Dec',
    );
  });
});

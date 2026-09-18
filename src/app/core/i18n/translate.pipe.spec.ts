import { REQUEST } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslatePipe } from './translate.pipe';

describe('TranslatePipe', () => {
  let pipe: TranslatePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: REQUEST, useValue: null }] });
    pipe = TestBed.runInInjectionContext(() => new TranslatePipe());
  });

  it('transforms a key to its translated string', () => {
    expect(pipe.transform('home.viewAll')).toBe('View all');
  });

  it('passes interpolation params through', () => {
    expect(pipe.transform('cta.admissionOpensOn', { date: '1 Jan' })).toBe('Admission opens 1 Jan');
  });
});

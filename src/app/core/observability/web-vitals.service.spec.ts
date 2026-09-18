import { TestBed } from '@angular/core/testing';
import { accumulateClsValue } from './web-vitals.types';
import { WebVitalsService } from './web-vitals.service';

describe('accumulateClsValue', () => {
  it('adds a shift value when input was not recent', () => {
    expect(accumulateClsValue(0.1, { value: 0.05, hadRecentInput: false })).toBeCloseTo(0.15);
  });

  it('ignores a shift caused by recent user input', () => {
    expect(accumulateClsValue(0.1, { value: 0.05, hadRecentInput: true })).toBe(0.1);
  });
});

describe('WebVitalsService', () => {
  it('init() does not throw in the Karma/browser test environment', () => {
    const service = TestBed.inject(WebVitalsService);
    expect(() => service.init(() => undefined)).not.toThrow();
  });
});

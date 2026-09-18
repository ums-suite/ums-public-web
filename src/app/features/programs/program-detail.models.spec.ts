import { isProgramCurrentlyVisible } from './program-detail.models';

describe('isProgramCurrentlyVisible', () => {
  it('is visible only when status is exactly "Active"', () => {
    expect(isProgramCurrentlyVisible('Active')).toBeTrue();
  });

  it('is not visible for Draft/Archived/any other status', () => {
    expect(isProgramCurrentlyVisible('Draft')).toBeFalse();
    expect(isProgramCurrentlyVisible('Archived')).toBeFalse();
    expect(isProgramCurrentlyVisible('Inactive')).toBeFalse();
  });
});

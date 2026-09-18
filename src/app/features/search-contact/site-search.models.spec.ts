import { EMPTY_SEARCH_RESULTS, hasAnySearchResults, matchesQuery } from './site-search.models';

describe('matchesQuery', () => {
  it('matches case-insensitively', () => {
    expect(matchesQuery('Program Catalog', 'catalog')).toBeTrue();
    expect(matchesQuery('Program Catalog', 'CATALOG')).toBeTrue();
  });

  it('does not match an unrelated substring', () => {
    expect(matchesQuery('Program Catalog', 'faculty')).toBeFalse();
  });
});

describe('hasAnySearchResults', () => {
  it('is false for completely empty results', () => {
    expect(hasAnySearchResults(EMPTY_SEARCH_RESULTS)).toBeFalse();
  });

  it('is true when any single group has an item', () => {
    expect(
      hasAnySearchResults({ ...EMPTY_SEARCH_RESULTS, pages: [{ path: '/x', title: 'X' }] }),
    ).toBeTrue();
  });
});

export interface ProgramSearchResult {
  readonly id: string;
  readonly title: string;
}

export interface NoticeSearchResult {
  readonly id: string;
  readonly title: string;
}

export interface EventSearchResult {
  readonly id: string;
  readonly title: string;
  readonly startAt: string;
}

export interface PageSearchResult {
  readonly path: string;
  readonly title: string;
}

/**
 * PWEB-24: typed result groupings (requirement-spec.md §3.7/§7). **Faculty is deliberately absent
 * from this type** -- PWEB-15/16's research confirmed `Faculty` has no public directory/search
 * endpoint at all, so there is no real data source to search against; per this batch's brief
 * ("omit whichever groups have no real backing data source"), rendering an always-empty Faculty
 * group would misrepresent an absent capability as a genuinely-searched-but-empty one.
 */
export interface SiteSearchResults {
  readonly programs: readonly ProgramSearchResult[];
  readonly notices: readonly NoticeSearchResult[];
  readonly events: readonly EventSearchResult[];
  readonly pages: readonly PageSearchResult[];
}

export const EMPTY_SEARCH_RESULTS: SiteSearchResults = {
  programs: [],
  notices: [],
  events: [],
  pages: [],
};

export function hasAnySearchResults(results: SiteSearchResults): boolean {
  return (
    results.programs.length > 0 ||
    results.notices.length > 0 ||
    results.events.length > 0 ||
    results.pages.length > 0
  );
}

/**
 * This app's own static-ish routes (PWEB-19/20/21/22/23/25) -- a legitimate "Pages" search group
 * per requirement-spec.md §7's typed groupings, distinct from `Content`/`Organization` data.
 * English-only titles are a known, minor limitation (not a domain-invariant violation): unlike
 * `Content`/`Organization` data, this app has no server-side translation source for its own static
 * chrome copy to search against in Bengali -- flagged as a small follow-up, not a blocking gap.
 */
export const STATIC_SEARCH_PAGES: readonly PageSearchResult[] = [
  { path: '/programs', title: 'Program catalog' },
  { path: '/faculty', title: 'Faculty directory' },
  { path: '/notices', title: 'Notices' },
  { path: '/events', title: 'Events' },
  { path: '/academic-calendar', title: 'Academic calendar' },
  { path: '/research', title: 'Research & publications' },
  { path: '/campus-information', title: 'Campus information' },
  { path: '/downloads', title: 'Downloads' },
  { path: '/news', title: 'News & media' },
  { path: '/contact', title: 'Contact us' },
];

/** Case-insensitive substring match -- the same "instant client-side re-filter" spirit as `ProgramCatalogStore`. */
export function matchesQuery(haystack: string, query: string): boolean {
  return haystack.toLowerCase().includes(query.toLowerCase());
}

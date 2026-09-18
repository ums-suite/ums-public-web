/**
 * PWEB-14 sitemap generation. Deliberately a plain function (no Angular DI) so it's callable
 * directly from `server.ts`'s Express route with a plain `fetch`, and unit-testable without
 * booting Angular's TestBed.
 *
 * Paginates `Organization`'s `GET /api/v1/organization/programs` (confirmed anonymous, PWEB-4
 * research) up to a hard cap so one pathological data set can never make sitemap generation hang.
 */

interface OrganizationProgramSummary {
  readonly id: string;
  readonly status: string;
}

interface ProgramListPage {
  readonly items: readonly OrganizationProgramSummary[];
  readonly totalCount: number;
}

const DEFAULT_PAGE_SIZE = 100;
const MAX_PROGRAMS = 2000;

function xmlEscape(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function urlEntry(loc: string, changefreq: string): string {
  return `<url><loc>${xmlEscape(loc)}</loc><changefreq>${changefreq}</changefreq></url>`;
}

async function fetchAllActiveProgramIds(apiBaseUrl: string, pageSize: number): Promise<string[]> {
  const ids: string[] = [];
  let skip = 0;

  for (;;) {
    const response = await fetch(
      `${apiBaseUrl}/api/v1/organization/programs?skip=${skip}&take=${pageSize}`,
    );
    if (!response.ok) {
      break;
    }

    const page = (await response.json()) as ProgramListPage;
    for (const item of page.items) {
      if (item.status === 'Active' || item.status === 'active') {
        ids.push(item.id);
      }
    }

    skip += pageSize;
    if (page.items.length < pageSize || ids.length >= MAX_PROGRAMS || skip > page.totalCount) {
      break;
    }
  }

  return ids.slice(0, MAX_PROGRAMS);
}

/**
 * `pageSize` defaults to {@link DEFAULT_PAGE_SIZE} in production; tests pass a small value to
 * exercise multi-page pagination without fabricating a 100-item fixture.
 */
export async function buildSitemapXml(
  apiBaseUrl: string,
  siteOrigin: string,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<string> {
  const programIds = await fetchAllActiveProgramIds(apiBaseUrl, pageSize);

  const staticEntries = [
    urlEntry(`${siteOrigin}/`, 'daily'),
    urlEntry(`${siteOrigin}/programs`, 'daily'),
  ];
  const programEntries = programIds.map((id) => urlEntry(`${siteOrigin}/programs/${id}`, 'weekly'));

  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    [...staticEntries, ...programEntries].join('') +
    '</urlset>'
  );
}

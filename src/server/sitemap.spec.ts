import { buildSitemapXml } from './sitemap';

describe('buildSitemapXml', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('always includes the home and catalog root URLs', async () => {
    globalThis.fetch = jasmine
      .createSpy('fetch')
      .and.resolveTo(
        new Response(JSON.stringify({ items: [], totalCount: 0 }), { status: 200 }),
      ) as unknown as typeof fetch;

    const xml = await buildSitemapXml('http://localhost:8080', 'https://ums.example.edu');

    expect(xml).toContain('<loc>https://ums.example.edu/</loc>');
    expect(xml).toContain('<loc>https://ums.example.edu/programs</loc>');
  });

  it('includes only Active programs, paginating until a short page is returned', async () => {
    const firstPage = {
      items: [
        { id: 'p1', status: 'Active' },
        { id: 'p2', status: 'Draft' },
      ],
      totalCount: 3,
    };
    const secondPage = { items: [{ id: 'p3', status: 'Active' }], totalCount: 3 };

    let call = 0;
    globalThis.fetch = jasmine.createSpy('fetch').and.callFake(() => {
      call += 1;
      const body = call === 1 ? firstPage : secondPage;
      return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
    }) as unknown as typeof fetch;

    const xml = await buildSitemapXml('http://localhost:8080', 'https://ums.example.edu', 2);

    expect(xml).toContain('<loc>https://ums.example.edu/programs/p1</loc>');
    expect(xml).not.toContain('/programs/p2</loc>');
    expect(xml).toContain('<loc>https://ums.example.edu/programs/p3</loc>');
  });

  it('degrades to a URL set with only the static entries when the API call fails', async () => {
    globalThis.fetch = jasmine
      .createSpy('fetch')
      .and.resolveTo(new Response('', { status: 500 })) as unknown as typeof fetch;

    const xml = await buildSitemapXml('http://localhost:8080', 'https://ums.example.edu');

    expect(xml).toContain('<urlset');
    expect(xml).toContain('<loc>https://ums.example.edu/</loc>');
  });

  it('escapes XML-significant characters in generated locs', async () => {
    globalThis.fetch = jasmine.createSpy('fetch').and.resolveTo(
      new Response(JSON.stringify({ items: [{ id: 'a&b', status: 'Active' }], totalCount: 1 }), {
        status: 200,
      }),
    ) as unknown as typeof fetch;

    const xml = await buildSitemapXml('http://localhost:8080', 'https://ums.example.edu');

    expect(xml).toContain('a&amp;b');
    expect(xml).not.toContain('a&b<');
  });
});

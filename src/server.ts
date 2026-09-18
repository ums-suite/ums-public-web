import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { environment } from './environments/environment';
import { buildSitemapXml } from './server/sitemap';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * PWEB-14: `sitemap.xml` for the catalog/program routes -- generated per-request (not a static
 * asset) since the program list is live `Organization` data. Kept as a hand-rolled Express route
 * rather than an Angular server route because Angular's own `RenderMode.Server` machinery exists
 * to render the *application shell* for a browser, not to emit a bare XML content type.
 *
 * A fetch failure degrades to an empty-but-valid `<urlset>` (never a 500) -- a sitemap is a
 * discovery aid, not a page a real visitor depends on; failing softly here matches this app's
 * general degrade-gracefully posture (requirement-spec.md §3.3's directory-search fallback,
 * applied to the same spirit here).
 */
app.get('/sitemap.xml', (req, res) => {
  const origin = `${req.protocol}://${req.get('host')}`;
  buildSitemapXml(environment.apiBaseUrl, origin)
    .then((xml) => {
      res.type('application/xml').send(xml);
    })
    .catch(() => {
      res
        .type('application/xml')
        .send(
          '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
        );
    });
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 *
 * The build's `security.allowedHosts` (angular.json) is `["*"]` since no production hostname is
 * decided yet -- a real deployment should instead set the `NG_ALLOWED_HOSTS` env var (comma-
 * separated), which @angular/ssr reads ahead of this static list, to the actual public hostname(s).
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error?: Error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);

import { Routes } from '@angular/router';

/**
 * Root route table (PWEB-1/PWEB-5).
 *
 * Every route here is a full-page-cacheable anonymous route (requirement-spec.md §2 Caching row)
 * -- `data.cacheControl: 'editorial-page'` is read by {@link ResponseCacheService} to set a real
 * `Cache-Control` response header from the SSR server. A future CSR-shelled route (the contact
 * form, PWEB-25) would instead declare `data: { cacheControl: 'no-store' }`.
 */
export const routes: Routes = [
  {
    path: '',
    data: { cacheControl: 'editorial-page' },
    loadComponent: () =>
      import('./features/home/home-page.component').then((m) => m.HomePageComponent),
  },
  {
    path: 'programs',
    data: { cacheControl: 'editorial-page' },
    loadComponent: () =>
      import('./features/programs/program-catalog.component').then(
        (m) => m.ProgramCatalogComponent,
      ),
  },
  {
    path: 'programs/:programId',
    data: { cacheControl: 'editorial-page' },
    loadComponent: () =>
      import('./features/programs/program-detail.component').then((m) => m.ProgramDetailComponent),
  },
];

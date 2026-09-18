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
  {
    path: 'faculty',
    data: { cacheControl: 'editorial-page' },
    loadComponent: () =>
      import('./features/faculty/faculty-directory.component').then(
        (m) => m.FacultyDirectoryComponent,
      ),
  },
  {
    path: 'notices',
    data: { cacheControl: 'editorial-page' },
    loadComponent: () =>
      import('./features/notices-events/notice-list.component').then((m) => m.NoticeListComponent),
  },
  {
    path: 'notices/:noticeId',
    data: { cacheControl: 'editorial-page' },
    loadComponent: () =>
      import('./features/notices-events/notice-detail.component').then(
        (m) => m.NoticeDetailComponent,
      ),
  },
  {
    path: 'events',
    data: { cacheControl: 'editorial-page' },
    loadComponent: () =>
      import('./features/notices-events/event-list.component').then((m) => m.EventListComponent),
  },
  {
    path: 'events/:eventId',
    data: { cacheControl: 'editorial-page' },
    loadComponent: () =>
      import('./features/notices-events/event-detail.component').then(
        (m) => m.EventDetailComponent,
      ),
  },
  {
    path: 'academic-calendar',
    data: { cacheControl: 'editorial-page' },
    loadComponent: () =>
      import('./features/notices-events/academic-calendar.component').then(
        (m) => m.AcademicCalendarComponent,
      ),
  },
  // Research/Campus, Downloads/News, and Search/Contact routes are added incrementally as each
  // of PWEB-20..25 lands later in this same batch (see app.routes.ts's own git history) --
  // deliberately not stubbed out ahead of the component existing, so `ng build`'s module
  // resolution never points a lazy `import()` at a file that doesn't exist yet.
];

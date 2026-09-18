import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PublicApiBase } from './public-api.base';
import type {
  GrantListPage,
  PublicationListPage,
  RepositoryEntryListPage,
} from './research-api.models';

/**
 * `Research` module public showcase client (PWEB-20). Every route below is mapped under
 * `/api/v1/research/public/...` and confirmed `.AllowAnonymous()` with no permission check at all
 * (`PublicShowcaseEndpoints.cs`, `ResearchModule.cs`) -- a materially different, genuinely public
 * surface from `Faculty`'s own gated `FacultyMember` directory (see `research-api.models.ts`'s doc
 * comment for the full department-filter gap this implies).
 */
@Injectable({ providedIn: 'root' })
export class ResearchApiService extends PublicApiBase {
  listPublications(options: {
    readonly skip: number;
    readonly take: number;
  }): Observable<PublicationListPage> {
    return this.normalizeErrors(
      this.http.get<PublicationListPage>(this.apiUrl('research/public/publications'), {
        params: this.buildParams({ skip: options.skip, take: options.take }),
      }),
    );
  }

  listGrants(options: { readonly skip: number; readonly take: number }): Observable<GrantListPage> {
    return this.normalizeErrors(
      this.http.get<GrantListPage>(this.apiUrl('research/public/grants'), {
        params: this.buildParams({ skip: options.skip, take: options.take }),
      }),
    );
  }

  listRepositoryEntries(options: {
    readonly skip: number;
    readonly take: number;
  }): Observable<RepositoryEntryListPage> {
    return this.normalizeErrors(
      this.http.get<RepositoryEntryListPage>(this.apiUrl('research/public/repository-entries'), {
        params: this.buildParams({ skip: options.skip, take: options.take }),
      }),
    );
  }
}

import { Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { PublicApiBase } from './public-api.base';
import type { PublicCampaignWindowDto } from './admission-api.models';

/**
 * `Admission` public campaign-window client (PWEB-4/PWEB-11/PWEB-13).
 *
 * Calls the interim, **not-yet-built** `GET /api/v1/admission/campaigns/public` contract
 * documented in `admission-api.models.ts` -- see that file's doc comment for the full, source-
 * confirmed explanation of why no real anonymous endpoint exists yet. Every failure (today,
 * always -- the route doesn't exist server-side) resolves to `null` rather than throwing, so a
 * missing backend endpoint degrades to "no confirmed open campaign" (the Domain Invariant #4-safe
 * default: never show Apply Now when the state can't be confirmed) instead of a broken page.
 */
@Injectable({ providedIn: 'root' })
export class AdmissionApiService extends PublicApiBase {
  getPublicCampaignWindow(programId?: string): Observable<PublicCampaignWindowDto | null> {
    return this.http
      .get<PublicCampaignWindowDto>(this.apiUrl('admission/campaigns/public'), {
        params: this.buildParams({ programId }),
      })
      .pipe(catchError(() => of(null)));
  }
}

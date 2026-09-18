import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import type { ProgramDto } from '../../core/http/organization-api.models';

const JSON_LD_SCRIPT_ID = 'pweb-program-jsonld';

/**
 * PWEB-14: `EducationalOccupationalProgram` schema.org JSON-LD for a program detail page --
 * rendered into `<head>` during SSR so crawlers see it on first response, without ever fabricating
 * fields `Organization`'s real `ProgramDto` doesn't have (no `courseCode`, `timeToComplete`,
 * `occupationalCategory`, etc. -- confirmed absent, PWEB-4 research). Only `name` and `provider`
 * are populated; every other schema.org property is simply omitted (all optional per the spec),
 * which is preferable to inventing plausible-looking but false structured data.
 *
 * Re-runs idempotently (removes-then-reinserts by a stable element id) so navigating between two
 * program detail pages client-side never leaves a stale/duplicate `<script>` tag behind.
 */
@Injectable({ providedIn: 'root' })
export class ProgramSeoService {
  private readonly document = inject(DOCUMENT);
  private readonly titleService = inject(Title);

  apply(program: ProgramDto, canonicalUrl: string, providerName: string): void {
    const displayName = program.localizedName || program.name;
    this.titleService.setTitle(`${displayName} | UMS`);

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'EducationalOccupationalProgram',
      name: displayName,
      url: canonicalUrl,
      provider: { '@type': 'CollegeOrUniversity', name: providerName },
    };

    this.document.getElementById(JSON_LD_SCRIPT_ID)?.remove();
    const script = this.document.createElement('script');
    script.id = JSON_LD_SCRIPT_ID;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLd);
    this.document.head.appendChild(script);
  }

  clear(): void {
    this.document.getElementById(JSON_LD_SCRIPT_ID)?.remove();
  }
}

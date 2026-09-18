import type { UmsApiError } from '@ums/shared';

/**
 * design-decisions.md "SSR/Hydration Freshness Policy for Publish-Gated Content", applied to
 * Notice (the other named route besides Program detail, requirement-spec.md Domain Invariant #2):
 * a Notice is "currently visible" only while its real `status` field is `Published`. `Draft`/
 * `Scheduled` are pre-publish (never reachable anonymously anyway) and `Archived` is handled as
 * its own distinct state below, not through this boolean.
 */
export function isNoticeCurrentlyVisible(status: string): boolean {
  return status === 'Published';
}

/**
 * PWEB-17 edge case "Notice with an expired but still-linked attachment": `ums-core`'s own
 * `NoticeService.GetByIdAsync` returns a bare 410 Gone (no ProblemDetails body) for a real
 * Archived notice -- confirmed against source, `design-decisions.md`'s "Cache-Correctness
 * Backstop" on the backend's own side. This means the ORIGINAL content is deliberately not
 * retrievable once archived (a stronger backend posture than the client-tier spec's "detail page
 * must still resolve" literally implies) -- `notice-detail.component.ts` honors this honestly: the
 * route still resolves (never a broken/blank page), rendering a designed "Archived" state instead
 * of fabricating content the backend no longer serves.
 */
export type NoticeDetailState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'found'; readonly noLongerCurrent: boolean }
  | { readonly kind: 'archived' }
  | { readonly kind: 'notFound' };

/** Maps a failed `getNotice` call's {@link UmsApiError} to the right non-throwing detail state. */
export function noticeErrorToState(error: UmsApiError): NoticeDetailState {
  return error.status === 410 ? { kind: 'archived' } : { kind: 'notFound' };
}

/**
 * PWEB-17 "category filtering": `ums-core`'s real `NoticeDto` has NO `category` field at all
 * (confirmed against source, `content-api.models.ts`'s own doc comment) -- only a boolean
 * `isUrgent` flag. This client-side facet is the honest substitute: the one real, server-backed
 * distinction actually available, not a fabricated taxonomy.
 */
export type NoticeFacet = 'all' | 'urgent';

export function matchesNoticeFacet(isUrgent: boolean, facet: NoticeFacet): boolean {
  return facet === 'all' || isUrgent;
}

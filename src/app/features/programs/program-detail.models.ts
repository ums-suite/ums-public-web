/**
 * design-decisions.md "SSR/Hydration Freshness Policy for Publish-Gated Content", applied to
 * Program (the other named route besides Notice detail): a Program is "currently visible" only
 * while its real `status` field is `Active` -- any other value (Draft/Archived/Inactive/...)
 * means the freshness re-check should surface the "no longer available" state rather than
 * silently keep trusting the SSR-rendered snapshot for the rest of the page's lifetime.
 */
export function isProgramCurrentlyVisible(status: string): boolean {
  return status === 'Active';
}

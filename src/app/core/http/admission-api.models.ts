/**
 * `Admission` module campaign-window contract (PWEB-4/PWEB-11/PWEB-13).
 *
 * **CONFIRMED GAP, not a guess** (PWEB-4 research, read directly against `ums-core`'s
 * `CampaignEndpoints.cs`): there is currently **no anonymous-accessible endpoint anywhere in the
 * Admission module** that exposes campaign existence or window state. `GET /campaigns/{id}`
 * requires `.RequireLiveSession()`, and there is no `GET /campaigns` list route at all -- so
 * Domain Invariant #4's "Apply Now" CTA has no real data source to call today.
 *
 * This DTO shape is the documented, proposed interim contract this app is built against --
 * modeled on the campaign fields that DO exist on the real (session-gated) `CampaignDto`
 * (`programIds`, `applicationWindowStart`/`End`), reshaped as the minimal, applicant-safe public
 * projection a future `GET /api/v1/admission/campaigns/public?programId=` would need to return.
 * `AdmissionApiService.getPublicCampaignWindow` calls this exact interim path and degrades to
 * `null` on ANY failure (404 today, since the route doesn't exist) -- never a thrown error, never
 * a guessed/fabricated "open" state. This is flagged prominently in this app's PR as a blocking
 * cross-team backend gap; the client-side campaign-window computation logic below is fully built
 * and tested so wiring up the real endpoint later is a one-line swap, not a rewrite.
 */
export interface PublicCampaignWindowDto {
  readonly campaignId: string;
  readonly campaignName: string;
  readonly programId: string | null;
  /** ISO 8601 instant. The real (gated) `CampaignDto` only has a `DateOnly`; this contract asks for a full instant so "closes at 11:59pm" is unambiguous. */
  readonly opensAt: string;
  readonly closesAt: string;
}

export type CampaignWindowState =
  | { readonly kind: 'open'; readonly campaignName: string; readonly closesAt: string }
  | { readonly kind: 'upcoming'; readonly opensAt: string }
  | { readonly kind: 'closed' }
  /** No campaign data could be confirmed at all (endpoint missing/failed, or none configured). */
  | { readonly kind: 'unknown' };

/**
 * Domain Invariant #4: "Apply Now" is shown ONLY for a genuinely open campaign. `CampaignDto`
 * itself has no computed `IsOpen` field (confirmed against source) -- window state is always
 * client-computed from the two timestamps, exactly like the real (gated) endpoint would require
 * of any caller. `'unknown'` (missing/failed data) deliberately renders identically to `'closed'`
 * from the CTA's point of view -- the safe default when a campaign can't be confirmed open is to
 * never show Apply Now, never to assume open.
 */
export function computeCampaignWindowState(
  dto: PublicCampaignWindowDto | null,
  now: Date,
): CampaignWindowState {
  if (!dto) {
    return { kind: 'unknown' };
  }

  const opensAt = new Date(dto.opensAt);
  const closesAt = new Date(dto.closesAt);
  const nowMs = now.getTime();

  if (nowMs < opensAt.getTime()) {
    return { kind: 'upcoming', opensAt: dto.opensAt };
  }
  // >= (not >): Domain Invariant #4 treats the exact closing instant as already closed -- the
  // safe side of an off-by-one boundary for "never show Apply Now for a closed campaign".
  if (nowMs >= closesAt.getTime()) {
    return { kind: 'closed' };
  }
  return { kind: 'open', campaignName: dto.campaignName, closesAt: dto.closesAt };
}

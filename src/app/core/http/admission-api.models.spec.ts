import { computeCampaignWindowState, type PublicCampaignWindowDto } from './admission-api.models';

describe('computeCampaignWindowState', () => {
  const dto: PublicCampaignWindowDto = {
    campaignId: 'c1',
    campaignName: 'Fall 2026 Admission',
    programId: 'p1',
    opensAt: '2026-01-01T00:00:00Z',
    closesAt: '2026-02-01T00:00:00Z',
  };

  it('returns "unknown" when no campaign data is available at all', () => {
    expect(computeCampaignWindowState(null, new Date('2026-01-15T00:00:00Z'))).toEqual({
      kind: 'unknown',
    });
  });

  it('returns "upcoming" with the open date when now is before the window opens', () => {
    expect(computeCampaignWindowState(dto, new Date('2025-12-01T00:00:00Z'))).toEqual({
      kind: 'upcoming',
      opensAt: dto.opensAt,
    });
  });

  it('returns "open" with the campaign name/close date strictly inside the window', () => {
    expect(computeCampaignWindowState(dto, new Date('2026-01-15T00:00:00Z'))).toEqual({
      kind: 'open',
      campaignName: dto.campaignName,
      closesAt: dto.closesAt,
    });
  });

  it('returns "closed" once now is past the close instant -- never "open" past closing (Invariant #4)', () => {
    expect(computeCampaignWindowState(dto, new Date('2026-02-01T00:00:01Z'))).toEqual({
      kind: 'closed',
    });
  });

  it('treats the exact open instant as already open', () => {
    expect(computeCampaignWindowState(dto, new Date(dto.opensAt))).toEqual({
      kind: 'open',
      campaignName: dto.campaignName,
      closesAt: dto.closesAt,
    });
  });

  it('treats the exact close instant as already closed', () => {
    expect(computeCampaignWindowState(dto, new Date(dto.closesAt))).toEqual({ kind: 'closed' });
  });
});

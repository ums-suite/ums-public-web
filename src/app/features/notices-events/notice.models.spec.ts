import type { UmsApiError } from '@ums/shared';
import { isNoticeCurrentlyVisible, matchesNoticeFacet, noticeErrorToState } from './notice.models';

describe('isNoticeCurrentlyVisible', () => {
  it('is true only for Published', () => {
    expect(isNoticeCurrentlyVisible('Published')).toBeTrue();
    expect(isNoticeCurrentlyVisible('Draft')).toBeFalse();
    expect(isNoticeCurrentlyVisible('Scheduled')).toBeFalse();
    expect(isNoticeCurrentlyVisible('Archived')).toBeFalse();
  });
});

describe('noticeErrorToState (Cache-Correctness Backstop 410)', () => {
  it('maps a 410 to the archived state, never a bare not-found', () => {
    const error: UmsApiError = { status: 410, message: 'Gone' };
    expect(noticeErrorToState(error)).toEqual({ kind: 'archived' });
  });

  it('maps every other failure (404, network) to notFound', () => {
    expect(noticeErrorToState({ status: 404, message: 'Not Found' })).toEqual({ kind: 'notFound' });
    expect(noticeErrorToState({ status: 0, message: 'network' })).toEqual({ kind: 'notFound' });
  });
});

describe('matchesNoticeFacet', () => {
  it('the "all" facet matches every notice regardless of isUrgent', () => {
    expect(matchesNoticeFacet(true, 'all')).toBeTrue();
    expect(matchesNoticeFacet(false, 'all')).toBeTrue();
  });

  it('the "urgent" facet matches only isUrgent notices', () => {
    expect(matchesNoticeFacet(true, 'urgent')).toBeTrue();
    expect(matchesNoticeFacet(false, 'urgent')).toBeFalse();
  });
});

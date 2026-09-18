import {
  generateIdempotencyKey,
  markAttemptTerminal,
  resolveAttempt,
  type PersistedContactAttempt,
} from './contact-idempotency';

describe('generateIdempotencyKey', () => {
  it('returns a non-empty string', () => {
    const key = generateIdempotencyKey();
    expect(typeof key).toBe('string');
    expect(key.length).toBeGreaterThan(0);
  });

  it('returns a different key on every call', () => {
    const keys = new Set(Array.from({ length: 20 }, () => generateIdempotencyKey()));
    expect(keys.size).toBe(20);
  });

  it('uses crypto.randomUUID when available', () => {
    const fixedUuid = '22222222-2222-4222-8222-222222222222';
    spyOn(crypto, 'randomUUID').and.returnValue(fixedUuid);
    expect(generateIdempotencyKey()).toBe(fixedUuid);
  });

  it('falls back to a timestamp+random string when crypto.randomUUID is unavailable', () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(crypto, 'randomUUID');
    Object.defineProperty(crypto, 'randomUUID', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    try {
      expect(generateIdempotencyKey().startsWith('contact-idempotency-')).toBeTrue();
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(crypto, 'randomUUID', originalDescriptor);
      } else {
        delete (crypto as { randomUUID?: unknown }).randomUUID;
      }
    }
  });
});

describe('resolveAttempt', () => {
  it('mints a fresh key when nothing is stored (first-ever visit)', () => {
    const attempt = resolveAttempt(null);
    expect(attempt.status).toBe('pending');
    expect(attempt.key.length).toBeGreaterThan(0);
  });

  it('reuses a stored pending attempt verbatim -- the reload/network-retry case', () => {
    const stored: PersistedContactAttempt = { key: 'existing-key', status: 'pending' };
    expect(resolveAttempt(stored)).toEqual(stored);
  });

  it('mints a fresh key when the stored attempt already reached a terminal outcome', () => {
    const stored: PersistedContactAttempt = { key: 'old-key', status: 'terminal' };
    const attempt = resolveAttempt(stored);
    expect(attempt.status).toBe('pending');
    expect(attempt.key).not.toBe('old-key');
  });
});

describe('markAttemptTerminal', () => {
  it('flips status to terminal, keeping the same key', () => {
    const attempt: PersistedContactAttempt = { key: 'k1', status: 'pending' };
    expect(markAttemptTerminal(attempt)).toEqual({ key: 'k1', status: 'terminal' });
  });
});

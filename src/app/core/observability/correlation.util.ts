/**
 * Client-generated correlation id for an event that never goes through an `HttpInterceptor`
 * (an uncaught render error, a Core Web Vital measurement) -- `@ums/shared`'s own
 * `correlationIdInterceptor` generates one per outgoing HTTP request but doesn't expose that
 * generator publicly, so PWEB-8's non-HTTP observability events mint their own using the same
 * "reasonably-unique, not cryptographically load-bearing" bar.
 */
export function generateCorrelationId(): string {
  const globalCrypto = typeof crypto !== 'undefined' ? crypto : undefined;
  if (globalCrypto?.randomUUID) {
    return globalCrypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

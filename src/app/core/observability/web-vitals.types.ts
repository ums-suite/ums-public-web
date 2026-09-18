export interface WebVitalReport {
  readonly metric: 'LCP' | 'CLS' | 'INP';
  readonly value: number;
  readonly path: string;
  readonly correlationId: string;
}

/** Pluggable sink -- swap for a real telemetry endpoint once one exists; defaults to `console.info`. */
export type WebVitalReporter = (report: WebVitalReport) => void;

export const consoleWebVitalReporter: WebVitalReporter = (report) => {
  console.info('[web-vital]', report);
};

/** Accumulates Cumulative Layout Shift: sum every shift entry NOT caused by recent user input. */
export function accumulateClsValue(
  current: number,
  entry: { value: number; hadRecentInput: boolean },
): number {
  return entry.hadRecentInput ? current : current + entry.value;
}

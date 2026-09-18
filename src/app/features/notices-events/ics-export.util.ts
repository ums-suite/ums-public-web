/**
 * PWEB-18: real client-side iCalendar (RFC 5545) `.ics` generation for the Event detail page's
 * "add to calendar" export -- no backend endpoint needed for this (per this batch's brief), a pure,
 * DOM-free function so it is exhaustively unit-testable independent of the download mechanics.
 */
export interface IcsEventInput {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly location: string | null;
  /** ISO 8601 instant. */
  readonly startAt: string;
  /** ISO 8601 instant. */
  readonly endAt: string;
}

/** RFC 5545 §3.3.5: `TEXT` values escape backslash, semicolon, comma, and newline. */
function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\n|\r/g, '\\n');
}

/** RFC 5545 §3.3.5 `DATE-TIME` UTC form: `YYYYMMDDTHHMMSSZ`. */
function toIcsUtc(iso: string): string {
  return new Date(iso)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
}

/**
 * Every real calendar app (Google/Outlook/Apple) accepts a single-`VEVENT` `.ics` file as a valid
 * "add to calendar" import -- `VCALENDAR`/`VERSION`/`PRODID` wrap exactly one `VEVENT` with
 * `UID`/`DTSTAMP`/`DTSTART`/`DTEND`/`SUMMARY`/`LOCATION`/`DESCRIPTION`, per RFC 5545 §3.6.1's
 * required properties. Lines are joined with CRLF (`\r\n`) -- RFC 5545 §3.1 mandates it, and some
 * calendar clients reject a bare-`\n` file.
 */
export function buildIcsContent(event: IcsEventInput, now = new Date()): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//University Management Suite//Public Web//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${event.id}@ums-suite`,
    `DTSTAMP:${toIcsUtc(now.toISOString())}`,
    `DTSTART:${toIcsUtc(event.startAt)}`,
    `DTEND:${toIcsUtc(event.endAt)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
  ];

  if (event.location) {
    lines.push(`LOCATION:${escapeIcsText(event.location)}`);
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n');
}

/** A filesystem-safe `.ics` filename derived from the event title. */
export function buildIcsFilename(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${slug || 'event'}.ics`;
}

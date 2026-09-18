import { buildIcsContent, buildIcsFilename, type IcsEventInput } from './ics-export.util';

describe('buildIcsContent', () => {
  const event: IcsEventInput = {
    id: 'e1',
    title: 'Open Day',
    description: 'Campus tour and info sessions.',
    location: 'Main Auditorium',
    startAt: '2026-03-15T09:00:00.000Z',
    endAt: '2026-03-15T12:00:00.000Z',
  };
  const now = new Date('2026-02-01T00:00:00.000Z');

  it('wraps exactly one VEVENT in a VCALENDAR with the required RFC 5545 properties', () => {
    const ics = buildIcsContent(event, now);

    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('UID:e1@ums-suite');
    expect(ics).toContain('DTSTAMP:20260201T000000Z');
    expect(ics).toContain('DTSTART:20260315T090000Z');
    expect(ics).toContain('DTEND:20260315T120000Z');
    expect(ics).toContain('SUMMARY:Open Day');
    expect(ics).toContain('DESCRIPTION:Campus tour and info sessions.');
    expect(ics).toContain('LOCATION:Main Auditorium');
    expect(ics).toContain('END:VEVENT');
    expect(ics).toContain('END:VCALENDAR');
  });

  it('joins every line with CRLF, per RFC 5545 §3.1 -- never a bare LF', () => {
    const ics = buildIcsContent(event, now);
    expect(ics.split('\r\n').length).toBeGreaterThan(5);
    expect(ics.replace(/\r\n/g, '')).not.toContain('\n');
  });

  it('omits LOCATION entirely when the event has none, rather than an empty property', () => {
    const ics = buildIcsContent({ ...event, location: null }, now);
    expect(ics).not.toContain('LOCATION:');
  });

  it('escapes commas, semicolons, backslashes, and newlines in text fields', () => {
    const ics = buildIcsContent(
      {
        ...event,
        title: 'Info, Session; Q&A\\Details',
        description: 'Line one\nLine two',
      },
      now,
    );

    expect(ics).toContain('SUMMARY:Info\\, Session\\; Q&A\\\\Details');
    expect(ics).toContain('DESCRIPTION:Line one\\nLine two');
  });
});

describe('buildIcsFilename', () => {
  it('slugifies the title into a lowercase, hyphenated .ics filename', () => {
    expect(buildIcsFilename('Open Day 2026!')).toBe('open-day-2026.ics');
  });

  it('falls back to a generic filename when the title has no alphanumeric characters', () => {
    expect(buildIcsFilename('!!!')).toBe('event.ics');
  });
});

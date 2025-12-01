interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startDateTime: string; // ISO format
  endDateTime: string; // ISO format
  organizerName: string;
}

/**
 * Format date for iCalendar format (YYYYMMDDTHHMMSSZ)
 */
function formatICalDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Generate ICS (iCalendar) file content
 * Compatible with: Google Calendar, Apple Calendar, Outlook, Yahoo Calendar
 */
function generateICS(event: CalendarEvent): string {
  const startDate = formatICalDate(event.startDateTime);
  const endDate = formatICalDate(event.endDateTime);
  const timestamp = formatICalDate(new Date().toISOString());
  
  // Escape special characters for ICS format
  const escapeICS = (str: string) => {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Colorado Springs Community Service Hub//Event//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `DTSTAMP:${timestamp}`,
    `SUMMARY:${escapeICS(event.title)}`,
    `DESCRIPTION:${escapeICS(event.description)}\\n\\nOrganized by: ${escapeICS(event.organizerName)}`,
    `LOCATION:${escapeICS(event.location)}`,
    `STATUS:CONFIRMED`,
    `SEQUENCE:0`,
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Event tomorrow',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
}

/**
 * Download ICS file
 */
export function downloadICSFile(event: CalendarEvent): void {
  const icsContent = generateICS(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate Google Calendar URL
 */
export function getGoogleCalendarUrl(event: CalendarEvent): string {
  const start = new Date(event.startDateTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const end = new Date(event.endDateTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
    details: `${event.description}\n\nOrganized by: ${event.organizerName}`,
    location: event.location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Outlook.com Calendar URL
 */
export function getOutlookCalendarUrl(event: CalendarEvent): string {
  const start = new Date(event.startDateTime).toISOString();
  const end = new Date(event.endDateTime).toISOString();
  
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: start,
    enddt: end,
    body: `${event.description}\n\nOrganized by: ${event.organizerName}`,
    location: event.location,
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generate Yahoo Calendar URL
 */
export function getYahooCalendarUrl(event: CalendarEvent): string {
  const start = new Date(event.startDateTime);
  const end = new Date(event.endDateTime);
  
  const formatYahooDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0];
  };

  const params = new URLSearchParams({
    v: '60',
    title: event.title,
    st: formatYahooDate(start),
    et: formatYahooDate(end),
    desc: `${event.description}\n\nOrganized by: ${event.organizerName}`,
    in_loc: event.location,
  });

  return `https://calendar.yahoo.com/?${params.toString()}`;
}
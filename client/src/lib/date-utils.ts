/**
 * Centralized date parsing and formatting utility.
 * Resolves PostgreSQL UTC timestamps without timezone indicators (e.g. "2026-10-14 02:45:53")
 * so they are properly interpreted as UTC, correctly converting to Colombia local time (UTC-5)
 * instead of falsely advancing 5 hours into the next calendar day.
 */

export function parseAppDate(dateInput: string | Date | null | undefined): Date {
  if (!dateInput) return new Date(0);
  if (dateInput instanceof Date) return dateInput;

  const str = String(dateInput).trim();
  if (!str) return new Date(0);

  // Check if string already contains a timezone indicator (e.g., 'Z', '+00:00', '-05:00', '+00')
  const hasTimezone = /[Z+\-]\d{2}(:?\d{2})?$/.test(str) || str.endsWith('Z');
  if (hasTimezone) {
    return new Date(str);
  }

  // PostgreSQL 'timestamp without time zone' format: "YYYY-MM-DD HH:mm:ss.sss"
  // Replace space with 'T' and append 'Z' to treat as true UTC
  const isoUtcString = str.replace(' ', 'T') + 'Z';
  const parsed = new Date(isoUtcString);

  // Fallback if parsing failed
  return isNaN(parsed.getTime()) ? new Date(str) : parsed;
}

export function formatAppDate(
  dateInput: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = parseAppDate(dateInput);
  if (isNaN(date.getTime()) || date.getTime() === 0) return 'Fecha no disponible';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };

  return date.toLocaleDateString('es-CO', options || defaultOptions);
}

export function formatAppShortDate(dateInput: string | Date | null | undefined): string {
  const date = parseAppDate(dateInput);
  if (isNaN(date.getTime()) || date.getTime() === 0) return '';
  return date.toLocaleDateString('es-CO');
}

export function formatAppDateTime(dateInput: string | Date | null | undefined): string {
  const date = parseAppDate(dateInput);
  if (isNaN(date.getTime()) || date.getTime() === 0) return 'Fecha no disponible';

  return `${date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })} ${date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;
}

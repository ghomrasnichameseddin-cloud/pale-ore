/**
 * Canonical Date & Temporal Ledger Utilities
 * 
 * Central source of truth for date construction, parsing, and formatting.
 * Guaranteed immune to DST transitions, timezone drift, and midnight boundary bugs.
 */

/**
 * Parses a YYYY-MM-DD string, ISO string, or Date into a local noon Date (12:00:00).
 * Using noon eliminates DST jump hazards and midnight edge-case rollovers.
 */
export function parseDateSafe(dateInput?: string | Date | null): Date {
  if (!dateInput) {
    const fallback = new Date();
    return new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate(), 12, 0, 0);
  }
  if (dateInput instanceof Date) {
    return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate(), 12, 0, 0);
  }
  const dateStr = String(dateInput).split('T')[0];
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) {
    const fallback = new Date();
    return new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate(), 12, 0, 0);
  }
  return new Date(year, month - 1, day, 12, 0, 0);
}

/**
 * Formats a Date or date string to YYYY-MM-DD using local calendar year, month, and day.
 */
export const getLocalDateString = (d: Date | string = new Date()): string => {
  const dateObj = typeof d === 'string' ? parseDateSafe(d) : d;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Alias for getLocalDateString to maintain backwards compatibility.
 */
export const formatDateStr = getLocalDateString;

/**
 * Adds or subtracts days from a date string or Date, returning a YYYY-MM-DD string.
 */
export function addDays(dateInput: string | Date, days: number): string {
  const dt = parseDateSafe(dateInput);
  dt.setDate(dt.getDate() + days);
  return getLocalDateString(dt);
}

/**
 * Returns the calendar difference in whole days between two dates (toDate - fromDate).
 * Positive when toDate is after fromDate.
 */
export function getDaysDifference(fromDate: string | Date, toDate: string | Date): number {
  try {
    const d1 = parseDateSafe(fromDate);
    const d2 = parseDateSafe(toDate);
    const diffTime = d2.getTime() - d1.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

/**
 * Returns the weekday abbreviation or name for a date. Default is 3-letter abbreviation ('Sun', 'Mon', etc.).
 */
export function getWeekdayStr(dateInput: string | Date, format: 'short' | 'long' = 'short'): string {
  try {
    const date = parseDateSafe(dateInput);
    if (format === 'long') {
      const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return weekdays[date.getDay()];
    }
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return weekdays[date.getDay()];
  } catch {
    return '';
  }
}

/**
 * Formats current wall-clock time combined with simulated system date: YYYY-MM-DDTHH:mm:ss.
 */
export function getSystemTimestamp(systemDateStr?: string): string {
  const dateStr = systemDateStr ? getLocalDateString(systemDateStr) : getLocalDateString();
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0];
  return `${dateStr}T${timeStr}`;
}

/**
 * Checks if two date inputs represent the exact same calendar day.
 */
export function isSameDay(dateA: string | Date, dateB: string | Date): boolean {
  return getLocalDateString(dateA) === getLocalDateString(dateB);
}

/**
 * Returns the number of days in a given year and month (1-12).
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

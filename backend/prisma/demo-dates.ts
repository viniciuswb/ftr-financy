const DAY_MS = 86_400_000;

/**
 * Shifts ISO dates (YYYY-MM-DD) so the newest one lands on `today`'s UTC calendar date,
 * keeping the day distance between all dates. Output keeps the input order.
 */
export function shiftDemoDates(isoDates: string[], today: Date): string[] {
  const times = isoDates.map((iso) => Date.parse(`${iso}T00:00:00Z`));
  const newest = Math.max(...times);
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return times.map((time) => new Date(todayUtc - Math.round((newest - time) / DAY_MS) * DAY_MS).toISOString().slice(0, 10));
}

/** Calendar date (YYYY-MM-DD) of `instant` in the given IANA timezone. */
export function calendarDateIn(instant: Date, timeZone: string): string {
  // The en-CA locale formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(instant);
}

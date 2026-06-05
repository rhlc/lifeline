// Pure date helpers (no env, no clock) — safe to use from the domain layer.

/** 'YYYY-MM' month key from a 'YYYY-MM-DD' date string. */
export function monthOf(date: string): string {
  return date.slice(0, 7);
}

/** Add `n` calendar days to a 'YYYY-MM-DD' string (UTC-safe arithmetic). */
export function addDays(date: string, n: number): string {
  const d = new Date(date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Inclusive list of 'YYYY-MM-DD' from `start` to `end`. */
export function dateRange(start: string, end: string): string[] {
  const out: string[] = [];
  let cur = start;
  let guard = 0;
  while (cur <= end && guard < 100000) {
    out.push(cur);
    cur = addDays(cur, 1);
    guard++;
  }
  return out;
}

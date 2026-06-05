// Client date helpers for the contribution grid.

export function addDays(date: string, n: number): string {
  const d = new Date(date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Day of week 0=Sun..6=Sat for a YYYY-MM-DD. */
export function dow(date: string): number {
  return new Date(date + 'T00:00:00Z').getUTCDay();
}

/**
 * Build a GitHub-style matrix: an array of weeks (columns), each a 7-length
 * array (Sun..Sat) of 'YYYY-MM-DD' or null. Covers `weeks` columns ending on
 * the week containing `today`.
 */
export function buildGridMatrix(today: string, weeks = 22): (string | null)[][] {
  // Find the Sunday of today's week.
  const todaySunday = addDays(today, -dow(today));
  const start = addDays(todaySunday, -(weeks - 1) * 7);
  const cols: (string | null)[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col: (string | null)[] = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(start, w * 7 + d);
      col.push(date > today ? null : date);
    }
    cols.push(col);
  }
  return cols;
}

export function prettyDate(date: string): string {
  return new Date(date + 'T00:00:00Z').toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function monthKey(date: string): string {
  return date.slice(0, 7);
}

import { gridLevel, type MonthBand } from '@lifeline/shared';

/**
 * Cell appearance for a grid square given its day score %. Logged days use the
 * warm amber→clay ramp; unlogged days are a transparent square with a hairline
 * border, so the grid reads as a contribution graph (warm-mono re-skin).
 */
export function gridCellClass(scorePct: number, logged: boolean): string {
  if (!logged) return 'bg-transparent border border-line';
  const lvl = gridLevel(scorePct);
  const ramp = ['bg-grid-0', 'bg-grid-1', 'bg-grid-2', 'bg-grid-3', 'bg-grid-4'][lvl];
  return `${ramp} border border-ink/[0.06]`;
}

/** Inline color for the month ring stroke + band label. */
export function bandColor(band: MonthBand): string {
  return { warn: 'var(--warn)', ontrack: 'var(--good)', bonus: 'var(--bonus)' }[band];
}

/** lowercase band label with an ascii status glyph (no emoji). */
export function bandLabel(band: MonthBand): string {
  return { warn: '△ keep going', ontrack: '✓ on track', bonus: '★ bonus unlocked' }[band];
}

/** Map a month band to a Badge/ProgressBar tone. */
export function bandTone(band: MonthBand): 'warn' | 'good' | 'bonus' {
  return ({ warn: 'warn', ontrack: 'good', bonus: 'bonus' } as const)[band];
}

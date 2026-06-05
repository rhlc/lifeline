import { gridLevel, type MonthBand } from '@lifeline/shared';

/** Tailwind bg class for a grid cell given its day score %. */
export function gridCellClass(scorePct: number, logged: boolean): string {
  // Empty/unlogged days are a faint solid square — no border, so the grid
  // reads as a contribution graph rather than a sea of checkboxes.
  if (!logged) return 'bg-white/[0.04]';
  const lvl = gridLevel(scorePct);
  return ['bg-white/[0.04]', 'bg-grid-1', 'bg-grid-2', 'bg-grid-3', 'bg-grid-4'][lvl];
}

export function bandColor(band: MonthBand): string {
  return { warn: '#f5a524', ontrack: '#4fae6a', bonus: '#a855f7' }[band];
}

export function bandLabel(band: MonthBand): string {
  return { warn: '⚠️ Kuch gadbad hai', ontrack: '✅ On track', bonus: '🎉 Bonus unlocked!' }[band];
}

export function bandTextClass(band: MonthBand): string {
  return { warn: 'text-band-warn', ontrack: 'text-band-ontrack', bonus: 'text-band-bonus' }[band];
}

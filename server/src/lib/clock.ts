// Timezone-aware "today" — anchored to the owner's TZ so days roll at the
// correct local moment (spec: OWNER_TZ=Asia/Kolkata), not at UTC midnight.
import { env } from '../env.js';

/** 'YYYY-MM-DD' for the current instant in the owner timezone. */
export function todayInOwnerTz(now: Date = new Date()): string {
  // en-CA yields YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: env.OWNER_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

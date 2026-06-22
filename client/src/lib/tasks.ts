import type { Task } from '@lifeline/shared';
import { addDays, dow } from './dates.js';

const WEEKDAY_SHORT = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const WEEKDAY_LONG = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const MONTH_SHORT = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

export interface WeekDay {
  /** 'YYYY-MM-DD' */
  date: string;
  /** lowercase weekday, e.g. "mon". */
  label: string;
  /** date-of-month number. */
  dom: number;
  /** count of active (not done) tasks due that day. */
  count: number;
  today: boolean;
}

const monthIdx = (date: string) => Number(date.slice(5, 7)) - 1;
const domOf = (date: string) => Number(date.slice(8, 10));

/** Is a task "active" (counts toward load / "active today")? */
export const isActive = (t: Task) => t.status !== 'done';

/**
 * The current mon→sun week containing `today`, each day carrying the count of
 * active tasks due that day.
 */
export function currentWeek(today: string, tasks: Task[]): WeekDay[] {
  // shift so the week starts on monday (dow: 0=sun..6=sat)
  const back = (dow(today) + 6) % 7;
  const monday = addDays(today, -back);
  const dueCount = new Map<string, number>();
  for (const t of tasks) {
    if (t.due_date && isActive(t)) dueCount.set(t.due_date, (dueCount.get(t.due_date) ?? 0) + 1);
  }
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(monday, i);
    return {
      date,
      label: WEEKDAY_SHORT[dow(date)],
      dom: domOf(date),
      count: dueCount.get(date) ?? 0,
      today: date === today,
    };
  });
}

/** Long heading for a selected day, e.g. "wednesday · mar 12 · today". */
export function dayHeading(date: string, today: string): string {
  const base = `${WEEKDAY_LONG[dow(date)]} · ${MONTH_SHORT[monthIdx(date)]} ${domOf(date)}`;
  return date === today ? `${base} · today` : base;
}

/** Tasks due on a given day. */
export function tasksOnDay(tasks: Task[], date: string): Task[] {
  return tasks.filter((t) => t.due_date === date);
}

/** Humanized relative due label + overdue flag, from a due_date vs today. */
export function dueLabel(
  due: string | null,
  today: string,
  status: Task['status']
): { label: string; overdue: boolean } | null {
  if (!due) return null;
  const overdue = due < today && status !== 'done';
  if (due === today) return { label: 'today', overdue: false };
  if (due === addDays(today, 1)) return { label: 'tomorrow', overdue };
  // within the next 6 days → weekday name
  for (let i = 2; i <= 6; i++) {
    if (due === addDays(today, i)) return { label: WEEKDAY_SHORT[dow(due)], overdue };
  }
  return { label: `${MONTH_SHORT[monthIdx(due)]} ${domOf(due)}`, overdue };
}

/** Distinct project names (in first-seen order); excludes inbox (null). */
export function projectNames(tasks: Task[]): string[] {
  const seen: string[] = [];
  for (const t of tasks) {
    if (t.project && !seen.includes(t.project)) seen.push(t.project);
  }
  return seen;
}

/** Sort for display within a list: by priority (p0 first, none last), then id. */
export function byPriority(a: Task, b: Task): number {
  const pa = a.priority ?? 99;
  const pb = b.priority ?? 99;
  return pa - pb || a.id - b.id;
}

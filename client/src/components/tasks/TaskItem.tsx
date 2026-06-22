import type { CSSProperties } from 'react';
import type { Task, TaskStatus } from '@lifeline/shared';
import PriorityTag from './PriorityTag.js';

interface Props {
  task: Task;
  /** humanized due label + overdue flag (computed by the page). */
  due?: { label: string; overdue: boolean } | null;
  /** tap the box → advance status. omit for read-only (public). */
  onToggle?: () => void;
  /** open the edit panel. omit to hide the edit affordance. */
  onEdit?: () => void;
}

interface ChipStyle {
  bg: string;
  fg: string;
  bd: string;
}

const STATUS: Record<TaskStatus, { glyph: string; color: string; label: string; chip: ChipStyle }> = {
  todo: { glyph: '[ ]', color: 'var(--faint)', label: 'todo', chip: { bg: 'var(--card-2)', fg: 'var(--muted)', bd: 'var(--line-2)' } },
  doing: {
    glyph: '[/]',
    color: 'var(--clay)',
    label: 'doing',
    chip: { bg: 'var(--clay-tint)', fg: 'var(--clay-deep)', bd: 'color-mix(in srgb, var(--clay) 35%, transparent)' },
  },
  done: { glyph: '[x]', color: 'var(--good)', label: 'done', chip: { bg: 'var(--good-soft)', fg: 'var(--good)', bd: 'color-mix(in srgb, var(--good) 40%, transparent)' } },
  blocked: {
    glyph: '[!]',
    color: 'var(--warn)',
    label: 'blocked',
    chip: { bg: 'var(--warn-soft)', fg: 'color-mix(in srgb, var(--warn) 80%, var(--ink))', bd: 'color-mix(in srgb, var(--warn) 45%, transparent)' },
  },
};

function Chip({ glyph, children, c }: { glyph?: string; children: React.ReactNode; c: ChipStyle }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 7px',
        background: c.bg,
        color: c.fg,
        border: `1px solid ${c.bd}`,
        borderRadius: 'var(--r-sm)',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--fs-xs)',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
      }}
    >
      {glyph && <span aria-hidden="true" style={{ fontWeight: 700 }}>{glyph}</span>}
      {children}
    </span>
  );
}

/**
 * TaskItem — one checklist row: ascii status box ([ ] [/] [x] [!]) + title +
 * a wrapping meta line (priority · status · block ▦ · estimate · due). tap the
 * box to advance status; an optional trailing edit (⋯) opens the editor.
 */
export default function TaskItem({ task, due, onToggle, onEdit }: Props) {
  const s = STATUS[task.status] ?? STATUS.todo;
  const isDone = task.status === 'done';

  return (
    <div className="group flex items-start gap-2.5 border-b border-line py-2.5">
      <button
        type="button"
        onClick={onToggle}
        disabled={!onToggle}
        aria-label={`status: ${s.label} — tap to advance`}
        className={onToggle ? 'press focus-clay' : ''}
        style={{
          flex: 'none',
          minWidth: 30,
          minHeight: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          cursor: onToggle ? 'pointer' : 'default',
          padding: 0,
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-h3)',
          fontWeight: 700,
          color: s.color,
          letterSpacing: '-1px',
          lineHeight: 1,
        }}
      >
        {s.glyph}
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-body)',
            lineHeight: 1.35,
            color: isDone ? 'var(--muted)' : 'var(--ink)',
            textDecoration: isDone ? 'line-through' : 'none',
            textDecorationColor: 'var(--faint)',
          } as CSSProperties}
        >
          {task.title}
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {task.priority !== null && <PriorityTag level={task.priority} />}
          <Chip glyph="●" c={s.chip}>
            {s.label}
          </Chip>
          {task.block && (
            <Chip glyph="▦" c={{ bg: 'var(--clay-tint)', fg: 'var(--clay-deep)', bd: 'color-mix(in srgb, var(--clay) 30%, transparent)' }}>
              {task.block}
            </Chip>
          )}
          {task.estimate && <Chip c={{ bg: 'var(--card-2)', fg: 'var(--ink-2)', bd: 'var(--line-2)' }}>{task.estimate}</Chip>}
          {due && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-xs)',
                color: due.overdue ? 'var(--warn)' : 'var(--muted)',
                whiteSpace: 'nowrap',
                fontWeight: due.overdue ? 700 : 400,
              }}
            >
              {due.overdue ? '△ ' : '→ '}
              {due.label}
            </span>
          )}
        </div>
      </div>

      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          aria-label="edit task"
          title="edit"
          className="press focus-clay flex-none rounded-md px-1.5 text-muted hover:bg-card-2 hover:text-ink"
          style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, lineHeight: 1, alignSelf: 'center' }}
        >
          ⋯
        </button>
      )}
    </div>
  );
}

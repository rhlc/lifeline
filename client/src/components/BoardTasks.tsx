import { Link } from 'react-router-dom';
import type { AnyBoard, Task, TaskInputDTO } from '@lifeline/shared';
import { useTaskMutations } from '../api/queries.js';
import { dueLabel, isActive } from '../lib/tasks.js';
import { Card } from './ui/index.js';
import QuickAdd from './tasks/QuickAdd.js';
import TaskItem from './tasks/TaskItem.js';

const STATUS_CYCLE = ['todo', 'doing', 'done', 'blocked'] as const;
const SHOWN = 6;

const toInput = (t: Task): TaskInputDTO => ({
  title: t.title,
  status: t.status,
  priority: t.priority,
  project: t.project,
  block: t.block,
  estimate: t.estimate,
  due_date: t.due_date,
});

/** Soonest-due first (overdue floats up), then by priority. */
function activeSort(a: Task, b: Task): number {
  const da = a.due_date ?? '9999-99-99';
  const db = b.due_date ?? '9999-99-99';
  if (da !== db) return da < db ? -1 : 1;
  return (a.priority ?? 99) - (b.priority ?? 99) || a.id - b.id;
}

/**
 * The board's tasks panel — replaces the contribution grid. Quick-capture to
 * the inbox plus a compact list of what's active, linking to the full page.
 */
export default function BoardTasks({ board }: { board: AnyBoard }) {
  const isOwner = board.isOwner;
  const { create, update } = useTaskMutations();

  const active = board.tasks.filter(isActive).sort(activeSort);
  const shown = active.slice(0, SHOWN);

  const addTask = (title: string) => create.mutate({ title, status: 'todo', priority: 2, project: null });
  const toggle = (t: Task) =>
    update.mutate({
      id: t.id,
      input: { ...toInput(t), status: STATUS_CYCLE[(STATUS_CYCLE.indexOf(t.status) + 1) % 4] },
    });

  return (
    <Card
      label={`tasks · ${active.length} active`}
      action={
        <Link
          to="/tasks"
          className="rounded-full border border-transparent px-2.5 py-1 font-mono text-xs lowercase text-muted no-underline transition-colors hover:bg-card-2 hover:text-ink"
        >
          open tasks →
        </Link>
      }
    >
      {isOwner && <QuickAdd onAdd={addTask} pending={create.isPending} />}

      {shown.length ? (
        <div className={isOwner ? 'mt-3' : ''}>
          {shown.map((t) => (
            <TaskItem
              key={t.id}
              task={t}
              due={dueLabel(t.due_date, board.today, t.status)}
              onToggle={isOwner ? () => toggle(t) : undefined}
            />
          ))}
        </div>
      ) : (
        <div className={`${isOwner ? 'mt-3 ' : ''}py-3 font-mono text-sm lowercase text-muted`}>
          {isOwner ? 'inbox zero · nothing active. add one above ·' : 'nothing active right now ·'}
        </div>
      )}

      {active.length > shown.length && (
        <div className="mt-2 text-right">
          <Link to="/tasks" className="font-mono text-xs lowercase text-muted no-underline hover:text-ink">
            +{active.length - shown.length} more →
          </Link>
        </div>
      )}
    </Card>
  );
}

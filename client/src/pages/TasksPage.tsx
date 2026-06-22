import { useState } from 'react';
import type { AnyBoard, Task, TaskStatus, TaskInputDTO } from '@lifeline/shared';
import { useTaskMutations } from '../api/queries.js';
import {
  currentWeek,
  dayHeading,
  tasksOnDay,
  dueLabel,
  projectNames,
  byPriority,
  isActive,
} from '../lib/tasks.js';
import { Card, Button, Badge, ProgressBar } from '../components/ui/index.js';
import PageNav from '../components/PageNav.js';
import TaskItem from '../components/tasks/TaskItem.js';
import WeekStrip from '../components/tasks/WeekStrip.js';
import QuickAdd from '../components/tasks/QuickAdd.js';
import TaskEditPanel from '../components/tasks/TaskEditPanel.js';
import ViewingBadge from '../components/ViewingBadge.js';

const STATUS_CYCLE: TaskStatus[] = ['todo', 'doing', 'done', 'blocked'];
const nextStatus = (s: TaskStatus): TaskStatus => STATUS_CYCLE[(STATUS_CYCLE.indexOf(s) + 1) % 4];

/** Strip a Task down to the input DTO the API accepts. */
const toInput = (t: Task): TaskInputDTO => ({
  title: t.title,
  status: t.status,
  priority: t.priority,
  project: t.project,
  block: t.block,
  estimate: t.estimate,
  due_date: t.due_date,
});

export default function TasksPage({ board }: { board: AnyBoard }) {
  const isOwner = board.isOwner;
  const tasks = board.tasks;
  const { create, update } = useTaskMutations();

  const week = currentWeek(board.today, tasks);
  const [selected, setSelected] = useState(() => {
    const i = week.findIndex((d) => d.today);
    return i < 0 ? 0 : i;
  });
  const [mode, setMode] = useState<'week' | 'day'>('week');
  const [editing, setEditing] = useState<Task | null>(null);

  const addTask = (title: string) =>
    create.mutate({ title, status: 'todo', priority: 2, project: null });

  const toggle = (t: Task) => update.mutate({ id: t.id, input: { ...toInput(t), status: nextStatus(t.status) } });

  const renderTask = (t: Task) => (
    <TaskItem
      key={t.id}
      task={t}
      due={dueLabel(t.due_date, board.today, t.status)}
      onToggle={isOwner ? () => toggle(t) : undefined}
      onEdit={isOwner ? () => setEditing(t) : undefined}
    />
  );

  const inbox = tasks.filter((t) => t.project === null).sort(byPriority);
  const projects = projectNames(tasks);

  const selectedDate = week[selected]?.date ?? board.today;
  const dayList = tasksOnDay(tasks, selectedDate).sort(byPriority);
  const activeToday = dayList.filter(isActive).length;

  return (
    <div className="paper-grain mx-auto min-h-screen max-w-board px-[18px] pb-14 pt-5">
      <PageNav active="tasks" />

      {!isOwner && <ViewingBadge />}

      {/* title + quick add */}
      <div className="mb-[18px] flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="font-mono text-[28px] font-bold tracking-[-0.01em] text-ink">tasks</h1>
          <span className="font-mono text-sm lowercase text-muted">one inbox · everything you're carrying</span>
        </div>
        {isOwner && <QuickAdd onAdd={addTask} pending={create.isPending} />}
      </div>

      <div className="grid grid-cols-1 items-start gap-[18px] lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)]">
        {/* LEFT — inbox + projects */}
        <div className="flex flex-col gap-[18px]">
          <Card
            label={`inbox · ${inbox.length} unsorted`}
            action={
              <Button variant="ghost" size="sm">
                sort →
              </Button>
            }
          >
            {inbox.length ? (
              <div>{inbox.map(renderTask)}</div>
            ) : (
              <div className="py-3 font-mono text-sm lowercase text-muted">inbox zero. nothing unsorted. ·</div>
            )}
          </Card>

          {projects.map((name) => {
            const list = tasks.filter((t) => t.project === name).sort(byPriority);
            const done = list.filter((t) => t.status === 'done').length;
            const pct = list.length ? Math.round((done / list.length) * 100) : 0;
            return (
              <Card key={name}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span aria-hidden="true" className="font-mono font-bold text-clay">
                      ▦
                    </span>
                    <span className="font-mono text-[17px] font-bold lowercase text-ink">{name}</span>
                  </div>
                  <Badge tone={pct === 100 ? 'good' : 'neutral'}>
                    {done}/{list.length} done
                  </Badge>
                </div>
                <ProgressBar value={pct} tone={pct === 100 ? 'good' : 'accent'} cells={24} showValue={false} size="sm" />
                <div className="mt-2">{list.map(renderTask)}</div>
              </Card>
            );
          })}
        </div>

        {/* RIGHT — calendar */}
        <aside className="order-first self-start lg:order-none lg:sticky lg:top-4">
          <Card
            label="calendar"
            action={
              <div className="flex gap-1 rounded-full border border-line bg-card-2 p-[3px]">
                {(['week', 'day'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`press focus-clay rounded-full px-3 py-1 font-mono text-xs lowercase ${
                      mode === m ? 'bg-clay text-[var(--on-accent)]' : 'text-muted hover:text-ink'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            }
          >
            {mode === 'week' && <WeekStrip days={week} selected={selected} onSelect={setSelected} />}

            <div className="mt-4">
              <div className="mb-2 font-mono text-xs font-semibold tracking-[0.06em] lowercase text-muted">
                {dayHeading(selectedDate, board.today)}
              </div>
              {dayList.length ? (
                <div>{dayList.map(renderTask)}</div>
              ) : (
                <div className="py-3 font-mono text-sm lowercase text-muted">nothing scheduled. a rest day is allowed. ·</div>
              )}
            </div>

            <div className="mt-3.5 flex items-center justify-between border-t border-line pt-3">
              <span className="font-mono text-xs lowercase text-muted">{activeToday} active today</span>
              {isOwner && (
                <Button variant="secondary" size="sm" disabled title="coming soon">
                  + schedule
                </Button>
              )}
            </div>
          </Card>
        </aside>
      </div>

      {isOwner && <TaskEditPanel task={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

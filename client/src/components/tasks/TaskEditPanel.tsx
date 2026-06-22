import { useState } from 'react';
import type { Task, TaskStatus, TaskInputDTO } from '@lifeline/shared';
import { useTaskMutations } from '../../api/queries.js';
import SlideOver from '../panels/SlideOver.js';
import { field, input as inputCls, primaryBtn, dangerBtn } from '../panels/ui.js';

const STATUSES: TaskStatus[] = ['todo', 'doing', 'done', 'blocked'];
const PRIORITIES: (number | null)[] = [null, 0, 1, 2, 3];
const priorityLabel = (p: number | null) => (p === null ? 'none' : `p${p}`);

/** Owner-only per-task editor. Renders as a right-side slide-over. */
export default function TaskEditPanel({ task, onClose }: { task: Task | null; onClose: () => void }) {
  return (
    <SlideOver open={!!task} title="edit task" onClose={onClose}>
      {task && <EditForm key={task.id} task={task} onClose={onClose} />}
    </SlideOver>
  );
}

function EditForm({ task, onClose }: { task: Task; onClose: () => void }) {
  const { update, remove } = useTaskMutations();
  const [title, setTitle] = useState(task.title);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<number | null>(task.priority);
  const [project, setProject] = useState(task.project ?? '');
  const [due, setDue] = useState(task.due_date ?? '');
  const [estimate, setEstimate] = useState(task.estimate ?? '');
  const [block, setBlock] = useState(task.block ?? '');

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const input: TaskInputDTO = {
      title: title.trim(),
      status,
      priority,
      project: project.trim() || null,
      due_date: due || null,
      estimate: estimate.trim() || null,
      block: block.trim() || null,
    };
    update.mutate({ id: task.id, input }, { onSuccess: onClose });
  };

  const del = () => remove.mutate(task.id, { onSuccess: onClose });

  return (
    <form onSubmit={save} className="space-y-4">
      <label className={field}>
        <span>title</span>
        <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
      </label>

      <div className={field}>
        <span>status</span>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`press focus-clay flex-1 rounded-md border px-2 py-1.5 text-sm lowercase ${
                status === s ? 'border-clay bg-clay-tint text-clay-deep' : 'border-line-2 text-ink-2 hover:bg-card-2'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className={field}>
        <span>priority</span>
        <div className="flex flex-wrap gap-2">
          {PRIORITIES.map((p) => (
            <button
              key={priorityLabel(p)}
              type="button"
              onClick={() => setPriority(p)}
              className={`press focus-clay flex-1 rounded-md border px-2 py-1.5 text-sm lowercase ${
                priority === p ? 'border-clay bg-clay-tint text-clay-deep' : 'border-line-2 text-ink-2 hover:bg-card-2'
              }`}
            >
              {priorityLabel(p)}
            </button>
          ))}
        </div>
      </div>

      <label className={field}>
        <span>project (empty = inbox)</span>
        <input className={inputCls} value={project} placeholder="e.g. instance cloud" onChange={(e) => setProject(e.target.value)} />
      </label>

      <label className={field}>
        <span>due date</span>
        <input type="date" className={inputCls} value={due} onChange={(e) => setDue(e.target.value)} />
      </label>

      <div className="flex gap-3">
        <label className={`${field} flex-1`}>
          <span>estimate</span>
          <input className={inputCls} value={estimate} placeholder="15m / 1h / half-day" onChange={(e) => setEstimate(e.target.value)} />
        </label>
        <label className={`${field} flex-1`}>
          <span>work block</span>
          <input className={inputCls} value={block} placeholder="wb2" onChange={(e) => setBlock(e.target.value)} />
        </label>
      </div>

      <div className="flex items-center justify-between pt-1">
        <button type="button" onClick={del} disabled={remove.isPending} className={dangerBtn}>
          delete
        </button>
        <button type="submit" disabled={update.isPending} className={`${primaryBtn} w-auto px-6`}>
          {update.isPending ? 'saving…' : 'save'}
        </button>
      </div>
    </form>
  );
}

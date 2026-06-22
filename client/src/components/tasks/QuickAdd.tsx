import { useState } from 'react';
import { Badge } from '../ui/index.js';
import PriorityTag from './PriorityTag.js';

interface Props {
  /** create a task in the inbox with the given title (priority defaults to p2). */
  onAdd: (title: string) => void;
  pending?: boolean;
}

/** Dashed quick-capture row — type a title, press enter → inbox. */
export default function QuickAdd({ onAdd, pending }: Props) {
  const [title, setTitle] = useState('');

  const submit = () => {
    const t = title.trim();
    if (!t || pending) return;
    onAdd(t);
    setTitle('');
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-md border border-dashed border-line-2 bg-card-2 px-3 py-2.5">
      <span aria-hidden="true" className="font-mono text-base font-bold text-clay">
        +
      </span>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
        }}
        placeholder="add a task to the inbox…"
        aria-label="add a task to the inbox"
        className="min-w-[160px] flex-1 border-none bg-transparent font-mono text-ink outline-none placeholder:text-faint"
      />
      <div className="flex items-center gap-1.5">
        <PriorityTag level={2} />
        <Badge tone="neutral" glyph="⏎">
          enter
        </Badge>
      </div>
    </div>
  );
}

interface Props {
  blocks: boolean[];
  isOwner: boolean;
  onChange: (blocks: boolean[]) => void;
}

/** Row of █/░ work-block toggles. tap flips hit (clay) / miss (faint). */
export default function WorkBlocks({ blocks, isOwner, onChange }: Props) {
  if (blocks.length === 0) return null;

  const toggle = (i: number) => {
    if (!isOwner) return;
    const next = [...blocks];
    next[i] = !next[i];
    onChange(next);
  };

  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="text-xs lowercase tracking-[0.06em] text-muted">work blocks</span>
      <div className="flex flex-wrap gap-2 font-mono">
        {blocks.map((hit, i) => (
          <button
            key={i}
            type="button"
            disabled={!isOwner}
            onClick={() => toggle(i)}
            aria-pressed={hit}
            aria-label={`block ${i + 1}: ${hit ? 'hit' : 'miss'}`}
            title={`block ${i + 1}: ${hit ? 'hit' : 'miss'}`}
            className={`press focus-clay flex h-10 w-10 items-center justify-center rounded-md border text-lg leading-none sm:h-8 sm:w-8 ${
              hit ? 'border-clay/40 bg-clay-tint text-clay' : 'border-line bg-card-2 text-faint'
            } ${isOwner ? 'cursor-pointer' : 'cursor-default'}`}
          >
            {hit ? '█' : '░'}
          </button>
        ))}
      </div>
    </div>
  );
}

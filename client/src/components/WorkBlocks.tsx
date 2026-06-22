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
    <div className="mt-4 flex items-center gap-3">
      <span className="text-xs lowercase tracking-[0.06em] text-muted">work blocks</span>
      <div className="flex gap-1.5 font-mono text-lg leading-none">
        {blocks.map((hit, i) => (
          <button
            key={i}
            type="button"
            disabled={!isOwner}
            onClick={() => toggle(i)}
            aria-pressed={hit}
            aria-label={`block ${i + 1}: ${hit ? 'hit' : 'miss'}`}
            title={`block ${i + 1}: ${hit ? 'hit' : 'miss'}`}
            className={`press focus-clay leading-none ${hit ? 'text-clay' : 'text-faint'} ${
              isOwner ? 'cursor-pointer' : 'cursor-default'
            }`}
          >
            {hit ? '█' : '░'}
          </button>
        ))}
      </div>
    </div>
  );
}

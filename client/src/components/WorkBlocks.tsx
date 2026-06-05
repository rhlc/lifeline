interface Props {
  blocks: boolean[];
  isOwner: boolean;
  onChange: (blocks: boolean[]) => void;
}

/** Row of squares, one per work block. Tap toggles hit (green) / miss (grey). */
export default function WorkBlocks({ blocks, isOwner, onChange }: Props) {
  if (blocks.length === 0) return null;

  const toggle = (i: number) => {
    if (!isOwner) return;
    const next = [...blocks];
    next[i] = !next[i];
    onChange(next);
  };

  return (
    <div className="mt-3 flex items-center gap-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted">Work blocks</span>
      <div className="flex gap-2">
        {blocks.map((hit, i) => (
          <button
            key={i}
            type="button"
            disabled={!isOwner}
            onClick={() => toggle(i)}
            aria-pressed={hit}
            title={`Block ${i + 1}: ${hit ? 'hit' : 'miss'}`}
            className={`tile-pop h-7 w-7 rounded-lg ring-1 ${
              hit ? 'bg-band-ontrack ring-band-ontrack' : 'bg-card ring-edge'
            } ${isOwner ? 'cursor-pointer hover:ring-ink/30' : 'cursor-default'}`}
          />
        ))}
      </div>
    </div>
  );
}

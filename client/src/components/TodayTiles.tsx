import type { DayInput, Food, Mood } from '@lifeline/shared';

interface Props {
  draft: DayInput;
  isOwner: boolean;
  onChange: (d: DayInput) => void;
}

/** A single tap tile. Active = done/positive. */
function Tile({
  icon,
  label,
  active,
  danger,
  isOwner,
  sub,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  danger?: boolean;
  isOwner: boolean;
  sub?: string;
  onClick: () => void;
}) {
  const base =
    'tile-pop flex w-full flex-col items-center justify-center gap-0.5 rounded-2xl py-3.5 ring-1';
  const state = active
    ? danger
      ? 'bg-band-warn/20 ring-band-warn text-band-warn'
      : 'bg-band-ontrack/20 ring-band-ontrack'
    : 'bg-card/60 ring-edge text-ink/80';
  const interactive = isOwner ? 'cursor-pointer hover:ring-ink/30' : 'cursor-default';

  return (
    <button
      type="button"
      disabled={!isOwner}
      onClick={onClick}
      className={`${base} ${state} ${interactive}`}
      aria-pressed={active}
    >
      <span className="text-2xl leading-none">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
      {sub && <span className="text-[10px] text-muted">{sub}</span>}
    </button>
  );
}

export default function TodayTiles({ draft, isOwner, onChange }: Props) {
  const set = (patch: Partial<DayInput>) => onChange({ ...draft, ...patch });

  // Food cycles: null -> control -> lost -> null
  const cycleFood = () => {
    const next: Food | null = draft.food === null ? 'control' : draft.food === 'control' ? 'lost' : null;
    set({ food: next });
  };
  // Mood cycles: null -> good -> ok -> low -> null
  const cycleMood = () => {
    const order: (Mood | null)[] = [null, 'good', 'ok', 'low'];
    const idx = order.indexOf(draft.mood);
    set({ mood: order[(idx + 1) % order.length] });
  };

  const foodIcon = draft.food === 'control' ? '😇' : draft.food === 'lost' ? '😈' : '🍽️';
  const foodSub = draft.food === 'control' ? 'control' : draft.food === 'lost' ? 'lost it' : 'tap';
  const moodIcon = draft.mood === 'good' ? '🙂' : draft.mood === 'ok' ? '😐' : draft.mood === 'low' ? '😞' : '🙂';
  const moodSub = draft.mood ?? 'tap';

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      <Tile icon="💼" label="Work" active={draft.work} isOwner={isOwner} onClick={() => set({ work: !draft.work })} />
      <Tile icon="😴" label="Wake" active={draft.wake} isOwner={isOwner} onClick={() => set({ wake: !draft.wake })} />
      <Tile icon="🏃" label="Move" active={draft.move} isOwner={isOwner} onClick={() => set({ move: !draft.move })} />
      <Tile
        icon={foodIcon}
        label="Food"
        sub={foodSub}
        active={draft.food === 'control'}
        danger={draft.food === 'lost'}
        isOwner={isOwner}
        onClick={cycleFood}
      />
      <Tile
        icon={moodIcon}
        label="Mood"
        sub={moodSub}
        active={draft.mood !== null}
        isOwner={isOwner}
        onClick={cycleMood}
      />
      <Tile
        icon="📵"
        label="Screen"
        sub={draft.screen_ok ? '<1hr ✓' : '<1hr?'}
        active={draft.screen_ok}
        isOwner={isOwner}
        onClick={() => set({ screen_ok: !draft.screen_ok })}
      />
    </div>
  );
}

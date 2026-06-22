import type { DayInput, Food, Mood } from '@lifeline/shared';
import { Tile } from './ui/index.js';

interface Props {
  draft: DayInput;
  isOwner: boolean;
  onChange: (d: DayInput) => void;
}

/**
 * The six daily-ritual tap-tiles. ascii glyphs replace the original emoji:
 * {} work · ~ wake · > move · * food · :) mood · [] screen.
 */
export default function TodayTiles({ draft, isOwner, onChange }: Props) {
  const set = (patch: Partial<DayInput>) => onChange({ ...draft, ...patch });

  // food cycles: null -> control -> lost -> null
  const cycleFood = () => {
    const next: Food | null = draft.food === null ? 'control' : draft.food === 'control' ? 'lost' : null;
    set({ food: next });
  };
  // mood cycles: null -> good -> ok -> low -> null
  const cycleMood = () => {
    const order: (Mood | null)[] = [null, 'good', 'ok', 'low'];
    const idx = order.indexOf(draft.mood);
    set({ mood: order[(idx + 1) % order.length] });
  };

  const foodSub = draft.food === 'control' ? 'control' : draft.food === 'lost' ? 'lost it' : 'tap';
  // mood glyph stays the ascii face; sub-line carries the read-out.
  const moodSub = draft.mood ?? 'tap';

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      <Tile
        glyph="{}"
        label="work"
        active={draft.work}
        disabled={!isOwner}
        onClick={() => set({ work: !draft.work })}
      />
      <Tile
        glyph="~"
        label="wake"
        active={draft.wake}
        disabled={!isOwner}
        onClick={() => set({ wake: !draft.wake })}
      />
      <Tile
        glyph=">"
        label="move"
        active={draft.move}
        disabled={!isOwner}
        onClick={() => set({ move: !draft.move })}
      />
      <Tile
        glyph="*"
        label="food"
        sub={foodSub}
        active={draft.food === 'control'}
        danger={draft.food === 'lost'}
        disabled={!isOwner}
        onClick={cycleFood}
      />
      <Tile
        glyph=":)"
        label="mood"
        sub={moodSub}
        active={draft.mood !== null}
        disabled={!isOwner}
        onClick={cycleMood}
      />
      <Tile
        glyph="[]"
        label="screen"
        sub={draft.screen_ok ? '<1hr ✓' : '<1hr?'}
        active={draft.screen_ok}
        disabled={!isOwner}
        onClick={() => set({ screen_ok: !draft.screen_ok })}
      />
    </div>
  );
}

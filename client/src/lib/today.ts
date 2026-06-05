import type { AnyBoard, Day, DayInput } from '@lifeline/shared';

export function emptyDayInput(workBlocks: number): DayInput {
  return {
    work: false,
    wake: false,
    move: false,
    food: null,
    mood: null,
    screen_ok: false,
    blocks: Array.from({ length: workBlocks }, () => false),
    survival_mode: false,
  };
}

export function dayToInput(day: Day): DayInput {
  return {
    work: day.work,
    wake: day.wake,
    move: day.move,
    food: day.food,
    mood: day.mood,
    screen_ok: day.screen_ok,
    blocks: [...day.blocks],
    survival_mode: day.survival_mode,
  };
}

/** Today's draft: the existing row if present, else an empty one. */
export function todaysDraft(board: AnyBoard): DayInput {
  const existing = board.days.find((d) => d.day === board.today);
  if (existing) {
    const input = dayToInput(existing);
    // normalize block count to current settings
    const want = board.settings.work_blocks;
    while (input.blocks.length < want) input.blocks.push(false);
    return input;
  }
  return emptyDayInput(board.settings.work_blocks);
}

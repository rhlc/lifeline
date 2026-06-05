import type { Engagement } from '@lifeline/shared';

/**
 * Contextual status for today — replaces the Lock-in / Survival buttons.
 * It reads the day's engagement (auto-saved) and tells the user where they
 * stand, in the supportive Hinglish tone.
 */
export default function DayStatus({ engagement, streak }: { engagement: Engagement; streak: number }) {
  const map: Record<Engagement, { cls: string; icon: string; text: string }> = {
    full: {
      cls: 'bg-band-ontrack/15 ring-band-ontrack/40 text-band-ontrack',
      icon: '✅',
      text: 'Today counts — locked in. Shabaash, aise hi chalte raho.',
    },
    survival: {
      cls: 'bg-band-warn/15 ring-band-warn/40 text-band-warn',
      icon: '😮‍💨',
      text: 'Survival day — streak safe. Zero nahi hai na. Bas chalte raho.',
    },
    none: {
      cls: 'bg-card/60 ring-edge text-muted',
      icon: '👆',
      text: 'Tap anything — even just your mood — to keep the streak alive.',
    },
  };
  const s = map[engagement];

  return (
    <div className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm ring-1 ${s.cls}`}>
      <span className="text-lg">{s.icon}</span>
      <span className="flex-1">{s.text}</span>
      {engagement !== 'none' && streak > 0 && (
        <span className="shrink-0 text-xs opacity-80">🔥 {streak}</span>
      )}
    </div>
  );
}

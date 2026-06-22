import { useEffect, useState, type CSSProperties, type HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLSpanElement> {
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  speed?: number;
}

/**
 * AsciiFlame — the lifeline streak mascot. animated ascii fire that cycles a
 * few hand-tuned frames. replaces the emoji 🔥. cold (dim, static ember) when
 * the streak is 0; pauses under prefers-reduced-motion.
 */
const FRAMES: string[][] = [
  ['  )  ', ' (\\) ', '(\\\\/)', ')\\//(', '(////)'],
  [' (   ', ' )(\\ ', '(//\\)', '(\\\\/)', '(////)'],
  ['  (  ', ' (/) ', '(\\//)', ')//\\(', '(////)'],
];

export default function AsciiFlame({
  count = 0,
  size = 'md',
  showCount = true,
  speed = 220,
  style,
  ...rest
}: Props) {
  const cold = count <= 0;
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (cold) return;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const id = setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), speed);
    return () => clearInterval(id);
  }, [cold, speed]);

  const px = { sm: 7, md: 9, lg: 13 }[size];
  const art = cold ? FRAMES[0] : FRAMES[frame];

  return (
    <span
      {...rest}
      title={cold ? 'streak cold' : `${count} day streak`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size === 'lg' ? 12 : 8,
        fontFamily: 'var(--font-mono)',
        ...style,
      } as CSSProperties}
    >
      <pre
        aria-hidden="true"
        style={{
          margin: 0,
          fontSize: px,
          lineHeight: 1,
          letterSpacing: '-0.5px',
          color: cold ? 'var(--faint)' : 'var(--clay)',
          // rgba (not color-mix) so html2canvas can export the share card.
          textShadow: cold ? 'none' : '0 0 10px rgba(192, 87, 46, 0.22)',
          transition: 'color var(--dur-3) var(--ease)',
          fontWeight: 700,
        }}
      >
        {art.join('\n')}
      </pre>
      {showCount && (
        <span
          style={{
            fontSize: size === 'lg' ? 'var(--fs-h1)' : 'var(--fs-h2)',
            fontWeight: 700,
            color: cold ? 'var(--faint)' : 'var(--ink)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {count}
        </span>
      )}
    </span>
  );
}

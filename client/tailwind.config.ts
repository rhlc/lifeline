import type { Config } from 'tailwindcss';

/**
 * Warm-mono design tokens (the lifeline design system). Light theme only:
 * cream paper, warm ink, one clay accent, three earthy status hues. The
 * canonical values live as CSS variables in index.css; this mirrors them so
 * Tailwind utilities map to the same palette.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm paper + ink.
        paper: '#f3ede0',
        'paper-2': '#ece3d2',
        // `card` is a near-white warm surface; `card-2` the inset/secondary one.
        card: '#fbf7ee',
        'card-2': '#f6f0e3',
        // `panel` kept as an alias of card so legacy classes resolve warm.
        panel: '#fbf7ee',

        ink: '#2a2520',
        'ink-2': '#5b5244',
        muted: '#938775',
        faint: '#c2b6a0',

        line: '#e3dac8',
        'line-2': '#d4c9b3',
        // `edge` kept as an alias of the hairline border (legacy ring-edge).
        edge: '#e3dac8',

        // The one accent — clay.
        clay: {
          DEFAULT: '#c0572e',
          deep: '#99401c',
          soft: '#ecd2bf',
          tint: '#f6e7dc',
        },

        // Earthy status hues + their tints.
        good: { DEFAULT: '#6f7d3a', soft: '#e6e7cd' },
        warn: { DEFAULT: '#c08a2e', soft: '#f1e3c4' },
        bonus: { DEFAULT: '#b1552f', soft: '#f0dccb' },

        // Legacy `band-*` names mapped to the warm status hues so existing
        // markup keeps resolving during the re-skin.
        band: {
          warn: '#c08a2e',
          ontrack: '#6f7d3a',
          bonus: '#b1552f',
        },

        // Contribution grid ramp — warm amber → clay (empty → full).
        grid: {
          0: '#e7ddc9',
          1: '#e6c98a',
          2: '#d99a4c',
          3: '#c56a30',
          4: '#9e4019',
        },
      },
      fontFamily: {
        mono: [
          '"JetBrains Mono NL"',
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
        // `sans` aliases mono so any stray font-sans still renders mono.
        sans: [
          '"JetBrains Mono NL"',
          '"JetBrains Mono"',
          'ui-monospace',
          'monospace',
        ],
      },
      borderRadius: {
        xs: '3px',
        sm: '5px',
        md: '7px',
        lg: '10px',
        xl: '14px',
      },
      boxShadow: {
        xs: '0 1px 1px rgba(42, 37, 32, 0.04)',
        sm: '0 1px 2px rgba(42, 37, 32, 0.05), 0 1px 0 rgba(42, 37, 32, 0.02)',
        md: '0 2px 8px rgba(42, 37, 32, 0.07)',
        lg: '0 8px 28px rgba(42, 37, 32, 0.1)',
      },
      maxWidth: {
        board: '940px',
      },
      transitionTimingFunction: {
        ease: 'cubic-bezier(0.2, 0, 0.1, 1)',
        'ease-out-calm': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;

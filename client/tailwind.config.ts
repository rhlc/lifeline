import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Grid contribution bands (spec §5d).
        grid: {
          0: '#1f2430',
          1: '#2e4b3a',
          2: '#3f7a52',
          3: '#4fae6a',
          4: '#7be495',
        },
        band: {
          warn: '#f5a524',
          ontrack: '#4fae6a',
          bonus: '#a855f7',
        },
        ink: '#e7ecf3',
        muted: '#8b96a7',
        panel: '#161b25',
        card: '#1c2230',
        edge: '#272f3d',
      },
      fontFamily: {
        sans: ['"Open Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;

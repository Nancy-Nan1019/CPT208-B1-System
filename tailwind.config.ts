import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'run': 'run 0.5s steps(4) infinite',
      },
      keyframes: {
        run: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '-200px 0' },
        },
      },
    },
  },
  plugins: [],
};
export default config;

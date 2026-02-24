import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7f4',
          100: '#d9ede2',
          200: '#b5dbc6',
          300: '#85c2a3',
          400: '#57a67e',
          500: '#368a63',
          600: '#266e4f',
          700: '#1f5840',
          800: '#1b4735',
          900: '#173b2d',
          950: '#0b2119',
        },
        accent: {
          50: '#fef6ee',
          100: '#fdead7',
          200: '#fad0ae',
          300: '#f6af7a',
          400: '#f18544',
          500: '#ee6820',
          600: '#df4f16',
          700: '#b93a14',
          800: '#932f18',
          900: '#772917',
          950: '#40120a',
        },
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7f3',
          100: '#dcebe2',
          200: '#bbd7c8',
          300: '#8fbca6',
          400: '#5f9b7f',
          500: '#3f7f62',
          600: '#2d654c',
          700: '#25513e',
          800: '#1f4133',
          900: '#0f3d28',
        },
sand: '#f4f6f5',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

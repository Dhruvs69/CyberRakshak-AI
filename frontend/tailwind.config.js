/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060a14',
          900: '#0a0f1d',
          850: '#0e162b',
          800: '#141e3a',
          700: '#1e2b4f',
          600: '#2a3b68',
        },
        cyber: {
          cyan: '#00f0ff',
          blue: '#3b82f6',
          teal: '#14b8a6',
          green: '#10b981',
          amber: '#f59e0b',
          red: '#ef4444',
          border: 'rgba(56, 189, 248, 0.15)',
        },
        charcoal: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          850: '#1c1c1f',
          900: '#141417',
          950: '#0a0a0c',
        },
        deep: {
          canvas: '#000000',
          base: '#050505',
          card: '#0a0a0d',
          surface: '#111115',
          panel: '#16161b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Geist Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        'glow-indigo': '0 0 30px -5px rgba(99, 102, 241, 0.25)',
        'glow-violet': '0 0 30px -5px rgba(139, 92, 246, 0.25)',
        'glow-cyan': '0 0 30px -5px rgba(6, 182, 212, 0.25)',
        'glow-emerald': '0 0 30px -5px rgba(16, 185, 129, 0.25)',
        'glow-rose': '0 0 30px -5px rgba(244, 63, 94, 0.25)',
        'glow-blue': '0 0 20px -5px rgba(59, 130, 246, 0.3)',
        'glow-red': '0 0 20px -5px rgba(239, 68, 68, 0.3)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'subtle-card': '0 0 0 1px rgba(255, 255, 255, 0.06), 0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}

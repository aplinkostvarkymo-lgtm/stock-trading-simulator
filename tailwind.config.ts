import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'terminal-bg': '#0a0e27',
        'terminal-surface': '#141b34',
        'terminal-border': '#1e293b',
        'terminal-text': '#e2e8f0',
        'terminal-muted': '#64748b',
        'success-green': '#10b981',
        'danger-red': '#ef4444',
        'warning-yellow': '#f59e0b',
        'accent-blue': '#3b82f6',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-price': 'pulse-price 0.5s ease-in-out',
        'slide-in': 'slide-in 0.3s ease-out',
      },
      keyframes: {
        'pulse-price': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6', transform: 'scale(1.05)' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config


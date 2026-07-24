/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      colors: {
        ink: {
          950: '#070708',
          900: '#0c0c0f',
          800: '#131318',
          700: '#1c1c23',
          600: '#26262f',
          500: '#3a3a47',
          400: '#5c5c6b',
          300: '#8a8a99',
          200: '#b8b8c4',
          100: '#e4e4ea',
          50:  '#f5f5f7'
        },
        accent: {
          DEFAULT: '#6366f1',
          soft: '#818cf8',
          deep: '#4f46e5',
          glow: '#a5b4fc'
        }
      },
      boxShadow: {
        'glow': '0 0 0 1px rgba(99,102,241,0.25), 0 8px 30px -8px rgba(99,102,241,0.45)',
        'panel': '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 24px 60px -30px rgba(0,0,0,0.8)'
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        }
      },
      animation: {
        shimmer: 'shimmer 2.5s linear infinite',
        floaty: 'floaty 6s ease-in-out infinite'
      }
    }
  },
  plugins: []
}

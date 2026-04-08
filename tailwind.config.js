/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Midnight Study palette
        midnight: {
          950: '#050810',
          900: '#0a0f1e',
          800: '#0f1629',
          700: '#151d35',
          600: '#1c2642',
          500: '#243050',
        },
        neon: {
          // Emerald neon for success
          DEFAULT: '#00ff87',
          dim: '#00c468',
          glow: '#00ff8722',
          muted: '#10b981',
        },
        amber: {
          // Soft amber for progress
          progress: '#f59e0b',
          dim: '#d97706',
          glow: '#f59e0b22',
        },
        surface: {
          DEFAULT: '#111827',
          raised: '#1f2937',
          elevated: '#374151',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 20px #00ff8733, 0 0 40px #00ff8711',
        amber: '0 0 20px #f59e0b33, 0 0 40px #f59e0b11',
        card: '0 4px 24px rgba(0,0,0,0.4)',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { boxShadow: '0 0 10px #00ff8744' },
          '50%': { boxShadow: '0 0 25px #00ff8788, 0 0 50px #00ff8733' },
        },
        'slide-up': {
          from: { transform: 'translateY(12px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}

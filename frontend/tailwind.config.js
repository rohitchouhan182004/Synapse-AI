/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        synapse: {
          bg: '#080B0E',
          surface: '#0F141C',
          subsurface: '#151D28',
          card: '#1A2330',
          border: '#233042',
          borderBright: '#33445C',
          lime: '#B4F342',
          limeMuted: 'rgba(180, 243, 66, 0.15)',
          cyan: '#06B6D4',
          cyanMuted: 'rgba(6, 182, 212, 0.15)',
          amber: '#F59E0B',
          amberMuted: 'rgba(245, 158, 11, 0.15)',
          crimson: '#EF4444',
          crimsonMuted: 'rgba(239, 68, 68, 0.15)',
          text: '#F3F4F6',
          muted: '#94A3B8',
          subtle: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace'],
        display: ['Syne', 'Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

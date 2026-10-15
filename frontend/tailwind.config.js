/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        taxi: {
          yellow: '#FACC15',       // Primary vibrant cab yellow
          yellowHover: '#EAB308',  // Darker yellow for hover
          gold: '#CA8A04',
          black: '#0A0A0A',        // Deep obsidian black
          dark: '#121212',         // Card dark background
          card: '#18181B',         // Elevated element background
          border: '#27272A',       // Subtle dark border
          light: '#F4F4F5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 2.5s infinite ease-in-out',
        'bounce-gentle': 'bounceGentle 2s infinite ease-in-out',
        'glow-pulse': 'glowPulse 2s infinite alternate',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.03)', opacity: '0.95' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        glowPulse: {
          '0%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 8px rgba(250, 204, 21, 0.4))' },
          '100%': { transform: 'scale(1.02)', filter: 'drop-shadow(0 0 18px rgba(250, 204, 21, 0.8))' },
        }
      }
    },
  },
  plugins: [],
}

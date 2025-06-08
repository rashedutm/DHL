/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      keyframes: {
        highlight: {
          '0%': { 
            backgroundColor: 'rgb(243 244 246)',
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 rgba(34, 197, 94, 0)'
          },
          '50%': { 
            backgroundColor: 'rgb(220 252 231)',
            transform: 'scale(1.02)',
            boxShadow: '0 0 20px 5px rgba(34, 197, 94, 0.3)'
          },
          '100%': { 
            backgroundColor: 'rgb(243 244 246)',
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 rgba(34, 197, 94, 0)'
          }
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' }
        }
      },
      animation: {
        highlight: 'highlight 0.6s ease-in-out 3',
        pulse: 'pulse 0.6s ease-in-out 3'
      }
    },
  },
  plugins: [],
} 
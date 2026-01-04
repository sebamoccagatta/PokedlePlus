export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
        },
        surface: {
          50: '#ffffff',
          100: '#fafafa',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-out',
        'bounce-short': 'bounce 0.5s ease-in-out 1',
        'shake': 'shake 0.5s ease-in-out',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-10px)', opacity: '0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
      },
    },
  },
  plugins: [],
  safelist: [
    "border-emerald-700/50", "bg-emerald-950/40", "text-emerald-100",
    "border-amber-700/50", "bg-amber-950/40", "text-amber-100",
    "border-zinc-800", "bg-zinc-950/30", "text-zinc-300",
    "border-sky-700/50", "bg-sky-950/40", "text-sky-100",
    "border-violet-700/50", "bg-violet-950/40", "text-violet-100",
    "bg-white", "text-gray-900", "border-gray-200",
    "hover:bg-gray-50", "bg-gray-100",
  ],
};

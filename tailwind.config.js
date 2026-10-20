/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "brand-primary": "#04635F",
        "brand-accent": "#D35400",
        "surface-page": "#F8F9FA",
        "surface-card": "#FFFFFF",
        "text-primary": "#343A40",
        "text-muted": "#6C757D",
        "type-feature": "#0D9488",
        "type-bug": "#DC2626",
        "due-safe": "#0D9488",
        "due-warning": "#D97706",
        "due-overdue": "#B91C1C",
        "due-neutral": "#6C757D"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"]
      },
      boxShadow: {
        "card-hover": "0 5px 16px rgba(52, 58, 64, 0.09)"
      }
    }
  },
  plugins: []
};

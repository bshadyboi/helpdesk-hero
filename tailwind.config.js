/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        ink: {
          950: "#070b16",
          900: "#0b1120",
          850: "#0f1729",
          800: "#141d33",
          700: "#1c2740",
          600: "#26324f",
        },
        brand: {
          400: "#5eead4",
          500: "#2dd4bf",
          600: "#14b8a6",
        },
        accent: {
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
        },
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(45,212,191,0.45)",
        "glow-indigo": "0 0 40px -10px rgba(99,102,241,0.5)",
        card: "0 20px 50px -20px rgba(0,0,0,0.6)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(45,212,191,0.5)" },
          "70%": { boxShadow: "0 0 0 12px rgba(45,212,191,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(45,212,191,0)" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "bounce-sm": {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out",
        "pop-in": "pop-in 0.25s ease-out",
        "pulse-ring": "pulse-ring 2s infinite",
        "slide-in": "slide-in 0.3s ease-out",
        shimmer: "shimmer 2.5s linear infinite",
        "bounce-sm": "bounce-sm 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

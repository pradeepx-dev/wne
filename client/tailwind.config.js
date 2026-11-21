/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        serif: ["Newsreader", "Playfair Display", "Georgia", "serif"],
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        paper: {
          DEFAULT: "#fbfbfa",
          card: "#ffffff",
          border: "#e7e7e4",
          borderSubtle: "#f0f0ee",
        },
        ink: {
          DEFAULT: "#111111",
          secondary: "#555555",
          muted: "#888888",
          faint: "#b4b4b4",
        },
        obsidian: {
          DEFAULT: "#0d0e11",
          card: "#15161b",
          elevated: "#1c1e24",
          border: "#262830",
          borderSubtle: "#1c1d22",
        }
      },
      boxShadow: {
        'paper-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'paper': '0 2px 6px -1px rgba(0, 0, 0, 0.05), 0 1px 3px -1px rgba(0, 0, 0, 0.03)',
        'paper-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}

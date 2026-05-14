/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5",
        secondary: "#6366F1",
        background: "#F9FAFB",
        surface: "#FFFFFF",
        textMain: "#111827",
        textMuted: "#6B7280",
        border: "#E5E7EB",
      }
    },
  },
  plugins: [],
}

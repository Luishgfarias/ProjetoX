/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        app: {
          background: "#f8fafc",
          "background-dark": "#070b12",
          surface: "#ffffff",
          "surface-dark": "#111827",
          "surface-muted": "#f1f5f9",
          "surface-muted-dark": "#1f2937",
          border: "#dbe3ee",
          "border-dark": "#334155",
          text: "#0f172a",
          "text-dark": "#f8fafc",
          muted: "#475569",
          "muted-dark": "#cbd5e1",
          subtle: "#64748b",
          "subtle-dark": "#94a3b8",
          primary: "#111827",
          "primary-dark": "#e5e7eb",
          "primary-pressed": "#374151",
          "primary-pressed-dark": "#cbd5e1",
          accent: "#2563eb",
          "accent-dark": "#93c5fd",
          danger: "#be123c",
          "danger-dark": "#fda4af",
        },
      },
    },
  },
  plugins: [],
};

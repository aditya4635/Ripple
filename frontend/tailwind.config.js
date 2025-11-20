import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: "oklch(var(--p))", // Use daisyUI variables but allow custom overrides if needed
        secondary: "oklch(var(--s))",
        accent: "oklch(var(--a))",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          primary: "#4f46e5", // Indigo-600
          secondary: "#818cf8", // Indigo-400
          accent: "#f472b6", // Pink-400
          neutral: "#1f2937", // Gray-800
          "base-100": "#ffffff",
          "base-200": "#f3f4f6",
          "base-300": "#e5e7eb",
        },
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          primary: "#6366f1", // Indigo-500
          secondary: "#a5b4fc", // Indigo-300
          accent: "#f472b6", // Pink-400
          neutral: "#111827", // Gray-900
          "base-100": "#0f172a", // Slate-900 (Rich dark background)
          "base-200": "#1e293b", // Slate-800
          "base-300": "#334155", // Slate-700
        },
      },
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter",
      "dim",
      "nord",
      "sunset",
    ],
  },
};

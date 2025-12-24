import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: "oklch(var(--p) / <alpha-value>)",
        secondary: "oklch(var(--s) / <alpha-value>)",
        accent: "oklch(var(--a) / <alpha-value>)",
        neutral: "oklch(var(--n) / <alpha-value>)",
        "base-100": "oklch(var(--b1) / <alpha-value>)",
        "base-200": "oklch(var(--b2) / <alpha-value>)",
        "base-300": "oklch(var(--b3) / <alpha-value>)",
        "base-content": "oklch(var(--bc) / <alpha-value>)",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: false, // Disable all DaisyUI themes to use manual control
    logs: false,
  },
};

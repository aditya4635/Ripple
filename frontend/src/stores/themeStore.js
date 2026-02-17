import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("ripple-theme") || "dark",

  setTheme: (theme) => {
    localStorage.setItem("ripple-theme", theme);

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    set({ theme });
  },

  initializeTheme: () => {
    const saved = localStorage.getItem("ripple-theme") || "dark";

    if (saved === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    set({ theme: saved });
  },
}));

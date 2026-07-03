"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

export type ThemeId = "light" | "dark" | "warm-light" | "warm-dark";

type ThemeDefinition = {
  id: ThemeId;
  label: string;
  isDark: boolean;
};

export const THEMES: ThemeDefinition[] = [
  { id: "light", label: "Light", isDark: false },
  { id: "dark", label: "Dark", isDark: true },
  { id: "warm-light", label: "Warm Light", isDark: false },
  { id: "warm-dark", label: "Warm Dark", isDark: true },
];

type ThemeContextType = {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyTheme(id: ThemeId) {
  const def = THEMES.find((t) => t.id === id) ?? THEMES[0];
  document.documentElement.setAttribute("data-theme", def.id);
  document.documentElement.classList.toggle("dark", def.isDark);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always start with "light" on server + first client render so hydration
  // never mismatches. The real theme (already applied to <html> by your
  // inline anti-flash script) is picked up in the effect below.
  const [theme, setThemeState] = useState<ThemeId>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") as ThemeId | null;
    setThemeState(current && THEMES.some((t) => t.id === current) ? current : "light");
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem("theme");
      } catch (err) {}

      // Only auto-switch if the user never explicitly picked a theme.
      if (stored) return;

      const next: ThemeId = e.matches ? "dark" : "light";
      applyTheme(next);
      setThemeState(next);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [mounted]);

  const setTheme = useCallback((next: ThemeId) => {
    applyTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {}
    setThemeState(next);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return { theme: "light" as ThemeId, setTheme: () => {}, mounted: true };
  }
  return context;
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon, Menu, X, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme, THEMES, ThemeId } from "./ThemeProvider";
import { FaIcons } from "react-icons/fa";

const navItems = [
  { href: "/", label: "About" },
  { href: "/blog", label: "Blog" },
];

// Small accent-color swatches for the theme picker, so each option is
// visually distinguishable at a glance rather than just text + icon.
const THEME_SWATCHES: Record<ThemeId, string> = {
  light: "#b2bcca",
  dark: "#3c4a55",
  sage: "#8ea6a7",
  "warm-light": "#d98c4a",
  "warm-dark": "#8a5a3b",
};

export default function Header() {
  const pathname = usePathname();
  const { theme, setTheme, mounted } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  const activeTheme = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setThemeMenuOpen(false);
    }
    if (themeMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [themeMenuOpen]);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setThemeMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-bg/80 backdrop-blur-sm border-b">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center text-sm font-medium tracking-tight h-full">
            <FaIcons className="mr-2" />
            <span className="hidden sm:inline">BA</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-6 h-full">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center h-full text-xs uppercase tracking-widest transition-colors ${
                  pathname === item.href ? "text-fg" : "text-muted hover:text-fg"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5 h-full">
            <div className="relative flex items-center h-full" ref={themeMenuRef}>
              <button
                onClick={() => setThemeMenuOpen((v) => !v)}
                className={`flex items-center justify-center p-2 rounded-md transition-colors ${
                  themeMenuOpen ? "text-fg bg-muted/10" : "text-muted hover:text-fg hover:bg-muted/10"
                }`}
                aria-label="Choose theme"
                aria-haspopup="menu"
                aria-expanded={themeMenuOpen}
              >
                {!mounted ? (
                  <div style={{ width: 16, height: 16 }} />
                ) : activeTheme.isDark ? (
                  <Moon size={16} strokeWidth={1.5} />
                ) : (
                  <Sun size={16} strokeWidth={1.5} />
                )}
              </button>

              <div
                role="menu"
                className={`absolute right-0 top-full mt-1 w-44 bg-bg border border-border rounded-sm py-2 px-2 origin-top-right transition-all duration-150 ${
                  themeMenuOpen
                    ? "opacity-100 scale-100 pointer-events-auto"
                    : "opacity-0 scale-95 pointer-events-none"
                }`}
              >
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    role="menuitem"
                    onClick={() => {
                      setTheme(t.id);
                      setThemeMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left text-muted hover:text-fg hover:bg-muted/10 transition-colors"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-border/50 shrink-0"
                      style={{ backgroundColor: THEME_SWATCHES[t.id] }}
                      aria-hidden
                    />
                    <span className="flex-1">{t.label}</span>
                    {theme === t.id && <Check size={12} strokeWidth={2} className="shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center justify-center p-2 rounded-md text-muted hover:text-fg hover:bg-muted/10 transition-colors sm:hidden"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={16} strokeWidth={1.5} /> : <Menu size={16} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        <nav
          className={`sm:hidden overflow-hidden transition-all duration-200 ease-in-out ${
            menuOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="border-t py-3 space-y-0.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-2 py-2 rounded-md text-xs uppercase tracking-widest transition-colors ${
                  pathname === item.href ? "text-fg bg-muted/10" : "text-muted hover:text-fg hover:bg-muted/10"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
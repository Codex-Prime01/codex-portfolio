import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * Dark / light theme. The choice lives on <html data-theme>, so every colour
 * token in index.css flips at once. A small script in index.html sets it
 * before first paint, so a light-mode visitor never sees a dark flash.
 */

export type Theme = "dark" | "light";

const STORAGE_KEY = "cp-theme";
const SWITCH_MS = 700;

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "dark",
  toggle: () => {},
});

const readTheme = (): Theme =>
  typeof document !== "undefined" && document.documentElement.dataset.theme === "light" ? "light" : "dark";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readTheme);

  // The attribute flips *before* React re-renders. Canvases read the colour
  // tokens in their own effects, which run before this provider's effects —
  // so flipping it in an effect here would hand them the old colours.
  const setTheme = useCallback((next: Theme) => {
    document.documentElement.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "light" ? "#F3F1EA" : "#08080A");
    setThemeState(next);
  }, []);

  // Follow the system setting until the visitor picks one themselves.
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      try {
        if (localStorage.getItem(STORAGE_KEY)) return;
      } catch {
        /* storage blocked — just follow the system */
      }
      setTheme(query.matches ? "light" : "dark");
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [setTheme]);

  const toggle = useCallback(() => {
    const html = document.documentElement;
    // Colours fade only during a switch, never on page load or hover.
    html.classList.add("theme-switching");
    window.setTimeout(() => html.classList.remove("theme-switching"), SWITCH_MS);
    const next: Theme = readTheme() === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage blocked — the choice lasts for this visit only */
    }
    setTheme(next);
  }, [setTheme]);

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

/** Reads a colour token (e.g. "--paper") for canvas code, which can't use CSS vars. */
export const cssVar = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/** "--paper-rgb" holds "243 241 234"; this turns it into an rgba() string. */
export const rgba = (name: string, alpha: number) => `rgb(${cssVar(name)} / ${alpha})`;

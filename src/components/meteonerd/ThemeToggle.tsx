import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("mn-theme");
    const prefersDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(prefersDark);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("mn-theme", dark ? "dark" : "light");
  }, [dark]);
  return (
    <button
      onClick={() => setDark(d => !d)}
      className="px-3 py-1.5 text-xs border border-border bg-card hover:bg-muted transition-colors mono"
      style={{ borderRadius: 4 }}
      aria-label="Toggle theme"
    >
      {dark ? "DARK" : "LIGHT"}
    </button>
  );
}

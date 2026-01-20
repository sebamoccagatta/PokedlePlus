import { useTheme } from "../hooks/useTheme";
import { cn } from "../utils/cn";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "rounded-2xl border px-4 py-2 text-xs font-extrabold transition-all duration-200 btn-surface",
        "hover:scale-105 active:scale-95",
      )}
      aria-label={
        theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
      }
    >
      {theme === "dark" ? "☀️ Claro" : "🌙 Oscuro"}
    </button>
  );
}

import { useTheme } from "../hooks/useTheme";
import { cn } from "../utils/cn";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "rounded-2xl border px-4 py-2 text-xs font-extrabold transition-all duration-200",
        "hover:scale-105 active:scale-95",
        "dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-100 dark:hover:bg-zinc-900/70",
        "border-gray-300 bg-gray-100 text-gray-900 hover:bg-gray-200",
      )}
      aria-label={
        theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
      }
    >
      {theme === "dark" ? "☀️ Claro" : "🌙 Oscuro"}
    </button>
  );
}

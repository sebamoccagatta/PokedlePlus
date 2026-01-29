import { useTheme } from "../hooks/useTheme";
import { cn } from "../utils/cn";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "", showLabel = false }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "group relative flex items-center justify-center rounded-2xl border-2 border-app bg-surface p-2.5 transition-all duration-300",
        "hover:border-indigo-400/50 hover:bg-surface-soft hover:scale-105 active:scale-95",
        className
      )}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Modo Claro" : "Modo Oscuro"}
    >
      <div className="relative h-5 w-5">
        <Sun 
          className={cn(
            "absolute inset-0 h-full w-full text-amber-500 transition-all duration-500",
            isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
          )} 
        />
        <Moon 
          className={cn(
            "absolute inset-0 h-full w-full text-indigo-400 transition-all duration-500",
            isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
          )} 
        />
      </div>
      {showLabel && (
        <span className="ml-2 text-xs font-extrabold uppercase tracking-wide">
          {isDark ? "Claro" : "Oscuro"}
        </span>
      )}
    </button>
  );
}

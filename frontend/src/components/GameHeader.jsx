import React from "react";
import { BarChart3 } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export default function GameHeader({ mode, dayKey, onChangeMode, onShowStats, t }) {
  return (
    <header className="mb-8 flex items-center justify-between">
      <div>
        <div className="text-3xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Pokedle+</div>
        <div className="text-sm text-muted mt-1">
          <span className="inline-flex items-center gap-2">
            <span className="font-semibold uppercase text-strong">{mode}</span>
            <span className="text-muted-2">•</span>
            <span className="text-muted-2">{dayKey}</span>
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <ThemeToggle className="p-3 border-2" />
        <button
          onClick={onShowStats}
          className="p-3 rounded-2xl border-2 border-app bg-surface hover:bg-surface-soft hover:border-indigo-400/50 transition-all hover:scale-105 active:scale-95"
          title={t("stats.title")}
        >
          <BarChart3 className="h-5 w-5 text-indigo-500" />
        </button>
        <button
          onClick={onChangeMode}
          className="hidden md:block rounded-2xl border-2 border-app bg-surface hover:bg-surface-soft hover:border-indigo-400/50 px-5 py-2.5 text-xs font-extrabold uppercase tracking-wide transition-all hover:scale-105 active:scale-95"
        >
          {t("game.change_mode")}
        </button>
      </div>
    </header>
  );
}

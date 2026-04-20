import React from "react";
import { BarChart3, ArrowLeft, Flame, Target } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export default function GameHeader({
  mode,
  dayKey,
  onChangeMode,
  onShowStats,
  t,
  missionCompleted,
  missionTotal,
  missionProgressPct,
  globalStreak,
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <div className="text-3xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Pokedle+</div>
        <div className="text-sm text-muted mt-1">
          <span className="inline-flex items-center gap-2">
            <span className="font-semibold uppercase text-strong">{mode}</span>
            <span className="text-muted-2">•</span>
            <span className="text-muted-2">{dayKey}</span>
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-app bg-surface-soft px-3 py-1 text-[11px] font-semibold text-muted">
            <Target className="h-3.5 w-3.5" aria-hidden="true" />
            {t("game.daily_loop.progress_compact")}
            <span className="font-bold text-strong">
              {missionCompleted}/{missionTotal}
            </span>
            <span className="text-muted-2">· {missionProgressPct}%</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-app bg-surface-soft px-3 py-1 text-[11px] font-semibold text-muted">
            <Flame className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
            {t("game.daily_loop.streak_compact")}
            <span className="font-bold text-strong">{globalStreak}</span>
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
          className="md:hidden p-3 rounded-2xl border-2 border-app bg-surface hover:bg-surface-soft hover:border-indigo-400/50 transition-all hover:scale-105 active:scale-95"
          title={t("game.change_mode")}
        >
          <ArrowLeft className="h-5 w-5 text-strong" />
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

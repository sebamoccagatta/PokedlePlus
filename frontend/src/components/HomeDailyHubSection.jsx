import React from "react";
import { Flame, Trophy } from "lucide-react";

export function HomeDailyHubSection({ t, streakSummary, missionProgress }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      <div className="rounded-2xl border border-app bg-surface-soft p-4">
        <div className="flex items-center gap-2 text-sm text-muted mb-1">
          <Flame className="h-4 w-4" aria-hidden="true" />
          {t("home.hero.current_streak")}
        </div>
        <div className="text-3xl font-black text-strong">{streakSummary.current}</div>
      </div>

      <div className="rounded-2xl border border-app bg-surface-soft p-4">
        <div className="flex items-center gap-2 text-sm text-muted mb-1">
          <Trophy className="h-4 w-4" aria-hidden="true" />
          {t("home.hero.best_streak")}
        </div>
        <div className="text-3xl font-black text-strong">{streakSummary.best}</div>
      </div>

      <div className="rounded-2xl border border-app bg-surface-soft p-4 sm:col-span-2 lg:col-span-1 xl:col-span-2">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted">{t("home.hero.daily_progress")}</span>
          <span className="font-semibold text-strong">
            {missionProgress.completed}/{missionProgress.total} · {missionProgress.pct}%
          </span>
        </div>
        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-200/60 dark:bg-zinc-800/70"
          role="progressbar"
          aria-label={t("home.hero.daily_progress")}
          aria-valuemin={0}
          aria-valuemax={missionProgress.total}
          aria-valuenow={missionProgress.completed}
        >
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${missionProgress.pct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted">{t("home.hero.progress_hint")}</p>
      </div>
    </div>
  );
}

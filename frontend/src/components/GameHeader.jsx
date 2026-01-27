import React from "react";
import { BarChart3 } from "lucide-react";

export default function GameHeader({ mode, dayKey, onChangeMode, onShowStats, t }) {
  return (
    <header className="mb-8 flex items-center justify-between">
      <div>
        <div className="text-2xl font-black tracking-tight">Pokedle+</div>
        <div className="text-sm text-muted">
          {t("game.mode")} <span className="font-semibold uppercase">{mode}</span> •{" "}
          {dayKey}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onShowStats}
          className="p-2.5 rounded-2xl border btn-surface transition-colors"
          title={t("stats.title")}
        >
          <BarChart3 className="h-5 w-5" />
        </button>
        <button
          onClick={onChangeMode}
          className="rounded-2xl border px-4 py-2.5 text-xs font-extrabold btn-surface transition-colors"
        >
          {t("game.change_mode")}
        </button>
      </div>
    </header>
  );
}

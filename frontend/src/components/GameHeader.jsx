import React from "react";

export default function GameHeader({ mode, dayKey, onChangeMode, t }) {
  return (
    <header className="mb-8 flex items-center justify-between">
      <div>
        <div className="text-2xl font-black tracking-tight">Pokedle+</div>
        <div className="text-sm text-muted">
          {t("game.mode")} <span className="font-semibold">{mode}</span> •{" "}
          {dayKey}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onChangeMode}
          className="rounded-2xl border px-4 py-2 text-xs font-extrabold btn-surface transition-colors"
        >
          {t("game.change_mode")}
        </button>
      </div>
    </header>
  );
}

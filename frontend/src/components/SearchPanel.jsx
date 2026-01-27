import React from "react";
import ComboList from "./ComboList.jsx";
import { Toast } from "./Toast.jsx";

const MAX_ATTEMPTS = 15;

export default function SearchPanel({
  q,
  selected,
  results = [],
  hasMore,
  loadingMore,
  busy,
  finished,
  attemptsCount = 0,
  error,
  onErrorClose,
  translateHint,
  t,
  handleQueryChange,
  handlePick,
  handleTry,
  handleScrollBottom,
}) {
  void translateHint;
  return (
    <div className="rounded-[32px] border border-app bg-surface p-8 shadow-card">
      <div>
        <div className="text-sm font-bold text-strong mb-4">
          {t("game.guess_title")}
        </div>
        <div className="flex gap-3">
          <input
            value={q}
            onChange={handleQueryChange}
            placeholder={t("game.search_placeholder")}
            className="flex-1 rounded-2xl border input-surface px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-zinc-500"
          />
          <button
            onClick={handleTry}
            disabled={!selected || busy || finished}
            className="rounded-2xl border px-8 py-3 text-sm font-extrabold btn-surface transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            {t("game.try")}
          </button>
        </div>

        <div className="mt-4 space-y-1">
          <div className="text-xs text-muted">{t("game.tip")}</div>
          <div className="text-xs text-muted">
            {t("game.attempts_label")} {attemptsCount}/{MAX_ATTEMPTS}
          </div>
        </div>

        {results.length > 0 && (
          <div className="mt-6 border-t border-app pt-6">
            <ComboList
              items={results}
              onPick={handlePick}
              disabled={busy || finished}
              onScrollBottom={handleScrollBottom}
              loadingMore={loadingMore}
              hasMore={hasMore}
              t={t}
            />
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4">
          <Toast
            kind="error"
            title={t("game.error_title")}
            onClose={onErrorClose}
          >
            {error}
          </Toast>
        </div>
      )}
    </div>
  );
}

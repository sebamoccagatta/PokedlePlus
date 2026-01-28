import React from "react";
import ComboList from "./ComboList.jsx";
import { Toast } from "./Toast.jsx";
import { Share2 } from "lucide-react";

const MAX_ATTEMPTS = 15;

export default function SearchPanel({
  q,
  selected,
  results = [],
  hasMore,
  loadingMore,
  searching,
  busy,
  finished,
  attemptsCount = 0,
  error,
  onErrorClose,
  onShare,
  t,
  handleQueryChange,
  handlePick,
  handleTry,
  handleScrollBottom,
}) {
  return (
    <div className="rounded-[32px] border border-app bg-surface p-8 shadow-card">
      <div>
        <div className="text-sm font-bold text-strong mb-4">
          {finished ? t("game.win_title") : t("game.guess_title")}
        </div>
        <div className="flex gap-3">
          <input
            value={q}
            onChange={handleQueryChange}
            disabled={finished}
            placeholder={finished ? t("game.win_message") : t("game.search_placeholder")}
            className="flex-1 rounded-2xl border input-surface px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-zinc-500 disabled:opacity-50"
          />
          {finished ? (
            <button
              onClick={onShare}
              className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
            >
              <Share2 className="h-4 w-4" />
              {t("game.share")}
            </button>
          ) : (
            <button
              onClick={handleTry}
              disabled={!selected || busy || finished}
              className="rounded-2xl border px-8 py-3 text-sm font-extrabold btn-surface transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              {t("game.try")}
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-muted">
              {finished ? t("game.win_message") : t("game.tip")}
            </div>
            <div className="text-xs text-muted">
              {t("game.attempts_label")} {attemptsCount}/{MAX_ATTEMPTS}
            </div>
          </div>
        </div>

        {(results.length > 0 || searching) && (
          <div className="mt-6 border-t border-app pt-6">
            <ComboList
              items={results}
              onPick={handlePick}
              disabled={busy || finished}
              onScrollBottom={handleScrollBottom}
              loadingMore={loadingMore}
              searching={searching}
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

import React from "react";
import ComboList from "./ComboList.jsx";
import { Toast } from "./Toast.jsx";
import { Share2 } from "lucide-react";
import { LoadingSpinner } from "./Skeleton.jsx";

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
  onReset,
  mode,
}) {
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Focus search with '/' if not typing in an input
      if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      
      // Close error with Escape
      if (e.key === "Escape" && error) {
        onErrorClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [error, onErrorClose]);

  return (
    <div className="rounded-[32px] border border-app bg-surface p-6 md:p-8 shadow-card">
      <div>
        <div className="text-sm font-bold text-strong mb-4">
          {finished ? t("game.win_title") : t("game.guess_title")}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            ref={inputRef}
            value={q}
            onChange={handleQueryChange}
            disabled={finished}
            placeholder={finished ? t("game.win_message") : t("game.search_placeholder")}
            className="w-full sm:flex-1 rounded-2xl border-2 input-surface px-5 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 disabled:opacity-50 transition-all placeholder:text-muted-2"
          />
          {finished && (
            <button
              onClick={onShare}
              className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 w-full sm:w-auto"
            >
              <Share2 className="h-4 w-4" />
              {t("game.share")}
            </button>
          )}

          {finished && mode === "infinite" && (
            <button
              onClick={onReset}
              className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20 w-full sm:w-auto"
            >
              {t("game.new_game")}
            </button>
          )}

          {!finished && (
            <button
              onClick={handleTry}
              disabled={!selected || busy}
              className="rounded-2xl border-2 border-b-[3px] border-indigo-500 bg-indigo-500 px-8 py-3.5 text-sm font-extrabold text-white hover:bg-indigo-600 hover:border-indigo-600 transition-all disabled:opacity-50 disabled:pointer-events-none w-full sm:w-auto active:translate-y-[2px] active:border-b-2 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 min-w-[100px]"
            >
              {busy ? <LoadingSpinner size="sm" className="text-white" /> : t("game.try")}
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
            <div className="text-[10px] text-muted-2 hidden md:block">
              {t("game.keyboard_tip")}
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

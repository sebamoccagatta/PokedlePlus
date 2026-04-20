import React from "react";
import ComboList from "./ComboList.jsx";
import { Toast } from "./Toast.jsx";
import {
  Share2,
  CircleDashed,
  Trophy,
  CircleOff,
  Sparkles,
  Lightbulb,
  Gauge,
  AlertTriangle,
} from "lucide-react";
import { LoadingSpinner } from "./Skeleton.jsx";
import { MAX_ATTEMPTS } from "../constants/game.js";

export default function SearchPanel({
  q,
  selected,
  results = [],
  hasMore,
  loadingMore,
  searching,
  busy,
  finished,
  won = false,
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
  const status = won ? "won" : finished ? "lost" : "inProgress";
  const attemptsSafe = Math.min(attemptsCount, MAX_ATTEMPTS);
  const attemptsLeft = Math.max(MAX_ATTEMPTS - attemptsSafe, 0);
  const progressPct = Math.round((attemptsSafe / MAX_ATTEMPTS) * 100);

  const statusConfig = {
    inProgress: {
      label: t("game.progress_status_in_progress"),
      icon: CircleDashed,
      chip: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
      bar: "bg-indigo-500",
    },
    won: {
      label: t("game.progress_status_won"),
      icon: Trophy,
      chip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
      bar: "bg-emerald-500",
    },
    lost: {
      label: t("game.progress_status_lost"),
      icon: CircleOff,
      chip: "border-rose-500/30 bg-rose-500/10 text-rose-300",
      bar: "bg-rose-500",
    },
  };

  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  const hintRail = React.useMemo(() => {
    if (finished && won) {
      return {
        title: t("game.hint_rail.won_title"),
        message: t("game.hint_rail.won_message"),
        Icon: Trophy,
        tone: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
      };
    }

    if (finished) {
      return {
        title: t("game.hint_rail.lost_title"),
        message: t("game.hint_rail.lost_message"),
        Icon: CircleOff,
        tone: "border-rose-500/30 bg-rose-500/10 text-rose-200",
      };
    }

    if (attemptsSafe === 0) {
      return {
        title: t("game.hint_rail.no_attempts_title"),
        message: t("game.hint_rail.no_attempts_message"),
        Icon: Lightbulb,
        tone: "border-indigo-500/30 bg-indigo-500/10 text-indigo-200",
      };
    }

    if (attemptsSafe <= 2) {
      return {
        title: t("game.hint_rail.early_title"),
        message: t("game.hint_rail.early_message"),
        Icon: Gauge,
        tone: "border-sky-500/30 bg-sky-500/10 text-sky-200",
      };
    }

    if (attemptsLeft <= 2) {
      return {
        title: t("game.hint_rail.near_limit_title"),
        message: t("game.hint_rail.near_limit_message"),
        Icon: AlertTriangle,
        tone: "border-amber-500/30 bg-amber-500/10 text-amber-200",
      };
    }

    return {
      title: t("game.hint_rail.mid_title"),
      message: t("game.hint_rail.mid_message"),
      Icon: CircleDashed,
      tone: "border-violet-500/30 bg-violet-500/10 text-violet-200",
    };
  }, [attemptsLeft, attemptsSafe, finished, t, won]);

  const HintIcon = hintRail.Icon;

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
    <div className={`rounded-[32px] border border-app bg-surface p-6 md:p-8 shadow-card transition-all ${error ? "animate-shake border-rose-500/50" : ""}`}>
      <div>
        <div className="mb-5 rounded-2xl border border-app bg-surface-soft p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted">
                {t("game.progress_title")}
              </p>
              <p className="text-sm text-muted">
                {t("game.progress_attempts_used")} {attemptsSafe}/{MAX_ATTEMPTS} · {attemptsLeft} {t("game.progress_remaining")}
              </p>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${currentStatus.chip}`}>
              <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {currentStatus.label}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full border border-app bg-surface">
            <div
              className={`h-full rounded-full transition-all duration-300 ${currentStatus.bar}`}
              style={{ width: `${Math.max(progressPct, status === "won" ? 100 : 6)}%` }}
            />
          </div>
        </div>

        <div className="text-sm font-bold text-strong mb-4">
          {finished ? t("game.win_title") : t("game.guess_title")}
        </div>
        <div className="rounded-2xl border border-app bg-surface-soft p-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1">
            <label htmlFor="pokemon-search" className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              {t("game.search_title")}
            </label>
            <span className="inline-flex items-center gap-1 text-xs text-muted">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {selected ? `${t("game.selected_label_short")} ${selected.name}` : t("game.selected_empty")}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="pokemon-search"
              ref={inputRef}
              value={q}
              onChange={handleQueryChange}
              disabled={finished}
              placeholder={finished ? t("game.win_message") : t("game.search_placeholder")}
              className="w-full sm:flex-1 rounded-2xl border-2 input-surface px-5 py-4 text-base font-semibold outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 disabled:opacity-50 transition-all placeholder:text-muted-2"
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
              className="rounded-2xl border-2 border-b-[3px] border-indigo-500 bg-indigo-500 px-8 py-4 text-sm font-extrabold text-white hover:bg-indigo-600 hover:border-indigo-600 transition-all disabled:opacity-50 disabled:pointer-events-none w-full sm:w-auto active:translate-y-[2px] active:border-b-2 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 min-w-[140px]"
            >
              {busy ? (
                <>
                  <LoadingSpinner size="sm" className="text-white" />
                  {t("game.try_busy")}
                </>
              ) : !selected ? t("game.try_pick_first") : t("game.try")}
            </button>
          )}
          </div>
        </div>

        <div
          className={`mt-4 rounded-2xl border px-4 py-3 ${hintRail.tone}`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <HintIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.14em]">
                {t("game.hint_rail.title")}
              </p>
              <p className="mt-0.5 text-sm font-bold">{hintRail.title}</p>
              <p className="mt-0.5 text-xs opacity-90">{hintRail.message}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-muted">
              {finished ? t("game.win_message") : selected ? t("game.try_ready_hint") : t("game.tip")}
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

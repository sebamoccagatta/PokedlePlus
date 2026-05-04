import React, { useEffect, useMemo, useState } from "react";
import { apiGuess, apiMeta } from "../api.js";
import { usePokemonSearch } from "../hooks/usePokemonSearch.js";
import ComboList from "./ComboList.jsx";

const SILHOUETTE_MODE_ID = "silhouette";
const MAX_STAGES = 5;

function storageKey(dayKey) {
  return `pokedleplus:v1:${dayKey}:${SILHOUETTE_MODE_ID}`;
}

function readState(dayKey) {
  if (!dayKey) return { dayKey: "", attempts: [], stage: 1, finished: false, won: false };
  try {
    const raw = localStorage.getItem(storageKey(dayKey));
    if (!raw) return { dayKey, attempts: [], stage: 1, finished: false, won: false };
    const parsed = JSON.parse(raw);
    const attempts = Array.isArray(parsed?.attempts) ? parsed.attempts : [];
    const won = Boolean(parsed?.won);
    const finished = Boolean(parsed?.finished);
    const stage = Math.min(MAX_STAGES, Math.max(1, Number(parsed?.stage) || 1));
    return { dayKey, attempts, stage, finished, won };
  } catch {
    return { dayKey, attempts: [], stage: 1, finished: false, won: false };
  }
}

function writeState(next) {
  if (!next?.dayKey) return;
  localStorage.setItem(storageKey(next.dayKey), JSON.stringify(next));
}

export default function SilhouetteGame({ t, addToast, onBackHome }) {
  const [dayKey, setDayKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [state, setState] = useState({ dayKey: "", attempts: [], stage: 1, finished: false, won: false });

  const { q, selected, results, hasMore, loadingMore, searching, handleQueryChange, handlePick, handleScrollBottom } =
    usePokemonSearch("classic", t, setError);

  useEffect(() => {
    let mounted = true;
    apiMeta("classic")
      .then((meta) => {
        if (!mounted) return;
        const key = meta?.dayKey || "";
        setDayKey(key);
        setState(readState(key));
      })
      .catch(() => {
        if (!mounted) return;
        setError(t("silhouette.error_meta"));
      });

    return () => {
      mounted = false;
    };
  }, [t]);

  const canTry = selected && !busy && !state.finished;

  const onTry = async () => {
    if (!selected || !dayKey) return;
    if (state.finished) return;
    if (state.attempts.some((attempt) => attempt.id === selected.id)) {
      addToast({ kind: "info", title: t("silhouette.already_tried_title"), message: t("silhouette.already_tried_message") });
      return;
    }

    setBusy(true);
    setError("");
    try {
      const guess = await apiGuess(selected.id, dayKey, "classic");
      const isCorrect = Boolean(guess?.comparison?.isCorrect);
      const nextAttempts = [...state.attempts, { id: selected.id, name: selected.name, isCorrect }];
      const nextStage = isCorrect ? state.stage : Math.min(MAX_STAGES, state.stage + 1);
      const isLose = !isCorrect && nextStage >= MAX_STAGES;
      const next = {
        dayKey,
        attempts: nextAttempts,
        stage: nextStage,
        finished: isCorrect || isLose,
        won: isCorrect,
      };
      setState(next);
      writeState(next);

      if (isCorrect) {
        addToast({ kind: "success", title: t("silhouette.win_title"), message: t("silhouette.win_message") });
      } else if (isLose) {
        addToast({ kind: "warning", title: t("silhouette.lose_title"), message: t("silhouette.lose_message") });
      } else {
        addToast({ kind: "info", title: t("silhouette.next_stage_title"), message: t("silhouette.next_stage_message") });
      }
    } catch (e) {
      setError(t("silhouette.error_try"));
    } finally {
      setBusy(false);
    }
  };

  const overlayOpacity = useMemo(() => {
    const ratio = (state.stage - 1) / (MAX_STAGES - 1);
    return Math.max(0.15, 0.82 - ratio * 0.62);
  }, [state.stage]);

  return (
    <div className="min-h-screen bg-app text-app">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <button onClick={onBackHome} className="mb-4 text-sm text-indigo-300 hover:text-indigo-200">← {t("silhouette.back_home")}</button>
        <div className="rounded-3xl border border-app bg-surface p-6 shadow-card">
          <h2 className="text-2xl font-black text-strong mb-2">{t("silhouette.title")}</h2>
          <p className="text-sm text-muted mb-5">{t("silhouette.subtitle")}</p>

          <div className="mb-5 rounded-2xl border border-app bg-surface-soft p-5">
            <div className="mb-3 text-xs uppercase tracking-[0.14em] text-muted">{t("silhouette.stage_label")} {state.stage}/{MAX_STAGES}</div>
            <div className="relative mx-auto h-44 w-full max-w-md overflow-hidden rounded-2xl border border-app bg-gradient-to-br from-zinc-700 via-zinc-800 to-black">
              <div className="absolute inset-0 flex items-center justify-center text-7xl">👤</div>
              <div className="absolute inset-0 bg-black transition-opacity duration-300" style={{ opacity: overlayOpacity }} />
            </div>
          </div>

          <div className="rounded-2xl border border-app bg-surface-soft p-4">
            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted mb-2">{t("silhouette.input_label")}</label>
            <input
              value={q}
              disabled={state.finished}
              onChange={(event) => handleQueryChange(event.target.value)}
              placeholder={t("silhouette.input_placeholder")}
              className="w-full rounded-xl border border-app bg-surface px-3 py-2 text-sm"
            />

            {results.length > 0 && (
              <ComboList
                items={results}
                onPick={handlePick}
                onScrollBottom={handleScrollBottom}
                loadingMore={loadingMore}
                searching={searching}
                hasMore={hasMore}
                disabled={state.finished}
                t={t}
              />
            )}

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className="text-sm text-muted">{t("silhouette.selected")} <span className="font-semibold text-strong">{selected?.name || t("silhouette.selected_empty")}</span></p>
              <button
                onClick={onTry}
                disabled={!canTry}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                {busy ? t("silhouette.try_busy") : t("silhouette.try")}
              </button>
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}

          {state.finished && (
            <p className={`mt-4 text-sm font-semibold ${state.won ? "text-emerald-300" : "text-rose-300"}`}>
              {state.won ? t("silhouette.result_won") : t("silhouette.result_lost")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

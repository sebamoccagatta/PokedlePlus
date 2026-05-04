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
  if (!dayKey) return { dayKey: "", attempts: [], stage: 1, finished: false, won: false, target: null, finishedReason: null };
  try {
    const raw = localStorage.getItem(storageKey(dayKey));
    if (!raw) return { dayKey, attempts: [], stage: 1, finished: false, won: false, target: null, finishedReason: null };
    const parsed = JSON.parse(raw);
    const attempts = Array.isArray(parsed?.attempts) ? parsed.attempts : [];
    const won = Boolean(parsed?.won);
    const finished = Boolean(parsed?.finished);
    const stage = Math.min(MAX_STAGES, Math.max(1, Number(parsed?.stage) || 1));
    const target = parsed?.target && typeof parsed.target === "object"
      ? {
          id: Number(parsed.target.id) || null,
          name: String(parsed.target.name || ""),
          sprite: typeof parsed.target.sprite === "string" ? parsed.target.sprite : "",
        }
      : null;
    const finishedReason = typeof parsed?.finishedReason === "string" ? parsed.finishedReason : null;
    return { dayKey, attempts, stage, finished, won, target, finishedReason };
  } catch {
    return { dayKey, attempts: [], stage: 1, finished: false, won: false, target: null, finishedReason: null };
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
  const [state, setState] = useState({ dayKey: "", attempts: [], stage: 1, finished: false, won: false, target: null, finishedReason: null });

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
      const target = guess?.target && typeof guess.target === "object"
        ? {
            id: Number(guess.target.id) || null,
            name: String(guess.target.name || ""),
            sprite: typeof guess.target.sprite === "string" ? guess.target.sprite : "",
          }
        : null;
      const nextAttempts = [...state.attempts, { id: selected.id, name: selected.name, isCorrect }];
      const nextStage = isCorrect ? state.stage : Math.min(MAX_STAGES, state.stage + 1);
      const isLose = !isCorrect && nextStage >= MAX_STAGES;
      const next = {
        dayKey,
        attempts: nextAttempts,
        stage: nextStage,
        finished: isCorrect || isLose,
        won: isCorrect,
        target,
        finishedReason: isCorrect ? "won" : isLose ? "lost" : null,
      };
      setState(next);
      writeState(next);

      if (isCorrect) {
        addToast({ kind: "success", title: t("silhouette.win_title"), message: t("silhouette.win_message") });
      } else if (isLose) {
        addToast({
          kind: "warning",
          title: t("silhouette.lose_title"),
          message: target?.name
            ? `${t("silhouette.lose_message_reveal_prefix")} ${target.name}`
            : t("silhouette.lose_message"),
        });
      } else {
        addToast({
          kind: "info",
          title: t("silhouette.next_stage_title"),
          message: `${t("silhouette.next_stage_message")} ${nextStage}/${MAX_STAGES}.`,
        });
      }
    } catch (e) {
      setError(t("silhouette.error_try"));
    } finally {
      setBusy(false);
    }
  };

  const overlayOpacity = useMemo(() => {
    const ratio = (state.stage - 1) / (MAX_STAGES - 1);
    return Math.max(0.08, 0.9 - ratio * 0.82);
  }, [state.stage]);

  const silhouetteScale = useMemo(() => {
    const ratio = (state.stage - 1) / (MAX_STAGES - 1);
    return 1.12 - ratio * 0.1;
  }, [state.stage]);

  const stageDescriptors = useMemo(() => [
    t("silhouette.stage_hint_1"),
    t("silhouette.stage_hint_2"),
    t("silhouette.stage_hint_3"),
    t("silhouette.stage_hint_4"),
    t("silhouette.stage_hint_5"),
  ], [t]);

  return (
    <div className="min-h-screen bg-app text-app">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <button onClick={onBackHome} className="mb-4 text-sm text-indigo-300 hover:text-indigo-200">← {t("silhouette.back_home")}</button>
        <div className="rounded-3xl border border-app bg-surface p-6 shadow-card">
          <h2 className="text-2xl font-black text-strong mb-2">{t("silhouette.title")}</h2>
          <p className="text-sm text-muted mb-5">{t("silhouette.subtitle")}</p>

          <div className="mb-5 rounded-2xl border border-app bg-surface-soft p-5">
            <div className="mb-2 text-xs uppercase tracking-[0.14em] text-muted">{t("silhouette.stage_label")} {state.stage}/{MAX_STAGES}</div>
            <div className="mb-3 flex flex-wrap gap-2">
              {Array.from({ length: MAX_STAGES }, (_, idx) => {
                const number = idx + 1;
                const active = number === state.stage;
                const unlocked = number <= state.stage;
                return (
                  <span
                    key={number}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${active ? "border-indigo-300 bg-indigo-500/20 text-indigo-100" : unlocked ? "border-indigo-400/50 bg-indigo-500/10 text-indigo-200" : "border-app text-muted"}`}
                  >
                    {t("silhouette.stage_chip")} {number}
                  </span>
                );
              })}
            </div>
            <p className="mb-3 text-xs text-muted">{stageDescriptors[state.stage - 1]}</p>
            <div className="relative mx-auto h-44 w-full max-w-md overflow-hidden rounded-2xl border border-app bg-gradient-to-br from-zinc-700 via-zinc-800 to-black">
              <div className="absolute inset-0 flex items-center justify-center text-7xl transition-transform duration-300" style={{ transform: `scale(${silhouetteScale})` }}>👤</div>
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
            <div className={`mt-4 rounded-2xl border p-4 ${state.won ? "border-emerald-400/30 bg-emerald-500/10" : "border-rose-400/30 bg-rose-500/10"}`}>
              <p className={`text-sm font-semibold ${state.won ? "text-emerald-300" : "text-rose-300"}`}>
                {state.won ? t("silhouette.result_won") : t("silhouette.result_lost")}
              </p>
              {!state.won && state.finishedReason === "lost" && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-16 w-16 overflow-hidden rounded-xl border border-app bg-black/20 p-1">
                    {state.target?.sprite ? (
                      <img
                        src={state.target.sprite}
                        alt={state.target?.name || t("silhouette.reveal_unknown")}
                        loading="lazy"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg">❔</div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted">{t("silhouette.reveal_label")}</p>
                    <p className="text-base font-black text-strong">
                      {state.target?.name || t("silhouette.reveal_unknown")}
                    </p>
                    {!state.target?.sprite && (
                      <p className="text-xs text-muted">{t("silhouette.reveal_no_image")}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

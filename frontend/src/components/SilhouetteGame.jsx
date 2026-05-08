import React, { useEffect, useMemo, useState } from "react";
import { apiGuess, apiMeta, apiSilhouetteTarget } from "../api.js";
import { usePokemonSearch } from "../hooks/usePokemonSearch.js";
import ComboList from "./ComboList.jsx";

const SILHOUETTE_MODE_ID = "silhouette";
const MAX_STAGES = 5;

const STAGE_VISUALS = {
  1: { filter: "brightness(0.08) contrast(1.55) blur(12px)", overlayOpacity: 0.72, scale: 1.08 },
  2: { filter: "brightness(0.12) contrast(1.45) blur(9px)", overlayOpacity: 0.62, scale: 1.06 },
  3: { filter: "brightness(0.2) contrast(1.32) blur(6px)", overlayOpacity: 0.48, scale: 1.04 },
  4: { filter: "brightness(0.3) contrast(1.2) blur(4px)", overlayOpacity: 0.36, scale: 1.02 },
  5: { filter: "brightness(0.8) contrast(1.05) blur(1px)", overlayOpacity: 0.08, scale: 1 },
};

const FINISHED_VISUAL = { filter: "none", overlayOpacity: 0, scale: 1 };

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

function normalizeTarget(rawTarget) {
  if (!rawTarget || typeof rawTarget !== "object") return null;
  return {
    id: Number(rawTarget.id) || null,
    name: String(rawTarget.name || ""),
    sprite: typeof rawTarget.sprite === "string" ? rawTarget.sprite : "",
  };
}

export default function SilhouetteGame({ t, addToast, onBackHome, onChooseMode }) {
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
        const persistedState = readState(key);
        setDayKey(key);
        setState(persistedState);

        if (!persistedState?.target?.sprite) {
          apiSilhouetteTarget(key, "classic")
            .then((data) => {
              if (!mounted) return;
              const hydratedTarget = normalizeTarget(data?.target);
              if (!hydratedTarget?.sprite) return;
              setState((prev) => {
                if (prev.dayKey !== key || prev?.target?.sprite) return prev;
                const next = { ...prev, target: hydratedTarget };
                writeState(next);
                return next;
              });
            })
            .catch(() => {});
        }
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
      const target = normalizeTarget(guess?.target);
      const nextAttempts = [
        ...state.attempts,
        {
          id: selected.id,
          name: selected.name,
          isCorrect,
          sprite: typeof selected?.sprite === "string" ? selected.sprite : "",
        },
      ];
      const nextStage = isCorrect ? state.stage : Math.min(MAX_STAGES, state.stage + 1);
      const isLose = !isCorrect && nextAttempts.length >= MAX_STAGES;
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

  const stageVisual = useMemo(() => {
    if (state.finished) return FINISHED_VISUAL;
    return STAGE_VISUALS[state.stage] ?? STAGE_VISUALS[1];
  }, [state.finished, state.stage]);

  const stageDescriptors = useMemo(() => [
    t("silhouette.stage_hint_1"),
    t("silhouette.stage_hint_2"),
    t("silhouette.stage_hint_3"),
    t("silhouette.stage_hint_4"),
    t("silhouette.stage_hint_5"),
  ], [t]);

  const handleChooseMode = () => {
    if (typeof onChooseMode === "function") {
      onChooseMode();
      return;
    }
    onBackHome();
  };

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
              {state.target?.sprite ? (
                <img
                  src={state.target.sprite}
                  alt={state.target?.name || t("silhouette.reveal_unknown")}
                  className={`absolute inset-0 h-full w-full object-contain p-4 transition-all ${state.finished ? "duration-[420ms] ease-out" : "duration-300"}`}
                  style={{
                    filter: stageVisual.filter,
                    transform: `scale(${stageVisual.scale})`,
                  }}
                />
              ) : (
                <div className={`absolute inset-0 flex items-center justify-center text-7xl transition-transform ${state.finished ? "duration-[420ms] ease-out" : "duration-300"}`} style={{ transform: `scale(${stageVisual.scale})` }}>❔</div>
              )}
              <div className={`absolute inset-0 bg-black transition-opacity ${state.finished ? "duration-[420ms] ease-out" : "duration-300"}`} style={{ opacity: stageVisual.overlayOpacity }} />
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

          <div className="mt-4 rounded-2xl border border-app bg-surface-soft p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-muted">{t("silhouette.attempts_title")}</h3>
              <span className="text-xs text-muted">{state.attempts.length} / {MAX_STAGES}</span>
            </div>

            {state.attempts.length === 0 ? (
              <p className="text-sm text-muted">{t("silhouette.attempts_empty")}</p>
            ) : (
              <ul className="space-y-2">
                {state.attempts.map((attempt, index) => (
                  <li
                    key={`${attempt.id}-${index}`}
                    className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 ${attempt.isCorrect ? "border-emerald-400/50 bg-emerald-500/10" : "border-app bg-surface"}`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="w-10 shrink-0 text-[11px] font-bold uppercase tracking-wide text-muted">#{index + 1}</span>
                      {attempt.sprite ? (
                        <img
                          src={attempt.sprite}
                          alt={attempt.name}
                          loading="lazy"
                          className="h-8 w-8 shrink-0 rounded-lg border border-app bg-black/20 object-contain p-0.5"
                        />
                      ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-app bg-black/20 text-sm">❔</div>
                      )}
                      <span className="truncate text-sm font-semibold text-strong">{attempt.name || t("silhouette.reveal_unknown")}</span>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${attempt.isCorrect ? "bg-emerald-500/20 text-emerald-300" : "bg-zinc-500/20 text-zinc-300"}`}
                    >
                      {attempt.isCorrect ? t("silhouette.attempt_correct") : t("silhouette.attempt_miss")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
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

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={onBackHome}
                  className="rounded-xl border border-app bg-surface px-3 py-2 text-sm font-semibold text-strong hover:bg-surface-soft"
                >
                  {t("silhouette.cta_home")}
                </button>
                <button
                  onClick={handleChooseMode}
                  className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  {t("silhouette.cta_mode")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

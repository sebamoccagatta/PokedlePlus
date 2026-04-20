import React, { useEffect, useMemo, useState } from "react";
import { arrow } from "./ui.js";
import { useTheme } from "./hooks/useTheme.js";
import { useSearchCache } from "./hooks/useSearchCache.js";
import { useToast } from "./hooks/useToast.js";
import { useI18n } from "./hooks/useI18n.js";
import { useGameState } from "./hooks/useGameState.js";
import { usePokemonSearch } from "./hooks/usePokemonSearch.js";
import { useStats } from "./hooks/useStats.js";
import { useLocalMetrics } from "./hooks/useLocalMetrics.js";
import { generateShareText, shareResults } from "./utils/share.js";
import { trackLocalMetricEvent } from "./utils/localMetrics.js";
import { apiMeta } from "./api.js";
import {
  DAILY_MODE_IDS,
  computeGlobalStreak,
  computeMissionProgress,
  computeStatusesByMode,
  getRecommendedMode,
} from "./utils/dailyMission.js";

import GameHeader from "./components/GameHeader.jsx";
import SearchPanel from "./components/SearchPanel.jsx";
import AttemptsTable from "./components/AttemptsTable.jsx";
import { ToastContainer } from "./components/Toast.jsx";
import { Home } from "./components/Home.jsx";
import StatsModal from "./components/StatsModal.jsx";

function formatHeight(dm) {
  const m = (Number(dm || 0) / 10).toFixed(1);
  return `${m} m`;
}
function formatWeight(hg) {
  const kg = (Number(hg || 0) / 10).toFixed(1);
  return `${kg} kg`;
}

export default function App() {
  const i18n = useI18n();
  const { t } = i18n;
  const { isDark } = useTheme();
  const { clear: clearCache } = useSearchCache();
  const { toasts, addToast, removeToast, clearToasts } = useToast();
  const [showStats, setShowStats] = useState(false);
  const [dailyReferenceDayKey, setDailyReferenceDayKey] = useState("");
  const [lastMode, setLastMode] = useState(
    () => localStorage.getItem("pokedleplus:lastMode") || "classic"
  );

  const {
    mode,
    dayKey,
    state,
    busy,
    error,
    setError,
    canReveal,
    changeMode,
    handleTryWithItem,
    nextInfinite,
  } = useGameState(t, addToast, clearToasts);

  const { stats, recordGame } = useStats(mode);
  const { localMetrics, recentMetricEvents } = useLocalMetrics();

  useEffect(() => {
    if (state.finished && dayKey) {
      recordGame(dayKey, state.won, state.attempts.length);
    }
  }, [state.finished, state.won, state.attempts.length, dayKey, recordGame]);

  const {
    q,
    results,
    selected,
    hasMore,
    loadingMore,
    searching,
    handleQueryChange,
    handlePick,
    handleScrollBottom,
  } = usePokemonSearch(mode, t, setError, clearCache);

  useEffect(() => {
    if (!mode) return;
    fetch(`/api/search?q=a&offset=0&mode=${encodeURIComponent(mode)}`).catch(() => {});
  }, [mode]);

  useEffect(() => {
    let mounted = true;
    apiMeta("classic")
      .then((meta) => {
        if (!mounted) return;
        setDailyReferenceDayKey(meta?.dayKey || "");
      })
      .catch(() => {
        if (!mounted) return;
        setDailyReferenceDayKey("");
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const onStorage = () => {
      setLastMode(localStorage.getItem("pokedleplus:lastMode") || "classic");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const onPickPokemon = async (item) => {
    handlePick(item);
    await handleTryWithItem(item);
  };

  const missionDayKey = mode === "infinite" ? dailyReferenceDayKey : dayKey;

  const missionStatusByMode = useMemo(
    () => computeStatusesByMode(missionDayKey, DAILY_MODE_IDS),
    [missionDayKey, state.attempts.length, state.finished, state.won]
  );

  const missionProgress = useMemo(
    () => computeMissionProgress(missionStatusByMode, DAILY_MODE_IDS),
    [missionStatusByMode]
  );

  const globalStreak = useMemo(
    () => computeGlobalStreak(DAILY_MODE_IDS),
    [state.finished, mode, dayKey]
  );

  const postGameAction = useMemo(() => {
    if (!state.finished || mode === "infinite") return null;

    const recommendation = getRecommendedMode(missionStatusByMode, lastMode, DAILY_MODE_IDS);
    const recommendedModeTitle = t(`home.modes.${recommendation.modeId}.title`);

    if (recommendation.intent === "continue") {
      return {
        type: "next-mode",
        modeId: recommendation.modeId,
        label: `${t("home.hero.cta_continue")} ${recommendedModeTitle}`,
      };
    }

    if (recommendation.intent === "start") {
      return {
        type: "next-mode",
        modeId: recommendation.modeId,
        label: `${t("home.hero.cta_start")} ${recommendedModeTitle} ${t("home.hero.cta_now")}`,
      };
    }

    return {
      type: "come-back-tomorrow",
      modeId: null,
      label: t("game.daily_loop.tomorrow_cta"),
    };
  }, [lastMode, missionStatusByMode, mode, state.finished, t]);

  const handlePostGameAction = () => {
    if (!postGameAction) return;

    if (postGameAction.type === "next-mode" && postGameAction.modeId) {
      localStorage.setItem("pokedleplus:lastMode", postGameAction.modeId);
      setLastMode(postGameAction.modeId);
      changeMode(postGameAction.modeId);
      return;
    }

    changeMode(null);
  };

  const onTrySelected = async () => {
    if (!selected) {
      addToast({
        kind: "info",
        title: t("game.pick_title"),
        message: t("game.pick_message"),
      });
      return;
    }
    return handleTryWithItem(selected);
  };

  const onShare = async () => {
    trackLocalMetricEvent({
      type: "share_clicked",
      ts: Date.now(),
      mode: mode || "classic",
      dayKey: dayKey || "unknown",
      meta: {
        won: state.won,
        attemptsCount: state.attempts.length,
      },
    });

    const modeLabel = t(`home.modes.${mode}.title`);
    const safeModeLabel = modeLabel === `home.modes.${mode}.title` ? mode : modeLabel;

    const text = generateShareText(
      mode,
      dayKey,
      state.attempts,
      state.won,
      stats.currentStreak,
      {
        modeLabel: safeModeLabel,
        resultWonLabel: t("game.progress_status_won"),
        resultLostLabel: t("game.progress_status_lost"),
        resultLabel: t("game.share_meta.result"),
        modeMetaLabel: t("game.share_meta.mode"),
        dailyProgressLabel: t("game.share_meta.daily_progress"),
        globalStreakLabel: t("game.share_meta.global_streak"),
        dailyProgress: missionProgress,
        globalStreak: globalStreak.current,
      },
    );
    try {
      const result = await shareResults(text);

      // Only show toast if clipboard was used (native share has its own UI)
      if (result.method === 'clipboard') {
        addToast({
          kind: "success",
          title: t("game.share"),
          message: t("game.share_copied"),
          duration: 2000,
        });
      }
    } catch (err) {
      addToast({
        kind: "error",
        title: t("game.share"),
        message: t("game.share_error") || "Failed to share results",
        duration: 2000,
      });
    }
  };

  const translateHint = (category, value) => {
    const raw = String(value ?? "").toLowerCase();
    if (!raw) return value;
    const key = `game.hints.${category}.${raw}`;
    const translated = t(key);
    return translated === key ? value : translated;
  };

  if (!mode) {
    return (
      <Home
        onSelect={changeMode}
        dayKey={dayKey}
        i18n={i18n}
      />
    );
  }

  const showGenColumn = mode === "classic" || mode === "infinite";

  return (
    <div className="min-h-screen bg-app text-app">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <GameHeader
          mode={mode}
          dayKey={dayKey}
          onChangeMode={() => changeMode(null)}
          onShowStats={() => setShowStats(true)}
          t={t}
          missionCompleted={missionProgress.completed}
          missionTotal={missionProgress.total}
          missionProgressPct={missionProgress.pct}
          globalStreak={globalStreak.current}
        />
        <div className="flex flex-col gap-4">
            <SearchPanel
              q={q}
              selected={selected}
              results={results}
              hasMore={hasMore}
              loadingMore={loadingMore}
              searching={searching}
              busy={busy}
              finished={state.finished}
              won={state.won}
              attemptsCount={state.attempts.length}
              error={error}
              onErrorClose={() => setError("")}
              onShare={onShare}
              onReset={nextInfinite}
              mode={mode}
              dailyProgress={missionProgress}
              globalStreak={globalStreak.current}
              t={t}
              postGameAction={postGameAction}
              onPostGameAction={handlePostGameAction}
              handleQueryChange={(e) => handleQueryChange(e.target.value)}
              handlePick={onPickPokemon}
              handleTry={onTrySelected}
              handleScrollBottom={handleScrollBottom}
            />

          <div className="flex flex-col gap-4">
            <AttemptsTable
              attempts={state.attempts}
              showGenColumn={showGenColumn}
              isDark={isDark}
              translateHint={translateHint}
              t={t}
              canReveal={canReveal}
              arrow={arrow}
              formatHeight={formatHeight}
              formatWeight={formatWeight}
              busy={busy}
            />
            <div className="text-center text-xs text-muted">
              {t("game.footer")}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      {showStats && (
        <StatsModal
          stats={stats}
          localMetrics={localMetrics}
          recentMetricEvents={recentMetricEvents}
          onClose={() => setShowStats(false)}
          onShare={onShare}
          t={t}
        />
      )}
    </div>
  );
}

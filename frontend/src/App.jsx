import React, { useEffect, useState, useCallback } from "react";
import { arrow } from "./ui.js";
import { useTheme } from "./hooks/useTheme.js";
import { useSearchCache } from "./hooks/useSearchCache.js";
import { useToast } from "./hooks/useToast.js";
import { useI18n } from "./hooks/useI18n.js";
import { useGameState } from "./hooks/useGameState.js";
import { usePokemonSearch } from "./hooks/usePokemonSearch.js";
import { useStats } from "./hooks/useStats.js";
import { generateShareText, copyToClipboard } from "./utils/share.js";

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

  const onPickPokemon = async (item) => {
    handlePick(item);
    await handleTryWithItem(item);
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
    const text = generateShareText(mode, dayKey, state.attempts, state.won, stats.currentStreak, t);
    await copyToClipboard(text);
    addToast({
      kind: "success",
      title: t("game.share"),
      message: t("game.share_copied"),
      duration: 2000,
    });
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
              attemptsCount={state.attempts.length}
              error={error}
              onErrorClose={() => setError("")}
              onShare={onShare}
              onReset={nextInfinite}
              mode={mode}
              t={t}
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
          onClose={() => setShowStats(false)}
          onShare={onShare}
          t={t}
        />
      )}
    </div>
  );
}

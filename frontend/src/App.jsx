import React, { useEffect } from "react";
import { arrow } from "./ui.js";
import { useTheme } from "./hooks/useTheme.js";
import { useSearchCache } from "./hooks/useSearchCache.js";
import { useToast } from "./hooks/useToast.js";
import { useI18n } from "./hooks/useI18n.js";
import { useGameState } from "./hooks/useGameState.js";
import { usePokemonSearch } from "./hooks/usePokemonSearch.js";

import GameHeader from "./components/GameHeader.jsx";
import SearchPanel from "./components/SearchPanel.jsx";
import AttemptsTable from "./components/AttemptsTable.jsx";
import { ToastContainer } from "./components/Toast.jsx";
import { Home } from "./components/Home.jsx";

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
  } = useGameState(t, addToast, clearToasts);

  const {
    q,
    results,
    selected,
    hasMore,
    loadingMore,
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

  const showGenColumn = mode === "classic";

  return (
    <div className="min-h-screen bg-app text-app">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <GameHeader
          mode={mode}
          dayKey={dayKey}
          onChangeMode={() => changeMode(null)}
          t={t}
        />
        <div className="flex flex-col gap-4">
          <SearchPanel
            q={q}
            selected={selected}
            results={results}
            hasMore={hasMore}
            loadingMore={loadingMore}
            busy={busy}
            finished={state.finished}
            attemptsCount={state.attempts.length}
            error={error}
            onErrorClose={() => setError("")}
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
            />
            <div className="text-center text-xs text-muted">
              {t("game.footer")}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

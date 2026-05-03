import { useEffect, useMemo, useState } from "react";
import {
  DAILY_MODE_IDS,
  computeGlobalStreak,
  computeMissionProgress,
  getRecommendedMode,
  getModeStatus,
} from "../utils/dailyMission.js";

export function useHomeDashboard({ dayKey, modeCatalog, t }) {
  const [statusByMode, setStatusByMode] = useState(() => ({}));
  const [streakSummary, setStreakSummary] = useState({ current: 0, best: 0 });
  const [lastMode, setLastMode] = useState(
    () => localStorage.getItem("pokedleplus:lastMode"),
  );

  const missionModes = useMemo(
    () => modeCatalog.filter((mode) => mode.id !== "infinite"),
    [modeCatalog],
  );

  useEffect(() => {
    function computeStatuses() {
      const map = {};
      for (const mode of modeCatalog) {
        map[mode.id] = getModeStatus(dayKey, mode.id);
      }
      return map;
    }

    const syncDashboard = () => {
      setStatusByMode(computeStatuses());
      setStreakSummary(computeGlobalStreak(DAILY_MODE_IDS));
      setLastMode(localStorage.getItem("pokedleplus:lastMode"));
    };

    syncDashboard();

    window.addEventListener("storage", syncDashboard);
    return () => window.removeEventListener("storage", syncDashboard);
  }, [dayKey, modeCatalog]);

  const missionProgress = useMemo(
    () => computeMissionProgress(statusByMode, DAILY_MODE_IDS),
    [statusByMode],
  );

  const recommendedMode = useMemo(() => {
    const recommendation = getRecommendedMode(statusByMode, lastMode, DAILY_MODE_IDS);
    const mode =
      modeCatalog.find((item) => item.id === recommendation.modeId) ||
      missionModes[0] ||
      modeCatalog[0];

    return { mode, intent: recommendation.intent };
  }, [lastMode, missionModes, modeCatalog, statusByMode]);

  const fallbackMode = recommendedMode?.mode || missionModes[0] || modeCatalog[0];
  const ctaMode =
    (lastMode && modeCatalog.find((item) => item.id === lastMode)) || fallbackMode;

  const heroCtaLabel = useMemo(() => {
    const modeTitle = ctaMode?.title ?? "";
    if (lastMode) return `${t("home.hero.cta_continue")} ${modeTitle}`;
    if (recommendedMode?.intent === "continue") {
      return `${t("home.hero.cta_continue")} ${modeTitle}`;
    }
    if (recommendedMode?.intent === "start") {
      return `${t("home.hero.cta_start")} ${modeTitle} ${t("home.hero.cta_now")}`;
    }
    return `${t("home.hero.cta_play")} ${modeTitle} ${t("home.hero.cta_now")}`;
  }, [ctaMode, lastMode, recommendedMode, t]);

  function handleSelectMode(modeId, onSelect) {
    localStorage.setItem("pokedleplus:lastMode", modeId);
    setLastMode(modeId);
    onSelect(modeId);
  }

  return {
    statusByMode,
    streakSummary,
    lastMode,
    missionProgress,
    recommendedMode,
    ctaMode,
    heroCtaLabel,
    recommendedModeId: ctaMode?.id,
    handleSelectMode,
  };
}

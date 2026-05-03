import { useState, useEffect, useCallback } from "react";
import { getMaxAttempts } from "../constants/game.js";

const STATS_KEY_PREFIX = "pokedleplus:stats:";

function createEmptyDistribution(maxAttempts) {
  return Array.from({ length: maxAttempts }, (_, idx) => idx + 1).reduce(
    (acc, attempt) => {
      acc[attempt] = 0;
      return acc;
    },
    {},
  );
}

function getInitialStats(maxAttempts) {
  return {
    totalGames: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    distribution: createEmptyDistribution(maxAttempts),
    lastPlayedDay: null,
  };
}

function normalizeStats(rawStats, maxAttempts) {
  const base = getInitialStats(maxAttempts);
  const distribution = createEmptyDistribution(maxAttempts);

  if (rawStats?.distribution && typeof rawStats.distribution === "object") {
    for (const [attempt, count] of Object.entries(rawStats.distribution)) {
      const attemptNumber = Number(attempt);
      if (attemptNumber >= 1 && attemptNumber <= maxAttempts) {
        distribution[attemptNumber] = Number(count) || 0;
      }
    }
  }

  return {
    ...base,
    ...rawStats,
    distribution,
  };
}

export function useStats(mode) {
  const [stats, setStats] = useState(() => getInitialStats(getMaxAttempts(mode || "classic")));

  const loadStats = useCallback((m) => {
    const maxAttempts = getMaxAttempts(m || "classic");
    const key = `${STATS_KEY_PREFIX}${m || "classic"}`;
    const raw = localStorage.getItem(key);
    if (!raw) return getInitialStats(maxAttempts);
    try {
      return normalizeStats(JSON.parse(raw), maxAttempts);
    } catch {
      return getInitialStats(maxAttempts);
    }
  }, []);

  useEffect(() => {
    setStats(loadStats(mode));
  }, [mode, loadStats]);

  const recordGame = useCallback((dayKey, won, attemptsCount) => {
    const activeMode = mode || "classic";
    const maxAttempts = getMaxAttempts(activeMode);
    const key = `${STATS_KEY_PREFIX}${activeMode}`;
    
    setStats((prev) => {
      if (prev.lastPlayedDay === dayKey) return prev;

      const newStats = {
        totalGames: prev.totalGames + 1,
        wins: won ? prev.wins + 1 : prev.wins,
        currentStreak: won ? prev.currentStreak + 1 : 0,
        maxStreak: won ? Math.max(prev.maxStreak, prev.currentStreak + 1) : prev.maxStreak,
        distribution: { ...prev.distribution },
        lastPlayedDay: dayKey,
      };

      if (won && attemptsCount >= 1 && attemptsCount <= maxAttempts) {
        newStats.distribution[attemptsCount] = (newStats.distribution[attemptsCount] || 0) + 1;
      }

      localStorage.setItem(key, JSON.stringify(newStats));
      return newStats;
    });
  }, [mode]);

  return { stats, recordGame };
}

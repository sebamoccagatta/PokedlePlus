import { useState, useEffect, useCallback } from "react";
import { MAX_ATTEMPTS } from "../constants/game.js";

const STATS_KEY_PREFIX = "pokedleplus:stats:";

function createEmptyDistribution() {
  return Array.from({ length: MAX_ATTEMPTS }, (_, idx) => idx + 1).reduce(
    (acc, attempt) => {
      acc[attempt] = 0;
      return acc;
    },
    {},
  );
}

function getInitialStats() {
  return {
    totalGames: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    distribution: createEmptyDistribution(),
    lastPlayedDay: null,
  };
}

function normalizeStats(rawStats) {
  const base = getInitialStats();
  const distribution = createEmptyDistribution();

  if (rawStats?.distribution && typeof rawStats.distribution === "object") {
    for (const [attempt, count] of Object.entries(rawStats.distribution)) {
      const attemptNumber = Number(attempt);
      if (attemptNumber >= 1 && attemptNumber <= MAX_ATTEMPTS) {
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
  const [stats, setStats] = useState(() => getInitialStats());

  const loadStats = useCallback((m) => {
    const key = `${STATS_KEY_PREFIX}${m || "classic"}`;
    const raw = localStorage.getItem(key);
    if (!raw) return getInitialStats();
    try {
      return normalizeStats(JSON.parse(raw));
    } catch {
      return getInitialStats();
    }
  }, []);

  useEffect(() => {
    setStats(loadStats(mode));
  }, [mode, loadStats]);

  const recordGame = useCallback((dayKey, won, attemptsCount) => {
    const activeMode = mode || "classic";
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

      if (won && attemptsCount >= 1 && attemptsCount <= MAX_ATTEMPTS) {
        newStats.distribution[attemptsCount] = (newStats.distribution[attemptsCount] || 0) + 1;
      }

      localStorage.setItem(key, JSON.stringify(newStats));
      return newStats;
    });
  }, [mode]);

  return { stats, recordGame };
}

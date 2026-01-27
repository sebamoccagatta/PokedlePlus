import { useState, useEffect, useCallback } from "react";

const STATS_KEY_PREFIX = "pokedleplus:stats:";

function getInitialStats() {
  return {
    totalGames: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    distribution: {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0
    },
    lastPlayedDay: null,
  };
}

export function useStats(mode) {
  const [stats, setStats] = useState(() => getInitialStats());

  const loadStats = useCallback((m) => {
    const key = `${STATS_KEY_PREFIX}${m || "classic"}`;
    const raw = localStorage.getItem(key);
    if (!raw) return getInitialStats();
    try {
      return JSON.parse(raw);
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

      if (won && attemptsCount >= 1 && attemptsCount <= 15) {
        newStats.distribution[attemptsCount] = (newStats.distribution[attemptsCount] || 0) + 1;
      }

      localStorage.setItem(key, JSON.stringify(newStats));
      return newStats;
    });
  }, [mode]);

  return { stats, recordGame };
}

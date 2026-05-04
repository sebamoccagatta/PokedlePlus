import { getMaxAttempts } from "../constants/game.js";

export const DAILY_MODE_IDS = [
  "classic",
  "gen1",
  "gen2",
  "gen3",
  "gen4",
  "gen5",
  "gen6",
  "gen7",
  "gen8",
  "gen9",
];

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function readModeStateForDay(dayKey, modeId) {
  if (!dayKey) return null;

  const keys = [
    `pokedleplus:v1:${dayKey}:${modeId}`,
    `pokedleplus:v1:${dayKey}`,
    "pokedle_state_v1",
  ];

  for (const key of keys) {
    const parsed = safeParse(localStorage.getItem(key));
    if (parsed && typeof parsed === "object") return parsed;
  }

  return null;
}

export function getModeStatus(dayKey, modeId) {
  const state = readModeStateForDay(dayKey, modeId);
  const attempts = Array.isArray(state?.attempts) ? state.attempts.length : 0;
  const won =
    state?.won === true ||
    state?.status === "won" ||
    state?.win === true ||
    state?.isWon === true;

  return {
    attempts,
    won,
    played: attempts > 0 || won,
  };
}

export function getSilhouetteStatus(dayKey) {
  if (!dayKey) return { attempts: 0, won: false, played: false, lost: false };
  const key = `pokedleplus:v1:${dayKey}:silhouette`;
  const state = safeParse(localStorage.getItem(key));
  const attempts = Array.isArray(state?.attempts) ? state.attempts.length : 0;
  const won = Boolean(state?.won);
  const finished = Boolean(state?.finished);
  return {
    attempts,
    won,
    played: attempts > 0,
    lost: finished && !won,
  };
}

export function computeStatusesByMode(dayKey, modeIds) {
  const ids = Array.isArray(modeIds) ? modeIds : DAILY_MODE_IDS;
  return ids.reduce((acc, modeId) => {
    acc[modeId] = getModeStatus(dayKey, modeId);
    return acc;
  }, {});
}

export function computeMissionProgress(statusByMode, modeIds = DAILY_MODE_IDS) {
  const completed = modeIds.filter((modeId) => statusByMode?.[modeId]?.won).length;
  const total = modeIds.length;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  return { completed, total, pct };
}

export function getRecommendedMode(statusByMode, lastMode, modeIds = DAILY_MODE_IDS) {
  const inProgress = modeIds.find((modeId) => {
    const status = statusByMode?.[modeId];
    return (
      status?.played &&
      !status?.won &&
      status?.attempts < getMaxAttempts(modeId)
    );
  });

  if (inProgress) {
    return { modeId: inProgress, intent: "continue" };
  }

  const pending = modeIds.find((modeId) => {
    const status = statusByMode?.[modeId];
    return !status?.played;
  });

  if (pending) {
    return { modeId: pending, intent: "start" };
  }

  const fallback = modeIds.includes(lastMode) ? lastMode : modeIds[0] || "classic";
  return { modeId: fallback, intent: "play" };
}

function readModeStats(modeId) {
  const parsed = safeParse(localStorage.getItem(`pokedleplus:stats:${modeId}`));
  if (!parsed || typeof parsed !== "object") {
    return { currentStreak: 0, maxStreak: 0 };
  }

  return {
    currentStreak: Number(parsed.currentStreak) || 0,
    maxStreak: Number(parsed.maxStreak) || 0,
  };
}

export function computeGlobalStreak(modeIds = DAILY_MODE_IDS) {
  return modeIds.reduce(
    (acc, modeId) => {
      const stats = readModeStats(modeId);
      return {
        current: Math.max(acc.current, stats.currentStreak),
        best: Math.max(acc.best, stats.maxStreak),
      };
    },
    { current: 0, best: 0 },
  );
}

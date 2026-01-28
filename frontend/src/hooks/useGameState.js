import { useState, useEffect, useRef, useCallback } from "react";
import { apiGuess, apiMeta, apiPokemon } from "../api.js";
import confetti from "canvas-confetti";

const STORAGE_PREFIX = "pokedleplus:v1:";
const MODE_KEY = "pokedleplus:mode";
const MAX_ATTEMPTS = 15;

function loadMode() {
  try {
    return localStorage.getItem(MODE_KEY);
  } catch {
    return null;
  }
}

function saveMode(mode) {
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch {}
}

function clearMode() {
  try {
    localStorage.removeItem(MODE_KEY);
  } catch {}
}

function storageKey(dayKey, mode) {
  return `${STORAGE_PREFIX}${dayKey}:${mode || "classic"}`;
}

function loadState(dayKey, mode) {
  try {
    const raw = localStorage.getItem(storageKey(dayKey, mode));
    if (!raw) return { dayKey, attempts: [], finished: false, won: false };
    const parsed = JSON.parse(raw);
    return {
      dayKey,
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
      finished: Boolean(parsed.finished),
      won: Boolean(parsed.won),
    };
  } catch {
    return { dayKey, attempts: [], finished: false, won: false };
  }
}

function saveState(state, mode) {
  try {
    localStorage.setItem(storageKey(state.dayKey, mode), JSON.stringify(state));
  } catch {
    // noop
  }
}

function triggerWinConfetti() {
  const duration = 5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 200 };

  const randomInRange = (min, max) => Math.random() * (max - min) + min;

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
}

export function useGameState(t, addToast, clearToasts) {
  const [mode, setMode] = useState(loadMode());
  const [dayKey, setDayKey] = useState("");
  const [state, setState] = useState({
    dayKey: "",
    attempts: [],
    finished: false,
    won: false,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [revealIndex, setRevealIndex] = useState(-1);
  const revealTimersRef = useRef([]);

  const scheduleReveal = useCallback(() => {
    for (const t of revealTimersRef.current) clearTimeout(t);
    revealTimersRef.current = [];

    const steps = 8;
    setRevealIndex(0);

    for (let i = 1; i < steps; i++) {
      const timer = setTimeout(() => setRevealIndex(i), 120 * i);
      revealTimersRef.current.push(timer);
    }
  }, []);

  const canReveal = useCallback((i) => revealIndex >= i, [revealIndex]);

  useEffect(() => {
    for (const t of revealTimersRef.current) clearTimeout(t);
    revealTimersRef.current = [];
    setRevealIndex(-1);

    if (!mode) {
      setDayKey("");
      setState({ dayKey: "", attempts: [], finished: false, won: false });
      setError("");
      clearToasts();
      return;
    }

    setError("");
    clearToasts();

    (async () => {
      const meta = await apiMeta(mode);
      setDayKey(meta.dayKey);

      const loaded = loadState(meta.dayKey, mode);
      const shouldFinish = !loaded.won && loaded.attempts.length >= MAX_ATTEMPTS;
      const normalized = shouldFinish
        ? { ...loaded, finished: true, won: false }
        : loaded;

      setState(normalized);
      if (normalized !== loaded) {
        saveState(normalized, mode);
      }

      if (normalized.won) {
        clearToasts();
        addToast({
          kind: "success",
          title: t("game.win_title"),
          message: t("game.win_message"),
        });
        triggerWinConfetti();
      } else if (normalized.finished) {
        clearToasts();
        addToast({
          kind: "warning",
          title: t("game.lost_title"),
          message: t("game.lost_message"),
        });
      }
    })().catch((e) => {
      console.error(e);
      setError(t("game.meta_error"));
    });
  }, [mode, addToast, clearToasts]);

  // Global dayKey for Home
  useEffect(() => {
    if (mode) return;
    (async () => {
      try {
        const meta = await apiMeta("classic");
        setDayKey(meta.dayKey);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [mode]);

  const changeMode = useCallback((newMode) => {
    if (newMode) {
      saveMode(newMode);
    } else {
      clearMode();
    }
    setMode(newMode);
  }, []);

  const handleTryWithItem = useCallback(async (pick) => {
    if (!dayKey || !pick) return;

    if (state.finished) {
      addToast({
        kind: state.won ? "info" : "warning",
        title: state.won ? t("game.already_played_title") : t("game.lost_title"),
        message: state.won ? t("game.day_end_message") : t("game.lost_message"),
      });
      return;
    }

    if (state.attempts.some((a) => a.id === pick.id)) {
      addToast({
        kind: "info",
        title: t("game.already_tried_title"),
        message: t("game.already_tried_message"),
      });
      return;
    }

    setBusy(true);
    setError("");

    try {
      const [p, g] = await Promise.all([
        apiPokemon(pick.id),
        apiGuess(pick.id, dayKey, mode || "classic"),
      ]);

      const attempt = {
        id: p.id,
        name: p.name,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`,
        types: Array.isArray(p.types)
          ? p.types
          : typeof p.types === "string"
            ? p.types.split(",").map((t) => t.trim())
            : [],
        habitat: p.habitat ?? "unknown",
        color: p.color ?? "unknown",
        gen: Number(p.gen || 1),
        evolution_stage: Number(p.evolution_stage || 1),
        height_dm: Number(p.height_dm || 0),
        weight_hg: Number(p.weight_hg || 0),
        columns: g?.comparison?.columns || {},
        isCorrect: Boolean(g?.comparison?.isCorrect),
      };

      const nextAttempts = [attempt, ...state.attempts];
      const isWin = Boolean(attempt.isCorrect);
      const isOutOfAttempts = !isWin && nextAttempts.length >= MAX_ATTEMPTS;

      const next = {
        dayKey,
        attempts: nextAttempts,
        finished: isWin || isOutOfAttempts,
        won: isWin,
      };

      setState(next);
      saveState(next, mode);
      scheduleReveal();

      if (isWin) {
        addToast({
          kind: "success",
          title: t("game.win_title"),
          message: t("game.win_message"),
        });
        triggerWinConfetti();
      } else if (isOutOfAttempts) {
        addToast({
          kind: "warning",
          title: t("game.lost_title"),
          message: t("game.lost_message"),
        });
      }
    } catch (e) {
      console.error(e);
      setError(`${t("game.try_error")} ${e.message}`);
      addToast({
        kind: "error",
        title: t("game.try_failed_title"),
        message: String(e.message || t("game.try_again")),
      });
    } finally {
      setBusy(false);
    }
  }, [dayKey, state, mode, t, addToast, scheduleReveal]);

  return {
    mode,
    dayKey,
    state,
    busy,
    error,
    setError,
    canReveal,
    changeMode,
    handleTryWithItem,
  };
}

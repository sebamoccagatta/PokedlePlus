// frontend/src/App.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  apiGuess,
  apiMeta,
  apiPokemon,
  apiSearch,
  prefetchPokemon,
} from "./api.js";
import {
  Globe,
  Leaf,
  Gem,
  Flame,
  Mountain,
  Building2,
  Sparkles,
  Sun,
  Swords,
  Map,
  CheckCircle2,
  CircleDashed,
  ArrowRight,
} from "lucide-react";

import { arrow } from "./ui.js";
import { useTheme } from "./hooks/useTheme.js";
import { useSearchCache } from "./hooks/useSearchCache.js";
import { useToast } from "./hooks/useToast.js";
import { ThemeToggle } from "./components/ThemeToggle.jsx";
import confetti from "canvas-confetti";

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

import { useI18n } from "./hooks/useI18n.js";
import { LanguageSelector } from "./components/LanguageSelector.jsx";
import GameHeader from "./components/GameHeader.jsx";
import SearchPanel from "./components/SearchPanel.jsx";
import AttemptsTable from "./components/AttemptsTable.jsx";
import { ToastContainer } from "./components/Toast.jsx";

/**
 * Storage
 * Guardamos por día + modo:
 * pokedleplus:v1:YYYY-MM-DD:classic
 */
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

function formatHeight(dm) {
  const m = (Number(dm || 0) / 10).toFixed(1);
  return `${m} m`;
}
function formatWeight(hg) {
  const kg = (Number(hg || 0) / 10).toFixed(1);
  return `${kg} kg`;
}

function Home({ onSelect, dayKey, i18n }) {
  const { t, locale, changeLocale, availableLocales } = i18n;
  const modes = useMemo(
    () => [
      {
        id: "classic",
        title: t("home.modes.classic.title"),
        desc: t("home.modes.classic.desc"),
        color: "bg-emerald-500",
        Icon: Globe,
      },
      {
        id: "gen1",
        title: t("home.modes.gen1.title"),
        desc: t("home.modes.gen1.desc"),
        color: "bg-sky-500",
        Icon: Leaf,
      },
      {
        id: "gen2",
        title: t("home.modes.gen2.title"),
        desc: t("home.modes.gen2.desc"),
        color: "bg-indigo-500",
        Icon: Gem,
      },
      {
        id: "gen3",
        title: t("home.modes.gen3.title"),
        desc: t("home.modes.gen3.desc"),
        color: "bg-violet-500",
        Icon: Flame,
      },
      {
        id: "gen4",
        title: t("home.modes.gen4.title"),
        desc: t("home.modes.gen4.desc"),
        color: "bg-purple-500",
        Icon: Mountain,
      },
      {
        id: "gen5",
        title: t("home.modes.gen5.title"),
        desc: t("home.modes.gen5.desc"),
        color: "bg-red-500",
        Icon: Building2,
      },
      {
        id: "gen6",
        title: t("home.modes.gen6.title"),
        desc: t("home.modes.gen6.desc"),
        color: "bg-pink-500",
        Icon: Sparkles,
      },
      {
        id: "gen7",
        title: t("home.modes.gen7.title"),
        desc: t("home.modes.gen7.desc"),
        color: "bg-yellow-500",
        Icon: Sun,
      },
      {
        id: "gen8",
        title: t("home.modes.gen8.title"),
        desc: t("home.modes.gen8.desc"),
        color: "bg-orange-500",
        Icon: Swords,
      },
      {
        id: "gen9",
        title: t("home.modes.gen9.title"),
        desc: t("home.modes.gen9.desc"),
        color: "bg-rose-500",
        Icon: Map,
      },
    ],
    [t],
  );

  const [statusByMode, setStatusByMode] = useState(() => ({}));
  const [lastMode, setLastMode] = useState(
    () => localStorage.getItem("pokedleplus:lastMode") || "classic",
  );

  function safeParse(json) {
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  function readModeState(dk, modeId) {
    if (!dk) return null;

    const keys = [
      `pokedleplus:v1:${dk}:${modeId}`,
      `pokedleplus:v1:${dk}`,
      `pokedle_state_v1`,
    ];

    for (const k of keys) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const parsed = safeParse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    }
    return null;
  }

  function computeStatuses() {
    const map = {};
    for (const m of modes) {
      const st = readModeState(dayKey, m.id);
      const attempts = Array.isArray(st?.attempts) ? st.attempts.length : 0;
      const won =
        st?.won === true ||
        st?.status === "won" ||
        st?.win === true ||
        st?.isWon === true;

      map[m.id] = { attempts, won, played: attempts > 0 || won };
    }
    return map;
  }

  useEffect(() => {
    setStatusByMode(computeStatuses());
    const onStorage = () => setStatusByMode(computeStatuses());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayKey, modes]);

  function handleSelect(id) {
    localStorage.setItem("pokedleplus:lastMode", id);
    setLastMode(id);
    onSelect(id);
  }

  return (
    <div className="min-h-screen bg-app text-app">
      <div className="mx-auto w-full max-w-[1900px] px-6 md:px-10 2xl:px-16 py-14">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-black">Pokedle+</h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageSelector
              t={t}
              locale={locale}
              changeLocale={changeLocale}
              availableLocales={availableLocales}
            />
          </div>
        </div>
        <p className="text-center mb-6 text-muted">{t("home.tagline")}</p>

        <div className="mb-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <span className="text-xs text-muted">
            {t("home.today")}{" "}
            <span className="font-semibold text-strong">{dayKey || "??"}</span>
          </span>

          <button
            onClick={() => handleSelect(lastMode)}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold btn-surface transition"
            title={t("home.continue_title")}
          >
            {t("home.continue")}{" "}
            <span className="text-muted">({lastMode})</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* ✅ MENOS COLUMNAS = MÁS AIRE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {modes.map((m) => {
            const st = statusByMode[m.id] || {
              attempts: 0,
              won: false,
              played: false,
            };

            return (
              <button
                key={m.id}
                onClick={() => handleSelect(m.id)}
                className={[
                  "group relative rounded-[28px] border text-left transition",
                  "p-7 2xl:p-8 min-h-[170px] 2xl:min-h-[185px]",
                  "shadow-card",
                  st.won
                    ? "border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100/70 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/25"
                    : st.played
                      ? "border-app bg-surface surface-hover dark:border-zinc-700 dark:bg-zinc-950/60 dark:hover:bg-zinc-900/60"
                      : "border-app bg-surface-soft surface-hover dark:border-zinc-800 dark:bg-zinc-950/50 dark:hover:bg-zinc-900/50",
                ].join(" ")}
                title={m.title}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-5 min-w-0">
                    <div
                      className={[
                        "h-16 w-16 rounded-3xl",
                        m.color,
                        "flex items-center justify-center text-white shrink-0",
                        "shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
                        "transition-transform duration-200 group-hover:scale-[1.05]",
                      ].join(" ")}
                    >
                      <m.Icon className="h-8 w-8" />
                    </div>

                    <div className="min-w-0">
                      <div className="text-xl font-extrabold leading-tight break-words">
                        {m.title}
                      </div>
                      <div className="text-sm text-muted">{m.desc}</div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {st.won ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
                        <CheckCircle2 className="h-4 w-4" />{" "}
                        {t("home.status_won")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-300">
                        <CircleDashed className="h-4 w-4" />{" "}
                        {t("home.status_pending")}
                      </span>
                    )}
                  </div>
                </div>

                {/* ✅ footer separado = respira */}
                <div className="mt-6 flex items-center justify-between text-sm">
                  <div className="text-muted">
                    {t("home.attempts")}{" "}
                    <span className="font-semibold text-strong">
                      {st.attempts}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-2 text-muted transition group-hover:text-strong">
                    {t("home.play")}{" "}
                    <span className="translate-x-0 group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 text-center text-xs text-muted">
          {t("home.footer")}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const i18n = useI18n();
  const { t } = i18n;
  const { isDark } = useTheme();
  const { get: getCache, set: setCache, clear: clearCache } = useSearchCache();
  const { toasts, addToast, removeToast, clearToasts } = useToast();
  const searchAbortRef = useRef(null);
  const [mode, setMode] = useState(loadMode());

  const [dayKey, setDayKey] = useState("");
  const [state, setState] = useState({
    dayKey: "",
    attempts: [],
    finished: false,
    won: false,
  });

  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);

  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const revealTimersRef = useRef([]);
  const [revealIndex, setRevealIndex] = useState(-1);

  function scheduleReveal() {
    for (const t of revealTimersRef.current) clearTimeout(t);
    revealTimersRef.current = [];

    const steps = 8; // type1,type2,gen,habitat,color,evolution,height,weight

    // 👇 IMPORTANTE: marcar que estamos animando
    setRevealIndex(0);

    for (let i = 1; i < steps; i++) {
      const timer = setTimeout(() => setRevealIndex(i), 120 * i);
      revealTimersRef.current.push(timer);
    }
  }

  function canReveal(i) {
    return revealIndex >= i;
  }

  // ✅ cargar meta/state cuando cambia el modo
  useEffect(() => {
    // limpiar timers al cambiar de modo / desmontar
    for (const t of revealTimersRef.current) clearTimeout(t);
    revealTimersRef.current = [];
    setRevealIndex(-1);
    // si no hay modo, no hacemos fetch
    if (!mode) {
      setDayKey("");
      setState({ dayKey: "", attempts: [], finished: false, won: false });
      setQ("");
      setResults([]);
      setSelected(null);
      setOffset(0);
      setHasMore(false);
      setLoadingMore(false);
      setBusy(false);
      setError("");
      clearToasts();
      return;
    }

    // reset UI de búsqueda al cambiar modo
    clearCache();
    setQ("");
    setResults([]);
    setSelected(null);
    setOffset(0);
    setHasMore(false);
    setLoadingMore(false);
    setError("");
    clearToasts();

    (async () => {
      // 👇 importante: meta depende del mode
      const meta = await apiMeta(mode);
      setDayKey(meta.dayKey);

      const loaded = loadState(meta.dayKey, mode);
      const shouldFinish =
        !loaded.won && loaded.attempts.length >= MAX_ATTEMPTS;
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
  }, [mode, addToast]);

  useEffect(() => {
    if (!mode) return;

    // 🔥 warm-up de la function search (reduce cold start)
    fetch(`/api/search?q=a&offset=0&mode=${encodeURIComponent(mode)}`).catch(
      () => {},
    );
  }, [mode]);

  // ✅ dayKey global para Home (aunque todavía no elijas modo)
  useEffect(() => {
    if (mode) return; // si ya hay modo, el otro effect se encarga

    (async () => {
      try {
        const meta = await apiMeta("classic"); // usamos classic solo para obtener dayKey
        setDayKey(meta.dayKey);
      } catch (e) {
        console.error(e);
        // no rompemos UI
      }
    })();
  }, [mode]);

  async function doSearch(nextQ, nextOffset = 0, append = false) {
    const query = String(nextQ || "").trim();
    if (!query) {
      setResults([]);
      setOffset(0);
      setHasMore(false);
      return;
    }

    if (!append) {
      try {
        searchAbortRef.current?.abort();
      } catch {}
      searchAbortRef.current = new AbortController();
    }

    try {
      if (append) setLoadingMore(true);

      const res = await apiSearch(query, nextOffset, mode || "classic", {
        signal: searchAbortRef.current?.signal,
      });

      if (append) {
        setResults((prev) => [...prev, ...(res.items || [])]);
      } else {
        setResults(res.items || []);
      }

      setHasMore(Boolean(res.hasMore));
      setOffset(Number(res.nextOffset || 0));
    } catch (e) {
      console.error(e);
      setError(t("game.search_error"));
    } finally {
      if (append) setLoadingMore(false);
    }
  }

  // debounce búsqueda (solo si hay modo)
  useEffect(() => {
    if (!mode) return;

    const t = setTimeout(() => {
      doSearch(q, 0, false);
    }, 80);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, mode]);

  async function handleTryWithItem(pick) {
    if (!dayKey || !pick) return;

    if (state.finished) {
      addToast({
        kind: state.won ? "info" : "warning",
        title: state.won
          ? t("game.already_played_title")
          : t("game.lost_title"),
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
  }

  async function handlePick(item) {
    setSelected(item);

    // no pisar el input con el nombre
    setResults([]);
    setHasMore(false);
    setOffset(0);

    // limpiar el input
    setQ("");

    // disparo el guess automáticamente
    await handleTryWithItem(item);
  }

  // wrapper para el botón "Probar"
  async function handleTry() {
    if (!selected) {
      addToast({
        kind: "info",
        title: t("game.pick_title"),
        message: t("game.pick_message"),
      });
      return;
    }
    return handleTryWithItem(selected);
  }

  function handleQueryChange(event) {
    setQ(event.target.value);
    setSelected(null);
  }

  function handleScrollBottom() {
    if (!hasMore || loadingMore) return;
    doSearch(q, offset, true);
  }

  const attempts = state.attempts;
  const translateHint = (category, value) => {
    const raw = String(value ?? "").toLowerCase();
    if (!raw) return value;
    const key = `game.hints.${category}.${raw}`;
    const translated = t(key);
    return translated === key ? value : translated;
  };
  // ✅ Render condicional SIN romper hooks
  if (!mode) {
    return (
      <Home
        onSelect={(m) => {
          saveMode(m);
          setMode(m);
        }}
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
          onChangeMode={() => {
            clearMode();
            setMode(null);
          }}
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
            attemptsCount={attempts.length}
            error={error}
            onErrorClose={() => setError("")}
            t={t}
            handleQueryChange={handleQueryChange}
            handlePick={handlePick}
            handleTry={handleTry}
            handleScrollBottom={handleScrollBottom}
          />

          <div className="flex flex-col gap-4">
            <AttemptsTable
              attempts={attempts}
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

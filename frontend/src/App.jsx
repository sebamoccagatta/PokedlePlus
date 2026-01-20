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

import { badgeClass, arrow } from "./ui.js";
import { useTheme } from "./hooks/useTheme.js";
import { useSearchCache } from "./hooks/useSearchCache.js";
import { useToast } from "./hooks/useToast.js";
import { ThemeToggle } from "./components/ThemeToggle.jsx";
import { useI18n } from "./hooks/useI18n.js";
import { LanguageSelector } from "./components/LanguageSelector.jsx";

/**
 * Storage
 * Guardamos por día + modo:
 * pokedleplus:v1:YYYY-MM-DD:classic
 */
const STORAGE_PREFIX = "pokedleplus:v1:";
const MODE_KEY = "pokedleplus:mode";

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

/**
 * UI components
 */
function Pill({ children, kind, pop = false, isDark }) {
  return (
    <span
      className={[
        "inline-flex items-center justify-center gap-1.5",
        "rounded-xl border px-3 py-1.5",
        "text-[12px] font-semibold leading-none",
        "min-h-8 min-w-[92px]",
        "shadow-[0_1px_0_rgba(255,255,255,0.05)_inset]",
        "transition-transform transition-opacity duration-200",
        pop ? "scale-[1.03]" : "scale-100",
        badgeClass(kind, isDark),
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function ComboList({
  items,
  onPick,
  disabled,
  onScrollBottom,
  loadingMore,
  hasMore,
}) {
  return (
    <div
      className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-950/60 overflow-y-auto overscroll-contain dark:border-zinc-800 dark:bg-zinc-950/60 border-gray-200 bg-gray-50"
      style={{ maxHeight: 320 }}
      onScroll={(e) => {
        const el = e.currentTarget;
        const nearBottom =
          el.scrollTop + el.clientHeight >= el.scrollHeight - 24;
        if (nearBottom) onScrollBottom?.();
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-3">
        {items.map((o) => (
          <button
            key={o.id}
            onClick={() => onPick(o)}
            disabled={disabled}
            className={[
              "flex items-center gap-3 rounded-2xl border border-zinc-800",
              "bg-zinc-950/60 px-3 py-2 text-left",
              "hover:bg-zinc-900/40 transition-colors",
              "disabled:opacity-60",
              "dark:border-zinc-800 dark:bg-zinc-950/60 dark:hover:bg-zinc-900/40",
              "border-gray-200 bg-white hover:bg-gray-100",
            ].join(" ")}
          >
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-2 dark:border-zinc-800 dark:bg-zinc-900/50 border-gray-200 bg-gray-100">
              <img src={o.sprite} alt={o.name} className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-extrabold capitalize text-zinc-100 dark:text-zinc-100 text-gray-900">
                {o.name}
              </div>
              <div className="text-xs text-zinc-400 dark:text-zinc-400 text-gray-500">
                #{o.id}
              </div>
            </div>
          </button>
        ))}
      </div>

      {(loadingMore || hasMore) && (
        <div className="border-t border-zinc-800 px-3 py-2 text-center text-xs text-zinc-400 dark:border-zinc-800 dark:text-zinc-400 border-gray-200 text-gray-500">
          {loadingMore ? "Cargando más..." : "Scroll para cargar más"}
        </div>
      )}
    </div>
  );
}

function formatHeight(dm) {
  const m = (Number(dm || 0) / 10).toFixed(1);
  return `${m} m`;
}
function formatWeight(hg) {
  const kg = (Number(hg || 0) / 10).toFixed(1);
  return `${kg} kg`;
}

function Home({ onSelect, dayKey }) {
  const modes = useMemo(
    () => [
      {
        id: "classic",
        title: "Clásico",
        desc: "Todas las generaciones",
        color: "bg-emerald-500",
        Icon: Globe,
      },
      {
        id: "gen1",
        title: "Generación I",
        desc: "Solo Kanto",
        color: "bg-sky-500",
        Icon: Leaf,
      },
      {
        id: "gen2",
        title: "Generación II",
        desc: "Solo Johto",
        color: "bg-indigo-500",
        Icon: Gem,
      },
      {
        id: "gen3",
        title: "Generación III",
        desc: "Solo Hoenn",
        color: "bg-violet-500",
        Icon: Flame,
      },
      {
        id: "gen4",
        title: "Generación IV",
        desc: "Solo Sinnoh",
        color: "bg-purple-500",
        Icon: Mountain,
      },
      {
        id: "gen5",
        title: "Generación V",
        desc: "Solo Unova",
        color: "bg-red-500",
        Icon: Building2,
      },
      {
        id: "gen6",
        title: "Generación VI",
        desc: "Solo Kalos",
        color: "bg-pink-500",
        Icon: Sparkles,
      },
      {
        id: "gen7",
        title: "Generación VII",
        desc: "Solo Alola",
        color: "bg-yellow-500",
        Icon: Sun,
      },
      {
        id: "gen8",
        title: "Generación VIII",
        desc: "Solo Galar",
        color: "bg-orange-500",
        Icon: Swords,
      },
      {
        id: "gen9",
        title: "Generación IX",
        desc: "Solo Paldea",
        color: "bg-rose-500",
        Icon: Map,
      },
    ],
    [],
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
    <div className="min-h-screen bg-[#060708] text-zinc-100">
      <div className="mx-auto w-full max-w-[1600px] px-6 md:px-10 2xl:px-16 py-14">
        <h1 className="text-4xl font-black text-center mb-2">Pokedle+</h1>
        <p className="text-center text-zinc-400 mb-6">
          Elegí cómo querés jugar hoy
        </p>

        <div className="mb-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <span className="text-xs text-zinc-500">
            Hoy:{" "}
            <span className="font-semibold text-zinc-300">{dayKey || "…"}</span>
          </span>

          <button
            onClick={() => handleSelect(lastMode)}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/60 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-900/60 transition"
            title="Volver al último modo jugado"
          >
            Continuar <span className="text-zinc-400">({lastMode})</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* ✅ MENOS COLUMNAS = MÁS AIRE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
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
                  "shadow-[0_20px_60px_rgba(0,0,0,0.45)]",
                  st.won
                    ? "border-emerald-900/60 bg-emerald-950/20 hover:bg-emerald-950/25"
                    : st.played
                      ? "border-zinc-700 bg-zinc-950/60 hover:bg-zinc-900/60"
                      : "border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900/50",
                ].join(" ")}
                title={m.title}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-5 min-w-0">
                    <div
                      className={[
                        "h-16 w-16 rounded-3xl", // ✅ ícono más grande
                        m.color,
                        "flex items-center justify-center text-white shrink-0",
                        "shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
                        "transition-transform duration-200 group-hover:scale-[1.05]",
                      ].join(" ")}
                    >
                      <m.Icon className="h-8 w-8" />
                    </div>

                    <div className="min-w-0">
                      <div className="text-xl font-extrabold truncate">
                        {m.title}
                      </div>
                      <div className="text-sm text-zinc-400">{m.desc}</div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {st.won ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-900/60 bg-emerald-950/30 px-2.5 py-1 text-[11px] font-bold text-emerald-200">
                        <CheckCircle2 className="h-4 w-4" /> Ganado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-950/40 px-2.5 py-1 text-[11px] font-bold text-zinc-300">
                        <CircleDashed className="h-4 w-4" /> Pendiente
                      </span>
                    )}
                  </div>
                </div>

                {/* ✅ footer separado = respira */}
                <div className="mt-6 flex items-center justify-between text-sm">
                  <div className="text-zinc-400">
                    Intentos:{" "}
                    <span className="font-semibold text-zinc-100">
                      {st.attempts}
                    </span>
                  </div>

                  <div className="text-zinc-500 group-hover:text-zinc-200 transition inline-flex items-center gap-2">
                    Jugar{" "}
                    <span className="translate-x-0 group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 text-center text-xs text-zinc-500">
          Podés jugar todos los modos el mismo día
        </div>
      </div>
    </div>
  );
}

export default function App() {
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
      setState(loaded);

      if (loaded.won) {
        addToast({
          kind: "success",
          title: "¡Ganaste!",
          message: "Volvé mañana para un nuevo Pokémon.",
        });
      } else if (loaded.finished) {
        addToast({
          kind: "info",
          title: "Fin del día",
          message: "Ya jugaste hoy. Volvé mañana para un nuevo Pokémon.",
        });
      }
    })().catch((e) => {
      console.error(e);
      setError("No se pudo cargar meta del juego.");
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
      setError("Falló la búsqueda.");
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
        kind: "info",
        title: "Ya jugaste hoy",
        message: "Volvé mañana para un nuevo Pokémon.",
      });
      return;
    }

    if (state.attempts.some((a) => a.id === pick.id)) {
      addToast({
        kind: "info",
        title: "Ya lo intentaste",
        message: "Elegí otro Pokémon.",
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

      const next = {
        dayKey,
        attempts: [attempt, ...state.attempts],
        finished: Boolean(attempt.isCorrect),
        won: Boolean(attempt.isCorrect),
      };

      setState(next);
      saveState(next, mode);
      scheduleReveal();

      if (attempt.isCorrect) {
        addToast({
          kind: "success",
          title: "¡Ganaste!",
          message: "Volvé mañana para un nuevo Pokémon.",
        });
      }
    } catch (e) {
      console.error(e);
      setError(`Falló el intento: ${e.message}`);
      addToast({
        kind: "error",
        title: "Falló el intento",
        message: String(e.message || "Probá de nuevo."),
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
        title: "Elegí un Pokémon",
        message: "Seleccioná uno de la lista.",
      });
      return;
    }
    return handleTryWithItem(selected);
  }

  const attempts = state.attempts;

  // ✅ Render condicional SIN romper hooks
  if (!mode) {
    return (
      <Home
        onSelect={(m) => {
          saveMode(m);
          setMode(m);
        }}
        dayKey={dayKey}
      />
    );
  }

  const showGenColumn = mode === "classic";

  return (
    <div className="min-h-screen bg-[#060708] dark:bg-[#060708] bg-gray-50 text-zinc-100 dark:text-zinc-100 text-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <div className="text-2xl font-black tracking-tight">Pokedle+</div>
            <div className="text-sm text-zinc-400 dark:text-zinc-400 text-gray-500">
              Modo: <span className="font-semibold">{mode}</span> • {dayKey}
            </div>
          </div>

          {/* Language selector inserted */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageSelector />
            <button
              onClick={() => {
                clearMode();
                setMode(null);
              }}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-xs font-extrabold hover:bg-zinc-900/70 transition-colors dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/70 border-gray-300 bg-gray-100 hover:bg-gray-200"
            >
              Cambiar modo
            </button>
          </div>
        </header>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950/40 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)] dark:border-zinc-800 dark:bg-zinc-950/40 border-gray-200 bg-white">
          <div className="mb-4">
            <div className="text-sm font-bold text-zinc-200 dark:text-zinc-200 text-gray-700">
              Adiviná el Pokémon
            </div>
            <div className="mt-2 flex gap-3">
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setSelected(null);
                }}
                placeholder="Ej: pikachu"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/70 dark:placeholder:text-zinc-600 dark:focus:border-zinc-600 border-gray-300 bg-gray-50 placeholder:text-gray-400 focus:border-gray-400"
              />
              <button
                onClick={handleTry}
                disabled={!selected || busy || state.finished}
                className={[
                  "rounded-2xl border border-zinc-800 bg-zinc-900/40 px-5 py-3 text-sm font-extrabold",
                  "hover:bg-zinc-900/70 transition-colors",
                  "disabled:opacity-50 disabled:hover:bg-zinc-900/40",
                  "dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/70",
                  "border-gray-300 bg-gray-100 hover:bg-gray-200",
                ].join(" ")}
              >
                Probar
              </button>
            </div>

            <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-500 text-gray-500">
              Tip: scrolleá la lista para ver más resultados.
            </div>

            {results.length > 0 && (
              <ComboList
                items={results}
                onPick={handlePick}
                disabled={busy || state.finished}
                onScrollBottom={() => {
                  if (!hasMore || loadingMore) return;
                  doSearch(q, offset, true);
                }}
                loadingMore={loadingMore}
                hasMore={hasMore}
              />
            )}
          </div>

          {error && (
            <div className="mb-4">
              <toasts kind="error" title="Error" onClose={() => setError("")}>
                {error}
              </toasts>
            </div>
          )}

          <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/40 dark:border-zinc-800 dark:bg-zinc-950/40 border-gray-200 bg-white">
            <div
              className={[
                "grid gap-2 px-4 py-3 text-[11px] font-black uppercase tracking-wider text-zinc-300",
                "dark:text-zinc-300 text-gray-600",
                showGenColumn
                  ? "grid-cols-[240px,120px,120px,90px,140px,120px,80px,90px,110px]"
                  : "grid-cols-[240px,120px,120px,140px,120px,80px,90px,110px]",
              ].join(" ")}
            >
              <div className="text-left">Pokémon</div>
              <div className="text-center">Tipo 1</div>
              <div className="text-center">Tipo 2</div>

              {showGenColumn && <div className="text-center">Gen</div>}

              <div className="text-center">Hábitat</div>
              <div className="text-center">Color</div>
              <div className="text-center">Evol.</div>
              <div className="text-center">Alt.</div>
              <div className="text-center">Peso</div>
            </div>

            <div className="divide-y divide-zinc-800 dark:divide-zinc-800 divide-gray-200">
              {attempts.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-zinc-500 dark:text-zinc-500 text-gray-500">
                  Todavía no hay intentos. Escribí un nombre y probá.
                </div>
              ) : (
                attempts.map((a, rowIndex) => {
                  const isTop = rowIndex === 0;
                  const gateTop = isTop && revealIndex >= 0;

                  const r = (i) => (gateTop ? canReveal(i) : true);

                  return (
                    <div
                      key={`${a.id}-${rowIndex}`}
                      className={[
                        "grid gap-2 items-center px-4 py-3 hover:bg-zinc-900/30 transition-colors",
                        "dark:hover:bg-zinc-900/30 hover:bg-gray-100",
                        showGenColumn
                          ? "grid-cols-[240px,120px,120px,90px,140px,120px,80px,90px,110px]"
                          : "grid-cols-[240px,120px,120px,140px,120px,80px,90px,110px]",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="rounded-2xl bg-zinc-900/60 p-2 border border-zinc-800 dark:bg-zinc-900/60 dark:border-zinc-800 bg-gray-100 border-gray-200">
                          <img
                            src={a.sprite}
                            alt={a.name}
                            className="h-9 w-9"
                            loading="lazy"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-extrabold capitalize text-zinc-100 dark:text-zinc-100 text-gray-900">
                            {a.name}
                          </div>
                          <div className="text-xs text-zinc-400 dark:text-zinc-400 text-gray-500">
                            #{a.id}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <Pill
                          kind={r(0) ? a.columns.type1 : ""}
                          pop={isTop && r(0)}
                          isDark={isDark}
                        >
                          <span className="capitalize">
                            {a.types?.[0] ?? "none"}
                          </span>
                        </Pill>
                      </div>

                      <div className="flex justify-center">
                        <Pill
                          kind={r(1) ? a.columns.type2 : ""}
                          pop={isTop && r(1)}
                          isDark={isDark}
                        >
                          <span className="capitalize">
                            {a.types?.[1] ?? "none"}
                          </span>
                        </Pill>
                      </div>

                      {showGenColumn && (
                        <div className="flex justify-center">
                          <Pill
                            kind={r(2) ? a.columns.gen : ""}
                            pop={isTop && r(2)}
                            isDark={isDark}
                          >
                            <span>Gen {a.gen}</span>
                            <span className="font-black">
                              {r(2) ? arrow(a.columns.gen) : ""}
                            </span>
                          </Pill>
                        </div>
                      )}

                      <div className="flex justify-center">
                        <Pill
                          kind={r(3) ? a.columns.habitat : ""}
                          pop={isTop && r(3)}
                          isDark={isDark}
                        >
                          <span className="capitalize">{a.habitat}</span>
                        </Pill>
                      </div>

                      <div className="flex justify-center">
                        <Pill
                          kind={r(4) ? a.columns.color : ""}
                          pop={isTop && r(4)}
                          isDark={isDark}
                        >
                          <span className="capitalize">{a.color}</span>
                        </Pill>
                      </div>

                      <div className="flex justify-center">
                        <Pill
                          kind={r(5) ? a.columns.evolution : ""}
                          pop={isTop && r(5)}
                          isDark={isDark}
                        >
                          <span>{a.evolution_stage}</span>
                          <span className="font-black">
                            {r(5) ? arrow(a.columns.evolution) : ""}
                          </span>
                        </Pill>
                      </div>

                      <div className="flex justify-center">
                        <Pill
                          kind={r(6) ? a.columns.height : ""}
                          pop={isTop && r(6)}
                          isDark={isDark}
                        >
                          <span>{formatHeight(a.height_dm)}</span>
                          <span className="font-black">
                            {r(6) ? arrow(a.columns.height) : ""}
                          </span>
                        </Pill>
                      </div>

                      <div className="flex justify-center">
                        <Pill
                          kind={r(7) ? a.columns.weight : ""}
                          pop={isTop && r(7)}
                          isDark={isDark}
                        >
                          <span>{formatWeight(a.weight_hg)}</span>
                          <span className="font-black">
                            {r(7) ? arrow(a.columns.weight) : ""}
                          </span>
                        </Pill>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-5 text-center text-xs text-zinc-600 dark:text-zinc-600 text-gray-400">
            Pokedle+ • estilo original • Tailwind + Netlify
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

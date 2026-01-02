// frontend/src/App.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { apiGuess, apiMeta, apiPokemon, apiSearch } from "./api.js";
import { badgeClass, arrow } from "./ui.js";

/**
 * Storage
 * Guardamos por día: pokedleplus:v1:YYYY-MM-DD
 */
const STORAGE_PREFIX = "pokedleplus:v1:";
function storageKey(dayKey) {
  return `${STORAGE_PREFIX}${dayKey}`;
}
function loadState(dayKey) {
  try {
    const raw = localStorage.getItem(storageKey(dayKey));
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
function saveState(state) {
  try {
    localStorage.setItem(storageKey(state.dayKey), JSON.stringify(state));
  } catch {
    // noop
  }
}

/**
 * UI components
 */
function Pill({ children, kind, pop = false }) {
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
        badgeClass(kind),
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function Toast({ kind = "info", title, children, onClose }) {
  const palette =
    kind === "success"
      ? "border-emerald-800/40 bg-emerald-950/30 text-emerald-100"
      : kind === "error"
      ? "border-rose-800/40 bg-rose-950/30 text-rose-100"
      : "border-zinc-800 bg-zinc-950/40 text-zinc-100";

  return (
    <div className={`rounded-2xl border p-4 ${palette}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-extrabold">{title}</div>
          <div className="mt-1 text-sm opacity-90">{children}</div>
        </div>
        {onClose ? (
          <button
            className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs hover:bg-white/10"
            onClick={onClose}
          >
            ✕
          </button>
        ) : null}
      </div>
    </div>
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
      className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-950/60 overflow-y-auto overscroll-contain"
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
            ].join(" ")}
          >
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-2">
              <img src={o.sprite} alt={o.name} className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-extrabold capitalize">
                {o.name}
              </div>
              <div className="text-xs text-zinc-400">#{o.id}</div>
            </div>
          </button>
        ))}
      </div>

      {(loadingMore || hasMore) && (
        <div className="border-t border-zinc-800 px-3 py-2 text-center text-xs text-zinc-400">
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

export default function App() {
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
  const [toast, setToast] = useState(null);

  const revealTimersRef = useRef([]);
  const [revealIndex, setRevealIndex] = useState(-1);

  useEffect(() => {
    (async () => {
      const meta = await apiMeta();
      setDayKey(meta.dayKey);

      const loaded = loadState(meta.dayKey);
      setState(loaded);

      // Si ya ganó o terminó, muestra toast
      if (loaded.won) {
        setToast({
          kind: "success",
          title: "¡Ganaste!",
          message: "Volvé mañana para un nuevo Pokémon.",
        });
      } else if (loaded.finished) {
        setToast({
          kind: "info",
          title: "Fin del día",
          message: "Ya jugaste hoy. Volvé mañana para un nuevo Pokémon.",
        });
      }
    })().catch((e) => {
      console.error(e);
      setError("No se pudo cargar meta del juego.");
    });

    return () => {
      // cleanup timers
      for (const t of revealTimersRef.current) clearTimeout(t);
      revealTimersRef.current = [];
    };
  }, []);

  async function doSearch(nextQ, nextOffset = 0, append = false) {
    const query = String(nextQ || "").trim();
    if (!query) {
      setResults([]);
      setOffset(0);
      setHasMore(false);
      return;
    }

    try {
      if (append) setLoadingMore(true);
      const res = await apiSearch(query, nextOffset);

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

  useEffect(() => {
    const t = setTimeout(() => {
      doSearch(q, 0, false);
    }, 180);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function scheduleReveal() {
    // Animación: pinta 1 a 1
    for (const t of revealTimersRef.current) clearTimeout(t);
    revealTimersRef.current = [];
    setRevealIndex(-1);

    // 8 columnas a revelar (type1,type2,gen,habitat,color,evolution,height,weight)
    const steps = 8;
    for (let i = 0; i < steps; i++) {
      const timer = setTimeout(() => setRevealIndex(i), 120 * (i + 1));
      revealTimersRef.current.push(timer);
    }
  }

  function canReveal(i) {
    return revealIndex >= i;
  }

  async function handlePick(item) {
    // 1) seteo el seleccionado
    setSelected(item);

    // 2) NO piso el input con el nombre (así no te “escribe” meowscarada)
    //    y cierro la lista para que se sienta como “seleccioné y listo”
    setResults([]);
    setHasMore(false);
    setOffset(0);

    // opcional: limpiar el input
    setQ("");

    // 3) disparo el guess automáticamente
    // (si preferís confirmar con botón, sacá esta línea)
    try {
      // para asegurarnos de usar el item correcto (no depender del state async)
      await handleTryWithItem(item);
    } catch (e) {
      // handleTryWithItem ya maneja toast/error, pero por si acaso
      console.error(e);
    }
  }


  async function handleTry() {
    if (!dayKey) return;

    // Si no hay selected, intentamos resolverlo por nombre exacto dentro de results
    let pick = selected;

    if (!pick) {
      const name = String(q || "").trim().toLowerCase();
      if (!name) {
        setToast({
          kind: "info",
          title: "Elegí un Pokémon",
          message: "Escribí un nombre o seleccioná uno de la lista.",
        });
        return;
      }

      // buscamos coincidencia exacta en results
      const exact = results.find((r) => String(r.name).toLowerCase() === name);

      if (exact) {
        pick = exact;
        setSelected(exact); // opcional: así queda marcado
      } else {
        setToast({
          kind: "info",
          title: "Seleccioná de la lista",
          message:
            "Para evitar errores de escritura, elegí el Pokémon desde la lista (clic).",
        });
        return;
      }
    }

    if (state.finished) {
      setToast({
        kind: "info",
        title: "Ya jugaste hoy",
        message: "Volvé mañana para un nuevo Pokémon.",
      });
      return;
    }

    if (state.attempts.some((a) => a.id === pick.id)) {
      setToast({
        kind: "info",
        title: "Ya lo intentaste",
        message: "Elegí otro Pokémon.",
      });
      return;
    }

    setBusy(true);
    setError("");

    try {
      const p = await apiPokemon(pick.id);
      const g = await apiGuess(pick.id, dayKey);

      const attempt = {
        id: p.id,
        name: p.name,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`,
        types: Array.isArray(p.types) ? p.types : [],
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
      saveState(next);
      scheduleReveal();

      if (attempt.isCorrect) {
        setToast({
          kind: "success",
          title: "¡Ganaste!",
          message: "Volvé mañana para un nuevo Pokémon.",
        });
      }
    } catch (e) {
      console.error(e);
      setError(`Falló el intento: ${e.message}`);
      setToast({
        kind: "error",
        title: "Falló el intento",
        message: String(e.message || "Probá de nuevo."),
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleTryWithItem(pick) {
  if (!dayKey) return;
  if (!pick) return;

  if (state.finished) {
    setToast({
      kind: "info",
      title: "Ya jugaste hoy",
      message: "Volvé mañana para un nuevo Pokémon.",
    });
    return;
  }

  if (state.attempts.some((a) => a.id === pick.id)) {
    setToast({
      kind: "info",
      title: "Ya lo intentaste",
      message: "Elegí otro Pokémon.",
    });
    return;
  }

  setBusy(true);
  setError("");

  try {
    const p = await apiPokemon(pick.id);
    const g = await apiGuess(pick.id, dayKey);

    const attempt = {
      id: p.id,
      name: p.name,
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`,
      types: Array.isArray(p.types) ? p.types : [],
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
    saveState(next);
    scheduleReveal();

    if (attempt.isCorrect) {
      setToast({
        kind: "success",
        title: "¡Ganaste!",
        message: "Volvé mañana para un nuevo Pokémon.",
      });
    }
  } catch (e) {
    console.error(e);
    setError(`Falló el intento: ${e.message}`);
    setToast({
      kind: "error",
      title: "Falló el intento",
      message: String(e.message || "Probá de nuevo."),
    });
  } finally {
    setBusy(false);
  }
}

// handleTry queda como wrapper si apretás el botón
async function handleTry() {
  if (!selected) {
    setToast({
      kind: "info",
      title: "Elegí un Pokémon",
      message: "Seleccioná uno de la lista.",
    });
    return;
  }
  return handleTryWithItem(selected);
}

  const attempts = state.attempts;

  return (
    <div className="min-h-screen bg-[#060708] text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <div className="text-2xl font-black tracking-tight">Pokedle+</div>
            <div className="text-sm text-zinc-400">
              Pokémon del día • {dayKey || "—"}
            </div>
          </div>
          <div className="text-xs text-zinc-500">data</div>
        </header>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950/40 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <div className="mb-4">
            <div className="text-sm font-bold text-zinc-200">
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
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-zinc-600"
              />
              <button
                onClick={handleTry}
                disabled={!selected || busy || state.finished}
                className={[
                  "rounded-2xl border border-zinc-800 bg-zinc-900/40 px-5 py-3 text-sm font-extrabold",
                  "hover:bg-zinc-900/70 transition-colors",
                  "disabled:opacity-50 disabled:hover:bg-zinc-900/40",
                ].join(" ")}
              >
                Probar
              </button>
            </div>

            <div className="mt-2 text-xs text-zinc-500">
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

          {toast && (
            <div className="mb-4">
              <Toast
                kind={toast.kind}
                title={toast.title}
                onClose={() => setToast(null)}
              >
                {toast.message}
              </Toast>
            </div>
          )}

          {error && (
            <div className="mb-4">
              <Toast kind="error" title="Error" onClose={() => setError("")}>
                {error}
              </Toast>
            </div>
          )}

          <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/40">
            <div className="grid grid-cols-[240px,120px,120px,90px,140px,120px,80px,90px,110px] gap-2 px-4 py-3 text-[11px] font-black uppercase tracking-wider text-zinc-300">
              <div className="text-left">Pokémon</div>
              <div className="text-center">Tipo 1</div>
              <div className="text-center">Tipo 2</div>
              <div className="text-center">Gen</div>
              <div className="text-center">Hábitat</div>
              <div className="text-center">Color</div>
              <div className="text-center">Evol.</div>
              <div className="text-center">Alt.</div>
              <div className="text-center">Peso</div>
            </div>

            <div className="divide-y divide-zinc-800">
              {attempts.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-zinc-500">
                  Todavía no hay intentos. Escribí un nombre y probá.
                </div>
              ) : (
                attempts.map((a, rowIndex) => {
                  // Revelado: solo la primera fila recién agregada
                  const isTop = rowIndex === 0;
                  const r = (i) => (isTop ? canReveal(i) : true);

                  return (
                    <div
                      key={`${a.id}-${rowIndex}`}
                      className="grid grid-cols-[240px,120px,120px,90px,140px,120px,80px,90px,110px] gap-2 items-center px-4 py-3 hover:bg-zinc-900/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="rounded-2xl bg-zinc-900/60 p-2 border border-zinc-800">
                          <img
                            src={a.sprite}
                            alt={a.name}
                            className="h-9 w-9"
                            loading="lazy"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-extrabold capitalize text-zinc-100">
                            {a.name}
                          </div>
                          <div className="text-xs text-zinc-400">#{a.id}</div>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <Pill kind={r(0) ? a.columns.type1 : ""} pop={isTop && r(0)}>
                          <span className="capitalize">{a.types?.[0] ?? "none"}</span>
                        </Pill>
                      </div>

                      <div className="flex justify-center">
                        <Pill kind={r(1) ? a.columns.type2 : ""} pop={isTop && r(1)}>
                          <span className="capitalize">{a.types?.[1] ?? "none"}</span>
                        </Pill>
                      </div>

                      <div className="flex justify-center">
                        <Pill kind={r(2) ? a.columns.gen : ""} pop={isTop && r(2)}>
                          <span>Gen {a.gen}</span>
                          <span className="font-black">{r(2) ? arrow(a.columns.gen) : ""}</span>
                        </Pill>
                      </div>

                      <div className="flex justify-center">
                        <Pill kind={r(3) ? a.columns.habitat : ""} pop={isTop && r(3)}>
                          <span className="capitalize">{a.habitat}</span>
                        </Pill>
                      </div>

                      <div className="flex justify-center">
                        <Pill kind={r(4) ? a.columns.color : ""} pop={isTop && r(4)}>
                          <span className="capitalize">{a.color}</span>
                        </Pill>
                      </div>

                      <div className="flex justify-center">
                        <Pill kind={r(5) ? a.columns.evolution : ""} pop={isTop && r(5)}>
                          <span>{a.evolution_stage}</span>
                          <span className="font-black">
                            {r(5) ? arrow(a.columns.evolution) : ""}
                          </span>
                        </Pill>
                      </div>

                      <div className="flex justify-center">
                        <Pill kind={r(6) ? a.columns.height : ""} pop={isTop && r(6)}>
                          <span>{formatHeight(a.height_dm)}</span>
                          <span className="font-black">
                            {r(6) ? arrow(a.columns.height) : ""}
                          </span>
                        </Pill>
                      </div>

                      <div className="flex justify-center">
                        <Pill kind={r(7) ? a.columns.weight : ""} pop={isTop && r(7)}>
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

          <div className="mt-5 text-center text-xs text-zinc-600">
            Pokedle+ • estilo original • Tailwind + Netlify
          </div>
        </div>
      </div>
    </div>
  );
}

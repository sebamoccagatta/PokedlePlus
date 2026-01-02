const KEY_PREFIX = "pokedleplus:v1:";

function keyForDay(dayKey) {
  return `${KEY_PREFIX}${dayKey}`;
}

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function loadState(dayKey) {
  const empty = { dayKey, attempts: [], finished: false };

  if (!dayKey || dayKey === "...") return empty;

  const raw = localStorage.getItem(keyForDay(dayKey));
  if (!raw) return empty;

  const data = safeParse(raw);
  if (!data || typeof data !== "object") return empty;

  // Validación mínima + normalización
  const attempts = Array.isArray(data.attempts) ? data.attempts : [];
  const finished = Boolean(data.finished);

  return { dayKey, attempts, finished };
}

export function saveState(state) {
  if (!state || !state.dayKey || state.dayKey === "...") return;

  const payload = {
    dayKey: state.dayKey,
    attempts: Array.isArray(state.attempts) ? state.attempts : [],
    finished: Boolean(state.finished),
  };

  localStorage.setItem(keyForDay(state.dayKey), JSON.stringify(payload));
}

// (Opcional) limpiar días viejos para no acumular infinito
export function pruneOldStates(keepLastDays = 30) {
  // Guardamos en UTC para que coincida con dayKey del backend
  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;

  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(KEY_PREFIX)) keys.push(k);
  }

  const keepSet = new Set();
  for (let i = 0; i < keepLastDays; i++) {
    const d = new Date(now.getTime() - i * msPerDay);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    keepSet.add(keyForDay(`${y}-${m}-${day}`));
  }

  for (const k of keys) {
    if (!keepSet.has(k)) localStorage.removeItem(k);
  }
}

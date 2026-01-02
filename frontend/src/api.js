function localDayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function jsonOrThrow(res, label) {
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {}
  if (!res.ok) {
    const msg =
      data?.message || data?.error || text || label || "request_failed";
    throw new Error(msg);
  }
  return data;
}

export async function apiMeta() {
  const dayKey = localDayKey();
  const res = await fetch(`/api/meta?dayKey=${encodeURIComponent(dayKey)}`);
  return jsonOrThrow(res, "meta_failed");
}

export async function apiSearch(q, offset = 0) {
  const res = await fetch(
    `/api/search?q=${encodeURIComponent(q)}&offset=${offset}`
  );
  return jsonOrThrow(res, "search_failed");
}

// ✅ soporta /api/pokemon?id= y también /api/pokemon/ID
export async function apiPokemon(id) {
  const res = await fetch(`/api/pokemon/${id}`);
  return jsonOrThrow(res, "pokemon_failed");
}

export async function apiGuess(guessId, dayKey) {
  const res = await fetch(`/api/guess`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ guessId, dayKey }),
  });
  return jsonOrThrow(res, "guess_failed");
}

// frontend/src/api.js
import { searchCache } from './cache/searchCache.js';

async function jsonOrText(res, errorCode) {
  const text = await res.text();

  if (!res.ok) {
    throw new Error(`${errorCode}: ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiMeta(mode) {
  const res = await fetch(
    `/api/meta?mode=${encodeURIComponent(mode || "classic")}`
  );
  return jsonOrText(res, "meta_failed");
}

export async function apiSearch(q, offset = 0, mode = "classic", opts = {}) {
  const query = String(q || "").trim();
  
  if (offset === 0 && query) {
    const cached = searchCache.get(query, mode);
    if (cached) {
      return cached;
    }
  }

  const res = await fetch(
    `/api/search?q=${encodeURIComponent(query)}&offset=${offset}&mode=${encodeURIComponent(mode)}`,
    { signal: opts.signal }
  );
  
  const data = await jsonOrText(res, "search_failed");

  if (offset === 0 && data.items && data.items.length > 0) {
    searchCache.set(query, mode, data);
  }

  return data;
}

export async function apiPokemon(id) {
  const res = await fetch(`/api/pokemon/${id}`);
  const data = await jsonOrText(res, "pokemon_failed");

  return {
    ...data,
    types: Array.isArray(data.types)
      ? data.types
      : typeof data.types === "string"
      ? data.types.split(",").map((t) => t.trim())
      : [],
    habitat: typeof data.habitat === "string" ? data.habitat : "unknown",
    color: typeof data.color === "string" ? data.color : "unknown",
  };
}

export async function apiGuess(guessId, dayKey, mode = "classic") {
  const res = await fetch(`/api/guess`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ guessId, dayKey, mode }),
  });
  return jsonOrText(res, "guess_failed");
}

export async function prefetchPokemon(id) {
  try {
    fetch(`/api/pokemon/${id}`);
  } catch {}
}
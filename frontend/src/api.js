// frontend/src/api.js
import { searchCache } from "./cache/searchCache.js";
import { validators } from "@shared/validation.mjs";

const SEARCH_VERSION = "2";

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
  // Validate mode
  const modeValidation = validators.mode(mode);
  if (!modeValidation.valid) {
    throw new Error(`Invalid mode: ${modeValidation.error}`);
  }

  const res = await fetch(
    `/api/meta?mode=${encodeURIComponent(mode || "classic")}`,
  );
  return jsonOrText(res, "meta_failed");
}

export async function apiSearch(q, offset = 0, mode = "classic", opts = {}) {
  const query = String(q || "").trim();

  // Validate inputs
  const queryValidation = validators.searchQuery(query);
  if (!queryValidation.valid) {
    throw new Error(`Invalid search query: ${queryValidation.error}`);
  }

  const offsetValidation = validators.offset(offset);
  if (!offsetValidation.valid) {
    throw new Error(`Invalid offset: ${offsetValidation.error}`);
  }

  const modeValidation = validators.mode(mode);
  if (!modeValidation.valid) {
    throw new Error(`Invalid mode: ${modeValidation.error}`);
  }

  if (offset === 0 && query) {
    const cached = searchCache.get(query, mode);
    if (cached) {
      return cached;
    }
  }

  const res = await fetch(
    `/api/search?q=${encodeURIComponent(query)}&offset=${offset}&mode=${encodeURIComponent(mode)}&sv=${SEARCH_VERSION}`,
    { signal: opts.signal },
  );

  const data = await jsonOrText(res, "search_failed");

  if (offset === 0 && data.items && data.items.length > 0) {
    searchCache.set(query, mode, data);
  }

  return data;
}

export async function apiPokemon(id, mode = "classic") {
  // Validate inputs
  const idValidation = validators.pokemonId(id);
  if (!idValidation.valid) {
    throw new Error(`Invalid Pokemon ID: ${idValidation.error}`);
  }

  const modeValidation = validators.mode(mode);
  if (!modeValidation.valid) {
    throw new Error(`Invalid mode: ${modeValidation.error}`);
  }

  const res = await fetch(
    `/api/pokemon/${id}?mode=${encodeURIComponent(mode || "classic")}`,
  );
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
  // Validate inputs
  const guessIdValidation = validators.pokemonId(guessId);
  if (!guessIdValidation.valid) {
    throw new Error(`Invalid guess ID: ${guessIdValidation.error}`);
  }

  const dayKeyValidation = validators.dayKey(dayKey);
  if (!dayKeyValidation.valid) {
    throw new Error(`Invalid day key: ${dayKeyValidation.error}`);
  }

  const modeValidation = validators.mode(mode);
  if (!modeValidation.valid) {
    throw new Error(`Invalid mode: ${modeValidation.error}`);
  }

  const res = await fetch(`/api/guess`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ guessId, dayKey, mode }),
  });
  return jsonOrText(res, "guess_failed");
}

export async function apiSilhouetteTarget(dayKey, mode = "classic") {
  const dayKeyValidation = validators.dayKey(dayKey);
  if (!dayKeyValidation.valid) {
    throw new Error(`Invalid day key: ${dayKeyValidation.error}`);
  }

  const modeValidation = validators.mode(mode);
  if (!modeValidation.valid) {
    throw new Error(`Invalid mode: ${modeValidation.error}`);
  }

  const res = await fetch(
    `/api/silhouette-target?dayKey=${encodeURIComponent(dayKey)}&mode=${encodeURIComponent(mode)}`,
  );
  return jsonOrText(res, "silhouette_target_failed");
}

export async function prefetchPokemon(id) {
  try {
    fetch(`/api/pokemon/${id}`);
  } catch {}
}

/**
 * Shared Input Validation for Pokedle+
 *
 * CommonJS entrypoint for Netlify Functions and Node scripts.
 */

const VALID_MODES = [
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
  "infinite",
];

const MIN_POKEMON_ID = 1;
const MAX_POKEMON_ID = 1025;
const MAX_SEARCH_QUERY_LENGTH = 100;

function validateDayKey(value) {
  if (!value || typeof value !== "string") {
    return { valid: false, error: "Day key is required and must be a string" };
  }

  const dayKeyRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

  if (!dayKeyRegex.test(value)) {
    return {
      valid: false,
      error: "Day key must be in YYYY-MM-DD format (e.g., 2026-04-02)",
    };
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return { valid: false, error: "Day key is not a valid date" };
  }

  return { valid: true };
}

function validateMode(value) {
  if (!value) {
    return { valid: true };
  }

  if (typeof value !== "string") {
    return { valid: false, error: "Mode must be a string" };
  }

  const normalized = value.toLowerCase().trim();

  if (!VALID_MODES.includes(normalized)) {
    return {
      valid: false,
      error: `Mode must be one of: ${VALID_MODES.join(", ")}`,
    };
  }

  return { valid: true };
}

function validateSearchQuery(value) {
  if (value === null || value === undefined || value === "") {
    return { valid: true };
  }

  if (typeof value !== "string") {
    return { valid: false, error: "Search query must be a string" };
  }

  if (value.length > MAX_SEARCH_QUERY_LENGTH) {
    return {
      valid: false,
      error: `Search query must be ${MAX_SEARCH_QUERY_LENGTH} characters or less`,
    };
  }

  return { valid: true };
}

function validatePokemonId(value) {
  if (value === null || value === undefined) {
    return { valid: false, error: "Pokemon ID is required" };
  }

  const id = Number(value);

  if (isNaN(id) || !Number.isInteger(id)) {
    return { valid: false, error: "Pokemon ID must be an integer" };
  }

  if (id < MIN_POKEMON_ID || id > MAX_POKEMON_ID) {
    return {
      valid: false,
      error: `Pokemon ID must be between ${MIN_POKEMON_ID} and ${MAX_POKEMON_ID}`,
    };
  }

  return { valid: true };
}

function validateOffset(value) {
  if (value === null || value === undefined || value === "" || value === 0) {
    return { valid: true };
  }

  const offset = Number(value);

  if (isNaN(offset) || !Number.isInteger(offset)) {
    return { valid: false, error: "Offset must be an integer" };
  }

  if (offset < 0) {
    return { valid: false, error: "Offset must be non-negative" };
  }

  if (offset > 10000) {
    return {
      valid: false,
      error: "Offset is too large (max 10000)",
    };
  }

  return { valid: true };
}

function validateLimit(value) {
  if (value === null || value === undefined || value === "") {
    return { valid: true };
  }

  const limit = Number(value);

  if (isNaN(limit) || !Number.isInteger(limit)) {
    return { valid: false, error: "Limit must be an integer" };
  }

  if (limit < 1) {
    return { valid: false, error: "Limit must be at least 1" };
  }

  if (limit > 200) {
    return { valid: false, error: "Limit must be 200 or less" };
  }

  return { valid: true };
}

const validators = {
  dayKey: validateDayKey,
  mode: validateMode,
  searchQuery: validateSearchQuery,
  pokemonId: validatePokemonId,
  offset: validateOffset,
  limit: validateLimit,
};

module.exports = { validators, VALID_MODES };

module.exports.default = module.exports;

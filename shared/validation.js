/**
 * Shared Input Validation for Pokedle+
 *
 * This module provides validators used by both frontend and backend
 * to ensure data integrity and security.
 *
 * All validators return: { valid: boolean, error?: string }
 */

// Valid game modes
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

// Pokemon ID range (Gen 1-9)
const MIN_POKEMON_ID = 1;
const MAX_POKEMON_ID = 1025;

// Search query limits
const MAX_SEARCH_QUERY_LENGTH = 100;

/**
 * Validate day key format (YYYY-MM-DD)
 */
function validateDayKey(value) {
  if (!value || typeof value !== "string") {
    return { valid: false, error: "Day key is required and must be a string" };
  }

  // Regex for YYYY-MM-DD format
  const dayKeyRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

  if (!dayKeyRegex.test(value)) {
    return {
      valid: false,
      error: "Day key must be in YYYY-MM-DD format (e.g., 2026-04-02)",
    };
  }

  // Additional validation: check if it's a valid date
  // AND that it doesn't get normalized (e.g., 2026-02-30 → 2026-03-02)
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

/**
 * Validate game mode against whitelist
 */
function validateMode(value) {
  if (!value) {
    // Mode is optional, defaults to "classic"
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

/**
 * Validate search query
 */
function validateSearchQuery(value) {
  if (value === null || value === undefined || value === "") {
    // Empty query is valid (returns empty results)
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

/**
 * Validate Pokemon ID
 */
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

/**
 * Validate offset parameter (for pagination)
 */
function validateOffset(value) {
  if (value === null || value === undefined || value === "" || value === 0) {
    // 0 or empty is valid (first page)
    return { valid: true };
  }

  const offset = Number(value);

  if (isNaN(offset) || !Number.isInteger(offset)) {
    return { valid: false, error: "Offset must be an integer" };
  }

  if (offset < 0) {
    return { valid: false, error: "Offset must be non-negative" };
  }

  // Reasonable upper limit to prevent abuse
  if (offset > 10000) {
    return {
      valid: false,
      error: "Offset is too large (max 10000)",
    };
  }

  return { valid: true };
}

/**
 * Validate limit parameter (for pagination)
 */
function validateLimit(value) {
  if (value === null || value === undefined || value === "") {
    // No limit specified, will use default
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

// Export for both ES modules (frontend) and CommonJS (backend)
const validators = {
  dayKey: validateDayKey,
  mode: validateMode,
  searchQuery: validateSearchQuery,
  pokemonId: validatePokemonId,
  offset: validateOffset,
  limit: validateLimit,
};

// ES module export
export { validators, VALID_MODES };

// CommonJS export (for Node.js backend)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { validators, VALID_MODES };
}

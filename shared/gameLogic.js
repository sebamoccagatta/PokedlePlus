/**
 * Shared Game Logic for Pokedle+
 *
 * This module contains the core game comparison logic used by both
 * frontend and backend. It's the single source of truth for how
 * guesses are evaluated against the target Pokémon.
 *
 * IMPORTANT: This file is shared between frontend (ES modules) and
 * backend (CommonJS). Any changes here affect both sides.
 */

/**
 * FNV-1a hash function (32-bit)
 * Used for deterministic daily target selection
 */
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/**
 * Compare text attributes (exact match only)
 * Returns 'correct' if match, 'absent' otherwise
 */
function kindText(a, b) {
  if (!a || !b) return a === b ? "correct" : "absent";
  return a === b ? "correct" : "absent";
}

/**
 * Compare numeric attributes (with higher/lower hints)
 * Returns 'correct', 'higher', or 'lower'
 */
function kindNumber(guess, target) {
  if (guess === target) return "correct";
  return guess > target ? "higher" : "lower";
}

/**
 * Compare type attributes (supports partial matches)
 * Returns 'correct', 'present', or 'absent'
 *
 * 'present' means the guessed type exists somewhere in target's types
 * (even if not in the same position)
 */
function kindType(pos, guessTypes, targetTypes) {
  const g = guessTypes?.[pos] ?? null;
  const t = targetTypes?.[pos] ?? null;
  if (!g) return t ? "absent" : "correct";
  if (t === g) return "correct";
  if (Array.isArray(targetTypes) && targetTypes.includes(g)) return "present";
  return "absent";
}

/**
 * Compare a guess against the target Pokémon
 *
 * @param {Object} params
 * @param {Object} params.target - The target Pokémon to guess
 * @param {Object} params.guess - The guessed Pokémon
 * @returns {Object} Comparison result with column-by-column analysis
 */
function compareGuess({ target, guess }) {
  const tTypes = target.types || [];
  const gTypes = guess.types || [];

  const gen = kindNumber(guess.gen, target.gen);
  const height = kindNumber(guess.height_dm, target.height_dm);
  const weight = kindNumber(guess.weight_hg, target.weight_hg);
  const evolution = kindNumber(guess.evolution_stage, target.evolution_stage);

  return {
    id: guess.id,
    name: guess.name,
    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${guess.id}.png`,
    isCorrect: guess.id === target.id,
    columns: {
      type1: kindType(0, gTypes, tTypes),
      type2: kindType(1, gTypes, tTypes),
      gen,
      habitat: kindText(guess.habitat, target.habitat),
      color: kindText(guess.color, target.color),
      evolution,
      height,
      weight,
    },
  };
}

// ES module exports (primary)
export { fnv1a, compareGuess };

// Default export for convenience
export default {
  fnv1a,
  compareGuess,
};

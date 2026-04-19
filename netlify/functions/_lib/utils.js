/**
 * Backend-specific utilities
 *
 * Core game logic (compareGuess, fnv1a) has been moved to shared/gameLogic.cjs
 * This file now only contains backend-specific utilities.
 */

// Import shared game logic from the shared module
const { fnv1a, compareGuess } = require("../../../shared/gameLogic.cjs");

function normalizeName(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
}

function pickDailyTargetId({ secret, dayKey, count }) {
  const h = fnv1a(`${secret}:${dayKey}`);
  const idx = (h % count) + 1; // 1..count
  return idx;
}

function kindEq(a, b) {
  return a === b ? "correct" : "absent";
}

module.exports = {
  normalizeName,
  fnv1a, // Re-export from shared
  pickDailyTargetId,
  compareGuess, // Re-export from shared
};

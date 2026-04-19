#!/usr/bin/env node
/**
 * Verification script to ensure frontend and backend use the same game logic
 *
 * This script tests that:
 * 1. Both frontend and backend can import the shared game logic
 * 2. The functions produce identical results
 * 3. They reference the same underlying code
 */

const backendUtils = require("../netlify/functions/_lib/utils.js");
const shared = require("../shared/gameLogic.js");
const sharedLogic = shared.default || shared;

console.log("=== Shared Game Logic Verification ===\n");

// Test data
const target = {
  id: 1,
  name: "bulbasaur",
  types: ["grass", "poison"],
  gen: 1,
  habitat: "grassland",
  color: "green",
  evolution_stage: 1,
  height_dm: 7,
  weight_hg: 69,
};

const guess = {
  id: 4,
  name: "charmander",
  types: ["fire"],
  gen: 1,
  habitat: "mountain",
  color: "red",
  evolution_stage: 1,
  height_dm: 6,
  weight_hg: 85,
};

// Test 1: Function availability
console.log("✓ Test 1: Functions are exported");
console.log("  Backend utils.compareGuess:", typeof backendUtils.compareGuess);
console.log("  Backend utils.fnv1a:", typeof backendUtils.fnv1a);
console.log("  Shared compareGuess:", typeof sharedLogic.compareGuess);
console.log("  Shared fnv1a:", typeof sharedLogic.fnv1a);
console.log();

// Test 2: Same reference (they should point to the same function)
console.log("✓ Test 2: Backend re-exports shared code (same reference)");
console.log(
  "  compareGuess same reference:",
  backendUtils.compareGuess === sharedLogic.compareGuess
);
console.log("  fnv1a same reference:", backendUtils.fnv1a === sharedLogic.fnv1a);
console.log();

// Test 3: Identical results
const backendResult = backendUtils.compareGuess({ target, guess });
const sharedResult = sharedLogic.compareGuess({ target, guess });

console.log("✓ Test 3: Identical results");
console.log(
  "  isCorrect matches:",
  backendResult.isCorrect === sharedResult.isCorrect
);
console.log(
  "  type1 matches:",
  backendResult.columns.type1 === sharedResult.columns.type1
);
console.log(
  "  gen matches:",
  backendResult.columns.gen === sharedResult.columns.gen
);
console.log(
  "  habitat matches:",
  backendResult.columns.habitat === sharedResult.columns.habitat
);
console.log(
  "  color matches:",
  backendResult.columns.color === sharedResult.columns.color
);
console.log();

// Test 4: Hash consistency
const testString = "2025-01-01|classic";
const backendHash = backendUtils.fnv1a(testString);
const sharedHash = sharedLogic.fnv1a(testString);

console.log("✓ Test 4: Hash function consistency");
console.log("  Backend hash:", backendHash);
console.log("  Shared hash:", sharedHash);
console.log("  Hashes match:", backendHash === sharedHash);
console.log();

// Summary
const allTestsPass =
  backendUtils.compareGuess === sharedLogic.compareGuess &&
  backendUtils.fnv1a === sharedLogic.fnv1a &&
  backendResult.isCorrect === sharedResult.isCorrect &&
  backendHash === sharedHash;

if (allTestsPass) {
  console.log("✅ All tests passed! Shared logic is working correctly.");
  process.exit(0);
} else {
  console.error("❌ Some tests failed! Check the output above.");
  process.exit(1);
}

#!/usr/bin/env node
/**
 * Comprehensive test suite for shared game logic
 * Tests edge cases and ensures correctness of compareGuess and fnv1a
 */

const { compareGuess, fnv1a } = require("../shared/gameLogic.js");

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    testsPassed++;
  } catch (error) {
    console.error(`✗ ${name}: ${error.message}`);
    testsFailed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

console.log("=== Game Logic Test Suite ===\n");

// FNV1a hash tests
test("fnv1a: produces consistent hashes", () => {
  const hash1 = fnv1a("test");
  const hash2 = fnv1a("test");
  assert(hash1 === hash2, "Same input should produce same hash");
  assert(typeof hash1 === "number", "Hash should be a number");
  assert(hash1 > 0, "Hash should be positive");
});

test("fnv1a: produces different hashes for different inputs", () => {
  const hash1 = fnv1a("test1");
  const hash2 = fnv1a("test2");
  assert(hash1 !== hash2, "Different inputs should produce different hashes");
});

test("fnv1a: handles empty string", () => {
  const hash = fnv1a("");
  assert(typeof hash === "number", "Should return number for empty string");
});

// compareGuess tests - exact match
test("compareGuess: exact match returns all correct", () => {
  const pokemon = {
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

  const result = compareGuess({ target: pokemon, guess: pokemon });

  assert(result.isCorrect === true, "Should be correct");
  assert(result.columns.type1 === "correct", "Type1 should be correct");
  assert(result.columns.type2 === "correct", "Type2 should be correct");
  assert(result.columns.gen === "correct", "Gen should be correct");
  assert(result.columns.habitat === "correct", "Habitat should be correct");
  assert(result.columns.color === "correct", "Color should be correct");
  assert(result.columns.evolution === "correct", "Evolution should be correct");
  assert(result.columns.height === "correct", "Height should be correct");
  assert(result.columns.weight === "correct", "Weight should be correct");
});

// Type matching tests
test("compareGuess: type in wrong position shows present", () => {
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
    id: 2,
    name: "test",
    types: ["poison", "grass"], // Swapped types
    gen: 1,
    habitat: "grassland",
    color: "green",
    evolution_stage: 1,
    height_dm: 7,
    weight_hg: 69,
  };

  const result = compareGuess({ target, guess });

  assert(
    result.columns.type1 === "present",
    "Type1 should be present (poison is in target)"
  );
  assert(
    result.columns.type2 === "present",
    "Type2 should be present (grass is in target)"
  );
});

test("compareGuess: single type vs dual type", () => {
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
    id: 2,
    name: "test",
    types: ["grass"], // Only one type
    gen: 1,
    habitat: "grassland",
    color: "green",
    evolution_stage: 1,
    height_dm: 7,
    weight_hg: 69,
  };

  const result = compareGuess({ target, guess });

  assert(result.columns.type1 === "correct", "Type1 should be correct");
  assert(result.columns.type2 === "absent", "Type2 should be absent");
});

// Numeric comparison tests
test("compareGuess: higher/lower for numeric values", () => {
  const target = {
    id: 1,
    name: "bulbasaur",
    types: ["grass"],
    gen: 5,
    habitat: "grassland",
    color: "green",
    evolution_stage: 2,
    height_dm: 10,
    weight_hg: 100,
  };

  const guess = {
    id: 2,
    name: "test",
    types: ["grass"],
    gen: 3,
    habitat: "grassland",
    color: "green",
    evolution_stage: 1,
    height_dm: 15,
    weight_hg: 50,
  };

  const result = compareGuess({ target, guess });

  assert(result.columns.gen === "lower", "Gen should be lower (3 < 5)");
  assert(
    result.columns.evolution === "lower",
    "Evolution should be lower (1 < 2)"
  );
  assert(result.columns.height === "higher", "Height should be higher (15 > 10)");
  assert(result.columns.weight === "lower", "Weight should be lower (50 < 100)");
});

// Text attribute tests
test("compareGuess: text attributes exact match only", () => {
  const target = {
    id: 1,
    name: "bulbasaur",
    types: ["grass"],
    gen: 1,
    habitat: "grassland",
    color: "green",
    evolution_stage: 1,
    height_dm: 7,
    weight_hg: 69,
  };

  const guess = {
    id: 2,
    name: "test",
    types: ["grass"],
    gen: 1,
    habitat: "forest",
    color: "red",
    evolution_stage: 1,
    height_dm: 7,
    weight_hg: 69,
  };

  const result = compareGuess({ target, guess });

  assert(
    result.columns.habitat === "absent",
    "Habitat should be absent (no partial match)"
  );
  assert(
    result.columns.color === "absent",
    "Color should be absent (no partial match)"
  );
});

// Edge case: missing/null values
test("compareGuess: handles missing types gracefully", () => {
  const target = {
    id: 1,
    name: "bulbasaur",
    types: [],
    gen: 1,
    habitat: "grassland",
    color: "green",
    evolution_stage: 1,
    height_dm: 7,
    weight_hg: 69,
  };

  const guess = {
    id: 2,
    name: "test",
    types: [],
    gen: 1,
    habitat: "grassland",
    color: "green",
    evolution_stage: 1,
    height_dm: 7,
    weight_hg: 69,
  };

  const result = compareGuess({ target, guess });

  assert(result.columns.type1 === "correct", "Empty type1 should match empty");
  assert(result.columns.type2 === "correct", "Empty type2 should match empty");
});

// Result structure tests
test("compareGuess: returns correct structure", () => {
  const target = {
    id: 1,
    name: "bulbasaur",
    types: ["grass"],
    gen: 1,
    habitat: "grassland",
    color: "green",
    evolution_stage: 1,
    height_dm: 7,
    weight_hg: 69,
  };

  const guess = {
    id: 2,
    name: "test",
    types: ["fire"],
    gen: 2,
    habitat: "mountain",
    color: "red",
    evolution_stage: 2,
    height_dm: 10,
    weight_hg: 100,
  };

  const result = compareGuess({ target, guess });

  assert(typeof result.id === "number", "Should have id");
  assert(typeof result.name === "string", "Should have name");
  assert(typeof result.sprite === "string", "Should have sprite URL");
  assert(typeof result.isCorrect === "boolean", "Should have isCorrect");
  assert(typeof result.columns === "object", "Should have columns object");
  assert(
    result.sprite.includes(String(guess.id)),
    "Sprite URL should include guess ID"
  );
});

console.log(`\n=== Test Results ===`);
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsFailed}`);

if (testsFailed > 0) {
  console.error("\n❌ Some tests failed!");
  process.exit(1);
} else {
  console.log("\n✅ All tests passed!");
  process.exit(0);
}

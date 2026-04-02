// scripts/test-validation.js
// Comprehensive test suite for input validation

const { validators } = require("../shared/validation.js");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (e) {
    console.log(`✗ ${name}`);
    console.log(`  Error: ${e.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

console.log("=== Input Validation Test Suite ===\n");

// ===== DAY KEY TESTS =====
console.log("Testing dayKey validator:");
console.log("─".repeat(80));

test("dayKey: valid date (2026-04-02)", () => {
  const result = validators.dayKey("2026-04-02");
  assert(result.valid === true, "Should be valid");
});

test("dayKey: valid date (2025-12-31)", () => {
  const result = validators.dayKey("2025-12-31");
  assert(result.valid === true, "Should be valid");
});

test("dayKey: invalid format (04-02-2026)", () => {
  const result = validators.dayKey("04-02-2026");
  assert(result.valid === false, "Should be invalid");
  assert(result.error.includes("YYYY-MM-DD"), "Error should mention format");
});

test("dayKey: invalid format (2026/04/02)", () => {
  const result = validators.dayKey("2026/04/02");
  assert(result.valid === false, "Should be invalid");
});

test("dayKey: invalid date (2026-02-30)", () => {
  const result = validators.dayKey("2026-02-30");
  assert(result.valid === false, "Should be invalid (Feb doesn't have 30 days)");
});

test("dayKey: empty string", () => {
  const result = validators.dayKey("");
  assert(result.valid === false, "Should be invalid");
});

test("dayKey: null", () => {
  const result = validators.dayKey(null);
  assert(result.valid === false, "Should be invalid");
});

test("dayKey: not a string", () => {
  const result = validators.dayKey(123);
  assert(result.valid === false, "Should be invalid");
});

// ===== MODE TESTS =====
console.log("\nTesting mode validator:");
console.log("─".repeat(80));

test("mode: valid classic", () => {
  const result = validators.mode("classic");
  assert(result.valid === true, "Should be valid");
});

test("mode: valid gen1", () => {
  const result = validators.mode("gen1");
  assert(result.valid === true, "Should be valid");
});

test("mode: valid gen9", () => {
  const result = validators.mode("gen9");
  assert(result.valid === true, "Should be valid");
});

test("mode: valid infinite", () => {
  const result = validators.mode("infinite");
  assert(result.valid === true, "Should be valid");
});

test("mode: valid with different case (CLASSIC)", () => {
  const result = validators.mode("CLASSIC");
  assert(result.valid === true, "Should be valid (case insensitive)");
});

test("mode: invalid gen0", () => {
  const result = validators.mode("gen0");
  assert(result.valid === false, "Should be invalid");
});

test("mode: invalid gen10", () => {
  const result = validators.mode("gen10");
  assert(result.valid === false, "Should be invalid");
});

test("mode: invalid random string", () => {
  const result = validators.mode("invalid-mode");
  assert(result.valid === false, "Should be invalid");
  assert(result.error.includes("must be one of"), "Error should list valid modes");
});

test("mode: empty string (optional, defaults to classic)", () => {
  const result = validators.mode("");
  assert(result.valid === true, "Should be valid (optional)");
});

test("mode: null (optional)", () => {
  const result = validators.mode(null);
  assert(result.valid === true, "Should be valid (optional)");
});

test("mode: not a string", () => {
  const result = validators.mode(123);
  assert(result.valid === false, "Should be invalid");
});

// ===== SEARCH QUERY TESTS =====
console.log("\nTesting searchQuery validator:");
console.log("─".repeat(80));

test("searchQuery: valid short query", () => {
  const result = validators.searchQuery("pikachu");
  assert(result.valid === true, "Should be valid");
});

test("searchQuery: valid empty string (returns empty results)", () => {
  const result = validators.searchQuery("");
  assert(result.valid === true, "Should be valid");
});

test("searchQuery: valid null", () => {
  const result = validators.searchQuery(null);
  assert(result.valid === true, "Should be valid");
});

test("searchQuery: valid max length (100 chars)", () => {
  const result = validators.searchQuery("a".repeat(100));
  assert(result.valid === true, "Should be valid");
});

test("searchQuery: invalid too long (101 chars)", () => {
  const result = validators.searchQuery("a".repeat(101));
  assert(result.valid === false, "Should be invalid");
  assert(result.error.includes("100 characters"), "Error should mention limit");
});

test("searchQuery: not a string", () => {
  const result = validators.searchQuery(123);
  assert(result.valid === false, "Should be invalid");
});

// ===== POKEMON ID TESTS =====
console.log("\nTesting pokemonId validator:");
console.log("─".repeat(80));

test("pokemonId: valid 1 (Bulbasaur)", () => {
  const result = validators.pokemonId(1);
  assert(result.valid === true, "Should be valid");
});

test("pokemonId: valid 25 (Pikachu)", () => {
  const result = validators.pokemonId(25);
  assert(result.valid === true, "Should be valid");
});

test("pokemonId: valid 1025 (max)", () => {
  const result = validators.pokemonId(1025);
  assert(result.valid === true, "Should be valid");
});

test("pokemonId: valid as string '25'", () => {
  const result = validators.pokemonId("25");
  assert(result.valid === true, "Should be valid (coerced to number)");
});

test("pokemonId: invalid 0 (below min)", () => {
  const result = validators.pokemonId(0);
  assert(result.valid === false, "Should be invalid");
  assert(result.error.includes("between"), "Error should mention range");
});

test("pokemonId: invalid 1026 (above max)", () => {
  const result = validators.pokemonId(1026);
  assert(result.valid === false, "Should be invalid");
});

test("pokemonId: invalid -1 (negative)", () => {
  const result = validators.pokemonId(-1);
  assert(result.valid === false, "Should be invalid");
});

test("pokemonId: invalid float 25.5", () => {
  const result = validators.pokemonId(25.5);
  assert(result.valid === false, "Should be invalid (not an integer)");
});

test("pokemonId: invalid NaN", () => {
  const result = validators.pokemonId(NaN);
  assert(result.valid === false, "Should be invalid");
});

test("pokemonId: invalid null", () => {
  const result = validators.pokemonId(null);
  assert(result.valid === false, "Should be invalid");
});

test("pokemonId: invalid non-numeric string", () => {
  const result = validators.pokemonId("pikachu");
  assert(result.valid === false, "Should be invalid");
});

// ===== OFFSET TESTS =====
console.log("\nTesting offset validator:");
console.log("─".repeat(80));

test("offset: valid 0", () => {
  const result = validators.offset(0);
  assert(result.valid === true, "Should be valid");
});

test("offset: valid 50", () => {
  const result = validators.offset(50);
  assert(result.valid === true, "Should be valid");
});

test("offset: valid 10000 (max)", () => {
  const result = validators.offset(10000);
  assert(result.valid === true, "Should be valid");
});

test("offset: valid empty string (defaults to 0)", () => {
  const result = validators.offset("");
  assert(result.valid === true, "Should be valid");
});

test("offset: invalid -1 (negative)", () => {
  const result = validators.offset(-1);
  assert(result.valid === false, "Should be invalid");
  assert(result.error.includes("non-negative"), "Error should mention non-negative");
});

test("offset: invalid 10001 (above max)", () => {
  const result = validators.offset(10001);
  assert(result.valid === false, "Should be invalid");
  assert(result.error.includes("too large"), "Error should mention limit");
});

test("offset: invalid float 25.5", () => {
  const result = validators.offset(25.5);
  assert(result.valid === false, "Should be invalid (not an integer)");
});

// ===== LIMIT TESTS =====
console.log("\nTesting limit validator:");
console.log("─".repeat(80));

test("limit: valid 1", () => {
  const result = validators.limit(1);
  assert(result.valid === true, "Should be valid");
});

test("limit: valid 50", () => {
  const result = validators.limit(50);
  assert(result.valid === true, "Should be valid");
});

test("limit: valid 200 (max)", () => {
  const result = validators.limit(200);
  assert(result.valid === true, "Should be valid");
});

test("limit: valid empty string (uses default)", () => {
  const result = validators.limit("");
  assert(result.valid === true, "Should be valid");
});

test("limit: invalid 0", () => {
  const result = validators.limit(0);
  assert(result.valid === false, "Should be invalid");
  assert(result.error.includes("at least 1"), "Error should mention minimum");
});

test("limit: invalid 201 (above max)", () => {
  const result = validators.limit(201);
  assert(result.valid === false, "Should be invalid");
  assert(result.error.includes("200 or less"), "Error should mention maximum");
});

test("limit: invalid -10", () => {
  const result = validators.limit(-10);
  assert(result.valid === false, "Should be invalid");
});

// ===== RESULTS =====
console.log("\n" + "=".repeat(80));
console.log("=== Test Results ===");
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed === 0) {
  console.log("\n✅ All tests passed!");
  process.exit(0);
} else {
  console.log(`\n❌ ${failed} test(s) failed!`);
  process.exit(1);
}

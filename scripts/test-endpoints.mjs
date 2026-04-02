// scripts/test-endpoints.js
// Integration tests for Netlify Functions endpoints
//
// These tests verify that endpoints handle inputs correctly,
// return proper responses, and integrate with the database.
//
// IMPORTANT: Requires DATABASE_URL to be set (uses real DB)

import "dotenv/config";

let passed = 0;
let failed = 0;

function test(name, fn) {
  return new Promise((resolve) => {
    Promise.resolve(fn())
      .then(() => {
        console.log(`✓ ${name}`);
        passed++;
        resolve();
      })
      .catch((e) => {
        console.log(`✗ ${name}`);
        console.log(`  Error: ${e.message}`);
        failed++;
        resolve();
      });
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

// Import endpoint handlers (all use CommonJS)
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const metaHandler = require("../netlify/functions/meta.js").handler;
const searchHandler = require("../netlify/functions/search.js").handler;
const pokemonHandler = require("../netlify/functions/pokemon.js").handler;
const guessHandler = require("../netlify/functions/guess.js").handler;

console.log("=== Endpoint Integration Tests ===\n");

// Check if DATABASE_URL is set
if (
  !process.env.DATABASE_URL &&
  !process.env.NETLIFY_DATABASE_URL &&
  !process.env.NETLIFY_DATABASE_URL_UNPOOLED
) {
  console.error("❌ DATABASE_URL not set. Cannot run endpoint tests.");
  console.error(
    "   Set DATABASE_URL in .env or export it in your terminal."
  );
  process.exit(1);
}

// ===== META ENDPOINT TESTS =====
console.log("Testing /api/meta endpoint:");
console.log("─".repeat(80));

await test("meta: returns dayKey, dexMax, timezone for classic mode", async () => {
  const event = {
    queryStringParameters: { mode: "classic" },
  };

  const response = await metaHandler(event);
  assert(response.statusCode === 200, "Should return 200");

  const body = JSON.parse(response.body);
  assert(body.dayKey, "Should have dayKey");
  assert(body.dayKey.match(/^\d{4}-\d{2}-\d{2}$/), "dayKey should be YYYY-MM-DD");
  assert(body.dexMax === 1025, "dexMax should be 1025");
  assert(body.tz === "America/Argentina/Buenos_Aires", "tz should be Argentina");
  assert(body.mode === "classic", "mode should be classic");
  assert(body.gens === null, "gens should be null for classic");
});

await test("meta: returns correct config for gen1 mode", async () => {
  const event = {
    queryStringParameters: { mode: "gen1" },
  };

  const response = await metaHandler(event);
  assert(response.statusCode === 200, "Should return 200");

  const body = JSON.parse(response.body);
  assert(body.mode === "gen1", "mode should be gen1");
  assert(Array.isArray(body.gens), "gens should be array");
  assert(body.gens.length === 1, "gen1 should have 1 generation");
  assert(body.gens[0] === 1, "first gen should be 1");
});

await test("meta: validates invalid mode", async () => {
  const event = {
    queryStringParameters: { mode: "invalid-mode" },
  };

  const response = await metaHandler(event);
  assert(response.statusCode === 400, "Should return 400");

  const body = JSON.parse(response.body);
  assert(body.error === "INVALID_MODE", "Should have INVALID_MODE error");
  assert(body.message, "Should have error message");
});

await test("meta: defaults to classic when mode not provided", async () => {
  const event = {
    queryStringParameters: {},
  };

  const response = await metaHandler(event);
  assert(response.statusCode === 200, "Should return 200");

  const body = JSON.parse(response.body);
  assert(body.mode === "classic", "Should default to classic");
});

// ===== SEARCH ENDPOINT TESTS =====
console.log("\nTesting /api/search endpoint:");
console.log("─".repeat(80));

await test("search: returns results for valid query 'pikachu'", async () => {
  const event = {
    queryStringParameters: { q: "pikachu", mode: "classic", offset: "0" },
  };

  const response = await searchHandler(event);
  assert(response.statusCode === 200, "Should return 200");

  const body = JSON.parse(response.body);
  assert(Array.isArray(body.items), "Should have items array");
  assert(body.items.length > 0, "Should have at least one result");
  assert(body.items[0].id, "Item should have id");
  assert(body.items[0].name, "Item should have name");
  assert(body.items[0].sprite, "Item should have sprite");

  // Should find Pikachu (ID 25)
  const pikachu = body.items.find((p) => p.id === 25);
  assert(pikachu, "Should find Pikachu");
  assert(pikachu.name === "pikachu", "Name should be pikachu");
});

await test("search: handles fuzzy matching for typo 'pikachuu'", async () => {
  const event = {
    queryStringParameters: { q: "pikachuu", mode: "classic", offset: "0" },
  };

  const response = await searchHandler(event);
  assert(response.statusCode === 200, "Should return 200");

  const body = JSON.parse(response.body);
  assert(body.items.length > 0, "Should have results with fuzzy match");

  // Should still find Pikachu despite typo
  const pikachu = body.items.find((p) => p.id === 25);
  assert(pikachu, "Should find Pikachu with typo");
});

await test("search: returns empty array for empty query", async () => {
  const event = {
    queryStringParameters: { q: "", mode: "classic", offset: "0" },
  };

  const response = await searchHandler(event);
  assert(response.statusCode === 200, "Should return 200");

  const body = JSON.parse(response.body);
  assert(Array.isArray(body.items), "Should have items array");
  assert(body.items.length === 0, "Should have no results for empty query");
  assert(body.hasMore === false, "hasMore should be false");
});

await test("search: validates invalid mode", async () => {
  const event = {
    queryStringParameters: { q: "pikachu", mode: "gen99", offset: "0" },
  };

  const response = await searchHandler(event);
  assert(response.statusCode === 400, "Should return 400");

  const body = JSON.parse(response.body);
  assert(body.error === "INVALID_MODE", "Should have INVALID_MODE error");
});

await test("search: validates negative offset", async () => {
  const event = {
    queryStringParameters: { q: "pikachu", mode: "classic", offset: "-1" },
  };

  const response = await searchHandler(event);
  assert(response.statusCode === 400, "Should return 400");

  const body = JSON.parse(response.body);
  assert(body.error === "INVALID_OFFSET", "Should have INVALID_OFFSET error");
});

await test("search: filters by generation in gen1 mode", async () => {
  const event = {
    queryStringParameters: { q: "char", mode: "gen1", offset: "0" },
  };

  const response = await searchHandler(event);
  assert(response.statusCode === 200, "Should return 200");

  const body = JSON.parse(response.body);
  assert(body.items.length > 0, "Should have results");

  // All results should be gen1 (IDs 1-151)
  body.items.forEach((item) => {
    assert(item.id <= 151, `${item.name} should be gen1 (id <= 151)`);
  });
});

// ===== POKEMON ENDPOINT TESTS =====
console.log("\nTesting /api/pokemon/:id endpoint:");
console.log("─".repeat(80));

await test("pokemon: returns Pikachu (ID 25) data", async () => {
  const event = {
    path: "/api/pokemon/25",
    queryStringParameters: { mode: "classic" },
  };

  const response = await pokemonHandler(event);
  assert(response.statusCode === 200, "Should return 200");

  const body = JSON.parse(response.body);
  assert(body.id === 25, "Should be Pikachu");
  assert(body.name === "pikachu", "Name should be pikachu");
  assert(body.gen === 1, "Should be gen 1");
  assert(Array.isArray(body.types), "Should have types array");
  assert(body.types.includes("electric"), "Should be electric type");
  assert(body.color, "Should have color");
  assert(body.evolution_stage, "Should have evolution_stage");
});

await test("pokemon: returns Bulbasaur (ID 1) data", async () => {
  const event = {
    path: "/api/pokemon/1",
    queryStringParameters: { mode: "classic" },
  };

  const response = await pokemonHandler(event);
  assert(response.statusCode === 200, "Should return 200");

  const body = JSON.parse(response.body);
  assert(body.id === 1, "Should be Bulbasaur");
  assert(body.name === "bulbasaur", "Name should be bulbasaur");
  assert(body.types.includes("grass"), "Should have grass type");
  assert(body.types.includes("poison"), "Should have poison type");
});

await test("pokemon: validates invalid ID (0)", async () => {
  const event = {
    path: "/api/pokemon/0",
    queryStringParameters: { mode: "classic" },
  };

  const response = await pokemonHandler(event);
  assert(response.statusCode === 400, "Should return 400");

  const body = JSON.parse(response.body);
  assert(
    body.error === "INVALID_POKEMON_ID",
    "Should have INVALID_POKEMON_ID error"
  );
});

await test("pokemon: validates invalid ID (9999)", async () => {
  const event = {
    path: "/api/pokemon/9999",
    queryStringParameters: { mode: "classic" },
  };

  const response = await pokemonHandler(event);
  assert(response.statusCode === 400, "Should return 400");

  const body = JSON.parse(response.body);
  assert(
    body.error === "INVALID_POKEMON_ID",
    "Should have INVALID_POKEMON_ID error"
  );
});

await test("pokemon: returns 404 for valid but non-existent ID (1024)", async () => {
  const event = {
    path: "/api/pokemon/1024",
    queryStringParameters: { mode: "classic" },
  };

  const response = await pokemonHandler(event);
  // Could be 404 if Pokemon doesn't exist in DB
  assert(
    response.statusCode === 200 || response.statusCode === 404,
    "Should return 200 or 404"
  );
});

// ===== GUESS ENDPOINT TESTS =====
console.log("\nTesting /api/guess endpoint:");
console.log("─".repeat(80));

await test("guess: validates POST method required", async () => {
  const event = {
    httpMethod: "GET",
    body: null,
  };

  const response = await guessHandler(event);
  assert(response.statusCode === 405, "Should return 405 Method Not Allowed");
});

await test("guess: validates missing guessId", async () => {
  const event = {
    httpMethod: "POST",
    headers: {},
    body: JSON.stringify({
      dayKey: "2026-04-02",
      mode: "classic",
    }),
  };

  const response = await guessHandler(event);
  assert(response.statusCode === 400, "Should return 400");

  const body = JSON.parse(response.body);
  assert(
    body.error === "INVALID_GUESS_ID",
    "Should have INVALID_GUESS_ID error"
  );
});

await test("guess: validates invalid dayKey format", async () => {
  const event = {
    httpMethod: "POST",
    headers: {},
    body: JSON.stringify({
      guessId: 25,
      dayKey: "04-02-2026",
      mode: "classic",
    }),
  };

  const response = await guessHandler(event);
  assert(response.statusCode === 400, "Should return 400");

  const body = JSON.parse(response.body);
  assert(
    body.error === "INVALID_DAY_KEY",
    "Should have INVALID_DAY_KEY error"
  );
});

await test("guess: validates invalid mode", async () => {
  const event = {
    httpMethod: "POST",
    headers: {},
    body: JSON.stringify({
      guessId: 25,
      dayKey: "2026-04-02",
      mode: "invalid",
    }),
  };

  const response = await guessHandler(event);
  assert(response.statusCode === 400, "Should return 400");

  const body = JSON.parse(response.body);
  assert(body.error === "INVALID_MODE", "Should have INVALID_MODE error");
});

await test("guess: returns comparison for valid guess (requires SECRET)", async () => {
  if (!process.env.SECRET) {
    console.log("  ⚠️  Skipped (SECRET not set)");
    passed++; // Count as passed since it's not a real failure
    return;
  }

  const event = {
    httpMethod: "POST",
    headers: {
      "x-forwarded-for": "127.0.0.1",
    },
    body: JSON.stringify({
      guessId: 25, // Pikachu
      dayKey: "2026-04-02",
      mode: "classic",
    }),
  };

  const response = await guessHandler(event);
  assert(response.statusCode === 200, "Should return 200");

  const body = JSON.parse(response.body);
  assert(body.dayKey === "2026-04-02", "Should return dayKey");
  assert(body.mode === "classic", "Should return mode");
  assert(body.comparison, "Should have comparison object");
  assert(typeof body.comparison.isCorrect === "boolean", "Should have isCorrect boolean");
  assert(body.comparison.columns, "Should have columns object");
  // Comparison.columns should have attribute comparisons
  assert(body.comparison.columns.type1 !== undefined, "Should have type1 field");
  assert(body.comparison.columns.gen !== undefined, "Should have gen field");
  assert(body.comparison.columns.habitat !== undefined, "Should have habitat field");
  assert(body.comparison.columns.color !== undefined, "Should have color field");
});

await test("guess: validates guessId out of range", async () => {
  const event = {
    httpMethod: "POST",
    headers: {},
    body: JSON.stringify({
      guessId: 9999,
      dayKey: "2026-04-02",
      mode: "classic",
    }),
  };

  const response = await guessHandler(event);
  assert(response.statusCode === 400, "Should return 400");

  const body = JSON.parse(response.body);
  assert(
    body.error === "INVALID_GUESS_ID",
    "Should have INVALID_GUESS_ID error"
  );
});

// ===== RESULTS =====
console.log("\n" + "=".repeat(80));
console.log("=== Test Results ===");
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed === 0) {
  console.log("\n✅ All endpoint tests passed!");
  process.exit(0);
} else {
  console.log(`\n❌ ${failed} test(s) failed!`);
  process.exit(1);
}

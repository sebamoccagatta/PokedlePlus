// scripts/test-search.js
// Prueba la búsqueda fuzzy localmente contra la BD
import "dotenv/config";
import postgres from "postgres";

const url =
  process.env.DATABASE_URL ||
  process.env.NETLIFY_DATABASE_URL ||
  process.env.NETLIFY_DATABASE_URL_UNPOOLED;

if (!url) {
  console.error("❌ Falta DATABASE_URL o NETLIFY_DATABASE_URL(_UNPOOLED).");
  process.exit(1);
}

const sql = postgres(url, {
  ssl: "require",
  max: 1,
  idle_timeout: 10,
  connect_timeout: 10,
});

const testCases = [
  { query: "pikachu", desc: "Búsqueda exacta" },
  { query: "pikachuu", desc: "Typo (doble u)" },
  { query: "pika", desc: "Prefix parcial" },
  { query: "char", desc: "Substring (debería dar Charizard, Charmander...)" },
  { query: "bulbasaur", desc: "Exacta lowercase" },
  { query: "BULBASAUR", desc: "Exacta uppercase" },
  { query: "mewto", desc: "Typo en Mewtwo" },
  { query: "squirtel", desc: "Typo en Squirtle" },
  { query: "charmeleon", desc: "Exacta" },
  { query: "xyz123", desc: "No match (should return empty or low sim)" },
];

async function testSearch(query, mode = "classic") {
  const similarityThreshold = 0.3;
  const limit = 10; // Mostrar top 10 para testing

  let rows;
  if (mode === "gen1") {
    rows = await sql`
      SELECT id, name, word_similarity(${query}, name) AS sim
      FROM pokemon
      WHERE gen = 1
        AND (
          name ILIKE ${query + "%"}
          OR word_similarity(${query}, name) >= ${similarityThreshold}
        )
      ORDER BY
        CASE WHEN name ILIKE ${query + "%"} THEN 0 ELSE 1 END,
        sim DESC,
        id
      LIMIT ${limit}
    `;
  } else {
    rows = await sql`
      SELECT id, name, word_similarity(${query}, name) AS sim
      FROM pokemon
      WHERE name ILIKE ${query + "%"}
        OR word_similarity(${query}, name) >= ${similarityThreshold}
      ORDER BY
        CASE WHEN name ILIKE ${query + "%"} THEN 0 ELSE 1 END,
        sim DESC,
        id
      LIMIT ${limit}
    `;
  }

  return rows;
}

async function run() {
  console.log("🧪 Testeando búsqueda fuzzy con pg_trgm\n");
  console.log("═".repeat(80));

  for (const { query, desc } of testCases) {
    console.log(`\n🔍 Query: "${query}" (${desc})`);
    console.log("─".repeat(80));

    try {
      const results = await testSearch(query.toLowerCase());

      if (results.length === 0) {
        console.log("   ❌ Sin resultados");
      } else {
        results.forEach((r, idx) => {
          const simPercentage = (r.sim * 100).toFixed(1);
          const simBar = "█".repeat(Math.round(r.sim * 20));
          console.log(
            `   ${idx + 1}. ${r.name.padEnd(20)} (ID: ${String(r.id).padEnd(4)}) sim: ${simPercentage}% ${simBar}`
          );
        });
      }
    } catch (e) {
      console.error(`   ❌ Error: ${e.message}`);
    }
  }

  console.log("\n" + "═".repeat(80));
  console.log("\n🎯 Test con filtro gen1:");
  console.log("─".repeat(80));

  const gen1Results = await testSearch("char", "gen1");
  gen1Results.forEach((r, idx) => {
    const simPercentage = (r.sim * 100).toFixed(1);
    console.log(
      `   ${idx + 1}. ${r.name.padEnd(20)} (ID: ${String(r.id).padEnd(4)}) sim: ${simPercentage}%`
    );
  });

  console.log("\n✅ Tests completados");

  await sql.end({ timeout: 5 });
}

run().catch((e) => {
  console.error("❌ Error ejecutando tests:", e);
  process.exit(1);
});

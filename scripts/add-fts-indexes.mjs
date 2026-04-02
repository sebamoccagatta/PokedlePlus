// scripts/add-fts-indexes.js
// Habilita pg_trgm y crea índices para fuzzy search
import "dotenv/config";
import postgres from "postgres";

const url =
  process.env.DATABASE_URL ||
  process.env.NETLIFY_DATABASE_URL ||
  process.env.NETLIFY_DATABASE_URL_UNPOOLED;

if (!url) {
  console.error("❌ Falta DATABASE_URL o NETLIFY_DATABASE_URL(_UNPOOLED).");
  console.error("   Tip: ponela en tu .env o exportala en la terminal.");
  process.exit(1);
}

const sql = postgres(url, {
  ssl: "require",
  max: 1,
  idle_timeout: 10,
  connect_timeout: 10,
});

async function run() {
  console.log("🔧 Habilitando extensión pg_trgm...");

  // Habilitar pg_trgm (trigram) para fuzzy matching
  await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm;`;

  console.log("✅ Extensión pg_trgm habilitada");

  console.log("🔧 Creando índice GIN para búsqueda trigram...");

  // Índice GIN para búsqueda trigram en name (fuzzy matching)
  // Esto acelera operadores como %, similarity(), word_similarity()
  await sql`
    CREATE INDEX IF NOT EXISTS idx_pokemon_name_trgm
    ON pokemon USING gin (name gin_trgm_ops);
  `;

  console.log("✅ Índice GIN trigram creado OK");

  // Mantener el índice B-tree existente para búsquedas exactas/prefix
  await sql`
    CREATE INDEX IF NOT EXISTS idx_pokemon_name_btree
    ON pokemon (name text_pattern_ops);
  `;

  console.log("✅ Índice B-tree para prefix mantenido");

  // Índice para filtrado por gen (ya existe, pero lo mantenemos idempotente)
  await sql`
    CREATE INDEX IF NOT EXISTS idx_pokemon_gen
    ON pokemon (gen);
  `;

  console.log("✅ Índice gen verificado");

  // NOTA: No necesitamos índice compuesto (gen, name) porque:
  // 1. gen es integer, no soporta GIN directamente
  // 2. PostgreSQL combina ambos índices (gen B-tree + name GIN) automáticamente
  //    usando bitmap index scan cuando hacemos queries filtradas
  //
  // Ver: https://www.postgresql.org/docs/current/indexes-bitmap-scans.html

  console.log("\n🎉 Todos los índices FTS creados exitosamente");

  await sql.end({ timeout: 5 });
}

run().catch((e) => {
  console.error("❌ Error creando índices FTS:", e);
  process.exit(1);
});

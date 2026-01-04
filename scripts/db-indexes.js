// scripts/db-indexes.js
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

// Neon serverless: conviene SSL + pool controlado
const sql = postgres(url, {
  ssl: "require",
  max: 1,
  idle_timeout: 10,
  connect_timeout: 10,
});

async function run() {
  await sql`
    CREATE INDEX IF NOT EXISTS idx_pokemon_name_prefix
    ON pokemon (name text_pattern_ops);
  `;

  // opcional: si filtrás por gen seguido, acelera también:
  await sql`
    CREATE INDEX IF NOT EXISTS idx_pokemon_gen
    ON pokemon (gen);
  `;

  console.log("✅ Índices creados OK");
  await sql.end({ timeout: 5 });
}

run().catch((e) => {
  console.error("❌ Error creando índices:", e);
  process.exit(1);
});

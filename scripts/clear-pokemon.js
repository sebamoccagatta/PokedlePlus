require("dotenv").config();
const { neon } = require("@neondatabase/serverless");

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("❌ Falta DATABASE_URL");
    process.exit(1);
  }

  const sql = neon(url);

  console.log("🗑️  Vaciando tabla pokemon...");
  await sql`TRUNCATE TABLE pokemon RESTART IDENTITY CASCADE`;
  console.log("✅ Tabla vaciada");
}

main().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});

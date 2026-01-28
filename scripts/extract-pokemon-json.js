require("dotenv").config();
const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("❌ DATABASE_URL missing");
    process.exit(1);
  }

  const sql = neon(url);
  console.log("📡 Connecting to DB to extract Pokémon data...");

  const rows = await sql`
    SELECT id, name, gen, height_dm, weight_hg, types_json, habitat, color, evolution_stage
    FROM pokemon
    ORDER BY id ASC
  `;

  console.log(`✅ Extracted ${rows.length} Pokémon.`);

  const data = rows.map(r => ({
    id: r.id,
    name: r.name,
    gen: Number(r.gen),
    height_dm: Number(r.height_dm),
    weight_hg: Number(r.weight_hg),
    types: typeof r.types_json === 'string' ? JSON.parse(r.types_json) : r.types_json,
    habitat: r.habitat || "unknown",
    color: r.color || "unknown",
    evolution_stage: Number(r.evolution_stage)
  }));

  const outDir = path.join(__dirname, "..", "frontend", "src", "data");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outFile = path.join(outDir, "pokemon.json");
  fs.writeFileSync(outFile, JSON.stringify(data, null, 2));

  console.log(`🎉 Data saved to ${outFile}`);
}

main().catch(console.error);

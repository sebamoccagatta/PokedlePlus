require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const { neon } = require("@neondatabase/serverless");

function splitSqlStatements(sqlText) {
  // Muy simple: separa por ; (suficiente para nuestro schema)
  // Elimina comentarios y líneas vacías.
  const cleaned = sqlText.replace(/--.*$/gm, "").replace(/\r\n/g, "\n").trim();

  return cleaned
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error(
      "❌ Falta DATABASE_URL. Seteala en tu terminal antes de correr esto."
    );
    process.exit(1);
  }

  const sql = neon(url);

  const schemaPath = path.join(__dirname, "..", "db", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");

  const statements = splitSqlStatements(schema);

  for (const stmt of statements) {
    // Ejecuta cada sentencia por separado
    await sql(stmt);
  }

  console.log(`✅ Schema aplicado OK (${statements.length} sentencias)`);
}

main().catch((e) => {
  console.error("❌ Error aplicando schema:", e);
  process.exit(1);
});

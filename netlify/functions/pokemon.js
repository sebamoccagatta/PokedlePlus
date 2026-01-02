const { sql } = require("./_lib/db");

function parseTypes(row) {
  // Soporta jsonb ya parseado o string
  const v = row.types_json ?? row.types ?? null;
  if (Array.isArray(v)) return v;
  try {
    if (typeof v === "string") return JSON.parse(v);
  } catch {}
  return [];
}

exports.handler = async (event) => {
  try {
    // Soporta:
    // 1) /pokemon?id=204
    // 2) /pokemon/204
    const url = new URL(event.rawUrl);

    let id = Number(url.searchParams.get("id") || 0);
    if (!id) {
      const parts = url.pathname.split("/").filter(Boolean);
      const last = parts[parts.length - 1];
      if (last && /^\d+$/.test(last)) id = Number(last);
    }

    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ error: "INVALID_ID" }) };
    }

    const db = sql();
    const rows = await db`SELECT * FROM pokemon WHERE id = ${id} LIMIT 1`;
    const row = rows[0];

    if (!row) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "POKEMON_NOT_FOUND" }),
      };
    }

    const types = parseTypes(row);

    // ✅ devolvemos exactamente lo que el front espera
    return {
      statusCode: 200,
      body: JSON.stringify({
        id: row.id,
        name: row.name,
        gen: row.gen,
        height_dm: row.height_dm,
        weight_hg: row.weight_hg,
        types,
        habitat: row.habitat,
        color: row.color,
        evolution_stage: row.evolution_stage,
      }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "POKEMON_FAILED",
        message: String(e?.message || e),
      }),
    };
  }
};

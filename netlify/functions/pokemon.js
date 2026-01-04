// netlify/functions/pokemon.js
const { sql } = require("./_lib/db");
const { parseTypes } = require("./_lib/normalize");

exports.handler = async (event) => {
  try {
    const id = Number(event.path.split("/").pop());
    if (!id) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ error: "INVALID_ID" }),
      };
    }

    const db = sql();
    const rows = await db`SELECT * FROM pokemon WHERE id = ${id} LIMIT 1`;
    const row = rows[0];

    if (!row) {
      return {
        statusCode: 404,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ error: "POKEMON_NOT_FOUND" }),
      };
    }

    const rawTypes = row.types_json != null ? row.types_json : row.types;

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": "public, max-age=86400",
      },
      body: JSON.stringify({
        id: row.id,
        name: row.name,
        gen: Number(row.gen || 1),
        height_dm: Number(row.height_dm || 0),
        weight_hg: Number(row.weight_hg || 0),
        types: parseTypes(rawTypes),
        habitat: row.habitat ?? "unknown",
        color: row.color ?? "unknown",
        evolution_stage: Number(row.evolution_stage || 1),
      }),
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        error: "POKEMON_FAILED",
        message: String(e.message || e),
      }),
    };
  }
};

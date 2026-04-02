const { sql } = require("./_lib/db");
const { modeConfig } = require("./_lib/modes");

exports.handler = async (event) => {
  try {
    const qRaw = event.queryStringParameters?.q || "";
    const q = String(qRaw).trim().toLowerCase();
    const offset = Number(event.queryStringParameters?.offset || 0);
    const mode = event.queryStringParameters?.mode || "classic";
    const cfg = modeConfig(mode);

    if (!q) {
      return {
        statusCode: 200,
        headers: {
          "content-type": "application/json",
          "cache-control": "public, max-age=120",
        },
        body: JSON.stringify({ items: [], hasMore: false, nextOffset: 0 }),
      };
    }

    const db = sql();
    const limit = 50;

    // Umbral de similaridad: 0.3 es permisivo (tolera typos), 0.6 es estricto
    // Para nombres de Pokémon cortos, 0.3 funciona bien
    const similarityThreshold = 0.3;

    let rows;
    if (cfg.gens && cfg.gens.length) {
      // Búsqueda fuzzy con filtro de generación
      // Usa word_similarity para matching parcial (ej: "char" → "Charizard")
      // Ordena por similaridad DESC para mostrar mejores matches primero
      rows = await db`
        SELECT id, name, word_similarity(${q}, name) AS sim
        FROM pokemon
        WHERE gen = ANY(${cfg.gens})
          AND (
            name ILIKE ${q + "%"}
            OR word_similarity(${q}, name) >= ${similarityThreshold}
          )
        ORDER BY
          CASE WHEN name ILIKE ${q + "%"} THEN 0 ELSE 1 END,
          sim DESC,
          id
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      // Búsqueda fuzzy sin filtro de generación
      rows = await db`
        SELECT id, name, word_similarity(${q}, name) AS sim
        FROM pokemon
        WHERE name ILIKE ${q + "%"}
          OR word_similarity(${q}, name) >= ${similarityThreshold}
        ORDER BY
          CASE WHEN name ILIKE ${q + "%"} THEN 0 ELSE 1 END,
          sim DESC,
          id
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": "public, max-age=600",
      },
      body: JSON.stringify({
        items: rows.map((r) => ({
          id: r.id,
          name: r.name,
          sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${r.id}.png`,
        })),
        hasMore: rows.length === limit,
        nextOffset: offset + rows.length,
      }),
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        error: "SEARCH_FAILED",
        message: String(e.message || e),
      }),
    };
  }
};

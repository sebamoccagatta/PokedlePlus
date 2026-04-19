const { sql } = require("./_lib/db");
const { modeConfig } = require("./_lib/modes");
const { validators } = require("../../shared/validation.js");

function isPgTrgmUnavailable(error) {
  const message = String(error?.message || "").toLowerCase();
  return (
    error?.code === "42883" ||
    message.includes("word_similarity") ||
    message.includes("pg_trgm")
  );
}

async function runFuzzySearch(db, { q, cfg, similarityThreshold, limit, offset }) {
  if (cfg.gens && cfg.gens.length) {
    return db`
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
  }

  return db`
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

async function runSafeFallbackSearch(db, { q, cfg, limit, offset }) {
  const containsQuery = `%${q}%`;
  const prefixQuery = `${q}%`;

  if (cfg.gens && cfg.gens.length) {
    return db`
      SELECT id, name
      FROM pokemon
      WHERE gen = ANY(${cfg.gens})
        AND name ILIKE ${containsQuery}
      ORDER BY
        CASE
          WHEN name ILIKE ${prefixQuery} THEN 0
          ELSE 1
        END,
        char_length(name),
        name,
        id
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  return db`
    SELECT id, name
    FROM pokemon
    WHERE name ILIKE ${containsQuery}
    ORDER BY
      CASE
        WHEN name ILIKE ${prefixQuery} THEN 0
        ELSE 1
      END,
      char_length(name),
      name,
      id
    LIMIT ${limit} OFFSET ${offset}
  `;
}

exports.handler = async (event) => {
  try {
    const qRaw = event.queryStringParameters?.q || "";
    const q = String(qRaw).trim().toLowerCase();
    const offset = Number(event.queryStringParameters?.offset || 0);
    const mode = event.queryStringParameters?.mode || "classic";

    // Validate inputs
    const queryValidation = validators.searchQuery(q);
    if (!queryValidation.valid) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          error: "INVALID_SEARCH_QUERY",
          message: queryValidation.error,
        }),
      };
    }

    const offsetValidation = validators.offset(offset);
    if (!offsetValidation.valid) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          error: "INVALID_OFFSET",
          message: offsetValidation.error,
        }),
      };
    }

    const modeValidation = validators.mode(mode);
    if (!modeValidation.valid) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          error: "INVALID_MODE",
          message: modeValidation.error,
        }),
      };
    }

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
    try {
      rows = await runFuzzySearch(db, {
        q,
        cfg,
        similarityThreshold,
        limit,
        offset,
      });
    } catch (error) {
      if (!isPgTrgmUnavailable(error)) {
        throw error;
      }

      console.warn(
        "[search] pg_trgm/word_similarity no disponible, usando fallback ILIKE",
        {
          code: error?.code,
          message: error?.message,
        },
      );

      rows = await runSafeFallbackSearch(db, {
        q,
        cfg,
        limit,
        offset,
      });
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

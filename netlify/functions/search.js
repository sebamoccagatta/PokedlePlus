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

    let rows;
    if (cfg.gens && cfg.gens.length) {
      rows = await db`
        SELECT id, name
        FROM pokemon
        WHERE gen = ANY(${cfg.gens}) AND name LIKE ${q + "%"}
        ORDER BY id
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      rows = await db`
        SELECT id, name
        FROM pokemon
        WHERE name LIKE ${q + "%"}
        ORDER BY id
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

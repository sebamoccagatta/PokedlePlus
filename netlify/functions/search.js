const { sql } = require("./_lib/db");

exports.handler = async (event) => {
  try {
    const q = (event.queryStringParameters?.q || "").toLowerCase();
    const offset = Number(event.queryStringParameters?.offset || 0);

    if (!q) {
      return {
        statusCode: 200,
        body: JSON.stringify({ items: [], hasMore: false, nextOffset: 0 }),
      };
    }

    const db = sql();

    const rows = await db`
      SELECT id, name
      FROM pokemon
      WHERE name ILIKE ${q + "%"}
      ORDER BY id
      LIMIT 50 OFFSET ${offset}
    `;

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: rows.map((r) => ({
          id: r.id,
          name: r.name,
          sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${r.id}.png`,
        })),
        hasMore: rows.length === 50,
        nextOffset: offset + rows.length,
      }),
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "SEARCH_FAILED",
        message: String(e.message || e),
      }),
    };
  }
};

const { sql } = require("./_lib/db");

const { compareGuess, fnv1a, pickDailyTargetId } = require("./_lib/utils");

const SECRET = process.env.SECRET || "CHANGE_ME_SECRET";

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "METHOD_NOT_ALLOWED" }),
      };
    }

    const body = JSON.parse(event.body || "{}");
    const guessId = Number(body.guessId || 0);
    const dayKey = String(body.dayKey || "");

    if (!guessId || !dayKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "INVALID_REQUEST" }),
      };
    }

    const db = sql();

    const countRows = await db`SELECT COUNT(*)::int AS c FROM pokemon`;
    const count = countRows[0]?.c || 0;
    if (!count)
      return { statusCode: 400, body: JSON.stringify({ error: "DB_EMPTY" }) };

    const idx = pickDailyTargetId({ secret: SECRET, dayKey, count }); // 1..count

    const targetRows = await db`
      SELECT * FROM pokemon
      ORDER BY id
      LIMIT 1 OFFSET ${idx - 1}
    `;
    const target = targetRows[0];

    const guessRows =
      await db`SELECT * FROM pokemon WHERE id = ${guessId} LIMIT 1`;
    const guess = guessRows[0];
    if (!guess)
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "POKEMON_NOT_FOUND" }),
      };

    // normalizar types
    target.types = Array.isArray(target.types_json)
      ? target.types_json
      : JSON.parse(JSON.stringify(target.types_json));
    guess.types = Array.isArray(guess.types_json)
      ? guess.types_json
      : JSON.parse(JSON.stringify(guess.types_json));

    const comparison = compareGuess({
      target: {
        id: target.id,
        name: target.name,
        gen: target.gen,
        height_dm: target.height_dm,
        weight_hg: target.weight_hg,
        types: target.types,
        habitat: target.habitat,
        color: target.color,
        evolution_stage: target.evolution_stage,
      },
      guess: {
        id: guess.id,
        name: guess.name,
        gen: guess.gen,
        height_dm: guess.height_dm,
        weight_hg: guess.weight_hg,
        types: guess.types,
        habitat: guess.habitat,
        color: guess.color,
        evolution_stage: guess.evolution_stage,
      },
    });

    return { statusCode: 200, body: JSON.stringify({ dayKey, comparison }) };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "GUESS_FAILED",
        message: String(e?.message || e),
      }),
    };
  }
};

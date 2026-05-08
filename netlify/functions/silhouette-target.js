const { sql } = require("./_lib/db");
const { modeConfig } = require("./_lib/modes");
const { fnv1a } = require("./_lib/utils");
const { validators } = require("../../shared/validation.cjs");

function getSecret() {
  const secret = process.env.SECRET;
  if (!secret) {
    throw new Error("MISSING_SECRET: process.env.SECRET is not set");
  }
  return secret;
}

exports.handler = async (event) => {
  try {
    const secret = getSecret();
    const mode = String(event.queryStringParameters?.mode || "classic");
    const dayKey = String(event.queryStringParameters?.dayKey || "").trim();

    const dayKeyValidation = validators.dayKey(dayKey);
    if (!dayKeyValidation.valid) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          error: "INVALID_DAY_KEY",
          message: dayKeyValidation.error,
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
    const db = sql();

    const countRows =
      cfg.gens && cfg.gens.length
        ? await db`SELECT COUNT(*)::int AS c FROM pokemon WHERE gen = ANY(${cfg.gens})`
        : await db`SELECT COUNT(*)::int AS c FROM pokemon`;
    const total = Number(countRows[0]?.c || 0);

    if (!total) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ error: "EMPTY_POOL" }),
      };
    }

    const seedKey = `${dayKey}|${cfg.id}`;
    const targetOffset = fnv1a(`${secret}:${seedKey}`) % total;

    const targetRows =
      cfg.gens && cfg.gens.length
        ? await db`
            SELECT id, name
            FROM pokemon
            WHERE gen = ANY(${cfg.gens})
            ORDER BY id
            LIMIT 1 OFFSET ${targetOffset}
          `
        : await db`
            SELECT id, name
            FROM pokemon
            ORDER BY id
            LIMIT 1 OFFSET ${targetOffset}
          `;

    const target = targetRows[0];
    if (!target) {
      return {
        statusCode: 404,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ error: "TARGET_NOT_FOUND" }),
      };
    }

    const id = Number(target.id);
    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
      body: JSON.stringify({
        dayKey,
        mode: cfg.id,
        target: {
          id,
          name: String(target.name || ""),
          sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
        },
      }),
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        error: "SILHOUETTE_TARGET_FAILED",
        message: String(e.message || e),
      }),
    };
  }
};

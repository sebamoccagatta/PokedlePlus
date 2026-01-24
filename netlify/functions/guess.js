// netlify/functions/guess.js
const { sql } = require("./_lib/db");
const { modeConfig } = require("./_lib/modes");
const { compareGuess, fnv1a } = require("./_lib/utils");
const { parseTypes } = require("./_lib/normalize");
const { getClientIp, getRateLimitInfo } = require("./_lib/rateLimitRedis");

function getSecret() {
  const secret = process.env.SECRET;
  if (!secret) {
    throw new Error("MISSING_SECRET: process.env.SECRET is not set");
  }
  return secret;
}

function pickDailyTargetId(pool, seedKey) {
  const h = fnv1a(`${getSecret()}:${seedKey}`);
  const idx = h % pool.length;
  return pool[idx].id;
}

function mapRow(row) {
  // soporta: types_json (viejo) o types (nuevo)
  const rawTypes = row.types_json != null ? row.types_json : row.types;

  return {
    id: row.id,
    name: row.name,
    gen: Number(row.gen || 1),
    height_dm: Number(row.height_dm || 0),
    weight_hg: Number(row.weight_hg || 0),
    types: parseTypes(rawTypes),
    habitat: row.habitat ?? "unknown",
    color: row.color ?? "unknown",
    evolution_stage: Number(row.evolution_stage || 1),
  };
}

exports.handler = async (event) => {
  try {
    const secret = process.env.SECRET;
    if (!secret) {
      return {
        statusCode: 500,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          error: "MISSING_SECRET",
          message:
            "process.env.SECRET is not set. Please set SECRET environment variable in Netlify.",
        }),
      };
    }

    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const ip = getClientIp(event);
    const rateInfo = await getRateLimitInfo(ip);

    if (rateInfo.exceeded) {
      return {
        statusCode: 429,
        headers: {
          "content-type": "application/json",
          "retry-after": Math.ceil(
            (rateInfo.reset - Date.now()) / 1000,
          ).toString(),
          "x-ratelimit-limit": rateInfo.limit.toString(),
          "x-ratelimit-remaining": rateInfo.remaining.toString(),
          "x-ratelimit-reset": new Date(rateInfo.reset).toISOString(),
        },
        body: JSON.stringify({
          error: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests. Please try again later.",
          retryAfter: Math.ceil((rateInfo.reset - Date.now()) / 1000),
        }),
      };
    }

    const body = JSON.parse(event.body || "{}");
    const guessId = Number(body.guessId);
    const dayKey = String(body.dayKey || "").trim();
    const mode = String(body.mode || "classic");

    if (!guessId || !dayKey) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ error: "INVALID_INPUT" }),
      };
    }

    const cfg = modeConfig(mode);
    const db = sql();

    // pool filtrado por modo
    let pool;
    if (cfg.gens && cfg.gens.length) {
      pool =
        await db`SELECT id FROM pokemon WHERE gen = ANY(${cfg.gens}) ORDER BY id`;
    } else {
      pool = await db`SELECT id FROM pokemon ORDER BY id`;
    }

    if (!pool.length) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ error: "EMPTY_POOL" }),
      };
    }

    const seedKey = `${dayKey}|${cfg.id}`;
    const targetId = pickDailyTargetId(pool, seedKey);

    const tRows =
      await db`SELECT * FROM pokemon WHERE id = ${targetId} LIMIT 1`;
    const gRows = await db`SELECT * FROM pokemon WHERE id = ${guessId} LIMIT 1`;

    const tRow = tRows[0];
    const gRow = gRows[0];

    if (!gRow) {
      return {
        statusCode: 404,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ error: "POKEMON_NOT_FOUND" }),
      };
    }

    const target = mapRow(tRow);
    const guess = mapRow(gRow);

    const comparison = compareGuess({ target, guess });

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
        "x-ratelimit-limit": rateInfo.limit.toString(),
        "x-ratelimit-remaining": rateInfo.remaining.toString(),
        "x-ratelimit-reset": new Date(rateInfo.reset).toISOString(),
      },
      body: JSON.stringify({
        dayKey,
        mode: cfg.id,
        comparison,
      }),
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        error: "GUESS_FAILED",
        message: String(e.message || e),
      }),
    };
  }
};

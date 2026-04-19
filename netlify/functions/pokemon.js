// netlify/functions/pokemon.js
const { sql } = require("./_lib/db");
const { parseTypes } = require("./_lib/normalize");
const { getEvolutionStageForMode } = require("./_lib/evolutionStage");
const { getTypesForMode } = require("./_lib/typesByMode");
const { validators } = require("../../shared/validation.cjs");

exports.handler = async (event) => {
  try {
    const mode = String(event.queryStringParameters?.mode || "classic");
    const id = Number(event.path.split("/").pop());

    // Validate inputs
    const idValidation = validators.pokemonId(id);
    if (!idValidation.valid) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          error: "INVALID_POKEMON_ID",
          message: idValidation.error,
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
    const pokemonId = Number(row.id);
    const gen = Number(row.gen || 1);
    const currentTypes = parseTypes(rawTypes);

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": "public, max-age=86400",
      },
      body: JSON.stringify({
        id: pokemonId,
        name: row.name,
        gen,
        height_dm: Number(row.height_dm || 0),
        weight_hg: Number(row.weight_hg || 0),
        types: getTypesForMode(pokemonId, gen, currentTypes, mode),
        habitat: row.habitat ?? "unknown",
        color: row.color ?? "unknown",
        evolution_stage: getEvolutionStageForMode({
          mode,
          id: pokemonId,
          evolutionStage: row.evolution_stage,
        }),
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

const { modeConfig } = require("./_lib/modes.js");
const { validators } = require("../../shared/validation.js");

function dayKeyArgentina() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const get = (t) => parts.find((p) => p.type === t)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

exports.handler = async function handler(event) {
  const mode = event.queryStringParameters?.mode || "classic";

  // Validate mode
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

  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=60",
    },
    body: JSON.stringify({
      dayKey: dayKeyArgentina(),
      dexMax: 1025,
      tz: "America/Argentina/Buenos_Aires",
      mode: cfg.id,
      gens: cfg.gens, // null = todas
    }),
  };
};

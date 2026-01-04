import { modeConfig } from "./_lib/modes.js";

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

export async function handler(event) {
  const mode = event.queryStringParameters?.mode || "classic";
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
}

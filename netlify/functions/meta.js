function dayKeyArgentina() {
  // Día basado en Argentina (America/Argentina/Buenos_Aires)
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const get = (t) => parts.find((p) => p.type === t)?.value;
  const y = get("year");
  const m = get("month");
  const d = get("day");
  return `${y}-${m}-${d}`;
}

exports.handler = async () => {
  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      dayKey: dayKeyArgentina(),
      dexMax: 1025,
      tz: "America/Argentina/Buenos_Aires",
    }),
  };
};

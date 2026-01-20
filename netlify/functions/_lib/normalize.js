// netlify/functions/_lib/normalize.js

function parseTypes(value) {
  if (Array.isArray(value)) return value;

  if (value == null) return [];

  if (typeof value !== "string") return [];

  const s = value.trim();
  if (!s) return [];

  // Caso: Postgres array serializado: {electric,steel}
  if (s.startsWith("{") && s.endsWith("}")) {
    return s
      .slice(1, -1)
      .split(",")
      .map((t) => t.replace(/^"|"$/g, "").trim())
      .filter(Boolean)
      .filter((t) => t.toLowerCase() !== "none");
  }

  // Caso: JSON string (viejo): ["bug","poison"] o "electric"
  if (
    (s.startsWith("[") && s.endsWith("]")) ||
    (s.startsWith('"') && s.endsWith('"'))
  ) {
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed))
        return parsed
          .map((t) => String(t).trim())
          .filter(Boolean)
          .filter((t) => t.toLowerCase() !== "none");
      if (typeof parsed === "string")
        return parsed
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .filter((t) => t.toLowerCase() !== "none");
    } catch {
      // cae al split común
    }
  }

  // Caso común: "bug,poison" o "electric"
  return s
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => t.toLowerCase() !== "none");
}

module.exports = { parseTypes };

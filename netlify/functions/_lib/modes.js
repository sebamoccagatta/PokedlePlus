function modeConfig(mode) {
  const m = String(mode || "classic").toLowerCase();
  const genMatch = m.match(/^gen([1-9])$/);

  if (genMatch) {
    const maxGen = Number(genMatch[1]);
    const gens = Array.from({ length: maxGen }, (_, i) => i + 1);
    return { id: `gen${maxGen}`, gens };
  }

  if (m === "infinite") return { id: "infinite", gens: null };

  // classic = todas
  return { id: "classic", gens: null };
}

module.exports = { modeConfig };

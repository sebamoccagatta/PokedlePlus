// Valid game modes (used for validation)
const VALID_MODES = [
  "classic",
  "gen1",
  "gen2",
  "gen3",
  "gen4",
  "gen5",
  "gen6",
  "gen7",
  "gen8",
  "gen9",
  "infinite",
];

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

module.exports = { modeConfig, VALID_MODES };

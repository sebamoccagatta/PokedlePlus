function modeConfig(mode) {
  const m = String(mode || "classic").toLowerCase();

  if (m === "gen1") return { id: "gen1", gens: [1] };
  if (m === "gen2") return { id: "gen2", gens: [2] };
  if (m === "gen3") return { id: "gen3", gens: [3] };
  if (m === "gen4") return { id: "gen4", gens: [4] };
  if (m === "gen5") return { id: "gen5", gens: [5] };
  if (m === "gen6") return { id: "gen6", gens: [6] };
  if (m === "gen7") return { id: "gen7", gens: [7] };
  if (m === "gen8") return { id: "gen8", gens: [8] };
  if (m === "gen9") return { id: "gen9", gens: [9] };

  // classic = todas
  return { id: "classic", gens: null };
}

module.exports = { modeConfig };

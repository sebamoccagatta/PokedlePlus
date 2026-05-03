export const MAX_ATTEMPTS = 30;

const SHORT_LIMIT_MODES = new Set(["gen1", "gen2", "gen3", "gen4", "gen5"]);

export function getMaxAttempts(mode) {
  if (SHORT_LIMIT_MODES.has(mode)) return 20;
  // Explicitly keep current infinite behavior
  if (mode === "infinite") return 30;
  return 30;
}

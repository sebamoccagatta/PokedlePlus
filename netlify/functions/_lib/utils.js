function normalizeName(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
}

function fnv1a(str) {
  // 32-bit FNV-1a
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function pickDailyTargetId({ secret, dayKey, count }) {
  const h = fnv1a(`${secret}:${dayKey}`);
  const idx = (h % count) + 1; // 1..count
  return idx;
}

function kindEq(a, b) {
  return a === b ? "correct" : "absent";
}

function kindText(a, b) {
  if (!a || !b) return a === b ? "correct" : "absent";
  return a === b ? "correct" : "absent";
}

function kindNumber(guess, target) {
  if (guess === target) return "correct";
  return guess > target ? "higher" : "lower";
}

// Tipo con “present” (amarillo) si existe en el set del target
function kindType(pos, guessTypes, targetTypes) {
  const g = guessTypes?.[pos] ?? null;
  const t = targetTypes?.[pos] ?? null;
  if (!g) return t ? "absent" : "correct";
  if (t === g) return "correct";
  if (Array.isArray(targetTypes) && targetTypes.includes(g)) return "present";
  return "absent";
}

function compareGuess({ target, guess }) {
  const tTypes = target.types || [];
  const gTypes = guess.types || [];

  const gen = kindNumber(guess.gen, target.gen);
  const height = kindNumber(guess.height_dm, target.height_dm);
  const weight = kindNumber(guess.weight_hg, target.weight_hg);
  const evolution = kindNumber(guess.evolution_stage, target.evolution_stage);

  return {
    id: guess.id,
    name: guess.name,
    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${guess.id}.png`,
    isCorrect: guess.id === target.id,
    columns: {
      type1: kindType(0, gTypes, tTypes),
      type2: kindType(1, gTypes, tTypes),
      gen,
      habitat: kindText(guess.habitat, target.habitat),
      color: kindText(guess.color, target.color),
      evolution,
      height,
      weight,
    },
  };
}

module.exports = {
  normalizeName,
  fnv1a,
  pickDailyTargetId,
  compareGuess,
};

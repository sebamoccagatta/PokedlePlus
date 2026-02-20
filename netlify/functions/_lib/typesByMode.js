// typesByMode.js
// Ajusta los tipos de Pokémon según el modo de juego para reflejar
// los tipos que tenían en esa generación (antes de recategorizaciones)

// Pokémon de Gen 1 que obtuvieron tipo Steel en Gen 2
const GEN1_STEEL_RECATEGORIZED = {
  81: ["electric", "steel"], // magnemite
  82: ["electric", "steel"], // magneton
};

// Pokémon de Gen 1-5 que obtuvieron tipo Fairy en Gen 6
const FAIRY_RECATEGORIZED = {
  // Gen 1
  35: ["fairy"], // clefairy
  36: ["fairy"], // clefable
  39: ["normal", "fairy"], // jigglypuff
  40: ["normal", "fairy"], // wigglytuff
  122: ["psychic", "fairy"], // mr-mime
  // Gen 2
  173: ["fairy"], // cleffa
  174: ["normal", "fairy"], // igglybuff
  175: ["fairy"], // togepi
  176: ["fairy", "flying"], // togetic
  183: ["water", "fairy"], // marill
  184: ["water", "fairy"], // azumarill
  209: ["fairy"], // snubbull
  210: ["fairy"], // granbull
  // Gen 3
  280: ["psychic", "fairy"], // ralts
  281: ["psychic", "fairy"], // kirlia
  282: ["psychic", "fairy"], // gardevoir
  298: ["normal", "fairy"], // azurill
  303: ["steel", "fairy"], // mawile
  // Gen 4
  439: ["psychic", "fairy"], // mime-jr
  468: ["fairy", "flying"], // togekiss
  // Gen 5
  546: ["grass", "fairy"], // cottonee
  547: ["grass", "fairy"], // whimsicott
};

// Tipos originales antes de cualquier recategorización
const ORIGINAL_TYPES = {
  // Gen 1 - antes de Steel (Gen 2)
  81: ["electric"], // magnemite
  82: ["electric"], // magneton
  // Gen 1 - antes de Fairy (Gen 6)
  35: ["normal"], // clefairy
  36: ["normal"], // clefable
  39: ["normal"], // jigglypuff
  40: ["normal"], // wigglytuff
  122: ["psychic"], // mr-mime
  // Gen 2 - antes de Fairy (Gen 6)
  173: ["normal"], // cleffa
  174: ["normal"], // igglybuff
  175: ["normal"], // togepi
  176: ["normal", "flying"], // togetic
  183: ["water"], // marill
  184: ["water"], // azumarill
  209: ["normal"], // snubbull
  210: ["normal"], // granbull
  // Gen 3 - antes de Fairy (Gen 6)
  280: ["psychic"], // ralts
  281: ["psychic"], // kirlia
  282: ["psychic"], // gardevoir
  298: ["normal"], // azurill
  303: ["steel"], // mawile
  // Gen 4 - antes de Fairy (Gen 6)
  439: ["psychic"], // mime-jr
  468: ["normal", "flying"], // togekiss
  // Gen 5 - antes de Fairy (Gen 6)
  546: ["grass"], // cottonee
  547: ["grass"], // whimsicott
};

/**
 * Obtiene los tipos correctos para un Pokémon según el modo de juego
 * @param {number} pokemonId - ID del Pokémon
 * @param {number} pokemonGen - Generación del Pokémon
 * @param {Array<string>} currentTypes - Tipos actuales del Pokémon en la DB
 * @param {string} mode - Modo de juego (classic, gen1, gen2, etc.)
 * @returns {Array<string>} Tipos ajustados para el modo
 */
function getTypesForMode(pokemonId, pokemonGen, currentTypes, mode) {
  // Modo classic o infinite = usa tipos modernos (actuales)
  if (mode === "classic" || mode === "infinite") {
    return currentTypes;
  }

  // Extraer número de generación del modo (gen1, gen2, etc.)
  const modeGenMatch = mode.match(/^gen([1-9])$/);
  if (!modeGenMatch) {
    return currentTypes;
  }

  const modeMaxGen = Number(modeGenMatch[1]);

  // Si el modo es Gen6+, usar tipos con Fairy
  if (modeMaxGen >= 6) {
    // Si este Pokémon fue recategorizado con Fairy, usar esos tipos
    if (FAIRY_RECATEGORIZED[pokemonId]) {
      return FAIRY_RECATEGORIZED[pokemonId];
    }
  }

  // Si el modo es Gen2+, usar tipos con Steel para Magnemite/Magneton
  if (modeMaxGen >= 2) {
    if (GEN1_STEEL_RECATEGORIZED[pokemonId]) {
      return GEN1_STEEL_RECATEGORIZED[pokemonId];
    }
  }

  // Si el Pokémon tiene tipos originales diferentes, usarlos
  // (esto aplica cuando el modo es anterior a la introducción del tipo)
  if (ORIGINAL_TYPES[pokemonId]) {
    return ORIGINAL_TYPES[pokemonId];
  }

  // Por defecto, usar los tipos actuales de la DB
  return currentTypes;
}

module.exports = { getTypesForMode };

// Pre-evolution events: when a baby Pokémon was added, shifting the line UP by 1
const PRE_EVOLUTION_EVENTS = [
  // Gen 2 babies affecting Gen 1 lines
  { introducedGen: 2, affectedIds: [25, 26] }, // Pichu -> Pikachu/Raichu
  { introducedGen: 2, affectedIds: [35, 36] }, // Cleffa -> Clefairy/Clefable
  { introducedGen: 2, affectedIds: [39, 40] }, // Igglybuff -> Jigglypuff/Wigglytuff
  { introducedGen: 2, affectedIds: [106, 107, 237] }, // Tyrogue -> Hitmonlee/Hitmonchan/Hitmontop
  { introducedGen: 2, affectedIds: [124] }, // Smoochum -> Jynx
  { introducedGen: 2, affectedIds: [125, 466] }, // Elekid -> Electabuzz/Electivire
  { introducedGen: 2, affectedIds: [126, 467] }, // Magby -> Magmar/Magmortar

  // Gen 3 babies affecting Gen 2 lines
  { introducedGen: 3, affectedIds: [183, 184] }, // Azurill -> Marill/Azumarill
  { introducedGen: 3, affectedIds: [202] }, // Wynaut -> Wobbuffet

  // Gen 4 babies affecting older lines
  { introducedGen: 4, affectedIds: [113, 242] }, // Happiny -> Chansey/Blissey
  { introducedGen: 4, affectedIds: [122, 866] }, // Mime Jr. -> Mr. Mime/Mr. Rime
  { introducedGen: 4, affectedIds: [143] }, // Munchlax -> Snorlax
  { introducedGen: 4, affectedIds: [185] }, // Bonsly -> Sudowoodo
  { introducedGen: 4, affectedIds: [226] }, // Mantyke -> Mantine
  { introducedGen: 4, affectedIds: [315, 407] }, // Budew -> Roselia/Roserade
  { introducedGen: 4, affectedIds: [358] }, // Chingling -> Chimecho
];

// New evolution events: when a new final evolution was added
// Note: These don't affect stage in older modes - Golbat is still stage 2 in Gen 1
// But they're here for documentation and potential future use
const NEW_EVOLUTION_EVENTS = [
  // Gen 2 new evolutions
  { introducedGen: 2, preEvolutionId: 42, newEvoId: 169 }, // Golbat -> Crobat
  { introducedGen: 2, preEvolutionId: 95, newEvoId: 208 }, // Onix -> Steelix
  { introducedGen: 2, preEvolutionId: 113, newEvoId: 242 }, // Chansey -> Blissey
  { introducedGen: 2, preEvolutionId: 117, newEvoId: 230 }, // Seadra -> Kingdra
  { introducedGen: 2, preEvolutionId: 123, newEvoId: 212 }, // Scyther -> Scizor
  { introducedGen: 2, preEvolutionId: 137, newEvoId: 233 }, // Porygon -> Porygon2

  // Gen 4 new evolutions (22 total)
  { introducedGen: 4, preEvolutionId: 82, newEvoId: 462 }, // Magneton -> Magnezone
  { introducedGen: 4, preEvolutionId: 108, newEvoId: 463 }, // Lickitung -> Lickilicky
  { introducedGen: 4, preEvolutionId: 112, newEvoId: 464 }, // Rhydon -> Rhyperior
  { introducedGen: 4, preEvolutionId: 114, newEvoId: 465 }, // Tangela -> Tangrowth
  { introducedGen: 4, preEvolutionId: 125, newEvoId: 466 }, // Electabuzz -> Electivire
  { introducedGen: 4, preEvolutionId: 126, newEvoId: 467 }, // Magmar -> Magmortar
  { introducedGen: 4, preEvolutionId: 176, newEvoId: 468 }, // Togetic -> Togekiss
  { introducedGen: 4, preEvolutionId: 190, newEvoId: 424 }, // Aipom -> Ambipom
  { introducedGen: 4, preEvolutionId: 193, newEvoId: 469 }, // Yanma -> Yanmega
  { introducedGen: 4, preEvolutionId: 198, newEvoId: 430 }, // Murkrow -> Honchkrow
  { introducedGen: 4, preEvolutionId: 200, newEvoId: 429 }, // Misdreavus -> Mismagius
  { introducedGen: 4, preEvolutionId: 207, newEvoId: 472 }, // Gligar -> Gliscor
  { introducedGen: 4, preEvolutionId: 215, newEvoId: 461 }, // Sneasel -> Weavile
  { introducedGen: 4, preEvolutionId: 221, newEvoId: 473 }, // Piloswine -> Mamoswine
  { introducedGen: 4, preEvolutionId: 233, newEvoId: 474 }, // Porygon2 -> Porygon-Z
  { introducedGen: 4, preEvolutionId: 299, newEvoId: 476 }, // Nosepass -> Probopass
  { introducedGen: 4, preEvolutionId: 315, newEvoId: 407 }, // Roselia -> Roserade
  { introducedGen: 4, preEvolutionId: 356, newEvoId: 477 }, // Dusclops -> Dusknoir

  // Gen 6 new evolutions
  { introducedGen: 6, preEvolutionId: 133, newEvoId: 700 }, // Eevee -> Sylveon

  // Gen 8 new evolutions (Legends Arceus)
  { introducedGen: 8, preEvolutionId: 123, newEvoId: 900 }, // Scyther -> Kleavor
  { introducedGen: 8, preEvolutionId: 217, newEvoId: 901 }, // Ursaring -> Ursaluna
  { introducedGen: 8, preEvolutionId: 234, newEvoId: 899 }, // Stantler -> Wyrdeer

  // Gen 9 new evolutions
  { introducedGen: 9, preEvolutionId: 57, newEvoId: 979 }, // Primeape -> Annihilape
  { introducedGen: 9, preEvolutionId: 203, newEvoId: 981 }, // Girafarig -> Farigiraf
  { introducedGen: 9, preEvolutionId: 206, newEvoId: 982 }, // Dunsparce -> Dudunsparce
  { introducedGen: 9, preEvolutionId: 625, newEvoId: 983 }, // Bisharp -> Kingambit
];

function modeToGeneration(mode) {
  const match = String(mode || "").toLowerCase().match(/^gen([1-9])$/);
  return match ? Number(match[1]) : null;
}

/**
 * Calcula la etapa evolutiva correcta según el modo de juego
 * @param {string} mode - Modo de juego (gen1, gen2, etc.)
 * @param {number} id - ID del Pokémon
 * @param {number} evolutionStage - Etapa evolutiva moderna (de la DB)
 * @returns {number} Etapa evolutiva ajustada para el modo
 */
function getEvolutionStageForMode({ mode, id, evolutionStage }) {
  const rawStage = Number(evolutionStage || 1);
  const modeGen = modeToGeneration(mode);

  // Modo classic o infinite = usar etapas modernas
  if (!modeGen) return rawStage;

  // Calcular offset por pre-evoluciones que no existían en este modo
  let offset = 0;
  for (const event of PRE_EVOLUTION_EVENTS) {
    // Si el bebé se introdujo DESPUÉS del modo actual Y este Pokémon está afectado
    // entonces restar 1 de su etapa (porque el bebé no existía)
    if (event.introducedGen > modeGen && event.affectedIds.includes(id)) {
      offset += 1;
    }
  }

  return Math.max(1, rawStage - offset);
}

module.exports = {
  getEvolutionStageForMode,
};

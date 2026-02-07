const PRE_EVOLUTION_EVENTS = [
  // Gen 2 babies affecting Gen 1 lines
  { introducedGen: 2, affectedIds: [25, 26] }, // Pichu -> Pikachu/Raichu
  { introducedGen: 2, affectedIds: [35, 36] }, // Cleffa -> Clefairy/Clefable
  { introducedGen: 2, affectedIds: [39, 40] }, // Igglybuff -> Jigglypuff/Wigglytuff
  { introducedGen: 2, affectedIds: [106, 107, 237] }, // Tyrogue line
  { introducedGen: 2, affectedIds: [124] }, // Smoochum -> Jynx
  { introducedGen: 2, affectedIds: [125, 466] }, // Elekid line
  { introducedGen: 2, affectedIds: [126, 467] }, // Magby line

  // Gen 3 babies affecting Gen 2 lines
  { introducedGen: 3, affectedIds: [183, 184] }, // Azurill line
  { introducedGen: 3, affectedIds: [202] }, // Wynaut -> Wobbuffet

  // Gen 4 babies affecting older lines
  { introducedGen: 4, affectedIds: [113, 242] }, // Happiny line
  { introducedGen: 4, affectedIds: [122, 866] }, // Mime Jr. line
  { introducedGen: 4, affectedIds: [143] }, // Munchlax -> Snorlax
  { introducedGen: 4, affectedIds: [185] }, // Bonsly -> Sudowoodo
  { introducedGen: 4, affectedIds: [226] }, // Mantyke -> Mantine
  { introducedGen: 4, affectedIds: [315, 407] }, // Budew line
  { introducedGen: 4, affectedIds: [358] }, // Chingling -> Chimecho
];

function modeToGeneration(mode) {
  const match = String(mode || "").toLowerCase().match(/^gen([1-9])$/);
  return match ? Number(match[1]) : null;
}

function getEvolutionStageForMode({ mode, id, evolutionStage }) {
  const rawStage = Number(evolutionStage || 1);
  const modeGen = modeToGeneration(mode);

  if (!modeGen) return rawStage;

  let offset = 0;
  for (const event of PRE_EVOLUTION_EVENTS) {
    if (event.introducedGen > modeGen && event.affectedIds.includes(id)) {
      offset += 1;
    }
  }

  return Math.max(1, rawStage - offset);
}

module.exports = {
  getEvolutionStageForMode,
};

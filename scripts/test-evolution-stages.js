// Script para probar las etapas evolutivas dinámicas
const { getEvolutionStageForMode } = require('../netlify/functions/_lib/evolutionStage');

// Casos de prueba con etapas modernas (Gen 9)
const testCases = [
  // Pikachu line (baby added Gen 2)
  { id: 25, name: 'Pikachu', modernStage: 2, tests: [
    { mode: 'gen1', expected: 1, reason: 'Gen1: Pichu no existe' },
    { mode: 'gen2', expected: 2, reason: 'Gen2+: Pichu existe' },
    { mode: 'classic', expected: 2, reason: 'Classic: usa moderna' }
  ]},
  { id: 26, name: 'Raichu', modernStage: 3, tests: [
    { mode: 'gen1', expected: 2, reason: 'Gen1: Pichu no existe' },
    { mode: 'gen2', expected: 3, reason: 'Gen2+: Pichu existe' },
  ]},

  // Chansey line (Blissey added Gen 2, Happiny added Gen 4)
  { id: 113, name: 'Chansey', modernStage: 2, tests: [
    { mode: 'gen1', expected: 1, reason: 'Gen1: ni Happiny ni Blissey existen' },
    { mode: 'gen2', expected: 1, reason: 'Gen2-3: Blissey existe pero Happiny no' },
    { mode: 'gen4', expected: 2, reason: 'Gen4+: Happiny existe, Chansey es 2 de 3' },
  ]},
  { id: 242, name: 'Blissey', modernStage: 3, tests: [
    // Gen1: Blissey no existe, filtrado por generación
    { mode: 'gen2', expected: 2, reason: 'Gen2-3: Happiny no existe, Chansey→Blissey' },
    { mode: 'gen4', expected: 3, reason: 'Gen4+: Happiny→Chansey→Blissey' },
  ]},

  // Electabuzz line (Elekid added Gen 2, Electivire added Gen 4)
  { id: 125, name: 'Electabuzz', modernStage: 2, tests: [
    { mode: 'gen1', expected: 1, reason: 'Gen1: Elekid no existe' },
    { mode: 'gen2', expected: 2, reason: 'Gen2-3: Elekid existe, Electivire no' },
    { mode: 'gen4', expected: 2, reason: 'Gen4+: Elekid→Electabuzz→Electivire (2 de 3)' },
  ]},
  { id: 466, name: 'Electivire', modernStage: 3, tests: [
    // Gen3: Electivire no existe, filtrado por generación
    { mode: 'gen4', expected: 3, reason: 'Gen4+: Elekid→Electabuzz→Electivire' },
  ]},

  // Golbat line (Crobat added Gen 2, NO baby)
  { id: 42, name: 'Golbat', modernStage: 2, tests: [
    { mode: 'gen1', expected: 2, reason: 'Gen1: Zubat→Golbat (etapa 2)' },
    { mode: 'gen2', expected: 2, reason: 'Gen2+: Zubat→Golbat→Crobat (sigue siendo 2)' },
  ]},
  { id: 169, name: 'Crobat', modernStage: 3, tests: [
    { mode: 'gen1', expected: 3, reason: 'Gen1: Crobat no existía' },
    { mode: 'gen2', expected: 3, reason: 'Gen2+: Zubat→Golbat→Crobat (etapa 3)' },
  ]},

  // Roselia line (Budew added Gen 4, Roserade added Gen 4)
  { id: 315, name: 'Roselia', modernStage: 2, tests: [
    { mode: 'gen3', expected: 1, reason: 'Gen3: ni Budew ni Roserade existen' },
    { mode: 'gen4', expected: 2, reason: 'Gen4+: Budew→Roselia→Roserade (2 de 3)' },
  ]},
  { id: 407, name: 'Roserade', modernStage: 3, tests: [
    { mode: 'gen3', expected: 2, reason: 'Gen3: Roserade no existía, Budew no existe' },
    { mode: 'gen4', expected: 3, reason: 'Gen4+: Budew→Roselia→Roserade' },
  ]},

  // Magneton line (Magnezone added Gen 4, NO baby)
  { id: 82, name: 'Magneton', modernStage: 2, tests: [
    { mode: 'gen1', expected: 2, reason: 'Gen1: Magnemite→Magneton' },
    { mode: 'gen4', expected: 2, reason: 'Gen4+: Magnemite→Magneton→Magnezone (sigue siendo 2)' },
  ]},
  { id: 462, name: 'Magnezone', modernStage: 3, tests: [
    { mode: 'gen3', expected: 3, reason: 'Gen3: Magnezone no existía' },
    { mode: 'gen4', expected: 3, reason: 'Gen4+: Magnemite→Magneton→Magnezone' },
  ]},

  // Marill line (Azurill added Gen 3)
  { id: 183, name: 'Marill', modernStage: 2, tests: [
    { mode: 'gen2', expected: 1, reason: 'Gen2: Azurill no existe' },
    { mode: 'gen3', expected: 2, reason: 'Gen3+: Azurill→Marill→Azumarill (2 de 3)' },
  ]},

  // Jigglypuff line (Igglybuff added Gen 2)
  { id: 39, name: 'Jigglypuff', modernStage: 2, tests: [
    { mode: 'gen1', expected: 1, reason: 'Gen1: Igglybuff no existe' },
    { mode: 'gen2', expected: 2, reason: 'Gen2+: Igglybuff→Jigglypuff→Wigglytuff (2 de 3)' },
  ]},
];

console.log('🧪 Testing Evolution Stage Logic\n');
console.log('='.repeat(80));

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

testCases.forEach(pokemon => {
  console.log(`\n${pokemon.name} (ID ${pokemon.id}) - Modern Stage: ${pokemon.modernStage}`);
  console.log('-'.repeat(80));

  pokemon.tests.forEach(test => {
    totalTests++;
    const result = getEvolutionStageForMode({
      mode: test.mode,
      id: pokemon.id,
      evolutionStage: pokemon.modernStage
    });

    const passed = result === test.expected;
    const status = passed ? '✅ PASS' : '❌ FAIL';

    if (passed) {
      passedTests++;
    } else {
      failedTests++;
    }

    console.log(`  ${status} | Mode: ${test.mode.padEnd(8)} | Expected: ${test.expected} | Got: ${result}`);
    console.log(`         | ${test.reason}`);

    if (!passed) {
      console.log(`         | ⚠️  MISMATCH!`);
    }
  });
});

console.log('\n' + '='.repeat(80));
console.log(`\n📊 Results: ${passedTests}/${totalTests} tests passed`);

if (failedTests > 0) {
  console.log(`\n❌ ${failedTests} test(s) failed!`);
  process.exit(1);
} else {
  console.log('\n✅ All tests passed!');
}

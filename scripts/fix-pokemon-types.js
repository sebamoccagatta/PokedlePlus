// Script para actualizar los tipos en pokemon.json a los tipos modernos
const fs = require('fs');
const path = require('path');

const pokemonJsonPath = path.join(__dirname, '../frontend/src/data/pokemon.json');
const pokemon = JSON.parse(fs.readFileSync(pokemonJsonPath, 'utf-8'));

// Mapeo de IDs a tipos modernos (con Fairy y Steel)
const modernTypes = {
  35: ["fairy"], // clefairy
  36: ["fairy"], // clefable
  39: ["normal", "fairy"], // jigglypuff
  40: ["normal", "fairy"], // wigglytuff
  81: ["electric", "steel"], // magnemite
  82: ["electric", "steel"], // magneton
  122: ["psychic", "fairy"], // mr-mime
  173: ["fairy"], // cleffa
  174: ["normal", "fairy"], // igglybuff
  175: ["fairy"], // togepi
  176: ["fairy", "flying"], // togetic
  183: ["water", "fairy"], // marill
  184: ["water", "fairy"], // azumarill
  209: ["fairy"], // snubbull
  210: ["fairy"], // granbull
  280: ["psychic", "fairy"], // ralts
  281: ["psychic", "fairy"], // kirlia
  282: ["psychic", "fairy"], // gardevoir
  298: ["normal", "fairy"], // azurill
  303: ["steel", "fairy"], // mawile
  439: ["psychic", "fairy"], // mime-jr
  468: ["fairy", "flying"], // togekiss
  546: ["grass", "fairy"], // cottonee
  547: ["grass", "fairy"], // whimsicott
};

let updated = 0;

pokemon.forEach((p) => {
  if (modernTypes[p.id]) {
    p.types = modernTypes[p.id];
    updated++;
    console.log(`Updated ${p.name} (ID ${p.id}): ${p.types.join('/')}`);
  }
});

fs.writeFileSync(pokemonJsonPath, JSON.stringify(pokemon, null, 2), 'utf-8');

console.log(`\n✅ Updated ${updated} Pokémon with modern types`);

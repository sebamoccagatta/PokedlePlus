require("dotenv").config();
const { neon } = require("@neondatabase/serverless");

const DEX_MAX = Number(process.env.DEX_MAX || 1025);
const CONCURRENCY = Number(process.env.SEED_CONCURRENCY || 6);

async function fetchJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Fetch failed ${r.status} ${url}`);
  return r.json();
}

function computeEvolutionStage(chain, targetName) {
  // Recorre la cadena y devuelve el "nivel" (1,2,3...) donde aparece el Pokémon
  // targetName viene en minúsculas
  let stageFound = null;

  function walk(node, stage) {
    const name = String(node?.species?.name || "").toLowerCase();
    if (name === targetName) stageFound = stage;

    const next = node?.evolves_to || [];
    for (const n of next) walk(n, stage + 1);
  }

  walk(chain, 1);
  return stageFound || 1;
}

function generationToNumber(genName) {
  // "generation-i" -> 1
  const m = String(genName || "").match(/generation-([ivx]+)/i);
  if (!m) return 1;
  const roman = m[1].toUpperCase();
  const map = {
    I: 1,
    II: 2,
    III: 3,
    IV: 4,
    V: 5,
    VI: 6,
    VII: 7,
    VIII: 8,
    IX: 9,
  };
  return map[roman] || 1;
}

async function loadOne(id) {
  // /pokemon: height, weight, types
  const p = await fetchJson(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const name = String(p.name).toLowerCase();
  const height_dm = Number(p.height || 0);
  const weight_hg = Number(p.weight || 0);
  const types = (p.types || [])
    .sort((a, b) => (a.slot ?? 0) - (b.slot ?? 0))
    .map((t) => String(t.type.name).toLowerCase());

  // /species: color, habitat, generation, evolution chain
  const s = await fetchJson(`https://pokeapi.co/api/v2/pokemon-species/${id}`);

  const color = s.color?.name ? String(s.color.name).toLowerCase() : null;
  const habitat = s.habitat?.name ? String(s.habitat.name).toLowerCase() : null;
  const gen = generationToNumber(s.generation?.name);

  let evolution_stage = 1;
  try {
    const evoUrl = s.evolution_chain?.url;
    if (evoUrl) {
      const evo = await fetchJson(evoUrl);
      evolution_stage = computeEvolutionStage(evo.chain, name);
    }
  } catch {
    evolution_stage = 1;
  }

  return {
    id,
    name,
    gen,
    height_dm,
    weight_hg,
    types_json: JSON.stringify(types),
    habitat,
    color,
    evolution_stage,
  };
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error(
      "❌ Falta DATABASE_URL. Copiala desde Netlify DB/Neon y exportala en tu terminal."
    );
    process.exit(1);
  }

  const sql = neon(url);

  // Si ya hay data, no re-seedear por accidente
  const existing = await sql`SELECT COUNT(*)::int AS c FROM pokemon`;
  if ((existing[0]?.c || 0) > 0) {
    console.log(
      `ℹ️ Ya hay ${existing[0].c} pokémon en la DB. Si querés reseed, vaciá la tabla primero.`
    );
    return;
  }

  console.log(
    `🌱 Seedeando ${DEX_MAX} Pokémon... (concurrency=${CONCURRENCY})`
  );

  let nextId = 1;
  let done = 0;

  async function worker() {
    while (true) {
      const id = nextId++;
      if (id > DEX_MAX) return;

      try {
        const row = await loadOne(id);

        await sql`
          INSERT INTO pokemon (id, name, gen, height_dm, weight_hg, types_json, habitat, color, evolution_stage)
          VALUES (
            ${row.id},
            ${row.name},
            ${row.gen},
            ${row.height_dm},
            ${row.weight_hg},
            ${row.types_json}::jsonb,
            ${row.habitat},
            ${row.color},
            ${row.evolution_stage}
          )
        `;

        done++;
        if (done % 25 === 0) {
          console.log(`✅ ${done}/${DEX_MAX}`);
        }
      } catch (e) {
        console.log(`⚠️ ID ${id} falló: ${e.message}`);
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  console.log("✅ Seed terminado");
}

main().catch((e) => {
  console.error("❌ Seed error:", e);
  process.exit(1);
});

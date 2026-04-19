CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS pokemon (
  id              INT PRIMARY KEY,
  name            TEXT NOT NULL,
  gen             INT NOT NULL,
  height_dm       INT NOT NULL,
  weight_hg       INT NOT NULL,
  types_json      JSONB NOT NULL,
  habitat         TEXT,
  color           TEXT,
  evolution_stage INT NOT NULL DEFAULT 1
);

-- Índice B-tree básico para búsquedas exactas
CREATE INDEX IF NOT EXISTS idx_pokemon_name ON pokemon (name);

-- Full-Text Search con pg_trgm (ver scripts/add-fts-indexes.js)
-- Ejecutar: npm run db:fts
--
-- Estos índices permiten búsqueda fuzzy tolerante a typos:
-- - idx_pokemon_name_trgm: GIN trigram para fuzzy matching en name
-- - idx_pokemon_gen_name_trgm: Compuesto gen+name para queries filtradas
-- - idx_pokemon_gen: Para filtrado por generación

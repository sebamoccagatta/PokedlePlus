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

CREATE INDEX IF NOT EXISTS idx_pokemon_name ON pokemon (name);

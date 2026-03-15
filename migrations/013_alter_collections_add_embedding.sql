CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE collections
ADD COLUMN IF NOT EXISTS embedding VECTOR(1536);

-- Index on the embedding column to optimize vector similarity searches on collections
CREATE INDEX IF NOT EXISTS idx_collections_embedding ON collections USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(20),
    icon VARCHAR(50) DEFAULT 'folder',
    bookmarks_count INTEGER DEFAULT 0,
    embedding VECTOR(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para optimizar búsquedas de similitud vectorial sobre el campo `embedding`, permitiendo encontrar colecciones similares (por ejemplo, para recomendaciones o agrupamientos).
CREATE INDEX IF NOT EXISTS idx_collections_embedding ON collections USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);
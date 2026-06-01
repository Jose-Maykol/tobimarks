CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    slug VARCHAR(50) NOT NULL,
    color VARCHAR(100),
    embedding VECTOR(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, slug)
);

-- Índice para optimizar consultas que filtran etiquetas por usuario, como al listar todas las etiquetas de un usuario.
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);

-- Índice para acelerar la búsqueda de etiquetas por nombre dentro del contexto de un usuario, útil para evitar duplicados o buscar etiquetas específicas.
CREATE INDEX IF NOT EXISTS idx_tags_user_id_name ON tags(user_id, name);

-- Índice para permitir búsquedas eficientes de similitud vectorial sobre el campo `embedding`, facilitando la recomendación o agrupamiento de etiquetas similares.
CREATE INDEX IF NOT EXISTS idx_tags_embedding ON tags USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL,
    style_token VARCHAR(100), -- bg-blue-100
    embedding VECTOR(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, slug)
);

-- Index on user_id to optimize queries filtering tags by user (e.g., fetching all tags for a specific user)
CREATE INDEX idx_tags_user_id ON tags(user_id);

-- Index on user_id and name to optimize queries filtering tags by name for a specific user
CREATE INDEX idx_tags_user_id_name ON tags(user_id, name);

-- Index on the embedding column to optimize vector similarity searches on tags
CREATE INDEX idx_tags_embedding ON tags USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);

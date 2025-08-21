CREATE TABLE websites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    favicon_url TEXT,
    primary_color VARCHAR(7),
    bookmark_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index to speed up lookups by the `name` column, useful for exact name searches.
CREATE INDEX idx_websites_name ON websites (name);

-- Enables trigram indexing for the `name` column, allowing efficient partial and fuzzy searches.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_websites_name_trgm ON websites USING gin(name gin_trgm_ops);

-- Optimizes queries that order websites by their creation date in descending order.
CREATE INDEX idx_websites_created_at ON websites (created_at DESC);

-- Facilitates queries that rank websites by the number of associated bookmarks in descending order.
CREATE INDEX idx_websites_bookmark_count ON websites (bookmark_count DESC);
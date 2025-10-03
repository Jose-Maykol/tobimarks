CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    website_id UUID NOT NULL REFERENCES websites(id),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,

    url TEXT NOT NULL,
    title VARCHAR(500),
    description TEXT,
    
    og_title VARCHAR(500),
    og_description TEXT,
    og_image_url TEXT,

    is_favorite BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,

    last_accessed_at TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 0,

    embedding VECTOR(1536),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,

    search_vector tsvector
);

-- Unique constraint to prevent duplicate URLs per user
CREATE UNIQUE INDEX idx_unique_user_bookmark_url ON bookmarks (user_id, url);

CREATE UNIQUE INDEX idx_unique_user_bookmark_url ON bookmarks (user_id, url) WHERE deleted_at IS NULL;

-- Index on user_id to optimize queries filtering by user (e.g., fetching all bookmarks for a specific user)
CREATE INDEX idx_bookmarks_user_id ON bookmarks (user_id);

-- Index on user_favorite to optimize queries filtering favorite bookmarks for a specific user
CREATE INDEX idx_bookmarks_user_favorite ON bookmarks (user_id, is_favorite) WHERE is_favorite = true;

-- Index on user_archived to optimize queries filtering archived bookmarks for a specific user
CREATE INDEX idx_bookmarks_user_archived ON bookmarks (user_id, is_archived) WHERE is_archived = true;

-- Index on user_category to optimize queries filtering bookmarks by category for a specific user
CREATE INDEX idx_bookmarks_user_category ON bookmarks (user_id, category_id);

-- Index on user_created_at to optimize queries sorting bookmarks by creation date for a specific user
CREATE INDEX idx_bookmarks_user_created_at ON bookmarks (user_id, created_at DESC);

-- Index on user_last_accessed to optimize queries sorting bookmarks by last accessed date for a specific user
CREATE INDEX idx_bookmarks_user_last_accessed ON bookmarks (user_id, last_accessed_at DESC);

-- Index on user_access_count to optimize queries sorting bookmarks by access count for a specific user
CREATE INDEX idx_bookmarks_user_access_count ON bookmarks (user_id, access_count DESC);

-- Full-text search index on the search_vector column to optimize text search queries on bookmarks
CREATE INDEX idx_bookmarks_search_vector ON bookmarks USING gin(search_vector);
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    website_id UUID NOT NULL REFERENCES websites(id),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    
    url TEXT NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    
    meta_title VARCHAR(500),
    meta_description TEXT,
    og_image_url TEXT,
    
    -- Content analysis
    estimated_read_time INTEGER,
    word_count INTEGER,
    
    -- User organization
    is_favorite BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    
    -- Access tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 0,
    
    -- Full-text search
    search_vector tsvector,
);
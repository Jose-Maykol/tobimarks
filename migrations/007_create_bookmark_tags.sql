CREATE TABLE bookmark_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bookmark_id UUID NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(bookmark_id, tag_id)
);
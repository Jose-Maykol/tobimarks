CREATE TABLE bookmark_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bookmark_id UUID NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bookmark_access_logs_bookmark_id ON bookmark_access_logs(bookmark_id);
CREATE INDEX idx_bookmark_access_logs_accessed_at ON bookmark_access_logs(accessed_at);

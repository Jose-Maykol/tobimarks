CREATE TABLE websites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    favicon_url TEXT,
    primary_color VARCHAR(7),
    description TEXT,
    is_tech_related BOOLEAN DEFAULT true,
    avg_read_time INTEGER,
    bookmark_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
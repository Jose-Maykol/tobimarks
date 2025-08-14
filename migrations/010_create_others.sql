CREATE TABLE user_homepage_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bookmark_id UUID REFERENCES bookmarks(id) ON DELETE CASCADE,
    website_id UUID REFERENCES websites(id) ON DELETE CASCADE, -- For quick access to entire domains
    
    -- Display configuration
    display_type VARCHAR(20) NOT NULL CHECK (display_type IN ('bookmark', 'website', 'collection')),
    collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
    
    -- Layout and positioning
    position_order INTEGER NOT NULL,
    grid_size VARCHAR(10) DEFAULT 'medium', -- small, medium, large for different tile sizes
    custom_title VARCHAR(100), -- Override default title
    custom_icon_url TEXT, -- Custom icon override
    
    -- Visibility and behavior
    is_visible BOOLEAN DEFAULT true,
    click_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure only one type is selected per item
    CONSTRAINT valid_homepage_item CHECK (
        (display_type = 'bookmark' AND bookmark_id IS NOT NULL AND website_id IS NULL AND collection_id IS NULL) OR
        (display_type = 'website' AND website_id IS NOT NULL AND bookmark_id IS NULL AND collection_id IS NULL) OR
        (display_type = 'collection' AND collection_id IS NOT NULL AND bookmark_id IS NULL AND website_id IS NULL)
    ),
    
    -- Unique position per user
    UNIQUE(user_id, position_order)
);

-- Quick access patterns - learn from user behavior to suggest homepage items
CREATE TABLE user_access_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bookmark_id UUID REFERENCES bookmarks(id) ON DELETE CASCADE,
    website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
    
    -- Pattern tracking
    access_frequency INTEGER DEFAULT 1, -- How often accessed
    last_access_time TIME, -- What time of day typically accessed
    access_day_pattern INTEGER DEFAULT 0, -- Bitmask for days of week (1=Mon, 2=Tue, 4=Wed, etc.)
    avg_session_duration INTEGER DEFAULT 0, -- Average time spent (seconds)
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Either bookmark or website, not both
    CONSTRAINT valid_access_pattern CHECK (
        (bookmark_id IS NOT NULL AND website_id IS NULL) OR
        (website_id IS NOT NULL AND bookmark_id IS NULL)
    )
);

-- Activity tracking for analytics and smart suggestions
CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'bookmark_created', 'bookmark_accessed', 'homepage_configured'
    resource_type VARCHAR(50), -- 'bookmark', 'website', 'collection'
    resource_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

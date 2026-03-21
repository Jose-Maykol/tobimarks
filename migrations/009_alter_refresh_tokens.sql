ALTER TABLE refresh_tokens
    ADD COLUMN IF NOT EXISTS device_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS device_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS user_agent TEXT,
    ADD COLUMN IF NOT EXISTS ip_address INET,
    ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE refresh_tokens DROP CONSTRAINT IF EXISTS unique_user_device;
ALTER TABLE refresh_tokens ADD CONSTRAINT unique_user_device UNIQUE(user_id, device_id);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_active ON refresh_tokens(is_active, expires_at);

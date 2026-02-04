-- Create table for storing user data
CREATE TABLE IF NOT EXISTS user_data (
    id TEXT PRIMARY KEY DEFAULT 'default_user',
    data JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read/write (for personal use - no auth needed)
CREATE POLICY "Allow all access" ON user_data
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Insert default row
INSERT INTO user_data (id, data) VALUES ('default_user', '{}')
ON CONFLICT (id) DO NOTHING;

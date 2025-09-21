-- Create user_memory table for storing contextual facts about users
CREATE TABLE IF NOT EXISTS user_memory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  facts JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_memory_user_id ON user_memory(user_id);

-- Enable RLS
ALTER TABLE user_memory ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access only their own memory
CREATE POLICY "Users can access own memory" ON user_memory
  FOR ALL USING (auth.uid() = user_id);

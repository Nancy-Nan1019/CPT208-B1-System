-- ============================================================
-- XJTLU Group Discussion Platform - Supabase Database Schema
-- Run this SQL in your Supabase project SQL editor
-- ============================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  role VARCHAR CHECK (role IN ('teacher', 'student')) NOT NULL,
  personality VARCHAR CHECK (personality IN ('E', 'I') OR personality IS NULL),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic VARCHAR NOT NULL,
  duration INT NOT NULL, -- in minutes
  group_size INT DEFAULT 4,
  status VARCHAR DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'completed')),
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  name VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group members table
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Speaking logs table
CREATE TABLE IF NOT EXISTS speaking_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration NUMERIC -- in seconds
);

-- Scores table
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  total_score INT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, group_id, session_id)
);

-- AI prompts table
CREATE TABLE IF NOT EXISTS ai_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  trigger_type VARCHAR,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE speaking_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;

-- Users: everyone can read, users can update own profile
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Sessions: everyone can read, teachers can insert/update
CREATE POLICY "Anyone can view sessions" ON sessions FOR SELECT USING (true);
CREATE POLICY "Teachers can create sessions" ON sessions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'teacher')
);
CREATE POLICY "Teachers can update own sessions" ON sessions FOR UPDATE USING (teacher_id = auth.uid());

-- Groups: everyone can read
CREATE POLICY "Anyone can view groups" ON groups FOR SELECT USING (true);
CREATE POLICY "Teachers can manage groups" ON groups FOR ALL USING (
  EXISTS (
    SELECT 1 FROM sessions s
    JOIN users u ON u.id = auth.uid()
    WHERE s.id = session_id AND s.teacher_id = auth.uid() AND u.role = 'teacher'
  )
);

-- Group members: everyone can read
CREATE POLICY "Anyone can view group members" ON group_members FOR SELECT USING (true);
CREATE POLICY "System can manage group members" ON group_members FOR ALL USING (true);

-- Speaking logs: users can insert own, all can read
CREATE POLICY "Anyone can view speaking logs" ON speaking_logs FOR SELECT USING (true);
CREATE POLICY "Users can insert own speaking logs" ON speaking_logs FOR INSERT WITH CHECK (user_id = auth.uid());

-- Scores: everyone can read
CREATE POLICY "Anyone can view scores" ON scores FOR SELECT USING (true);
CREATE POLICY "System can manage scores" ON scores FOR ALL USING (true);

-- AI prompts: everyone can read
CREATE POLICY "Anyone can view ai prompts" ON ai_prompts FOR SELECT USING (true);
CREATE POLICY "System can manage ai prompts" ON ai_prompts FOR ALL USING (true);

-- ============================================================
-- Enable Realtime for key tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE speaking_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE scores;
ALTER PUBLICATION supabase_realtime ADD TABLE group_members;
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;

-- ============================================================
-- Handle new user registration (auto-populate users table)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Only insert if not already handled by application code
  INSERT INTO public.users (id, email, name, role)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', 'User'), 
          COALESCE(new.raw_user_meta_data->>'role', 'student'))
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

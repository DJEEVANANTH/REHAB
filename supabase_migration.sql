-- ============================================================
-- AI GYM COACH — Supabase Database Migration (FULL)
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. PROFILES TABLE (for Supabase Auth users)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name   TEXT DEFAULT '',
  username    TEXT DEFAULT '',
  email       TEXT DEFAULT '',
  phone_number TEXT DEFAULT '',
  location    TEXT DEFAULT '',
  age         INTEGER DEFAULT 28,
  weight      NUMERIC(5,1) DEFAULT 78,
  height      INTEGER DEFAULT 182,
  body_fat    NUMERIC(4,1) DEFAULT 14,
  fitness_goal TEXT DEFAULT 'Hypertrophy & Strength',
  bio         TEXT DEFAULT '',
  avatar_url  TEXT DEFAULT '',
  joined_date TEXT DEFAULT '',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Add any missing columns to existing profiles table (safe to run multiple times)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='phone_number') THEN
    ALTER TABLE public.profiles ADD COLUMN phone_number TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='location') THEN
    ALTER TABLE public.profiles ADD COLUMN location TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='age') THEN
    ALTER TABLE public.profiles ADD COLUMN age INTEGER DEFAULT 28;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='weight') THEN
    ALTER TABLE public.profiles ADD COLUMN weight NUMERIC(5,1) DEFAULT 78;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='height') THEN
    ALTER TABLE public.profiles ADD COLUMN height INTEGER DEFAULT 182;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='body_fat') THEN
    ALTER TABLE public.profiles ADD COLUMN body_fat NUMERIC(4,1) DEFAULT 14;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='fitness_goal') THEN
    ALTER TABLE public.profiles ADD COLUMN fitness_goal TEXT DEFAULT 'Hypertrophy & Strength';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='bio') THEN
    ALTER TABLE public.profiles ADD COLUMN bio TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='avatar_url') THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='joined_date') THEN
    ALTER TABLE public.profiles ADD COLUMN joined_date TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='updated_at') THEN
    ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create a profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, username, joined_date)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', '@' || split_part(NEW.email, '@', 1) || '_fit'),
    TO_CHAR(NOW(), 'Mon YYYY')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ─────────────────────────────────────────────
-- 2. WORKOUT SESSIONS TABLE
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_id      TEXT NOT NULL,
  reps             INTEGER DEFAULT 0,
  sets             INTEGER DEFAULT 0,
  calories         INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  accuracy         NUMERIC(4,1) DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workout_sessions
DROP POLICY IF EXISTS "Users can view own sessions" ON public.workout_sessions;
CREATE POLICY "Users can view own sessions"
  ON public.workout_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sessions" ON public.workout_sessions;
CREATE POLICY "Users can insert own sessions"
  ON public.workout_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own sessions" ON public.workout_sessions;
CREATE POLICY "Users can delete own sessions"
  ON public.workout_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS workout_sessions_user_id_idx ON public.workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS workout_sessions_created_at_idx ON public.workout_sessions(created_at DESC);


-- ─────────────────────────────────────────────
-- 3. USERS TABLE (Custom auth: OTP + Google)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.users (
  id              TEXT PRIMARY KEY DEFAULT 'u_' || FLOOR(EXTRACT(EPOCH FROM NOW()) * 1000)::TEXT,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  profile_image   TEXT DEFAULT '',
  login_provider  TEXT NOT NULL CHECK (login_provider IN ('google', 'otp')),
  created_date    TIMESTAMPTZ DEFAULT NOW(),
  last_login      TIMESTAMPTZ DEFAULT NOW(),
  joined_date     TEXT NOT NULL,
  username        TEXT DEFAULT '',
  phone_number    TEXT DEFAULT '',
  location        TEXT DEFAULT '',
  age             INTEGER DEFAULT 28,
  weight          NUMERIC(5,1) DEFAULT 78,
  height          INTEGER DEFAULT 182,
  body_fat        NUMERIC(4,1) DEFAULT 14,
  fitness_goal    TEXT DEFAULT 'Hypertrophy & Strength',
  google_id       TEXT DEFAULT ''
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow backend (service role) to do everything - frontend has no direct access
DROP POLICY IF EXISTS "Service role full access on users" ON public.users;
CREATE POLICY "Service role full access on users"
  ON public.users
  USING (true)
  WITH CHECK (true);

-- Index
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_google_id_idx ON public.users(google_id) WHERE google_id != '';


-- ─────────────────────────────────────────────
-- 4. OTPS TABLE (One-Time Password store)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.otps (
  id          BIGSERIAL PRIMARY KEY,
  email       TEXT NOT NULL,
  otp         TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.otps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on otps" ON public.otps;
CREATE POLICY "Service role full access on otps"
  ON public.otps
  USING (true)
  WITH CHECK (true);

-- Index for quick email lookups
CREATE INDEX IF NOT EXISTS otps_email_idx ON public.otps(email);

-- Auto-expire: delete OTPs older than 10 minutes (cleanup job)
CREATE INDEX IF NOT EXISTS otps_expires_at_idx ON public.otps(expires_at);


-- ─────────────────────────────────────────────
-- 5. SESSIONS TABLE (JWT session store)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.sessions (
  id          BIGSERIAL PRIMARY KEY,
  user_id     TEXT NOT NULL,
  token       TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on sessions" ON public.sessions;
CREATE POLICY "Service role full access on sessions"
  ON public.sessions
  USING (true)
  WITH CHECK (true);

-- Index for fast token lookups
CREATE INDEX IF NOT EXISTS sessions_token_idx ON public.sessions(token);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_created_at_idx ON public.sessions(created_at DESC);


-- ─────────────────────────────────────────────
-- 6. SEED EXISTING USERS FROM fallback_database.json
-- ─────────────────────────────────────────────

INSERT INTO public.users (id, name, email, profile_image, login_provider, joined_date, username, google_id)
VALUES
  ('u_1779957166978', 'Ragul Jee0709', 'raguljee0709@gmail.com', 'https://lh3.googleusercontent.com/a/ACg8ocKccvG6qmkCfkYmoB_EhOVKJ76jyeo1zyXpgVNDoBU2z_edaA=s96-c', 'google', 'May 2026', '@raguljee0709', '113768041647356663700'),
  ('u_1779957402675', 'RAGUL G', 'ragulg1032.sse@saveetha.com', 'https://lh3.googleusercontent.com/a/ACg8ocIwK8JAYv-UwSbNNnOw8CdMt5U433Y8u3IobYX5wcCm5hCzyiUi=s96-c', 'google', 'May 2026', '@ragulg1032.sse', '111329089030171961479'),
  ('u_1779970919288', 'Ragul Jee', 'raguljee0409@gmail.com', 'https://lh3.googleusercontent.com/a/ACg8ocIZ1on8E6iTBGI028em_sTtofTYR58jVGNkSzH_vwtbxIsPHg=s96-c', 'google', 'May 2026', '@raguljee0409', '112585893247304103924'),
  ('u_1779989525897', 'Google Athlete', 'raguljee0408@gmail.com', 'https://lh3.googleusercontent.com/a/default-user', 'google', 'May 2026', '@raguljee0408', 'google_oauth_sub_1029384756'),
  ('u_1779996083957', 'Ragul Ganesan', 'ganesanragul049@gmail.com', 'https://lh3.googleusercontent.com/a/ACg8ocJMGOqsEdcLXHrBPe08WMS60KeRx9zIg4Oa1asBJrFn_ouanA=s96-c', 'google', 'May 2026', '@ganesanragul049', '108586176235433964097'),
  ('u_1780047405201', 'Answar Vijes', 'answarvijes@gmail.com', 'https://lh3.googleusercontent.com/a/ACg8ocKzA4SDblhgT-21NF8hMzuR0gzJ7UVS_pvtTSbjx2cBu4B-AsPl=s96-c', 'google', 'May 2026', '@answarvijes', '107709455111071050004')
ON CONFLICT (email) DO NOTHING;

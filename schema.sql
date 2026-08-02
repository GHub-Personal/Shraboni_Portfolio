-- Run this query in your Supabase SQL Editor to add the youtube_url column to profile_settings table:

ALTER TABLE profile_settings ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- Full Schema Reference for profile_settings:
/*
CREATE TABLE IF NOT EXISTS profile_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  tagline TEXT,
  bio TEXT,
  avatar_url TEXT,
  contact_email TEXT,
  linkedin_url TEXT,
  instagram_url TEXT,
  youtube_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
*/

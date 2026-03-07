-- Add guest user support to food_scans table
-- This migration extends food_scans to support guest sessions

-- Make user_id nullable to allow guest scans
ALTER TABLE public.food_scans ALTER COLUMN user_id DROP NOT NULL;

-- Add guest tracking columns
ALTER TABLE public.food_scans 
  ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS session_id UUID;

-- Create guest_sessions table for tracking temporary guest sessions
CREATE TABLE IF NOT EXISTS public.guest_sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  scan_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create insights_cache table for detailed nutrition data
CREATE TABLE IF NOT EXISTS public.insights_cache (
  scan_id UUID PRIMARY KEY REFERENCES public.food_scans(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  nutrition_data JSONB,
  analysis_metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on guest_sessions (allow read if session exists)
ALTER TABLE public.guest_sessions ENABLE ROW LEVEL SECURITY;

-- Guest sessions are readable by anyone (they're temporary, public sessions)
CREATE POLICY "Anyone can read guest sessions" ON public.guest_sessions
  FOR SELECT USING (true);

-- Enable RLS on insights_cache
ALTER TABLE public.insights_cache ENABLE ROW LEVEL SECURITY;

-- Allow reading insights for public/guest scans or own authenticated scans
CREATE POLICY "Read insights for own scans or guest scans" ON public.insights_cache
  FOR SELECT USING (
    (SELECT is_guest FROM public.food_scans WHERE id = scan_id) = true
    OR (SELECT user_id FROM public.food_scans WHERE id = scan_id) = auth.uid()
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_food_scans_is_guest ON public.food_scans(is_guest);
CREATE INDEX IF NOT EXISTS idx_food_scans_session_id ON public.food_scans(session_id);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_expires_at ON public.guest_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_insights_cache_scan_id ON public.insights_cache(scan_id);

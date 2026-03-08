-- NutriScan Database Seeding Script
-- This script initializes the database with sample data and configuration

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create Users table (Supabase auth users are in auth schema, this is for app metadata)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  health_profile JSONB DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  intolerances TEXT[] DEFAULT '{}',
  medical_conditions TEXT[] DEFAULT '{}',
  dietary_lifestyles TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Food Scans table
CREATE TABLE IF NOT EXISTS public.food_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  guest_id TEXT, -- For guest user scans
  food_name TEXT NOT NULL,
  image_url TEXT,
  nutrition_data JSONB NOT NULL,
  health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
  health_rating TEXT,
  health_insights TEXT[],
  recommendations TEXT[],
  personal_health_impacts JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Favorite Scans table
CREATE TABLE IF NOT EXISTS public.favorite_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  scan_id UUID REFERENCES public.food_scans(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, scan_id)
);

-- Create Weekly Goals table
CREATE TABLE IF NOT EXISTS public.weekly_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  week_starting DATE NOT NULL,
  calorie_goal INTEGER,
  protein_goal NUMERIC,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_starting)
);

-- Create Health History table
CREATE TABLE IF NOT EXISTS public.health_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_calories NUMERIC DEFAULT 0,
  total_protein NUMERIC DEFAULT 0,
  total_fat NUMERIC DEFAULT 0,
  total_carbs NUMERIC DEFAULT 0,
  avg_health_score NUMERIC DEFAULT 0,
  scan_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create Notification Preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  email_daily_digest BOOLEAN DEFAULT TRUE,
  email_weekly_summary BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  notify_allergen_detected BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_food_scans_user_id ON public.food_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_food_scans_created_at ON public.food_scans(created_at);
CREATE INDEX IF NOT EXISTS idx_favorite_scans_user_id ON public.favorite_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_goals_user_id ON public.weekly_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_health_history_user_id ON public.health_history(user_id);
CREATE INDEX IF NOT EXISTS idx_health_history_date ON public.health_history(date);

-- Create Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Users can view their own scans
CREATE POLICY "Users can view their own scans" ON public.food_scans
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own scans
CREATE POLICY "Users can insert their own scans" ON public.food_scans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own favorites
CREATE POLICY "Users can view their own favorites" ON public.favorite_scans
  FOR SELECT USING (auth.uid() = user_id);

-- Users can manage their own favorites
CREATE POLICY "Users can manage their own favorites" ON public.favorite_scans
  FOR DELETE USING (auth.uid() = user_id);

-- Users can view their own goals
CREATE POLICY "Users can view their own goals" ON public.weekly_goals
  FOR SELECT USING (auth.uid() = user_id);

-- Users can manage their own goals
CREATE POLICY "Users can manage their own goals" ON public.weekly_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own health history
CREATE POLICY "Users can view their own health history" ON public.health_history
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view their own notification preferences
CREATE POLICY "Users can view their own notification preferences" ON public.notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

-- Users can manage their own notification preferences
CREATE POLICY "Users can manage their own notification preferences" ON public.notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Sample healthy food scans for testing
INSERT INTO public.food_scans (user_id, guest_id, food_name, nutrition_data, health_score, health_rating, health_insights, recommendations, created_at)
SELECT 
  NULL,
  'sample-guest-1',
  'Grilled Chicken Breast with Quinoa',
  '{"calories": 350, "protein": 45, "total_fat": 8, "saturated_fat": 2, "total_carbohydrates": 35, "dietary_fiber": 6, "total_sugars": 2}'::jsonb,
  85,
  'Excellent',
  ARRAY['High in lean protein', 'Good source of fiber', 'Low in saturated fat'],
  ARRAY['Pair with vegetables', 'Consider whole grain sides'],
  NOW() - INTERVAL '2 days'
ON CONFLICT DO NOTHING;

INSERT INTO public.food_scans (user_id, guest_id, food_name, nutrition_data, health_score, health_rating, health_insights, recommendations, created_at)
SELECT 
  NULL,
  'sample-guest-1',
  'Greek Yogurt with Berries',
  '{"calories": 200, "protein": 15, "total_fat": 5, "saturated_fat": 3, "total_carbohydrates": 25, "dietary_fiber": 3, "total_sugars": 15}'::jsonb,
  78,
  'Good',
  ARRAY['Excellent source of probiotics', 'Rich in calcium', 'Moderate natural sugars'],
  ARRAY['Add nuts for healthy fats', 'Enjoy as breakfast or snack'],
  NOW() - INTERVAL '1 day'
ON CONFLICT DO NOTHING;

INSERT INTO public.food_scans (user_id, guest_id, food_name, nutrition_data, health_score, health_rating, health_insights, recommendations, created_at)
SELECT 
  NULL,
  'sample-guest-1',
  'Mixed Green Salad with Olive Oil',
  '{"calories": 180, "protein": 8, "total_fat": 12, "saturated_fat": 2, "total_carbohydrates": 12, "dietary_fiber": 4, "total_sugars": 3}'::jsonb,
  92,
  'Excellent',
  ARRAY['Rich in antioxidants', 'Low calorie', 'Great source of fiber'],
  ARRAY['Add lean protein for complete meal', 'Use variety of colorful vegetables'],
  NOW()
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.food_scans TO authenticated;
GRANT ALL ON public.favorite_scans TO authenticated;
GRANT ALL ON public.weekly_goals TO authenticated;
GRANT ALL ON public.health_history TO authenticated;
GRANT ALL ON public.notification_preferences TO authenticated;

-- Grant anonymous/guest access to specific tables (for guest scans)
GRANT SELECT ON public.food_scans TO anon;
GRANT INSERT ON public.food_scans TO anon;

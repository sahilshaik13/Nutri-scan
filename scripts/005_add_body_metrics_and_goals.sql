-- Migration: Add body metrics (BMI) and health goals to health_profiles
-- Step 1 data: height, weight, biological_sex, bmi, bmi_category
-- Step 6 data: health_goals

ALTER TABLE public.health_profiles
ADD COLUMN IF NOT EXISTS height NUMERIC,
ADD COLUMN IF NOT EXISTS weight NUMERIC,
ADD COLUMN IF NOT EXISTS biological_sex TEXT,
ADD COLUMN IF NOT EXISTS bmi NUMERIC,
ADD COLUMN IF NOT EXISTS bmi_category TEXT,
ADD COLUMN IF NOT EXISTS health_goals TEXT[] DEFAULT '{}';

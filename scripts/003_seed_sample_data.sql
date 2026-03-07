-- Seed sample guest sessions and food scans for testing
-- This script populates the database with realistic demo data

-- Create sample guest sessions
INSERT INTO public.guest_sessions (session_id, created_at, last_accessed, scan_count, expires_at, metadata)
VALUES 
  (
    gen_random_uuid(),
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '1 hour',
    2,
    NOW() + INTERVAL '22 hours',
    '{"device": "mobile", "location": "kitchen"}'::jsonb
  ),
  (
    gen_random_uuid(),
    NOW() - INTERVAL '12 hours',
    NOW() - INTERVAL '8 hours',
    1,
    NOW() + INTERVAL '12 hours',
    '{"device": "tablet", "location": "office"}'::jsonb
  )
ON CONFLICT DO NOTHING;

-- Create sample guest food scans (without user_id)
INSERT INTO public.food_scans (
  id, user_id, is_guest, session_id, food_name, image_url, 
  ingredients, nutrition_data, health_score, health_rating, 
  questions_answered, created_at
)
VALUES 
  (
    gen_random_uuid(),
    NULL,
    true,
    (SELECT session_id FROM public.guest_sessions LIMIT 1),
    'Grilled Chicken Breast with Broccoli',
    'https://example.com/chicken.jpg',
    '["chicken breast", "broccoli", "olive oil", "garlic", "salt"]'::jsonb,
    '{
      "calories": 280,
      "total_fat": 7,
      "protein": 45,
      "carbohydrates": 8,
      "fiber": 2,
      "sodium": 450
    }'::jsonb,
    85,
    'healthy',
    '{"portion": "6oz chicken, 1 cup broccoli"}'::jsonb,
    NOW() - INTERVAL '1 hour'
  ),
  (
    gen_random_uuid(),
    NULL,
    true,
    (SELECT session_id FROM public.guest_sessions LIMIT 1 OFFSET 1),
    'Spinach and Feta Salad',
    'https://example.com/salad.jpg',
    '["spinach", "feta cheese", "cherry tomatoes", "cucumber", "olive oil", "lemon juice"]'::jsonb,
    '{
      "calories": 180,
      "total_fat": 12,
      "protein": 8,
      "carbohydrates": 12,
      "fiber": 3,
      "sodium": 320
    }'::jsonb,
    88,
    'healthy',
    '{"portion": "2 cups salad"}'::jsonb,
    NOW() - INTERVAL '8 hours'
  )
ON CONFLICT DO NOTHING;

-- Create sample insights cache entries for the guest scans
INSERT INTO public.insights_cache (scan_id, food_name, nutrition_data, analysis_metadata, created_at, updated_at)
SELECT 
  id,
  food_name,
  nutrition_data,
  '{
    "confidence": "high",
    "preparation_method": "grilled",
    "source": "photo_analysis",
    "ai_model": "gemini-2.5-flash"
  }'::jsonb,
  created_at,
  created_at
FROM public.food_scans
WHERE is_guest = true
ON CONFLICT (scan_id) DO NOTHING;

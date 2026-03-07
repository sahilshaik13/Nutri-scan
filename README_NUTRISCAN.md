# NutriScan - AI-Powered Food Nutrition Analysis

A complete full-stack implementation of the NutriScan workflow with AI-powered food identification, guest scanning, authenticated user profiles, and comprehensive nutrition insights.

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase project (for database and authentication)
- Google Gemini API key

### 1. Environment Setup

Add these environment variables to your `.env.local`:

```env
# Gemini API
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 2. Database Setup

Ensure all migrations are applied in order:
```bash
scripts/001_create_food_scans.sql
scripts/002_add_guest_support.sql
scripts/002_create_health_profiles.sql
scripts/003_add_onboarding_completed.sql
scripts/003_seed_sample_data.sql
scripts/004_add_profile_fields.sql
```

### 3. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Visit `http://localhost:3000` to see the application.

## Key Features

### For Guests (No Auth Required)
- **`/guest-scan`** - Try food scanning without signing up
- Capture or upload food images
- AI identifies ingredients automatically
- Answer targeted follow-up questions (optional)
- View detailed nutrition analysis
- Sign-up upsell after results

### For Authenticated Users
- **`/auth/login`** - Sign in with email/password
- **`/auth/sign-up`** - Create new account
- **`/onboarding`** - 4-step health profile setup
- **`/scan`** - Full-featured food scanning with save capability
- **`/dashboard`** - View scan history and statistics
- **`/profile`** - Manage health preferences and account
- **`/insights/[scanId]`** - Detailed nutrition breakdown for saved scans

## How It Works

### 1. Image Analysis
The app captures or uploads a food image and sends it to Google Gemini Vision API for identification.

### 2. Targeted Questions
Based on the identified food, the AI asks 1-3 targeted questions to refine the analysis:
- Portion size options (small, medium, large)
- Cooking method confirmation
- Ingredient variations (e.g., with/without oil)

### 3. Nutrition Calculation
After user answers (or if skipped), the AI calculates precise nutrition data considering:
- Identified ingredients
- User's answers
- Standard serving sizes
- Cooking methods

### 4. Personalized Insights
For authenticated users with health profiles, the system generates:
- Allergy/intolerance warnings
- Medical condition impacts (safe/caution/warning/danger)
- Health score (0-100)
- Personalized recommendations

### 5. History & Analytics
Users can:
- View complete scan history
- See trending nutrition metrics
- Export scan details
- Share results with others

## Database Schema

### Main Tables
- **food_scans** - Stores all food scan results (authenticated and guest)
- **health_profiles** - User health preferences (allergies, intolerances, conditions, lifestyle)
- **guest_sessions** - Tracks temporary guest sessions (24-hour TTL)
- **insights_cache** - Detailed analysis metadata for faster retrieval

### Key Fields
- `is_guest` - Boolean flag for guest vs authenticated scans
- `user_id` - NULL for guest scans
- `session_id` - Links guest scans to sessions
- `nutrition_data` - JSONB with all nutrition facts
- `personal_health_impacts` - Array of health condition matches

## API Endpoints

### `/api/analyze-image` (POST)
Analyzes food image and returns ingredients + follow-up questions
```json
{
  "image_base64": "...",
  "mime_type": "image/jpeg",
  "health_profile": {...}
}
```

### `/api/quick-analyze` (POST)
Provides complete nutrition analysis without questions
```json
{
  "image_base64": "...",
  "mime_type": "image/jpeg",
  "health_profile": {...}
}
```

### `/api/calculate-nutrition` (POST)
Refines nutrition based on user answers
```json
{
  "food_name": "...",
  "initial_ingredients": [...],
  "answers": {...},
  "health_profile": {...}
}
```

## Component Architecture

### Pages
- `/` - Marketing landing page
- `/guest-scan` - Guest scanning flow
- `/auth/*` - Authentication pages
- `/onboarding` - Health profile setup
- `/dashboard` - User home with scan history
- `/scan` - Full scanning workflow
- `/profile` - Profile management
- `/insights/[scanId]` - Detailed scan insights

### Components
- `AnalysisQuestions` - Interactive question component
- `CameraCapture` - Camera input for food photos
- `ImageUpload` - Image file upload
- `NutritionResults` - Results display for scans
- `DashboardContent` - Main dashboard layout
- `AppLoading` - Splash screen animation

## Styling

The app uses:
- **Tailwind CSS v4** for utility-first styling
- **shadcn/ui** for pre-built components
- **Dark mode** as default with light mode support
- **Design tokens** for consistent theming

## Performance Optimizations

1. **AI-Driven**: Minimal required questions (1-3) vs traditional multi-step forms
2. **Image Optimization**: Base64 encoding for efficient transmission
3. **Caching**: Insights cache table for frequently viewed scans
4. **Database Indexes**: Fast queries on user_id, session_id, created_at
5. **Progressive Loading**: Results shown as data arrives
6. **Mobile-First**: Responsive design optimized for phones

## Security

- **Authentication**: Supabase Auth with email verification
- **Row-Level Security**: Users can only access their own data
- **Password Security**: Encrypted passwords with bcrypt
- **Guest Sessions**: Temporary 24-hour sessions auto-expire
- **API Keys**: Environment variables for sensitive credentials

## Troubleshooting

### Gemini API Errors
- Ensure API key is set correctly: `GOOGLE_GEMINI_API_KEY` or `GEMINI_API_KEY`
- Check if Gemini Vision API is enabled in Google Cloud Console
- Verify image is valid JPEG/PNG format

### Database Connection Issues
- Verify Supabase URL and anon key in `.env.local`
- Check if migrations have been applied
- Ensure RLS policies are enabled

### Auth Issues
- Verify email verification is configured in Supabase
- Check NEXT_PUBLIC_SUPABASE_REDIRECT_URL for email callback

## Next Steps

1. Deploy to Vercel:
   ```bash
   vercel deploy
   ```

2. Set environment variables in Vercel project settings

3. Enable email verification in Supabase

4. Test end-to-end workflow:
   - Try guest scan
   - Create account and login
   - Complete onboarding
   - Scan food and save
   - View insights

## License

This project is part of the NutriScan application.

## Support

For issues or questions, refer to:
- `/IMPLEMENTATION.md` - Technical details
- Vercel documentation
- Supabase documentation
- Google Gemini API documentation

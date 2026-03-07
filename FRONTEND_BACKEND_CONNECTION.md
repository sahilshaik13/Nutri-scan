# Frontend & Backend Connection Guide

## Architecture Overview

The NutriScan project uses a **multi-service architecture** with Vercel's experimental services:

```
User Browser
     ↓
┌─────────────────────────┐
│  Frontend (Next.js)     │ → Handles routes at `/`
│  - UI Components        │ → API routes at `/api/analyze-image`, etc.
│  - Pages & Navigation   │
│  - Supabase Auth        │
└─────────────────────────┘
     ↓
┌─────────────────────────┐
│  Backend (FastAPI)      │ → Handles routes at `/api/*` (if implemented)
│  - Business Logic       │
│  - Database Operations  │
└─────────────────────────┘
     ↓
┌─────────────────────────┐
│  External Services      │
│  - Supabase (Database)  │
│  - Gemini API (AI)      │
│  - Google Cloud         │
└─────────────────────────┘
```

## Service Configuration

### vercel.json - Multi-Service Setup

```json
{
  "experimentalServices": {
    "frontend": {
      "entrypoint": ".",
      "routePrefix": "/"
    },
    "backend": {
      "entrypoint": "backend/main.py",
      "routePrefix": "/api"
    }
  }
}
```

**What this means:**
- `frontend` (Next.js) serves all routes at `/` by default
- `backend` (FastAPI) serves additional routes at `/api`
- Both services run independently but are managed by Vercel

## How Frontend & Backend Connect

### Current Setup (Development & Production)

**For Gemini API calls:**
- ✅ Frontend has Next.js API routes: `/api/analyze-image`, `/api/quick-analyze`, `/api/calculate-nutrition`
- ✅ These routes call Google Gemini API directly
- ✅ Routes are served by the Next.js frontend service

**For Supabase database:**
- ✅ Frontend uses Supabase client to connect directly
- ✅ No backend API calls needed for database operations
- ✅ Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Available API Routes

#### 1. Analyze Image (`POST /api/analyze-image`)
```typescript
// Request
{
  image_base64: string,
  mime_type: string,
  health_profile: {
    allergies?: string[],
    intolerances?: string[],
    medical_conditions?: string[],
    dietary_lifestyles?: string[]
  }
}

// Response
{
  food_name: string,
  ingredients: string[],
  serving_size: string,
  confidence: "high" | "medium" | "low",
  is_labeled_product?: boolean,
  questions: Question[]
}
```

#### 2. Quick Analyze (`POST /api/quick-analyze`)
Analyzes food without returning questions for fast results.

#### 3. Calculate Nutrition (`POST /api/calculate-nutrition`)
Refines nutrition data based on user-provided answers to questions.

## Local Development

### Start Both Services

```bash
# Install dependencies
npm install

# Start development server with both services
npm run dev
```

This automatically starts:
- Frontend at `http://localhost:3000`
- Backend at `http://localhost:8000` (if backend/main.py exists)

### Environment Variables (.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# Gemini AI
GOOGLE_GEMINI_API_KEY=your_key

# Backend URL (for local development)
BACKEND_URL=http://localhost:8000
```

## Production Deployment

### Vercel Deployment

1. **Automatic Configuration**
   - Vercel reads `vercel.json`
   - Deploys Next.js frontend and FastAPI backend as separate services
   - Automatically sets up routing

2. **Environment Variables**
   - Set in Vercel project settings
   - Variables are injected into both services
   - `NEXT_PUBLIC_*` variables are exposed to the browser

3. **Service URLs**
   - Frontend: `https://your-project.vercel.app/`
   - Backend: `https://your-project.vercel.app/api/*`

## Troubleshooting

### "Frontend and backend on different ports"

**Issue:** Requests from frontend fail because backend is on different port.

**Solutions:**

1. **For Next.js API Routes** (Current Setup)
   - Already served by frontend
   - No cross-origin issues
   - Just ensure environment variables are set

2. **For External Backend Services**
   - Configure CORS on backend
   - Use `next.config.mjs` rewrites (if needed):
   ```typescript
   async rewrites() {
     return [{
       source: '/api/:path*',
       destination: `${process.env.BACKEND_URL}/api/:path*`
     }]
   }
   ```

### Missing Environment Variables

```
Error: "Your project's URL and Key are required to create a Supabase client!"
```

**Solution:** Add Supabase credentials to `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### Gemini API Errors

```
Error: "Gemini API key not configured"
```

**Solution:** Set Gemini API key:
```bash
GOOGLE_GEMINI_API_KEY=your_key
# or
GEMINI_API_KEY=your_key
```

## File Structure

```
/
├── app/
│   ├── api/
│   │   ├── analyze-image/route.ts     # Gemini image analysis
│   │   ├── quick-analyze/route.ts     # Quick nutrition analysis
│   │   └── calculate-nutrition/route.ts
│   ├── page.tsx                        # Landing page
│   ├── guest-scan/page.tsx            # Guest scan flow
│   ├── scan/page.tsx                  # Authenticated scan
│   ├── insights/[scanId]/page.tsx     # Detailed insights
│   ├── dashboard/page.tsx             # User dashboard
│   ├── profile/page.tsx               # User profile
│   ├── onboarding/page.tsx            # Health profile setup
│   └── auth/                          # Authentication pages
├── lib/
│   ├── supabase/                      # Supabase client & middleware
│   └── api/                           # API client utilities
├── components/                         # React components
├── next.config.mjs                    # Next.js configuration
├── vercel.json                        # Multi-service configuration
└── .env.example                       # Environment variable template
```

## Next Steps

1. **Set Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Fill in actual values

2. **Start Development**
   ```bash
   npm run dev
   ```

3. **Test API Routes**
   ```bash
   curl -X POST http://localhost:3000/api/analyze-image \
     -H "Content-Type: application/json" \
     -d '{"image_base64":"...", "mime_type":"image/jpeg"}'
   ```

4. **Deploy to Vercel**
   - Push to GitHub
   - Connect to Vercel
   - Services automatically deploy together

---

**For more details, see:**
- `IMPLEMENTATION.md` - Technical architecture
- `API_REFERENCE.md` - Complete API documentation
- `DEPLOYMENT.md` - Deployment instructions

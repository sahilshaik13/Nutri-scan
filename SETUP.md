# NutriScan Setup Guide

## Overview

This document covers the setup, configuration, and deployment of the NutriScan application with separated frontend and backend services.

## Architecture

NutriScan uses a multi-service architecture:

- **Frontend**: Next.js 16+ running on **port 3000**
  - React UI for food scanning and nutrition tracking
  - Communicates with backend via HTTP requests
  
- **Backend**: FastAPI (Python) running on **port 8000**
  - Handles food image analysis with Google Gemini Vision API
  - Manages guest sessions and nutrition calculations
  - Provides REST API endpoints for all food analysis operations

- **Database**: Supabase PostgreSQL for data persistence
- **AI Service**: Google Gemini API for food image analysis

**Why Separate Services?**
- Frontend and backend can be developed independently
- Backend can be scaled separately from frontend
- Easy to deploy to different servers/services (Vercel for frontend, any server for backend)
- Clear separation of concerns

## Development Setup

### Prerequisites

- Node.js 18+ (for Next.js frontend)
- Python 3.9+ (for FastAPI backend)
- Supabase account and project
- Google Gemini API keys (1-4 for failover)

### 1. Environment Configuration

Create a `.env.local` file in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API URL (development)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Gemini API Configuration (multiple keys for failover)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_primary
GEMINI_API_KEY_1=your_gemini_api_key_1
GEMINI_API_KEY_2=your_gemini_api_key_2
GEMINI_API_KEY_3=your_gemini_api_key_3
GEMINI_API_KEY_4=your_gemini_api_key_4
```

### 2. Frontend Setup (Next.js on port 3000)

#### Install Frontend Dependencies

```bash
npm install
# or
pnpm install
```

#### Run Frontend Development Server

```bash
npm run dev
# or
pnpm dev
```

Frontend will be available at `http://localhost:3000`

### 3. Backend Setup (FastAPI on port 8000)

#### Install Backend Dependencies

```bash
cd backend
pip install fastapi uvicorn httpx python-dotenv
```

#### Run Backend Server

```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend will be available at `http://localhost:8000`

**Available Backend API Endpoints:**
- `POST /analyze-image` - Initial food image analysis with Gemini Vision
- `POST /quick-analyze` - Quick nutrition analysis from image  
- `POST /calculate-nutrition` - Refined nutrition based on user answers
- `POST /guest/session` - Create a new guest session (UUID-based)
- `GET /guest/session/{guest_id}` - Retrieve guest session data
- `POST /guest/session/{guest_id}/scan` - Save scan to guest session
- `GET /health` - Health check endpoint

### 4. Database Setup (Supabase)

#### Apply Schema and Seeding

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Create a new query and copy the contents of `scripts/seed-database.sql`
4. Execute the script to:
   - Create necessary tables (users, food_scans, favorites, goals, health_history)
   - Set up Row Level Security (RLS) policies
   - Create indexes for performance
   - Insert sample data for testing

#### Tables Created

- **users** - User profiles with health information
- **food_scans** - Records of scanned foods and their nutrition
- **favorite_scans** - User's favorite food items
- **weekly_goals** - Calorie and nutrition goals
- **health_history** - Daily aggregated nutrition data
- **notification_preferences** - User notification settings

#### Row Level Security (RLS)

All tables have RLS enabled. Policies ensure:
- Users can only see their own data
- Guest users (with guest_id) can insert scans
- Anonymous users have read/insert access to food_scans table

## Guest User Support

Guest users can scan food without creating an account:

### How It Works

1. Guest visits `/guest-scan` page
2. `useGuestSession` hook creates or retrieves a guest session
3. Guest ID is stored in localStorage
4. Scans are saved to the backend in-memory store or database
5. If guest signs up later, scans can be migrated to their account

### Guest Session Hook

Located at `hooks/use-guest-session.ts`, provides:

```typescript
const {
  guestId,           // Unique guest identifier
  isLoading,         // Session initialization loading state
  scans,             // Guest's scans
  getScans,          // Retrieve guest scans
  saveToGuestSession,// Save a new scan
  clearGuestSession, // Clear on login
} = useGuestSession()
```

### Backend Guest Endpoints

```javascript
// Create new guest session
POST /api/guest/session
Response: { guest_id: "uuid" }

// Retrieve guest session
GET /api/guest/session/{guest_id}
Response: { id, scans: [...], created_at }

// Save scan to guest session
POST /api/guest/session/{guest_id}/scan
Body: { food_name, nutrition_data, created_at }
Response: { success: true, scan_count }
```

## Production Deployment (Vercel)

### Configuration

The `vercel.json` file configures multi-service deployment:

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

This automatically:
- Deploys the Next.js frontend on port 3000
- Deploys the Python backend on port 10000
- Routes `/api/*` requests to the backend
- Handles CORS and request forwarding

### Environment Variables

Set these in your Vercel project settings (Settings > Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_API_URL=https://your-domain.com
GEMINI_API_KEY_1
GEMINI_API_KEY_2
GEMINI_API_KEY_3
GEMINI_API_KEY_4
```

In production, `NEXT_PUBLIC_API_URL` should point to your Vercel domain to ensure proper request routing.

## API Key Management

### Gemini API Keys

The backend supports up to 4 API keys for:
- **Automatic failover** - If one key hits rate limits, the next key is used
- **Load distribution** - Spreads requests across multiple keys
- **Quota management** - Monitor key status with `/api/test-keys`

### Key Rotation Logic

```
For each request:
  Loop through all configured keys (GEMINI_API_KEY_1 to GEMINI_API_KEY_4)
    Try request with current key (max 2 retries)
    If 429 (Rate Limit): Move to next key
    If Success: Return response
    If Error: Try retry for current key
  If all keys exhausted: Return 429 error
```

## Debugging

### Common Issues

#### Port Already in Use (10000)

```bash
# Find process using port 10000
lsof -i :10000

# Kill the process
kill -9 <PID>
```

#### API Connection Failed

1. Verify backend is running: `curl http://localhost:10000/api/ping`
2. Check `NEXT_PUBLIC_API_URL` environment variable
3. Ensure CORS headers are properly configured in backend

#### Gemini API Errors

- Check API keys in `.env.local`
- Run `/api/test-keys` to validate all keys
- Monitor quota usage in Google Cloud Console

#### Database Connection Issues

- Verify Supabase credentials
- Check Row Level Security policies
- Ensure database tables are created (run seed script)

### Performance Tips

1. **Use guest sessions** - Reduces sign-up friction
2. **Cache API responses** - 1-minute TTL for nutrition data
3. **Optimize images** - Compress before uploading to backend
4. **Monitor backend logs** - Check for slow queries or API rate limits

## Testing

### Health Checks

```bash
# Frontend health
curl http://localhost:3000

# Backend health
curl http://localhost:10000/api/health

# Backend ping (lightweight)
curl http://localhost:10000/api/ping

# Test API keys
curl http://localhost:10000/api/test-keys
```

### Guest Session Flow

1. Visit `http://localhost:3000/guest-scan`
2. Take a photo or upload image
3. Verify API calls to `http://localhost:10000/api/analyze-image`
4. Verify guest session created: Check localStorage for `nutriscan_guest_id`
5. Verify scans saved: Check backend logs

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Google Gemini API](https://ai.google.dev)
- [Vercel Multi-Service Deployment](https://vercel.com/docs/edge-config/experimental-services)

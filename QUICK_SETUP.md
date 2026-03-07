# Quick Connection Reference

## The Problem
Frontend and backend are on different ports/services and need to communicate.

## The Solution
Multi-service architecture with automatic routing:

```
vercel.json configures two services:
┌──────────────────────────────┐
│ Frontend (Next.js at /)      │
│ - Serves all pages           │
│ - Handles /api/* routes      │ ← These API routes exist in /app/api
│ - Connects to Supabase       │
└──────────────────────────────┘
         ↓
┌──────────────────────────────┐
│ Backend (FastAPI at /api)    │
│ - (Optional, if backend/main.py exists)
└──────────────────────────────┘
```

## How It Works

### Development (npm run dev)
```
Browser requests http://localhost:3000/api/analyze-image
         ↓
Next.js frontend receives request at its API route
         ↓
/app/api/analyze-image/route.ts processes it
         ↓
Returns JSON response
```

### Production (Deployed to Vercel)
```
Browser requests https://your-app.vercel.app/api/analyze-image
         ↓
Vercel routes to frontend service (next.js)
         ↓
Frontend's /app/api/analyze-image/route.ts processes it
         ↓
Returns JSON response
```

## Key Points

1. **No Cross-Origin Issues** ✓
   - API routes are part of the frontend
   - Same domain as the UI
   - No CORS needed

2. **Automatic in Vercel** ✓
   - Just push to GitHub
   - Vercel reads vercel.json
   - Services deploy automatically together

3. **Local Development** ✓
   - `npm run dev` starts both services
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000 (if exists)
   - API routes work at http://localhost:3000/api/*

## Configuration Files

**vercel.json** - Service routing
```json
{
  "experimentalServices": {
    "frontend": { "entrypoint": ".", "routePrefix": "/" },
    "backend": { "entrypoint": "backend/main.py", "routePrefix": "/api" }
  }
}
```

**next.config.mjs** - Frontend configuration
```javascript
// No rewrites needed - API routes are part of this service
```

**.env.local** - Local credentials
```bash
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
GOOGLE_GEMINI_API_KEY=your_key
```

## API Routes (Already Implemented)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/analyze-image` | POST | Analyze food image with Gemini |
| `/api/quick-analyze` | POST | Quick nutrition without questions |
| `/api/calculate-nutrition` | POST | Refine with user answers |

All routes call Google Gemini API directly from the server.

## Testing the Connection

### Test 1: Check Frontend is Running
```bash
curl http://localhost:3000
# Should return HTML of landing page
```

### Test 2: Test API Route
```bash
curl -X POST http://localhost:3000/api/analyze-image \
  -H "Content-Type: application/json" \
  -d '{"image_base64":"test"}'
# Should return Gemini API response or validation error
```

### Test 3: Check Environment Variables
```bash
# In browser console (on any page):
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
// Should show URL (it's public)
```

## Deployment Checklist

- [ ] Environment variables set in Vercel project settings
- [ ] vercel.json has correct service configuration
- [ ] GitHub repository connected to Vercel
- [ ] .env.example file documents all variables
- [ ] API routes in /app/api are working locally
- [ ] Push to main branch to auto-deploy

## Need More Details?

- **Full Architecture:** See [FRONTEND_BACKEND_CONNECTION.md](./FRONTEND_BACKEND_CONNECTION.md)
- **API Documentation:** See [API_REFERENCE.md](./API_REFERENCE.md)
- **Deployment Steps:** See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Implementation Details:** See [IMPLEMENTATION.md](./IMPLEMENTATION.md)

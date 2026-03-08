# Environment Configuration Guide

## Overview

NutriScan automatically detects the environment (development vs. production) and connects to the appropriate backend URL.

## Environment Detection

The application uses `lib/api-client.ts` to automatically determine which backend to use:

### Development Environment
- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:8000` (local FastAPI)
- **Trigger**: Running on `localhost` or `127.0.0.1` in development mode

### Production Environment
- **Frontend**: Vercel deployment (e.g., `nutri-scan.vercel.app`)
- **Backend**: `https://nutri-scan-fvyo.onrender.com` (Render hosted API)
- **Trigger**: Deployed to Vercel or non-localhost domain in production mode

## Configuration

### Development Setup

No special configuration needed. The app automatically uses:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run both services:
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Production Setup (Vercel)

The production backend URL is automatically used when deployed:
```env
NEXT_PUBLIC_PRODUCTION_API_URL=https://nutri-scan-fvyo.onrender.com
```

**To override in Vercel**, add environment variable in project settings:
- Key: `NEXT_PUBLIC_PRODUCTION_API_URL`
- Value: `https://nutri-scan-fvyo.onrender.com`

## How It Works

The `getApiUrl()` function in `lib/api-client.ts` checks:

1. **Server-side (SSR)**: Uses `NEXT_PUBLIC_PRODUCTION_API_URL` to avoid exposing localhost
2. **Client-side Development**: Detects `localhost`/`127.0.0.1` → uses development backend
3. **Client-side Production**: Detects deployed domain → uses production backend

## Testing Environment Detection

Add this to any page to see which backend URL is being used:

```typescript
import { getApiUrl } from '@/lib/api-client'

export default function DebugPage() {
  return <div>API URL: {getApiUrl()}</div>
}
```

## Backend Hosted on Render

The backend is hosted on Render at:
- **URL**: `https://nutri-scan-fvyo.onrender.com`
- **Status**: https://nutri-scan-fvyo.onrender.com/health
- **Type**: FastAPI application

When deploying the frontend to Vercel, ensure `NEXT_PUBLIC_PRODUCTION_API_URL` is set in project environment variables.

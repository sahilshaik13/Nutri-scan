/**
 * API Client utility for determining backend URL based on environment
 * - Development: Uses localhost:8000 or NEXT_PUBLIC_API_URL
 * - Production: Uses https://nutri-scan-fvyo.onrender.com or NEXT_PUBLIC_PRODUCTION_API_URL
 */

export function getApiUrl(): string {
  // Avoid running on server during SSR
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_PRODUCTION_API_URL || 'https://nutri-scan-fvyo.onrender.com'
  }

  // Check if we're in production (Vercel deployment)
  const isProduction = process.env.NODE_ENV === 'production' && 
    !window.location.hostname.includes('localhost') &&
    !window.location.hostname.includes('127.0.0.1')

  if (isProduction) {
    // Use production backend on Render
    return process.env.NEXT_PUBLIC_PRODUCTION_API_URL || 'https://nutri-scan-fvyo.onrender.com'
  }

  // Use development backend (localhost:8000)
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
}

/**
 * Fetch wrapper that automatically uses the correct API URL
 */
export async function apiCall(
  endpoint: string,
  options?: RequestInit
): Promise<Response> {
  const apiUrl = getApiUrl()
  const url = `${apiUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  
  console.log('[v0] API Call:', {
    endpoint,
    url,
    environment: getApiUrl() === 'https://nutri-scan-fvyo.onrender.com' ? 'production' : 'development'
  })
  
  return fetch(url, options)
}

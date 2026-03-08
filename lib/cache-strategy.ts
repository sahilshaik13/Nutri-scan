/**
 * Cache strategy configuration for optimized performance
 * Defines how different resources should be cached
 */

export const cacheStrategy = {
  // API cache: 1 minute for food scan data
  api: {
    duration: 60,
    revalidate: true,
  },
  
  // Page cache: 1 hour for user pages
  pages: {
    duration: 3600,
    revalidate: false,
  },
  
  // Image cache: 1 week for static images
  images: {
    duration: 604800,
    revalidate: false,
  },
  
  // Font cache: 1 month for web fonts
  fonts: {
    duration: 2592000,
    revalidate: false,
  },
  
  // User data cache: 5 minutes for dashboard data
  userData: {
    duration: 300,
    revalidate: true,
  },
}

/**
 * Get cache duration in seconds
 */
export function getCacheDuration(type: keyof typeof cacheStrategy): number {
  return cacheStrategy[type].duration
}

/**
 * Check if cache should be revalidated
 */
export function shouldRevalidate(type: keyof typeof cacheStrategy): boolean {
  return cacheStrategy[type].revalidate
}

/**
 * Format cache headers for responses
 */
export function getCacheHeaders(type: keyof typeof cacheStrategy) {
  const strategy = cacheStrategy[type]
  const maxAge = strategy.duration
  const revalidate = strategy.revalidate ? 'must-revalidate' : 'immutable'
  
  return {
    'Cache-Control': `public, max-age=${maxAge}, ${revalidate}`,
    'CDN-Cache-Control': `max-age=${maxAge}`,
  }
}

/**
 * SWR (Stale While Revalidate) configuration
 */
export const swrConfig = {
  // Revalidate data every 1 minute in the background
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  revalidateInterval: 60000,
  dedupingInterval: 60000,
  focusThrottleInterval: 300000,
}

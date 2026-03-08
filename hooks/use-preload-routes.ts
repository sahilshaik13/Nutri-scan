'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Hook to preload routes and assets for better UX
 * Prefetches key pages when the app loads
 */
export function usePreloadRoutes() {
  const router = useRouter()

  useEffect(() => {
    // Preload critical routes with a slight delay to not block initial render
    const preloadTimer = setTimeout(() => {
      const criticalRoutes = [
        '/dashboard',
        '/scan',
        '/insights',
        '/history',
        '/profile',
      ]

      criticalRoutes.forEach((route) => {
        try {
          router.prefetch(route)
        } catch (error) {
          console.error(`[v0] Failed to prefetch ${route}:`, error)
        }
      })
    }, 2000)

    return () => clearTimeout(preloadTimer)
  }, [router])
}

/**
 * Preload images for better perceived performance
 */
export function usePreloadImages(urls: string[]) {
  useEffect(() => {
    urls.forEach((url) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = url
      document.head.appendChild(link)
    })
  }, [urls])
}

/**
 * Defer non-critical JavaScript execution
 */
export function useDeferredTask(callback: () => void, delay: number = 3000) {
  useEffect(() => {
    const timer = setTimeout(callback, delay)
    return () => clearTimeout(timer)
  }, [callback, delay])
}

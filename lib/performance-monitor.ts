/**
 * Performance monitoring utilities for tracking app performance
 */

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private isEnabled: boolean = typeof window !== 'undefined'

  /**
   * Mark the start of a performance measurement
   */
  mark(name: string): void {
    if (!this.isEnabled) return
    try {
      performance.mark(`${name}-start`)
    } catch (error) {
      console.error(`[v0] Failed to mark performance: ${name}`, error)
    }
  }

  /**
   * Measure performance between two marks
   */
  measure(name: string): number | null {
    if (!this.isEnabled) return null
    try {
      performance.measure(name, `${name}-start`)
      const measure = performance.getEntriesByName(name)[0] as PerformanceMeasure
      
      if (measure) {
        this.metrics.push({
          name,
          value: measure.duration,
          unit: 'ms',
          timestamp: Date.now(),
        })
        return measure.duration
      }
    } catch (error) {
      console.error(`[v0] Failed to measure performance: ${name}`, error)
    }
    return null
  }

  /**
   * Get Core Web Vitals
   */
  getCoreWebVitals(): Partial<PerformanceMetric> | null {
    if (!this.isEnabled) return null
    
    try {
      const paintEntries = performance.getEntriesByType('paint')
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (navigationTiming) {
        return {
          name: 'Core Web Vitals',
          value: navigationTiming.loadEventEnd - navigationTiming.loadEventStart,
          unit: 'ms',
        }
      }
    } catch (error) {
      console.error('[v0] Failed to get Core Web Vitals', error)
    }
    return null
  }

  /**
   * Get Time to First Byte (TTFB)
   */
  getTTFB(): number | null {
    if (!this.isEnabled) return null
    
    try {
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigationTiming) {
        return navigationTiming.responseStart - navigationTiming.requestStart
      }
    } catch (error) {
      console.error('[v0] Failed to get TTFB', error)
    }
    return null
  }

  /**
   * Get Largest Contentful Paint (LCP)
   */
  getLCP(): number | null {
    if (!this.isEnabled) return null
    
    try {
      const entries = performance.getEntriesByType('largest-contentful-paint')
      if (entries.length > 0) {
        const lastEntry = entries[entries.length - 1] as PerformanceEntry
        return Math.round(lastEntry.startTime)
      }
    } catch (error) {
      console.error('[v0] Failed to get LCP', error)
    }
    return null
  }

  /**
   * Get First Input Delay (FID) or Interaction to Next Paint (INP)
   */
  getInputDelay(): number | null {
    if (!this.isEnabled) return null
    
    try {
      const entries = performance.getEntriesByType('first-input')
      if (entries.length > 0) {
        const firstInput = entries[0] as PerformanceEventTiming
        return Math.round(firstInput.processingStart - firstInput.startTime)
      }
    } catch (error) {
      console.error('[v0] Failed to get Input Delay', error)
    }
    return null
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return this.metrics
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = []
    if (this.isEnabled) {
      try {
        performance.clearMarks()
        performance.clearMeasures()
      } catch (error) {
        console.error('[v0] Failed to clear performance entries', error)
      }
    }
  }

  /**
   * Log a metric value
   */
  log(name: string, value: number, unit: string = 'ms'): void {
    this.metrics.push({
      name,
      value,
      unit,
      timestamp: Date.now(),
    })
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[v0] Performance: ${name} = ${value}${unit}`)
    }
  }
}

// Export singleton instance
export const perfMonitor = new PerformanceMonitor()

/**
 * Hook for performance monitoring in React components
 */
export function usePerformanceMonitor(componentName: string) {
  return {
    mark: (label: string) => perfMonitor.mark(`${componentName}-${label}`),
    measure: (label: string) => perfMonitor.measure(`${componentName}-${label}`),
    log: (label: string, value: number, unit?: string) => 
      perfMonitor.log(`${componentName}-${label}`, value, unit),
  }
}

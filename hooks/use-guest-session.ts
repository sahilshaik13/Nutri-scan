'use client'

import { useState, useEffect } from 'react'

interface GuestScan {
  food_name: string
  nutrition_data: any
  created_at: string
}

export function useGuestSession() {
  const [guestId, setGuestId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [scans, setScans] = useState<GuestScan[]>([])
  
  // Get backend API URL from environment or use default for local development
  const getApiUrl = () => {
    if (typeof window === 'undefined') return 'https://nutri-scan-fvyo.onrender.com'
    return process.env.NEXT_PUBLIC_API_URL || 'https://nutri-scan-fvyo.onrender.com'
  }

  // Initialize guest session on mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Check if guest session already exists in localStorage
        const storedGuestId = localStorage.getItem('nutriscan_guest_id')
        
        if (storedGuestId) {
          setGuestId(storedGuestId)
          console.log('[v0] Using existing guest session:', storedGuestId)
        } else {
          // Create new guest session on FastAPI backend (port 8000)
          const apiUrl = getApiUrl()
          const response = await fetch(`${apiUrl}/guest/session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })

          if (!response.ok) {
            throw new Error('Failed to create guest session')
          }

          const data = await response.json()
          const newGuestId = data.guest_id
          
          localStorage.setItem('nutriscan_guest_id', newGuestId)
          setGuestId(newGuestId)
          console.log('[v0] Created new guest session:', newGuestId)
        }
      } catch (error) {
        console.error('[v0] Error initializing guest session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeSession()
  }, [])

  // Retrieve guest session scans
  const getScans = async () => {
    if (!guestId) return

    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/guest/session/${guestId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        const data = await response.json()
        setScans(data.scans || [])
        console.log('[v0] Retrieved guest scans:', data.scans?.length || 0)
      }
    } catch (error) {
      console.error('[v0] Error retrieving guest scans:', error)
    }
  }

  // Save scan to guest session
  const saveToGuestSession = async (scan: GuestScan) => {
    if (!guestId) {
      console.warn('[v0] No guest ID available to save scan')
      return false
    }

    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/guest/session/${guestId}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scan),
      })

      if (!response.ok) {
        throw new Error('Failed to save scan to guest session')
      }

      const data = await response.json()
      console.log('[v0] Saved scan to guest session')
      
      // Update local scans state
      setScans([...scans, scan])
      return true
    } catch (error) {
      console.error('[v0] Error saving scan to guest session:', error)
      return false
    }
  }

  // Clear guest session (called when user logs in)
  const clearGuestSession = () => {
    localStorage.removeItem('nutriscan_guest_id')
    setGuestId(null)
    setScans([])
    console.log('[v0] Cleared guest session')
  }

  return {
    guestId,
    isLoading,
    scans,
    getScans,
    saveToGuestSession,
    clearGuestSession,
  }
}

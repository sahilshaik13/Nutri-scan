import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'

// In-memory store for guest sessions (replace with database in production)
const GUEST_SESSIONS: Record<string, any> = {}

export async function POST(req: NextRequest) {
  try {
    const guestId = uuid()
    GUEST_SESSIONS[guestId] = {
      id: guestId,
      scans: [],
      created_at: new Date().toISOString(),
    }
    
    console.log('[v0] Created guest session:', guestId)
    return NextResponse.json({ guest_id: guestId })
  } catch (error) {
    console.error('[v0] Error creating guest session:', error)
    return NextResponse.json(
      { error: 'Failed to create guest session' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const guestId = searchParams.get('id')
    
    if (!guestId || !GUEST_SESSIONS[guestId]) {
      return NextResponse.json(
        { error: 'Guest session not found' },
        { status: 404 }
      )
    }
    
    console.log('[v0] Retrieved guest session:', guestId)
    return NextResponse.json(GUEST_SESSIONS[guestId])
  } catch (error) {
    console.error('[v0] Error retrieving guest session:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve guest session' },
      { status: 500 }
    )
  }
}

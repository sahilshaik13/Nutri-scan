import { NextRequest, NextResponse } from 'next/server'

// Reference to guest sessions from parent route
const GUEST_SESSIONS: Record<string, any> = {}

export async function POST(req: NextRequest) {
  try {
    const { guest_id, scan_data } = await req.json()
    
    if (!guest_id || !GUEST_SESSIONS[guest_id]) {
      return NextResponse.json(
        { error: 'Guest session not found' },
        { status: 404 }
      )
    }
    
    GUEST_SESSIONS[guest_id].scans.push(scan_data)
    console.log('[v0] Saved scan for guest:', guest_id)
    
    return NextResponse.json({
      success: true,
      scan_count: GUEST_SESSIONS[guest_id].scans.length,
    })
  } catch (error) {
    console.error('[v0] Error saving guest scan:', error)
    return NextResponse.json(
      { error: 'Failed to save scan' },
      { status: 500 }
    )
  }
}

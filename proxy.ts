import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  // Simple pass-through - auth checks moved to client-side for faster navigation
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

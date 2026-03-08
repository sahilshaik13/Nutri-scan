'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Camera, Clock, BarChart3, User } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Home',     icon: Home },
  { href: '/history',   label: 'History',  icon: Clock },
  { href: '/scan',      label: 'Scan',     icon: Camera, fab: true },
  { href: '/insights',  label: 'Insights', icon: BarChart3 },
  { href: '/profile',   label: 'Profile',  icon: User },
]

export function BottomNavigation() {
  const pathname = usePathname()

  const hiddenPaths = ['/auth', '/onboarding', '/guest-scan']
  const isLandingPage = pathname === '/'
  const isHiddenPath = hiddenPaths.some(p => pathname.startsWith(p))

  if (isLandingPage || isHiddenPath) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-4 pb-4">
      <nav
        className="flex items-center gap-1 rounded-2xl px-2 py-2"
        style={{
          background: '#eaf0eb',
          boxShadow: '8px 8px 20px #c4ccc5, -8px -8px 20px #ffffff',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          if (item.fab) {
            /* ── Centre FAB (Scan) ── */
            return (
              <Link
                key={item.href}
                href={item.href}
                className="mx-1 flex h-12 w-12 flex-col items-center justify-center rounded-xl transition-all duration-200 hover:scale-110 active:scale-90"
                style={{
                  background: 'linear-gradient(135deg, #3ecf66 0%, #2bb554 100%)',
                  boxShadow: isActive
                    ? 'inset 3px 3px 7px rgba(0,0,0,0.15), inset -2px -2px 5px rgba(255,255,255,0.2)'
                    : '4px 4px 10px #becea5, -3px -3px 8px #ffffff',
                }}
              >
                <Icon className="h-5 w-5 text-white" strokeWidth={2.5} />
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 rounded-xl px-3.5 py-2 transition-all duration-200 hover:scale-105 active:scale-95"
              style={
                isActive
                  ? {
                      boxShadow: 'inset 3px 3px 7px #c0c8c1, inset -3px -3px 7px #f4faf5',
                      background: '#eaf0eb',
                    }
                  : { background: 'transparent' }
              }
            >
              <Icon
                className="h-5 w-5 transition-colors duration-200"
                style={{ color: isActive ? '#3ecf66' : '#6b7e6d' }}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className="text-[9px] font-bold uppercase tracking-wide transition-colors duration-200"
                style={{ color: isActive ? '#3ecf66' : '#6b7e6d' }}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
